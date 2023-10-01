// <? Instance name t
// =?= Equation t1 t2

import { expression, pattern, primitive } from './types';
import { find, fresh, point } from './union_find';

// ^ Conjunction (but eagerly swallow True's and flatten Conjunctions)
export type pos = number;

export type tconstraint =
    | { type: 'True'; pos: pos }
    | { type: 'False'; pos: pos }
    | { type: 'Dump'; pos: pos }
    | { type: 'Equation'; t1: crterm; t2: crterm; pos: pos }
    | { type: 'Conjunction'; items: tconstraint[]; pos: pos }
    | { type: 'Let'; schemes: scheme[]; constraint: tconstraint; pos: pos }
    | { type: 'Instance'; name: string; term: crterm; pos: pos }
    | { type: 'Disjunction'; constraints: tconstraint[]; pos: pos };

export type fragment = {
    gamma: Record<string, { term: crterm; pos: number }>;
    vars: MultiEquation_variable[];
    tconstraint: tconstraint;
};

export type Header = { [key: string]: { term: crterm; pos: pos } };
export type scheme = {
    type: 'Scheme';
    rigid: MultiEquation_variable[];
    flexible: MultiEquation_variable[];
    constraint: tconstraint;
    header: Header;
    pos: pos;
};

export type CoreAlgebra_term<t> =
    | { type: 'RowCons'; label: string; head: t; tail: t }
    | { type: 'RowUniform'; value: t }
    | { type: 'App'; fn: t; arg: t }
    | { type: 'Var'; value: t };

export let CA_iter = <t>(f: (t: t) => unknown, cat: CoreAlgebra_term<t>) => {
    switch (cat.type) {
        case 'RowCons':
            f(cat.head);
            f(cat.tail);
            return;
        case 'RowUniform':
            return f(cat.value);
        case 'App':
            f(cat.fn);
            f(cat.arg);
            return;
        case 'Var':
            return f(cat.value);
    }
};

export let CA_fold = <t, r>(
    f: (t: t, accu: r) => r,
    cat: CoreAlgebra_term<t>,
    accu: r,
): r => {
    switch (cat.type) {
        case 'RowCons':
            return f(cat.head, f(cat.tail, accu));
        case 'RowUniform':
            return f(cat.value, accu);
        case 'App':
            return f(cat.arg, f(cat.arg, accu));
        case 'Var':
            return f(cat.value, accu);
    }
};

export let CA_map = <t, r>(
    f: (t: t) => r,
    cat: CoreAlgebra_term<t>,
): CoreAlgebra_term<r> => {
    switch (cat.type) {
        case 'RowCons':
            return { ...cat, head: f(cat.head), tail: f(cat.tail) };
        case 'RowUniform':
            return { ...cat, value: f(cat.value) };
        case 'App':
            return { ...cat, fn: f(cat.fn), arg: f(cat.arg) };
        case 'Var':
            return { ...cat, value: f(cat.value) };
    }
};

export type CoreAlgebra_arterm<t> =
    | { type: 'Variable'; value: t }
    | { type: 'Term'; term: CoreAlgebra_term<CoreAlgebra_arterm<t>> };

export type MultiEquation_descriptor = {
    structure?: CoreAlgebra_term<MultiEquation_variable>;
    rank: number;
    mark: Symbol;
    kind: 'Rigid' | 'Flexible' | 'Constant';
    name?: string;
    pos?: pos;
    var?: MultiEquation_variable;
};

export type MultiEquation_variable = point<MultiEquation_descriptor>;

export type crterm = CoreAlgebra_arterm<MultiEquation_variable>;

export let monoscheme = (header: Header, pos: pos): scheme => ({
    type: 'Scheme',
    pos,
    rigid: [],
    flexible: [],
    constraint: { type: 'True', pos },
    header,
});

export let conj = (c1: tconstraint, c2: tconstraint): tconstraint => {
    if (c1.type === 'True') {
        return c2;
    }
    if (c2.type === 'True') {
        return c1;
    }
    if (c2.type === 'Conjunction') {
        return { type: 'Conjunction', items: [c1, ...c2.items], pos: c2.pos };
    }
    return { type: 'Conjunction', items: [c1, c2], pos: c1.pos };
};

export let eq_eq = (pos: number, t1: crterm, t2: crterm): tconstraint => ({
    type: 'Equation',
    t1,
    t2,
    pos,
});

export let ex = (
    pos: pos,
    qs: MultiEquation_variable[],
    c: tconstraint,
): tconstraint => {
    return {
        type: 'Let',
        schemes: [
            {
                type: 'Scheme',
                pos,
                rigid: [],
                flexible: qs,
                constraint: c,
                header: {},
            },
        ],
        constraint: { type: 'True', pos },
        pos,
    };
};

export type kindType =
    | { type: 'Star' }
    | { type: 'Arrow'; left: kindType; right: kindType }
    | { type: 'EmptyRow' }
    | {
          type: 'Times';
          left: kindType;
          right: kindType;
      };

export type algebraic_datatype = [string, MultiEquation_variable][];

export type type_info = [
    kindType,
    MultiEquation_variable,
    { ref: algebraic_datatype | null },
];
export type data_constructor = [number, MultiEquation_variable[], crterm];

export type env = {
    type_info: [string, type_info][];
    data_constructor: [string, data_constructor][];
};
// type env = (name: string) =>

let as_type_constructor = (what: type_info) => {
    const p = find(what[1]);
    if (p.kind == 'Constant') {
        return what;
    } else {
        throw new Error(`Not found`);
    }
};

let lookup_typcon = (env: env, t: string) => {
    const got = env.type_info.find((m) => m[0] === t);
    console.log('looping up the tuype constr', t, got);
    if (!got) {
        throw new Error(`UnboundTypeIdentifier: ${t}`);
    }
    return as_type_constructor(got[1]);
};

let symbol = (tenv: env, name: string): crterm => {
    return { type: 'Variable', value: lookup_typcon(tenv, name)[1] };
};

export let Mark_none = Symbol('none');
export let rank_none = -1;

// (** [variable()] creates a new variable, whose rank is [none]. *)
let _variable = (kind: MultiEquation_descriptor['kind'], name?: string) =>
    fresh({
        // structure = structure;
        rank: rank_none,
        mark: Mark_none,
        kind,
        name,
        // pos = pos;
        // var = None
    });

// (** [variable()] returns a new variable. *)
export let variable = (
    kind: MultiEquation_descriptor['kind'],
    name?: string,
) => {
    //   let structure =
    //     match structure with
    //       | Some t ->
    // 	  let v = chopi IntRank.none t in
    // 	    Some (Var v)
    //       | None -> None
    //   in
    return _variable(kind, name);
};

let exists = (pos: number, f: (c: crterm) => tconstraint): tconstraint => {
    let v = variable('Flexible');
    let c = f({ type: 'Variable', value: v });
    return ex(pos, [v], c);
};

let exists_list = <t>(
    pos: number,
    list: t[],
    f: (c: [t, crterm][]) => tconstraint,
): tconstraint => {
    let vs = list.map((l) => variable('Flexible'));
    let c = f(
        vs.map((v, i): [t, crterm] => [
            list[i],
            { type: 'Variable', value: v },
        ]),
    );
    return ex(pos, vs, c);
};

export let arrow = (tenv: env, t: crterm, u: crterm): crterm => {
    let v = symbol(tenv, '->');
    return {
        type: 'Term',
        term: {
            type: 'App',
            fn: { type: 'Term', term: { type: 'App', fn: v, arg: t } },
            arg: u,
        },
    };
};

export let infer_expr = (tenv: env, e: expression, t: crterm): tconstraint => {
    switch (e.type) {
        case 'RecordEmpty':
            return eq_eq(e.pos, t, {
                type: 'Term',
                term: { type: 'RowUniform', value: symbol(tenv, 'abs') },
            });
        case 'RecordExtend': {
            e.rows;
            return exists_list(e.pos, e.rows, (xs) =>
                exists(e.pos, (x) => {
                    return {
                        type: 'Conjunction',
                        pos: e.pos,
                        items: [
                            eq_eq(e.pos, t, record_type(e.pos, tenv, xs, x)),
                            ...xs.map(([row, v]) =>
                                infer_expr(tenv, row.expr, v),
                            ),
                        ],
                    };
                }),
            );
        }
        case 'Var':
            return { type: 'Instance', pos: e.pos, name: e.name, term: t };
        case 'App':
            return exists(e.pos, (x) =>
                conj(
                    infer_expr(tenv, e.fn, arrow(tenv, x, t)),
                    infer_expr(tenv, e.arg, x),
                ),
            );
        case 'Lambda':
            return exists(0, (x1) =>
                exists(0, (x2) => {
                    let fragment: fragment = infer_pat_fragment(
                        tenv,
                        e.pat,
                        x1,
                    );
                    return ex(
                        0,
                        fragment.vars,
                        conj(
                            {
                                type: 'Let',
                                //(* Bind the variables of [p] via
                                // a monomorphic [let] constraint. *)
                                schemes: [monoscheme(fragment.gamma, e.pos)],
                                //(* Require [x1] to be a valid type for [p]. *)
                                constraint: conj(
                                    fragment.tconstraint,
                                    //(* Require [x2] to be a valid type for [e]. *)
                                    infer_expr(tenv, e.expr, x2),
                                ),
                                pos: e.pos,
                            },
                            eq_eq(e.pos, t, arrow(tenv, x1, x2)),
                        ),
                    );
                }),
            );
        // :think:
        case 'PrimApp': {
            return eq_eq(e.pos, type_of_primitive(tenv, e.prim), t);
        }
    }
};

let disjoint_union = <T>(one: Record<string, T>, two: Record<string, T>) => {
    for (let key of Object.keys(two)) {
        if (one[key]) {
            throw new Error(`NonLinearPattern: ${key}`);
        }
    }
    return { ...one, ...two };
};

let constraint_and = (one: tconstraint, two: tconstraint) => {
    throw new Error('impl');
};

/** The [empty_fragment] is used when nothing has been bound. */
let empty_fragment: fragment = {
    gamma: {},
    vars: [],
    tconstraint: { type: 'True', pos: -1 },
};

/** Joining two fragments is straightforward except that the environments
    must be disjoint (a pattern cannot bound a variable several times). */
let join_fragment = (pos: number, f1: fragment, f2: fragment): fragment => ({
    gamma: disjoint_union(f1.gamma, f2.gamma),
    vars: f1.vars.concat(f2.vars),
    tconstraint: constraint_and(f1.tconstraint, f2.tconstraint),
});

let type_of_primitive = (tenv: env, prim: primitive): crterm => {
    switch (prim.type) {
        case 'PBoolean':
            return symbol(tenv, 'bool');
        case 'PIntegerConstant':
            return symbol(tenv, 'int');
        case 'PUnit':
            return symbol(tenv, 'unit');
        case 'PCharConstant':
            return symbol(tenv, 'char');
    }
};

/** [infer_pat_fragment p t] generates a fragment that represents the
    information gained by a success when matching p. */
let infer_pat_fragment = (tenv: env, p: pattern, t: crterm): fragment => {
    let join = (pos: number, fragments: fragment[]) =>
        fragments.reduce(
            (res, f) => join_fragment(pos, res, f),
            empty_fragment,
        );

    let infpat = (t: crterm, pat: pattern): fragment => {
        switch (pat.type) {
            case 'PWildcard':
                return empty_fragment;
            case 'PPrimitive':
                return {
                    ...empty_fragment,
                    tconstraint: eq_eq(
                        pat.pos,
                        t,
                        type_of_primitive(tenv, pat.prim),
                    ),
                };
            case 'PVar': {
                let v = variable('Flexible', pat.name);
                return {
                    vars: [v],
                    gamma: {
                        [pat.name]: {
                            term: { type: 'Variable', value: v },
                            pos: pat.pos,
                        },
                    },
                    tconstraint: eq_eq(
                        pat.pos,
                        { type: 'Variable', value: v },
                        t,
                    ),
                };
            }
        }
    };

    return infpat(t, p);
};

export const infer_vdef = (pos: pos, tenv: env, expr: expression): scheme => {
    const x = variable('Flexible');
    const tx: crterm = { type: 'Variable', value: x };
    let fragment = infer_pat_fragment(
        tenv,
        { type: 'PVar', name: '_result', pos },
        tx,
    );
    return {
        type: 'Scheme',
        constraint: {
            type: 'Conjunction',
            items: [fragment.tconstraint, infer_expr(tenv, expr, tx)],
            pos,
        },
        rigid: [],
        flexible: [x, ...fragment.vars],
        header: fragment.gamma,
        pos,
    };
};

const cmp = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);

function record_type(
    pos: number,
    tenv: env,
    xs: [{ name: string; expr: expression }, crterm][],
    x: crterm,
): crterm {
    // TODO block on duplicates
    xs.sort((a, b) => -cmp(a[0].name, b[0].name));
    let last: crterm = x;
    xs.forEach((row) => {
        last = {
            type: 'Term',
            term: {
                type: 'RowCons',
                head: row[1],
                label: row[0].name,
                tail: last,
            },
        };
    });
    return {
        type: 'Term',
        term: { type: 'App', fn: symbol(tenv, 'pi'), arg: last },
    };
}
// (** [infer_vdef pos tenv (pos, qs, p, e)] returns the constraint
//     related to a value definition. *)
// let rec infer_vdef pos tenv (pos, qs, p, e) =
//   let x = variable Flexible () in
//   let tx = TVariable x in
//   let rqs, rtenv = fresh_rigid_vars pos tenv qs in
//   let tenv' = add_type_variables rtenv tenv in
//   let fragment = infer_pat_fragment tenv' p tx in
//     Scheme (pos, rqs, x :: fragment.vars,
// 	    fragment.tconstraint ^ infer_expr tenv' e tx,
//     fragment.gamma)
