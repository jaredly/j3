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

type TyVar = {
    name: string;
    kind: 'Star' | 'Row';
    // maybe should be called "lacks"
    constraint: string[];
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

type Subst = { [name: string]: { v: TyVar; t: Type } };

const apply = (s: Subst, v: Type): Type => {
    switch (v.type) {
        case 'Var':
            return s[v.v.name].t ?? v;
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
        res[k] = {
            v: s2[k].v,
            t: apply(s1, s2[k].t),
        };
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
