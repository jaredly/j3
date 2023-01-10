import { readdirSync, readFileSync } from 'fs';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, newCtx, nodeToType, noForm } from '../src/to-ast/to-ast';
import { stmtToTs } from '../src/to-ast/to-ts';
import { newEvalCtx } from '../web/store';
import * as t from '@babel/types';
import { typeForExpr } from '../src/to-ast/typeForExpr';
import { getLine, idxLines, removeDecorators } from '../src/to-ast/utils';
import { Node } from '../src/types/cst';
import { transformNode } from '../src/types/transform-cst';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getType, Report } from '../src/types/get-types-new';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

readdirSync(__dirname)
    .filter((m) => m.endsWith('.types.jd'))
    .forEach((name) => {
        describe(name, () => {
            const raw = readFileSync(__dirname + '/' + name, 'utf8');
            const parsed = parse(raw);
            const ctx = newEvalCtx(newCtx());
            const lines = idxLines(raw);

            for (let node of parsed) {
                // const types = {};
                // getType(res, ctx.ctx, types);
                it(`${name}:${getLine(lines, node.loc.start) + 1} ${raw.slice(
                    node.loc.start,
                    node.loc.end,
                )}`, () => {
                    const results = removeDecorators(node, ctx.ctx);
                    const res = nodeToExpr(results.node, ctx.ctx);
                    const report: Report = { types: {}, errors: {} };
                    // const type = getType(res, ctx.ctx, report);
                    results.errors.forEach((err) => {
                        expect(report.errors[err.idx]).toBeTruthy();
                    });
                    results.expected.forEach(({ idx, type }) => {
                        expect(noForm(report.types[idx])).toEqual(noForm(type));
                    });
                });
            }
        });
    });
