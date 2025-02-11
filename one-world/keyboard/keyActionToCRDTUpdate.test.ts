import { c_handleInsertList, c_setIdText, CTop, justOps } from './keyActionToCRDTUpdate';
import { CGraph, Edge } from './update/crdt/cgraph';
import { MCons, MId, MList, MListKind } from './update/crdt/crdtnodes';

const ticker = () => {
    let i = 0;
    return () => i++ + '';
};

test('a graph mayb', () => {
    const ctop: CTop = { ts: ticker(), graph: new CGraph({}, {}) };
    const first = ctop.ts();
    ctop.graph = ctop.graph.merge_ops([
        {
            type: 'cgraph:add-nodes',
            nodes: [new MId(first, { text: '', ccls: -1 }, ctop.ts())],
            edges: [],
        },
        { type: 'cgraph:replace-edges', edges: [], edge: ctop.graph.rootEdge(ctop.ts(), first) },
    ]);

    expect(ctop.graph.getRoot().construct(ctop.graph.getEdge)).toEqual({
        type: 'id',
        text: '',
        loc: first,
        ccls: -1,
    });

    ctop.graph = ctop.graph.merge_ops(justOps(c_handleInsertList(ctop, { root: { ids: [], top: '' }, children: [first] }, 0, 'round')));

    expect(ctop.graph.getRoot().construct(ctop.graph.getEdge)).toEqual({
        type: 'list',
        kind: 'round',
        children: [first],
        loc: '3',
    });

    ctop.graph = ctop.graph.merge_ops(justOps(c_setIdText(ctop, { root: { ids: [], top: '' }, children: ['3', first] }, 'hi', 2)));

    expect(ctop.graph.getNode(first)).toEqual({
        type: 'id',
        text: 'hi',
        loc: first,
        ccls: -1,
    });

    // g = g.merge_ops([

    //     {
    //         type: 'cgraph:replace-edges',
    //         edges: [new Edge('e2', { id: 'list', attr: 'children' }, 'cons', ts())],
    //         edge: new Edge('e5', { id: 'list', attr: 'children' }, 'a'),
    //     },
    // ]);
    // const got2 = g.getNode('list');
    // expect(got2).toEqual({ type: 'list', kind: 'round', children: ['a'], loc: 'list' });
});
