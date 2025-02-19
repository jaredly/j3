/*
- [-] insert-list
- [x] set-id-text
- [ ] insert-text
join-list
toggle-multiline
remove-self
sel-expand, move
id-wrap
*/

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { fromRec, ListKind, Node, NodeID, Nodes, RecNodeT, TextSpan } from '../shared/cnodes';
import { isTag } from './handleNav';
import { SelStart } from './handleShiftNav';
import { KeyAction, KeyWhat } from './keyActionToUpdate';
import { CGraph, CGraphOp, Edge, MNode, rootEdge } from './update/crdt/cgraph';
import {
    childAt,
    insertAfter,
    insertBefore,
    insertText,
    insertTextSpan,
    lastTail,
    MCons,
    MId,
    MList,
    MListKind,
    MListTag,
    MNil,
    MNodes,
    MOp,
    MText,
    MTextText,
} from './update/crdt/crdtnodes';
import { Cursor, lastChild, move, parentLoc, parentPath, Path, pathWithChildren, selStart, SelUpdate, TextIndex, Top } from './utils';

// type CRDTUpdate = {
// }
export type CTop = {
    graph: CGraph<MNodes, Node | ListKind<NodeID> | { type: 'nil' } | MNode<Node>[] | TextSpan<NodeID>>;
    ts: () => string;
};

type CTNode = CTop['graph']['nodes'][''];

export type CUpdate = CGraphOp<MNodes> | SelUpdate;

export const keyActionToUpdate = (top: CTop, action: KeyAction): CUpdate[] | void | null => {
    switch (action.type) {
        // case 'join-table':
        //     return joinTable(top, action.path, top.nodes[action.child.loc], action.child.cursor, action.at);
        // case 'remove-span':
        //     return removeSpan(top, action.path, action.index);
        // case 'unwrap':
        //     return unwrap(action.path, top);
        case 'move':
            return [action.end ? move({ end: action.end, start: action.sel }) : move({ start: action.sel })];
        // case 'sel-expand':
        //     return { nodes: {}, selection: { start: sel.start, end: action.sel } };
        // case 'remove-self':
        //     return removeSelf(top, { path: action.path, node: top.nodes[lastChild(action.path)] });
        // case 'join-list':
        //     return joinInList(top, action.path, action.child);
        // case 'toggle-multiline': {
        //     const node = top.nodes[action.loc];
        //     if (node.type === 'list' || node.type === 'table') {
        //         return { nodes: { [node.loc]: { ...node, forceMultiline: !node.forceMultiline } } };
        //     }
        //     return;
        // }
        case 'set-id-text':
            return c_setIdText(top, action.path, action.text, action.end, action.ccls);
        case 'set-text-text': {
            return c_setTextText(top, action.path, action.text, action.index, action.end);
        }
        // case 'text-delete':
        //     return c_textDelete(top, action.path, action.left, action.right);
        // case 'multi-delete': {
        //     const up = c_handleDeleteTooMuch(top, action.start, action.end);
        //     if (up) {
        //         c_rebalanceSmooshed(up, top);
        //         c_joinSmooshed(up, top);
        //         c_disolveSmooshed(up, top);
        //     }
        //     return up;
        // }
        // case 'join-text':
        //     return c_handleJoinText(top, action.path);
        // case 'text-format':
        //     return c_handleTextFormat(top, action.path, action.format, action.left, action.right, action.select);
        // case 'wrap':
        //     return c_wrapUpdate(top, action.path, action.min, action.max, action.kind);
        case 'id-wrap':
            return c_handleIdWrap(top, action.path, action.left, action.right, action.kind);
        case 'insert-list':
            return c_handleInsertList(top, action.path, action.pos, action.kind);
        case 'add-span':
            return c_addSpan(top, action.path, action.span, action.index, action.cursor, action.within);
        // case 'dedent-out-of-rich':
        //     return c_dedentOutOfRich(top, action.path);
        // case 'split-text-in-rich':
        //     return c_splitTextInRich(top, action.path, action.at);
        // case 'tag-set-attributes':
        //     return c_tagSetAttributes(top, action.path, action.table, action.cursor);
        case 'insert-text':
            return c_handleInsertText(top, action.path, action.pos, action.what);
        // case 'replace-self':
        //     return c_replaceSelf(top, action.path, action.node, action.cursor);
        // case 'table-split':
        //     if (action.rowMulti != null) {
        //         return c_splitTableRow(top, action.path, action.tablePath, action.at, action.rowMulti);
        //     } else {
        //         return c_splitTableCol(top, action.path, action.tablePath, action.at);
        //     }
        // case 'control-toggle':
        //     return c_controlToggle(top, action.path, action.index);
        case 'add-inside':
            return c_addInside(top, action.path, action.children, action.cursor);
        // case 'set-text-text':
        //     return c_setTextText(top, action.path, action.text, action.index, action.end);
        // case 'paste':
        //     return c_pasteUpdate(top, action.path, action.cursor, action.values);
    }
    throw new Error(`no action ${action.type}`);
};

export const c_setTextText = (top: CTop, path: Path, text: string, index: string | number, end: number): CUpdate[] | null => {
    if (typeof index === 'number') throw new Error('need an string loc');
    const node = top.graph.nodes[index];
    if (!(node instanceof MTextText)) return null;

    return [updateNode(node.setText(text, top.ts())), move({ start: selStart(path, { type: 'text', end: { index, cursor: end } }) })];
};

export const c_addSpan = (
    top: CTop,
    path: Path,
    recSpan: TextSpan<RecNodeT<boolean>>,
    index: TextIndex | null,
    cursor: number | Cursor,
    within?: number,
): null | CUpdate[] => {
    const node = top.graph.nodes[lastChild(path)];
    if (!(node instanceof MText)) return null;

    let ops: MOp[] = [];
    let sel: SelStart;
    const id = top.ts();

    if (recSpan.type === 'embed') {
        // let selPath: NodeID[] = [];
        const result = insertRecNodes(top, [recSpan.item]);
        ops.push(...result.ops);
        ops.push(insertTextSpan(top, { ...recSpan, item: result.roots[0], loc: id }));

        sel =
            result.selPath.length && typeof cursor !== 'number'
                ? selStart(pathWithChildren(path, ...result.selPath), cursor)
                : selStart(path, { type: 'text', end: { index: id, cursor: 0 } });
    } else {
        ops.push(insertTextSpan(top, { ...recSpan, loc: id }));

        if (typeof cursor !== 'number') {
            cursor = 0;
        }

        sel = selStart(path, { type: 'text', end: { index: id, cursor } });
    }

    // let at = getSpanIndex(spans, index);
    if (index != null && typeof index !== 'string') {
        throw new Error('no numeric index ' + index);
    }
    const spans = node.getSpansEdge(top.graph.getEdge);

    let child;
    let after = false;
    if (index === null) {
        child = lastTail(spans, top.graph.getEdge);
        after = true;
        index = child.end.id;
    } else {
        child = childAt(top.graph.getEdge, index, spans)?.edge;
    }
    if (!child) return null;

    if (within != null) {
        if (after) {
            throw new Error(`cant do within and also be adding to the end`);
        }
        const span = child.end;
        if (span instanceof MTextText) {
            const text = splitGraphemes(span.text);
            if (within < text.length) {
                const nid = top.ts();
                ops.push(
                    updateNode(span.setText(text.slice(0, within).join(''), top.ts())),
                    insertNodes([span.clone(nid).setText(text.slice(within).join(''), top.ts())], []),
                    ...insertAfter(child, top.graph.getEdge, top.ts, id, nid),
                );
                return [...ops, { type: 'move', to: { start: sel } }];
            }
            after = true;
        }
    }

    if (after) {
        ops.push(...insertAfter(child, top.graph.getEdge, top.ts, id));
    } else {
        ops.push(...insertBefore(child, top.ts, id));
    }

    // const left = maybeJoin(spans[at - 1], span);
    // if (left) {
    //     spans[at - 1] = left.joined;
    //     if (sel.cursor.type === 'text') {
    //         if (typeof sel.cursor.end.index === 'number') {
    //             sel.cursor.end.index--;
    //         } else {
    //             sel.cursor.end.index = spans[at - 1].loc;
    //         }
    //         sel.cursor.end.cursor += left.off;
    //     }
    // } else {
    //     const right = maybeJoin(span, spans[at]);
    //     if (right) {
    //         spans[at] = right.joined;
    //     } else {
    //         spans.splice(at, 0, span);
    //     }
    // }

    // nodes[node.loc] = { ...node, spans };

    // return {
    //     nodes,
    //     selection: { start: sel },
    //     nextLoc,
    // };
    return [...ops, { type: 'move', to: { start: sel } }];
};

export const withIds = (nodes: RecNodeT<boolean>[]) => {};

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

    const ops = Object.values(nodes).flatMap((node) => insertNode(top, node));

    return { roots, ops, selPath };
};

export const insertNode = (top: CTop, node: Node) => {
    switch (node.type) {
        case 'id':
            return [insertNodes([new MId(node.loc, { text: node.text, ccls: node.ccls })], [])];
        case 'list':
            return insertList(top, node.loc, node.kind, node.children);
        case 'text':
            return insertText(top, node.loc, node.spans);
        case 'table':
            throw new Error('not yet');
    }
};

export const c_addInside = (top: CTop, path: Path, children: RecNodeT<boolean>[], cursor: Cursor): void | CUpdate[] => {
    const node = top.graph.nodes[lastChild(path)];
    if (!(node instanceof MList)) return; // and table

    const { roots, selPath, ops } = insertRecNodes(top, children);

    const rootList = insertArrayOp(top.ts, roots);

    const child = node.getChildEdge(top.graph.getEdge);
    if (!child) return;
    ops.push(rootList.op, replaceEdges([child.edge.del(top.ts())], child.edge.to(top.ts, rootList.head)));

    // nodes[node.loc] = node.type === 'table' ? { ...node, rows: [roots] } : { ...node, children: roots };

    return [...ops, { type: 'move', to: { start: selStart(pathWithChildren(path, ...selPath), cursor) } }];

    // return {
    //     nodes,
    //     nextLoc,
    //     selection: { start: selStart(pathWithChildren(path, ...selPath), cursor) },
    // };
};

export function insertRoot(nodes: MNodes[], edges: Edge[], ts: string): CGraphOp<MNodes>[] {
    return [{ type: 'cgraph:add-nodes', edges, nodes }, replaceEdges([], rootEdge(ts, nodes[0].id))];
}

export function insertNodes(nodes: MNodes[], edges: Edge[]): CGraphOp<MNodes> {
    return { type: 'cgraph:add-nodes', edges, nodes };
}

export function updateNode(node: MNodes): CGraphOp<MNodes> {
    return { type: 'cgraph:node', node };
}

export function replaceEdges(edges: Edge[], edge: Edge): CGraphOp<MNodes> {
    return { type: 'cgraph:replace-edges', edge, edges };
}

export const c_setIdText = (top: CTop, path: Path, text: string, end: number, ccls?: number): CUpdate[] => {
    if (text.length === 0) {
        const pnode = top.graph.nodes[parentLoc(path)];
        if (pnode instanceof MList) {
            const pkind = pnode.getKind(top.graph.getEdge);
            if (pkind === 'smooshed') {
                // not handling the 'rm from smooshed' case right now
                return [];
            }
        }
    }
    const node = top.graph.nodes[lastChild(path)];
    if (!(node instanceof MId)) {
        return [];
    }
    return [updateNode(node.setText(text, ccls, top.ts())), { type: 'move', to: { start: selStart(path, { type: 'id', end }) } }];
};

export const insertArrayOp = (ts: () => string, items: string[]) => {
    const nodes: CTNode[] = [];
    const edges: Edge[] = [];
    const head = insertArray(ts, nodes, edges, items);
    return { head, op: insertNodes(nodes, edges) };
};

export const insertArray = (ts: () => string, nodes: CTNode[], edges: Edge[], children: string[]) => {
    if (!children.length) {
        const id = ts();
        nodes.push(new MNil(id));
        return id;
    }
    let head = children[children.length - 1];
    for (let i = children.length - 2; i >= 0; i--) {
        const id = ts();
        nodes.push(new MCons<MNode<Node>>(id));
        edges.push(new Edge(ts(), { id, attr: 'tail' }, head));
        edges.push(new Edge(ts(), { id, attr: 'head' }, children[i]));
        head = id;
    }
    return head;
};

const insertList = (top: CTop, id: string, kind: ListKind<NodeID>, children: NodeID[]): CGraphOp<MNodes> => {
    const nodes: CTNode[] = [];
    const edges: Edge[] = [];

    const childId = insertArray(top.ts, nodes, edges, children);
    const kid = top.ts();

    const lst = new MList(id, false, top.ts());
    nodes.push(lst);
    edges.push(...lst.edges(top.ts, { kind: kid, children: childId }));

    if (typeof kind === 'string') {
        nodes.push(new MListKind(kid, kind, top.ts()));
    } else {
        if (kind.type === 'tag') {
            const tag = top.ts();
            nodes.push(new MListTag(tag));
            edges.push(new Edge(top.ts(), { id: tag, attr: 'tag' }, kind.node));
            if (!kind.attributes) {
                const a = top.ts();
                nodes.push(new MNil(a));
                edges.push(new Edge(top.ts(), { id: tag, attr: 'attributes' }, a));
            } else {
                edges.push(new Edge(top.ts(), { id: tag, attr: 'attributes' }, kind.attributes));
            }
        } else {
            throw new Error('sorry not sorry');
        }
    }

    return insertNodes(nodes, edges);
};

export const justUps = (ops: CUpdate[]) =>
    ops.filter((c) => c.type !== 'cgraph:add-nodes' && c.type !== 'cgraph:node' && c.type !== 'cgraph:replace-edges');

export const justOps = (ops: CUpdate[]) =>
    ops.filter((c) => c.type === 'cgraph:add-nodes' || c.type === 'cgraph:node' || c.type === 'cgraph:replace-edges');

export const c_handleInsertList = (top: CTop, path: Path, pos: 'before' | 'after' | number, kind: ListKind<any>): CUpdate[] => {
    if (typeof pos === 'number') {
        const node = top.graph.nodes[lastChild(path)];
        if (node instanceof MId) {
            return c_handleIdWrap(top, path, pos, pos, kind) ?? [];
        }

        // OR instanceof MTable
        if (node instanceof MList) {
            const childEdge = node.getChildEdge(top.graph.getEdge)?.edge;
            if (!childEdge) return [];
            const id = top.ts();
            return [
                insertList(top, id, kind, []),
                replaceEdges([childEdge?.del(top.ts())], new Edge(top.ts(), { id: node.id, attr: 'children' }, id)),
            ];
        }
    }

    return [];
};

type PartialSel = { children: string[]; cursor: Cursor };

// The item at /at/ is going to be dropped
export const splitList = (top: CTop, node: MList, at: string, left: string, right: string) => {
    // it will be relevant to know whether the left or right was wrapped.
    const kind = node.getKind(top.graph.getEdge);
    const dissolvable = kind === 'smooshed' || kind === 'spaced';
    const child = node.childAt(top.graph.getEdge, at);
    if (!child || !kind) return null;

    if (dissolvable) {
        if (child.first) {
            const first = node.getChildEdge(top.graph.getEdge);
            if (!first) return null;
            if (first.end instanceof MCons) {
                const hedge = first.end.getHeadEdge(top.graph.getEdge);
                const ops: MOp[] = [replaceEdges([hedge.edge.del(top.ts())], hedge.edge.to(top.ts, right))];
                return { left, right: node.id, ops };
            } else {
                return { left, right, ops: [] };
            }
        }
    }

    const ops: MOp[] = [];
    ops.push(replaceEdges([child.edge.edge.del(top.ts())], child.edge.edge.to(top.ts, left)));
    const nid = top.ts();
    if (child.edge.end instanceof MCons) {
        const hedge = child.edge.end.getHeadEdge(top.graph.getEdge);
        ops.push(replaceEdges([hedge.edge.del(top.ts())], hedge.edge.to(top.ts, right)), insertList(top, nid, kind, [child.edge.end.id]));
    } else {
        ops.push(insertList(top, nid, kind, [right]));
    }
    return { left: node.id, right: nid, ops };
    // child.first // whatt
    // dissolvable // hrmms

    // child?.edge
    // child?.end
};

export const replaceInOrWrap = (
    top: CTop,
    kind: 'smooshed' | 'spaced',
    path: Path,
    old: string,
    nodes: string[],
    sel?: PartialSel,
): CUpdate[] | null => {
    const node = top.graph.nodes[lastChild(path)];
    if (node instanceof MList) {
        const lkind = node.getKind(top.graph.getEdge);
        if (lkind === kind) {
            const ops = node.replaceChild(top.graph.getEdge, top.ts, old, ...nodes);
            return ops
                ? [...ops, ...(sel ? [{ type: 'move' as const, to: { start: selStart(pathWithChildren(path, ...sel.children), sel.cursor) } }] : [])]
                : null;
        }
    }
    const nid = top.ts();
    return [
        insertList(top, nid, kind, nodes),
        ...c_replaceAt(path.children, top, old, nid),
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
): CUpdate[] | null => {
    if (path.children.length === 0) {
        // we are at the top
        if (kind === 'smooshed' || kind === 'spaced') {
            return replaceInOrWrap(top, kind, path, old, [left, right], sel);
        }
        // OTHERWISEE WE need to make a new toplevel. this is not somthing I accommodate just yettt0
    }

    const node = top.graph.nodes[lastChild(path)];
    if (node instanceof MList) {
        const lkind = node.getKind(top.graph.getEdge);
        if (!lkind) {
            return null;
        }
        const matches = kind === 'smooshed' || kind === 'spaced' ? lkind === kind : lkind !== 'smooshed' && lkind !== 'spaced';
        if (matches) {
            const ops = node.replaceChild(top.graph.getEdge, top.ts, old, left, right);
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

export const c_handleInsertText = (top: CTop, path: Path, pos: 'before' | 'after' | number, what: KeyWhat): CUpdate[] | null => {
    const parent = parentPath(path);
    const self = lastChild(path);
    const nid = top.ts();
    const ops: MOp[] = [];
    let current = top.graph.nodes[self];

    let left: string;
    let right: string;
    let moveSel = false;
    let rightText = what.type === 'text' ? { text: what.grem, ccls: what.ccls } : { text: '' };

    if (typeof pos === 'number') {
        if (current instanceof MId) {
            const grems = splitGraphemes(current.plain.value.text);
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
                ops.push(updateNode(current.setText(pre.join(''), undefined, top.ts())));
                if (what.type === 'text') {
                    const postId = top.ts();
                    ops.push(insertNodes([new MId(postId, { text: post, ccls: current.plain.value.ccls })], []));
                    // OK this is the only case where we don't have EXACTLY 2 newids, and
                    // it shouldn't be handled by splitin.
                    // SO I'll do it speartely.
                    const rep = replaceInOrWrap(top, 'smooshed', parent, self, [self, nid, postId], {
                        children: [nid],
                        cursor: { type: 'id', end: 0 },
                    });
                    return rep ? [...ops, insertNodes([new MId(nid, rightText)], []), ...rep] : null;
                } else {
                    rightText = { text: post, ccls: current.plain.value.ccls };
                    left = self;
                    right = nid;
                }
            }
        } else {
            // we're doing "inside a list" anddddd idk
            throw new Error('nop');
        }
    } else if (pos === 'before') {
        left = nid;
        right = self;
    } else {
        left = self;
        right = nid;
        moveSel = true;
    }

    if (what.type === 'text' || what.type === 'string') {
        const newThing = what.type === 'text' ? [insertNodes([new MId(nid, { text: what.grem, ccls: what.ccls })], [])] : insertText(top, nid, []);
        const rep = replaceInOrWrap(top, 'smooshed', parent, self, [left, right], {
            children: [nid],
            cursor: what.type === 'string' ? { type: 'list', where: 'inside' } : { type: 'id', end: 1 },
        });
        return rep ? [...ops, ...newThing, ...rep] : null;
    }

    const newThing = insertNodes([new MId(nid, rightText)], []);

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
    return [...ops, newThing, ...splop];
};

export const c_replaceAt = (path: NodeID[], top: CTop, old: NodeID, ...locs: NodeID[]): CUpdate[] => {
    if (locs.length === 1 && old === locs[0]) return [];
    if (path.length === 0) {
        const root = top.graph.getEdge('root', 'root');
        // if (old !== root.end.id) {
        //     throw new Error(`expected ${old} to be root of top, but found ${root.end.id}`);
        // }
        if (locs.length !== 1) {
            throw new Error(`cant multi-replace at the toplevel ... not yet`);
        }
        return [replaceEdges([root.edge.del(top.ts()), ...(root.alts?.map((e) => e.del(top.ts())) ?? [])], rootEdge(top.ts(), locs[0]))];
    }

    return c_replaceIn(top, top.graph.nodes[path[path.length - 1]], old, ...locs);
};

export const c_replaceIn = (top: CTop, node: MNode<any>, old: NodeID, ...locs: NodeID[]): CUpdate[] => {
    if (node instanceof MId) {
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

    if (node instanceof MList) {
        const kindEdge = node.getKindEdge(top.graph.getEdge);
        if (!kindEdge) return [];
        const kind = kindEdge?.end.construct(top.graph.getEdge);
        if (!kind) return [];
        if (isTag(kind) && kind.node === old) {
            if (locs.length !== 1) {
                // hm or I could wrap them in a spaced or something? or a smooshed?
                throw new Error(`Tag must be replaced with only a single node?`);
            }

            return [replaceEdges([kindEdge.edge], MListTag.newTagEdge(top.ts(), kindEdge.end.id, locs[0]))];
            // return { ...node, kind: { type: 'tag', node: locs[0], attributes: node.kind.attributes } };
        }

        if (isTag(kind) && kind.attributes === old) {
            if (locs.length !== 1) {
                // hm or I could wrap them in a spaced or something? or a smooshed?
                throw new Error(`Tag must be replaced with only a single node?`);
            }

            return [replaceEdges([kindEdge.edge], MListTag.newAttributesEdge(top.ts(), kindEdge.end.id, locs[0]))];
        }

        const childLocs = node.getChildren(top.graph.getEdge);
        if (!childLocs) return [];

        const at = childLocs.indexOf(old);
        if (at === -1) throw new Error(`cant find ${old} child of list ${node.id}`);
        // const children = childLocs.slice();
        if (!locs.length) {
            return node.removeChild(top.graph.getEdge, at, top.ts) ?? [];
            // children.splice(at, 1);
            // return { ...node, children };
        }
        if (locs.length === 1) {
            return node.replaceChild(top.graph.getEdge, top.ts, at, locs[0]) ?? [];
        }
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

export function c_wrapNode(top: CTop, path: Path, node: string, kind: ListKind<NodeID>): CUpdate[] {
    const id = top.ts();
    const up2 = insertList(top, id, kind, [node]);
    // const lst = new MList(top.ts(), null, top.ts())
    // const kind =
    const up = c_replaceAt(path.children.slice(0, -1), top, node, id);
    // up.nodes[loc] = { type: 'list', kind, children: [node.loc], loc };
    return [
        up2,
        // insertNodes([lst], [lst.newKindEdge(ts, )])
        ...up,
        { type: 'move', to: { start: selStart(pathWithChildren(parentPath(path), id, node), { type: 'id', end: 0 }) } },
    ];
}

export const c_handleIdWrap = (top: CTop, path: Path, left: number, right: number, kind: ListKind<NodeID>): CUpdate[] | void => {
    const node = top.graph.nodes[lastChild(path)];
    if (!(node instanceof MId)) return;
    const text = splitGraphemes(node.plain.value.text);
    // Wrap the whole thing
    if (left === 0 && right === text.length) {
        return c_wrapNode(top, path, node.id, kind);
    }

    const first = text.slice(0, left);
    const mid = text.slice(left, right);
    const end = text.slice(right);

    return [];
    // // in the middle or the end
    // const parent = findParent(0, parentPath(path), top);
    // const flat = parent ? flatten(parent.node, top) : [node];
    // const nlist: List<NodeID> = { type: 'list', children: [], kind, loc };
    // const nodes: Nodes = { [loc]: nlist };
    // let sel: Node = nlist;
    // let ncursor: Cursor = { type: 'list', where: 'inside' };
    // if (mid.length) {
    //     if (left > 0) {
    //         const rid = nextLoc++ + '';
    //         nodes[rid] = { type: 'id', text: mid.join(''), loc: rid, ccls: node.ccls };
    //         nlist.children.push(rid);
    //     } else {
    //         nodes[node.loc] = { ...node, text: mid.join('') };
    //         nlist.children.push(node.loc);
    //     }
    //     // sel = nodes[rid];
    //     // ncursor = { type: 'id', end: 0 };
    //     ncursor = { type: 'list', where: 'before' };
    // }

    // let at = flat.indexOf(node);
    // if (left > 0) {
    //     flat[at] = nodes[node.loc] = { ...node, text: first.join('') };
    // }

    // flat.splice(at + 1, 0, nlist);

    // if (end.length) {
    //     const eid = nextLoc++ + '';
    //     nodes[eid] = { type: 'id', text: end.join(''), loc: eid, ccls: node.ccls };
    //     flat.splice(at + 2, 0, nodes[eid]);
    // }

    // if (left === 0) {
    //     flat.splice(at, 1);
    // }

    // return flatToUpdateNew(
    //     flat,
    //     { node: sel, cursor: ncursor },
    //     { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
    //     nodes,
    //     {
    //         ...top,
    //         nextLoc,
    //     },
    // );
};
