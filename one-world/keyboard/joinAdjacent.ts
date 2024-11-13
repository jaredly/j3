import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { List, Id } from '../shared/cnodes';
import { Split } from './cursorSplit';
import {
    Path,
    Top,
    Update,
    selStart,
    pathWithChildren,
    parentPath,
} from './lisp';

export const joinAdjacent = (
    parent: List<number>,
    id: Id<number>,
    path: Path,
    split: Split,
    top: Top,
    insert: string,
): Update | void => {
    const at = parent.children.indexOf(id.loc);
    if (at === -1) throw new Error(`not in children ${id.loc}`);
    if (split.type === 'before' && at > 0) {
        const prev = top.nodes[parent.children[at - 1]];
        if (prev.type === 'id') {
            const pc = splitGraphemes(prev.text);
            return {
                nodes: {
                    [id.loc]: { ...id, text: split.text },
                    [prev.loc]: { ...prev, text: prev.text + insert },
                },
                selection: {
                    start: selStart(
                        pathWithChildren(parentPath(path), prev.loc),
                        { type: 'id', end: pc.length + 1 },
                    ),
                },
            };
        }
    }
    if (split.type === 'after' && at < parent.children.length - 1) {
        const next = top.nodes[parent.children[at + 1]];
        if (next.type === 'id') {
            return {
                nodes: {
                    [id.loc]: { ...id, text: split.text },
                    [next.loc]: { ...next, text: insert + next.text },
                },
                selection: {
                    start: selStart(
                        pathWithChildren(parentPath(path), next.loc),
                        { type: 'id', end: 1 },
                    ),
                },
            };
        }
    }
};
