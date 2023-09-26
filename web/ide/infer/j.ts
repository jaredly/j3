// https://github.com/jfecher/algorithm-j/blob/master/j.ml
// nice.

export type expr =
    | { type: 'number'; value: number }
    | { type: 'identifier'; id: string }
    | { type: 'lambda'; names: string[]; expr: expr }
    | { type: 'fncall'; fn: expr; args: expr[] }
    | { type: 'let'; name: string; init: expr; body: expr };
export type typ =
    | { type: 'number' }
    | { type: 'var'; var: typevar }
    | { type: 'fn'; args: typ[]; ret: typ };
export type typevar =
    | { type: 'bound'; typ: typ }
    | { type: 'unbound'; var: number; level: number };
export type polytype = { typevars: number[]; typ: typ };

let current_level = 1;
let current_typevar = 0;
let enter_level = () => current_level++;
let exit_level = () => current_level--;
let newvar = () => {
    current_typevar++;
    return current_typevar;
};
let newvar_t = (): typ => ({
    type: 'var',
    var: { type: 'unbound', var: newvar(), level: current_level },
});

export const typToString = (t: typ): string => {
    switch (t.type) {
        case 'number':
            return 'number';
        case 'fn':
            return `(fn [${t.args.map(typToString).join(' ')}] ${typToString(
                t.ret,
            )})`;
        case 'var':
            if (t.var.type === 'bound') {
                return typToString(t.var.typ);
            }
            return `v${t.var.var}:${t.var.level}`;
    }
};

// SMap / HashableInt / ITbl

type Tbl = { [id: number]: typ };

let tvequal = (t1: typevar, t2: typevar) => {
    if (t1.type === 'unbound') {
        return (
            t2.type === 'unbound' && t1.level === t2.level && t1.var === t2.var
        );
    }
    return t2.type === 'bound' && equal(t1.typ, t2.typ);
};
let equal = (t1: typ, t2: typ): boolean => {
    switch (t1.type) {
        case 'fn':
            return (
                t2.type === 'fn' &&
                t1.args.length == t2.args.length &&
                t1.args.every((arg, i) => equal(arg, t2.args[i])) &&
                equal(t1.ret, t2.ret)
            );
        case 'number':
            return t2.type === 'number';
        case 'var':
            return t2.type === 'var' && tvequal(t1.var, t2.var);
    }
};

let inst = ({ typevars, typ }: polytype): typ => {
    let replace_tvs = (tbl: Tbl, typ: typ): typ => {
        switch (typ.type) {
            case 'number':
                return typ;
            case 'var': {
                if (typ.var.type === 'bound') {
                    return replace_tvs(tbl, typ.var.typ);
                }
                return tbl[typ.var.var] ?? typ;
            }
            case 'fn':
                return {
                    type: 'fn',
                    args: typ.args.map((arg) => replace_tvs(tbl, arg)),
                    ret: replace_tvs(tbl, typ.ret),
                };
        }
    };
    let tvs_to_replace: Tbl = {};
    typevars.forEach((id) => {
        tvs_to_replace[id] = newvar_t();
    });
    return replace_tvs(tvs_to_replace, typ);
};

let occurs = (a_id: number, a_level: number, typ: typ): boolean => {
    switch (typ.type) {
        case 'number':
            return false;
        case 'var': {
            if (typ.var.type === 'bound') {
                return occurs(a_id, a_level, typ.var.typ);
            }
            let { var: b_id, level: b_level } = typ.var;
            let min_level = Math.min(a_level, b_level);
            typ.var = { type: 'unbound', var: b_id, level: min_level };
            return a_id == b_id;
        }
        case 'fn':
            return (
                typ.args.some((arg) => occurs(a_id, a_level, arg)) ||
                occurs(a_id, a_level, typ.ret)
            );
    }
};

export let unify = (t1: typ, t2: typ) => {
    if (t1.type === 'number' && t2.type === 'number') {
        return;
    }
    if (t1.type === 'var' && t1.var.type === 'bound') {
        return unify(t1.var.typ, t2);
    }
    if (t2.type === 'var' && t2.var.type === 'bound') {
        return unify(t1, t2.var.typ);
    }
    if (t1.type === 'var' && t1.var.type === 'unbound') {
        if (equal(t1, t2)) {
            return;
        }
        if (occurs(t1.var.var, t1.var.level, t2)) {
            throw new Error('t2 occurs in t1');
        }
        t1.var = { type: 'bound', typ: t2 };
        return;
    }
    if (t2.type === 'var' && t2.var.type === 'unbound') {
        if (equal(t1, t2)) {
            return;
        }
        if (occurs(t2.var.var, t2.var.level, t1)) {
            throw new Error('t1 occurs in t2');
        }
        t2.var = { type: 'bound', typ: t1 };
        return;
    }
    if (t1.type === 'fn' && t2.type === 'fn') {
        if (t1.args.length !== t2.args.length) {
            throw new Error(`different arg numbers`);
        }
        t1.args.forEach((arg, i) => unify(arg, t2.args[i]));
        unify(t1.ret, t2.ret);
        return;
    }
    throw new Error('cannot unify sorry');
};

let generalize = (t: typ): polytype => {
    let find_all_tvs = (typ: typ): number[] => {
        switch (typ.type) {
            case 'number':
                return [];
            case 'var':
                if (typ.var.type === 'bound') {
                    return find_all_tvs(typ.var.typ);
                } else {
                    const { var: n, level } = typ.var;
                    return level > current_level ? [n] : [];
                }
            case 'fn':
                return [
                    ...typ.args.flatMap(find_all_tvs),
                    ...find_all_tvs(typ.ret),
                ];
        }
    };
    const unique: { [key: number]: true } = {};
    find_all_tvs(t).forEach((id) => (unique[id] = true));
    return {
        typevars: Object.keys(unique).map((id) => +id),
        typ: t,
    };
};

let dont_generalize = (typ: typ): polytype => ({ typevars: [], typ });

export type Env = { [name: string]: polytype };
let _infer = (env: Env, expr: expr): typ => {
    switch (expr.type) {
        case 'number':
            return { type: 'number' };
        case 'identifier': {
            let s = env[expr.id];
            if (!s) {
                throw new Error(`undefined ${expr.id}`);
            }
            return inst(s);
        }
        case 'fncall': {
            let t0 = _infer(env, expr.fn);
            let t1 = expr.args.map((arg) => _infer(env, arg));
            let t_ = newvar_t();
            unify(t0, { type: 'fn', args: t1, ret: t_ });
            return t_;
        }
        case 'lambda': {
            let env_: Env = { ...env }; //, [expr.name]: dont_generalize(t) };

            let args = expr.names.map((name) => {
                const t = newvar_t();
                env_[name] = dont_generalize(t);
                return t;
            });
            let ret = _infer(env_, expr.expr);
            return { type: 'fn', args, ret };
        }
        case 'let': {
            enter_level();
            let t = _infer(env, expr.init);
            exit_level();
            return _infer({ ...env, [expr.name]: generalize(t) }, expr.body);
        }
    }
};

export let infer = (env: Env, expr: expr): typ => {
    current_level = 1;
    current_typevar = 0;
    return _infer(env, expr);
};
