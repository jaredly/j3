// Now bringing in autocomplete and such

import { parseByCharacter } from '../src/parse/parse';
import { newCtx } from '../src/to-ast/Ctx';
import { nodeToString } from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../src/types/mcst';

const data = `
(fn [one:int] one)
(fn [one:#:builtin:int] #3)

(fn [one:int] on^n)
(fn [one:#:builtin:int] #3)

(fn [one:int] on^nm)
(fn [one:#:builtin:int] onem)

(fn [o:int one:int] one)
(fn [o:#:builtin:int one:#:builtin:int] #6)

(fn [one] (has-prefix? one "thing"))
(fn [one:#:builtin:string] (#:builtin:string/has-prefix? #8 "thing"))

(fn [one:int] (has-prefix? one "thing"))
(fn [one:#:builtin:int] (#:builtin:string/has-prefix? #3 "thing"))

(fn [one:"hi" two:(fn ["ho"] int)] (two one))
(fn [one:#:builtin:string two:(fn ["ho"] #:builtin:int)] (#7 #3))

(fn [one:"hi" two:(fn ["hi"] int)] (two one))
(fn [one:"hi" two:(fn ["hi"] #:builtin:int)] (#7 #3))

(fn [one:"hi\${"ho"}" two:(fn ["hi\${"ho"}"] int)] (two one))
(fn [one:"hi\${"ho"}" two:(fn ["hi\${"ho"}"] #:builtin:int)] (#10 #3))

(+ 2 32)
(#:builtin:int/+ 2 32)

(fn [hello] (+ 2 hello))
(fn [hello:#:builtin:int] (#:builtin:int/+ 2 #8))

(fn [hello] (+ hello 2))
(fn [hello:#:builtin:int] (#:builtin:int/+ #8 2))
`
    .trim()
    .split('\n\n');

describe('completion and such', () => {
    data.forEach((chunk, i) => {
        const only = chunk.startsWith('!!!');
        if (only) {
            chunk = chunk.slice(3);
        }
        const [input, expected] = chunk.split('\n');
        (only ? it.only : it)(`${i} ${input}`, () => {
            const ctx = newCtx();
            const { map: data } = parseByCharacter(input, ctx);
            const idx = (data[-1] as ListLikeContents).values[0];
            expect(nodeToString(fromMCST(idx, data), null)).toEqual(expected);
        });
    });
});
