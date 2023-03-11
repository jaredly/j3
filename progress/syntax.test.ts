// Basic level

import { setIdx } from '../src/grammar';
import { idText, parseByCharacter, selPos } from '../src/parse/parse';
import {
    nodeToString,
    remapPos,
    showSourceMap,
    SourceMap,
} from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents, Map } from '../src/types/mcst';
import { getKeyUpdate } from '../web/mods/getKeyUpdate';
import { PathSel, selectEnd, selectStart } from '../web/mods/navigate';
import { Path, Selection } from '../web/store';
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
(list id (tannot (array (tannot id id) (tannot id (list id id))) id) id)

(fn [one:two three:(four five)]:six {10 20 yes "ok \${(some [2 3 "inner" ..more] ..things)} and \${a}"})
(list id (tannot (array (tannot id id) (tannot id (list id id))) id) (record id id id (string (list id (array id id string (spread id)) (spread id)) id)))

backspace^b
backspac
id

back^l^b
bak
id

(^ba
a
id

[a][^r what
[a] [] what
(array id) (array) id

([])^l^l^ba^b
()
(list)
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
                setIdx(0);
                const { map: data, selection } = parseByCharacter(jerd, only);
                Object.keys(data).forEach((key) => {
                    expect(data[+key].loc.idx).toEqual(+key);
                });
                const idx = (data[-1] as ListLikeContents).values[0];
                const sourceMap: SourceMap = { map: {}, cur: 0 };
                const backOrig = nodeToString(fromMCST(idx, data), sourceMap);
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
                    [{ idx: -1, child: { type: 'child', at: 0 } }],
                    data,
                );

                if (!state) {
                    throw new Error(
                        `cant select end ${idx} ${JSON.stringify(data)}`,
                    );
                }

                doABunchOfKeys({
                    data,
                    state,
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
                    [{ idx: -1, child: { type: 'child', at: 0 } }],
                    data,
                );

                if (!startState) {
                    throw new Error(
                        `cant select end ${idx} ${JSON.stringify(data)}`,
                    );
                }

                doABunchOfKeys({
                    data,
                    state: startState,
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

function doABunchOfKeys({
    data,
    state,
    only,
    i,
    sourceMap,
    backOrig,
    back,
    stop,
    key,
    check,
}: {
    data: Map;
    state: PathSel;
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
        const curText = idText(data[state.sel.idx]) ?? '';
        const pos = selPos(state.sel, curText);
        if (only) {
            console.log(i, curText, pos, JSON.stringify(state));
        }

        const startPos = remapPos(state.sel, sourceMap);
        if (only) {
            console.log(
                backOrig.slice(0, startPos) + '|' + backOrig.slice(startPos),
            );
        }
        const update = getKeyUpdate(
            key,
            pos,
            curText,
            state.sel.idx,
            state.path,
            data,
        );
        expect(update).toBeTruthy();
        if (update) {
            if (update.type !== 'select') {
                expect(update).toMatchObject({ type: 'select' });
            } else {
                state.sel = update.selection;
                state.path = update.path;
            }
        }
        const newPos = remapPos(state.sel, sourceMap);
        if (check(startPos, newPos)) {
            console.log(JSON.stringify(state.sel));
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
            console.log(state.sel);
            expect(newPos).toEqual('something else');
        }
        if (newPos === stop) {
            break;
        }
    }
}
