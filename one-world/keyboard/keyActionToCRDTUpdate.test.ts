import { ccheck, ticker } from './crdt-check.test';
import { full, initial, op, pathWith } from './ctdt-test-utils';
import { c_handleInsertList, c_setIdText, CTop, insertRoot, justOps } from './keyActionToCRDTUpdate';
import { id, idc, list, round, smoosh, spaced, square } from './test-utils';
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

test('b wrap', () => {
    const state = initial(square([id('', true)]), idc(0));
    op(state, keyUpdate(state, '(', {}));
    ccheck(state, square([round([id('', true)])]), idc(0));
});

test('trwrap', () => {
    const state = initial(square([id('a'), id('', true)]), idc(0));
    op(state, keyUpdate(state, '(', {}));
    ccheck(state, square([id('a'), round([id('', true)])]), idc(0));
});

test('trwrap2', () => {
    const state = initial(square([id('', true), id('a')]), idc(0));
    op(state, keyUpdate(state, '(', {}));
    ccheck(state, square([round([id('', true)]), id('a')]), idc(0));
});

test('gotta spance', () => {
    const state = initial(round([id('hi', true)]), idc(2));
    op(state, keyUpdate(state, ',', {}));
    ccheck(state, round([id('hi'), id('', true)]), idc(0));
});

test('gotta starp', () => {
    const state = initial(round([id('hi', true)]), idc(0));
    op(state, keyUpdate(state, ',', {}));
    ccheck(state, round([id(''), id('hi', true)]), idc(0));
});

test('gotta midp', () => {
    const state = initial(round([id('hilo', true)]), idc(2));
    op(state, keyUpdate(state, ',', {}));
    ccheck(state, round([id('hi'), id('lo', true)]), idc(0));
});

test('gotta starp', () => {
    const state = initial(round([id('hi', true)]), idc(0));
    op(state, keyUpdate(state, ',', {}));
    ccheck(state, round([id(''), id('hi', true)]), idc(0));
});

test('gotta smoop', () => {
    const state = initial(smoosh([id('hi', true)]), idc(2));
    op(state, keyUpdate(state, '.', {}));
    ccheck(state, smoosh([id('hi'), id('.', true)]), idc(0));
});

test('gotta smoop mid', () => {
    const state = initial(smoosh([id('hilo', true)]), idc(2));
    op(state, keyUpdate(state, '.', {}));
    ccheck(state, smoosh([id('hi'), id('.', true), id('lo')]), idc(0));
});

test('new smoop', () => {
    const state = initial(id('hilo', true), idc(2));
    op(state, keyUpdate(state, '.', {}));
    ccheck(state, smoosh([id('hi'), id('.', true), id('lo')]), idc(0));
});

test.skip('splitIn two layer', () => {
    const state = initial(round([spaced([id('hi', true), id('lo')])]), idc(2));
    op(state, keyUpdate(state, ',', {}));
    ccheck(state, round([id('hi'), id('lo', true)]), idc(0));
});

// test('after slist', () => {
//     const state = initial(round([spaced([id('hi', true), id('lo')])]), idc(2));
//     op(state, keyUpdate(state, ',', {}));
//     ccheck(state, round([id('hi'), id('lo', true), ]), idc(0));
// });
