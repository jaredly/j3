// Roughen

import { ListKind, Node, RecNodeT } from '../shared/cnodes';
import { rough, flatten } from './rough';
import { asTop, atPath, id, idc, round, selPath, smoosh, spaced } from './test-utils';
import { root } from './root';
import { lastChild } from './utils';
import { shape } from '../shared/shape';

// First, we flat

test('flat', () => {
    const { top } = asTop(id('', true), idc(0));
    const n = top.nodes;
    expect(flatten(n[top.root], top)).toEqual([n[0]]);
});

test('simple round', () => {
    const { top } = asTop(round([id('', true)]), idc(0));
    const n = top.nodes;
    expect(flatten(n[top.root], top)).toEqual([n[1]]);
});

test('all three levels', () => {
    const { top } = asTop(round([id('', true), id(''), spaced([id(''), smoosh([id('a'), id('+')])])]), idc(0));
    const n = top.nodes;
    expect(flatten(n[top.root], top)).toEqual([
        n[1],
        { loc: 0, type: 'sep' },
        n[2],
        { loc: 0, type: 'sep' },
        n[4],
        { loc: 3, type: 'space' },
        n[6],
        { loc: 5, type: 'smoosh' },
        n[7],
    ]);
});

const hobbit = (node: RecNodeT<boolean>) => {
    const { top, sel } = asTop(node, idc(0));
    const n = top.nodes;
    const fl = flatten(n[top.root], top);
    const r = rough(fl, top, top.nodes[lastChild(sel.start.path)], top.root);
    expect(root({ top: { ...top, nodes: { ...top.nodes, ...r.nodes } }, sel })).toEqual(root({ top, sel }));
};

const check = (node: RecNodeT<boolean>, exp: RecNodeT<boolean>) => {
    const { top, sel } = asTop(node, idc(0));
    const n = top.nodes;
    const fl = flatten(n[top.root], top);
    const r = rough(fl, top, top.nodes[lastChild(sel.start.path)], top.root);

    const two = asTop(exp, idc(0));
    expect(shape(root({ top: { ...top, nodes: { ...top.nodes, ...r.nodes }, root: r.root, nextLoc: r.nextLoc }, sel }))).toEqual(shape(root(two)));
    expect(r.selPath).toEqual(atPath(r.root, { ...top, nodes: { ...top.nodes, ...r.nodes } }, selPath(exp)));
};

test('there and back again', () => {
    hobbit(round([id('', true)]));
});

test('there and back again', () => {
    hobbit(round([id('a', true), id('b')]));
});

test('there and back again space/smoosh', () => {
    hobbit(spaced([id('a', true), id('b')]));
    hobbit(smoosh([id('a', true), id('b')]));
});

test('all three levels', () => {
    hobbit(round([id('z'), spaced([id('a', true), smoosh([id('b'), id('c')])])]));
});

test('there and back again space and smoosh', () => {
    check(
        spaced([id('a', true), smoosh([id('c')])]),
        //
        spaced([id('a', true), id('c')]),
    );
});

test('collapse single space/smoosh', () => {
    check(
        spaced([smoosh([id('c', true)])]),
        //
        id('c', true),
    );
});

test('collapse single space/smoosh', () => {
    check(
        round([spaced([smoosh([id('c', true)])]), id('a')]),
        //
        round([id('c', true), id('a')]),
    );
});
