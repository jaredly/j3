type Exp =
    | { type: 'Var'; name: string }
    | { type: 'Prim'; prim: Prim }
    | { type: 'App'; fn: Exp; arg: Exp }
    | { type: 'Abs'; name: string; body: Exp }
    | { type: 'Let'; name: string; init: Exp; body: Exp };

type Prim =
    | { type: 'Int'; value: number }
    | { type: 'Bool'; value: boolean }
    | { type: 'Add' | 'Cond' | 'RecordEmpty' }
    | {
          type:
              | 'RecordSelect'
              | 'RecordExtend'
              | 'RecordRestrict'
              | 'VariantInject'
              | 'VariantEmbed'
              | 'VariantElim';
          name: string;
      };

type Type =
    | { type: 'Var'; v: TyVar }
    | { type: 'Int' | 'Bool' | 'RowEmpty' }
    | { type: 'Fun'; arg: Type; body: Type }
    | { type: 'Record'; body: Type }
    | { type: 'Variant'; body: Type }
    | { type: 'RowExtend'; name: string; head: Type; tail: Type };

type Constraint = { [name: string]: boolean };
type Kind = 'Star' | 'Row';
type TyVar = {
    name: string;
    kind: Kind;
    // maybe should be called "lacks"
    constraint: Constraint;
};

type VSet = { [name: string]: TyVar };
type Scheme = { type: 'Scheme'; vbls: VSet; body: Type };

const setJoin = (sets: VSet[]) => {
    const res: VSet = {};
    sets.forEach((set) => {
        Object.assign(res, set);
    });
    return res;
};

const ftv = (item: Type | Scheme | Type[]): VSet => {
    if (Array.isArray(item)) {
        let res: VSet = {};
        item.forEach((i) => (res = { ...res, ...ftv(i) }));
        return res;
    }
    if (item.type === 'Scheme') {
        const res = ftv(item.body);
        Object.keys(item.vbls).forEach((k) => {
            delete res[k];
        });
        return res;
    }
    switch (item.type) {
        case 'Var':
            return { [item.v.name]: item.v };
        case 'Int':
        case 'Bool':
        case 'RowEmpty':
            return {};
        case 'Fun':
            return { ...ftv(item.arg), ...ftv(item.body) };
        case 'Variant':
        case 'Record':
            return ftv(item.body);
        case 'RowExtend':
            return { ...ftv(item.head), ...ftv(item.tail) };
    }
};

type Subst = { [name: string]: Type };

const apply = (s: Subst, v: Type): Type => {
    switch (v.type) {
        case 'Var':
            return s[v.v.name] ?? v;
        case 'Fun':
            return { ...v, arg: apply(s, v.arg), body: apply(s, v.body) };
        case 'Record':
            return { ...v, body: apply(s, v.body) };
        case 'RowExtend':
            return { ...v, head: apply(s, v.head), tail: apply(s, v.tail) };
        default:
            return v;
    }
};

const applyS = (s: Subst, v: Scheme): Scheme => {
    const without = { ...s };
    Object.keys(v.vbls).forEach((k) => {
        delete without[k];
    });
    return { ...v, body: apply(without, v.body) };
};

const composeSubst = (s1: Subst, s2: Subst) => {
    const res = { ...s2, ...s1 };
    Object.keys(s2).forEach((k) => {
        if (s1[k]) {
            throw new Error('overlap??');
        }
        res[k] = apply(s1, s2[k]);
    });
    return res;
};

type TypeEnv = { [name: string]: Scheme };
const remove = (env: TypeEnv, name: string) => {
    env = { ...env };
    delete env[name];
    return env;
};

const ftvTE = (te: TypeEnv) => setJoin(Object.values(te).map(ftv));
const applyTE = (s: Subst, te: TypeEnv) =>
    Object.fromEntries(Object.entries(te).map(([k, v]) => [k, applyS(s, v)]));

const generalize = (env: TypeEnv, t: Type): Scheme => {
    const v = ftv(t);
    Object.keys(ftvTE(env)).forEach((name) => {
        delete v[name];
    });
    return { type: 'Scheme', vbls: v, body: t };
};

type TIState = { supply: number; subst: Subst };
// type TI<T> = {}

const initState = (): TIState => ({ supply: 0, subst: {} });

type Ctx = { state: TIState };

const newTyVarWith = (
    kind: Kind,
    constraint: Constraint,
    prefix: string,
    ctx: Ctx,
): Type => {
    ctx.state.supply += 1;
    const name = `${prefix}${ctx.state.supply}`;
    return { type: 'Var', v: { name, kind, constraint } };
};

const newTyVar = (prefix: string, ctx: Ctx) =>
    newTyVarWith('Star', {}, prefix, ctx);

const instantiate = (scheme: Scheme, ctx: Ctx) => {
    const nvars: Subst = Object.fromEntries(
        Object.entries(scheme.vbls).map(([k, v]) => [
            k,
            newTyVarWith(v.kind, v.constraint, v.name[0], ctx),
        ]),
    );
    return apply(nvars, scheme.body);
};

const unify = (one: Type, two: Type, ctx: Ctx): Subst => {
    if (one.type === 'Fun' && two.type === 'Fun') {
        const s1 = unify(one.arg, two.arg, ctx);
        return composeSubst(
            s1,
            unify(apply(s1, two.body), apply(s1, two.body), ctx),
        );
    }
    if (one.type === 'Var' && two.type === 'Var') {
        return unionConstraints(one.v, two.v, ctx);
    }
    if (one.type === 'Var') {
        return varBind(one.v, two, ctx);
    }
    if (two.type === 'Var') {
        return varBind(two.v, one, ctx);
    }
    if (one.type === 'Int' && two.type === 'Int') {
        return {};
    }
    if (one.type === 'Bool' && two.type === 'Bool') {
        return {};
    }
    if (one.type === 'Record' && two.type === 'Record') {
        return unify(one.body, two.body, ctx);
    }
    if (one.type === 'Variant' && two.type === 'Variant') {
        return unify(one.body, two.body, ctx);
    }
    if (one.type === 'RowEmpty' && two.type === 'RowEmpty') {
        return {};
    }
    if (one.type === 'RowExtend' && two.type === 'RowExtend') {
        const [a, b, c] = rewriteRow(two, one.name, ctx);
        const mm = toList(b);
        if (mm[1] && c[mm[1].name]) {
            throw new Error(`recursive row type, cant do it`);
        }
        const theta2 = unify(apply(c, one.head), apply(c, a), ctx);
        const s = composeSubst(theta2, c);
        const theta3 = unify(apply(s, one.tail), apply(s, b), ctx);
        return composeSubst(theta3, s);
    }
    throw new Error(`types do not unify`);
};

const varBind = (one: TyVar, two: Type, ctx: Ctx): Subst => {
    const ff = ftv(two);
    if (ff[one.name]) {
        throw new Error(`occur check fails`);
    }
    return one.kind === 'Star'
        ? { [one.name]: two }
        : varBindRow(one, two, ctx);
};

const varBindRow = (one: TyVar, two: Type, ctx: Ctx): Subst => {
    const ls = one.constraint;
    const [items, mv] = toList(two);
    const ls_ = fromList(items.map((m) => m[0]));
    const s1: Subst = { [one.name]: two };
    const m = Object.keys(intersection(ls, ls_));
    if (m.length === 0 && !mv) {
        return s1;
    }
    if (mv) {
        const c = { ...ls, ...mv.constraint };
        const r2 = newTyVarWith('Row', c, 'r', ctx);
        const s2: Subst = { [mv.name]: r2 };
        return composeSubst(s1, s2);
    }
    throw new Error(`Repeat labels??? ${m.join(', ')}`);
};

const rewriteRow = (
    t: Type,
    newLabel: string,
    ctx: Ctx,
): [Type, Type, Subst] => {
    if (t.type === 'RowEmpty') {
        throw new Error(`label cannot be inserted ${newLabel}`);
    }
    if (t.type === 'RowExtend') {
        if (newLabel === t.name) {
            return [t.head, t.tail, {}];
        }
        if (t.tail.type === 'Var') {
            const beta = newTyVarWith('Row', { [newLabel]: true }, 'r', ctx);
            const gamma = newTyVar('a', ctx);
            const s = varBindRow(
                t.tail.v,
                { type: 'RowExtend', name: newLabel, head: gamma, tail: beta },
                ctx,
            );
            return [
                gamma,
                apply(s, {
                    type: 'RowExtend',
                    name: t.name,
                    head: t.head,
                    tail: beta,
                }),
                s,
            ];
        }
        const [one_, two_, s] = rewriteRow(t.tail, newLabel, ctx);
        return [
            one_,
            { type: 'RowExtend', name: t.name, head: t.head, tail: two_ },
            s,
        ];
    }
    throw new Error(`Unexpected type...`);
};

const fromList = (n: string[]): Constraint => {
    const res: Constraint = {};
    n.forEach((k) => (res[k] = true));
    return res;
};

const intersection = (one: Constraint, two: Constraint) => {
    const res: Constraint = {};
    Object.keys(one).forEach((k) => {
        if (two[k]) {
            res[k] = true;
        }
    });
    return res;
};

const unionConstraints = (one: TyVar, two: TyVar, ctx: Ctx): Subst => {
    if (one === two) {
        return {};
    }
    if (one.name === two.name) {
        debugger;
        throw new Error('not quite equal');
    }
    if (one.kind === 'Star' && two.kind === 'Star') {
        return { [one.name]: { type: 'Var', v: two } };
    }
    if (one.kind === 'Row' && two.kind === 'Row') {
        const c = {
            ...one.constraint,
            ...two.constraint,
        };
        const r = newTyVarWith('Row', c, 'r', ctx);
        return { [one.name]: r, [two.name]: r };
    }
    throw new Error(`kind mismatch`);
};

const toList = (t: Type): [[string, Type][], TyVar | null] => {
    switch (t.type) {
        case 'Var':
            return [[], t.v];
        case 'RowEmpty':
            return [[], null];
        case 'RowExtend':
            const [ls, mv] = toList(t.tail);
            return [[[t.name, t.head], ...ls], mv];
    }
    throw new Error('cant list it');
};

const infer = (env: TypeEnv, exp: Exp, ctx: Ctx): [Subst, Type] => {
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

const fn = (arg: Type, body: Type): Type => ({
    type: 'Fun',
    arg,
    body,
});

const rec = (body: Type): Type => ({ type: 'Record', body });
const vr = (body: Type): Type => ({ type: 'Variant', body });

const tiPrim = (prim: Prim, ctx: Ctx): Type => {
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
