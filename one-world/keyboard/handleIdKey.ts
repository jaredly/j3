import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { cursorSplit } from './cursorSplit';
import { Flat, addNeighborAfter, addNeighborBefore, findParent, listKindForKeyKind } from './flatenate';
import { Config, textKind } from './insertId';
import { flatToUpdateNew, flatten } from './rough';
import { Cursor, IdCursor, Path, Top, Update, lastChild, parentPath, selStart } from './utils';

export const handleIdKey = (config: Config, top: Top, path: Path, cursor: IdCursor, grem: string): Update => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);

    if (typeof kind === 'number') {
        if (current.ccls == null) {
            return {
                nodes: { [current.loc]: { ...current, ccls: kind, text: grem } },
                selection: { start: selStart(path, { type: 'id', end: 1 }) },
            };
        }

        if (current.ccls === kind) {
            // Just update the selection
            const chars = cursor.text?.slice() ?? splitGraphemes(current.text);
            const { left, right } = cursorSides(cursor);
            chars.splice(left, right - left, grem);
            return { nodes: {}, selection: { start: selStart(path, { ...cursor, start: undefined, text: chars, end: left + 1 }) } };
        }
    }

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);
    const flat = parent ? flatten(parent.node, top) : [current];
    const at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);

    const nodes: Update['nodes'] = {};

    const split = cursorSplit(current.text, cursor);

    // console.log('before', flat);
    const neighbor: Flat =
        kind === 'sep'
            ? { type: 'sep', loc: -1 }
            : kind === 'space'
            ? { type: 'space', loc: -1 }
            : kind === 'string'
            ? { type: 'text', spans: [], loc: -1 }
            : { type: 'id', text: grem, loc: -1, ccls: kind };

    let sel: Node = current;
    let ncursor: Cursor = { ...cursor, start: undefined };

    switch (split.type) {
        case 'before': {
            ({ sel, ncursor } = addNeighborBefore(at, flat, neighbor, sel, ncursor));
            break;
        }
        case 'after': {
            ({ sel, ncursor } = addNeighborAfter(at, flat, neighbor, sel, ncursor));
            break;
        }
        case 'between': {
            nodes[current.loc] = { ...current, text: split.left };
            flat.splice(at + 1, 0, neighbor, (sel = { type: 'id', text: split.right, loc: -1, ccls: current.ccls }));
            ncursor = { type: 'id', end: 0 };
            break;
        }
    }

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? current, path: parent?.path ?? path },
        nodes,
        top,
    );
};
