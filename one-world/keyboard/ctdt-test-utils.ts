import { RecNodeT, NodeID, ListKind, Node, mapLocs, fromRec, Nodes } from '../shared/cnodes';
import { applySelUp } from './applyUpdate';
import { CTState, ticker } from './CTState';
import { isTag } from './handleNav';
import { SelStart } from './handleShiftNav';
import { CTop, CUpdate, insertNode, justOps, justUps, keyActionToUpdate, replaceEdges } from './keyActionToCRDTUpdate';
import { KeyAction } from './keyActionToUpdate';
import { CGraph, checkConflicts, rootEdge } from './update/crdt/cgraph';
import { MOp, MId, MList, MCons, MListKind, MListTag, isMain, insertText, insertTextSpan } from './update/crdt/crdtnodes';
import { graphToXMLs, showXMLs } from './update/crdt/show-graph';
import { Cursor, NodeSelection, Path, pathKey, selStart, Top } from './utils';

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

export const fixTextSel = (sel: SelStart) => {
    if (sel.cursor.type === 'text' && sel.cursor.end.index === '') {
        sel.cursor.end.index = sel.path.children.pop()!;
        sel.key = pathKey(sel.path);
    }
    return sel;
};

export const initial = (
    iroot: RecNodeT<boolean | number | null> = { type: 'id', text: '', loc: true },
    cursor: Cursor = { type: 'id', end: 0 },
    endCursor?: Cursor,
): CTState => {
    const ts = ticker();
    const ctop: CTop = { ts, graph: new CGraph({}, {}) };

    const { sels, root } = withLocs(iroot, ts);
    if (!sels[1]) throw new Error(`nothing selected?`);
    const sel: NodeSelection = {
        start: selStart(pathWith(sels[1]), cursor),
        end: endCursor ? selStart(pathWith(sels[2] ?? sels[1]), endCursor) : undefined,
    };
    fixTextSel(sel.start);

    const nodes: Nodes = {};
    fromRec(root, nodes, (loc) => loc);
    const ops = Object.values(nodes).flatMap((node) => insertNode(ctop, node));

    ctop.graph = ctop.graph.merge_ops([...ops, replaceEdges([], rootEdge(ts(), root.loc))]);

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
    });
};

const showOp = (op: CUpdate) => {
    switch (op.type) {
        case 'cgraph:replace-edges':
            return `REPL ${op.edge.source.id}:${op.edge.source.attr} : ${op.edge.dest}(${op.edge.id}) <= (${op.edges
                .map((e) => `${e.dest}(${e.id})`)
                .join(', ')})`;
        case 'cgraph:add-nodes':
            return `ADD  ${op.nodes.map((n) => `${n.kind} ${n.id}`)}`;
        case 'cgraph:node':
            return `UPD  ${op.node.kind} ${op.node.id}`;
        default:
            return `selection(${op.type})`;
        // case 'move':
        // case 'unparent':
        // case 'addparent':
        // case 'id':
    }
};

export const op = (state: CTState, updates: KeyAction[] | void, debug = false) => {
    if (!updates) return;

    updates.forEach((up) => {
        const ups = keyActionToUpdate(state.ctop, up);
        if (!ups) return debug ? console.log('NO UPDATES') : null;
        if (debug) console.log('\n# UPDATES\n' + ups.map(showOp).join('\n'));
        if (debug) console.log('\n# PRE GRAPH\n' + showXMLs(graphToXMLs(state.ctop.graph)));
        state.ctop.graph = state.ctop.graph.merge_ops(justOps(ups));
        if (debug) console.log('\n# POST GRAPH\n' + showXMLs(graphToXMLs(state.ctop.graph)));
        justUps(ups).forEach((up) => {
            state.sel = applySelUp(state.sel, up);
        });
        updateTop(state, ups);
    });

    checkConflicts(state.ctop.graph);
};

export const pathWith = (children: string[]): Path => ({ root: { ids: [], top: '' }, children });

export const withLocs = (root: RecNodeT<boolean | number | null>, ts: () => string) => {
    const sels: Record<number, NodeID[]> = {};
    const tx = mapLocs<boolean | number | null, string>(root, (l, path) => {
        const loc = ts();
        if (l) {
            sels[l === true ? 1 : l] = path.concat([loc]);
        }
        return loc;
    });
    return { sels, root: tx };
};
