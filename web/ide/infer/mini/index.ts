import { Mark_none, crterm, infer_expr, infer_vdef, variable } from './infer';
import { solve } from './solve';
import { expression } from './types';
import { fresh } from './union_find';

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

export const typToString = (t: crterm) => {
    return 'lol';
};

export const getTrace = () => [];
