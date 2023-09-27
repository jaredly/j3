import { Env, Union_find, chop, run } from './hmx-solve';

export type t_const =
    | { type: 'number'; value: number }
    | { type: 'string'; value: string }
    | { type: 'bool'; value: boolean };
export type term =
    | { type: 'var'; name: string; loc: number }
    | { type: 'app'; fn: term; arg: term; loc: number }
    | { type: 'abs'; name: string; body: term; loc: number }
    | { type: 'let'; name: string; init: term; body: term; loc: number }
    | { type: 'if'; cond: term; yes: term; no: term; loc: number }
    | { type: 'const'; value: t_const; loc: number };

export type typ = ty;
export type ty =
    | { type: 'const'; name: string }
    | { type: 'var'; var: var_ }
    | { type: 'app'; fn: ty; arg: ty };

export const unwrapVar = (t: ty) => {
    if (t.type === 'var') {
        return Union_find(t.var).structure ?? t;
    }
    return t;
};

export const unrollFn = (t: ty): null | { args: ty[]; body: ty } => {
    t = unwrapVar(t);
    if (
        t.type === 'app' &&
        t.fn.type === 'app' &&
        t.fn.fn.type === 'const' &&
        t.fn.fn.name === '->'
    ) {
        const args = [t.fn.arg];
        const body = unrollFn(t.arg);
        if (body) {
            args.push(...body.args);
            return { args, body: body.body };
        }
        return { args, body: t.arg };
    }
    return null;
};

export const typToString = (t: ty): string => {
    switch (t.type) {
        case 'const':
            return t.name;
        case 'var':
            const s = Union_find(t.var);
            return s.structure ? typToString(s.structure) : s.name;
        // return 'a-var-idk';
        case 'app':
            const fn = unrollFn(t);
            if (fn) {
                return `(fn [${fn.args
                    .map((arg) => typToString(arg))
                    .join(' ')}] ${typToString(fn.body)})`;
            }
            return `(${typToString(t.fn)} ${typToString(t.arg)})`;
    }
};

export type ref<T> = { current: T };
export type Union_link<a> =
    | { type: 'info'; weight: number; descriptor: a }
    | { type: 'link'; point: Union_point<a> };
export type Union_point<a> = ref<Union_link<a>>;

export type var_ = Union_point<var_descr>;
export type var_descr = { structure: ty | null; rank: number; name: string };

export let app = (fn: ty, arg: ty): ty => ({ type: 'app', fn, arg });
export let arrow: ty = { type: 'const', name: '->' };
export let function_type = (t1: ty, t2: ty) => app(app(arrow, t1), t2);

export type ty_sch = { type: 'forall'; vbls: var_[]; constr: constr; ty: ty };
export type constr =
    | { type: 'bool'; value: boolean }
    | { type: 'app'; name: string; types: ty[] }
    | { type: 'and'; left: constr; right: constr }
    | { type: 'exists'; vbls: var_[]; constr: constr }
    | { type: 'def'; name: string; sch: ty_sch; constr: constr }
    | { type: 'instance'; name: string; ty: ty }
    | { type: 'dump' };

export let sch = (ty: ty): ty_sch => ({
    type: 'forall',
    vbls: [],
    constr: { type: 'bool', value: true },
    ty,
});

export let is_subtype = '=';

export let is_instance = (sch: ty_sch, ty: ty): constr => {
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

export let has_instance = ({ vbls, constr }: ty_sch): constr => {
    return { type: 'exists', vbls, constr };
};

export let letin = (var_: string, sch: ty_sch, constr: constr): constr => ({
    type: 'def',
    name: var_,
    sch,
    constr,
});

export let ref = <T>(v: T): ref<T> => ({ current: v });
export let Union_fresh = <T>(desc: T): Union_point<T> =>
    ref({ type: 'info', weight: 1, descriptor: desc });

let next = 0;
export let fresh_ty_var = (): var_ => {
    let name = `v${next}`;
    next++;
    return Union_fresh({
        structure: null,
        name,
        rank: 0,
    });
};

export let t_int: ty = { type: 'const', name: 'number' };
export let t_bool: ty = { type: 'const', name: 'bool' };
export let tvar = (x: var_): ty => ({ type: 'var', var: x });

let _infer = (term: term, ty: ty): constr => {
    switch (term.type) {
        case 'const':
            return {
                type: 'app',
                name: is_subtype,
                types: [{ type: 'const', name: term.value.type }, ty],
            };
        case 'if': {
            // const res = fresh_ty_var();
            // return {
            //     type: 'exists',
            //     vbls: [res],
            //     constr: {
            //         type: 'and',
            //         left: _infer(term.cond, t_bool),
            //         right: {
            //             type: 'and',
            //             left: _infer(term.yes, { type: 'var', var: res }),
            //             right: _infer(term.no, { type: 'var', var: res }),
            //         },
            //     },
            // };
            return {
                type: 'and',
                left: _infer(term.cond, t_bool),
                right: {
                    type: 'and',
                    left: _infer(term.yes, ty),
                    right: _infer(term.no, ty),
                },
            };
        }
        case 'var':
            return { type: 'instance', name: term.name, ty };
        case 'abs': {
            const x1 = fresh_ty_var();
            const x2 = fresh_ty_var();
            const constr_body = _infer(term.body, { type: 'var', var: x2 });
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
                    constr: _infer(term.init, { type: 'var', var: x }),
                    ty: { type: 'var', var: x },
                },
                _infer(term.body, ty),
            );
        }
        case 'app': {
            const x2 = fresh_ty_var();
            return {
                type: 'exists',
                vbls: [x2],
                constr: {
                    type: 'and',
                    left: _infer(term.fn, function_type(tvar(x2), ty)),
                    right: _infer(term.arg, tvar(x2)),
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
                constr: _infer(term, tvar(x)),
                ty: tvar(x),
            },
            acc,
        );
        // console.log('acc', acc);
    });
    // console.log('prog', acc);
    return acc;
};

export const builtins: Env = [
    {
        var_: '+',
        sch: sch(function_type(t_int, function_type(t_int, t_int))),
    },
    {
        var_: '*',
        sch: sch(function_type(t_int, function_type(t_int, t_int))),
    },
];
export { parse } from './parse-hmx';

export let infer = (builtins: Env, expr: term, typs: any): ty => {
    next = 0;
    const constr = infer_prog([['result', expr]]);
    const env = run(constr, builtins);
    const ty = env.find((t) => t.var_ === 'result')?.sch;
    return ty?.ty ?? { type: 'const', name: 'lol' };
};
