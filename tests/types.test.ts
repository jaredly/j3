import { readdirSync, readFileSync } from 'fs';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, Ctx, newCtx, noForm } from '../src/to-ast/to-ast';
import { newEvalCtx } from '../web/store';
import {
    DecExpected,
    getLine,
    idxLines,
    removeDecorators,
} from '../src/to-ast/utils';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getType, Report } from '../src/get-type/get-types-new';
import { makeRCtx } from '../src/to-cst/nodeForExpr';
import { nodeForType } from '../src/to-cst/nodeForType';
import { nodeToString } from '../src/to-cst/nodeToString';
import { validateExpr } from '../src/get-type/validate';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchExpected(expected: DecExpected, ctx: Ctx): R;
        }
    }
}

expect.extend({
    toMatchExpected(report: Report, expected: DecExpected, ctx: Ctx) {
        let lines: string[] = [];

        const touched: { [key: number]: boolean } = {};
        expected.errors.forEach((err) => {
            touched[err.idx] = true;
            const found = report.errors[err.idx];
            if (!found) {
                lines.push(
                    `No error at idx ${err.idx}, expected ${err.message}`,
                );
                return;
            }
            if (found.length !== 1) {
                lines.push(
                    `Too many errors (${found.length}) at idx ${
                        err.idx
                    }, expected ${err.message}. ${found
                        .map((f) => f.type)
                        .join(', ')}`,
                );
                return;
            }
            if (found[0].type !== err.message) {
                lines.push(
                    `Expected error: ${err.message} at ${err.idx}, found ${found[0].type}`,
                );
            }
        });

        const rctx = makeRCtx(ctx);
        Object.keys(report.errors).forEach((idx) => {
            if (touched[+idx]) {
                return;
            }

            report.errors[+idx].forEach((err) => {
                switch (err.type) {
                    case 'invalid type':
                        lines.push(
                            `Invalid type! Expected ${nodeToString(
                                nodeForType(err.expected, rctx),
                            )}, found ${nodeToString(
                                nodeForType(err.found, rctx),
                            )} at idx ${err.found.form.loc.idx}`,
                        );
                        break;
                    default:
                        lines.push(
                            `Some error ${
                                err.type
                            } at ${idx} : ${JSON.stringify(err)}`,
                        );
                }
            });
        });

        expected.expected.forEach(({ idx, type }) => {
            try {
                expect(noForm(report.types[idx])).toEqual(noForm(type));
            } catch (err) {
                lines.push(
                    `Expected type \`${nodeToString(
                        nodeForType(type, rctx),
                    )}\` at ${idx}, but found \`${nodeToString(
                        nodeForType(report.types[idx], rctx),
                    )}\``,
                );
            }
        });

        if (lines.length === 0) {
            return {
                message: () => `matched`,
                pass: true,
            };
        } else {
            lines.unshift(JSON.stringify(noForm({ report, expected })) + '\n');
            return {
                message: () => lines.join('\n'),
                pass: false,
            };
        }
    },
});

readdirSync(__dirname)
    .filter((m) => m.endsWith('.types.jd'))
    .forEach((name) => {
        describe(name, () => {
            const raw = readFileSync(__dirname + '/' + name, 'utf8');
            const parsed = parse(raw);
            const ctx = newEvalCtx(newCtx());
            const lines = idxLines(raw);

            for (let node of parsed) {
                if (node.type === 'comment') {
                    continue;
                }
                it(`${name}:${getLine(lines, node.loc.start) + 1} ${raw.slice(
                    node.loc.start,
                    node.loc.end,
                )}`, () => {
                    const results = removeDecorators(node, ctx.ctx);
                    const res = nodeToExpr(results.node, ctx.ctx);
                    const report: Report = { types: {}, errors: {} };
                    const _ = getType(res, ctx.ctx, report);
                    validateExpr(res, ctx.ctx, report.errors);
                    expect(report).toMatchExpected(results.expected, ctx.ctx);
                    if (!Object.keys(report.errors).length) {
                        ctx.ctx = addDef(res, ctx.ctx);
                    }
                });
            }
        });
    });
