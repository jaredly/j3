// https://github.com/jfecher/algorithm-j/blob/master/j.ml
// nice.

import { Display } from '../../../../src/to-ast/library';
import { Trace, Tree, register } from '../types';
import { parse } from './parse-j';

export type expr =
    | { type: 'number'; value: number; loc: number }
    | { type: 'string'; value: string; loc: number }
    | { type: 'bool'; value: boolean; loc: number }
    | { type: 'identifier'; id: string; loc: number }
    | { type: 'accessor'; id: string; loc: number }
    | {
          type: 'lambda';
          names: { name: string; loc: number }[];
          expr: expr;
          loc: number;
      }
    | { type: 'fncall'; fn: expr; args: expr[]; loc: number }
    | {
          type: 'record';
          items: { name: string; loc: number; value: expr }[];
          loc: number;
      }
    | {
          type: 'let';
          name: string;
          nameloc: number;
          init: expr;
          body: expr;
          loc: number;
      }
    | { type: 'if'; cond: expr; yes: expr; no: expr; loc: number };

export type typ =
    | { type: 'lit'; name: string }
    | { type: 'var'; var: typevar }
    | { type: 'record'; items: { name: string; value: typ }[] }
    | { type: 'fn'; args: typ[]; ret: typ };
export type typevar =
    | { type: 'bound'; typ: typ; locs: number[] }
    | { type: 'unbound'; var: number; level: number; locs: number[] };
export type polytype = { typevars: number[]; typ: typ };

let current_level = 1;
let current_typevar = 0;
let enter_level = () => current_level++;
let exit_level = () => current_level--;
let newvar = () => {
    return current_typevar++;
};
let newvar_t = (locs: number[] = []): Extract<typ, { type: 'var' }> => {
    const t = {
        type: 'var',
        var: { type: 'unbound', var: newvar(), level: current_level, locs },
    } as const;
    trace.push({
        kind: 'type:free',
        locs,
        text: 'new type var: ' + typToString(t),
    });
    return t;
};

const alpha = 'abcdefghij';
const varName = (v: number) => "'" + alpha[v];
export const typToString = (
    t: typ,
    seen: { [key: string]: string } = {},
): string => {
    switch (t.type) {
        case 'lit':
            return t.name;
        case 'record':
            return `{${t.items
                .map((r) => `${r.name} ${typToString(r.value, seen)}`)
                .join(' ')}}`;
        case 'fn':
            return `(fn [${t.args
                .map((t) => typToString(t, seen))
                .join(' ')}] ${typToString(t.ret, seen)})`;
        case 'var':
            if (t.var.type === 'bound') {
                return typToString(t.var.typ, seen);
            }
            // if (!seen[t.var.var]) {
            //     seen[t.var.var] = alpha[Object.keys(seen).length];
            // }
            // return "'" + seen[t.var.var];
            return varName(t.var.var);
        // return `v${t.var.var}`; //:${t.var.level}`;
    }
};

// SMap / HashableInt / ITbl

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
        case 'record': {
            if (t2.type !== 'record' || t2.items.length !== t1.items.length)
                return false;
            const map: { [key: string]: typ } = {};
            t2.items.forEach((item) => {
                map[item.name] = item.value;
            });

            return t1.items.every(
                (r) => map[r.name] && equal(map[r.name], r.value),
            );
        }
        case 'lit':
            return t2.type === 'lit' && t1.name === t2.name;
        case 'var':
            return t2.type === 'var' && tvequal(t1.var, t2.var);
    }
};

type Tbl = { [id: number]: Extract<typ, { type: 'var' }> };
let inst = ({ typevars, typ }: polytype): typ => {
    // Ok I'm pretty sure this is overkill
    // That is, we just need to say for each var in typevars,
    // change the varname (and level I guess idk) to a new one
    let replace_tvs = (tbl: Tbl, typ: typ): typ => {
        switch (typ.type) {
            case 'lit':
                return typ;
            case 'record': {
                return {
                    ...typ,
                    items: typ.items.map((r) => ({
                        ...r,
                        value: replace_tvs(tbl, r.value),
                    })),
                };
            }
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
        case 'lit':
            return false;
        case 'record':
            return typ.items.some((row) => occurs(a_id, a_level, row.value));
        case 'var': {
            if (typ.var.type === 'bound') {
                return occurs(a_id, a_level, typ.var.typ);
            }
            let { var: b_id, level: b_level } = typ.var;
            let min_level = Math.min(a_level, b_level);
            typ.var = {
                type: 'unbound',
                var: b_id,
                level: min_level,
                locs: typ.var.locs,
            };
            return a_id == b_id;
        }
        case 'fn':
            return (
                typ.args.some((arg) => occurs(a_id, a_level, arg)) ||
                occurs(a_id, a_level, typ.ret)
            );
    }
};

export let unify = (t1: typ, t2: typ): void => {
    trace.push({
        kind: 'misc',
        locs: [],
        text: `unify ${typToString(t1)} with ${typToString(t2)}`,
    });
    if (t1.type === 'lit' && t2.type === 'lit') {
        if (t1.name !== t2.name) {
            throw new Error(`cannot unify ${t1.name} and ${t2.name}`);
        }
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
        const t1v = t1.var.var;
        t1.var = { type: 'bound', typ: t2, locs: t1.var.locs };
        trace.push({
            kind: typTraceKind(t2),
            text: `binding ${varName(t1v)} to ` + typToString(t2),
            locs: t1.var.locs,
        });
        return;
    }
    if (t2.type === 'var' && t2.var.type === 'unbound') {
        if (equal(t1, t2)) {
            return;
        }
        if (occurs(t2.var.var, t2.var.level, t1)) {
            throw new Error('t1 occurs in t2');
        }
        const t2v = t2.var.var;
        t2.var = { type: 'bound', typ: t1, locs: t2.var.locs };
        trace.push({
            kind: typTraceKind(t1),
            text: `binding ${varName(t2v)} to ` + typToString(t1),
            locs: t2.var.locs,
        });
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
    if (t1.type === 'record' && t2.type === 'record') {
        if (t1.items.length === t2.items.length) {
            const m2: { [key: string]: typ } = {};
            t2.items.forEach((row) => (m2[row.name] = row.value));
            const m1: { [key: string]: typ } = {};
            t1.items.forEach((row) => (m1[row.name] = row.value));

            t1.items.forEach((row) => {
                if (!m2[row.name]) {
                    throw new Error(`extra row ${row.name}`);
                    // t2.items.push({ ...row });
                } else {
                    unify(row.value, m2[row.name]);
                }
            });
            t2.items.forEach((row) => {
                if (!m1[row.name]) {
                    // t1.items.push({ ...row });
                    throw new Error(`extra row ${row.name}`);
                }
            });
            return;
        } else {
            throw new Error(`records have different lengths`);
        }
    }

    throw new Error(`cannot unify '${t1.type}' and '${t2.type}' sorry`);
};

let generalize = (t: typ): polytype => {
    let find_all_tvs = (typ: typ): number[] => {
        switch (typ.type) {
            case 'lit':
                return [];
            case 'record':
                return typ.items.flatMap((row) => find_all_tvs(row.value));
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
export type Results = { [loc: number]: typ };

const typIsPartial = (t: typ): boolean => {
    switch (t.type) {
        case 'var':
            return t.var.type === 'unbound' || typIsPartial(t.var.typ);
        case 'fn':
            return t.args.some(typIsPartial) || typIsPartial(t.ret);
        case 'lit':
            return false;
        case 'record':
            return t.items.some((r) => typIsPartial(r.value));
    }
};

const track = (expr: expr, results: Results, typ: typ) => {
    results[expr.loc] = typ;
    trace.push({
        locs: [expr.loc],
        text: 'inferred type: ' + typToString(typ),
        kind: typTraceKind(typ),
    });
    return typ;
};
let _infer = (env: Env, expr: expr, results: Results): typ => {
    trace.push({
        locs: [expr.loc],
        kind: 'infer:start',
        text: 'start inference',
    });
    switch (expr.type) {
        case 'bool':
            return track(expr, results, { type: 'lit', name: 'bool' });
        case 'string':
            return track(expr, results, { type: 'lit', name: 'string' });
        case 'number':
            return track(expr, results, { type: 'lit', name: 'number' });
        case 'accessor': {
            let t_ = newvar_t([expr.loc]);

            return track(expr, results, {
                type: 'fn',
                args: [
                    { type: 'record', items: [{ name: expr.id, value: t_ }] },
                ],
                ret: t_,
            });
        }
        case 'record':
            return track(expr, results, {
                type: 'record',
                items: expr.items.map((row) => ({
                    name: row.name,
                    value: _infer(env, row.value, results),
                })),
            });
        case 'identifier': {
            let s = env[expr.id];
            if (!s) {
                throw new Error(`undefined ${expr.id}`);
            }
            if (s.typ.type === 'var') {
                // s.typ.var.locs.push(expr.loc);
                s.typ.var.locs = [...s.typ.var.locs, expr.loc];
            }
            return track(expr, results, inst(s));
        }
        case 'fncall': {
            let t0 = _infer(env, expr.fn, results);
            let t1 = expr.args.map((arg) => _infer(env, arg, results));
            let t_ = newvar_t([expr.loc]);
            // trace.push({
            //     locs: [expr.loc],
            //     text: 'new tvar',
            //     kind: 'tvar:new',
            // });
            unify(t0, { type: 'fn', args: t1, ret: t_ });
            return track(expr, results, t_);
        }
        case 'lambda': {
            let env_: Env = { ...env };

            let args = expr.names.map((name) => {
                const t = newvar_t([name.loc]);
                env_[name.name] = dont_generalize(t);
                return t;
            });
            let ret = _infer(env_, expr.expr, results);
            return track(expr, results, { type: 'fn', args, ret });
        }
        case 'let': {
            enter_level();
            let t = (results[expr.nameloc] = _infer(env, expr.init, results));
            trace.push({
                kind: 'type:fixed',
                locs: [expr.nameloc],
                text: typToString(t),
            });
            exit_level();
            return track(
                expr,
                results,
                _infer(
                    { ...env, [expr.name]: generalize(t) },
                    expr.body,
                    results,
                ),
            );
        }
        case 'if': {
            const cond = _infer(env, expr.cond, results);
            unify(cond, { type: 'lit', name: 'bool' });
            const yes = _infer(env, expr.yes, results);
            const no = _infer(env, expr.no, results);
            unify(yes, no);
            return track(expr, results, yes);
        }
    }
};

export let infer = (
    env: Env,
    expr: expr,
    results: { typs: Results; display: Display },
): typ => {
    current_level = 1;
    current_typevar = 0;
    return _infer(env, expr, results.typs);
};

const toString = (expr: expr): string => {
    switch (expr.type) {
        case 'identifier':
            return expr.id;
        case 'number':
            return expr.value + '';
        case 'fncall':
            return `(${[expr.fn, ...expr.args].map(toString).join(' ')})`;
        default:
            return expr.type;
    }
};

const toTree = (expr: expr): Tree => {
    if (!expr) {
        // debugger;
    }
    switch (expr.type) {
        case 'let':
            return {
                name: '(let',
                loc: expr.loc,
                children: [
                    { name: expr.name, loc: expr.nameloc, children: [] },
                    ...[expr.init, expr.body].map(toTree),
                ],
            };
        case 'fncall':
            return {
                name: toString(expr).slice(0, 10),
                loc: expr.loc,
                children: [expr.fn, ...expr.args].map(toTree),
            };
        case 'lambda':
            return {
                name: '(fn [',
                loc: expr.loc,
                children: [
                    ...expr.names.map(
                        (name): Tree => ({
                            name: name.name,
                            children: [],
                            loc: name.loc,
                        }),
                    ),
                    toTree(expr.expr),
                ],
            };
        case 'identifier':
            return { name: expr.id, loc: expr.loc, children: [] };
        case 'number':
            return { name: '' + expr.value, loc: expr.loc, children: [] };
    }
    return { name: expr.type, loc: expr.loc, children: [] };
};

let trace: Trace[] = [];

register('j', {
    infer,
    builtins: {
        '>': {
            typevars: [],
            typ: {
                type: 'fn',
                args: [
                    {
                        type: 'lit',
                        name: 'number',
                    },
                    { type: 'lit', name: 'number' },
                ],
                ret: { type: 'lit', name: 'bool' },
            },
        },
        '+': {
            typevars: [],
            typ: {
                type: 'fn',
                args: [
                    {
                        type: 'lit',
                        name: 'number',
                    },
                    { type: 'lit', name: 'number' },
                ],
                ret: { type: 'lit', name: 'number' },
            },
        },
    },
    getTrace: () => {
        const res = trace;
        trace = [];
        return res;
    },
    parse,
    typToString,
    toTree,
});
function typTraceKind(
    typ: typ,
): import('/Users/jared/clone/exploration/j3/web/ide/infer/types').TraceKind {
    return typ.type === 'var' && typ.var.type === 'unbound'
        ? 'type:free'
        : // : typIsPartial(typ)
          // ? 'type:partial'
          'type:fixed';
}
