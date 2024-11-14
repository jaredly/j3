// let's test some operations

import { childLocs, childNodes, fromMap, fromRec, Id, ListKind, Nodes, RecNodeT, RecText, Text, TextSpan } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { Config, handleListKey, handleTextKey } from './insertId';
import { Cursor, getCurrent, IdCursor, CollectionCursor, ListWhere, selStart, Update, Top } from './utils';
import { TestState } from './test-utils';
import { validate } from './validate';
import { root } from './root';
import { handleIdKey } from './flatenate';

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
            return handleIdKey(config, state.top, state.sel.start.path, current.cursor, key);
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
    const up = handleKey(state, text, lisp);
    // const up = insertId(lisp, state.top, state.sel.start.path, state.sel.start.cursor as IdCursor, text);
    state = applyUpdate(state, up!);
    // console.log(JSON.stringify(state, null, 2));
    expect(shape(out)).toEqual(shape(fromMap(state.top.root, state.top.nodes, () => 0)));
};

const idc = (end: number): IdCursor => ({ type: 'id', end });
const listc = (where: ListWhere): CollectionCursor => ({ type: 'list', where });

// MARK: Now we see if this all paid off y'all

const atPath = (root: number, top: Top, path: number[]) => {
    const res: number[] = [root];
    path = path.slice();
    while (path.length) {
        root = childLocs(top.nodes[root])[path.shift()!];
        res.push(root);
    }
    return res;
};

const selPath = (exp: RecNodeT<boolean>) => {
    let found: number[] = [];
    const visit = (node: RecNodeT<boolean>, path: number[]) => {
        if (node.loc) {
            found = path;
            return;
        }
        childNodes(node).forEach((child, i) => visit(child, path.concat([i])));
    };
    visit(exp, []);
    return found;
};

const check = (state: TestState, exp: RecNodeT<boolean>, cursor: Cursor) => {
    expect(shape(root(state))).toEqual(shape(exp));
    expect(state.sel.start.path.children).toEqual(atPath(state.top.root, state.top, selPath(exp)));
    expect(state.sel.start.cursor).toEqual(cursor);
};

test('smoosh in space in sep', () => {
    let state = asTop(
        round([
            spaced([
                //
                id('1'),
                //
                smoosh([
                    //
                    id('+'),
                    id('a', true),
                    id('.'),
                    id('b'),
                ]),
                id('2'),
            ]),
        ]),
        idc(1),
    );
    validate(state);
    state = applyUpdate(state, handleKey(state, ';', js)!);
    check(
        state,
        round([
            //
            spaced([id('1'), smoosh([id('+'), id('a')])]),
            spaced([smoosh([id('.', true), id('b')]), id('2')]),
        ]),
        idc(0),
    );
});

// MARK: space in smooshed in space

test('smoosh id after', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+'), id('abc', true)])]), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), smoosh([id('+'), id('abc')]), id('', true)]), idc(0));
});

test('smoosh id before', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+', true), id('abc')])]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id(''), smoosh([id('+', true), id('abc')])]), idc(0));
});

test('smoosh id smoosh split (start)', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+'), id('abc', true)])]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id('+'), id('abc', true)]), idc(0));
});

test('smoosh id smoosh split (end)', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+', true), id('abc')])]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id('+'), id('abc', true)]), idc(0));
});

test('smoosh id id split', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+'), id('abc', true)])]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), smoosh([id('+'), id('a')]), id('bc', true)]), idc(0));
});

// MARK: space in smooshed

test('smoosh id after in', () => {
    let state = asTop(smoosh([id('+'), id('abc', true)]), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([smoosh([id('+'), id('abc')]), id('', true)]), idc(0));
});

test('smoosh id before', () => {
    let state = asTop(smoosh([id('+', true), id('abc')]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id(''), smoosh([id('+', true), id('abc')])]), idc(0));
});

test('smoosh id split id', () => {
    let state = asTop(smoosh([id('+'), id('abc', true)]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([smoosh([id('+'), id('a')]), id('bc', true)]), idc(0));
});

test('smoosh id split smoosh (start)', () => {
    let state = asTop(smoosh([id('+'), id('abc', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('+'), id('abc', true)]), idc(0));
});

test('smoosh id split smoosh (end)', () => {
    let state = asTop(smoosh([id('+', true), id('abc')]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('+'), id('abc', true)]), idc(0));
});

test('smoosh round split smoosh ', () => {
    let state = asTop(smoosh([round([], true), id('abc')]), listc('after'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([round([]), id('abc', true)]), idc(0));
});

test('smoosh round split smoosh (before)', () => {
    let state = asTop(smoosh([round([], true), id('abc')]), listc('before'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id(''), smoosh([round([], true), id('abc')])]), listc('before'));
});

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

test('round inside', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(round([spaced([id(''), id('')])])));
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

// MARK: Two spaced

test('id two end', () => {
    let state = asTop(spaced([id('one'), id('two', true)]), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id('one'), id('two'), id('')])));
});

test('id two start', () => {
    let state = asTop(spaced([id('one'), id('two', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id('one'), id(''), id('two')])));
});

test('id two mid', () => {
    let state = asTop(spaced([id('one'), id('two', true)]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id('one'), id('t'), id('wo')])));
});

test('list two start', () => {
    let state = asTop(spaced([id('one'), round([], true)]), listc('before'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id('one'), id(''), round([])])));
});

test('list two end', () => {
    let state = asTop(spaced([id('one'), round([], true)]), listc('after'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id('one'), round([]), id('')])));
});

test('id one spaced end', () => {
    let state = asTop(spaced([id('one', true), id(''), id('two')]), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    expect(shape(root(state))).toEqual(shape(spaced([id('one'), id(''), id('two')])));
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
