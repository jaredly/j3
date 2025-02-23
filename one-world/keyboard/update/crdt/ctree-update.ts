import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import { fromRec, ListKind, Node, NodeID, Nodes, RecNodeT } from '../../../shared/cnodes';
import { isTag, selectStart } from '../../handleNav';
import { SelStart } from '../../handleShiftNav';
import { KeyAction, KeyWhat } from '../../keyActionToUpdate';
import { Cursor, lastChild, move, NodeSelection, parentLoc, parentPath, PartialSel, Path, pathWithChildren, selStart, SelUpdate } from '../../utils';
import { LRW } from './crdt';
import { CId, CList, CNode, CTree, insert, insertArray, Op, ParentOp, replaceChild } from './ctree';

export type CTop = {
    tree: CTree;
    ts: () => string;
};

export type Up = Op | SelUpdate;

export const justOps = (ups: Up[]): Op[] => ups.filter((up) => !('type' in up)) as Op[];

export const ctreeUpdate = (top: CTop, action: KeyAction, sel: NodeSelection): Up[] | null => {
    switch (action.type) {
        case 'move':
            return [action.end ? move({ end: action.end, start: action.sel }) : move({ start: action.sel })];
        case 'sel-expand':
            return [move({ start: sel.start, end: action.sel })];
        case 'set-id-text':
            return setIdText(top, action.path, action.text, action.end, action.ccls);
        case 'wrap':
            return wrapUpdate(top, action.path, action.min, action.max, action.kind);
        case 'insert-list':
            return c_handleInsertList(top, action.path, action.pos, action.kind);
        case 'insert-text':
            return c_handleInsertText(top, action.path, action.pos, action.what);
        case 'add-inside':
            return c_addInside(top, action.path, action.children, action.cursor);
    }
    console.warn(`no update ${action.type}`);
    return null;
};

export const c_addInside = (top: CTop, path: Path, children: RecNodeT<boolean>[], cursor: Cursor): null | Up[] => {
    const node = top.tree.node(lastChild(path));
    if (!(node instanceof CList)) return null; // and table

    const { roots, selPath, ops } = insertRecNodes(top, children);

    const rootList = insertArray(top.ts, top.tree, roots);

    const child = top.tree.children(node.id, 'children');
    if (!child) return null;
    ops.push(...rootList.ops);
    ops.push(...child.map((cid) => new ParentOp(cid, new LRW(null, top.ts()))));
    ops.push(new ParentOp(rootList.head, new LRW({ parent: node.id, attr: 'children' }, top.ts())));

    return [...ops, { type: 'move', to: { start: selStart(pathWithChildren(path, ...selPath), cursor) } }];
};

export const insertRecNodes = (top: CTop, items: RecNodeT<boolean>[]) => {
    let selPath: NodeID[] = [];
    const nodes: Nodes = {};
    const roots = items.map((child) =>
        fromRec(child, nodes, (loc, __, path) => {
            const nl = top.ts();
            if (loc === true) {
                selPath = path.concat([nl]);
            }
            return nl;
        }),
    );

    if (selPath.length === 0) throw new Error(`nothing selected in node to add`);

    const ops = Object.values(nodes).flatMap((node) => insert(node, top));

    return { roots, ops, selPath };
};

export const c_handleIdWrap = (top: CTop, path: Path, left: number, right: number, kind: ListKind<NodeID>): Up[] | null => {
    const node = top.tree.node(lastChild(path));
    if (!(node instanceof CId)) return null;
    const text = splitGraphemes(node.text);
    // Wrap the whole thing
    if (left === 0 && right === text.length) {
        return c_wrapNode(top, path, node.id, kind);
    }

    if (left === 0 && right === 0) {
        // beforeee
    }
    if (left === text.length && right === text.length) {
        // afterrr
    }

    const first = text.slice(0, left);
    const mid = text.slice(left, right);
    const end = text.slice(right);

    throw new Error(`need to split ID I guess`);
    // return [];
};

export function c_wrapNode(top: CTop, path: Path, node: string, kind: ListKind<NodeID>): Up[] {
    const id = top.ts();
    // const lst = new MList(top.ts(), null, top.ts())
    // const kind =
    const up = c_replaceAt(path.children.slice(0, -1), top, node, id);
    const up2 = insert({ type: 'list', kind, loc: id, children: [node] }, top);
    // up.nodes[loc] = { type: 'list', kind, children: [node.loc], loc };
    return [
        // insertNodes([lst], [lst.newKindEdge(ts, )])
        ...up,
        ...up2,
        { type: 'move', to: { start: selStart(pathWithChildren(parentPath(path), id, node), { type: 'id', end: 0 }) } },
    ];
}

export const c_handleInsertList = (top: CTop, path: Path, pos: 'before' | 'after' | number, kind: ListKind<any>): Up[] => {
    if (typeof pos === 'number') {
        const node = top.tree.node(lastChild(path));
        if (node instanceof CId) {
            return c_handleIdWrap(top, path, pos, pos, kind) ?? [];
            // throw new Error('wrap an id');
        }

        // OR instanceof MTable
        if (node instanceof CList) {
            // const childEdge = node.getChildEdge(top.graph.getEdge)?.edge;
            // if (!childEdge) return [];
            const id = top.ts();
            return [
                ...node.clearChildren(top.ts()),
                ...insert({ type: 'list', kind, loc: id, children: [] }, top),
                new ParentOp(id, new LRW({ parent: node.id, attr: 'children' }, id)),
                // replaceEdges([childEdge?.del(top.ts())], new Edge(top.ts(), { id: node.id, attr: 'children' }, id)),
            ];
        }
    }

    return [];
};

export const setIdText = (top: CTop, path: Path, text: string, end: number, ccls?: number): Up[] => {
    if (text.length === 0) {
        const pnode = top.tree.node(parentLoc(path));
        if (pnode instanceof CList) {
            if (pnode.kind === 'smooshed') {
                // not handling the 'rm from smooshed' case right now
                throw new Error(`need to do a removeSelf`);
            }
        }
    }
    const node = top.tree.node(lastChild(path));
    if (!(node instanceof CId)) {
        return [];
    }
    return [node.setText(top.ts(), text, node.ccls ?? ccls), { type: 'move', to: { start: selStart(path, { type: 'id', end }) } }];
};

export const nodesProxy = (get: (id: string) => Node): Nodes => {
    return new Proxy(
        {},
        {
            get(target, name, receiver) {
                if (typeof name === 'string') {
                    return get(name);
                }
                throw new Error(`cant get ${name.toString()} ${name.description}`);
            },
            set(target, p, newValue, receiver) {
                throw new Error(`cant set on a nodes proxy`);
            },
        },
    );
};

export const wrapUpdate = (top: CTop, path: Path, min: number, max: number, kind: ListKind<string>): Op[] | null => {
    // let nextLoc = top.nextLoc;
    // const nodes: Nodes = {};
    // const node = top.nodes[lastChild(path)];
    // if (node.type !== 'list') return;
    // const children = node.children.slice();
    // const loc = nextLoc++ + '';
    const node = top.tree.node(lastChild(path));
    if (!(node instanceof CList)) return null;
    const children = node.children;
    const loc = top.ts();
    const taken = children.splice(min, max - min + 1, loc);

    const ops: Op[] = [];

    let start: SelStart;
    // if (node.kind === 'spaced' || node.kind === 'smooshed') {
    //     const inner = nextLoc++ + '';
    //     nodes[loc] = { type: 'list', kind, children: [inner], loc };
    //     nodes[inner] = { type: 'list', kind: node.kind, children: taken, loc: inner };
    //     const got = selectStart(pathWithChildren(path, loc, inner, taken[0]), top);
    //     if (!got) return;
    //     start = got;
    // } else {
    const lnode: Node = { type: 'list', kind, children: taken, loc };
    ops.push(...insert(lnode, top));
    const got = selectStart(pathWithChildren(path, loc, taken[0]), {
        get nextLoc(): number {
            throw new Error(`cant get nextLoc`);
        },
        root: top.tree.root,
        nodes: nodesProxy((id) => {
            if (id === loc) return lnode;
            return (top.tree.node(id) as CNode).asNode();
        }),
    });
    if (!got) return null;
    start = got;
    // }

    // return { nodes, selection: { start }, nextLoc };
    return ops;
};

export const c_replaceAt = (path: NodeID[], top: CTop, old: NodeID, ...locs: NodeID[]): Up[] => {
    if (locs.length === 1 && old === locs[0]) return [];
    // console.log(path, old, locs);
    if (path.length === 0) {
        const root = top.tree.root;
        if (locs.length !== 1) {
            throw new Error(`cant multi-replace at the toplevel ... not yet`);
        }
        return [new ParentOp(root, new LRW(null, top.ts())), new ParentOp(locs[0], new LRW({ parent: 'root', attr: 'root' }, top.ts()))];
    }

    return c_replaceIn(top, top.tree.node(path[path.length - 1]) as CNode, old, ...locs);
};

export const c_replaceIn = (top: CTop, node: CNode, old: NodeID, ...locs: NodeID[]): Up[] => {
    if (node instanceof CId) {
        throw new Error(`no children of id`);
    }

    // if (node.type === 'text') {
    //     const at = node.spans.findIndex((span) => span.type === 'embed' && span.item === old);
    //     if (at === -1) throw new Error(`cant find ${old} child of text ${node.loc}`);
    //     const spans = node.spans.slice();
    //     if (!locs.length) {
    //         spans.splice(at, 1);
    //         return { ...node, spans };
    //     }
    //     spans[at] = { type: 'embed', item: locs[0] };
    //     for (let i = 1; i < locs.length; i++) {
    //         spans.splice(at + i, 0, { type: 'embed', item: locs[i] });
    //     }
    //     return { ...node, spans };
    // }

    if (node instanceof CList) {
        const kind = node.kind;
        if (isTag(kind)) {
            if (kind.node === old) {
                if (locs.length !== 1) {
                    // hm or I could wrap them in a spaced or something? or a smooshed?
                    throw new Error(`Tag must be replaced with only a single node?`);
                }

                // return [replaceEdges([kindEdge.edge], MListTag.newTagEdge(top.ts(), kindEdge.end.id, locs[0]))];
            }
            if (kind.attributes === old) {
                if (locs.length !== 1) {
                    // hm or I could wrap them in a spaced or something? or a smooshed?
                    throw new Error(`Tag must be replaced with only a single node?`);
                }

                // return [replaceEdges([kindEdge.edge], MListTag.newAttributesEdge(top.ts(), kindEdge.end.id, locs[0]))];
            }
        }

        throw new Error('nopp');
        // const childLocs = node.getChildren(top.graph.getEdge);
        // if (!childLocs) return [];

        // const at = childLocs.indexOf(old);
        // if (at === -1) throw new Error(`cant find ${old} child of list ${node.id}`);
        // // const children = childLocs.slice();
        // if (!locs.length) {
        //     return node.removeChild(top.graph.getEdge, at, top.ts) ?? [];
        //     // children.splice(at, 1);
        //     // return { ...node, children };
        // }
        // if (locs.length === 1) {
        //     return node.replaceChild(top.graph.getEdge, top.ts, at, locs[0]) ?? [];
        // }

        // children[at] = locs[0];
        // for (let i = 1; i < locs.length; i++) {
        //     children.splice(at + i, 0, locs[i]);
        // }
        // return { ...node, children };
    }

    // if (node.type === 'table') {
    //     const rows = node.rows.slice();
    //     let found = false;
    //     for (let i = 0; i < rows.length; i++) {
    //         const at = rows[i].indexOf(old);
    //         if (at !== -1) {
    //             found = true;
    //             rows[i] = rows[i].slice();
    //             if (!locs.length) {
    //                 rows[i].splice(at, 1);
    //             } else {
    //                 rows[i][at] = locs[0];
    //                 for (let i = 1; i < locs.length; i++) {
    //                     rows[i].splice(at + i, 0, locs[i]);
    //                 }
    //             }
    //             break;
    //         }
    //     }
    //     if (!found) throw new Error(`cant find ${old} child of table ${node.loc}`);
    //     return { ...node, rows };
    // }

    throw new Error(`unexpected node type ${node}`);
};

export const c_handleInsertText = (top: CTop, path: Path, pos: 'before' | 'after' | number, what: KeyWhat): Up[] | null => {
    const parent = parentPath(path);
    const self = lastChild(path);
    const nid = top.ts();
    const ops: Up[] = [];
    let current = top.tree.node(self);

    let left: string;
    let right: string;
    let moveSel = false;
    let rightText = what.type === 'text' ? { text: what.grem, ccls: what.ccls } : { text: '' };

    // console.log('want to insert text', path, pos, what);
    if (typeof pos === 'number') {
        // if (current instanceof CId) {
        //     const grems = splitGraphemes(current.text);
        //     if (grems.length <= pos) {
        //         left = self;
        //         right = nid;
        //         moveSel = true;
        //     } else if (pos === 0) {
        //         left = nid;
        //         right = self;
        //     } else {
        //         moveSel = true;
        //         const pre = grems.slice(0, pos);
        //         const post = grems.slice(pos).join('');
        //         ops.push(updateNode(current.setText(pre.join(''), undefined, top.ts())));
        //         if (what.type === 'text') {
        //             const postId = top.ts();
        //             ops.push(insertNodes([new MId(postId, { text: post, ccls: current.plain.value.ccls })], []));
        //             // OK this is the only case where we don't have EXACTLY 2 newids, and
        //             // it shouldn't be handled by splitin.
        //             // SO I'll do it speartely.
        //             const rep = replaceInOrWrap(top, 'smooshed', parent, self, [self, nid, postId], {
        //                 children: [nid],
        //                 cursor: { type: 'id', end: 0 },
        //             });
        //             return rep ? [...ops, insertNodes([new MId(nid, rightText)], []), ...rep] : null;
        //         } else {
        //             rightText = { text: post, ccls: current.plain.value.ccls };
        //             left = self;
        //             right = nid;
        //         }
        //     }
        // } else {
        //     // we're doing "inside a list" anddddd idk
        //     throw new Error('nop');
        // }
        throw new Error('nop');
    } else if (pos === 'before') {
        left = nid;
        right = self;
    } else {
        left = self;
        right = nid;
        moveSel = true;
    }

    if (what.type === 'text' || what.type === 'string') {
        const newThing = insert(
            what.type === 'text' ? { type: 'id', text: what.grem, ccls: what.ccls, loc: nid } : { type: 'text', loc: nid, spans: [] },
            top,
        );

        // what.type === 'text' ?
        // [insertNodes([new MId(nid, { text: what.grem, ccls: what.ccls })], [])] :
        // insertText(top, nid, []);
        const rep = replaceInOrWrap(top, 'smooshed', parent, self, [left, right], {
            children: [nid],
            cursor: what.type === 'string' ? { type: 'list', where: 'inside' } : { type: 'id', end: 1 },
        });
        return rep ? [...ops, ...newThing, ...rep] : null;
    }

    // const newThing = insertNodes([new MId(nid, rightText)], []);

    // const splop = splitIn(
    //     top,
    //     parent,
    //     self,
    //     left,
    //     right,
    //     what.type === 'sep' ? 'list' : what.type === 'space' ? 'spaced' : 'smooshed',
    //     moveSel ? { children: [nid], cursor: { type: 'id', end: 0 } } : undefined,
    // );
    // if (!splop) return null;
    // return [...ops, newThing, ...splop];
    return null;
};

export const replaceInOrWrap = (top: CTop, kind: 'smooshed' | 'spaced', path: Path, old: string, nodes: string[], sel?: PartialSel): Up[] | null => {
    const node = top.tree.node(lastChild(path));
    if (node instanceof CList) {
        const lkind = node.kind;
        if (lkind === kind) {
            const ops = replaceChild(top.ts, top.tree.node(old)!, ...nodes);
            return ops
                ? [...ops, ...(sel ? [{ type: 'move' as const, to: { start: selStart(pathWithChildren(path, ...sel.children), sel.cursor) } }] : [])]
                : null;
        }
    }
    const nid = top.ts();
    return [
        ...c_replaceAt(path.children, top, old, nid),
        ...insert({ type: 'list', children: nodes, kind, loc: nid }, top),
        ...(sel ? [{ type: 'move' as const, to: { start: selStart(pathWithChildren(path, nid, ...sel.children), sel.cursor) } }] : []),
    ];
};
