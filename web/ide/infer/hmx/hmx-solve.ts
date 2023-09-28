import {
    Union_point,
    constr,
    constrToString,
    fresh_ty_var,
    is_subtype,
    term,
    trace,
    ty,
    ty_sch,
    typToString,
    varToString,
    var_,
    var_descr,
} from './hmx';
import eq from 'fast-deep-equal';
export type Env = { var_: string; sch: ty_sch }[];
let extend = (env: Env, var_: string, sch: ty_sch): Env => [
    { var_, sch },
    ...env,
];
let lookup = (env: Env, var_: string): ty_sch | undefined =>
    env.find((it) => it.var_ === var_)?.sch;

export let Union_repr = <t>(point: Union_point<t>): Union_point<t> => {
    switch (point.current.type) {
        case 'info':
            return point;
        case 'link': {
            let p2 = Union_repr(point.current.point);
            // um path compression?
            if (!eq(p2, point.current.point)) {
                point.current = point.current.point.current;
            }
            return p2;
        }
    }
};

export let Union_find = <t>(point: Union_point<t>): t => {
    switch (point.current.type) {
        case 'info':
            return point.current.descriptor;
        case 'link': {
            switch (point.current.point.current.type) {
                case 'info':
                    return point.current.point.current.descriptor;
                case 'link':
                    return Union_find(Union_repr(point));
            }
        }
    }
};

let Union_union = <t>(
    f: (d1: t, d2: t) => t,
    point1: Union_point<t>,
    point2: Union_point<t>,
) => {
    point1 = Union_repr(point1);
    point2 = Union_repr(point2);

    if (!eq(point1, point2)) {
        if (point1.current.type === 'info' && point2.current.type === 'info') {
            if (point1.current.weight >= point2.current.weight) {
                const p2 = point2.current;
                point2.current = { type: 'link', point: point1 };
                trace({ at: 'Union_union - update point1', p2 });
                point1.current = {
                    type: 'info',
                    weight: point1.current.weight + p2.weight,
                    descriptor: f(point1.current.descriptor, p2.descriptor),
                };
            } else {
                const p1 = point1.current;
                trace({ at: 'Union_union - update point2', p1 });
                point1.current = { type: 'link', point: point2 };
                point2.current = {
                    type: 'info',
                    weight: p1.weight + point2.current.weight,
                    descriptor: f(p1.descriptor, point2.current.descriptor),
                };
            }
        } else {
            throw new Error('this shouldnt be able to happen');
        }
    }
};

let Union_equivalent = <t>(p1: Union_point<t>, p2: Union_point<t>) =>
    eq(Union_repr(p1), Union_repr(p2));
let is_representative = (p: Union_point<unknown>) => p.current.type === 'info';

export let chop = (term: ty) => {
    let var_ = fresh_ty_var();
    Union_find(var_).structure = term;
    return var_;
};

let alpha_conv = (term: ty, name: string, r: ty): ty => {
    switch (term.type) {
        case 'app':
            return {
                type: 'app',
                fn: alpha_conv(term.fn, name, r),
                arg: alpha_conv(term.arg, name, r),
                loc: term.loc,
            };
        case 'var': {
            let var_: var_descr = Union_find(term.var);
            if (var_.structure) {
                return alpha_conv(var_.structure, name, r);
            } else {
                if (var_.name === name) {
                    return r;
                } else {
                    return term;
                }
            }
        }
        case 'record': {
            return {
                type: 'record',
                items: term.items.map((row) => ({
                    name: row.name,
                    value: alpha_conv(row.value, name, r),
                })),
                loc: term.loc,
            };
        }
        case 'const':
            return term;
    }
};

let instance = (f: ty_sch) => {
    let m = f.ty;
    f.vbls.forEach((vbl) => {
        m = alpha_conv(m, Union_find(vbl).name, {
            type: 'var',
            var: fresh_ty_var(),
            loc: m.loc,
        });
    });
    return m;
};

let unify = (t1: var_, t2: var_) => {
    trace({ at: 'unify', t1: varToString(t1), t2: varToString(t2) });
    const s1 = Union_find(t1).structure;
    const s2 = Union_find(t2).structure;
    if (!s1 && !s2) {
        return Union_union((x, y) => (x.rank < y.rank ? x : y), t1, t2);
    }
    if (s1 && !s2) {
        return Union_union(
            (x, y) => (x.rank < y.rank ? x : { ...y, structure: x.structure }),
            t1,
            t2,
        );
    }
    if (!s1 && s2) {
        return Union_union(
            (x, y) => (x.rank < y.rank ? { ...x, structure: y.structure } : y),
            t1,
            t2,
        );
    }
    Union_union((x, y) => (x.rank < y.rank ? x : y), t1, t2);
    return unify_terms(s1!, s2!);
};

let unify_terms = (t1: ty, t2: ty): void => {
    trace({ at: 'unify_terms', t1: typToString(t1), t2: typToString(t2) });
    if (t1.type === 'var' && t2.type === 'var') {
        return unify(t1.var, t2.var);
    }
    if (t1.type === 'var') {
        return unify(t1.var, chop(t2));
    }
    if (t2.type === 'var') {
        return unify(t2.var, chop(t1));
    }
    if (t1.type === 'app' && t2.type === 'app') {
        unify_terms(t1.fn, t2.fn);
        unify_terms(t1.arg, t2.arg);
        return;
    }
    if (t1.type === 'const' && t2.type === 'const') {
        if (t1.name === t2.name) {
            return;
        }
        throw new Error(
            `cannot unify ${t1.name} and ${t2.name}`,
            // `unable to unify builtin types: ${t1.name} and ${t2.name}`,
        );
    }
    if (t1.type === 'record' && t2.type === 'record') {
        // so, this is probably where I need to know what ranks mean?
        // t1.
        const m1: { [key: string]: ty } = {};
        t1.items.forEach((row) => (m1[row.name] = row.value));
        const m2: { [key: string]: ty } = {};
        t2.items.forEach((row) => (m2[row.name] = row.value));
        t1.items.forEach((row) => {
            if (!m2[row.name]) {
                throw new Error(
                    `cant unify, ${row.name} is missing in the second record`,
                );
            }
            unify_terms(row.value, m2[row.name]);
        });
        return;
    }
    throw new Error(`unable to unify ${t1.type} and ${t2.type}`);
};

type pool = { vars: var_[]; rank: number };

let free_vars_of = (term: ty): var_[] => {
    switch (term.type) {
        case 'const':
            return [];
        case 'record':
            return term.items.flatMap((row) => free_vars_of(row.value));
        case 'var': {
            const s = Union_find(term.var).structure;
            return s ? free_vars_of(s) : [term.var];
        }
        case 'app':
            return [...free_vars_of(term.fn), ...free_vars_of(term.arg)];
    }
};

export let solve = (constr: constr, pool: pool, env: Env): Env => {
    trace({ at: 'solve', constr: constrToString(constr), pool });
    switch (constr.type) {
        case 'dump':
            return env;
        case 'bool':
            if (!constr.value) {
                throw new Error('false');
            }
            return [];
        case 'app':
            if (constr.name === is_subtype) {
                // console.log('solving an equal', constr.types);
                unify(chop(constr.types[0]), chop(constr.types[1]));
                return [];
            }
            throw new Error('bad predicate application');
        case 'and': {
            solve(constr.left, pool, env);
            return solve(constr.right, pool, env);
        }
        case 'exists': {
            constr.vbls.forEach((vbl) => (Union_find(vbl).rank = pool.rank));
            pool.vars = [...constr.vbls, ...pool.vars];
            return solve(constr.constr, pool, env);
        }
        case 'instance': {
            const found = lookup(env, constr.name);
            if (!found) throw new Error(`unbound vbl ${constr.name}`);
            unify_terms(constr.ty, instance(found));
            return [];
        }
        case 'def': {
            const v = chop(constr.sch.ty);
            const pool_ = { rank: pool.rank + 1, vars: [] };
            constr.sch.vbls.forEach(
                (vbl) => (Union_find(vbl).rank = pool_.rank),
            );
            pool.vars = [...constr.sch.vbls, ...pool_.vars];
            solve(constr.sch.constr, pool_, env);
            let t = Union_find(v).structure ?? { type: 'var', var: v, loc: -2 };
            let vars = free_vars_of(t).filter(
                (v) => Union_find(v).rank > pool.rank,
            );
            return solve(
                constr.constr,
                pool,
                extend(env, constr.name, {
                    type: 'forall',
                    vbls: vars,
                    constr: { type: 'bool', value: true, loc: t.loc },
                    ty: t,
                }),
            );
        }
    }
};

export const run = (constr: constr, env: Env = []) =>
    solve(constr, { rank: 0, vars: [] }, env);
