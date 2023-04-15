// Utils related to parsing and stuff.
// This is to get line / column from
// a loc.start or loc.end

import { Type } from '../types/ast';
import { Node } from '../types/cst';
import { transformNode } from '../types/transform-cst';
import { Ctx } from './Ctx';
import { nodeToType } from './nodeToType';

export const idxLines = (raw: string) => {
    const starts: number[] = [];
    let total = 0;
    raw.split('\n').forEach((line) => {
        starts.push(total);
        total += line.length + 1;
    });
    return starts;
};

export const getLine = (lines: number[], idx: number) => {
    for (let i = 1; i < lines.length; i++) {
        if (idx < lines[i]) {
            return i - 1;
        }
    }
    return lines.length - 1;
};

export const getPos = (lines: number[], idx: number) => {
    const line = getLine(lines, idx);
    return { line, col: idx - lines[line] };
};

export const callWith = (node: Node, name: string): Node[] | void => {
    if (
        node.type === 'list' &&
        node.values.length >= 1 &&
        node.values[0].type === 'identifier' &&
        node.values[0].text === name
    ) {
        return node.values.slice(1);
    }
};

export type DecExpected = {
    errors: {
        message: string;
        idx: number;
    }[];
    expected: {
        type: Type;
        idx: number;
    }[];
};

// export const removeDecorators = (node: Node, ctx: Ctx) => {
//     const result: {
//         errors: {
//             message: string;
//             idx: number;
//         }[];
//         expected: {
//             type: Type;
//             idx: number;
//         }[];
//     } = { errors: [], expected: [] };
//     node = transformNode(node, {
//         pre(node) {
//             const values = callWith(node, '@error');
//             if (!values) {
//                 const values = callWith(node, '@type');
//                 if (!values) {
//                     return;
//                 }
//                 if (values.length !== 2) {
//                     throw new Error(`misconfigured, wrong size`);
//                 }
//                 result.expected.push({
//                     type: nodeToType(values[0], ctx),
//                     idx: values[1].loc.idx,
//                 });
//                 return values[1];
//             }
//             if (values.length !== 2) {
//                 throw new Error(`misconfigured, wrong size`);
//             }
//             if (values[0].type !== 'string') {
//                 throw new Error(`error non a string`);
//             }
//             result.errors.push({
//                 message: values[0].first.text,
//                 idx: values[1].loc.idx,
//             });
//             return values[1];
//         },
//     });
//     return { expected: result, node };
// };
