import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, List, Node } from '../shared/cnodes';
import { Split } from './cursorSplit';
import { Path, Top, Update, parentPath, pathWithChildren, selStart } from './utils';

export const joinAdjacentList = (parent: List<number>, id: Node, path: Path, side: 'before' | 'after', top: Top, insert: string): Update | void => {
    const at = parent.children.indexOf(id.loc);
    if (at === -1) throw new Error(`not in children ${id.loc}`);
    if (side === 'before' && at > 0) {
        const prev = top.nodes[parent.children[at - 1]];
        if (prev.type === 'id') {
            const pc = splitGraphemes(prev.text);
            return {
                nodes: {
                    [prev.loc]: { ...prev, text: prev.text + insert },
                },
                selection: {
                    start: selStart(pathWithChildren(parentPath(path), prev.loc), { type: 'id', end: pc.length + 1 }),
                },
            };
        }
    }
    if (side === 'after' && at < parent.children.length - 1) {
        const next = top.nodes[parent.children[at + 1]];
        if (next.type === 'id') {
            return {
                nodes: {
                    [next.loc]: { ...next, text: insert + next.text },
                },
                selection: {
                    start: selStart(pathWithChildren(parentPath(path), next.loc), { type: 'id', end: 1 }),
                },
            };
        }
    }
};

export const joinAdjacent = (parent: List<number>, id: Id<number>, path: Path, split: Split, top: Top, insert: string): Update | void => {
    if (split.type === 'between') return;
    const update = joinAdjacentList(parent, id, path, split.type, top, insert);
    if (update) {
        update.nodes[id.loc] = { ...id, text: split.text };
        return update;
    }
};
