import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { cursorSplit } from './cursorSplit';
import { Flat, addNeighborAfter, addNeighborBefore, findParent, listKindForKeyKind } from './flatenate';
import { braced } from './handleListKey';
import { textKind } from './insertId';
import { Config } from './test-utils';
import { flatToUpdateNew, flatten } from './rough';
import { Cursor, IdCursor, Path, Top, Update, lastChild, parentLoc, parentPath, selStart } from './utils';

export const handleIdKey = (config: Config, top: Top, path: Path, cursor: IdCursor, grem: string): Update => {
    let current = top.nodes[lastChild(path)];
    if (current.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);

    if (grem === config.tableNew && cursor.end === 0) {
        const parent = top.nodes[parentLoc(path)];
        if (parent?.type === 'list' && (parent.kind === 'round' || parent.kind === 'curly' || parent.kind === 'square')) {
            return { nodes: { [parent.loc]: { type: 'table', kind: parent.kind, loc: parent.loc, rows: [[current.loc]] } } };
        }
    }

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

    const pnode = top.nodes[parentLoc(path)];
    if (grem === '\n' && pnode?.type === 'list' && braced(pnode) && pnode.children.length === 1 && !pnode.forceMultiline) {
        const chars = cursor.text?.slice() ?? splitGraphemes(current.text);
        if (chars.length === 0) {
            return { nodes: { [pnode.loc]: { ...pnode, forceMultiline: true } } };
        }
    }

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);

    const flat = parent ? flatten(parent.node, top) : [current];
    const at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);

    const nodes: Update['nodes'] = {};

    if (current.type === 'id' && cursor.type === 'id' && cursor.text) {
        current = nodes[current.loc] = { ...current, text: cursor.text.join(''), ccls: cursor.text.length === 0 ? undefined : current.ccls };
        flat[at] = current;
    }

    const split = cursorSplit(current.text, cursor);

    const neighbor: Flat =
        kind === 'sep'
            ? { type: 'sep', loc: -1, multiLine: grem === '\n' }
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
