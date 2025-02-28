import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import { fromRec, Id, ListKind, Node, NodeID, Nodes, RecNodeT, TextSpan } from '../../../shared/cnodes';
import { isTag, selectEnd, selectStart } from '../../handleNav';
import { SelStart } from '../../handleShiftNav';
import { KeyAction, KeyWhat } from '../../keyActionToUpdate';
import { collectSelectedNodes } from '../../selections';
import {
    Cursor,
    lastChild,
    move,
    NodeSelection,
    parentLoc,
    parentPath,
    PartialSel,
    Path,
    pathWithChildren,
    selStart,
    SelUpdate,
    TextIndex,
} from '../../utils';
import { partitionNeighbors, shouldNudgeLeft, shouldNudgeRight } from '../multi-change';
import { LRW } from './crdt';
import {
    CChild,
    CCons,
    CId,
    CList,
    CNode,
    CText,
    CTextText,
    CTree,
    filterConsList,
    insert,
    insertAfter,
    insertArray,
    insertTextSpan,
    Op,
    ParentObj,
    ParentOp,
    replaceChild,
    showOp,
} from './ctree';
import { debugCtree } from './ctree.test';

export type CTop = {
    tree: CTree;
    ts: () => string;
};

export type Up = Op | SelUpdate;

export const justOps = (ups: Up[]): Op[] => ups.filter((up) => !('type' in up)) as Op[];

export const ctreeUpdate = (top: CTop, action: KeyAction, sel: NodeSelection): Up[] | null => {
    // console.log('keyaction', action);
    // debugCtree(top.tree);
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
        case 'toggle-multiline': {
            const node = top.tree.node(action.loc);
            if (node instanceof CList) {
                return [node.setMulti(!node.multi.value, top.ts())];
            }
            return null;
        }
        case 'add-span':
            return addSpan(top, action.path, action.span, action.index, action.cursor, action.within) ?? null;
        case 'multi-delete':
            return handleDeleteTooMuch(top, action.start, action.end);
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

    if (cursor.type === 'text') {
        cursor.end.index = selPath.pop()!;
    }

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
        const nid = top.ts();
        const rep = replaceInOrWrap(top, 'smooshed', parentPath(path), node.id, [node.id, nid], {
            children: [nid],
            cursor: { type: 'list', where: 'inside' },
        });
        if (!rep) return null;
        return [...rep, ...insert({ type: 'list', kind, children: [], loc: nid }, top)];
    }

    const first = text.slice(0, left);
    const mid = text.slice(left, right);
    const end = text.slice(right);

    throw new Error(`need to split ID I guess ${left} - ${right} : ${text.length}`);
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
    return [node.setText(top.ts(), text, ccls ?? node.ccls), { type: 'move', to: { start: selStart(path, { type: 'id', end }) } }];
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
        return [
            new ParentOp(root, new LRW(null, top.ts())),
            //
            new ParentOp(locs[0], new LRW({ parent: 'root', attr: 'root' }, top.ts())),
        ];
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

        return replaceChild(top.ts, top.tree.node(old)!, ...locs);

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
    let current = top.tree.node(self);

    const nid = top.ts();
    const ops: Up[] = [];

    let left: string;
    let right: string;
    let moveSel = false;
    let rightText = what.type === 'text' ? { text: what.grem, ccls: what.ccls } : { text: '' };
    // console.log('INS', pos, what);

    // console.log('want to insert text', path, pos, what);
    if (typeof pos === 'number') {
        if (current instanceof CId) {
            const grems = splitGraphemes(current.text);
            if (grems.length <= pos) {
                left = self;
                right = nid;
                moveSel = true;
            } else if (pos === 0) {
                left = nid;
                right = self;
            } else {
                moveSel = true;
                const pre = grems.slice(0, pos);
                const post = grems.slice(pos).join('');
                ops.push(current.setText(top.ts(), pre.join('')));
                // ops.push(updateNode(current.setText(pre.join(''), undefined, top.ts())));
                if (what.type === 'text') {
                    const postId = top.ts();
                    ops.push(new CId(postId, new LRW({ text: post, ccls: current.ccls }, postId), top.tree));
                    // OK this is the only case where we don't have EXACTLY 2 newids, and
                    // it shouldn't be handled by splitin.
                    // SO I'll do it speartely.
                    const rep = replaceInOrWrap(top, 'smooshed', parent, self, [self, nid, postId], {
                        children: [nid],
                        cursor: { type: 'id', end: 0 },
                    });
                    return rep ? [...ops, new CId(nid, new LRW(rightText, nid), top.tree), ...rep] : null;
                } else {
                    rightText = { text: post, ccls: current.ccls };
                    left = self;
                    right = nid;
                }
            }
        } else {
            // we're doing "inside a list" anddddd idk
            throw new Error('nop');
        }
        // throw new Error('nop');
    } else if (pos === 'before') {
        left = nid;
        right = self;
    } else {
        left = self;
        right = nid;
        moveSel = true;
    }

    // Smoosh collapse?
    if (what.type === 'text') {
        const pnode = top.tree.node(parentLoc(path));
        if (pnode instanceof CList && pnode.kind === 'smooshed') {
            const children = pnode.children;
            let at = children.indexOf(self);
            at += left === self ? 1 : -1;
            if (at >= 0 && at < children.length) {
                const adj = top.tree.node(children[at]);
                if (adj instanceof CId && adj.ccls === what.ccls) {
                    return [
                        adj.setText(top.ts(), left === self ? what.grem + adj.text : adj.text + what.grem),
                        {
                            type: 'move',
                            to: {
                                start: selStart(pathWithChildren(parentPath(path), adj.id), {
                                    type: 'id',
                                    end: left === self ? 1 : splitGraphemes(adj.text).length + 1,
                                }),
                            },
                        },
                    ];
                }
            }
        }
    }

    if (what.type === 'space' || what.type === 'sep') {
        const pnode = top.tree.node(parentLoc(path));
        if (pnode instanceof CList && pnode.kind === 'smooshed') {
            const children = pnode.children;
            let at = children.indexOf(self);
            at += left === self ? 1 : -1;
            if (at >= 0 && at < children.length) {
                let right = top.tree.node(left === self ? children[at] : self);
                if (!right) return null;

                const oright = right;

                if (right.parent?.attr === 'head') {
                    // then we need to jump up to the ccons
                    right = top.tree.node(right.parent.parent)!;
                }

                // if adj ... exists, then we just split in it.
                const res = partitionn(top, right);
                if (!res) return null;
                const ops = res.ops;

                let lid = res.first ? res.head : pnode.id;
                let rid = oright.id;

                let sel = [rid];

                if (right instanceof CCons) {
                    const nid = top.ts();
                    ops.push(new CList(nid, new LRW(pnode.kind, nid), new LRW(null, nid), top.tree));
                    ops.push(new ParentOp(right.id, new LRW({ parent: nid, attr: 'children' }, top.ts())));
                    rid = nid;
                    sel = [rid, oright.id];
                    // console.log('RID', nid);
                }

                const inner = splitIn(top, parentPath(parentPath(path)), pnode.id, lid, rid, what.type === 'space' ? 'spaced' : 'list', {
                    cursor: oright instanceof CId ? { type: 'id', end: 0 } : { type: 'list', where: 'before' },
                    children: sel,
                });
                if (!inner) return null;
                return [...inner, ...ops];
                // if: left === self
                // ...
                // left => replace the cons
                // ...
                // right = children of the new list
                // then `splitIn`

                // splitin
                // START HERE
                // const split = splitList(top, node, old, left, right);
                // if (!split) return null;
                // if (sel) {
                //     if (left === sel.children[0] && split.left !== left) {
                //         sel = { ...sel, children: [split.left, ...sel.children] };
                //     }
                //     if (right === sel.children[0] && split.right !== right) {
                //         sel = { ...sel, children: [split.right, ...sel.children] };
                //     }
                // }
                // const sub = splitIn(top, parentPath(path), node.id, split.left, split.right, kind, sel);
                // if (!sub) {
                //     return null;
                // }
                // return [...split.ops, ...sub];

                // return splitIn(
                //     top,
                //     parent,
                //     self,
                //     left,
                //     right,
                //     'spaced',
                //     // moveSel ? { children: [nid], cursor: { type: 'id', end: 0 } } : undefined,
                // );
            }
        }
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

    // if (rightText.text !== '') {
    ops.push(new CId(nid, new LRW(rightText, nid), top.tree));
    // } else {
    //     if (left === nid) {
    //         left = null
    //     } else if (right === nid) {
    //         right = null
    //     }
    // }

    if (what.type === 'sep' && what.newLine) {
        const node = top.tree.node(lastChild(parent));
        if (node instanceof CList) {
            ops.push(node.setMulti(true, top.ts()));
        }
    }
    // debugCtree(top.tree);

    // console.log('Splitting', { left, right, self });

    const splop = splitIn(
        top,
        parent,
        self,
        left,
        right,
        what.type === 'sep' ? 'list' : what.type === 'space' ? 'spaced' : 'smooshed',
        moveSel ? { children: [nid], cursor: { type: 'id', end: 0 } } : undefined,
    );
    if (!splop) return null;
    return [...ops, ...splop];
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
        ...nodes.map((n) => ({ type: 'addparent' as const, loc: n, parent: nid })),
        // {type: 'addparent', loc: },
        ...(sel ? [{ type: 'move' as const, to: { start: selStart(pathWithChildren(path, nid, ...sel.children), sel.cursor) } }] : []),
    ];
};

export const splitIn = (
    top: CTop,
    path: Path,
    old: string,
    left: string,
    right: string,
    kind: 'smooshed' | 'spaced' | 'list' | 'row' | 'col',
    sel?: PartialSel,
): Up[] | null => {
    if (path.children.length === 0) {
        // we are at the top
        if (kind === 'smooshed' || kind === 'spaced') {
            return replaceInOrWrap(top, kind, path, old, [left, right], sel);
        }
        // OTHERWISEE WE need to make a new toplevel. this is not somthing I accommodate just yettt0
    }

    const node = top.tree.node(lastChild(path));
    if (node instanceof CList) {
        const lkind = node.kind;
        if (!lkind) {
            return null;
        }
        const matches = kind === 'smooshed' || kind === 'spaced' ? lkind === kind : lkind !== 'smooshed' && lkind !== 'spaced';
        if (matches) {
            const ops = replaceChild(top.ts, top.tree.node(old)!, left, right);
            // node.replaceChild(top.graph.getEdge, top.ts, old, left, right);
            if (!ops) {
                return ops;
            }
            return ops
                ? [...ops, ...(sel ? [{ type: 'move' as const, to: { start: selStart(pathWithChildren(path, ...sel.children), sel.cursor) } }] : [])]
                : null;
        }

        if (kind === 'smooshed' || (kind === 'spaced' && lkind !== 'smooshed')) {
            return replaceInOrWrap(top, kind, path, old, [left, right], sel);
        }

        const split = splitList(top, node, old, left, right);
        if (!split) return null;
        if (sel) {
            if (left === sel.children[0] && split.left !== left) {
                sel = { ...sel, children: [split.left, ...sel.children] };
            }
            if (right === sel.children[0] && split.right !== right) {
                sel = { ...sel, children: [split.right, ...sel.children] };
            }
        }
        // console.log('INNNN', split.right, sel);
        // console.log(split.ops.map(showOp).join('\n'));
        const sub = splitIn(top, parentPath(path), node.id, split.left, split.right, kind, sel);
        if (!sub) {
            return null;
        }
        return [
            //
            ...sub,
            ...split.ops,
        ];
    } else {
        // TODO Table
        return null;
    }
};

export const partitionn = (top: CTop, node: CChild): void | { first: false; ops: Up[] } | { first: true; head: string; ops: Up[] } => {
    const parent = node.parent;
    if (!parent) return;
    if (parent.attr !== 'tail') throw new Error(`not a tail`);
    const cons = top.tree.node(parent.parent);
    if (!cons || !cons.parent) return;
    if (!(cons instanceof CCons)) throw new Error(`not a cons`);
    if (cons.parent.attr !== 'tail') {
        return {
            first: true,
            ops: [new ParentOp(cons.parent.parent, new LRW(null, top.ts()))],
            head: cons.head[0],
        };
    }
    return {
        first: false,
        ops: cons.head.map((id) => new ParentOp(id, new LRW(cons.parent, top.ts()))).concat([new ParentOp(cons.id, new LRW(null, top.ts()))]),
    };
};

/**
 * Split a list (node) on the child item {at}, where {at} gets replaced with {left} as the end
 * of the list, and everything else gets prefixed with {right} and added to a new list.
 */
export const splitList = (top: CTop, node: CList, at: string, left: string, right: string) => {
    // it will be relevant to know whether the left or right was wrapped.
    const kind = node.kind;
    const dissolvable = kind === 'smooshed' || kind === 'spaced';
    const child = top.tree.node(at);
    // node.childAt(top.graph.getEdge, at);
    if (!child || !kind) return null;

    if (dissolvable) {
        if (!child.parent) return null;
        // if (child.first) {
        if (child.parent.attr === 'children') {
            return { left, right, ops: [] };
        }
        const parent = top.tree.node(child.parent.parent);
        if (parent instanceof CCons && parent?.parent?.attr === 'children') {
            // const hedge = first.end.getHeadEdge(top.graph.getEdge);
            // const ops: Up[] = [replaceEdges([hedge.edge.del(top.ts())], hedge.edge.to(top.ts, right))];

            // We're splitting on the first item
            if (child.parent.attr === 'head') {
                return { left, right: node.id, ops: [new ParentOp(right, new LRW({ parent: parent.id, attr: 'head' }, top.ts()))] };
            }

            // We're splitting on the second of two items
            return { left: node.id, right, ops: [new ParentOp(left, new LRW(child.parent, top.ts()))] };

            // const first = node.getChildEdge(top.graph.getEdge);
            // if (!first) return null;
            // if (first.end instanceof MCons) {
            //     const hedge = first.end.getHeadEdge(top.graph.getEdge);
            //     const ops: MOp[] = [replaceEdges([hedge.edge.del(top.ts())], hedge.edge.to(top.ts, right))];
            //     return { left, right: node.id, ops };
            // } else {
            //     return { left, right, ops: [] };
            // }
        }
        // Splitting on last item
        if (child.parent.attr === 'tail') {
            return { left: node.id, right, ops: [new ParentOp(left, new LRW(child.parent, top.ts()))] };
        }
    }

    const ops: Up[] = [];
    const nid = top.ts();

    // Step 1: (at) needs to be trimmed to be the endd

    // Normal case
    if (child.parent?.attr === 'head') {
        const cons = top.tree.node(child.parent.parent);
        if (!cons?.parent) return;
        ops.push(new ParentOp(child.id, new LRW(null, top.ts())));
        ops.push(new ParentOp(left, new LRW(cons.parent, top.ts())));
        const nid = top.ts();
        ops.push(new CList(nid, new LRW(kind, nid), new LRW(null, nid), top.tree));
        ops.push(new ParentOp(cons.id, new LRW({ parent: nid, attr: 'children' }, top.ts())));
        ops.push(new ParentOp(right, new LRW({ parent: cons.id, attr: 'head' }, top.ts())));
        return { ops, left: node.id, right: nid };
    }

    // console.log('Reacpling child', child.id, left, right);
    ops.push(...replaceChild(top.ts, child, left, right));
    throw new Error('nop nop');

    // ops.push(replaceEdges([child.edge.edge.del(top.ts())], child.edge.edge.to(top.ts, left)));
    // if (child.edge.end instanceof MCons) {
    //     const hedge = child.edge.end.getHeadEdge(top.graph.getEdge);
    //     // ops.push(
    //     //     replaceEdges([hedge.edge.del(top.ts())], hedge.edge.to(top.ts, right)),
    //     //     insertList(top, nid, kind, [child.edge.end.id]));
    //     ops.push(
    //         new ParentOp(right, new LRW({attr: 'head', parent: child}, top.ts())),
    //         ...insert({type: 'list', kind, loc: nid, children: [child.edge.end.id]} ,top))
    // } else {
    //     ops.push(...insert({type: 'list', kind, loc: nid, children: [right]} ,top))
    // }

    return { left: node.id, right: nid, ops };
};

export const handleDeleteTooMuch = (top: CTop, start: SelStart, end: SelStart): Up[] | null => {
    const getNode = (id: string) => (top.tree.node(id) as CNode).asNode();
    const [left, neighbors, right, _] = collectSelectedNodes(start, end, getNode);
    const lnudge = shouldNudgeRight(left.path, left.cursor, getNode);
    const rnudge = shouldNudgeLeft(right.path, right.cursor, getNode);
    if (!lnudge) neighbors.push({ path: left.path, hl: { type: 'full' } });
    let rpartial = null as null | Id<string>;
    {
        const rnode = getNode(lastChild(right.path));
        if (rnode.type === 'id' && right.cursor.type === 'id') {
            const grems = splitGraphemes(rnode.text);
            if (right.cursor.end < grems.length) {
                rpartial = { ...rnode, text: grems.slice(right.cursor.end).join('') };
            }
        }
    }
    if (!rnudge && rpartial == null) neighbors.push({ path: right.path, hl: { type: 'full' } });
    const sorted = partitionNeighbors(neighbors, getNode, false);
    const lloc = lastChild(left.path);

    const ops: Up[] = [];

    // const nodes: Nodes = {};
    sorted.forEach(({ path, children: selected }) => {
        const node = top.tree.node(lastChild(path));
        if (!(node instanceof CList)) return;
        const child = top.tree.children(node.id, 'children');
        if (!child.length) return;
        ops.push(
            ...filterConsList(
                top.ts,
                top.tree.node(child[0])!,
                { parent: node.id, attr: 'children' },
                (child) => !selected.includes(child.id) || lloc === child.id,
            ),
        );
        // STOPSHIP;
        // throw new Error('got to do a filter on the tree node array');
        // const children = node.children.slice().filter((c) => !selected.includes(c) || lloc === c);
        // nodes[node.loc] = { ...node, children };
    });

    let leftCursor = 0;
    if (!lnudge) {
        // nodes[lloc] = { type: 'id', text: '', loc: lloc };
        const lnode = getNode(lloc);
        if (lnode.type === 'id' && left.cursor.type === 'id' && left.cursor.end !== 0) {
            const text = splitGraphemes(lnode.text).slice(0, left.cursor.end).join('');
            // nodes[lloc] = { type: 'id', text, loc: lloc, ccls: lnode.ccls };
            ops.push(new CId(lloc, new LRW({ text, ccls: lnode.ccls }, top.ts()), top.tree));
            leftCursor = left.cursor.end;
        } else {
            ops.push(new CId(lloc, new LRW({ text: '' }, top.ts()), top.tree));
        }
    }

    if (rpartial) {
        // nodes[rpartial.loc] = rpartial;
        ops.push(new CId(rpartial.loc, new LRW({ text: rpartial.text, ccls: rpartial.ccls }, top.ts()), top.tree));
    }
    const sel = lnudge
        ? selectEnd(left.path, {
              nodes: new Proxy(
                  {},
                  {
                      get(target, p, receiver) {
                          if (typeof p === 'string') {
                              return (top.tree.node(p) as CNode).asNode();
                          }
                          throw new Error(`no node ${p.toString()}`);
                      },
                  },
              ),
          })
        : selStart(left.path, { type: 'id', end: leftCursor });
    if (!sel) return null;

    let selection: NodeSelection = { start: sel };
    ops.push({ type: 'move', to: selection });

    const lparent = parentLoc(left.path);
    const rparent = parentLoc(right.path);
    if (lparent === rparent) {
        // This is modifying one of the nodes from `sorted` above...
        // const pnode = nodes[lparent];
        // if (pnode?.type === 'list' && pnode.kind !== 'smooshed') {
        //     const i1 = pnode.children.indexOf(lastChild(left.path));
        //     const i2 = pnode.children.indexOf(lastChild(right.path));
        //     if (i2 === i1 + 1) {
        //         const children = pnode.children.slice();
        //         const loc = top.ts()
        //         const two = children.splice(i1, 2, loc);
        //         nodes[loc] = { type: 'list', kind: 'smooshed', children: two, loc };
        //         nodes[pnode.loc] = { ...pnode, children };
        //         ops.push({ type: 'addparent', loc: two[0], parent: loc });
        //         ops.push({ type: 'addparent', loc: two[1], parent: loc });
        //     }
        // }
    }

    return ops;
};

export const collapseSmooshes = (top: CTop) => {
    const root = top.tree.root;
    const ops: Up[] = [];
    const walk = (node: CChild, p: ParentObj) => {
        // console.log('walk', node.id, node.show(), p);
        if (node instanceof CList) {
            const kind = node.kind;
            if (kind === 'smooshed' || kind === 'spaced') {
                const children = node.children;
                // console.log('is smoosh', children);
                if (children.length === 1) {
                    // console.log('change it maybe');
                    ops.push(new ParentOp(children[0], new LRW(p, top.ts())), new ParentOp(node.id, new LRW(null, top.ts())));
                    walk(top.tree.node(children[0])!, p);
                    ops.push({ type: 'unparent', loc: node.id });
                    return;
                }
            }
            const children = top.tree.children(node.id, 'children');
            if (children.length !== 1) throw new Error('need 1 children for list node');
            walk(top.tree.node(children[0])!, { parent: node.id, attr: 'children' });
        }
        if (node instanceof CCons) {
            const hd = node.head[0];
            walk(top.tree.node(hd)!, { parent: node.id, attr: 'head' });
            const tl = node.tail[0];
            walk(top.tree.node(tl)!, { parent: node.id, attr: 'tail' });
        }
    };
    walk(top.tree.node(root)!, { parent: 'root', attr: 'root' });
    return ops;
};

export const addSpan = (
    top: CTop,
    path: Path,
    recSpan: TextSpan<RecNodeT<boolean>>,
    index: TextIndex,
    cursor: number | Cursor,
    within?: number,
): void | Up[] => {
    const node = top.tree.node(lastChild(path));
    if (!(node instanceof CText)) return;
    // const spans = node.spans.slice();

    const ops: Up[] = [];
    // const nodes: Nodes = {};

    let sel: SelStart;
    const id = top.ts();

    // let span: TextSpan<NodeID>;

    if (recSpan.type === 'embed') {
        const result = insertRecNodes(top, [recSpan.item]);
        ops.push(...result.ops);
        ops.push(...insertTextSpan(top, { ...recSpan, loc: id, item: result.roots[0] }));

        sel =
            result.selPath.length && typeof cursor !== 'number'
                ? selStart(pathWithChildren(path, ...result.selPath), cursor)
                : selStart(path, { type: 'text', end: { index: id, cursor: 0 } });

        // nextLoc = top.nextLoc;
        // let selPath: NodeID[] = [];
        // const root = fromRec(recSpan.item, nodes, (loc, __, path) => {
        //     const nl = nextLoc!++ + '';
        //     if (loc === true) {
        //         selPath = path.concat([nl]);
        //     }
        //     return nl;
        // });
        // span = { ...recSpan, item: root };
        // sel =
        //     selPath.length && typeof cursor !== 'number'
        //         ? selStart(pathWithChildren(path, ...selPath), cursor)
        //         : selStart(path, { type: 'text', end: { index: index, cursor: 0 } });
    } else {
        ops.push(...insertTextSpan(top, { ...recSpan, loc: id }));

        if (typeof cursor !== 'number') {
            cursor = 0;
        }

        sel = selStart(path, { type: 'text', end: { index: id, cursor } });
    }

    const spans = node.spans;

    // let at = getSpanIndex(spans, index);
    if (index === 0 && spans.length === 0) {
        const child = top.tree.children(node.id, 'spans')[0];
        ops.push(new ParentOp(child, new LRW(null, top.ts())));
        ops.push(new ParentOp(id, new LRW({ parent: node.id, attr: 'spans' }, top.ts())));
        ops.push({ type: 'move', to: { start: sel } });
        return ops;
        // then we ... are maybe replacing an empty?
    }
    if (index != null && typeof index !== 'string') {
        throw new Error('no numeric index ' + index);
    }

    let child;
    let after = false;
    if (index === null) {
        child = spans[spans.length - 1];
        // child = lastTail(spans, top.graph.getEdge);
        after = true;
        // index = child.end.id;
        index = child.id;
    } else {
        child = top.tree.node(index);
        // child = childAt(top.graph.getEdge, index, spans)?.edge;
    }
    if (!child) return;

    if (within != null) {
        if (after) {
            throw new Error(`cant do within and also be adding to the end`);
        }
        if (child instanceof CTextText) {
            const text = splitGraphemes(child.text.value);
            if (within < text.length) {
                const nid = top.ts();
                ops.push(
                    child.setText(text.slice(0, within).join(''), top.ts()),
                    child.clone(nid).setText(text.slice(within).join(''), top.ts()),
                    // updateNode(span.setText()),
                    // insertNodes([span.clone(nid).setText()], []),
                    ...insertAfter(top.ts, top.tree.node(id)!, nid),
                );
                return [...ops, { type: 'move', to: { start: sel } }];
            }
            after = true;
        }

        // const current = spans[at];
        // if (current?.type === 'text') {
        //     const text = splitGraphemes(current.text);
        //     if (within < text.length) {
        //         spans[at] = { ...current, text: text.slice(0, within).join('') };
        //         spans.splice(at + 1, 0, { ...current, text: text.slice(within).join('') });
        //     }
        //     at++;
        // }
    }

    /*
    const left = maybeJoin(spans[at - 1], span);
    if (left) {
        spans[at - 1] = left.joined;
        if (sel.cursor.type === 'text') {
            if (typeof sel.cursor.end.index === 'number') {
                sel.cursor.end.index--;
            } else {
                sel.cursor.end.index = spans[at - 1].loc;
            }
            sel.cursor.end.cursor += left.off;
        }
    } else {
        const right = maybeJoin(span, spans[at]);
        if (right) {
            spans[at] = right.joined;
        } else {
            spans.splice(at, 0, span);
        }
    }

    nodes[node.loc] = { ...node, spans };

    return {
        nodes,
        selection: { start: sel },
        nextLoc,
    };
    */
};
