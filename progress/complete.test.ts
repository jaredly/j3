// Now bringing in autocomplete and such

import { getType } from '../src/get-type/get-types-new';
import { validateExpr } from '../src/get-type/validate';
import { getCtx } from '../src/getCtx';
import { parseByCharacter } from '../src/parse/parse';
import { applyUpdateMap } from '../src/state/getKeyUpdate';
import { Ctx, newCtx } from '../src/to-ast/Ctx';
import { nodeForType } from '../src/to-cst/nodeForType';
import { nodeToString } from '../src/to-cst/nodeToString';
import { errorToString } from '../src/to-cst/show-errors';
import { Def, DefType, Type } from '../src/types/ast';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { Error } from '../src/types/types';
import { relocify } from '../web/ide/relocify';
import { yankInner } from '../web/ide/yankFromSandboxToLibrary';
import { splitCase } from './test-utils';

const data = `
(fn [one:int] one)
= (fn [one:#:builtin:int] #3)
-> (fn [one:#:builtin:int] #:builtin:int)

(fn [one:int] on^n)
= (fn [one:#:builtin:int] #3)
-> (fn [one:#:builtin:int] #:builtin:int)

(fn [one:int] on^nm)
= (fn [one:#:builtin:int] onem)
-1: This has the empty type
6: No hash specified:onem

(fn [o:int one:int] one)
= (fn [o:#:builtin:int one:#:builtin:int] #6)

(fn [one] (has-prefix? one "thing"))
= (fn [one:#:builtin:string] (#:builtin:string/has-prefix? #8 "thing"))

(fn [one:int] (has-prefix? one "thing"))
= (fn [one:#:builtin:int] (#:builtin:string/has-prefix? #3 "thing"))
8: Invalid type.
Expected:
string
Found:
int

(fn [one:"hi" two:(fn ["ho"] int)] (two one))
= (fn [one:#:builtin:string two:(fn ["ho"] #:builtin:int)] (#7 #3))
17: Invalid type.
Expected:
"ho"
Found:
string
.
not handled matches "builtin_string"

(fn [one:"hi" two:(fn ["hi"] int)] (two one))
= (fn [one:"hi" two:(fn ["hi"] #:builtin:int)] (#7 #3))

(fn [one:"hi\${"ho"}" two:(fn ["hi\${"ho"}"] int)] (two one))
= (fn [one:"hi\${"ho"}" two:(fn ["hi\${"ho"}"] #:builtin:int)] (#10 #3))

(+ 2 32)
= (#:builtin:int/+ 2 32)

(fn [hello] (+ 2 hello))
= (fn [hello:#:builtin:int] (#:builtin:int/+ 2 #8))

(fn [hello] (+ hello 2))
= (fn [hello:#:builtin:int] (#:builtin:int/+ #8 2))

(+ 2 1.2)
= (#:builtin:int/+ 2 1.2)
3: Invalid type.
Expected:
int
Found:
1.2

"what \${"is this"}"
= "what \${"is this"}"

(let [x (tfn [t] (fn [a:t] a))] (x<int> 10))
= (let [x (tfn [t] (fn [a:#7] #11))] (#3<#:builtin:int> 10))
-> #:builtin:int

(if 1 2 3)
0: Invalid type.
Expected:
bool
Found:
1

(if true)
0: if requires 3 elements

(if true 2 3)
-> #:builtin:int

(if true 2 3.1)
0: Unable to unify the following types:
First type: 2
Second type: 3.1

(if true ('One 1) ('Two 1.2))
-> [('One 1) ('Two 1.2)]

[1 2 3]
-> (#:builtin:array #:builtin:int 3u)

(let [x {hi 10}] x.hi)
= (let [x {hi 10}] #3.hi)
-> 10

(if true {hi 10} {hi 20})
-> {hi #:builtin:int}

(switch ('One 10) ('One x) x _ 20)
= (switch ('One 10) ('One x) #7 _ 20)
-> #:builtin:int

(let [x (tfn [Enum:[..]] (fn [x:Enum] x))] x<['one 'two]>)
= (let [x (tfn [Enum:[..]] (fn [x:#8] #17))] #3<['one 'two]>)
-> (fn [x:['one 'two]] ['one 'two])

((fn<x> [y:x] y)<int> 100)
= ((fn<x> [y:#5] #7)<#:builtin:int> 100)
-> #:builtin:int

((fn<x> [y:x] y) 100)
= ((fn<x> [y:#5] #7) 100)
-> 100

(defn hello<x y> [z:[('Ok x) ('Err y)]] z)
(hello ('Ok 10))
= (#0 ('Ok 10))
-> [('Ok 10) ('Err ⍉)]

(defn hello<x y> [z:[('Ok x) ('Err y)]] z)
(if true (hello ('Ok 10)) ('Err 1.2))
-> [('Err 1.2) ('Ok 10)]

(deftype Result<ok err> [('Ok ok) ('Err err)])
(defn parseInt [text:string]
    (switch (int/parse text)
        ('Some int) ('Ok int)
        'None ('Err ('NotAnInt text))))
(defn mapErr<ok err err2> [value:(Result ok err) map:(fn [err] err2)]
    (switch value
        ('Err err) ('Err (map err))
        x x))
(mapErr<int ('NotAnInt string) ('LineError int string ('NotAnInt string))>
    (parseInt "10")
    (fn [x:('NotAnInt string)] ('LineError 10 "hi" x)))
-> [('Err ('LineError #:builtin:int #:builtin:string ('NotAnInt #:builtin:string))) ('Ok #:builtin:int)]

(defn parseInt [text:string]:[('Ok int) ('Err float)] ('Ok 10))
-> (fn [text:#:builtin:string] [('Ok #:builtin:int) ('Err #:builtin:float)])

(deftype Result<ok err> [('Ok ok) ('Err err)])
(defn parseInt [text:string]:(Result int float)
    (switch (int/parse text)
        ('Some int) ('Ok int)
        'None ('Err 1.0)))
(defn mapErr<ok err> [value:(Result ok err)]
    (switch value
        ('Err err) ('Err err)
        x x))
(mapErr (parseInt "10"))
-> [('Err #:builtin:float) ('Ok #:builtin:int)]

(defn mapErr<ok> [value:((tfn [x] x) ok)] 10)
(mapErr 10)
-> 10

(defn parseInt [text:string]
    (switch (int/parse text)
        ('Some int) ('Ok int)
        'None ('Err 1.0)))
-> (fn [text:#:builtin:string] [('Err 1.) ('Ok #:builtin:int)])

(deftype Result<ok err> [('Ok ok) ('Err err)])
(defn parseInt [text:string]:(Result int 1.0)
    (switch (int/parse text)
        ('Some int) ('Ok int)
        'None ('Err 1.0)))
-> (fn [text:#:builtin:string] (#0 #:builtin:int 1.))

(def fib (@loop
    (fn [x:int]:int
        (if (< x 1) 0
            (+ (@recur (- 1 x)) (@recur (- 2 x)))))))
-> (fn [x:#:builtin:int] #:builtin:int)

(fnrec [x:int]:int
    (if (< x 1) 0
        (+ (@recur (- 1 x)) (@recur (- 2 x)))))
-> (fn [x:#:builtin:int] #:builtin:int)

(fnrec [x:int]:int (@recur 10))
-> (fn [x:#:builtin:int] #:builtin:int)

(defnrec fib [x:int]:int
    (if (< x 1) 0
        (+ (@recur (- 1 x)) (@recur (- 2 x)))))
-> (fn [x:#:builtin:int] #:builtin:int)

(defnrec fib<T> [x:T flag:bool]:int
    (if flag 10 (@recur<T> x true)))
-> (fn<T> [x:#5 flag:#:builtin:bool] #:builtin:int)

(let [x (fn<X:int> [] 10) y (fn<X:int> [] (x<X>))] y)
-> (fn<X:#:builtin:int> [] 10)

(.a {a 10})
-> 10

(.a {a 10 b 20})
-> 10

(.a.b {a {b 10}})
-> 10

(defn return<T> [x:T] ('Return x))
(fn [] (! ('Hello "hi" return<()>)))
-> (fn [] (@task ('Hello "hi" ()) ()))

(defn return<T> [x:T] ('Return x))
(fn []:(@task ('Hello "hi" ()) ()) (! ('Hello "hi" return<()>)))
-> (fn [] (@task ('Hello "hi" ()) ()))

(fn []:(@task ('Bad "hi") ()) (! ('Bad "hi" ())))
-> (fn [] (@task ('Bad "hi") ()))

(fn [] (! ('Bad "hi" ())))
-> (fn [] (@task ('Bad "hi") ⍉))

(fn [] (! ('Bad "hi")))
-1: This has the empty type
3: Not a task: ('Bad "hi"). --> non-return task tags must have 2 args

(fn<T:[..]> []:(@task T ()) ('Return ()))
-> (fn<T:[..]> [] (@task #5 ()))

(fn [] (! 'Bad "hi" ()))
-> (fn [] (@task ('Bad "hi") ⍉))

(fn [x:['Ten ('Four int)]] (switch x 'Ten 10 ('Four xy) xy))
-> (fn [x:['Ten ('Four #:builtin:int)]] #:builtin:int)

(fn [x:['Ten ('Four int)]] (switch x 'Ten 10))
11: switch not exhaustive ('Four int)

((fn<T> [x:T] x) 10)
-> 10

((fn<T:[..]> [x:T] x) 10)
0: Invalid type.
Expected:
[..]
Found:
10
.
not handled matches \"number_union\"

(fn [x:(@task ('Hi () ()) int)] ((fn<T:[..]> [x:T] 10) x))
-> (fn [x:(@task ('Hi () ()) #:builtin:int)] 10)

(fn [x:(@task ('Hi () ()) int)] ((fn<T:[..]> [x:T] 10) x))
-> (fn [x:(@task ('Hi () ()) #:builtin:int)] 10)

(deftype Result<ok err> [('Ok ok) ('Err err)])
(defn task/to-result<Effects:[..] Errors:[..] Value> [task-top:(@task [Effects ('Failure Errors)] Value) v:Value]:(@task Effects (Result Value Errors))
  ('Return ('Ok v)))
-> (fn<Effects:[..] Errors:[..] Value> [task-top:(@task [#20 ('Failure #27)] #33) v:#33] (@task #20 (#0 #33 #27)))

(deftype Result<ok err> [('Ok ok) ('Err err)])
(defn task/to-result<Effects:[..] Errors:[..] Value> [task-top:(@task [Effects ('Failure Errors)] Value) v:Value]:(@task Effects (Result Value Errors))
  ('Return ('Ok v)))
(to-result ('Hi () (fn [x:()] ('Return x))) ())
-> (@task ('Hi () ()) (#0 () []))

; TODO: So this one really should work! ugh.
(deftype Result<ok err> [('Ok ok) ('Err err)])
(defn task/to-result<Effects:[..] Errors:[..] Value> [task-top:(@task [Effects ('Failure Errors)] Value)]:(@task Effects (Result Value Errors)) ((fnrec [task:(@task [Effects ('Failure Errors)] Value)]:(@task Effects (Result Value Errors)) (switch task ('Failure error) ('Return ('Err error)) ('Return value) ('Return ('Ok value)) otherwise (withHandler<Effects Value ('Failure Errors) (Result Value Errors)> otherwise @recur)) ) task-top))
(to-result ('Hi () (fn [x:()] ('Return x))))
-> (@task ('Hi () ()) (#0 ⍉ []))
114: Invalid type.
Expected:
(@task [('Hi () ()) ('Failure [])] ⍉)
<expanded task>
[('Failure []) ('Hi () (fn [value:()] (@task [('Failure []) ('Hi () ())] ⍉))) ('Return ⍉)]
Found:
('Hi () (fn [x:()] ('Return ())))
.
Invalid type.
Expected:
⍉
Found:
()
Path: Hi -> body -> Return

(deftype Result<ok err> [('Ok ok) ('Err err)])
(defn task/to-result<Effects:[..] Errors:[..] Value> [task-top:(@task [Effects ('Failure Errors)] Value) v:Value]:(@task Effects (Result Value Errors))
  ('Return ('Ok v)))
(fn [x:(@task ('Hi () ()) int)] (to-result x 10))
-> (fn [x:(@task ('Hi () ()) #:builtin:int)] (@task ('Hi () ()) (#0 #:builtin:int [])))

!!!(defn to-result<Effects:[..]> [task-top:(@task [Effects] 10) v:10]:(@task Effects 10)
  ('Return v))
(fn [x:(@task ('Hi () ()) 10)] (to-result x 10))
-> (fn [x:(@task ('Hi () ()) 10)] (@task ('Hi () ()) 10))

(defn to-result<Effects:[..]> [task-top:(@task [Effects] 10) v:10]:(@task Effects 10)
  ('Return v))
(fn [x:('Return 10)] (to-result x 10))
-> (fn [x:(@task ('Hi () ()) 10)] (@task ('Hi () ()) 10))

(deftype Result<ok err> [('Ok ok) ('Err err)])
(defn to-result<Effects:[..] Value> [task-top:(@task [Effects] Value) v:Value]:(@task Effects Value)
  ('Return v))
(fn [x:(@task ('Hi () ()) int)] (to-result x 10))
-> (fn [x:(@task ('Hi () ()) #:builtin:int)] (@task ('Hi () ()) #:builtin:int))

(fn<A B> [x:A y:B] (if true x y))
-1: This has the empty type
13: Unable to unify the following types:
First type: A
Second type: B

; TODO this should be ~doable, right?
(fn<A:[..]> [x:A]:[A 'Yes] (if true x 'Yes))
19: Unable to unify the following types:
First type: A
Second type: 'Yes
--> unifyTypes can't handle 'local' vs 'tag' yet

(let [x 1] x ^b^T^b^b
= (let x)
0: first not array

`
    .trim()
    .split('\n\n');

// (defnrec mapTask<T Effects:[..] R> [values:(array T) fnz:(fn [T uint] (@task Effects R)) at:uint]:(@task Effects (array R)) (switch values [one ..rest] (let [res (! (fnz one at)) coll (! (@recur<T Effects R> rest fnz (+ at 1u)))] [res ..coll]) _ []))
// -> (fn<T Effects:[..] R> [values:(#:builtin:array #5) fnz:(fn [#5 #:builtin:uint] (@task #7 #13)) at:#:builtin:uint] (@task #7 (#:builtin:array #13)))

// ((tfn [X:[..]] X) 10)

// erfff ok so ... multiple levels? Is that it?

// (deftype Result<ok err> [('Ok ok) ('Err err)])
// (defn parseInt [text:string]:[('Ok int) ('Err float))]
//     ('Ok 10))
// (defn mapErr<ok err> [value:(Result ok err)] 10)
// (mapErr (parseInt "10"))
// -> [('Err #:builtin:float) ('Ok #:builtin:int)]

// (deftype Result<ok err> [('Ok ok) ('Err err)])
// (defn parseInt [text:string]:(Result int float)
//     (switch (int/parse text)
//         ('Some int) ('Ok int)
//         'None ('Err 1.0)))
// -> (fn [text:#:builtin:string] (#0 #:builtin:int #:builtin:float))

// (defn parseInt [text:string]:(Result int float) ('Ok 10))

// (deftype Result<ok err> [('Ok ok) ('Err err)])
// (defn parseInt [text:string]
//     (switch (int/parse text)
//         ('Some int) ('Ok int)
//         'None ('Err ('NotAnInt text))))
// (defn mapErr<ok err err2> [value:(Result ok err) map:(fn [err] err2)]
//     (switch value
//         ('Err err) ('Err (map err))
//         x x))
// (mapErr (parseInt "10") (fn [x:('NotAnInt string)] ('LineError 10 "hi" x)))
// -> [('Err ('LineError #:builtin:int #:builtin:string ('NotAnInt #:builtin:string))) ('Ok #:builtin:int)]

// (parseInt "19")
// -> [('Err ('NotAnInt #:builtin:string)) ('Ok #:builtin:int)]

// (defn mapErr<ok err err2> [value:(Result ok err) map:(fn [err] err2)] (switch value ('Err err) ('Err (map err)) x x))
// (mapErr<int ('NotAnInt string) ('LineError int string ('NotAnInt string))> (parseInt "10") (fn [x:('NotAnInt string)] ('LineError 10 "hi" x)))
// -> [('Err ('LineError 10 string ('NotAnInt string))) ('Ok int)]

// (fn [x:(array int)] (switch x [] 0 _ 3))
// (fn [x:(#:builtin:array #:builtin:int)] (switch #3 [] 0 _ 3))
// -> (fn [x:(array int)] int)

// (.hi {hi 10})
// (.hi {hi 10})
// -> 10

// (let [x (tfn [t] (fn [a:t] a))] (x 10))
// (let [x (tfn [t] (fn [a:#7] #11))] (#3 10))
// -> #:builtin:int

const dedup = (arr: string[]) => {
    const seen: { [key: string]: boolean } = {};
    return arr.filter((k) => !seen[k] && (seen[k] = true));
};

export const typeToString = (type: Type, hashNames: Ctx['hashNames']) =>
    nodeToString(nodeForType(type, hashNames), hashNames);

describe('completion and such', () => {
    let line = 0;
    data.forEach((chunk, i) => {
        const fname = `progress/complete.test.ts:${line + 20}`;
        line += chunk.split('\n').length + 1;
        const only = chunk.startsWith('!!!');
        if (only) {
            chunk = chunk.slice(3);
        }
        const skip = chunk.startsWith('skip:');
        const { input, expected, expectedType, errors } = splitCase(chunk);
        // const [input, expected, ...errors] = splitIndented(chunk);
        // let expectedType =
        //     errors.length && errors[0].startsWith('->') ? errors.shift() : null;
        (skip ? it.skip : only ? it.only : it)(`${fname} ${i} ${input}`, () => {
            const ctx = newCtx();
            let { map: data, nidx } = parseByCharacter(
                input.replace(/\s+/g, ' '),
                ctx,
            );
            const tops = (data[-1] as ListLikeContents).values;
            const idx = tops[tops.length - 1];

            if (expected) {
                expect(nodeToString(fromMCST(idx, data), null)).toEqual(
                    expected,
                );
            }

            const { ctx: nctx } = getCtx(data, -1, nidx, ctx.global);

            // // const errors: { [idx: number]: Error[] } = {};
            // tops.forEach((idx) => {
            //     const expr = nctx.results.toplevel[idx];
            //     validateExpr(expr, nctx, nctx.results.errors);
            //     getType(expr, nctx, {
            //         errors: nctx.results.errors,
            //         types: {},
            //     });
            // });

            expect(
                Object.keys(nctx.results.errors)
                    .sort((a, b) => +a - +b)
                    .map(
                        (k) =>
                            `${k}: ${dedup(
                                nctx.results.errors[+k].map((e) =>
                                    errorToString(e, nctx),
                                ),
                            ).join('; ')}`,
                    )
                    .join('\n'),
            ).toEqual(errors);
            if (expectedType) {
                const got = getType(nctx.results.toplevel[idx], nctx);
                expect(got).toBeTruthy();
                expect(
                    nodeToString(
                        nodeForType(got!, nctx.results.hashNames),
                        null,
                    ),
                ).toEqual(expectedType);
            }

            if (!errors) {
                let ctx = nctx;
                while (true) {
                    const tops = (data[-1] as ListLikeContents).values;
                    const expected: any = {};
                    tops.forEach((idx) => (expected[idx] = expect.anything()));
                    expect(ctx.results.toplevel).toMatchObject(expected);
                    const first = tops.find(
                        (idx) =>
                            ctx.results.toplevel[idx]?.type === 'def' ||
                            ctx.results.toplevel[idx]?.type === 'deftype',
                    );
                    if (first == null) {
                        // console.log('No top left', tops);
                        // console.log(ctx.results.toplevel);
                        break;
                    }

                    const expr = ctx.results.toplevel[first] as Def | DefType;
                    const result = yankInner(
                        data,
                        nctx,
                        { expr, loc: first },
                        'complete',
                    );
                    expect(result).toBeTruthy();
                    data = applyUpdateMap(data, result!.update);
                    ctx = getCtx(data, -1, nidx, {
                        ...ctx.global,
                        library: result!.library,
                    }).ctx;

                    const errors: { [idx: number]: Error[] } = {};
                    (data[-1] as ListLikeContents).values.forEach((idx) => {
                        const expr = ctx.results.toplevel[idx];
                        if (expr) {
                            validateExpr(expr, ctx, errors);
                            getType(expr, ctx, {
                                errors: errors,
                                types: {},
                            });
                        }
                    });
                    expect(errors).toEqual({});

                    if (tops.length === 1) {
                        break;
                    }
                }
            }
        });
    });
});
