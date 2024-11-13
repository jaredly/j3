// let's test some operations

import { fromMap, fromRec, Id, ListKind, Nodes, NodeT, RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { Cursor, IdCursor, replaceAt, selStart, Top } from './lisp';
import { splitSmoosh } from './splitSmoosh';
import { TestState } from './test-utils';
import { validate } from './validate';

// Classes of keys

/// IDkeys
const allkeys = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM~!@#$%^&*()_+{}|:"<>?`-=[]\\;\',./';

const lisp = {
    tight: '.=#@;+',
    space: '',
    sep: ' ',
};
const js = {
    tight: '~`!@#$%^&*_+-=\\./?:',
    space: ' ',
    sep: ';,\n',
};

// kinds of keys:
// - tight
// - space
// - sep
// - id (everything else)

const config = lisp;

const idkeys = [...allkeys].filter((k) => !config.tight.includes(k) && !config.space.includes(k) && !config.sep.includes(k));

// MARK: makers

const id = <T>(text: string, loc: T = null as T): Id<T> => ({ type: 'id', text, loc });
const list =
    (kind: ListKind<RecNodeT<unknown>>) =>
    <T>(children: RecNodeT<T>[], loc: T = null as T): RecNodeT<T> => ({
        type: 'list',
        kind: kind as ListKind<RecNodeT<T>>,
        children,
        loc,
    });
const smoosh = list('smooshed');
const spaced = list('spaced');
const round = list('round');

// MARK: tests

const asTop = (node: RecNodeT<boolean>, cursor: Cursor): TestState => {
    const nodes: Nodes = {};
    let nextLoc = 0;
    let sel: number[] = [];
    const root = fromRec(node, nodes, (l, node, path) => {
        const loc = nextLoc++;
        if (l) {
            sel = path.concat([loc]);
        }
        return loc;
    });
    return {
        top: { nextLoc, nodes, root },
        sel: {
            start: selStart({ children: sel, root: { ids: [], top: '' } }, cursor),
        },
    };
};

const testSplit = (init: RecNodeT<boolean>, cursor: IdCursor, out: RecNodeT<unknown>) => {
    let state = asTop(init, cursor);
    const up = splitSmoosh(state.top, state.sel.start.path, state.sel.start.cursor as IdCursor, '.');
    state = applyUpdate(state, up);
    // console.log(JSON.stringify(state, null, 2));
    validate(state);
    expect(shape(out)).toEqual(shape(fromMap(state.top.root, state.top.nodes, () => 0)));
};

test('smoosh start (round)', () => {
    testSplit(
        //
        round([id('hello', true)]),
        { type: 'id', end: 0 },
        round([smoosh([id('.'), id('hello')])]),
    );
});

test('smoosh mid (round)', () => {
    testSplit(
        //
        round([id('hello', true)]),
        { type: 'id', end: 3 },
        round([smoosh([id('hel'), id('.'), id('lo')])]),
    );
});

test('smoosh end (round)', () => {
    testSplit(
        //
        round([id('hello', true)]),
        { type: 'id', end: 5 },
        round([smoosh([id('hello'), id('.')])]),
    );
});

test('smoosh start (smoosh)', () => {
    testSplit(
        //
        round([smoosh([id('hello', true), id('.')])]),
        { type: 'id', end: 0 },
        round([smoosh([id('.'), id('hello'), id('.')])]),
    );
});

test('smoosh start join (smoosh)', () => {
    testSplit(
        //
        round([smoosh([id('+'), id('hello', true), id('.')])]),
        { type: 'id', end: 0 },
        round([smoosh([id('+.'), id('hello'), id('.')])]),
    );
});

test('smoosh start list (smoosh)', () => {
    testSplit(
        //
        round([smoosh([round([]), id('hello', true), id('.')])]),
        { type: 'id', end: 0 },
        round([smoosh([round([]), id('.'), id('hello'), id('.')])]),
    );
});

test('smoosh mid (smoosh)', () => {
    testSplit(
        //
        round([smoosh([id('hello', true), id('.')])]),
        { type: 'id', end: 3 },
        round([smoosh([id('hel'), id('.'), id('lo'), id('.')])]),
    );
});

test('smoosh end (smoosh)', () => {
    testSplit(
        //
        round([smoosh([id('.'), id('hello', true)])]),
        { type: 'id', end: 5 },
        round([smoosh([id('.'), id('hello'), id('.')])]),
    );
});

test('smoosh end join (smoosh)', () => {
    testSplit(
        //
        round([smoosh([id('.'), id('hello', true), id('+')])]),
        { type: 'id', end: 5 },
        round([smoosh([id('.'), id('hello'), id('.+')])]),
    );
});

test('smoosh end list (smoosh)', () => {
    testSplit(
        //
        round([smoosh([id('.'), id('hello', true), round([])])]),
        { type: 'id', end: 5 },
        round([smoosh([id('.'), id('hello'), id('.'), round([])])]),
    );
});
