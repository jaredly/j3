import {
    CoreAlgebra_term,
    Mark_none,
    MultiEquation_descriptor,
    MultiEquation_variable,
    arrow,
    crterm,
    env,
    infer_expr,
    infer_vdef,
    variable,
} from './infer';
import { solve } from './solve';
import { expression } from './types';
import { find, fresh } from './union_find';

export { parse } from './parse';

export type { crterm as typ };
export const builtins = {};
export const infer = (builtins: any, term: expression, _: any): crterm => {
    // init_builtin_env

    const int = variable('Constant', 'int');
    const bool = variable('Constant', 'bool');
    const char = variable('Constant', 'string');
    const arr = variable('Constant', '->');
    const abs = variable('Constant', 'abs');
    const pre = variable('Constant', 'pre');
    const pi = variable('Constant', 'pi');
    const sigma = variable('Constant', 'sigma');
    const vbls = [int, arr, char, abs, pre, pi, sigma, bool];

    trace.push(term);

    const tenv: env = {
        type_info: [
            ['int', [{ type: 'Star' }, int, { ref: null }]],
            ['bool', [{ type: 'Star' }, bool, { ref: null }]],
            ['abs', [{ type: 'Star' }, abs, { ref: null }]],
            [
                'pi',
                [
                    {
                        type: 'Arrow',
                        left: { type: 'EmptyRow' },
                        right: { type: 'Star' },
                    },
                    pi,
                    { ref: null },
                ],
            ],
            ['sigma', [{ type: 'Star' }, sigma, { ref: null }]],
            [
                'pre',
                [
                    {
                        type: 'Arrow',
                        left: { type: 'Star' },
                        right: { type: 'Star' },
                    },
                    pre,
                    { ref: null },
                ],
            ],
            ['char', [{ type: 'Star' }, char, { ref: null }]],
            [
                '->',
                [
                    {
                        type: 'Arrow',
                        left: { type: 'Star' },
                        right: { type: 'Star' },
                    },
                    arr,
                    { ref: null },
                ],
            ],
        ],
        data_constructor: [],
    };
    const constraint = infer_vdef(term.pos, tenv, term);
    trace.push(constraint);
    const plus = variable('Flexible', 'plus');
    vbls.push(plus);
    // should I set this up more directly? Seems a little funny to
    // do a whole constraint thing.

    const res = solve(
        {
            type: 'Let',
            schemes: [
                {
                    constraint: {
                        type: 'Equation',
                        pos: -1,
                        t1: { type: 'Variable', value: plus },
                        t2: arrow(
                            tenv,
                            { type: 'Variable', value: int },
                            arrow(
                                tenv,
                                { type: 'Variable', value: int },
                                { type: 'Variable', value: int },
                            ),
                        ),
                    },
                    flexible: [plus],
                    header: {},
                    pos: -1,
                    rigid: [],
                    type: 'Scheme',
                },
                constraint,
            ],
            constraint: { type: 'Dump', pos: -1 },
            pos: -1,
        },
        vbls,
        {
            type: 'EnvFrame',
            env: { type: 'Empty' },
            name: '+',
            var: plus,
        },
    );
    if (res.type === 'EnvFrame') {
        return { type: 'Variable', value: res.var };
    }
    // console.log(constraint, res);
    return {
        type: 'Variable',
        value: {
            link: {
                type: 'Info',
                weight: 0,
                descriptor: { kind: 'Flexible', mark: Mark_none, rank: 0 },
            },
        },
    };
};

type Seen = Map<MultiEquation_descriptor, string>;

export const typToString = (t: crterm, seen: Seen = new Map()): string => {
    if (t.type === 'Variable') {
        return vToString(t.value, seen);
    } else {
        return caTermToString(t.term, typToString, seen);
    }
};

const vWrap = (
    descriptor: MultiEquation_descriptor,
): MultiEquation_variable => ({
    link: { type: 'Info', descriptor, weight: 0 },
});

const letters = 'abcdefghijklmnop';
export const vToString = (
    v: MultiEquation_variable,
    seen: Seen = new Map(),
): string => {
    const d = find(v);
    if (d.structure) {
        if (d.structure.type == 'App') {
            const fn = find(d.structure.fn);

            if (fn.kind === 'Constant' && fn.name === 'pi') {
                const items: [string, MultiEquation_variable][] = [];
                let body = find(d.structure.arg);
                while (body.structure?.type === 'RowCons') {
                    items.push([body.structure.label, body.structure.head]);
                    body = find(body.structure.tail);
                }
                return `{${items
                    .map(([name, v]) => `${name} ${vToString(v, seen)}`)
                    .join(' ')}${
                    body.structure?.type === 'RowUniform'
                        ? ''
                        : ' ..' + vToString(vWrap(body), seen)
                }}`;
            }

            if (fn.kind === 'Constant' && fn.name === 'sigma') {
                const items: [string, MultiEquation_variable][] = [];
                let body = find(d.structure.arg);
                while (body.structure?.type === 'RowCons') {
                    items.push([body.structure.label, body.structure.head]);
                    body = find(body.structure.tail);
                }
                return `[${items
                    .map(([name, v]) => {
                        const d = find(v);
                        if (d.structure?.type === 'App') {
                            const fn = find(d.structure.fn);
                            if (fn.name === 'pre') {
                                const arg = find(d.structure.arg);
                                if (
                                    arg.name === 'abs' &&
                                    arg.kind === 'Constant'
                                ) {
                                    return name;
                                }
                            }
                        }
                        return `(${name} ${vToString(v, seen)})`;
                    })
                    .join(' ')}${
                    body.structure?.type === 'RowUniform'
                        ? ''
                        : ' ' + vToString(vWrap(body), seen)
                }]`;
            }

            if (
                !fn.structure &&
                fn.kind === 'Constant' &&
                (fn.name === 'pi' || fn.name === 'pre')
            ) {
                return vToString(d.structure.arg, seen);
            }
        }

        if (d.structure.type === 'RowCons') {
            let conses = [d.structure];
            let last = find(d.structure.tail);
            while (last.structure?.type === 'RowCons') {
                conses.push(last.structure);
                last = find(last.structure.tail);
            }
            return `{${conses
                .map((c) => `${c.label} ${vToString(c.head, seen)}`)
                .join(' ')}${
                last.structure?.type === 'RowUniform'
                    ? ''
                    : ' ' + vToString(vWrap(last), seen)
            }}`;
        }

        return caTermToString(d.structure, vToString, seen);
    }
    if (d.kind === 'Constant') {
        return d.name ?? 'unnamed-builtin'; // + '[builtin?]';
    } else {
        if (!seen.has(d)) {
            seen.set(d, letters[seen.size]);
        }
        return "'" + seen.get(d)!;
    }
};

export let trace: any[] = [];
export const getTrace = () => {
    const res = trace;
    trace = [];
    return res;
};

function caTermToString<t>(
    term: CoreAlgebra_term<t>,
    tToString: (t: t, seen: Seen) => string,
    seen: Seen,
) {
    switch (term.type) {
        case 'App':
            return `(${tToString(term.fn, seen)} ${tToString(term.arg, seen)})`;
        case 'RowUniform':
            return '{}';
        case 'RowCons':
            return `{${term.label} ${tToString(term.head, seen)} ${tToString(
                term.tail,
                seen,
            )}}`;
        case 'Var':
            return tToString(term.value, seen);
    }
    return '';
}
