// Some things

import { Report } from '../src/get-type/get-types-new';
import {
    _matchOrExpand,
    _matchesType,
    matchesType,
} from '../src/get-type/matchesType';
import { autoCompleteIfNeeded, parseByCharacter } from '../src/parse/parse';
import { Ctx, newCtx, noForm } from '../src/to-ast/Ctx';
import { CompilationResults, CstCtx } from '../src/to-ast/library';
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
`;
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

export const typeToString = (type: Type, hashNames: Ctx['hashNames']) =>
    nodeToString(nodeForType(type, hashNames), hashNames);

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
                )}\`. ${errorToString(
                    result,
                    ctx.results.hashNames,
                )}\n${JSON.stringify(noForm(candidate))}\n${JSON.stringify(
                    noForm(expected),
                )}`,
            pass: false,
        };
    },
});

const parseTypes = (ctx: CstCtx, text: string): Type[] => {
    let state = parseByCharacter(text, ctx, {
        kind: 'type',
    });
    state = autoCompleteIfNeeded(state, ctx.results.display);
    return (state.map[-1] as ListLikeContents).values.map((idx) =>
        nodeToType(fromMCST(idx, state.map), ctx),
    );
};

describe('all the things', () => {
    it('should parse a type', () => {
        expect(noForm(parseTypes(newCtx(), 'int')[0])).toEqual({
            type: 'builtin',
            name: 'int',
        });
    });

    const ctx = newCtx();
    const types = parseTypes(ctx, whatsits.trim().replace(/\n/g, ' '));
    it('should have parsed', () => {
        expect(types.length).not.toEqual([]);
    });
    for (let i = 0; i < types.length; i += 2) {
        it(i + '', () => {
            expect(types[i]).toMatchType(types[i + 1], ctx);
        });
    }

    // it('checlk fail', () => {
    //     fail;
    // });
});