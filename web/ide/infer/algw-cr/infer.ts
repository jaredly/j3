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

export const infer = (env: TypeEnv, exp: Exp, ctx: Ctx): [Subst, Type] => {
    const res = _infer(env, exp, ctx);
    return res;
};

export const _infer = calog(
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
                return [{}, tiPrim(exp.prim, exp.loc, ctx)];
            case 'Abs': {
                const tv = newTyVar('abs', exp.nameloc, ctx);
                const env_ = { ...env };
                delete env_[exp.name];
                env_[exp.name] = { type: 'Scheme', vbls: {}, body: tv };
                const [s1, t1] = infer(env_, exp.body, ctx);
                return [
                    s1,
                    { type: 'Fun', arg: apply(s1, tv), body: t1, loc: exp.loc },
                ];
            }
            case 'App': {
                const [s1, t1] = infer(env, exp.fn, ctx);
                const [s2, t2] = infer(applyTE(s1, env), exp.arg, ctx);
                const tv = newTyVar('app-result', exp.loc, ctx);
                const s3 = unify(
                    apply(s2, t1),
                    { type: 'Fun', arg: t2, body: tv, loc: exp.loc },
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
    },
);
export const tiPrim = (prim: Prim, loc: number, ctx: Ctx): Type => {
    switch (prim.type) {
        case 'Int':
            return { type: 'Int', loc };
        case 'Bool':
            return { type: 'Bool', loc };
        case 'String':
            return { type: 'String', loc };
        case 'Add':
            return {
                type: 'Fun',
                arg: { type: 'Int', loc },
                body: {
                    type: 'Fun',
                    arg: { type: 'Int', loc },
                    body: { type: 'Int', loc },
                    loc,
                },
                loc,
            };
        case 'Cond': {
            const a = newTyVar('cond', loc, ctx);
            return {
                type: 'Fun',
                arg: { type: 'Bool', loc },
                body: {
                    type: 'Fun',
                    arg: a,
                    body: { type: 'Fun', arg: a, body: a, loc },
                    loc,
                },
                loc,
            };
        }
        case 'RecordEmpty':
            return { type: 'Record', body: { type: 'RowEmpty', loc }, loc };
        case 'RecordSelect': {
            const a = newTyVar('rs-head', loc, ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                'rs-tail',
                loc,
                ctx,
            );
            return fn(
                rec(
                    {
                        type: 'RowExtend',
                        name: prim.name,
                        head: a,
                        tail: r,
                        loc,
                        nameloc: loc,
                    },
                    loc,
                ),
                a,
                loc,
            );
        }
        case 'RecordExtend': {
            const a = newTyVar('re-head', loc, ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                're-tail',
                loc,
                ctx,
            );
            return fn(
                a,
                fn(
                    rec(r, loc),
                    {
                        type: 'Record',
                        body: {
                            type: 'RowExtend',
                            name: prim.name,
                            head: a,
                            tail: r,
                            nameloc: loc,
                            loc,
                        },
                        loc,
                    },
                    loc,
                ),
                loc,
            );
        }
        case 'RecordRestrict': {
            const a = newTyVar('rr-head', loc, ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                'rr-tail',
                loc,
                ctx,
            );
            return fn(
                rec(
                    {
                        type: 'RowExtend',
                        name: prim.name,
                        head: a,
                        tail: r,
                        loc,
                        nameloc: loc,
                    },
                    loc,
                ),
                rec(r, loc),
                loc,
            );
        }
        case 'VariantInject': {
            const a = newTyVar('vi-head', loc, ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                'rvi-without-' + prim.name,
                loc,
                ctx,
            );
            return fn(
                a,
                vr(
                    {
                        type: 'RowExtend',
                        name: prim.name,
                        head: a,
                        tail: r,
                        loc,
                        nameloc: loc,
                    },
                    loc,
                ),
                loc,
            );
        }
        case 'VariantElim': {
            const a = newTyVar('ve-head', loc, ctx);
            const b = newTyVar('ve-res', loc, ctx);
            const r = newTyVarWith(
                'Row',
                { [prim.name]: true },
                've-without-' + prim.name,
                loc,
                ctx,
            );
            return fn(
                vr(
                    {
                        type: 'RowExtend',
                        name: prim.name,
                        head: a,
                        tail: r,
                        loc,
                        nameloc: loc,
                    },
                    loc,
                ),
                fn(
                    // transform the value to the result
                    fn(a, b, loc),
                    fn(
                        // the "otherwise" case, giving a result
                        fn(vr(r, loc), b, loc),
                        // and at the end of the day, we get the result
                        b,
                        loc,
                    ),
                    loc,
                ),
                loc,
            );
        }
        case 'ConsumeEmptyVariant': {
            const anything = newTyVar('consume-empty', loc, ctx);
            return fn(vr({ type: 'RowEmpty', loc }, loc), anything, loc);
        }
        default:
            throw new Error('nope prim idk: ' + prim.type);
    }
};

export const typeInference = (env: TypeEnv, exp: Exp, ctx: Ctx) => {
    const [s, t] = infer(env, exp, ctx);
    return apply(s, t);
};
