// Roughen

import { ListKind, Node, RecNodeT } from '../shared/cnodes';
import { rough, flatten, collapseAdjacentIDs, NodeAndCursor, pruneEmptyIds } from './rough';
import { asTop, atPath, id, idc, round, selPath, smoosh, spaced } from './test-utils';
import { root } from './root';
import { lastChild } from './utils';
import { shape } from '../shared/shape';
import { Flat } from './flatenate';

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

test('collapse adjacent noop', () => {
    const hi = id('hi', 1);
    const sel: NodeAndCursor = { node: hi, cursor: idc(0) };
    expect(collapseAdjacentIDs([hi], sel)).toEqual({ items: [hi], selection: sel });
});

test('collapse adjacent two', () => {
    const hi = id('hi', 1);
    const sel: NodeAndCursor = { node: hi, cursor: idc(0) };
    const hiho = id('hiho', 1);
    expect(collapseAdjacentIDs([hi, id('ho', -1)], sel)).toEqual({ items: [hiho], selection: { ...sel, node: hiho } });
});

test('collapse adjacent across smush', () => {
    const hi = id('hi', 1);
    const sel: NodeAndCursor = { node: hi, cursor: idc(0) };
    const hiho = id('hiho', 1);
    expect(collapseAdjacentIDs([hi, { type: 'smoosh', loc: -1 }, id('ho', -1)], sel)).toEqual({
        items: [hiho, { type: 'smoosh', loc: -1 }],
        selection: { ...sel, node: hiho },
    });
});

test('collapse adjacent after ', () => {
    const hi = id('hi', 1);
    const sel: NodeAndCursor = { node: hi, cursor: idc(0) };
    const hiho = id('hohi', 1);
    expect(collapseAdjacentIDs([id('ho', -1), hi], sel)).toEqual({
        items: [hiho],
        selection: { cursor: idc(2), node: hiho },
    });
});

const fround = (children: number[], loc = -1): Node => ({ type: 'list', kind: 'round', children, loc });

test('collapse adjacent after ', () => {
    const hi = id('hi', 1);
    const sel: NodeAndCursor = { node: hi, cursor: idc(0) };
    const hiho = id('hohi', 1);
    expect(collapseAdjacentIDs([id('ho', -1), hi, fround([]), id('a')], sel)).toEqual({
        items: [hiho, fround([]), id('a')],
        selection: { cursor: idc(2), node: hiho },
    });
});

// MARK: Prune

test('prune nonsel', () => {
    const hi = id('hi', 1);
    expect(pruneEmptyIds([hi, id('ho'), id('')], { node: hi, cursor: idc(0) })).toEqual({
        items: [hi, id('ho')],
        selection: { node: hi, cursor: idc(0) },
    });
});

test('prune sel', () => {
    const hi = id('', 1);
    const ho = id('ho', 2);
    expect(pruneEmptyIds([hi, ho, id('')], { node: hi, cursor: idc(0) })).toEqual({
        items: [ho],
        selection: { node: ho, cursor: idc(0) },
    });
});

test('prune sel after', () => {
    const hi = id('', 1);
    const ho = id('ho', 2);
    expect(pruneEmptyIds([ho, hi, id('')], { node: hi, cursor: idc(0) })).toEqual({
        items: [ho],
        selection: { node: ho, cursor: idc(2) },
    });
});

const smsh: Flat = { type: 'smoosh', loc: -1 };
const spc: Flat = { type: 'space', loc: -1 };

test('prune sel with smoosh', () => {
    const hi = id('', 1);
    const ho = id('ho', 2);
    expect(pruneEmptyIds([ho, smsh, hi, id('')], { node: hi, cursor: idc(0) })).toEqual({
        items: [ho, smsh],
        selection: { node: ho, cursor: idc(2) },
    });
});

test('dont prune sel with space', () => {
    const hi = id('', 1);
    const ho = id('ho', 2);
    expect(pruneEmptyIds([ho, spc, hi], { node: hi, cursor: idc(0) })).toEqual({
        items: [ho, spc, hi],
        selection: { node: hi, cursor: idc(0) },
    });
});

// MARK: thingssss

test('ok folks', () => {});
