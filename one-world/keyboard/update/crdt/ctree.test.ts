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
import { CId, CList, CNode, CTree, insert, insertArray, isMain, Op, ParentOp } from './ctree';
import { CTop, ctreeUpdate, justOps, Up } from './ctree-update';

export type CTState = { ctop: CTop; top: Top; sel: NodeSelection };

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

const showOp = (op: Up) => {
    if (op instanceof ParentOp) {
        if (!op.parent.value) return `[x parent] ${op.node}`;
        return `[parent] ${op.node} -> ${op.parent.value?.parent}.${op.parent.value?.attr}`;
    }
    if ('type' in op) return `sel:${op.type}`;
    return op.id + ' : ' + op.show();
};

export const applyCTreeUpdate = (state: CTState, updates: KeyAction[] | null | void, debug = false) => {
    if (!updates) return state;
    // debug = true;

    updates.forEach((up) => {
        const ups = ctreeUpdate(state.ctop, up, state.sel);
        if (!ups) return debug ? console.log('NO UPDATES') : null;
        if (debug) console.log(ups.map(showOp).join('\n'));
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

    if (debug) {
        console.log(
            'show nodes',
            state.ctop.tree.ids().map((id) => state.ctop.tree.node(id)?.show()),
        );
        console.log('parents', state.ctop.tree.showParents());
        console.log('nodes', state.ctop.tree.asNodes());
    }
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
    const add = (i: string | undefined, seen: string[] = []) => {
        if (!i) return;
        if (i === 'root') {
            if (!touched.includes(i)) touched.push(i);
            return;
        }
        if (seen.includes(i)) return;
        const node = tree.node(i);
        if (node && !isMain(node)) {
            const cseen = seen.concat([i]);
            add(tree.parent(i)?.parent, cseen);
            return;
        }
        if (!touched.includes(i)) touched.push(i);
    };
    ups.forEach((up) => {
        if (up instanceof ParentOp) {
            if (up.parent.value) {
                add(up.parent.value.parent);
            }
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
