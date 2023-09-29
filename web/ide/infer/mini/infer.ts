// <? Instance name t
// =?= Equation t1 t2

import { expression } from './types';
import { fresh, point } from './union_find';

// ^ Conjunction (but eagerly swallow True's and flatten Conjunctions)
export type pos = number;

type tconstraint =
    | { type: 'True'; pos: pos }
    | { type: 'False'; pos: pos }
    | { type: 'Equation'; t1: crterm; t2: crterm; pos: pos }
    | { type: 'Conjunction'; items: tconstraint[]; pos: pos }
    | { type: 'Let'; schemes: scheme[]; constraint: tconstraint; pos: pos }
    | { type: 'Instance'; name: string; term: crterm; pos: pos }
    | { type: 'Disjunction'; constraints: tconstraint[]; pos: pos };

type fragment = {
    gamma: Record<string, { term: crterm; pos: number }>;
    vars: MultiEquation_variable[];
    tconstraint: tconstraint;
};

type Header = { [key: string]: { term: crterm; pos: pos } };
type scheme = {
    type: 'Scheme';
    rigid: MultiEquation_variable[];
    flexible: MultiEquation_variable[];
    constraint: tconstraint;
    header: Header;
    pos: pos;
};

type CoreAlgebra_term<t> =
    | { type: 'RowCons'; label: string; left: t; right: t }
    | { type: 'RowUniform'; value: t }
    | { type: 'App'; fn: t; arg: t }
    | { type: 'var'; value: t };

type CoreAlgebra_arterm<t> =
    | { type: 'Variable'; value: t }
    | { type: 'Term'; term: CoreAlgebra_term<CoreAlgebra_arterm<t>> };

type MultiEquation_descriptor = {
    structure?: CoreAlgebra_term<MultiEquation_variable>;
    rank: number;
    mark: Symbol;
    kind: 'Rigid' | 'Flexible' | 'Constant';
    name?: string;
    pos?: pos;
    var?: MultiEquation_variable;
};

type MultiEquation_variable = point<MultiEquation_descriptor>;

type crterm = CoreAlgebra_arterm<MultiEquation_variable>;

let monoscheme = (header: Header, pos: pos): scheme => ({
    type: 'Scheme',
    pos,
    rigid: [],
    flexible: [],
    constraint: { type: 'True', pos },
    header,
});

let conj = (c1: tconstraint, c2: tconstraint): tconstraint => {
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

let eq_eq = (pos: number, t1: crterm, t2: crterm): tconstraint => ({
    type: 'Equation',
    t1,
    t2,
    pos,
});

let ex = (
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

type kindType = unknown;
type algebraic_datatype = [string, MultiEquation_variable][];

type type_info = [
    kindType,
    MultiEquation_variable,
    { ref: algebraic_datatype | null },
];
type data_constructor = [number, MultiEquation_variable[], crterm];

type env = {
    type_info: [string, type_info][];
    data_constructor: [string, data_constructor][];
};
// type env = (name: string) =>

let as_type_constructor = (what: type_info) => {
    const p = UnionFind_find(what[1]);
    if (p.kind == 'Constant') {
        return what;
    } else {
        throw new Error(`Not found`);
    }
};

let lookup_typcon = (env: env, t: string) => {
    const got = env.type_info.find((m) => m[0] === t);
    if (!got) {
        throw new Error(`UnboundTypeIdentifier: ${t}`);
    }
    return as_type_constructor(got[1]);
};

let symbol = (tenv: env, name: string): crterm => {
    return { type: 'Variable', value: lookup_typcon(tenv, name)[1] };
};

let Mark_none = Symbol('none');

// (** [variable()] creates a new variable, whose rank is [none]. *)
let _variable = (kind: MultiEquation_descriptor['kind']) =>
    fresh({
        // structure = structure;
        rank: -1,
        mark: Mark_none,
        kind,
        // name = name;
        // pos = pos;
        // var = None
    });

// (** [variable()] returns a new variable. *)
let variable = (kind: MultiEquation_descriptor['kind']) => {
    //   let structure =
    //     match structure with
    //       | Some t ->
    // 	  let v = chopi IntRank.none t in
    // 	    Some (Var v)
    //       | None -> None
    //   in
    return _variable(kind);
};

let exists = (pos: number, f: (c: crterm) => tconstraint): tconstraint => {
    let v = variable('Flexible');
    let c = f({ type: 'Variable', value: v });
    return ex(pos, [v], c);
};

let arrow = (tenv: env, t: crterm, u: crterm): crterm => {
    let v = symbol(tenv, '->');
    return { type: 'Term', m: App(TTerm(App(v, t)), u) };
};

let infer_expr = (tenv: env, e: expression, t: crterm): tconstraint => {
    switch (e.type) {
        case 'Var':
            return { type: 'Instance', pos: e.pos, name: e.name, term: t };
        case 'Lambda':
            return exists(0, (x1) =>
                exists(0, (x2) => {
                    let fragment: fragment = infer_pat_fragment(tenv, p, x1);
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
                                    infer_expr(tenv, e, x2),
                                ),
                                pos: e.pos,
                            },
                            eq_eq(e.pos, t, arrow(tenv, x1, x2)),
                        ),
                    );
                }),
            );
    }
};
