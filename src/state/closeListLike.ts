import { nodeToString } from '../to-cst/nodeToString';
import { fromMCST, Map } from '../types/mcst';
import { Path } from './path';

export const closeListLike = (
    key: string,
    path: Path[],
    map: Map,
): Path[] | void => {
    const looking = ({ ')': 'list', ']': 'array', '}': 'record' } as const)[
        key
    ];
    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];
        if (parent.type === 'end') {
            continue;
        }
        const node = map[parent.idx];
        if (node.type === looking) {
            return path.slice(0, i).concat({ idx: parent.idx, type: 'end' });
        }
        if (key === '}' && parent.type === 'expr' && node.type === 'string') {
            if (parent.at === 0) {
                throw new Error(`what is happening`);
            }
            if (parent.at - 1 >= node.templates.length) {
                console.log(nodeToString(fromMCST(-1, map), {}));
                throw new Error(`${parent.at} - ${JSON.stringify(node)}`);
            }
            const suffix = node.templates[parent.at - 1].suffix;
            return path
                .slice(0, i)
                .concat(
                    { idx: parent.idx, type: 'text', at: parent.at },
                    { idx: suffix, type: 'subtext', at: 0 },
                );
        }
    }
};
