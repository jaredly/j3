import { Map } from '../src/types/mcst';

export const xpath = (map: Map, root: number, path: string[]) => {
    let node = map[root];
    for (let i = 0; i < path.length; i++) {
        const next = path[i];
        if (
            node.type === 'list' ||
            node.type === 'array' ||
            node.type === 'record'
        ) {
            const idx = +next;
            if (isNaN(idx) || idx >= node.values.length) {
                return null;
            }
            node = map[node.values[+next]];
            continue;
        }
        if (node.type === 'string') {
            if (next === 'first') {
                node = map[node.first];
                continue;
            }
            const idx = +next;
            if (isNaN(idx) || idx >= node.templates.length) {
                return null;
            }
            i++;
            const second = path[i];
            if (!second || (second !== 'expr' && second !== 'suffix')) {
                return null;
            }
            node = map[node.templates[idx][second]];
            continue;
        }
        if (node.type === 'recordAccess') {
            if (next === 'target') {
                node = map[node.target];
                continue;
            }
            const idx = +next;
            if (isNaN(idx) || idx >= node.items.length) {
                return null;
            }
            node = map[node.items[idx]];
            continue;
        }
        return null;
    }
    return node;
};
