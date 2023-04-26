// Now bringing in autocomplete and such

import { getType } from '../src/get-type/get-types-new';
import { getCtx } from '../src/getCtx';
import { parseByCharacter } from '../src/parse/parse';
import { Ctx, newCtx } from '../src/to-ast/Ctx';
import { nodeForType } from '../src/to-cst/nodeForType';
import { nodeToString } from '../src/to-cst/nodeToString';
import { errorToString } from '../src/to-cst/show-errors';
import { Type } from '../src/types/ast';
import { fromMCST, ListLikeContents } from '../src/types/mcst';

const data = `
(fn [one:int] one)
(fn [one:#:builtin:int] #3)

(fn [one:int] on^n)
(fn [one:#:builtin:int] #3)

(fn [one:int] on^nm)
(fn [one:#:builtin:int] onem)
-1: This has the empty type
6: No hash specified

(fn [o:int one:int] one)
(fn [o:#:builtin:int one:#:builtin:int] #6)

(fn [one] (has-prefix? one "thing"))
(fn [one:#:builtin:string] (#:builtin:string/has-prefix? #8 "thing"))

(fn [one:int] (has-prefix? one "thing"))
(fn [one:#:builtin:int] (#:builtin:string/has-prefix? #3 "thing"))
8: Invalid type.
Expected: string
Found: int

(fn [one:"hi" two:(fn ["ho"] int)] (two one))
(fn [one:#:builtin:string two:(fn ["ho"] #:builtin:int)] (#7 #3))
17: Invalid type.
Expected: "ho"
Found: string

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

(+ 2 1.2)
(#:builtin:int/+ 2 1.2)
3: Invalid type.
Expected: int
Found: 1.2

"what \${"is this"}"
"what \${"is this"}"

(let [x (tfn [t] (fn [a:t] a))] (x<int> 10))
(let [x (tfn [t] (fn [a:#7] #11))] (#3<#:builtin:int> 10))
-> #:builtin:int

(if 1 2 3)
(if 1 2 3)
0: Invalid type.
Expected: bool
Found: 1

(if true)
(if true)
0: if requires 3 elements

(if true 2 3)
(if true 2 3)
-> #:builtin:int

(if true 2 3.1)
(if true 2 3.1)
0: Unable to unify the following types:
First type: 2
Second type: 3.1

(if true ('One 1) ('Two 1.2))
(if true ('One 1) ('Two 1.2))
-> [('One 1) ('Two 1.2)]

[1 2 3]
[1 2 3]
-> (#:builtin:array #:builtin:int 3u)

(.hi {hi 10})
(.hi {hi 10})
-> 10

(let [x {hi 10}] x.hi)
(let [x {hi 10}] #3.hi)
-> 10

(if true {hi 10} {hi 20})
(if true {hi 10} {hi 20})
-> {hi #:builtin:int}

(let [x (tfn [t] (fn [a:t] a))] (x 10))
(let [x (tfn [t] (fn [a:#7] #11))] (#3 10))
-> #:builtin:int

(switch ('One 10) ('One x) x _ 20)
(switch ('One 10) ('One x) #7 _ 20)
-> #:builtin:int
`
    .trim()
    .split('\n\n');

export const typeToString = (type: Type, hashNames: Ctx['hashNames']) =>
    nodeToString(nodeForType(type, hashNames), hashNames);

describe('completion and such', () => {
    data.forEach((chunk, i) => {
        const only = chunk.startsWith('!!!');
        if (only) {
            chunk = chunk.slice(3);
        }
        const [input, expected, ...errors] = chunk.split('\n');
        let expectedType =
            errors.length && errors[0].startsWith('->') ? errors.shift() : null;
        (only ? it.only : it)(`${i} ${input}`, () => {
            const ctx = newCtx();
            const { map: data } = parseByCharacter(input, ctx);
            const idx = (data[-1] as ListLikeContents).values[0];

            // ctx.results.
            // Object.entries(ctx.results.toplevel).forEach(([k, v]) => {
            //     getType(v, ctx, { errors: ctx.results.errors, types: {} });
            //     validateExpr(v, ctx, ctx.results.errors);
            // });
            expect(nodeToString(fromMCST(idx, data), null)).toEqual(expected);
            const { ctx: nctx } = getCtx(data, -1, ctx.global);
            expect(
                Object.keys(nctx.results.errors)
                    .sort((a, b) => +a - +b)
                    .map(
                        (k) =>
                            `${k}: ${nctx.results.errors[+k]
                                .map((e) =>
                                    errorToString(e, nctx.results.hashNames),
                                )
                                .join('; ')}`,
                    )
                    .join('\n'),
            ).toEqual(errors.join('\n'));
            if (expectedType) {
                const got = getType(nctx.results.toplevel[idx], nctx);
                expect(got).toBeTruthy();
                expect(
                    '-> ' +
                        nodeToString(
                            nodeForType(got!, nctx.results.hashNames),
                            null,
                        ),
                ).toEqual(expectedType);
            }
        });
    });
});
