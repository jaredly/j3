import { CGraph, Edge } from './cgraph';
import { MCons, MId, MList, MListKind } from './crdtnodes';

const ticker = () => {
    let i = 0;
    return () => i++ + '';
};

test('a graph mayb', () => {
    const ts = ticker();
    let g = new CGraph({}, {});
    g = g.merge_ops([
        {
            type: 'cgraph:add-nodes',
            nodes: [
                //
                new MList('list', null, ts()),
                new MListKind('lk', 'round', ts()),
                new MId('a', { text: 'A', ccls: 0 }, ts()),
                new MCons('cons'),
                new MId('c', { text: 'C', ccls: 0 }, ts()),
            ],
            edges: [
                //
                new Edge('e1', { id: 'list', attr: 'kind' }, 'lk'),
                new Edge('e2', { id: 'list', attr: 'children' }, 'cons'),
                new Edge('e3', { id: 'cons', attr: 'head' }, 'a'),
                new Edge('e4', { id: 'cons', attr: 'tail' }, 'c'),
            ],
        },
    ]);
    const got = g.getNode('list');
    expect(got).toEqual({ type: 'list', kind: 'round', children: ['a', 'c'], loc: 'list' });
    g = g.merge_ops([
        {
            type: 'cgraph:replace-edges',
            edges: [new Edge('e2', { id: 'list', attr: 'children' }, 'cons', ts())],
            edge: new Edge('e5', { id: 'list', attr: 'children' }, 'a'),
        },
    ]);
    const got2 = g.getNode('list');
    expect(got2).toEqual({ type: 'list', kind: 'round', children: ['a'], loc: 'list' });
});
