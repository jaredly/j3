import { idText, pathPos, splitGraphemes } from '../../src/parse/parse';
import { Map, MNode } from '../../src/types/mcst';
import { replacePath } from '../old/RecordText';
import { Path, PathChild, UpdateMap } from '../store';
import { closeListLike } from './closeListLike';
import { handleBackspace } from './handleBackspace';
import { handleStringText } from './handleStringText';
import { modChildren } from './modChildren';
import { goLeft, goRight, selectStart } from './navigate';
import {
    mergeNew,
    newAccessText,
    newAnnot,
    newBlank,
    newId,
    newListLike,
    newRecordAccess,
    newSpread,
    newString,
} from './newNodes';

export const wrappable = ['spread-contents', 'expr', 'child'];

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
    nidx: () => number;
    map: Map;
    root: number;
    at: { start: Path[]; end?: Path[] }[];
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
            at: [{ start: update.update.selection }],
        };
    } else if (update?.type === 'select') {
        return {
            ...state,
            at: [{ start: update.selection }],
        };
    }
};

const isPathAtStart = (text: string, path: PathChild) => {
    return (
        // !(path.type === 'end' && text.length > 0) &&
        // !(typeof loc === 'number' && loc > 0)
        path.type === 'start' || (path.type === 'subtext' && path.at === 0)
    );
};

export const getKeyUpdate = (
    key: string,
    map: Map,
    fullPath: Path[],
    nidx: () => number,
): KeyUpdate => {
    if (!fullPath.length) {
        throw new Error(`no path ${key} ${JSON.stringify(map)}`);
    }
    const flast = fullPath[fullPath.length - 1];
    const node = map[flast.idx];
    if (!node) {
        throw new Error(
            `No node ${flast.idx} : ${JSON.stringify(Object.keys(map))}`,
        );
    }

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
        return handleBackspace(map, fullPath);
    }

    const idx = flast.idx;

    if (key === 'ArrowLeft') {
        if ('text' in node && !isPathAtStart(node.text, flast.child)) {
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
        return goLeft(fullPath, map);
    }

    const pos = pathPos(fullPath, textRaw);

    if (key === 'ArrowRight') {
        if (pos < text.length) {
            return {
                type: 'select',
                selection: fullPath
                    .slice(0, -1)
                    .concat([{ idx, child: { type: 'subtext', at: pos + 1 } }]),
            };
        }
        return goRight(fullPath, idx, map);
    }

    if (node.type === 'stringText') {
        return handleStringText({
            key,
            idx,
            node,
            pos,
            path: fullPath.slice(0, -1),
            map,
            nidx,
        });
    }

    // Start a list-like!
    if ('([{'.includes(key)) {
        return openListLike({ key, idx, node, fullPath, map, nidx });
    }

    const ppath = fullPath[fullPath.length - 2];
    const parent = map[ppath.idx];

    if (key === ' ' || key === 'Enter') {
        if (ppath.child.type === 'child' && 'values' in parent) {
            // const parent = map[last.idx] as ListLikeContents;
            if (
                parent.values.length > ppath.child.at + 1 &&
                map[parent.values[ppath.child.at + 1]].type === 'blank'
            ) {
                return {
                    type: 'select',
                    selection: fullPath.slice(0, -2).concat([
                        {
                            idx: ppath.idx,
                            child: { type: 'child', at: ppath.child.at + 1 },
                        },
                        {
                            idx: parent.values[ppath.child.at + 1],
                            child: { type: 'start' },
                        },
                    ]),
                };
            }
        }
        if (
            flast.child.type === 'start' ||
            (flast.child.type === 'subtext' && flast.child.at === 0)
        ) {
            return newNodeBefore(fullPath.slice(0, -1), map, {
                ...newBlank(nidx()),
                selection: fullPath.slice(-1),
            });
        }
        return newNodeAfter(fullPath, map, newBlank(nidx()), nidx);
    }

    if (')]}'.includes(key)) {
        const selection = closeListLike(key, fullPath, map);
        return selection ? { type: 'select', selection } : undefined;
    }

    if (key === ':') {
        // no nesting tannots
        if (fullPath.some((s) => s.child.type === 'annot-annot')) {
            return;
        }
        return goToTannot(fullPath, node, idx, map, nidx);
    }

    if (key === '"') {
        // are we at the start of a blank or id or something?
        if (node.type === 'blank') {
            return replaceWith(fullPath.slice(0, -1), newString(idx, nidx()));
        }
        return newNodeAfter(fullPath, map, newString(nidx(), nidx()), nidx);
    }

    if (key === '.') {
        if (node.type === 'blank') {
            const nat = newRecordAccess(idx, '', nidx(), nidx());
            return replacePathWith(fullPath.slice(0, -1), map, nat);
        }
        if (flast.child.type === 'inside') {
            const blank = newBlank(nidx());
            const nat = mergeNew(
                blank,
                newRecordAccess(blank.idx, '', nidx(), nidx()),
            );
            return addToListLike(map, flast.idx, fullPath, nat);
        }

        if (node.type === 'identifier' && !textRaw.match(/^-?[0-9]+$/)) {
            const nat = newRecordAccess(
                idx,
                text.slice(pos).join(''),
                nidx(),
                nidx(),
            );
            if (pos === 0) {
                nat.map[idx] = { type: 'blank', loc: map[idx].loc };
            } else if (pos < text.length) {
                nat.map[idx] = { ...node, text: text.slice(0, pos).join('') };
            }
            return replacePathWith(fullPath.slice(0, -1), map, nat);
        }
        if (node.type === 'accessText' && ppath.child.type === 'attribute') {
            if (parent.type !== 'recordAccess') {
                throw new Error(
                    `accessText parent not a recordAccess ${parent.type}`,
                );
            }

            if (map[parent.target].type === 'blank' && textRaw === '') {
                // turn into a spread!
                const nat = newSpread(
                    parent.target,
                    [{ idx: parent.target, child: { type: 'start' } }],
                    nidx(),
                );
                // Delete the recordAccess
                nat.map[ppath.idx] = null;
                // Delete the accessText
                nat.map[idx] = null;
                return replacePathWith(fullPath.slice(0, -2), map, nat);
            }

            const nat = newAccessText(text.slice(pos), nidx());
            if (pos < text.length) {
                nat.map[idx] = { ...node, text: text.slice(0, pos).join('') };
            }
            const items = parent.items.slice();
            items.splice(ppath.child.at + 1, 0, nat.idx);
            nat.map[ppath.idx] = { ...parent, items };
            return {
                type: 'update',
                update: {
                    ...nat,
                    selection: fullPath
                        .slice(0, -2)
                        .concat({
                            idx: ppath.idx,
                            child: {
                                type: 'attribute',
                                at: ppath.child.at + 1,
                            },
                        })
                        .concat(nat.selection),
                },
            };
        }
        if (node.type !== 'identifier') {
            const at = newBlank(nidx());
            const one = newRecordAccess(at.idx, '', nidx(), nidx());
            return newNodeAfter(fullPath, map, mergeNew(at, one), nidx);
        }
    }

    // Ok, so now we're updating things
    const input = splitGraphemes(key);

    if (node.type === 'identifier' || node.type === 'accessText') {
        return updateText(node, pos, input, idx, fullPath.slice(0, -1));
    }

    if (flast.child.type === 'inside') {
        return addToListLike(map, idx, fullPath, newId(input, nidx()));
    }

    if (node.type === 'blank') {
        return replaceWith(fullPath.slice(0, -1), newId(input, idx));
    }

    if (flast.child.type === 'start') {
        return newNodeBefore(fullPath, map, newId(input, nidx()));
    }

    return newNodeAfter(fullPath, map, newId(input, nidx()), nidx);
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
    nidx: () => number,
): KeyUpdate {
    if (
        path.length > 1 &&
        path[path.length - 2].child.type === 'annot-target'
    ) {
        const node = map[path[path.length - 2].idx];
        if (node.type === 'annot') {
            const sel = selectStart(
                node.annot,
                path.slice(0, -2).concat({
                    idx: path[path.length - 2].idx,
                    child: { type: 'annot-annot' },
                }),
                map,
            );
            if (sel) {
                return { type: 'select', selection: sel };
            }
        }
    }
    // if (node.tannot != null) {
    //     const sel = selectStart(
    //         node.tannot,
    //         path.concat({ idx, child: { type: 'tannot' } }),
    //         map,
    //     );
    //     if (sel) {
    //         return { type: 'select', selection: sel };
    //     }
    // }
    // const blank = newBlank();
    // blank.map[idx] = { ...node, tannot: blank.idx };
    // return {
    //     type: 'update',
    //     update: {
    //         ...blank,
    //         selection: path
    //             .concat({ idx, child: { type: 'tannot' } })
    //             .concat(blank.selection),
    //     },
    // };
    return replacePathWith(
        path.slice(0, -1),
        map,
        newAnnot(idx, nidx(), newBlank(nidx())),
    );
}

function openListLike({
    key,
    idx,
    node,
    fullPath,
    map,
    nidx,
}: {
    key: string;
    idx: number;
    node: MNode;
    fullPath: Path[];
    map: Map;
    nidx: () => number;
}): KeyUpdate {
    const type = ({ '(': 'list', '[': 'array', '{': 'record' } as const)[key]!;

    // Just replace it!
    if (node.type === 'blank') {
        return replaceWith(fullPath.slice(0, -1), newListLike(type, idx));
    }

    const flast = fullPath[fullPath.length - 1];

    // Gotta wrap it!
    if (
        flast.child.type === 'start' ||
        (flast.child.type === 'subtext' && flast.child.at === 0)
    ) {
        if (wrappable.includes(fullPath[fullPath.length - 2].child.type)) {
            return replacePathWith(
                fullPath.slice(0, -1),
                map,
                newListLike(type, nidx(), {
                    idx,
                    map: {},
                    selection: [flast],
                }),
            );
        }
    }

    return newNodeAfter(fullPath, map, newListLike(type, nidx()), nidx);
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
    nidx: () => number,
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
                ? newBlank(nidx())
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
