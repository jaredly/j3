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
import { loadIncremental } from './incrementallyBuildTree';
import { ListLikeContents } from '../src/types/mcst';

it('skipping for now', () => {});

readdirSync(__dirname)
    .filter((m) => m.endsWith('.jd') && !m.endsWith('.types.jd'))
    .filter(() => false)
    .forEach((name) => {
        describe(name, () => {
            const raw = readFileSync(__dirname + '/' + name, 'utf8');
            const lines = idxLines(raw);

            let res;
            try {
                res = loadIncremental(raw, undefined, false);
            } catch (err) {
                console.log(name, raw);
                throw new Error(`Failed to load ${name} ${raw}`);
            }
            const { store, ectx } = res;
            const root = store.map[store.root] as ListLikeContents;
            for (let idx of root.values) {
                const node = store.map[idx];
                const result = ectx.results[idx];
                if (node.type === 'comment') {
                    return;
                }
                if (result.status === 'failure') {
                    it(`${name}:${
                        getLine(lines, node.loc.start) + 1
                    } ${raw.slice(node.loc.start, node.loc.end)} :: ${
                        result.code
                    }`, () => {
                        expect(result.error).toBe(null);
                    });
                } else if (result.status === 'errors') {
                    it(`${name}:${
                        getLine(lines, node.loc.start) + 1
                    } ${raw.slice(node.loc.start, node.loc.end)}`, () => {
                        expect(result.errors).toEqual([]);
                    });
                } else if (result.expr.type !== 'def') {
                    it(`${name}:${
                        getLine(lines, node.loc.start) + 1
                    } ${raw.slice(node.loc.start, node.loc.end)} :: ${
                        result.code
                    }`, () => {
                        expect(result.value).toBe(true);
                    });
                }
            }

            // const parsed = parse(raw).map(preprocess);
            // const ctx = newEvalCtx(newCtx());
            // const results = [];
            // const lines = idxLines(raw);

            // for (let node of parsed) {
            //     const res = nodeToExpr(node, ctx.ctx);

            //     // TODO: Go in, and see if we have any type errors
            //     // like enumerate them.
            //     // getCachedType(res, ctx);
            //     const type = getType(res, ctx.ctx);

            //     const ts = stmtToTs(res, ctx.ctx, 'top');
            //     const code = generator(t.file(t.program([ts]))).code;
            //     let item: {
            //         result?: any;
            //         node: Node;
            //         code: string;
            //         type?: Type | void;
            //         err?: Error;
            //     };
            //     try {
            //         const fn = new Function('$terms', 'fail', code);
            //         const result = fn(ctx.terms, (message: string) => {
            //             // console.log(`Encountered a compilation failure: `, message);
            //             throw new Error(message);
            //         });
            //         item = { result, node, code, type };
            //         ctx.ctx = addDef(res, ctx.ctx);
            //     } catch (err) {
            //         item = {
            //             err: new Error(
            //                 `Failed to run: ${(err as Error).message}, ${code}`,
            //             ),
            //             node,
            //             code,
            //             type,
            //         };
            //     }
            //     it(`${name}:${
            //         getLine(lines, item.node.loc.start) + 1
            //     } ${raw.slice(item.node.loc.start, item.node.loc.end)} ::: ${
            //         item.code
            //     }`, () => {
            //         if (item.err) {
            //             throw item.err;
            //         }
            //         if (
            //             item.type?.type === 'builtin' &&
            //             item.type.name === 'bool'
            //         ) {
            //             expect(item.result).toEqual(true);
            //         }
            //     });
            // }
        });
    });
