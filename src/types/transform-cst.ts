import { Node } from './cst';

export const transformNode = (
    node: Node,
    visitor?: {
        pre?: (node: Node) => Node | undefined | void;
        post?: (node: Node) => Node | undefined | void;
    },
): Node => {
    if (visitor?.pre) {
        node = visitor.pre(node) ?? node;
    }
    switch (node.type) {
        case 'list':
        case 'record':
        case 'array': {
            let changed = false;
            const values = node.values.map((n) => {
                const res = transformNode(n, visitor);
                changed = changed || res !== n;
                return res;
            });

            if (changed) {
                node = { ...node, values };
            }
            break;
        }
        case 'string': {
            let changed = false;
            const templates = node.templates.map((item) => {
                const res = transformNode(item.expr, visitor);
                if (res !== item.expr) {
                    changed = true;
                    return { ...item, expr: res };
                }
                return item;
            });
            if (changed) {
                node = { ...node, templates };
            }
            break;
        }
    }

    if (visitor?.post) {
        node = visitor.post(node) ?? node;
    }

    return node;
};
