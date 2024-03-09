import { Node } from '../../../../src/types/cst';
import { filterNulls } from '../../../custom/reduce';
import { arr, filterBlanks, wrapArray } from './parse';

export type jcst =
    | { type: 'cst/list'; 0: arr<jcst>; 1: number }
    | { type: 'cst/array'; 0: arr<jcst>; 1: number }
    | {
          type: 'cst/string';
          0: string;
          1: arr<{ type: ','; 0: jcst; 1: string; 2: number }>;
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
        case 'list':
            return {
                type: 'cst/list',
                0: wrapArray(
                    filterBlanks(node.values).map(toJCST).filter(filterNulls),
                ),
                1: node.loc,
            };
        case 'array':
            return {
                type: 'cst/array',
                0: wrapArray(
                    filterBlanks(node.values).map(toJCST).filter(filterNulls),
                ),
                1: node.loc,
            };
        case 'string':
            const parsed = node.templates.map((item) => toJCST(item.expr));
            if (parsed.some((p) => !p)) return null;
            return {
                type: 'cst/string',
                0: node.first.text,
                1: wrapArray(
                    node.templates.map((item, i) => ({
                        type: ',',
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
