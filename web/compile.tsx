import generate from '@babel/generator';
import * as t from '@babel/types';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef } from '../src/to-ast/to-ast';
import { Ctx, nil, noForm } from '../src/to-ast/Ctx';
import { stmtToTs } from '../src/to-ast/to-ts';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { EvalCtx, notify, Store } from './store';
import objectHash from 'object-hash';
import { getType, Report } from '../src/get-type/get-types-new';
import { validateExpr } from '../src/get-type/validate';

export const builtins = {
    toString: (t: number | boolean) => t + '',
    debugToString: (t: any) => JSON.stringify(t),
};

export const compile = (store: Store, ectx: EvalCtx) => {
    let { ctx, last, terms, nodes, results } = ectx;
    const root = store.map[store.root].node as ListLikeContents;

    // const cctx: CacheCtx = {
    //     ctx,
    //     types: ectx.types,
    //     globalTypes: ectx.globalTypes,
    // };
    const prevErrors = ectx.report.errors;

    ectx.report.errors = {};
    const allStyles: Ctx['display'] = {};
    const prevStyles = ctx.display;

    root.values.forEach((idx) => {
        if (store.map[idx].node.type === 'comment') {
            results[idx] = {
                status: 'success',
                value: undefined,
                code: '// a comment',
                expr: nil,
                display: {},
            };
            return;
        }
        ctx.sym.current = 0;

        const report: Report = { errors: {}, types: {} };
        ctx.errors = report.errors;
        ctx.display = {};

        const res = nodeToExpr(fromMCST(idx, store.map), ctx);
        const hash = objectHash(noForm(res));
        if (last[idx] === hash) {
            const prev = results[idx];
            if (prev.status === 'errors') {
                Object.assign(ectx.report.errors, prev.errors);
            }
            Object.assign(allStyles, prev.display);
            return;
        }

        ctx = rmPrevious(ctx, nodes[idx]);

        const _ = getType(res, ctx, report);
        validateExpr(res, ctx, report.errors);

        const hasErrors = Object.keys(report.errors).length > 0;

        Object.assign(ectx.report.errors, report.errors);
        Object.assign(ectx.report.types, report.types);
        Object.assign(allStyles, ctx.display);

        if (hasErrors) {
            // console.log(idx, 'had errors I guess');
            results[idx] = {
                status: 'errors',
                expr: res,
                errors: report.errors,
                display: ctx.display,
            };
            last[idx] = hash;
            return;
        }

        let code = 'failed to generate';
        try {
            const ts = stmtToTs(res, ctx, 'top');
            code = generate(t.file(t.program([ts]))).code;
        } catch (err) {
            //
        }
        // ok, so the increasing idx's are really coming to haunt me.
        // can I reset them?
        try {
            const fn = new Function(
                '$terms',
                `{${Object.keys(builtins).join(',')}}`,
                'fail',
                code,
            );
            results[idx] = {
                status: 'success',
                value: fn(terms, builtins, (message: string) => {
                    // console.log(`Encountered a compilation failure: `, message);
                    throw new Error(message);
                }),
                code,
                expr: res,
                display: ctx.display,
            };
            last[idx] = hash;
        } catch (err) {
            results[idx] = {
                status: 'failure',
                error: (err as Error).message,
                code,
                expr: res,
                display: ctx.display,
            };
            last[idx] = hash;
            return;
        }
        ctx = addDef(res, ctx);
        if (res.type === 'def') {
            nodes[idx] = {
                type: 'Def',
                node: res.value,
                names: { [res.name]: res.hash },
            };
        }
    });

    // Now figure out what's changed
    const changed: { [key: number]: true } = {};
    Object.keys(prevErrors).forEach((key) => {
        if (!ectx.report.errors[+key]) {
            changed[+key] = true;
        }
    });
    Object.keys(ectx.report.errors).forEach((key) => {
        if (!prevErrors[+key]) {
            changed[+key] = true;
        }
    });

    Object.keys(prevStyles).forEach((key) => {
        if (allStyles[+key] !== prevStyles[+key]) {
            changed[+key] = true;
        }
    });
    Object.keys(allStyles).forEach((key) => {
        if (allStyles[+key] !== prevStyles[+key]) {
            changed[+key] = true;
        }
    });
    ctx.display = allStyles;

    const keys = Object.keys(changed);
    if (keys.length) {
        notify(
            store,
            keys.map((k) => +k),
        );
        // console.log(changed);
    }

    ectx.ctx = ctx;
};

const rmPrevious = (ctx: Ctx, node?: EvalCtx['nodes'][0]): Ctx => {
    if (!node) {
        return ctx;
    }
    if (node.type === 'Def') {
        const names = { ...ctx.global.names };
        Object.keys(node.names).forEach((key) => {
            names[key] = names[key].filter((h) => h !== node.names[key]);
        });
        return { ...ctx, global: { ...ctx.global, names } };
    }
    return ctx;
};
