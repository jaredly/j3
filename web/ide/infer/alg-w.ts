// The algo
// based on https://jeremymikkola.com/posts/2018_03_25_understanding_algorithm_w.html
// and https://github.com/wh5a/Algorithm-W-Step-By-Step/blob/master/AlgorithmW.lhs
// https://www.cl.cam.ac.uk/teaching/1415/L28/type-inference.pdf

import { Node } from '../../../src/types/cst';
import { Type } from './types';

type Scheme = {
    vbls: string[];
    body: Type;
};

type Env = {
    scope: { [vblName: string]: Scheme };
    counter: { num: number };
};

type Subst = { [typeVbl: string]: Type };
const emptySubst: Subst = {};

const instantiate = (scheme: Scheme): Type => {
    return scheme.body;
};
const apply = (subst: Subst, t: Type): Type => {
    return t;
};

const newTV = (env: Env) => `v${env.counter.num++}`;

export const w_unify = (one: Type, two: Type): Subst => {
    return emptySubst;
};

export const w_infer = (
    expr: Node,
    env: Env,
): {
    type: Type;
    subst: Subst;
} => {
    switch (expr.type) {
        case 'identifier': {
            const num = +expr.text;
            if (!isNaN(num)) {
                return {
                    type: { type: 'concrete', name: 'number' },
                    subst: emptySubst,
                };
            }
            const got = env.scope[expr.text];
            if (!got) throw new Error('no dice ' + expr.text);
            return { type: instantiate(got), subst: {} };
        }
        case 'list': {
            if (
                expr.values.length === 3 &&
                expr.values[0].type === 'identifier' &&
                expr.values[0].text === 'fn' &&
                expr.values[1].type === 'array' &&
                expr.values[1].values.length === 1 &&
                expr.values[1].values[0].type === 'identifier'
            ) {
                const name = expr.values[1].values[0].text;
                const vn = newTV(env);
                const at = { type: 'var', name: vn } as const;
                const cenv: Env = {
                    ...env,
                    scope: {
                        ...env.scope,
                        [name]: {
                            vbls: [],
                            body: at,
                        },
                    },
                };
                const inner = w_infer(expr.values[2], cenv);
                const argType = apply(inner.subst, at);
                return {
                    type: {
                        type: 'fn',
                        arg: argType,
                        body: inner.type,
                    },
                    subst: inner.subst,
                };
            }

            if (expr.values.length === 2) {
                const fn = expr.values[0];
                const arg = expr.values[1];

                const returnType: Type = { type: 'var', name: newTV(env) };
                const { type: type1, subst: sub1 } = w_infer(fn, env);
                const env1: Env = applyEnv(env, sub1);

                const { subst: sub2, type: type2 } = w_infer(arg, env1);
                const type1_sub = apply(sub2, type1);

                const type3: Type = {
                    type: 'fn',
                    arg: type2,
                    body: returnType,
                };
                const sub3: Subst = w_unify(type1_sub, type3);
                const sub = { ...sub1, ...sub2, ...sub3 };
                const res = apply(sub3, returnType);
                return { type: res, subst: sub };
            }

            if (
                expr.values.length === 3 &&
                expr.values[0].type === 'identifier' &&
                expr.values[0].text === 'let' &&
                expr.values[1].type === 'array' &&
                expr.values[1].values.length === 2 &&
                expr.values[1].values[0].type === 'identifier'
            ) {
                const vname = expr.values[1].values[0].text;
                const init = expr.values[1].values[1];
                const body = expr.values[2];

                const { subst: sub1, type: type1 } = w_infer(init, env);
                const e2 = applyEnv(env, sub1);
                const e3: Env = {
                    ...env,
                    scope: {
                        ...env.scope,
                        [vname]: {
                            body: type1,
                            vbls: [],
                        },
                    },
                };
                const e4 = applyEnv(e3, sub1);
                const { subst: sub2, type: type2 } = w_infer(body, e4);

                return { type: type2, subst: { ...sub1, ...sub2 } };
            }
        }
    }
    throw new Error('no');
};

function applyEnv(env: Env, sub1: Subst): Env {
    return {
        ...env,
        scope: Object.fromEntries(
            Object.entries(env.scope).map(([k, v]) => [
                k,
                { ...v, body: apply(sub1, v.body) },
            ]),
        ),
    };
}
