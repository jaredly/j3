export type Exp =
    | { type: 'Var'; name: string }
    | { type: 'Prim'; prim: Prim }
    | { type: 'App'; fn: Exp; arg: Exp }
    | { type: 'Abs'; name: string; body: Exp }
    | { type: 'Let'; name: string; init: Exp; body: Exp };

export type Prim =
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

export type Type =
    | { type: 'Var'; v: TyVar }
    | { type: 'Int' | 'Bool' | 'RowEmpty' }
    | { type: 'Fun'; arg: Type; body: Type }
    | { type: 'Record'; body: Type }
    | { type: 'Variant'; body: Type }
    | { type: 'RowExtend'; name: string; head: Type; tail: Type };

export type Constraint = { [name: string]: boolean };
export type Kind = 'Star' | 'Row';
export type TyVar = {
    name: string;
    kind: Kind;
    // maybe should be called "lacks"
    constraint: Constraint;
};

export type VSet = { [name: string]: TyVar };
export type Scheme = { type: 'Scheme'; vbls: VSet; body: Type };

const setJoin = (sets: VSet[]) => {
    const res: VSet = {};
    sets.forEach((set) => {
        Object.assign(res, set);
    });
    return res;
};

export const ftv = (item: Type | Scheme | Type[]): VSet => {
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

export type Subst = { [name: string]: Type };

export const apply = (s: Subst, v: Type): Type => {
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

export const applyS = (s: Subst, v: Scheme): Scheme => {
    const without = { ...s };
    Object.keys(v.vbls).forEach((k) => {
        delete without[k];
    });
    return { ...v, body: apply(without, v.body) };
};

export const composeSubst = (s1: Subst, s2: Subst) => {
    const res = { ...s2, ...s1 };
    Object.keys(s2).forEach((k) => {
        if (s1[k]) {
            throw new Error('overlap??');
        }
        res[k] = apply(s1, s2[k]);
    });
    return res;
};

export type TypeEnv = { [name: string]: Scheme };
export const remove = (env: TypeEnv, name: string) => {
    env = { ...env };
    delete env[name];
    return env;
};

export const ftvTE = (te: TypeEnv) => setJoin(Object.values(te).map(ftv));
export const applyTE = (s: Subst, te: TypeEnv) =>
    Object.fromEntries(Object.entries(te).map(([k, v]) => [k, applyS(s, v)]));

export const generalize = (env: TypeEnv, t: Type): Scheme => {
    const v = ftv(t);
    Object.keys(ftvTE(env)).forEach((name) => {
        delete v[name];
    });
    return { type: 'Scheme', vbls: v, body: t };
};

export type TIState = { supply: number; subst: Subst };
// type TI<T> = {}

export const initState = (): TIState => ({ supply: 0, subst: {} });

export type Ctx = { state: TIState };

export const newTyVarWith = (
    kind: Kind,
    constraint: Constraint,
    prefix: string,
    ctx: Ctx,
): Type => {
    ctx.state.supply += 1;
    const name = `${prefix}${ctx.state.supply}`;
    return { type: 'Var', v: { name, kind, constraint } };
};

export const newTyVar = (prefix: string, ctx: Ctx) =>
    newTyVarWith('Star', {}, prefix, ctx);

export const instantiate = (scheme: Scheme, ctx: Ctx) => {
    const nvars: Subst = Object.fromEntries(
        Object.entries(scheme.vbls).map(([k, v]) => [
            k,
            newTyVarWith(v.kind, v.constraint, v.name[0], ctx),
        ]),
    );
    return apply(nvars, scheme.body);
};

export const fn = (arg: Type, body: Type): Type => ({
    type: 'Fun',
    arg,
    body,
});

export const rec = (body: Type): Type => ({ type: 'Record', body });
export const vr = (body: Type): Type => ({ type: 'Variant', body });
