import { replaceIn } from './replaceIn';
import { Top, Update } from './utils';

export const replaceAt = (path: number[], top: Top, old: number, ...locs: number[]): Update => {
    if (locs.length === 1 && old === locs[0]) return { nodes: {} };
    if (path.length === 0) {
        if (old !== top.root) {
            throw new Error(`expected ${old} to be root of top, but found ${top.root}`);
        }
        if (locs.length !== 1) {
            throw new Error(`cant multi-replace at the toplevel ... not yet`);
        }
        return { nodes: {}, root: locs[0] };
    }
    const ploc = path[path.length - 1];
    const pnode = top.nodes[ploc];
    return { nodes: { [ploc]: replaceIn(pnode, old, ...locs) } };
};
