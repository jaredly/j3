// Some things

import { asTaskType } from '../src/get-type/asTaskType';
import { expandTask } from '../src/get-type/expandTask';
import { TaskType } from '../src/get-type/get-types-new';
import { _matchOrExpand, typeToString } from '../src/get-type/matchesType';
import { autoCompleteIfNeeded, parseByCharacter } from '../src/parse/parse';
import { newCtx, noForm } from '../src/to-ast/Ctx';
import { CstCtx } from '../src/to-ast/library';
import { nodeToType } from '../src/to-ast/nodeToType';
import { errorToString } from '../src/to-cst/show-errors';
import { Type } from '../src/types/ast';
import { ListLikeContents, fromMCST } from '../src/types/mcst';

const shouldMatch = `
1 int
1u uint
true bool
false bool
'hi ['hi 'ho]
('hi 10) [('hi int)]
('hi 10) ((tfn [T] [('hi T)]) int)
1. float
{x 1.} {x float}
'Nil (@loop ['Nil ('Cons int @recur)])
('Cons 1 'Nil) (@loop ['Nil ('Cons int @recur)])
('Cons 1 ('Cons 0 'Nil)) (@loop ['Nil ('Cons int @recur)])
('Leaf 100) ((@loop (tfn [T] [('Leaf T) ('Node (array @recur))])) int)
('Node (array [('Leaf 1) ('Node (array []))])) ((@loop (tfn [T] [('Leaf T) ('Node (array (@recur T)))])) int)
(@loop ['Nil ('Cons int @recur)]) (@loop ['Nil ('Cons int @recur)])
('Return 10) (@task [] int)
('Hello 10 (fn [()] ('Return 10))) (@task [('Hello int ())] 10)
('Hello 10 (fn [string] ('Return 10))) (@task [('Hello int string)] 10)
('Hello 10 (fn [string] ('Hello 20 (fn [string] ('Return 10))))) (@task [('Hello int string)] 10)
('Hello 10 (fn [string] (@task ('Hello int string) 10))) (@task [('Hello int string)] 10)
('Hello 10 (fn [string] (@task ('Other string int) 10))) (@task ('Hello int string) 10 ('Other string int))
`;

const shouldNotMatch = `
10. 10
('Return 10.) (@task ('Hello int ()) int)
('Hello 10. (fn [()] ('Return 10))) (@task [('Hello int ())] 10)
('Hello 10 (fn [()] ('Return 10.))) (@task [('Hello int ())] 10)
('Hello 10 (fn [string] ('Return 10))) (@task [('Hello int ())] 10)
('Hello 10 (fn [string] ('Hello 20 (fn [string] ('Return 20))))) (@task [('Hello int string)] 10)
`;

// (.x {x 1.}) 1.
// Why doesn't this one work? 🤔
// ('Node (array [])) ((tfn [T] (@loop [('Leaf T) ('Node (array @recur))])) int)
// (tfn [X:{x float}] (fn [m:X.x] m))
// (@loop (tfn [T] [('Leaf T) ('Node (array @recur))]))
// treeeeeee gotta do some "type check checks" I think
//
// "hi" "hi"
// "hi" string
// (lettype [vec2 {x float y float}] (array vec2 4)) : (array {x float y float})

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchType(expected: Type, ctx: CstCtx): R;
        }
    }
}

expect.extend({
    toMatchType(candidate: Type, expected: Type, ctx: CstCtx) {
        // const report: Report = {errors: {},types: {}}
        const result = _matchOrExpand(candidate, expected, ctx, []);
        if (result === true) {
            const lines = [
                `Type \`${typeToString(
                    candidate,
                    ctx.results.hashNames,
                )}\` did match \`${typeToString(
                    expected,
                    ctx.results.hashNames,
                )}\`.`,
                expected.type === 'task'
                    ? typeToString(
                          expandTask(
                              asTaskType(expected, ctx) as TaskType,
                              expected.form,
                              ctx,
                          ) as Type,
                          ctx.results.hashNames,
                      )
                    : '',
                JSON.stringify(noForm(candidate)),
                JSON.stringify(noForm(expected)),
            ];

            return {
                message: () => lines.join('\n'),
                pass: true,
            };
        }
        return {
            message: () =>
                `Type \`${typeToString(
                    candidate,
                    ctx.results.hashNames,
                )}\` did not match \`${typeToString(
                    expected,
                    ctx.results.hashNames,
                )}\`. ${errorToString(result, ctx)}\n${JSON.stringify(
                    noForm(candidate),
                )}\n${JSON.stringify(noForm(expected))}`,
            pass: false,
        };
    },
});

const parseTypes = (
    text: string,
): { ctx: CstCtx; types: { raw: string; type: Type }[] } => {
    const ctx = newCtx();
    const track: { [idx: number]: [number, number] } = {};
    let state = parseByCharacter(text, ctx, { kind: 'type', track });
    state = autoCompleteIfNeeded(state, ctx.results.display);
    return {
        ctx,
        types: (state.map[-1] as ListLikeContents).values.map((idx) => {
            const loc = track[idx];
            return {
                raw: loc ? text.slice(loc[0], loc[1]) : '<no loc?>',
                type: nodeToType(fromMCST(idx, state.map), ctx),
            };
        }),
    };
};

describe('all the things', () => {
    it('should parse a type', () => {
        expect(noForm(parseTypes('int').types[0].type)).toEqual({
            type: 'builtin',
            name: 'int',
        });
    });

    const should = parseTypes(shouldMatch.trim().replace(/\n/g, ' '));
    const shouldNot = parseTypes(shouldNotMatch.trim().replace(/\n/g, ' '));

    it('should have parsed', () => {
        expect(should.types.length).not.toEqual([]);
        expect(shouldNot.types.length).not.toEqual([]);
    });

    for (let i = 0; i < should.types.length; i += 2) {
        it(i + ' ' + should.types[i].raw, () => {
            expect(should.types[i].type).toMatchType(
                should.types[i + 1].type,
                should.ctx,
            );
        });
    }

    for (let i = 0; i < shouldNot.types.length; i += 2) {
        it(i + ' ' + shouldNot.types[i].raw, () => {
            expect(shouldNot.types[i].type).not.toMatchType(
                shouldNot.types[i + 1].type,
                shouldNot.ctx,
            );
        });
    }

    // it('checlk fail', () => {
    //     fail;
    // });
});
