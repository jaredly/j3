import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node, Nodes, Text } from '../shared/cnodes';
import { addNeighborAfter, addNeighborBefore, findParent, Flat, listKindForKeyKind } from './flatenate';
import { justSel } from './handleNav';
import { flatten, flatToUpdateNew } from './rough';
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

export const textCursorSides = (cursor: TextCursor) => {
    const left = cursor.start ? Math.min(cursor.start.cursor, cursor.end.cursor) : cursor.end.cursor;
    const right = cursor.start ? Math.max(cursor.start.cursor, cursor.end.cursor) : cursor.end.cursor;
    return { left, right };
};

export const handleTextText = (cursor: TextCursor, current: Text<number>, grem: string, path: Path) => {
    if (cursor.start && cursor.start.index !== cursor.end.index) {
        throw new Error('not multi yet sry');
    }
    const span = current.spans[cursor.end.index];
    if (span.type !== 'text') {
        // TODO controls, and such. like other than nav,
        // what would we even do
        console.warn('not handling non-text spans at');
        return;
    }

    // Sooo now we come to a choice.
    // How to do embeds?
    /*
    - ${} is tried and true
    - \ + dropdown would be ... more flexible? idk
    - some ... ctrl+ key combo? I don't like that quite as much
    - \() is swift, right? it has the benefit of 'not having a normal meaning',
      so you don't have to do extra to ~escape it.
      lol roc uses $() hwyy
      python uses f"hi {a}"
      hrm now a downside is that \((a b)) looks silly.
      does it look /more/ silly than ${(a b)}?
      eh maybe not.

    So, but here's a question: do I even ~need () brackets?
    like, it will be visually distinct.
    The only think brackets would do is make it clear how
    to type it. which to be fair is a pretty important thing.

    Honestly I think it should be an editor config thing to
    show/hide.

    And in "display" mode probably hide.

    OK so with that sorted, maybe we just go with ${}. it's fine.
    */

    const text = cursor.end.text ?? splitGraphemes(span.text);
    const { left, right } = textCursorSides(cursor);
    const ntext = text.slice(0, left).concat([grem]).concat(text.slice(right));

    return justSel(path, {
        type: 'text',
        end: {
            index: cursor.end.index,
            cursor: left + 1,
            text: ntext,
        },
    });
};

export const handleTextKey = (config: Config, top: Top, path: Path, cursor: ListCursor | TextCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'text') throw new Error('not text');
    if (cursor.type === 'list') {
        return handleListKey(config, top, path, cursor, grem);
    }

    return handleTextText(cursor, current, grem, path);
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
    let at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);
    // for (; at < flat.length - 1 && flat[at + 1].type === 'smoosh'; at++); // skip smooshes

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

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? current, path: parent?.path ?? path },
        nodes,
        top,
    );
};
