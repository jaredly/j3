// Basic level

import { validateExpr } from '../src/get-type/validate';
import { idText, parseByCharacter, pathPos } from '../src/parse/parse';
import { newCtx } from '../src/to-ast/Ctx';
import {
    nodeToString,
    remapPos,
    showSourceMap,
    SourceMap,
} from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { validatePath } from '../web/mods/clipboard';
import { applyUpdate, getKeyUpdate, State } from '../web/mods/getKeyUpdate';
import { selectEnd, selectStart } from '../web/mods/navigate';
import { Path } from '../web/mods/path';
import { sexp } from './sexp';

const data = `
()
(list)

(1)
(list id)

(, 1 -1 2.0 1u -1.2)
(list id id id id id id)

"hel(l{o'"
string

"Hello \${one} and"
(string id)

"nest \${(and "things")} ed"
(string (list id string))

"a\${b}c\${d}e"
(string id id)

("ok" ko)
(list string id)

[a b 1.0]
(array id id id)

{a b}
(record id id)

(one two (three four) five ())
(list id id (list id id) id (list))

(one t^l^r())
(one t ())
(list id id (list))

(one t^l())
(one (t))
(list id (list id))

(one())
(one ())
(list id (list))

(one {^l())
(one ({}))
(list id (list (record)))

one^l
on|e
id

(one {^l
(one |{})
(list id (record))

oe^ln^r
one|
id

ne^l^lo
o|ne
id

"wh^la^r"
"wah"
string

"wh^la"^r"
"wa"h"
string

"Hello w^l\${cruel} ^rorld"
"Hello \${cruel} world"
(string id)

one.two
(access id 1)

hello.3.2.what
(access id 3)

.one.two
(access 2)

some^l^l.
so.me
(access id 1)

hi^l^l.
.hi
(access 1)

one.two^l.
one.tw.o
(access id 2)

(.one.two)
(list (access 2))

(..hello)
(list (spread id))

{..one a b ..}
(record (spread id) id id (spread))

(fn [one:two three:(four five)]:six seven)
(list id (annot (array (annot id id) (annot id (list id id))) id) id)

(fn [one:two three:(four five)]:six {10 20 yes "ok \${(some [2 3 "inner" ..more] ..things)} and \${a}"})
(list id (annot (array (annot id id) (annot id (list id id))) id) (record id id id (string (list id (array id id string (spread id)) (spread id)) id)))

backspace^b
backspac
id

back^l^b
bak
id

(^ba
a
id

([a][)
([a] [])
(list (array id) (array))

([a][^r what
([a] [] what)
(list (array id) (array) id)

([])^l^l^ba^b
()
(list)

( )
(list blank blank)

( ^b)
()
(list)

("^b
()
(list)

(e🤔m^l^la^ro^roji)
(ea🤔omoji)
(list id)

(🤔a)
(list id)

((a)j)
((a) j)
(list (list id) id)

((a^l^lb
(b (a))
(list id (list id))

"\${^b
""
string

"\${}^b"
""
string

[()^b
[]
(array)

(id ^l )
(id )
(list id blank)

(id^l^l )
( id)
(list blank id)

(a ^lbc)
(abc )
(list id blank)

a.b^b^b
a
id

(().a)
(() .a)
(list (list) (access 1))

( o^l^b)
(o)
(list id)

( (^l^b
(())
(list (list))

((^l 
( ())
(list blank (list))

(h^l a)
( ah)
(list blank id)

hello^L^L^b
hel
id

abcde^L^L^C^l^V
abdecde
id

(a  ^l^b
(a )
(list id blank)

a.b^l^l^l(
(a.b)
(list (access id 1))

hi:^b
hi
id

(.^b)
()
(list)

( (^la^l^lb
(b a ())
(list id id (list))

(. ^l^b)
( )
(list blank blank)

hello<friend>
hello<friend>
(tapply id id)
`;

describe('a test', () => {
    data.trim()
        .split('\n\n')
        .forEach((chunk, i) => {
            const only = chunk.startsWith('!!!');
            if (only) {
                chunk = chunk.slice(3);
            }
            const chunks = chunk.split('\n');
            const jerd = chunks[0];
            const [expected, serialized] =
                chunks.length === 2 ? chunks : chunks.slice(1);

            (only ? it.only : it)(i + ' ' + jerd, () => {
                const ctx = newCtx();
                const {
                    map: data,
                    at,
                    nidx,
                } = parseByCharacter(jerd, ctx, false, only);
                const selection = at[0].start;
                Object.keys(data).forEach((key) => {
                    expect(data[+key].loc.idx).toEqual(+key);
                });
                const idx = (data[-1] as ListLikeContents).values[0];
                const sourceMap: SourceMap = { map: {}, cur: 0 };
                const backOrig = nodeToString(
                    fromMCST(idx, data),
                    ctx.hashNames,
                    sourceMap,
                );
                let back = backOrig;
                if (expected.includes('|')) {
                    const pos = remapPos(selection, sourceMap);
                    back = back.slice(0, pos) + '|' + back.slice(pos);
                }
                if (back !== expected) {
                    console.warn(JSON.stringify(data));
                }
                expect(sexp(fromMCST(idx, data))).toEqual(serialized);
                expect(back).toEqual(expected);

                const state = selectEnd(
                    idx,
                    [{ idx: -1, type: 'child', at: 0 }],
                    data,
                );

                if (!state) {
                    throw new Error(
                        `cant select end ${idx} ${JSON.stringify(data)}`,
                    );
                }

                doABunchOfKeys({
                    state: {
                        map: data,
                        at: [{ start: state }],
                        root: -1,
                        nidx,
                    },
                    only,
                    i,
                    sourceMap,
                    backOrig,
                    back,
                    stop: 0,
                    key: 'ArrowLeft',
                    check(startPos, newPos) {
                        return newPos >= startPos || newPos < startPos - 2;
                    },
                });

                const startState = selectStart(
                    idx,
                    [{ idx: -1, type: 'child', at: 0 }],
                    data,
                );

                if (!startState) {
                    throw new Error(
                        `cant select end ${idx} ${JSON.stringify(data)}`,
                    );
                }

                doABunchOfKeys({
                    state: {
                        map: data,
                        at: [{ start: startState }],
                        root: -1,
                        nidx,
                    },
                    only,
                    i,
                    sourceMap,
                    backOrig,
                    back,
                    stop: backOrig.length,
                    key: 'ArrowRight',
                    check(startPos, newPos) {
                        return newPos <= startPos || newPos > startPos + 2;
                    },
                });
            });
        });
});

const pathIdx = (path: Path[]) => path[path.length - 1].idx;

function doABunchOfKeys({
    only,
    i,
    sourceMap,
    backOrig,
    back,
    stop,
    key,
    check,
    state,
}: {
    state: State;
    only: boolean;
    i: number;
    sourceMap: SourceMap;
    backOrig: string;
    back: string;
    stop: number;
    key: string;
    check: (startPos: number, newPos: number) => boolean;
}) {
    while (true) {
        const ctx = newCtx();
        const curText = idText(state.map[pathIdx(state.at[0].start)]) ?? '';
        const pos = pathPos(state.at[0].start, curText);
        if (only) {
            console.log(i, curText, pos, JSON.stringify(state));
        }

        const startPos = remapPos(state.at[0].start, sourceMap);
        if (only) {
            console.log(
                backOrig.slice(0, startPos) + '|' + backOrig.slice(startPos),
            );
        }
        const update = getKeyUpdate(
            key,
            state.map,
            state.at[0],
            ctx.hashNames,
            state.nidx,
        );
        expect(update).toBeTruthy();
        if (update) {
            if (update.type !== 'select') {
                expect(update).toMatchObject({ type: 'select' });
            } else {
                state = applyUpdate(state, 0, update)!;
                expect(
                    validatePath(state.map, update.selection, ctx.hashNames),
                ).toBeTruthy();
            }
        }
        const newPos = remapPos(state.at[0].start, sourceMap);
        if (check(startPos, newPos)) {
            console.log(JSON.stringify(state.at[0].start));
            console.log(showSourceMap(back, sourceMap));
            console.log(
                'prev: ' +
                    backOrig.slice(0, startPos) +
                    '|' +
                    backOrig.slice(startPos),
            );
            console.log(
                'now: ' +
                    backOrig.slice(0, newPos) +
                    '|' +
                    backOrig.slice(newPos),
            );
            console.log(state.at[0].start);
            expect(newPos).toEqual(
                `it should have been different after ${key}? ${startPos}`,
            );
        }
        if (newPos === stop) {
            break;
        }
    }
}
