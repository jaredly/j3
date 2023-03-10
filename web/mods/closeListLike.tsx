import { Map } from '../../src/types/mcst';
import { Path } from '../store';
import { SelectAndPath } from './getKeyUpdate';

export const closeListLike = (
    key: string,
    path: Path[],
    map: Map,
): SelectAndPath | void => {
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
            return {
                selection: {
                    idx: parent.idx,
                    loc: 'end',
                },
                path: path.slice(0, i),
            };
        }
        if (
            key === '}' &&
            parent.child.type === 'expr' &&
            node.type === 'string'
        ) {
            const suffix = node.templates[parent.child.at - 1].suffix;
            return {
                selection: {
                    idx: suffix,
                    loc: 0,
                },
                path: path.slice(0, i).concat({
                    idx: parent.idx,
                    child: {
                        type: 'text',
                        at: parent.child.at,
                    },
                }),
            };
        }
    }
};
