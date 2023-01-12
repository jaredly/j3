import { readdirSync, readFileSync } from 'fs';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, Ctx, newCtx, nodeToType, noForm } from '../src/to-ast/to-ast';
import { stmtToTs } from '../src/to-ast/to-ts';
import { newEvalCtx } from '../web/store';
import * as t from '@babel/types';
import { typeForExpr } from '../src/to-ast/typeForExpr';
import {
    DecExpected,
    getLine,
    idxLines,
    removeDecorators,
} from '../src/to-ast/utils';
import { Node } from '../src/types/cst';
import { transformNode } from '../src/types/transform-cst';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getType, Report } from '../src/types/get-types-new';
import { nodeForType } from '../src/to-cst/nodeForExpr';
import { nodeToString } from '../src/to-cst/nodeToString';
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

        Object.keys(report.errors).forEach((idx) => {
            if (touched[+idx]) {
                return;
            }

            report.errors[+idx].forEach((err) => {
                switch (err.type) {
                    case 'invalid type':
                        lines.push(
                            `Invalid type! Expected ${nodeToString(
                                nodeForType(err.expected, ctx),
                            )}, found ${nodeToString(
                                nodeForType(err.found, ctx),
                            )} at idx ${err.found.form.loc.idx}`,
                        );
                }
            });
        });

        expected.expected.forEach(({ idx, type }) => {
            try {
                expect(noForm(report.types[idx])).toEqual(noForm(type));
            } catch (err) {
                lines.push(
                    `Expected type ${nodeToString(
                        nodeForType(type, ctx),
                    )} at ${idx}, but found ${nodeToString(
                        nodeForType(report.types[idx], ctx),
                    )}`,
                );
            }
        });

        if (lines.length === 0) {
            return {
                message: () => `matched`,
                pass: true,
            };
        } else {
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
                it(`${name}:${getLine(lines, node.loc.start) + 1} ${raw.slice(
                    node.loc.start,
                    node.loc.end,
                )}`, () => {
                    const results = removeDecorators(node, ctx.ctx);
                    const res = nodeToExpr(results.node, ctx.ctx);
                    const report: Report = { types: {}, errors: {} };
                    const _ = getType(res, ctx.ctx, report);
                    expect(report).toMatchExpected(results.expected, ctx.ctx);
                });
            }
        });
    });
