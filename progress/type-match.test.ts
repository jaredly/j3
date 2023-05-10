// Some things

import { _matchOrExpand, typeToString } from '../src/get-type/matchesType';
import { autoCompleteIfNeeded, parseByCharacter } from '../src/parse/parse';
import { Ctx, newCtx, noForm } from '../src/to-ast/Ctx';
import { CstCtx } from '../src/to-ast/library';
import { nodeToType } from '../src/to-ast/nodeToType';
import { nodeForType } from '../src/to-cst/nodeForType';
import { nodeToString } from '../src/to-cst/nodeToString';
import { errorToString } from '../src/to-cst/show-errors';
import { Type } from '../src/types/ast';
import { ListLikeContents, fromMCST } from '../src/types/mcst';

const whatsits = `
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
            return {
                message: () => `matched`,
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
    ctx: CstCtx,
    text: string,
    track: { [idx: number]: [number, number] },
): Type[] => {
    let state = parseByCharacter(text, ctx, { kind: 'type', track });
    state = autoCompleteIfNeeded(state, ctx.results.display);
    return (state.map[-1] as ListLikeContents).values.map((idx) =>
        nodeToType(fromMCST(idx, state.map), ctx),
    );
};

describe('all the things', () => {
    it('should parse a type', () => {
        expect(noForm(parseTypes(newCtx(), 'int', {})[0])).toEqual({
            type: 'builtin',
            name: 'int',
        });
    });

    const ctx = newCtx();
    const track: { [idx: number]: [number, number] } = {};
    const raw = whatsits.trim().replace(/\n/g, ' ');
    const types = parseTypes(ctx, raw, track);
    it('should have parsed', () => {
        expect(types.length).not.toEqual([]);
    });
    for (let i = 0; i < types.length; i += 2) {
        const loc = track[types[i].form.loc];
        it(
            i + (loc ? ' <' + raw.slice(loc[0], loc[1]) + '>' : ' no loc idk'),
            () => {
                expect(types[i]).toMatchType(types[i + 1], ctx);
            },
        );
    }

    // it('checlk fail', () => {
    //     fail;
    // });
});
