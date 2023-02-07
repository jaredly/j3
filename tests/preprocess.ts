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

export const preprocess = (node: Node) => {
    return transformNode(node, {
        pre(node) {
            if (
                node.type === 'list' &&
                node.values.length >= 2 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'fn' &&
                node.values[1].type === 'array'
            ) {
                const values = node.values.slice();
                values[1] = {
                    ...(values[1] as NodeArray & NodeExtra),
                    values: attachAnnotations(
                        (values[1] as NodeArray & NodeExtra).values,
                    ),
                };
                return { ...node, values };
            }
        },
    });
};
