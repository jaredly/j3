import { nodeToString } from '../../src/to-cst/nodeToString';
import { fromMCST, Map } from '../../src/types/mcst';
import { Path } from '../store';

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
        if (parent.child.type === 'end') {
            continue;
        }
        const node = map[parent.idx];
        if (node.type === looking) {
            return path
                .slice(0, i)
                .concat({ idx: parent.idx, child: { type: 'end' } });
        }
        if (
            key === '}' &&
            parent.child.type === 'expr' &&
            node.type === 'string'
        ) {
            if (parent.child.at === 0) {
                throw new Error(`what is happening`);
            }
            if (parent.child.at - 1 >= node.templates.length) {
                console.log(nodeToString(fromMCST(-1, map)));
                throw new Error(`${parent.child.at} - ${JSON.stringify(node)}`);
            }
            const suffix = node.templates[parent.child.at - 1].suffix;
            return path.slice(0, i).concat(
                {
                    idx: parent.idx,
                    child: {
                        type: 'text',
                        at: parent.child.at,
                    },
                },
                {
                    idx: suffix,
                    child: { type: 'subtext', at: 0 },
                },
            );
        }
    }
};
