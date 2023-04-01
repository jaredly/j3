// Now bringing in autocomplete and such

import { parseByCharacter } from '../src/parse/parse';
import { basicBuiltins, mathHashes, newCtx } from '../src/to-ast/Ctx';
import { nodeToString } from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../src/types/mcst';

const data = `
(fn [one:int] one)
(fn [one#:0:int] #:0)

(fn [one:int] on^n)
(fn [one#:0:int] #:0)

(fn [one:int] on^nm)
(fn [one#:0:int] onem)

(fn [o:int one:int] one)
(fn [o#:0:int one#:1:int] #:1)

(fn [one] (has-prefix? one "thing"))
(fn [one#:0:string] (#${basicBuiltins.names['has-prefix?'][0]} #:0 "thing"))

(+ 2 32)
(#${mathHashes.int['+']} 2 32)
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
            const { map: data } = parseByCharacter(input, ctx, true, false);
            const idx = (data[-1] as ListLikeContents).values[0];
            expect(nodeToString(fromMCST(idx, data))).toEqual(expected);
        });
    });
});
