// Basic level

import { parseByCharacter } from '../src/parse/parse';
import { nodeToString } from '../src/to-cst/nodeToString';
import { Node } from '../src/types/cst';
import { fromMCST, ListLikeContents } from '../src/types/mcst';

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

[a b 1.0]
(array id id id)

{a b}
(record id id)

(one two (three four) five ())
(list id id (list id id) id (list))

(...hello)
(list (spread id))

{...one a b ...}
(record (spread id) id id (spread))

one.two
(access id 1)

hello.3.2.what
(access id 3)

.one.two
(access 2)

(fn [one:two three:(four five)]:six seven)
(list id (tannot (array (tannot id id) (tannot id (list id id))) id) id)
`;

const sexp = (node: Node): string => {
    const res = sexp_(node);
    if (node.tannot) {
        return res + ':' + sexp(node.tannot);
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
        case 'string':
            return 'string';
        default:
            return 'AA' + node.type;
    }
};

describe('a test', () => {
    data.trim()
        .split('\n\n')
        .forEach((chunk, i) => {
            // if (i !== 1) return;
            const [jerd, expected] = chunk.split('\n');
            it(jerd, () => {
                const data = parseByCharacter(jerd);
                const idx = (data[-1] as ListLikeContents).values[0];
                const back = nodeToString(fromMCST(idx, data));
                if (back !== jerd) {
                    console.warn(JSON.stringify(data));
                }
                expect(back).toEqual(jerd);
                expect(sexp(fromMCST(idx, data))).toEqual(expected);
            });
        });
});

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
