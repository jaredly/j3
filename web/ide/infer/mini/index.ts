import {
    Mark_none,
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

    const tenv: env = {
        type_info: [
            ['int', [{ type: 'Star' }, int, { ref: null }]],
            ['char', [{ type: 'Star' }, char, { ref: null }]],
            [
                '->',
                [
                    {
                        type: 'Arrow',
                        left: { type: 'EmptyRow' },
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
    console.log(constraint);
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
        [int, arr, char, plus],
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
    console.log(constraint, res);
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

export const vToString = (v: MultiEquation_variable): string => {
    const d = find(v);
    if (d.structure) {
        // return thing(d.structure)
        switch (d.structure.type) {
            case 'App':
                return `(${vToString(d.structure.fn)} ${vToString(
                    d.structure.arg,
                )})`;
            case 'RowUniform':
                return '..';
            case 'RowCons':
                return `{${d.structure.label} ${vToString(
                    d.structure.head,
                )} ${vToString(d.structure.tail)}}`;
            case 'Var':
                return vToString(d.structure.value);
        }
    }
    if (d.kind === 'Constant') {
        return d.name ?? 'unnamed-builtin'; // + '[builtin?]';
    } else {
        // return `var:${d.name}`;
        return d.name ?? 'unnamed-variable';
    }
};

export const typToString = (t: crterm): string => {
    if (t.type === 'Variable') {
        return vToString(t.value);
    } else {
        return thing(t.term);
    }
};

export const getTrace = () => [];

function thing(term: Extract<crterm, { type: 'Term' }>['term']) {
    switch (term.type) {
        case 'App':
            return `(${typToString(term.fn)} ${typToString(term.arg)})`;
        case 'RowUniform':
            return '..';
        case 'RowCons':
            return `{${term.label} ${typToString(term.head)} ${typToString(
                term.tail,
            )}}`;
        case 'Var':
            return typToString(term.value);
    }
}