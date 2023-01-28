import generator from '@babel/generator';
import { readdirSync, readFileSync } from 'fs';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef } from '../src/to-ast/to-ast';
import { newCtx } from '../src/to-ast/Ctx';
import { stmtToTs } from '../src/to-ast/to-ts';
import { newEvalCtx } from '../web/store';
import * as t from '@babel/types';
import { getLine, idxLines } from '../src/to-ast/utils';
import { Node } from '../src/types/cst';
import { Type } from '../src/types/ast';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getType } from '../src/get-type/get-types-new';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// @ts-ignore // jest is being silly
const generate: typeof generator = generator.default;

readdirSync(__dirname)
    .filter((m) => m.endsWith('.jd') && !m.endsWith('.types.jd'))
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
                const type = getType(res, ctx.ctx);

                const ts = stmtToTs(res, ctx.ctx, 'top');
                const code = generate(t.file(t.program([ts]))).code;
                let item: {
                    result?: any;
                    node: Node;
                    code: string;
                    type?: Type | void;
                    err?: Error;
                };
                try {
                    const fn = new Function('$terms', 'fail', code);
                    const result = fn(ctx.terms, (message: string) => {
                        // console.log(`Encountered a compilation failure: `, message);
                        throw new Error(message);
                    });
                    item = { result, node, code, type };
                    ctx.ctx = addDef(res, ctx.ctx);
                } catch (err) {
                    item = {
                        err: new Error(
                            `Failed to run: ${(err as Error).message}, ${code}`,
                        ),
                        node,
                        code,
                        type,
                    };
                }
                it(`${name}:${
                    getLine(lines, item.node.loc.start) + 1
                } ${raw.slice(item.node.loc.start, item.node.loc.end)} ::: ${
                    item.code
                }`, () => {
                    if (item.err) {
                        throw item.err;
                    }
                    if (
                        item.type?.type === 'builtin' &&
                        item.type.name === 'bool'
                    ) {
                        expect(item.result).toEqual(true);
                    }
                });
            }
        });
    });
