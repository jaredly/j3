// Some things

import { Report } from '../src/get-type/get-types-new';
import {
    _matchOrExpand,
    _matchesType,
    matchesType,
} from '../src/get-type/matchesType';
import { autoCompleteIfNeeded, parseByCharacter } from '../src/parse/parse';
import { Ctx, newCtx, noForm } from '../src/to-ast/Ctx';
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
`;
// 1. float
// ('hi 10) : ((tfn [T] [('hi T)]) int)
// (lettype [vec2 {x float y float}] (array vec2 4)) : (array {x float y float})

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchType(expected: Type, ctx: Ctx): R;
        }
    }
}

export const typeToString = (type: Type, ctx: Ctx) =>
    nodeToString(nodeForType(type, ctx), ctx.hashNames);

expect.extend({
    toMatchType(candidate: Type, expected: Type, ctx: Ctx) {
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
                    ctx,
                )}\` did not match \`${typeToString(
                    expected,
                    ctx,
                )}\`. ${errorToString(result, ctx)}\n${JSON.stringify(
                    noForm(candidate),
                )}\n${JSON.stringify(noForm(expected))}`,
            pass: false,
        };
    },
});

// const lefts = [];
// const rights = [];

const parseTypes = (ctx: Ctx, text: string): Type[] => {
    let state = parseByCharacter(text, ctx, {
        updateCtx: true,
        kind: 'type',
    });
    state = autoCompleteIfNeeded(state, ctx);
    return (state.map[-1] as ListLikeContents).values.map((idx) =>
        nodeToType(fromMCST(idx, state.map), ctx),
    );
};

const ctx = newCtx();

it('should parse a type', () => {
    expect(noForm(parseTypes(newCtx(), 'int')[0])).toEqual({
        type: 'builtin',
        name: 'int',
    });
});

const types = parseTypes(ctx, whatsits.trim().replace(/\n/g, ' '));
for (let i = 0; i < types.length; i += 2) {
    it(i + '', () => {
        expect(types[i]).toMatchType(types[i + 1], ctx);
    });
}
// whatsits
//     .trim()
//     .split('\n')
//     .forEach((line) => {
//         const [left, right] = line.split(' : ');
//         it(left, () => {
//             const ltype = parseType(ctx, left);
//             const rtype = parseType(ctx, right);
//             expect(ltype).toMatchType(rtype, ctx);
//             // expect(matchesType(ltype, rtype, ctx, ltype.form)).toBeTruthy();
//         });
//         // expect(nodeToString(fromMCST(idx, data), ctx.hashNames)).toEqual(
//         //     expected,
//         // );
//     });

it('should work', () => {});
