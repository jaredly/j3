import generate from '@babel/generator';
import * as t from '@babel/types';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, noForm } from '../src/to-ast/to-ast';
import { stmtToTs } from '../src/to-ast/to-ts';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { EvalCtx, Store } from './store';
import objectHash from 'object-hash';
import { CCtx, getCachedType } from '../src/types/check-types';

export const compile = (store: Store, ectx: EvalCtx) => {
    let { ctx, last, terms, nodes, results } = ectx;
    const root = store.map[store.root].node.contents as ListLikeContents;

    const cctx: CCtx = {
        ctx,
        types: ectx.types,
        globalTypes: ectx.globalTypes,
    };

    root.values.forEach((idx) => {
        if (store.map[idx].node.contents.type === 'comment') {
            results[idx] = {
                status: 'success',
                value: undefined,
                code: '// a comment',
            };
            return;
        }
        ctx.sym.current = 0;
        const res = nodeToExpr(fromMCST(idx, store.map), ctx);
        const hash = objectHash(noForm(res));
        if (last[idx] === hash) {
            return;
        }

        getCachedType(res, cctx);

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
            };
            last[idx] = hash;
        } catch (err) {
            results[idx] = {
                status: 'failure',
                error: (err as Error).message,
                code,
            };
            last[idx] = hash;
            return;
        }
        ctx = addDef(res, ctx);
        cctx.ctx = ctx;
    });

    ectx.ctx = ctx;
};
