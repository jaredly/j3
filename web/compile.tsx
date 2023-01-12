import generate from '@babel/generator';
import * as t from '@babel/types';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, nil, noForm } from '../src/to-ast/to-ast';
import { stmtToTs } from '../src/to-ast/to-ts';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { EvalCtx, Store } from './store';
import objectHash from 'object-hash';
import { CacheCtx, getCachedType } from '../src/types/check-types';
import { getType, Report } from '../src/get-type/get-types-new';
import { validateExpr } from '../src/get-type/validate';

export const compile = (store: Store, ectx: EvalCtx) => {
    let { ctx, last, terms, nodes, results } = ectx;
    const root = store.map[store.root].node as ListLikeContents;

    // const cctx: CacheCtx = {
    //     ctx,
    //     types: ectx.types,
    //     globalTypes: ectx.globalTypes,
    // };
    ectx.report.errors = {};

    root.values.forEach((idx) => {
        if (store.map[idx].node.type === 'comment') {
            results[idx] = {
                status: 'success',
                value: undefined,
                code: '// a comment',
                expr: nil,
            };
            return;
        }
        ctx.sym.current = 0;
        const res = nodeToExpr(fromMCST(idx, store.map), ctx);
        const hash = objectHash(noForm(res));
        if (last[idx] === hash) {
            const prev = results[idx];
            if (prev.status === 'errors') {
                Object.assign(ectx.report.errors, prev.errors);
            }
            return;
        }

        const report: Report = { errors: {}, types: {} };

        const _ = getType(res, ctx, report);
        validateExpr(res, ctx, report.errors);

        const hasErrors = Object.keys(report.errors).length > 0;

        Object.assign(ectx.report.errors, report.errors);
        Object.assign(ectx.report.types, report.types);

        if (hasErrors) {
            results[idx] = {
                status: 'errors',
                expr: res,
                errors: report.errors,
            };
            last[idx] = hash;
            return;
        }

        // ok, so the increasing idx's are really coming to haunt me.
        // can I reset them?
        const ts = stmtToTs(res, ctx, 'top');
        const code = generate(t.file(t.program([ts]))).code;
        try {
            const fn = new Function('$terms', 'fail', code);
            results[idx] = {
                status: 'success',
                value: fn(terms, (message: string) => {
                    // console.log(`Encountered a compilation failure: `, message);
                    throw new Error(message);
                }),
                code,
                expr: res,
            };
            last[idx] = hash;
        } catch (err) {
            results[idx] = {
                status: 'failure',
                error: (err as Error).message,
                code,
                expr: res,
            };
            last[idx] = hash;
            return;
        }
        ctx = addDef(res, ctx);
    });

    ectx.ctx = ctx;
};
