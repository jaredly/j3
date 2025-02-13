import { ccheck, ticker } from './crdt-check.test';
import { full, initial, op, pathWith } from './ctdt-test-utils';
import { c_handleInsertList, c_setIdText, CTop, insertRoot, justOps } from './keyActionToCRDTUpdate';
import { id, idc, list, round } from './test-utils';
import { keyUpdate } from './ui/keyUpdate';
import { CGraph } from './update/crdt/cgraph';
import { MId } from './update/crdt/crdtnodes';
import { graphToXMLs, showXMLs } from './update/crdt/show-graph';

test('a graph mayb', () => {
    const ctop: CTop = { ts: ticker(), graph: new CGraph({}, {}) };
    const first = ctop.ts();
    ctop.graph = ctop.graph.merge_ops(insertRoot([new MId(first, { text: '' }, ctop.ts())], [], ctop.ts()));

    expect(full(ctop)).toEqual(id('', first));

    ctop.graph = ctop.graph.merge_ops(justOps(c_handleInsertList(ctop, pathWith([first]), 0, 'round')));

    expect(full(ctop)).toEqual(list('round')([id('', first)], '003'));

    ctop.graph = ctop.graph.merge_ops(justOps(c_setIdText(ctop, pathWith(['003', first]), 'hi', 2, 0)));

    expect(ctop.graph.getNode(first)).toEqual({
        type: 'id',
        text: 'hi',
        loc: first,
        ccls: 0,
    });
});

test('doing some key actions now', () => {
    const state = initial();

    op(state, keyUpdate(state, 'h', {}));
    op(state, keyUpdate(state, 'e', {}));
    op(state, keyUpdate(state, 'l', {}));

    expect(full(state.ctop)).toEqual(id('hel', '000'));
});

test('one letter', () => {
    const state = initial(id('', true), idc(0));
    op(state, keyUpdate(state, 'n', {}));
    ccheck(state, id('n', true), idc(1));
});

test('two letters', () => {
    const state = initial(round([id('a', true)]), idc(0));
    op(state, keyUpdate(state, 'n', {}));
    ccheck(state, round([id('na', true)]), idc(1));
});

test('three letters', () => {
    const state = initial(round([id('ha'), id('ho', true)]), idc(2));
    op(state, keyUpdate(state, 'n', {}));
    ccheck(state, round([id('ha'), id('hon', true)]), idc(3));
});

test('a wrap', () => {
    const state = initial(id('', true), idc(0));
    op(state, keyUpdate(state, '(', {}));
    ccheck(state, round([id('', true)]), idc(0));
});
