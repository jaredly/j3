import { Node } from '../types/cst';
import { transformNode } from '../types/transform-cst';

export const fixDuplicateLocs = (node: Node): Node => {
    let max = 0;
    transformNode(node, {
        pre(node) {
            max = Math.max(max, node.loc);
        },
    });
    const used: Record<number, true> = {};
    return transformNode(node, {
        pre(node) {
            if (used[node.loc]) {
                return { ...node, loc: ++max };
            }
            used[node.loc] = true;
        },
    });
};
