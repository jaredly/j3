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

export const infer = (env: TypeEnv, exp: Exp, ctx: Ctx): [Subst, Type] => {
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
            const tv = newTyVar('a', ctx);
            const env_ = { ...env };
            delete env_[exp.name];
            env_[exp.name] = { type: 'Scheme', vbls: {}, body: tv };
            const [s1, t1] = infer(env_, exp.body, ctx);
            return [s1, { type: 'Fun', arg: apply(s1, tv), body: t1 }];
        }
        case 'App': {
            const [s1, t1] = infer(env, exp.fn, ctx);
            const [s2, t2] = infer(applyTE(s1, env), exp.arg, ctx);
            const tv = newTyVar('a', ctx);
            const s3 = unify(
                apply(s2, t1),
                { type: 'Fun', arg: t2, body: tv },
                ctx,
            );
            return [composeSubst(s3, composeSubst(s2, s1)), apply(s3, tv)];
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
};
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
            const a = newTyVar('a', ctx);
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
            return { type: 'RowEmpty' };
        case 'RecordSelect': {
            const a = newTyVar('a', ctx);
            const r = newTyVarWith('Row', { [prim.name]: true }, 'r', ctx);
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
            const a = newTyVar('a', ctx);
            const r = newTyVarWith('Row', { [prim.name]: true }, 'r', ctx);
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
            const a = newTyVar('a', ctx);
            const r = newTyVarWith('Row', { [prim.name]: true }, 'r', ctx);
            return fn(
                rec({ type: 'RowExtend', name: prim.name, head: a, tail: r }),
                rec(r),
            );
        }
        case 'VariantInject': {
            const a = newTyVar('a', ctx);
            const r = newTyVarWith('Row', { [prim.name]: true }, 'r', ctx);
            return fn(
                a,
                vr({ type: 'RowExtend', name: prim.name, head: a, tail: r }),
            );
        }
        case 'VariantElim': {
            const a = newTyVar('a', ctx);
            const b = newTyVar('b', ctx);
            const r = newTyVarWith('Row', { [prim.name]: true }, 'r', ctx);
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
