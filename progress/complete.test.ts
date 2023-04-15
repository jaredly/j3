// Now bringing in autocomplete and such

import { parseByCharacter } from '../src/parse/parse';
import { newCtx } from '../src/to-ast/Ctx';
import { nodeToString } from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../src/types/mcst';

const data = `
(fn [one:int] one)
(fn [one:int] one)

(fn [one:int] on^n)
(fn [one:int] one)

(fn [one:int] on^nm)
(fn [one:int] onem)

(fn [o:int one:int] one)
(fn [o:int one:int] one)

(fn [one] (has-prefix? one "thing"))
(fn [one:string] (has-prefix? one "thing"))

(fn [one:int] (has-prefix? one "thing"))
(fn [one:int] (has-prefix? one "thing"))

(fn [one:"hi" two:(fn ["ho"] int)] (two one))
(fn [one:string two:(fn ["ho"] int)] (two one))

(fn [one:"hi" two:(fn ["hi"] int)] (two one))
(fn [one:"hi" two:(fn ["hi"] int)] (two one))

(fn [one:"hi\${"ho"}" two:(fn ["hi\${"ho"}"] int)] (two one))
(fn [one:"hi\${"ho"}" two:(fn ["hi\${"ho"}"] int)] (two one))

(+ 2 32)
(+ 2 32)

(fn [hello] (+ 2 hello))
(fn [hello:int] (+ 2 hello))

(fn [hello] (+ hello 2))
(fn [hello:int] (+ hello 2))
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
            expect(
                nodeToString(fromMCST(idx, data), ctx.results.hashNames),
            ).toEqual(expected);
        });
    });
});
