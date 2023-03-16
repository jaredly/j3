import {
    EvalCtx,
    Path,
    PathChild,
    Selection,
    Store,
    UpdateMap,
} from '../store';
import { Events } from '../old/Nodes';
import { ListLikeContents, Map, MNode, MNodeExtra } from '../../src/types/mcst';
import { closeListLike } from './closeListLike';
import { replacePath } from '../old/RecordText';
import { modChildren } from './modChildren';
import { Identifier } from '../../src/types/cst';
import { ONodeOld } from '../overheat/types';
import {
    newBlank,
    newString,
    newId,
    newListLike,
    newAccessText,
    newRecordAccess,
    newSpread,
    mergeNew,
} from './newNodes';
import {
    combinePathSel,
    goLeft,
    goRight,
    maybeCombinePathSel,
    maybeToPathSel,
    PathSel,
    selectStart,
    toPathSel,
} from './navigate';
import { handleStringText } from './handleStringText';
import { handleBackspace } from './handleBackspace';
import { idText, pathPos, selPos, splitGraphemes } from '../../src/parse/parse';

export const wrappable = ['spread-contents', 'expr', 'child'];

export type SelectAndPath = {
    selection: Selection;
    path: Path[];
};

export type TheUpdate = {
    map: UpdateMap;
    selection: Path[];
};

export type KeyUpdate =
    | {
          type: 'update';
          update: TheUpdate | void;
          auto?: boolean;
      }
    | {
          type: 'select';
          selection: Path[];
      }
    | void;

/*
So, keys:
Things that might be focused:
- an IdLike, RecordText, Attachment, RichText, or StringText
- a Blinker

Now, RichText just ignores most key presses. It'll call `onBackspace` (handleBackspace?)
and `onLeft` and `onRight`, but no keypress stuff.




- there are things that are important to know, if it's "at the start or end" of the selection

*/

export type State = {
    map: Map;
    root: number;
    at: { start: PathSel; end?: PathSel }[];
};

export const applyUpdateMap = (map: Map, updateMap: UpdateMap) => {
    map = { ...map };
    Object.keys(updateMap).forEach((key) => {
        if (updateMap[+key] == null) {
            delete map[+key];
        } else {
            map[+key] = updateMap[+key]!;
        }
    });
    return map;
};

export const applyUpdate = (state: State, update: KeyUpdate): State | void => {
    if (update?.type === 'update' && update?.update) {
        const map = applyUpdateMap(state.map, update.update.map);
        return {
            ...state,
            map: map,
            at: [{ start: toPathSel(update.update.selection, map) }],
        };
    } else if (update?.type === 'select') {
        return {
            ...state,
            at: [{ start: toPathSel(update.selection, state.map) }],
        };
    }
};

const isAtStart = (text: string, loc: Selection['loc']) => {
    return (
        !(loc === 'end' && text.length > 0) &&
        !(typeof loc === 'number' && loc > 0)
    );
};

export const getKeyUpdate = (
    key: string,
    // pos: number,
    // textRaw: string,
    // idx: number,
    // path: Path[],
    // map: Map,
    state: State,
    fullPath: Path[],
): KeyUpdate => {
    if (!fullPath.length) {
        throw new Error(`no path ${key} ${JSON.stringify(state.map)}`);
    }
    const {
        path,
        sel: { idx, loc },
    } = toPathSel(fullPath, state.map);
    const last = path[path.length - 1];
    const node = state.map[idx];

    const textRaw = idText(node) ?? '';
    const text = splitGraphemes(textRaw);

    if (
        key === 'Meta' ||
        key === 'Shift' ||
        key === 'Alt' ||
        key === 'Control'
    ) {
        return;
    }

    if (key === 'Backspace') {
        return handleBackspace(state.map, fullPath);
    }

    if (key === 'ArrowLeft') {
        if ('text' in node && !isAtStart(node.text, loc)) {
            const pos = pathPos(fullPath, node.text);
            return {
                type: 'select',
                selection: fullPath.slice(0, -1).concat([
                    {
                        idx,
                        child: { type: 'subtext', at: pos - 1 },
                    },
                ]),
            };
        }
        return goLeft(path, idx, state.map);
    }

    const pos = pathPos(fullPath, textRaw);
    const map = state.map;

    if (key === 'ArrowRight') {
        if (pos < text.length) {
            return {
                type: 'select',
                selection: path.concat([
                    { idx, child: { type: 'subtext', at: pos + 1 } },
                ]),
            };
        }
        return goRight(path, idx, map);
    }

    if (node.type === 'stringText') {
        return handleStringText({ key, idx, node, pos, path, map });
    }

    // Start a list-like!
    if ('([{'.includes(key)) {
        return openListLike({ key, idx, last, node, path, map, pos });
    }

    if (key === ' ' || key === 'Enter') {
        if (last.child.type === 'child') {
            const parent = map[last.idx] as ListLikeContents;
            if (
                parent.values.length > last.child.at + 1 &&
                map[parent.values[last.child.at + 1]].type === 'blank'
            ) {
                return {
                    type: 'select',
                    selection: path.slice(0, -1).concat([
                        {
                            idx: last.idx,
                            child: { type: 'child', at: last.child.at + 1 },
                        },
                        {
                            idx: parent.values[last.child.at + 1],
                            child: { type: 'start' },
                        },
                    ]),
                };
            }
        }
        if (pos === 0 && (text.length || last.child.type === 'start')) {
            return newNodeBefore(path, map, {
                ...newBlank(),
                selection: fullPath.slice(-1),
            });
        }
        return newNodeAfter(path, map, newBlank());
    }

    if (')]}'.includes(key)) {
        const selection = closeListLike(key, path, map);
        return selection ? { type: 'select', selection } : undefined;
    }

    if (key === ':') {
        return goToTannot(path, node, idx, map);
    }

    if (key === '"') {
        // are we at the start of a blank or id or something?
        if (node.type === 'blank') {
            return replaceWith(path, newString(idx));
        }
        return newNodeAfter(path, map, newString());
    }

    if (key === '.') {
        if (node.type === 'blank') {
            const nat = newRecordAccess(idx, '');
            return replacePathWith(path, map, nat);
        }
        if (last.child.type === 'inside') {
            const blank = newBlank();
            const nat = mergeNew(blank, newRecordAccess(blank.idx, ''));
            return addToListLike(map, last.idx, path, nat);
        }
        if (node.type === 'identifier' && !textRaw.match(/^-?[0-9]+$/)) {
            const nat = newRecordAccess(idx, text.slice(pos).join(''));
            if (pos === 0) {
                nat.map[idx] = { type: 'blank', loc: map[idx].loc };
            } else if (pos < text.length) {
                nat.map[idx] = { ...node, text: text.slice(0, pos).join('') };
            }
            return replacePathWith(path, map, nat);
        }
        if (node.type === 'accessText' && last.child.type === 'attribute') {
            const parent = map[last.idx];
            if (parent.type !== 'recordAccess') {
                throw new Error(
                    `accessText parent not a recordAccess ${parent.type}`,
                );
            }

            if (map[parent.target].type === 'blank' && textRaw === '') {
                // turn into a spread!
                const nat = newSpread(parent.target, [
                    { idx: parent.target, child: { type: 'start' } },
                ]);
                // Delete the recordAccess
                nat.map[last.idx] = null;
                // Delete the accessText
                nat.map[idx] = null;
                return replacePathWith(path.slice(0, -1), map, nat);
            }

            const nat = newAccessText(text.slice(pos));
            if (pos < text.length) {
                nat.map[idx] = { ...node, text: text.slice(0, pos).join('') };
            }
            const items = parent.items.slice();
            items.splice(last.child.at + 1, 0, nat.idx);
            nat.map[last.idx] = { ...parent, items };
            return {
                type: 'update',
                update: {
                    ...nat,
                    selection: path
                        .slice(0, -1)
                        .concat({
                            idx: last.idx,
                            child: { type: 'attribute', at: last.child.at + 1 },
                        })
                        .concat(nat.selection),
                },
            };
        }
        if (node.type !== 'identifier') {
            const at = newBlank();
            const one = newRecordAccess(at.idx, '');
            return newNodeAfter(path, map, mergeNew(at, one));
        }
    }

    // Ok, so now we're updating things
    const input = splitGraphemes(key);

    if (node.type === 'identifier' || node.type === 'accessText') {
        return updateText(node, pos, input, idx, path);
    }

    if (last.child.type === 'inside') {
        return addToListLike(map, last.idx, path, newId(input));
    }

    if (node.type === 'blank') {
        return replaceWith(path, newId(input, idx));
    }

    if (last.child.type === 'start') {
        return newNodeBefore(path, map, newId(input));
    }

    return newNodeAfter(path, map, newId(input));
};

function addToListLike(
    map: Map,
    pidx: number,
    path: Path[],
    newThing: NewThing,
): KeyUpdate {
    const pnode = map[pidx];
    newThing.map[pidx] = {
        ...pnode,
        ...modChildren(pnode, (items) => items.unshift(newThing.idx)),
    };
    return {
        type: 'update',
        update: {
            ...newThing,
            selection: path
                .slice(0, -1)
                .concat({
                    idx: pidx,
                    child: { type: 'child', at: 0 },
                })
                .concat(newThing.selection),
        },
    };
}

function updateText(
    node: Extract<MNode, { text: string }>,
    pos: number,
    input: string[],
    idx: number,
    path: Path[],
): KeyUpdate {
    let text = splitGraphemes(node.text);
    if (pos === 0) {
        text.unshift(...input);
    } else if (pos === text.length) {
        text.push(...input);
    } else {
        text.splice(pos, 0, ...input);
    }
    return {
        type: 'update',
        update: {
            map: { [idx]: { ...node, text: text.join('') } },
            selection: path.concat([
                {
                    idx,
                    child: { type: 'subtext', at: pos + input.length },
                },
            ]),
        },
    };
}

function goToTannot(
    path: Path[],
    node: MNode,
    idx: number,
    map: Map,
): KeyUpdate {
    if (node.tannot != null) {
        const sel = selectStart(
            node.tannot,
            path.concat({ idx, child: { type: 'tannot' } }),
            map,
        );
        if (sel) {
            return { type: 'select', selection: sel };
        }
    }
    const blank = newBlank();
    blank.map[idx] = { ...node, tannot: blank.idx };
    return {
        type: 'update',
        update: {
            ...blank,
            selection: path
                .concat({ idx, child: { type: 'tannot' } })
                .concat(blank.selection),
        },
    };
}

function openListLike({
    key,
    idx,
    last,
    node,
    path,
    map,
    pos,
}: {
    key: string;
    idx: number;
    last: Path;
    node: MNode;
    path: Path[];
    map: Map;
    pos: number;
}): KeyUpdate {
    const type = ({ '(': 'list', '[': 'array', '{': 'record' } as const)[key]!;

    // Just replace it!
    if (node.type === 'blank') {
        return replaceWith(path, newListLike(type, idx));
    }

    // Gotta wrap it!
    if (last.child.type === 'start') {
        if (wrappable.includes(path[path.length - 2].child.type)) {
            return replacePathWith(
                path.slice(0, -1),
                map,
                newListLike(type, void 0, {
                    idx,
                    map: {},
                    selection: [last],
                    // { sel: { idx, loc: 'start' }, path: [last] },
                }),
            );
        }
    }

    if (wrappable.includes(last.child.type) && pos === 0) {
        return replacePathWith(
            path,
            map,
            newListLike(type, void 0, {
                idx,
                map: {},
                selection: [{ idx, child: { type: 'start' } }],
            }),
        );
    }

    return newNodeAfter(path, map, newListLike(type));
}

function replaceWith(path: Path[], newThing: NewThing): KeyUpdate {
    return {
        type: 'update',
        update: {
            ...newThing,
            selection: path.concat(newThing.selection),
        },
    };
}

export function replacePathWith(
    path: Path[],
    map: Map,
    newThing: NewThing,
): KeyUpdate {
    if (!path.length) {
        return;
    }
    const update = replacePath(path[path.length - 1], newThing.idx, map);
    return {
        type: 'update',
        update: {
            ...newThing,
            map: { ...newThing.map, ...update },
            selection: path.concat(newThing.selection),
        },
    };
}

export type NewThing = {
    map: UpdateMap;
    idx: number;
    selection: Path[];
};

export const newNodeAfter = (
    path: Path[],
    map: Map,
    newThing: NewThing,
): KeyUpdate | void => {
    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];

        if (parent.child.type !== 'child' && parent.child.type !== 'inside') {
            continue;
        }
        const child = parent.child;

        const pnode = map[parent.idx];

        let firstBlank =
            child.type === 'inside' &&
            newThing.map[newThing.idx]?.type === 'blank'
                ? newBlank()
                : null;
        if (firstBlank) {
            Object.assign(newThing.map, firstBlank.map);
        }

        newThing.map[parent.idx] = {
            ...pnode,
            ...modChildren(pnode, (items) => {
                items.splice(
                    child.type === 'child' ? child.at + 1 : 0,
                    0,
                    newThing.idx,
                );
                if (firstBlank) {
                    items.unshift(firstBlank.idx);
                }
                return items;
            }),
        };
        return {
            type: 'update',
            update: {
                ...newThing,
                selection: path
                    .slice(0, i)
                    .concat({
                        idx: parent.idx,
                        child: {
                            type: 'child',
                            at:
                                child.type === 'child'
                                    ? child.at + 1
                                    : firstBlank
                                    ? 1
                                    : 0,
                        },
                    })
                    .concat(newThing.selection),
            },
        };
    }
};

export const newNodeBefore = (
    path: Path[],
    map: Map,
    newThing: NewThing,
): KeyUpdate | void => {
    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];

        if (parent.child.type !== 'child') {
            continue;
        }
        const child = parent.child;

        const pnode = map[parent.idx];

        const at = child.type === 'child' ? child.at : 0;

        newThing.map[parent.idx] = {
            ...pnode,
            ...modChildren(pnode, (items) => {
                items.splice(at, 0, newThing.idx);
                return items;
            }),
        };
        return {
            type: 'update',
            update: {
                ...newThing,
                selection: path
                    .slice(0, i)
                    .concat({
                        idx: parent.idx,
                        child: {
                            type: 'child',
                            at: at + 1,
                        },
                    })
                    .concat(newThing.selection),
            },
        };
    }
};

export const maybeClearParentList = (path: Path[], map: Map): KeyUpdate => {
    if (path.length === 1) {
        return;
    }
    const gp = path[path.length - 1];
    if (gp && gp.child.type === 'child' && gp.child.at === 0) {
        const gpnode = map[gp.idx];
        if ('values' in gpnode && gpnode.values.length === 1) {
            return {
                type: 'update',
                update: {
                    map: { [gp.idx]: { ...gpnode, values: [] } },
                    selection: path
                        .slice(0, -1)
                        .concat({ idx: gp.idx, child: { type: 'inside' } }),
                },
            };
        }
    }
};
