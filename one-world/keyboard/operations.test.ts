// let's test some operations

import { fromMap, fromRec, Id, ListKind, Nodes, RecNodeT, RecText, Text, TextSpan } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { Config, handleListKey, handleTextKey, insertId } from './insertId';
import { Cursor, getCurrent, IdCursor, lastChild, CollectionCursor, ListWhere, selStart, Update } from './utils';
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

const idkeys = (config: Config) => [...allkeys].filter((k) => !config.tight.includes(k) && !config.space.includes(k) && !config.sep.includes(k));

const lispId = idkeys(lisp);
const jsId = idkeys(js);

// kinds of keys:
// - tight
// - space
// - sep
// - id (everything else)

// MARK: makers

const id = <T>(text: string, loc: T = null as T): Id<T> => ({
    type: 'id',
    text,
    loc,
    punct: text.length === 0 ? undefined : [...text].some((k) => lisp.tight.includes(k)),
});
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
const text = <T>(spans: TextSpan<RecNodeT<T>>[], loc: T = null as T): RecText<T> => ({ type: 'text', loc, spans });

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

const handleKey = (state: TestState, key: string, config: Config): Update | void => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'id':
            return insertId(config, state.top, state.sel.start.path, current.cursor, key);
        case 'list':
            return handleListKey(config, state.top, state.sel.start.path, current.cursor, key);
        case 'text':
            return handleTextKey(config, state.top, state.sel.start.path, current.cursor, key);
        default:
            throw new Error('not doing');
    }
};

const testId = (init: RecNodeT<boolean>, cursor: IdCursor, out: RecNodeT<unknown>, text = '.') => {
    let state = asTop(init, cursor);
    const up = insertId(lisp, state.top, state.sel.start.path, state.sel.start.cursor as IdCursor, text);
    state = applyUpdate(state, up);
    // console.log(JSON.stringify(state, null, 2));
    validate(state);
    expect(shape(out)).toEqual(shape(fromMap(state.top.root, state.top.nodes, () => 0)));
};

const root = (state: TestState) => {
    let nodes = state.top.nodes;
    if (state.sel.start.cursor.type === 'id' && state.sel.start.cursor.text) {
        const loc = lastChild(state.sel.start.path);
        const node = nodes[loc];
        if (node.type === 'id') {
            nodes = { ...nodes, [loc]: { ...node, text: state.sel.start.cursor.text.join('') } };
        }
    }
    return fromMap(state.top.root, nodes, () => 0);
};

const idc = (end: number): IdCursor => ({ type: 'id', end });
const listc = (where: ListWhere): CollectionCursor => ({ type: 'list', where });

// MARK: ID spaced

test('id mid', () => {
    let state = asTop(id('abc', true), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id('a'), id('bc')])));
});

test('id start', () => {
    let state = asTop(id('abc', true), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id(''), id('abc')])));
});

test('id end', () => {
    let state = asTop(id('abc', true), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id('abc'), id('')])));
});

test('round start', () => {
    let state = asTop(round([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id(''), round([])])));
});

test('round end', () => {
    let state = asTop(round([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([round([]), id('')])));
});

test('text start', () => {
    let state = asTop(text([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id(''), text([])])));
});

test('text end', () => {
    let state = asTop(text([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([text([]), id('')])));
});

// MARK: Text smooshed

test('text before', () => {
    let state = asTop(text([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(smoosh([id('A'), text([])])));
});

test('text after', () => {
    let state = asTop(text([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(smoosh([text([]), id('A')])));
});

// MARK: List smooshed, right?

test('list before pls', () => {
    let state = asTop(round([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(smoosh([id('A'), round([])])));
});

test('list after', () => {
    let state = asTop(round([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(smoosh([round([]), id('A')])));
});

test('list smoosh end', () => {
    let state = asTop(smoosh([id('a'), round([], true)]), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(smoosh([id('a'), round([]), id('A')])));
});

test('list smoosh start', () => {
    let state = asTop(smoosh([round([], true), id('a')]), listc('before'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(smoosh([id('A'), round([]), id('a')])));
});

test('list insidesss', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(round([id('A')])));
});

test('between twoo', () => {
    let state = asTop(smoosh([round([], true), round([])]), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(smoosh([round([]), id('A'), round([])])));
});

// MARK: Insert ID

test('same kind', () => {
    let state = asTop(id('hello', true), idc(2));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    expect(shape(root(state))).toEqual(shape(id('heAllo')));
});

test('same kind punct', () => {
    let state = asTop(id('...', true), idc(2));
    state = applyUpdate(state, handleKey(state, '=', lisp)!);
    expect(shape(root(state))).toEqual(shape(id('..=.')));
});

test('start empty', () => {
    let state = asTop(id('', true), idc(0));
    state = applyUpdate(state, handleKey(state, '=', lisp)!);
    expect(shape(root(state))).toEqual(shape(id('=')));
});

test('and smoosh', () => {
    let state = asTop(id('ab', true), idc(0));
    state = applyUpdate(state, handleKey(state, '=', lisp)!);
    expect(shape(root(state))).toEqual(shape(smoosh([id('='), id('ab')])));
});

// MARK: Split smoosh

test('smoosh start (round)', () => {
    testId(
        //
        round([id('hello', true)]),
        { type: 'id', end: 0 },
        round([smoosh([id('.'), id('hello')])]),
    );
});

test('smoosh mid (round)', () => {
    testId(
        //
        round([id('hello', true)]),
        { type: 'id', end: 3 },
        round([smoosh([id('hel'), id('.'), id('lo')])]),
    );
});

test('smoosh end (round)', () => {
    testId(
        //
        round([id('hello', true)]),
        { type: 'id', end: 5 },
        round([smoosh([id('hello'), id('.')])]),
    );
});

test('smoosh start (smoosh)', () => {
    testId(
        //
        round([smoosh([id('hello', true), id('.')])]),
        { type: 'id', end: 0 },
        round([smoosh([id('.'), id('hello'), id('.')])]),
    );
});

test('smoosh start join (smoosh)', () => {
    testId(
        //
        round([smoosh([id('+'), id('hello', true), id('.')])]),
        { type: 'id', end: 0 },
        round([smoosh([id('+.'), id('hello'), id('.')])]),
    );
});

test('smoosh start list (smoosh)', () => {
    testId(
        //
        round([smoosh([round([]), id('hello', true)])]),
        { type: 'id', end: 0 },
        round([smoosh([round([]), id('.'), id('hello')])]),
    );
});

test('smoosh mid (smoosh)', () => {
    testId(
        //
        round([smoosh([id('hello', true), id('.')])]),
        { type: 'id', end: 3 },
        round([smoosh([id('hel'), id('.'), id('lo'), id('.')])]),
    );
});

test('smoosh end (smoosh)', () => {
    testId(
        //
        round([smoosh([id('.'), id('hello', true)])]),
        { type: 'id', end: 5 },
        round([smoosh([id('.'), id('hello'), id('.')])]),
    );
});

test('smoosh end join (smoosh)', () => {
    testId(
        //
        round([smoosh([id('.'), id('hello', true), id('+')])]),
        { type: 'id', end: 5 },
        round([smoosh([id('.'), id('hello'), id('.+')])]),
    );
});

test('smoosh end list (smoosh)', () => {
    testId(
        //
        round([smoosh([id('hello', true), round([])])]),
        { type: 'id', end: 5 },
        round([smoosh([id('hello'), id('.'), round([])])]),
    );
});

test('comment out', () => {
    testId(
        //
        id('hello', true),
        { type: 'id', end: 0 },
        smoosh([id(';'), id('hello')]),
        ';',
    );
});
