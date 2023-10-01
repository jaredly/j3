import {
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
    const char = variable('Constant', 'string');
    const arr = variable('Constant', '->');
    const abs = variable('Constant', 'abs');
    const pre = variable('Constant', 'pre');
    const pi = variable('Constant', 'pi');

    const tenv: env = {
        type_info: [
            ['int', [{ type: 'Star' }, int, { ref: null }]],
            ['abs', [{ type: 'Star' }, abs, { ref: null }]],
            ['pi', [{ type: 'Star' }, pi, { ref: null }]],
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
    // console.log(constraint);
    const plus = variable('Flexible', 'plus');

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
        [int, arr, char, plus, abs, pre, pi],
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

export const vToString = (
    v: MultiEquation_variable,
    seen: Seen = new Map(),
): string => {
    const d = find(v);
    if (d.structure) {
        // return thing(d.structure)
        switch (d.structure.type) {
            case 'App':
                return `(${vToString(d.structure.fn, seen)} ${vToString(
                    d.structure.arg,
                    seen,
                )})`;
            case 'RowUniform':
                return '{}';
            case 'RowCons':
                return `{${d.structure.label} ${vToString(
                    d.structure.head,
                    seen,
                )} ${vToString(d.structure.tail, seen)}}`;
            case 'Var':
                return vToString(d.structure.value, seen);
        }
    }
    if (d.kind === 'Constant') {
        return d.name ?? 'unnamed-builtin'; // + '[builtin?]';
    } else {
        if (!seen.has(d)) {
            seen.set(d, letters[seen.size]);
        }
        return seen.get(d)!;
        // return `var:${d.name}`;
        // return d.name ?? 'unnamed-variable';
    }
};

const letters = 'abcdefghijklmnop';

type Seen = Map<MultiEquation_descriptor, string>;

export const typToString = (t: crterm, seen: Seen = new Map()): string => {
    if (t.type === 'Variable') {
        return vToString(t.value, seen);
    } else {
        return thing(t.term, seen);
    }
};

export const getTrace = () => [];

function thing(term: Extract<crterm, { type: 'Term' }>['term'], seen: Seen) {
    switch (term.type) {
        case 'App':
            return `(${typToString(term.fn, seen)} ${typToString(
                term.arg,
                seen,
            )})`;
        case 'RowUniform':
            return '{}';
        case 'RowCons':
            return `{${term.label} ${typToString(
                term.head,
                seen,
            )} ${typToString(term.tail, seen)}}`;
        case 'Var':
            return typToString(term.value, seen);
    }
}
