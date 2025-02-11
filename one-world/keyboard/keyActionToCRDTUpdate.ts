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
import { ListKind, Node, NodeID } from '../shared/cnodes';
import { isTag } from './handleNav';
import { KeyWhat } from './keyActionToUpdate';
import { CGraph, CGraphOp, Edge, MNode } from './update/crdt/cgraph';
import { MCons, MId, MList, MListKind, MListTag, MNil } from './update/crdt/crdtnodes';
import { lastChild, parentLoc, parentPath, Path, pathWithChildren, selStart, SelUpdate, Top } from './utils';

type MNodes = MId | MList | MNil | MCons<Node> | MListKind | MListTag;

// type CRDTUpdate = {
// }
export type CTop = {
    graph: CGraph<MNodes, Node | ListKind<NodeID> | { type: 'nil' } | MNode<Node>[]>;
    ts: () => string;
};

type CTNode = CTop['graph']['nodes'][''];

export type CUpdate = CGraphOp<MNodes> | SelUpdate;

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

const insertArray = (top: CTop, nodes: CTNode[], edges: Edge[], children: string[]) => {
    if (!children.length) {
        const id = top.ts();
        nodes.push(new MNil(id));
        return id;
    }
    let head = children[children.length - 1];
    for (let i = children.length - 2; i >= 0; i--) {
        const id = top.ts();
        nodes.push(new MCons<Node>(id));
        edges.push(new Edge(top.ts(), { id, attr: 'tail' }, head));
        edges.push(new Edge(top.ts(), { id, attr: 'head' }, children[i]));
        head = id;
    }
    return head;
};

const insertList = (top: CTop, id: string, kind: ListKind<NodeID>, children: NodeID[]): CGraphOp<MNodes> => {
    const nodes: CTNode[] = [];
    const edges: Edge[] = [];

    const childId = insertArray(top, nodes, edges, children);
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

export const c_handleInsertText = (top: CTop, path: Path, pos: 'before' | 'after' | number, what: KeyWhat) => {};

export const c_replaceAt = (path: NodeID[], top: CTop, old: NodeID, ...locs: NodeID[]): CUpdate[] => {
    if (locs.length === 1 && old === locs[0]) return [];
    if (path.length === 0) {
        const root = top.graph.getEdge('root', 'root');
        if (old !== root.end.id) {
            throw new Error(`expected ${old} to be root of top, but found ${root.end.id}`);
        }
        if (locs.length !== 1) {
            throw new Error(`cant multi-replace at the toplevel ... not yet`);
        }
        return [replaceEdges([root.edge.del(top.ts())], top.graph.rootEdge(top.ts(), locs[0]))];
    }

    // const ploc = path[path.length - 1];
    // const pnode = top.nodes[ploc];
    return c_replaceIn(top, top.graph.nodes[path[path.length - 1]], old, ...locs);
    // return [];
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
        children[at] = locs[0];
        for (let i = 1; i < locs.length; i++) {
            children.splice(at + i, 0, locs[i]);
        }
        return { ...node, children };
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
