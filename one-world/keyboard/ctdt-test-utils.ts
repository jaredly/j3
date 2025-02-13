import { RecNodeT, NodeID, ListKind, Node, mapLocs } from '../shared/cnodes';
import { applySelUp } from './applyUpdate';
import { CTState, ticker } from './crdt-check.test';
import { isTag } from './handleNav';
import { CTop, CUpdate, justOps, justUps, keyActionToUpdate, replaceEdges } from './keyActionToCRDTUpdate';
import { KeyAction } from './keyActionToUpdate';
import { CGraph, rootEdge } from './update/crdt/cgraph';
import { MOp, MId, MList, MCons, MListKind, MListTag, isMain } from './update/crdt/crdtnodes';
import { graphToXMLs, showXMLs } from './update/crdt/show-graph';
import { Cursor, NodeSelection, Path, selStart, Top } from './utils';

// NOTE: these ids better be different y'all
export const insert = (top: CTop, node: RecNodeT<NodeID>): MOp[] => {
    if (!node.loc) node.loc = top.ts();
    switch (node.type) {
        case 'id':
            return [MId.insert(top.ts, node)];
        case 'list':
            let ops: MOp[] = [];
            let kind: ListKind<NodeID>;
            if (typeof node.kind === 'object' && node.kind.type === 'tag') {
                ops.push(...insert(top, node.kind.node));
                if (node.kind.attributes) {
                    ops.push(...insert(top, node.kind.attributes));
                }
                kind = { ...node.kind, node: node.kind.node.loc, attributes: node.kind.attributes?.loc };
            } else {
                kind = node.kind;
            }
            const children = node.children.map((child) => {
                ops.push(...insert(top, child));
                return child.loc;
            });
            return [...ops, ...MList.insert(top.ts, { ...node, kind, children })];
        default:
            throw new Error('not doin it');
    }
};

export const expand = (top: CTop, node: Node): RecNodeT<NodeID> => {
    switch (node.type) {
        case 'id':
            return node;
        case 'list':
            const children = node.children.map((child) => expand(top, top.graph.getNode<Node>(child)!));
            const kind: ListKind<RecNodeT<NodeID>> = isTag(node.kind)
                ? {
                      type: 'tag',
                      node: expand(top, top.graph.getNode<Node>(node.kind.node)!),
                      attributes: node.kind.attributes ? expand(top, top.graph.getNode(node.kind.attributes)!) : undefined,
                  }
                : node.kind;
            return { ...node, kind, children };
    }
    throw new Error('not uyet[');
};

export const full = (top: CTop) => {
    return expand(top, top.graph.getRoot().construct(top.graph.getEdge));
};

// TODO: do the `asTopAndLocs` trick, but maybe only ... idk
// OK actually let's separate it.
// ONE PASS: rewrite the recnode with new Locs, and track the paths.
// THEN: use initial() to make the Ops. Love it.
export const initial = (
    iroot: RecNodeT<boolean | number | null> = { type: 'id', text: '', loc: true },
    cursor: Cursor = { type: 'id', end: 0 },
    endCursor?: Cursor,
): CTState => {
    const ts = ticker();
    // const id = new MId(ts(), { text: '' });
    const ctop: CTop = { ts, graph: new CGraph({}, {}) };

    const { sels, root } = withLocs(iroot, ts);
    if (!sels[1]) throw new Error(`nothing selected?`);
    const sel: NodeSelection = {
        start: selStart(pathWith(sels[1]), cursor),
        end: endCursor ? selStart(pathWith(sels[2] ?? sels[1]), endCursor) : undefined,
    };

    ctop.graph = ctop.graph.merge_ops([...insert(ctop, root), replaceEdges([], rootEdge(ts(), root.loc))]);

    return { ctop, top: asTop(ctop), sel };
};

const asTop = (ctop: CTop) => {
    const root = ctop.graph.getEdge('root', 'root');
    const top: Top = {
        nextLoc: 0,
        nodes: {},
        root: root.edge.dest,
    };
    Object.values(ctop.graph.nodes).forEach((mnode) => {
        top.nodes[mnode.id] = mnode.construct(ctop.graph.getEdge) as Node;
    });
    return top;
};

const touchedNodes = (ups: CUpdate[], graph: CTState['ctop']['graph']): string[] => {
    const touched: string[] = [];
    const add = (i: string, seen: string[] = []) => {
        if (i === 'root') {
            if (!touched.includes(i)) touched.push(i);
            return;
        }
        if (seen.includes(i)) return;
        const node = graph.nodes[i];
        if (!isMain(node)) {
            const cseen = seen.concat([i]);
            graph.edgeTo[node.id]?.forEach((eid) => {
                add(graph.edges[eid].source.id, cseen);
            });
            return;
        }
        if (!touched.includes(i)) touched.push(i);
    };
    justOps(ups).forEach((up) => {
        switch (up.type) {
            case 'cgraph:add-nodes':
                up.nodes.forEach((node) => add(node.id));
                break;
            case 'cgraph:node':
                add(up.node.id);
                break;
            case 'cgraph:replace-edges':
                add(up.edge.source.id);
                break;
        }
    });
    return touched;
};

const updateTop = (state: CTState, ups: CUpdate[]) => {
    touchedNodes(ups, state.ctop.graph).forEach((id) => {
        if (id === 'root') {
            state.top.root = state.ctop.graph.getRoot().id;
            return;
        }
        state.top.nodes[id] = state.ctop.graph.getNode(id) as Node;
        // console.log('up', id, state.top.nodes[id]);
    });
};

export const op = (state: CTState, updates: KeyAction[] | void, debug = false) => {
    if (!updates) return;
    const ups = updates.map((up) => keyActionToUpdate(state.ctop, up) ?? []).flat();
    if (debug) console.log(ups.map((up) => up.type + ' : ' + JSON.stringify(up)).join('\n'));
    if (debug) console.log(showXMLs(graphToXMLs(state.ctop.graph)));
    state.ctop.graph = state.ctop.graph.merge_ops(justOps(ups));
    if (debug) console.log(showXMLs(graphToXMLs(state.ctop.graph)));
    justUps(ups).forEach((up) => {
        state.sel = applySelUp(state.sel, up);
    });
    updateTop(state, ups);
};

export const pathWith = (children: string[]): Path => ({ root: { ids: [], top: '' }, children });

export const withLocs = (root: RecNodeT<boolean | number | null>, ts: () => string) => {
    const sels: Record<number, NodeID[]> = {};
    const tx = mapLocs<boolean | number | null, string>(root, (l, _, path) => {
        const loc = ts();
        if (l) {
            sels[l === true ? 1 : l] = path.concat([loc]);
        }
        return loc;
    });
    return { sels, root: tx };
};
