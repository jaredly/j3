// https://github.com/jfecher/algorithm-j/blob/master/j.ml
// nice.

export type expr =
    | { type: 'unit' }
    | { type: 'identifier'; id: string }
    | { type: 'lambda'; name: string; expr: expr }
    | { type: 'fncall'; fn: expr; arg: expr }
    | { type: 'let'; name: string; init: expr; body: expr };
export type typ =
    | { type: 'unit' }
    | { type: 'var'; var: typevar }
    | { type: 'fn'; arg: typ; ret: typ };
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
                equal(t1.arg, t2.arg) &&
                equal(t1.ret, t2.ret)
            );
        case 'unit':
            return t2.type === 'unit';
        case 'var':
            return t2.type === 'var' && tvequal(t1.var, t2.var);
    }
};

let inst = ({ typevars, typ }: polytype): typ => {
    let replace_tvs = (tbl: Tbl, typ: typ): typ => {
        switch (typ.type) {
            case 'unit':
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
                    arg: replace_tvs(tbl, typ.arg),
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
        case 'unit':
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
                occurs(a_id, a_level, typ.arg) || occurs(a_id, a_level, typ.ret)
            );
    }
};

export let unify = (t1: typ, t2: typ) => {
    if (t1.type === 'unit' && t2.type === 'unit') {
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
        unify(t1.arg, t2.arg);
        unify(t1.ret, t2.ret);
        return;
    }
    throw new Error('cannot unify sorry');
};

let generalize = (t: typ): polytype => {
    let find_all_tvs = (typ: typ): number[] => {
        switch (typ.type) {
            case 'unit':
                return [];
            case 'var':
                if (typ.var.type === 'bound') {
                    return find_all_tvs(typ.var.typ);
                } else {
                    const { var: n, level } = typ.var;
                    return level > current_level ? [n] : [];
                }
            case 'fn':
                return [...find_all_tvs(typ.arg), ...find_all_tvs(typ.ret)];
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

type Env = { [name: string]: polytype };
export let infer = (env: Env, expr: expr): typ => {
    switch (expr.type) {
        case 'unit':
            return expr;
        case 'identifier': {
            let s = env[expr.id];
            return inst(s);
        }
        case 'fncall': {
            let t0 = infer(env, expr.fn);
            let t1 = infer(env, expr.arg);
            let t_ = newvar_t();
            unify(t0, { type: 'fn', arg: t1, ret: t_ });
            return t_;
        }
        case 'lambda': {
            let t = newvar_t();
            let env_: Env = { ...env, [expr.name]: dont_generalize(t) };
            let t_ = infer(env_, expr.expr);
            return { type: 'fn', arg: t, ret: t_ };
        }
        case 'let': {
            enter_level();
            let t = infer(env, expr.init);
            exit_level();
            return infer({ ...env, [expr.name]: generalize(t) }, expr.body);
        }
    }
};
