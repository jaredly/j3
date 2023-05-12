// Now bringing in autocomplete and such

import { splitCase } from '../../progress/test-utils';
import { parseByCharacter } from '../../src/parse/parse';
import { blank, newCtx, noForm } from '../../src/to-ast/Ctx';
import { fromMCST, ListLikeContents } from '../../src/types/mcst';
import { CstCtx } from '../to-ast/library';
import { nodeToType } from '../to-ast/nodeToType';
import { errorToString } from '../to-cst/show-errors';
import { Type } from '../types/ast';
import { asTaskType } from './asTaskType';
import { expandTask } from './expandTask';
import { _matchOrExpand, typeToString } from './matchesType';

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

const data = `
(@task [('Read () string) ('Failure int)] string)
-> [('Failure int) \
('Read () (fn [value:string] (@task [('Failure int) ('Read () string)] string))) \
('Return string)]

(@task ('Read () string) string ('Write string ()))
-> [('Read () (fn [value:string] (@task [('Read () string) ('Write string ())] string))) \
('Return string)]
`
    .trim()
    .split('\n\n');

describe('expandTask', () => {
    data.forEach((chunk, i) => {
        const only = chunk.startsWith('!!!');
        if (only) {
            chunk = chunk.slice(3);
        }
        const { input, expected, expectedType, errors } = splitCase(chunk);

        (only ? it.only : it)(`${i} ${input}`, () => {
            const ctx = newCtx();
            const data = parseByCharacter(input.replace(/\s+/g, ' '), ctx, {
                kind: 'type',
            });
            const idx = (data.map[-1] as ListLikeContents).values.slice(-1)[0];
            const t = nodeToType(fromMCST(idx, data.map), ctx);

            const at = asTaskType(t, ctx);
            if (at.type === 'error') {
                expect(at).toBe(null);
                return;
            }

            expect(at.result).toMatchType(
                { type: 'builtin', name: 'string', form: blank },
                ctx,
            );

            const ex = expandTask(at, t.form, ctx);
            const out =
                ex.type === 'error'
                    ? errorToString(ex.error, ctx)
                    : typeToString(ex, ctx.results.hashNames);

            if (expectedType) {
                expect(out).toEqual(expectedType);
            }
        });
    });
});
