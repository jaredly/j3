import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import { fromRec, ListKind, Node, NodeID, Nodes, RecNodeT } from '../../../shared/cnodes';
import { isTag, selectStart } from '../../handleNav';
import { SelStart } from '../../handleShiftNav';
import { KeyAction, KeyWhat } from '../../keyActionToUpdate';
import { Cursor, lastChild, move, NodeSelection, parentLoc, parentPath, PartialSel, Path, pathWithChildren, selStart, SelUpdate } from '../../utils';
import { LRW } from './crdt';
import { CCons, CId, CList, CNode, CTree, insert, insertArray, Op, ParentOp, replaceChild } from './ctree';

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
        case 'toggle-multiline': {
            const node = top.tree.node(action.loc);
            if (node instanceof CList) {
                return [node.setMulti(!node.multi.value, top.ts())];
            }
        }
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

    // // check to see if we should adjust to one side
    // if (what.type === 'space' && typeof pos !== 'number' && !(current instanceof CId)) {
    //     const pnode = top.tree.node(lastChild(parent))
    //     if (pnode instanceof CList) {
    //         const children = pnode.children
    //         const at = children.indexOf(self)
    //         if (pos === 'before') {
    //             if (at > 0) {
    // wait maybe this won't work in the general case
    //             }
    //         }
    //     }
    // }

    const nid = top.ts();
    const ops: Up[] = [];

    let left: string;
    let right: string;
    let moveSel = false;
    let rightText = what.type === 'text' ? { text: what.grem, ccls: what.ccls } : { text: '' };

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
        what.ccls;
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

    ops.push(new CId(nid, new LRW(rightText, nid), top.tree));

    if (what.type === 'sep' && what.newLine) {
        const node = top.tree.node(lastChild(parent));
        if (node instanceof CList) {
            ops.push(node.setMulti(true, top.ts()));
        }
    }

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
        const sub = splitIn(top, parentPath(path), node.id, split.left, split.right, kind, sel);
        if (!sub) {
            return null;
        }
        return [...split.ops, ...sub];
    } else {
        // TODO Table
        return null;
    }
};

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
            return { left, right: node.id, ops: [new ParentOp(right, new LRW({ parent: parent.id, attr: 'head' }, top.ts()))] };

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
    }

    const ops: Up[] = [];
    const nid = top.ts();

    ops.push(...replaceChild(top.ts, child, left, right));

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
