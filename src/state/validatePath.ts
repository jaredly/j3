import { idText, splitGraphemes } from '../parse/parse';
import { Map } from '../types/mcst';
import { Path } from './path';

export const validatePath = (
    map: Map,
    path: Path[],
    hashNames: { [key: number]: string },
) => {
    for (let i = 0; i < path.length - 1; i++) {
        const next = path[i + 1].idx;
        const { idx, ...child } = path[i];
        const node = map[idx];
        switch (child.type) {
            case 'annot-annot':
                if (node.type !== 'annot' || node.annot !== next) {
                    return false;
                }
                break;
            case 'annot-target':
                if (node.type !== 'annot' || node.target !== next) {
                    return false;
                }
                break;
            case 'attribute':
                if (
                    node.type !== 'recordAccess' ||
                    child.at > node.items.length ||
                    node.items[child.at - 1] !== next
                ) {
                    return false;
                }
                break;
            case 'child':
                if (
                    !('values' in node) ||
                    child.at >= node.values.length ||
                    node.values[child.at] !== next
                ) {
                    return false;
                }
                break;
            case 'end':
            case 'start':
            case 'inside':
                return false;
            case 'expr':
                if (
                    node.type !== 'string' ||
                    child.at > node.templates.length ||
                    node.templates[child.at - 1].expr !== next
                ) {
                    return false;
                }
                break;
            case 'text':
                if (
                    node.type !== 'string' ||
                    child.at > node.templates.length ||
                    (child.at === 0
                        ? node.first !== next
                        : node.templates[child.at - 1].suffix !== next)
                ) {
                    return false;
                }
                break;
            case 'record-target':
                if (node.type !== 'recordAccess' || node.target !== next) {
                    return false;
                }
                break;
            case 'spread-contents':
                if (node.type !== 'spread' || node.contents !== next) {
                    return false;
                }
                break;
            case 'subtext':
                if (!('text' in node) && node.type !== 'hash') {
                    return false;
                }
                const text = splitGraphemes(
                    hashNames[node.loc] ?? idText(node, map) ?? '',
                );
                if (child.at < 0 || child.at > text.length) {
                    return false;
                }
                break;
        }
    }
    return true;
};
