import { Node } from '../../../../src/types/cst';
import { filterNulls } from '../../../custom/old-stuff/filterNulls';
import { arr, filterBlanks, unwrapArray, wrapArray } from './parse';

export const arrEq = <t>(
    eq: (o: t, t: t) => boolean,
    one: arr<t>,
    two: arr<t>,
): boolean => {
    if (one.type === 'nil') {
        return two.type === 'nil';
    }
    if (two.type === 'nil') {
        return false;
    }
    if (!eq(one[0], two[0])) {
        return false;
    }
    return arrEq(eq, one[1], two[1]);
};

export const jscstEq = (one: jcst, two: jcst): boolean => {
    if (one.type !== two.type) return false;
    const t = two as typeof one;
    switch (one.type) {
        case 'cst/array':
        case 'cst/list':
        case 'cst/record':
            return arrEq(jscstEq, one[0], two[0] as any);
        case 'cst/identifier':
            return one[0] === two[0];
        case 'cst/empty-spread':
            return two.type === 'cst/empty-spread';
        case 'cst/spread':
            return two.type === 'cst/spread' && jscstEq(one[0], two[0]);
        case 'cst/string':
            return (
                one[0] === two[0] &&
                arrEq(
                    (one, two) => {
                        return one[1] === two[1] && jscstEq(one[0], two[0]);
                    },
                    one[1],
                    (two as any)[1],
                )
            );
    }
};

export type jcst =
    | { type: 'cst/list'; 0: arr<jcst>; 1: number }
    | { type: 'cst/array'; 0: arr<jcst>; 1: number }
    | { type: 'cst/record'; 0: arr<jcst>; 1: number }
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
    (cst/record (array cst) int)
    (cst/identifier string int)
    (cst/string string (array (, cst string int)) int)
    )
`;

export const fromJCST = (node: jcst): Node => {
    switch (node.type) {
        case 'cst/identifier':
            return { type: 'identifier', loc: node[1], text: node[0] };
        case 'cst/array':
            return {
                type: 'array',
                loc: node[1],
                values: unwrapArray(node[0]).map(fromJCST),
            };
        case 'cst/list':
            return {
                type: 'list',
                loc: node[1],
                values: unwrapArray(node[0]).map(fromJCST),
            };
        case 'cst/record':
            return {
                type: 'record',
                loc: node[1],
                values: unwrapArray(node[0]).map(fromJCST),
            };
        case 'cst/spread':
            return {
                type: 'spread',
                loc: node[1],
                contents: fromJCST(node[0]),
            };
        case 'cst/empty-spread':
            return {
                type: 'spread',
                loc: node[0],
                contents: { type: 'blank', loc: node[0] },
            };
        case 'cst/string':
            return {
                type: 'string',
                first: { type: 'stringText', loc: node[2], text: node[0] },
                loc: node[2],
                templates: unwrapArray(node[1]).map((item) => ({
                    expr: fromJCST(item[0]),
                    suffix: { type: 'stringText', text: item[1], loc: item[2] },
                })),
            };
        default:
            let _: never = node;
            throw new Error(`Unknown jcst type ${(node as any).type}`);
    }
};

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
                // ???? What even was this about, I don't rememebr
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
        case 'record': {
            const values = filterBlanks(node.values).map(toJCST);
            if (!values.every(Boolean)) return null;
            return {
                type: 'cst/record',
                0: wrapArray(values as jcst[]),
                1: node.loc,
            };
        }
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
