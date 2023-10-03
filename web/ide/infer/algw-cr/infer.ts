import { unify } from './unify';
import {
    TypeEnv,
    Exp,
    Ctx,
    Subst,
    Type,
    instantiate,
    newTyVar,
    apply,
    applyTE,
    composeSubst,
    generalize,
} from './types';

import { Prim, newTyVarWith, fn, rec, vr } from './types';
import { trace } from '.';

export function calog<T extends Function>(name: string, fn: T): T {
    return ((...args: any[]) => {
        const res = fn(...args);
        trace.push({ fn: name, args, res });
        return res;
    }) as any;
}

export const infer = calog(
    'infer',
    (env: TypeEnv, exp: Exp, ctx: Ctx): [Subst, Type] => {
        switch (exp.type) {
            case 'Var': {
                const sigma = env[exp.name];
                if (!sigma) {
                    throw new Error(`unknown variable ${exp.name}`);
                }
                return [{}, instantiate(sigma, ctx)];
            }
            case 'Prim':
                return [{}, tiPrim(exp.prim, ctx)];
            case 'Abs': {
                const tv = newTyVar('abs', ctx);
                const env_ = { ...env };
                delete env_[exp.name];
                env_[exp.name] = { type: 'Scheme', vbls: {}, body: tv };
                const [s1, t1] = infer(env_, exp.body, ctx);
                return [s1, { type: 'Fun', arg: apply(s1, tv), body: t1 }];
            }
            case 'App': {
                const [s1, t1] = infer(env, exp.fn, ctx);
                const [s2, t2] = infer(applyTE(s1, env), exp.arg, ctx);
                const tv = newTyVar('app-result', ctx);
                const s3 = unify(
                    apply(s2, t1),
                    { type: 'Fun', arg: t2, body: tv },
                    ctx,
                );
                return [
                    // composeSubst(composeSubst(s3, s2), s1),
                    composeSubst(s3, composeSubst(s2, s1)),
                    apply(s3, tv),
                ];
            }
            case 'Let': {
                const [s1, t1] = infer(env, exp.init, ctx);
                const env_ = { ...env };
                delete env_[exp.name];
                env_[exp.name] = generalize(applyTE(s1, env), t1);
                const [s2, t2] = infer(applyTE(s1, env_), exp.body, ctx);
                return [composeSubst(s2, s1), t2];
            }
        }
    },
);
export const tiPrim = (prim: Prim, ctx: Ctx): Type => {
    switch (prim.type) {
        case 'Int':
            return { type: 'Int' };
        case 'Bool':
            return { type: 'Bool' };
        case 'Add':
            return {
                type: 'Fun',
                arg: { type: 'Int' },
                body: {
                    type: 'Fun',
                    arg: { type: 'Int' },
                    body: { type: 'Int' },
                },
            };
        case 'Cond': {
            const a = newTyVar('cond', ctx);
            return {
                type: 'Fun',
                arg: { type: 'Bool' },
                body: {
                    type: 'Fun',
                    arg: a,
                    body: { type: 'Fun', arg: a, body: a },
                },
            };
        }
        case 'RecordEmpty':
            return { type: 'Record', body: { type: 'RowEmpty' } };
        case 'RecordSelect': {
            const a = newTyVar('rs-head', ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                'rs-tail',
                ctx,
            );
            return fn(
                rec({
                    type: 'RowExtend',
                    name: prim.name,
                    head: a,
                    tail: r,
                }),
                a,
            );
        }
        case 'RecordExtend': {
            const a = newTyVar('re-head', ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                're-tail',
                ctx,
            );
            return fn(
                a,
                fn(rec(r), {
                    type: 'Record',
                    body: {
                        type: 'RowExtend',
                        name: prim.name,
                        head: a,
                        tail: r,
                    },
                }),
            );
        }
        case 'RecordRestrict': {
            const a = newTyVar('rr-head', ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                'rr-tail',
                ctx,
            );
            return fn(
                rec({ type: 'RowExtend', name: prim.name, head: a, tail: r }),
                rec(r),
            );
        }
        case 'VariantInject': {
            const a = newTyVar('vi-head', ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                'rvi-without-' + prim.name,
                ctx,
            );
            return fn(
                a,
                vr({ type: 'RowExtend', name: prim.name, head: a, tail: r }),
            );
        }
        case 'VariantElim': {
            const a = newTyVar('ve-head', ctx);
            const b = newTyVar('ve-res', ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                've-without-' + prim.name,
                ctx,
            );
            return fn(
                rec({ type: 'RowExtend', name: prim.name, head: a, tail: r }),
                fn(fn(a, b), fn(fn(vr(r), b), b)),
            );
        }
        default:
            throw new Error('nope prim idk: ' + prim.type);
    }
};

export const typeInference = (env: TypeEnv, exp: Exp, ctx: Ctx) => {
    const [s, t] = infer(env, exp, ctx);
    return apply(s, t);
};
