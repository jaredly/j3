import { Node, NodeArray, NodeExtra } from '../src/types/cst';
import { transformNode } from '../src/types/transform-cst';

// const matches = (node: Node)

export const attachAnnotations = (nodes: Node[]) => {
    const res: Node[] = [];
    nodes.forEach((node) => {
        if (node.type === 'identifier' && node.text.startsWith(':')) {
            const prev = { ...res[res.length - 1] };
            prev.tannot = {
                ...node,
                text: node.text.slice(1),
            };
            res[res.length - 1] = prev;
        } else if (
            node.type === 'list' &&
            node.values.length &&
            node.values[0].type === 'identifier' &&
            node.values[0].text === ':'
        ) {
            const prev = { ...res[res.length - 1] };
            prev.tannot =
                node.values.length > 2
                    ? {
                          ...node,
                          values: node.values.slice(1),
                      }
                    : node.values[1];
            res[res.length - 1] = prev;
        } else {
            res.push(node);
        }
    });
    return res;
};

const modFnArgs = (node: Node, fn: (args: Node[]) => Node[]) => {
    if (node.type !== 'list') {
        return node;
    }
    if (node.values.length < 2) {
        return node;
    }
    const first = node.values[0];
    if (first.type !== 'identifier') {
        return node;
    }
    if (first.text === 'fn' && node.values[1].type === 'array') {
        return {
            ...node,
            values: [
                node.values[0],
                { ...node.values[1], values: fn(node.values[1].values) },
                ...node.values.slice(2),
            ],
        };
    }
    if (first.text === 'defn' && node.values[2].type === 'array') {
        return {
            ...node,
            values: [
                node.values[0],
                node.values[1],
                { ...node.values[2], values: fn(node.values[2].values) },
                ...node.values.slice(3),
            ],
        };
    }
    return node;
};

export const preprocess = (node: Node) => {
    return transformNode(node, {
        pre(node) {
            if (node.type === 'identifier') {
                // if (node.text.startsWith('...')) {
                //     return {
                //         type: 'spread',
                //         contents:
                //     }
                // }
                if (node.text.includes('.')) {
                }
            }
            return modFnArgs(node, attachAnnotations);
        },
    });
};
