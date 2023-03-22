import { Path } from '../../web/mods/path';
import { accessText, Identifier, Node, NodeExtra } from './cst';
import { MNode } from './mcst';

export const transformNode = (
    node: Node,
    visitor: {
        pre?: (node: Node, path: Path[]) => Node | undefined | void | false;
        post?: (node: Node, path: Path[]) => Node | undefined | void;
    },
    path: Path[] = [],
): Node => {
    if (visitor.pre) {
        const res = visitor.pre(node, path);
        if (res === false) {
            return node;
        }
        node = res ?? node;
    }
    const idx = node.loc.idx;
    switch (node.type) {
        case 'list':
        case 'record':
        case 'array': {
            let changed = false;
            const values = node.values.map((n, i) => {
                const res = transformNode(
                    n,
                    visitor,
                    path.concat({ idx, type: 'child', at: i }),
                );
                changed = changed || res !== n;
                return res;
            });

            if (changed) {
                node = { ...node, values };
            }
            break;
        }
        case 'string': {
            const first = transformNode(
                node.first,
                visitor,
                path.concat({ idx, type: 'text', at: 0 }),
            );
            if (first.type !== 'stringText') {
                throw new Error(`first not stringText`);
            }
            let changed = first !== node.first;
            const templates = node.templates.map((item, i) => {
                const expr = transformNode(
                    item.expr,
                    visitor,
                    path.concat({ idx, type: 'expr', at: i + 1 }),
                );
                const suffix = transformNode(
                    item.suffix,
                    visitor,
                    path.concat({ idx, type: 'text', at: i + 1 }),
                );
                if (suffix.type !== 'stringText') {
                    throw new Error(`suffix not stringText`);
                }
                if (expr !== item.expr || suffix !== item.suffix) {
                    changed = true;
                    return { expr, suffix };
                }
                return item;
            });
            if (changed) {
                node = { ...node, first, templates };
            }
            break;
        }
        case 'blank':
        case 'comment':
        case 'accessText':
        case 'stringText':
        case 'attachment':
        case 'unparsed':
        case 'rich-text':
        case 'identifier':
            break;
        case 'recordAccess': {
            const target = transformNode(
                node.target,
                visitor,
                path.concat({ idx, type: 'record-target' }),
            );
            if (target.type !== 'identifier' && target.type !== 'blank') {
                throw new Error(`record access target must be id or blank`);
            }
            let changed = target !== node.target;
            const items = node.items.map((item, i) => {
                const res = transformNode(
                    item,
                    visitor,
                    path.concat({
                        idx,
                        type: 'attribute',
                        at: i + 1,
                    }),
                );
                if (res.type !== 'accessText') {
                    throw new Error(
                        `record access item must be an access text`,
                    );
                }
                if (res !== item) {
                    changed = true;
                    return res;
                }
                return item;
            });
            if (changed) {
                node = { ...node, target, items };
            }

            break;
        }
        case 'annot': {
            const target = transformNode(
                node.target,
                visitor,
                path.concat({ idx, type: 'annot-target' }),
            );
            node = target !== node.target ? { ...node, target } : node;
            const annot = transformNode(
                node.annot,
                visitor,
                path.concat({ idx, type: 'annot-annot' }),
            );
            node = annot !== node.annot ? { ...node, annot } : node;
            break;
        }
        case 'spread': {
            const contents = transformNode(
                node.contents,
                visitor,
                path.concat({ idx, type: 'spread-contents' }),
            );
            node = contents !== node.contents ? { ...node, contents } : node;
            break;
        }
        default:
            let _: never = node;
    }

    if (visitor?.post) {
        node = visitor.post(node, path) ?? node;
    }

    return node;
};
