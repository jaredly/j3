// Basic level

import { setIdx } from '../src/grammar';
import { parseByCharacter } from '../src/parse/parse';
import { nodeToString, SourceMap } from '../src/to-cst/nodeToString';
import { Node } from '../src/types/cst';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { Selection } from '../web/store';

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

(.one.two)
(list (access 2))

(..hello)
(list (spread id))

{..one a b ..}
(record (spread id) id id (spread))

(fn [one:two three:(four five)]:six seven)
(list id (tannot (array (tannot id id) (tannot id (list id id))) id) id)
`;

const sexp = (node: Node): string => {
    const res = sexp_(node);
    if (node.tannot) {
        return `(tannot ${res} ${sexp(node.tannot)})`;
    }
    return res;
};

const sexp_ = (node: Node): string => {
    switch (node.type) {
        case 'identifier':
            return 'id';
        case 'number':
            return 'NOPE';
        case 'list':
        case 'array':
        case 'record':
            return `(${node.type + (node.values.length ? ' ' : '')}${node.values
                .map(sexp)
                .join(' ')})`;
        case 'accessText':
            return 'AA';
        case 'recordAccess':
            return `(access ${node.target.type === 'blank' ? '' : 'id '}${
                node.items.length
            })`;
        case 'spread':
            return `(spread ${sexp(node.contents)})`;
        case 'string':
            if (node.templates.length) {
                return `(string ${node.templates
                    .map((t) => sexp(t.expr))
                    .join(' ')})`;
            }
            return 'string';
        default:
            return 'AA' + node.type;
    }
};

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
                let back = nodeToString(fromMCST(idx, data), sourceMap);
                if (expected.includes('|')) {
                    if (!sourceMap.map[selection.idx]) {
                        console.log(JSON.stringify(data, null, 2));
                        console.log(back);
                        console.log(JSON.stringify(sourceMap.map, null, 2));
                    }
                    const pos = remapPos(selection, sourceMap);
                    back = back.slice(0, pos) + '|' + back.slice(pos);
                }
                if (back !== expected) {
                    console.warn(JSON.stringify(data));
                }
                expect(sexp(fromMCST(idx, data))).toEqual(serialized);
                expect(back).toEqual(expected);
            });
        });
});

export const remapPos = (selection: Selection, sm: SourceMap) => {
    if (!sm.map[selection.idx]) {
        throw new Error(`no idx ${selection.idx} ${JSON.stringify(sm)}`);
    }
    const { start, end } = sm.map[selection.idx];
    switch (selection.loc) {
        case 'start':
            return start;
        case 'end':
            return end;
        case 'inside':
            return start + 1;
        case 'change':
            return start;
        default:
            return start + (selection.loc ?? 0);
    }
};

// Ok, so the thing that I'll be comparing against is
// like s-exp of the types of things.

const fixtures = {
    const_int: '1',
    const_uint: '1u',
    const_float: '1.0',
    neg_int: '-1', // no neg uint
    neg_float: '-1.0',
    id: 'hello',
    id2: 'hello-and-23',
    id3: '>=',
    array: '[1 2]',
    record: '{1 2 3}',
    list: '(one plus 2)',
    tag: "'atag",
};
