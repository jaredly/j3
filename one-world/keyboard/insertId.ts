import { Node, Nodes } from '../shared/cnodes';
import { addNeighborAfter, addNeighborBefore, findParent, Flat, flatten, flatToUpdate, listKindForKeyKind } from './flatenate';
import { justSel } from './handleNav';
// import { splitSmooshId, splitSpacedId } from './splitSmoosh';
import { CollectionCursor, Cursor, lastChild, ListCursor, parentPath, Path, pathWithChildren, selStart, TextCursor, Top, Update } from './utils';
export type Config = { punct: string[]; space: string; sep: string };

export type Kind = number | 'space' | 'sep' | 'string';
export const textKind = (grem: string, config: Config): Kind => {
    if (grem === '"') return 'string';
    if (config.sep.includes(grem)) return 'sep';
    if (config.space.includes(grem)) return 'space';
    return charClass(grem, config);
};
export const charClass = (grem: string, config: Config): number => {
    for (let i = 0; i < config.punct.length; i++) {
        if (config.punct[i].includes(grem)) {
            return i + 1;
        }
    }
    return 0;
};

export const handleTextKey = (config: Config, top: Top, path: Path, cursor: ListCursor | TextCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'text') throw new Error('not text');
    if (cursor.type === 'list') {
        return handleListKey(config, top, path, cursor, grem);
    }
};

export const handleListKey = (config: Config, top: Top, path: Path, cursor: CollectionCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    const kind = textKind(grem, config);
    if (cursor.type !== 'list') throw new Error('controls not handled yet');

    if (cursor.where === 'inside') {
        if (current.type === 'text') {
            if (kind === 'string') {
                return justSel(path, { type: 'list', where: 'after' });
            }
            return {
                nodes: {
                    [current.loc]: {
                        ...current,
                        spans: [
                            {
                                type: 'text',
                                text: grem,
                            },
                        ],
                    },
                },
                selection: {
                    start: selStart(path, {
                        type: 'text',
                        end: {
                            index: 0,
                            cursor: 1,
                        },
                    }),
                },
            };
        }
        if (current.type !== 'list') throw new Error('not list');
        switch (kind) {
            case 'string': {
                let nextLoc = top.nextLoc;
                const loc = nextLoc++;
                return {
                    nodes: {
                        [loc]: { type: 'text', spans: [], loc },
                        [current.loc]: { ...current, children: [loc] },
                    },
                    nextLoc,
                    selection: { start: selStart(pathWithChildren(path, loc), { type: 'list', where: 'inside' }) },
                };
            }
            case 'space':
            case 'sep': {
                let nextLoc = top.nextLoc;
                const left = nextLoc++;
                const right = nextLoc++;
                const nodes: Nodes = {};
                let children = [left, right];
                let selPath = pathWithChildren(path, right);
                if (kind === 'space') {
                    const wrap = nextLoc++;
                    nodes[wrap] = { type: 'list', kind: 'spaced', children, loc: wrap };
                    children = [wrap];
                    selPath = pathWithChildren(path, wrap, right);
                }
                return {
                    nodes: {
                        ...nodes,
                        [left]: { type: 'id', loc: left, text: '' },
                        [right]: { type: 'id', loc: right, text: '' },
                        [current.loc]: { ...current, children },
                    },
                    nextLoc,
                    selection: { start: selStart(selPath, { type: 'id', end: 0 }) },
                };
            }
            default: {
                let nextLoc = top.nextLoc;
                const loc = nextLoc++;
                return {
                    nodes: {
                        [loc]: { type: 'id', loc, text: grem, ccls: kind },
                        [current.loc]: { ...current, children: [loc] },
                    },
                    nextLoc,
                    selection: { start: selStart(pathWithChildren(path, loc), { type: 'id', end: 1 }) },
                };
            }
        }
    }

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);
    const flat = parent ? flatten(parent.node, top) : [current];
    const at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);

    const nodes: Update['nodes'] = {};
    const neighbor: Flat =
        kind === 'sep'
            ? { type: 'sep', loc: -1 }
            : kind === 'space'
            ? { type: 'space', loc: -1 }
            : kind === 'string'
            ? { type: 'text', spans: [], loc: -1 }
            : { type: 'id', text: grem, loc: -1, ccls: kind };

    let sel: Node = current;
    let ncursor: Cursor = cursor;

    switch (cursor.where) {
        case 'before':
        case 'start':
            ({ sel, ncursor } = addNeighborBefore(at, flat, neighbor, sel, ncursor));
            break;
        case 'after':
        case 'end':
            ({ sel, ncursor } = addNeighborAfter(at, flat, neighbor, sel, ncursor));
            break;
    }

    return flatToUpdate(flat, top, nodes, parent ? { type: 'existing', ...parent } : { type: 'new', kind, current }, sel, ncursor, path);

    // switch (kind) {
    //     case 'space':
    //         if (cursor.type === 'list') {
    //             return splitSpacedList(top, path, cursor);
    //         }
    //     case 'sep':
    //         throw new Error('yet not');
    //     default:
    //         if (cursor.type === 'list') {
    //             return splitSmooshList(top, path, cursor, grem, kind === 'tight');
    //         }
    // }
    // throw new Error('noa');
};

// grem is a single grapheme.
// export const insertId = (config: Config, top: Top, path: Path, cursor: IdCursor, grem: string): Update => {
//     const current = top.nodes[lastChild(path)];
//     if (current.type !== 'id') throw new Error('not id');
//     const kind = textKind(grem, config);
//     switch (kind) {
//         case 'space':
//             return splitSpacedId(top, path, cursor);
//         case 'sep':
//             throw new Error('not yurt');
//         default:
//             // Set the punctliness
//             if (current.punct == null) {
//                 return {
//                     nodes: { [current.loc]: { ...current, punct: kind === 'tight', text: grem } },
//                     selection: { start: selStart(path, { type: 'id', end: 1 }) },
//                 };
//             }
//             if (current.punct === (kind === 'tight')) {
//                 // Just update the selection
//                 const chars = cursor.text?.slice() ?? splitGraphemes(current.text);
//                 const { left, right } = cursorSides(cursor);
//                 chars.splice(left, right - left, grem);
//                 return { nodes: {}, selection: { start: selStart(path, { ...cursor, text: chars, end: left + 1 }) } };
//             }
//             // Split (punct is diff)
//             return splitSmooshId(top, path, cursor, grem, kind === 'tight');
//     }
// };
