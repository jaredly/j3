import { Node, NodeArray, NodeExtra } from '../src/types/cst';
import { transformNode } from '../src/types/transform-cst';

// const matches = (node: Node)

// const modFnArgs = (node: Node, fn: (args: Node[]) => Node[]) => {
//     if (node.type !== 'list') {
//         return node;
//     }
//     if (node.values.length < 2) {
//         return node;
//     }
//     const first = node.values[0];
//     if (first.type !== 'identifier') {
//         return node;
//     }
//     if (first.text === 'fn' && node.values[1].type === 'array') {
//         return {
//             ...node,
//             values: [
//                 node.values[0],
//                 { ...node.values[1], values: fn(node.values[1].values) },
//                 ...node.values.slice(2),
//             ],
//         };
//     }
//     if (first.text === 'defn' && node.values[2].type === 'array') {
//         return {
//             ...node,
//             values: [
//                 node.values[0],
//                 node.values[1],
//                 { ...node.values[2], values: fn(node.values[2].values) },
//                 ...node.values.slice(3),
//             ],
//         };
//     }
//     return node;
// };

// export const preprocess = (node: Node) => {
//     return transformNode(node, {
//         pre(node) {
//             if (node.type === 'identifier') {
//                 // if (node.text.startsWith('...')) {
//                 //     return {
//                 //         type: 'spread',
//                 //         contents:
//                 //     }
//                 // }
//                 if (node.text.includes('.')) {
//                 }
//             }
//             return modFnArgs(node, attachAnnotations);
//         },
//     });
// };
