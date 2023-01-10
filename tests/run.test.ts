import generate from '@babel/generator';
import { readdirSync, readFileSync } from 'fs';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, newCtx } from '../src/to-ast/to-ast';
import { stmtToTs } from '../src/to-ast/to-ts';
import { getCachedType } from '../src/types/check-types';
import { newEvalCtx } from '../web/store';
import * as t from '@babel/types';
import { typeForExpr } from '../src/to-ast/typeForExpr';

const idxLines = (raw: string) => {
    const starts: number[] = [];
    let total = 0;
    raw.split('\n').forEach((line) => {
        starts.push(total);
        total += line.length + 1;
    });
    return starts;
};

const getLine = (lines: number[], idx: number) => {
    for (let i = 0; i < lines.length; i++) {
        if (idx < lines[i]) {
            return i - 1;
        }
    }
    return lines.length - 1;
};

readdirSync(__dirname)
    .filter((m) => m.endsWith('.jd') && !m.endsWith('.fail.jd'))
    .forEach((name) => {
        describe(name, () => {
            const raw = readFileSync(__dirname + '/' + name, 'utf8');
            const parsed = parse(raw);
            const ctx = newEvalCtx(newCtx());
            const results = [];
            const lines = idxLines(raw);

            for (let node of parsed) {
                const res = nodeToExpr(node, ctx.ctx);

                // TODO: Go in, and see if we have any type errors
                // like enumerate them.
                // getCachedType(res, ctx);

                const type = typeForExpr(res, ctx.ctx);

                const ts = stmtToTs(res, ctx.ctx, 'top');
                const code = generate(t.file(t.program([ts]))).code;
                try {
                    const fn = new Function('$terms', 'fail', code);
                    const result = fn(ctx.terms, (message: string) => {
                        // console.log(`Encountered a compilation failure: `, message);
                        throw new Error(message);
                    });
                    results.push({ result, node, code, type });
                    ctx.ctx = addDef(res, ctx.ctx);
                } catch (err) {
                    results.push({
                        err: new Error(
                            `Failed to run: ${(err as Error).message}, ${code}`,
                        ),
                        node,
                        code,
                        type,
                    });
                }
            }

            results.forEach((item) => {
                it(`${name}:${
                    getLine(lines, item.node.loc.start) + 1
                } ${raw.slice(item.node.loc.start, item.node.loc.end)} ::: ${
                    item.code
                }`, () => {
                    if (item.err) {
                        throw item.err;
                    }
                    if (
                        item.type.type === 'builtin' &&
                        item.type.name === 'bool'
                    ) {
                        expect(item.result).toEqual(true);
                    }
                });
            });
        });
    });
