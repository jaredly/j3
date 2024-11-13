import { replaceIn } from './replaceIn';
import { Top, Update } from './utils';

export const replaceAt = (path: number[], top: Top, old: number, loc: number): Update => {
    if (path.length === 0) {
        if (old !== top.root) {
            throw new Error(`expected ${old} to be root of top, but found ${top.root}`);
        }
        return { nodes: {}, root: loc };
    }
    const ploc = path[path.length - 1];
    const pnode = top.nodes[ploc];
    return { nodes: { [ploc]: replaceIn(pnode, old, loc) } };
};
