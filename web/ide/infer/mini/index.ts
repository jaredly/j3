import { Mark_none, crterm, infer_expr, infer_vdef, variable } from './infer';
import { solve } from './solve';
import { expression } from './types';
import { find, fresh } from './union_find';

export { parse } from './parse';

export type { crterm as typ };
export const builtins = {};
export const infer = (builtins: any, term: expression, _: any): crterm => {
    // init_builtin_env

    const int = variable('Constant', 'int');

    const constraint = infer_vdef(
        term.pos,
        {
            type_info: [
                ['int', [{ type: 'Star' }, int, { ref: null }]],
                [
                    '->',
                    [
                        {
                            type: 'Arrow',
                            left: { type: 'EmptyRow' },
                            right: { type: 'Star' },
                        },
                        int,
                        { ref: null },
                    ],
                ],
            ],
            data_constructor: [],
        },
        term,
    );
    console.log(constraint);
    const res = solve(
        {
            type: 'Let',
            schemes: [constraint],
            constraint: { type: 'Dump', pos: -1 },
            pos: -1,
        },
        [int],
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

export const typToString = (t: crterm): string => {
    if (t.type === 'Variable') {
        const d = find(t.value);
        if (d.kind === 'Constant') {
            return d.name + '[builtin?]';
        } else {
            return `var?${d.name}`;
        }
    } else {
        switch (t.term.type) {
            case 'App':
                return `(${typToString(t.term.fn)} ${typToString(t.term.arg)})`;
            case 'RowUniform':
                return '..';
            case 'RowCons':
                return `{${t.term.label} ${typToString(
                    t.term.head,
                )} ${typToString(t.term.tail)}}`;
            case 'Var':
                return typToString(t.term.value);
        }
    }
};

export const getTrace = () => [];
