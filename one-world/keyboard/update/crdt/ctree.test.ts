import { fromRec, Node, Nodes, RecNodeT } from '../../../shared/cnodes';
import { shape } from '../../../shared/shape';
import { applySelUp } from '../../applyUpdate';
import { ticker } from '../../crdt-check.test';
import { fixTextSel, pathWith, withLocs } from '../../ctdt-test-utils';
import { isTag } from '../../handleNav';
import { KeyAction } from '../../keyActionToUpdate';
import { root } from '../../root';
import { id, idc, round } from '../../test-utils';
import { keyUpdate } from '../../ui/keyUpdate';
import { Cursor, NodeSelection, selStart, Top } from '../../utils';
import { LRW } from './crdt';
import { CId, CList, CNode, CTree, insertArray, isMain, Op, ParentOp } from './ctree';
import { CTop, ctreeUpdate, justOps } from './ctree-update';

export type CTState = { ctop: CTop; top: Top; sel: NodeSelection };

const insert = (node: Node, { ts, tree }: CTop): Op[] => {
    switch (node.type) {
        case 'id':
            return [new CId(node.loc, new LRW({ text: node.text, ccls: node.ccls }, node.loc), tree)];
        case 'list': {
            const result = insertArray(ts, tree, node.children);
            let kind = node.kind;
            const ops: Op[] = [];
            if (isTag(kind)) {
                ops.push(new ParentOp(kind.node, new LRW({ attr: 'tag', parent: node.loc }, node.loc)));
                if (kind.attributes) {
                    ops.push(new ParentOp(kind.attributes, new LRW({ attr: 'attributes', parent: node.loc }, node.loc)));
                }
                kind = { ...kind, node: '', attributes: '' };
            }
            return [
                new CList(node.loc, new LRW(node.kind, node.loc), new LRW(node.forceMultiline ?? null, node.loc), tree),
                ...result.ops,
                new ParentOp(result.head, new LRW({ attr: 'children', parent: node.loc }, node.loc)),
            ];
        }
    }
    throw new Error(`node type not yet ${node.type}`);
};

const asTop = (ctop: CTop) => {
    const roots = ctop.tree.children('root', 'root');
    if (roots.length > 1) throw new Error('multiple roots');
    if (!roots.length) throw new Error(`no root!!`);
    const top: Top = {
        nextLoc: 0,
        nodes: ctop.tree.asNodes(),
        root: roots[0],
    };
    return top;
};

export const applyCTreeUpdate = (state: CTState, updates: KeyAction[] | null | void, debug = false) => {
    if (!updates) return state;

    updates.forEach((up) => {
        const ups = ctreeUpdate(state.ctop, up, state.sel);
        if (!ups) return debug ? console.log('NO UPDATES') : null;
        // if (debug) console.log('\n# UPDATES\n' + ups.map(showOp).join('\n'));
        // if (debug) console.log('\n# PRE GRAPH\n' + showXMLs(graphToXMLs(state.ctop.graph)));
        state.ctop.tree.apply(justOps(ups));
        // state.ctop.graph = state.ctop.graph.merge_ops(justOps(ups));
        // if (debug) console.log('\n# POST GRAPH\n' + showXMLs(graphToXMLs(state.ctop.graph)));
        ups.forEach((up) => {
            if ('type' in up) {
                state.sel = applySelUp(state.sel, up);
            }
        });
        updateTop(state, justOps(ups));
    });

    // checkConflicts(state.ctop.graph);
    return state;
};

const updateTop = (state: CTState, ups: Op[]) => {
    touchedNodes(ups, state.ctop.tree).forEach((id) => {
        if (id === 'root') {
            state.top.root = state.ctop.tree.children('root', 'root')[0];
            return;
        }
        state.top.nodes[id] = (state.ctop.tree.node(id) as CNode).asNode();
    });
};

const touchedNodes = (ups: Op[], tree: CTree): string[] => {
    const touched: string[] = [];
    const add = (i: string, seen: string[] = []) => {
        if (i === 'root') {
            if (!touched.includes(i)) touched.push(i);
            return;
        }
        if (seen.includes(i)) return;
        const node = tree.node(i);
        if (node && !isMain(node)) {
            const cseen = seen.concat([i]);
            add(tree.parent(i).parent, cseen);
            return;
        }
        if (!touched.includes(i)) touched.push(i);
    };
    ups.forEach((up) => {
        if (up instanceof ParentOp) {
            add(up.parent.value.parent);
        } else {
            add(up.id);
        }
    });
    return touched;
};

export const initial = (iroot: RecNodeT<boolean | number | null>, cursor: Cursor, endCursor?: Cursor): CTState => {
    const ts = ticker();
    const ctop: CTop = { ts, tree: new CTree({}, {}) };

    const { sels, root } = withLocs(iroot, ts);
    if (!sels[1]) throw new Error(`nothing selected?`);
    const sel: NodeSelection = {
        start: selStart(pathWith(sels[1]), cursor),
        end: endCursor ? selStart(pathWith(sels[2] ?? sels[1]), endCursor) : undefined,
    };
    fixTextSel(sel.start);

    const nodes: Nodes = {};
    fromRec(root, nodes, (loc) => loc);
    Object.values(nodes).forEach((node) => ctop.tree.apply(insert(node, ctop)));
    ctop.tree.apply([new ParentOp(root.loc, new LRW({ attr: 'root', parent: 'root' }, ts()))]);

    return { ctop, top: asTop(ctop), sel };
};

// test('initial set up', () => {
//     const state = initial(round([id('hello', true), id('yes')]), idc(5));
//     expect(shape(root(state))).toEqual('(id(hello/0) id(yes/0))');
//     op(state, keyUpdate(state, 'n', {}));
//     expect(shape(root(state))).toEqual('(id(hellon/0) id(yes/0))');
// });
