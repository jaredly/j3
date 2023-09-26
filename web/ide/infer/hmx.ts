type t_const =
    | { type: 'int'; value: number }
    | { type: 'bool'; value: boolean };
export type term =
    | { type: 'var'; name: string; loc: number }
    | { type: 'app'; fn: term; arg: term; loc: number }
    | { type: 'abs'; name: string; body: term; loc: number }
    | { type: 'let'; name: string; init: term; body: term; loc: number }
    | { type: 'const'; value: t_const; loc: number };

type ty =
    | { type: 'const'; name: string }
    | { type: 'var'; var: var_ }
    | { type: 'app'; fn: ty; arg: ty };

type ref<T> = { current: T };
type Union_link<a> =
    | { type: 'info'; weight: number; descriptor: a }
    | { type: 'link'; point: Union_point<a> };
type Union_point<a> = ref<Union_link<a>>;

type var_ = Union_point<var_descr>;
type var_descr = { structure: ty | null; rank: number; name: string };

let app = (fn: ty, arg: ty): ty => ({ type: 'app', fn, arg });
let arrow: ty = { type: 'const', name: '->' };
let function_type = (t1: ty, t2: ty) => app(app(arrow, t1), t2);

type ty_sch = { type: 'forall'; vbls: var_[]; constr: constr; ty: ty };
type constr =
    | { type: 'bool'; value: boolean }
    | { type: 'app'; name: string; types: ty[] }
    | { type: 'and'; left: constr; right: constr }
    | { type: 'exists'; vbls: var_[]; constr: constr }
    | { type: 'def'; name: string; sch: ty_sch; constr: constr }
    | { type: 'instance'; name: string; ty: ty }
    | { type: 'dump' };

let sch = (ty: ty): ty_sch => ({
    type: 'forall',
    vbls: [],
    constr: { type: 'bool', value: true },
    ty,
});

let is_subtype = '=';

let is_instance = (sch: ty_sch, ty: ty): constr => {
    return {
        type: 'exists',
        vbls: sch.vbls,
        constr: {
            type: 'and',
            left: sch.constr,
            right: {
                type: 'app',
                name: is_subtype,
                types: [sch.ty, ty],
            },
        },
    };
};

let has_instance = ({ vbls, constr }: ty_sch): constr => {
    return { type: 'exists', vbls, constr };
};

let letin = (var_: string, sch: ty_sch, constr: constr): constr => ({
    type: 'def',
    name: var_,
    sch,
    constr,
});

let ref = <T>(v: T): ref<T> => ({ current: v });
let Union_fresh = <T>(desc: T): Union_point<T> =>
    ref({ type: 'info', weight: 1, descriptor: desc });

let next = 0;
let fresh_ty_var = (): var_ => {
    let name = `a${next}`;
    next++;
    return Union_fresh({
        structure: null,
        name,
        rank: 0,
    });
};

let t_int: ty = { type: 'const', name: 'int' };
let t_bool: ty = { type: 'const', name: 'bool' };
let tvar = (x: var_): ty => ({ type: 'var', var: x });

let infer = (term: term, ty: ty): constr => {
    switch (term.type) {
        case 'const':
            if (term.value.type === 'int') {
                return { type: 'app', name: is_subtype, types: [t_int, ty] };
            } else {
                return { type: 'app', name: is_subtype, types: [t_bool, ty] };
            }
        case 'var':
            return { type: 'instance', name: term.name, ty };
        case 'abs': {
            const x1 = fresh_ty_var();
            const x2 = fresh_ty_var();
            const constr_body = infer(term.body, { type: 'var', var: x2 });
            return {
                type: 'exists',
                vbls: [x1, x2],
                constr: {
                    type: 'and',
                    left: {
                        type: 'def',
                        name: term.name,
                        sch: sch({ type: 'var', var: x1 }),
                        constr: constr_body,
                    },
                    right: {
                        type: 'app',
                        name: is_subtype,
                        types: [
                            function_type(
                                { type: 'var', var: x1 },
                                { type: 'var', var: x2 },
                            ),
                            ty,
                        ],
                    },
                },
            };
        }
        case 'let': {
            const x = fresh_ty_var();
            return letin(
                term.name,
                {
                    type: 'forall',
                    vbls: [x],
                    constr: infer(term.init, { type: 'var', var: x }),
                    ty: { type: 'var', var: x },
                },
                infer(term.body, ty),
            );
        }
        case 'app': {
            const x2 = fresh_ty_var();
            return {
                type: 'exists',
                vbls: [x2],
                constr: {
                    type: 'and',
                    left: infer(term.fn, function_type(tvar(x2), ty)),
                    right: infer(term.arg, tvar(x2)),
                },
            };
        }
    }
};

export let infer_prog = (p: [string, term][]) => {
    let acc: constr = { type: 'dump' };
    p.forEach(([name, term]) => {
        let x = fresh_ty_var();
        acc = letin(
            name,
            {
                type: 'forall',
                vbls: [x],
                constr: infer(term, tvar(x)),
                ty: tvar(x),
            },
            acc,
        );
    });
    return acc;
};
