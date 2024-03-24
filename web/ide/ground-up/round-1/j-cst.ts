import { Node } from '../../../../src/types/cst';
import { filterNulls } from '../../../custom/reduce';
import { arr, filterBlanks, wrapArray } from './parse';

export type jcst =
    | { type: 'cst/list'; 0: arr<jcst>; 1: number }
    | { type: 'cst/array'; 0: arr<jcst>; 1: number }
    | { type: 'cst/spread'; 0: jcst; 1: number }
    | { type: 'cst/empty-spread'; 0: number }
    | {
          type: 'cst/string';
          0: string;
          1: arr<{ type: ',,'; 0: jcst; 1: string; 2: number }>;
          2: number;
      }
    | { type: 'cst/identifier'; 0: string; 1: number };

`
(deftype cst
    (cst/list (array cst) int)
    (cst/array (array cst) int)
    (cst/identifier string int)
    (cst/string string (array (, cst string int)) int)
    )
`;

export const toJCST = (node: Node): jcst | null => {
    switch (node.type) {
        case 'identifier':
            return { type: 'cst/identifier', 0: node.text, 1: node.loc };
        case 'list': {
            const values = filterBlanks(node.values).map(toJCST);
            if (!values.every(Boolean)) return null;
            if (
                values[0]?.type === 'cst/identifier' &&
                values[0][0] === "@@'"
            ) {
                // MAGIC
                return {
                    type: 'cst/list',
                    0: wrapArray([
                        { type: 'cst/identifier', 0: ',', 1: node.loc },
                        {
                            type: 'cst/list',
                            0: wrapArray([
                                { type: 'cst/identifier', 0: '@@', 1: -1 },
                                ...(values.slice(1) as jcst[]),
                            ]),
                            1: node.loc,
                        },
                        // {
                        //     type: 'cst/list',
                        //     0: wrapArray([
                        //         { type: 'cst/identifier', 0: '@@', 1: -1 },
                        //         ['lol'],
                        //     ]),
                        //     1: node.loc,
                        // },
                    ]),
                    1: node.loc,
                };
            }
            return {
                type: 'cst/list',
                0: wrapArray(values as jcst[]),
                1: node.loc,
            };
        }
        case 'spread':
            const inner = toJCST(node.contents);
            return inner
                ? { type: 'cst/spread', 0: inner, 1: node.loc }
                : { type: 'cst/empty-spread', 0: node.loc };
        case 'array': {
            const values = filterBlanks(node.values).map(toJCST);
            if (!values.every(Boolean)) return null;
            return {
                type: 'cst/array',
                0: wrapArray(values as jcst[]),
                1: node.loc,
            };
        }
        case 'string':
            const parsed = node.templates.map((item) => toJCST(item.expr));
            if (parsed.some((p) => !p)) return null;
            return {
                type: 'cst/string',
                0: node.first.text,
                1: wrapArray(
                    node.templates.map((item, i) => ({
                        type: ',,',
                        0: parsed[i]!,
                        1: item.suffix.text,
                        2: item.suffix.loc,
                    })),
                ),
                2: node.loc,
            };
    }
    return null;
};
