// Basic level

import { parseByCharacter } from '../src/parse/parse';

const data = `
(, 1 -1 2.0 1u -1.2)
(list id int int float uint float)

"hello"
string

"Hello \${one} and"
(string id)

"nest \${(and "things")} ed"
(string (list id string))

[a b 1.0]
(array id id number)

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

describe('a test', () => {
    data.trim()
        .split('\n\n')
        .forEach((chunk) => {
            const [jerd, expected] = chunk.split('\n');
            it(jerd, () => {
                const data = parseByCharacter(jerd);
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
