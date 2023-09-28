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
    | { type: 'const'; value: t_const; loc: number }
    // records!
    | { type: 'accessor'; id: string; loc: number }
    | { type: 'record'; items: { name: string; value: term }[]; loc: number };

export type typ = ty;
export type ty =
    | { type: 'const'; name: string; loc: number }
    | { type: 'var'; var: var_; loc: number }
    | { type: 'app'; fn: ty; arg: ty; loc: number }
    // records!
    | { type: 'record'; items: { name: string; value: ty }[]; loc: number };

let traced: any[] = [];
export const trace = (data: any) => {
    traced.push(data);
};
export const getTrace = () => {
    const res = traced;
    traced = [];
    return res;
};

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
        case 'record':
            return `{${t.items.map(
                (row) => `${row.name} ${typToString(row.value)}`,
            )}}`;
        case 'var':
            const s = Union_find(t.var);
            return s.structure ? typToString(s.structure) : s.name;
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

export let app = (fn: ty, arg: ty): ty => ({ type: 'app', fn, arg, loc: -2 });
export let arrow: ty = { type: 'const', name: '->', loc: -2 };
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

export let t_int: ty = { type: 'const', name: 'number', loc: -2 };
export let t_bool: ty = { type: 'const', name: 'bool', loc: -2 };
export let tvar = (x: var_, loc: number): ty => ({ type: 'var', var: x, loc });

type Map = { [loc: number]: constr };

let _infer = (term: term, ty: ty, map: Map): constr => {
    const res = __infer(term, ty, map);
    map[term.loc] = res;
    return res;
};
let __infer = (term: term, ty: ty, map: Map): constr => {
    switch (term.type) {
        case 'const':
            return {
                type: 'app',
                name: is_subtype,
                types: [
                    { type: 'const', name: term.value.type, loc: term.loc },
                    ty,
                ],
            };
        case 'var':
            return { type: 'instance', name: term.name, ty };
        case 'abs': {
            const x1 = fresh_ty_var();
            const x2 = fresh_ty_var();
            const constr_body = _infer(
                term.body,
                {
                    type: 'var',
                    var: x2,
                    loc: term.loc,
                },
                map,
            );
            return {
                type: 'exists',
                vbls: [x1, x2],
                constr: {
                    type: 'and',
                    left: {
                        type: 'def',
                        name: term.name,
                        sch: sch({ type: 'var', var: x1, loc: term.loc }),
                        constr: constr_body,
                    },
                    right: {
                        type: 'app',
                        name: is_subtype,
                        types: [
                            function_type(
                                { type: 'var', var: x1, loc: term.loc },
                                { type: 'var', var: x2, loc: term.loc },
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
                    constr: _infer(
                        term.init,
                        {
                            type: 'var',
                            var: x,
                            loc: term.loc,
                        },
                        map,
                    ),
                    ty: { type: 'var', var: x, loc: term.loc },
                },
                _infer(term.body, ty, map),
            );
        }
        case 'app': {
            const x2 = fresh_ty_var();
            return {
                type: 'exists',
                vbls: [x2],
                constr: {
                    type: 'and',
                    left: _infer(
                        term.fn,
                        function_type(tvar(x2, term.fn.loc), ty),
                        map,
                    ),
                    right: _infer(term.arg, tvar(x2, term.arg.loc), map),
                },
            };
        }
        // If!
        case 'if': {
            return {
                type: 'and',
                left: _infer(term.cond, t_bool, map),
                right: {
                    type: 'and',
                    left: _infer(term.yes, ty, map),
                    right: _infer(term.no, ty, map),
                },
            };
        }
        // Records!
        case 'accessor': {
            const x1 = fresh_ty_var();
            const row = [
                {
                    name: term.id,
                    value: { type: 'var' as const, var: x1, loc: term.loc },
                },
            ];
            return {
                type: 'app',
                name: is_subtype,
                types: [
                    function_type(
                        { type: 'record', items: row, loc: term.loc },
                        { type: 'var', var: x1, loc: term.loc },
                    ),
                    ty,
                ],
            };
        }
        case 'record': {
            const vbls = term.items.map((row) => fresh_ty_var());

            const constrs: constr[] = [
                {
                    type: 'app',
                    name: is_subtype,
                    types: [
                        {
                            type: 'record',
                            items: term.items.map((row, i) => ({
                                name: row.name,
                                value: {
                                    type: 'var',
                                    var: vbls[i],
                                    loc: term.loc,
                                },
                            })),
                            loc: term.loc,
                        },
                        ty,
                    ],
                },
                // ...term.items.map(
                //     (row, i): constr => ({
                //         type: 'app',
                //         name: is_subtype,
                //         types: [
                //             {
                //                 type: 'record',
                //                 items: [
                //                     {
                //                         name: row.name,
                //                         value: { type: 'var', var: vbls[i] },
                //                     },
                //                 ],
                //             },
                //             ty,
                //         ],
                //     }),
                // ),
                ...term.items.map(
                    (row, i): constr =>
                        _infer(
                            row.value,
                            {
                                type: 'var',
                                var: vbls[i],
                                loc: term.loc,
                            },
                            map,
                        ),
                ),
                // ({
                //     type: 'app',
                //     name: is_subtype,
                //     types: [
                //         row.value,
                //         {type: 'var', var: vbls[i]}
                //     ]
                // })
            ];

            return ands(constrs);
        }
    }
};

const ands = (constrs: constr[]): constr => {
    if (!constrs.length) {
        return { type: 'bool', value: true };
    }
    let res = constrs[0];
    for (let i = 1; i < constrs.length; i++) {
        res = { type: 'and', left: res, right: constrs[i] };
    }
    return res;
};

export let infer_prog = (p: [string, term][], map: Map) => {
    let acc: constr = { type: 'dump' };
    p.forEach(([name, term]) => {
        let x = fresh_ty_var();
        acc = letin(
            name,
            {
                type: 'forall',
                vbls: [x],
                constr: _infer(term, tvar(x, -2), map),
                ty: tvar(x, -2),
            },
            acc,
        );
    });
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

export let infer = (
    builtins: Env,
    expr: term,
    typs: { [loc: number]: ty },
): ty => {
    next = 0;
    const map: Map = {};
    const constr = infer_prog([['result', expr]], map);
    const env = run(constr, builtins);
    const ty = env.find((t) => t.var_ === 'result')?.sch;
    // Object.entries(map).forEach(([loc, constr]) => { })
    // console.log('finished', env)
    trace(env);
    trace(map);
    return ty?.ty ?? { type: 'const', name: 'lol', loc: -2 };
};
