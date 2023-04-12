import { idText, pathPos, splitGraphemes } from '../../src/parse/parse';
import { Ctx, NodeStyle } from '../../src/to-ast/Ctx';
import { Type } from '../../src/types/ast';
import { Map, MNode } from '../../src/types/mcst';
import { UpdateMap } from '../store';
import { ClipboardItem } from './clipboard';
import { closeListLike } from './closeListLike';
import { handleBackspace } from './handleBackspace';
import { handleStringText } from './handleStringText';
import { modChildren } from './modChildren';
import { goLeft, goRight, selectStart } from './navigate';
import { newNodeBefore, newNodeAfter } from './newNodeBefore';
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
    newTapply,
} from './newNodes';
import { Path } from './path';
import { replacePathWith } from './replacePathWith';

export const wrappable: Path['type'][] = ['spread-contents', 'expr', 'child'];

export type StateUpdate = {
    type: 'update';
    map: UpdateMap;
    selection: Path[];
    selectionEnd?: Path[];
    autoComplete?: boolean;
};

export type StateSelect = {
    type: 'select';
    selection: Path[];
    selectionEnd?: Path[];
    autoComplete?: boolean;
};

export type StateChange =
    | StateUpdate
    | StateSelect
    | void
    | {
          type: 'menu';
          menu: State['menu'];
          autoComplete?: boolean;
      };

/*
So, keys:
Things that might be focused:
- an IdLike, RecordText, Attachment, RichText, or StringText
- a Blinker

Now, RichText just ignores most key presses. It'll call `onBackspace` (handleBackspace?)
and `onLeft` and `onRight`, but no keypress stuff.




- there are things that are important to know, if it's "at the start or end" of the selection

*/

export type MenuAction = {
    type: 'hash';
    hash: string;
};

export type MenuLabel =
    | {
          type: 'label';
          text: string;
      }
    | {
          type: 'typed';
          text: string;
          typ: Type;
      };

export type Menu = {
    selection: number;
    items: Array<{
        label: MenuLabel;
        action: MenuAction;
    }>;
    location: number;
};

export type State = {
    nidx: () => number;
    map: Map;
    root: number;
    at: { start: Path[]; end?: Path[] }[];
    menu?: { selection: number; dismissed?: boolean };
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

export const isRootPath = (path: Path[]) => {
    return path.length === 1 && path[0].type !== 'child';
};

export const applyUpdate = (
    state: State,
    i: number,
    update: StateChange,
): State => {
    if (!update) return state;
    if (update.type === 'select' && isRootPath(update.selection)) {
        return state;
    }
    if (update.type === 'update' && isRootPath(update.selection)) {
        return state;
    }
    const at = state.at.slice();
    if (update.type === 'select') {
        at[i] = {
            start: update.selection,
            end: update.selectionEnd,
        };
        return { ...state, at };
    } else if (update.type === 'update') {
        at[i] = {
            start: update.selection,
            end: update.selectionEnd,
        };
        return {
            ...state,
            at,
            map: applyUpdateMap(state.map, update.map),
        };
    } else if (update.type === 'menu') {
        return { ...state, menu: update.menu };
    }
    let _: never = update;
    throw new Error(`unexpected update`);
};

// export const applyUpdate = (state: State, update: KeyUpdate): State | void => {
//     if (update?.type === 'update' && update?.update) {
//         const map = applyUpdateMap(state.map, update.update.map);
//         return {
//             ...state,
//             map: map,
//             at: [{ start: update.update.selection }],
//         };
//     } else if (update?.type === 'select') {
//         return {
//             ...state,
//             at: [{ start: update.selection }],
//         };
//     }
// };

const isPathAtStart = (text: string, path: Path) => {
    return (
        text.length === 0 ||
        // !(path.type === 'end' && text.length > 0) &&
        // !(typeof loc === 'number' && loc > 0)
        path.type === 'start' ||
        (path.type === 'subtext' && path.at <= 0)
    );
};

export type Mods = {
    shift?: boolean;
    meta?: boolean;
    alt?: boolean;
};

export const getKeyUpdate = (
    key: string,
    map: Map,
    selection: { start: Path[]; end?: Path[] },
    hashNames: { [idx: number]: string },
    nidx: () => number,
    mods?: Mods,
): StateChange => {
    if (!selection.start.length) {
        throw new Error(`no path ${key} ${JSON.stringify(map)}`);
    }
    const fullPath = selection.end ?? selection.start;
    const flast = fullPath[fullPath.length - 1];
    const node = map[flast.idx];
    if (!node) {
        throw new Error(
            `No node ${flast.idx} : ${JSON.stringify(Object.keys(map))}`,
        );
    }

    if (
        key === 'Meta' ||
        key === 'Shift' ||
        key === 'Alt' ||
        key === 'Control'
    ) {
        return;
    }

    if (key === 'Backspace') {
        return handleBackspace(map, selection, hashNames);
    }

    const textRaw = hashNames[node.loc.idx] ?? idText(node) ?? '';
    const text = splitGraphemes(textRaw);
    const idx = flast.idx;

    if (key === 'ArrowLeft') {
        let flast = fullPath[fullPath.length - 1];
        if ('text' in node || node.type === 'hash') {
            const text = hashNames[node.loc.idx] ?? idText(node) ?? '';
            if (!isPathAtStart(text, flast)) {
                const pos = pathPos(fullPath, text);
                const next = fullPath.slice(0, -1).concat([
                    {
                        idx,
                        type: 'subtext',
                        at: pos - 1,
                    },
                ]);
                if (mods?.shift) {
                    return {
                        type: 'select',
                        selection: selection.start,
                        selectionEnd: next,
                    };
                }
                return {
                    type: 'select',
                    selection: next,
                };
            }
        }
        const lll = goLeft(fullPath, map);
        if (lll && mods?.shift) {
            return {
                type: 'select',
                selection: selection.start,
                selectionEnd: lll.selection,
            };
        }
        return lll;
    }

    const pos = pathPos(fullPath, textRaw);

    if (key === 'ArrowRight') {
        if (pos < text.length) {
            const next = fullPath
                .slice(0, -1)
                .concat([{ idx, type: 'subtext', at: pos + 1 }]);
            if (mods?.shift) {
                return {
                    type: 'select',
                    selection: selection.start,
                    selectionEnd: next,
                };
            }
            return {
                type: 'select',
                selection: next,
            };
        }
        const rrr = goRight(fullPath, idx, map);
        if (rrr && mods?.shift) {
            return {
                type: 'select',
                selection: selection.start,
                selectionEnd: rrr.selection,
            };
        }
        return rrr;
    }

    if (key === 'Tab') {
        return mods?.shift
            ? goLeft(fullPath, map)
            : goRight(fullPath, idx, map);
        // if (rrr && mods?.shift) {
        //     return {
        //         type: 'select',
        //         selection: selection.start,
        //         selectionEnd: rrr.selection,
        //     };
        // }
        // return rrr;
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
        if (ppath.type === 'child' && 'values' in parent) {
            // const parent = map[last.idx] as ListLikeContents;
            if (
                parent.values.length > ppath.at + 1 &&
                map[parent.values[ppath.at + 1]].type === 'blank'
            ) {
                return {
                    type: 'select',
                    selection: fullPath.slice(0, -2).concat([
                        {
                            idx: ppath.idx,
                            type: 'child',
                            at: ppath.at + 1,
                        },
                        {
                            idx: parent.values[ppath.at + 1],
                            type: 'start',
                        },
                    ]),
                };
            }
        }
        if (
            node.type !== 'blank' &&
            node.type !== 'accessText' &&
            (flast.type === 'start' ||
                (flast.type === 'subtext' && flast.at === 0))
        ) {
            return newNodeBefore(fullPath.slice(0, -1), map, {
                ...newBlank(nidx()),
                selection: fullPath.slice(-1),
            });
        }
        return newNodeAfter(fullPath, map, newBlank(nidx()), nidx);
    }

    if (key === '<' && (node.type === 'identifier' || node.type === 'hash')) {
        // return replacePathWith
        const nat = newTapply(idx, '', nidx(), nidx());
        return replacePathWith(fullPath.slice(0, -1), map, nat);
    }
    if (key === '>' && node.type !== 'blank') {
        for (let i = fullPath.length - 1; i >= 0; i--) {
            const parent = fullPath[i];
            if (parent.type === 'end') {
                continue;
            }
            const node = map[parent.idx];
            if (node.type === 'tapply') {
                const sel = fullPath
                    .slice(0, i)
                    .concat({ idx: parent.idx, type: 'end' });
                return { type: 'select', selection: sel, autoComplete: true };
            }
        }
    }

    if (')]}'.includes(key)) {
        const selection = closeListLike(key, fullPath, map);
        return selection
            ? { type: 'select', selection, autoComplete: true }
            : undefined;
    }

    if (key === ':') {
        // no nesting tannots
        if (fullPath.some((s) => s.type === 'annot-annot')) {
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
        if (flast.type === 'inside') {
            const blank = newBlank(nidx());
            const nat = mergeNew(
                blank,
                newRecordAccess(blank.idx, '', nidx(), nidx()),
            );
            return addToListLike(map, flast.idx, fullPath, nat);
        }

        if (
            (node.type === 'identifier' && !textRaw.match(/^-?[0-9]+$/)) ||
            node.type === 'hash'
        ) {
            const nat = newRecordAccess(
                idx,
                text.slice(pos).join(''),
                nidx(),
                nidx(),
            );
            if (pos === 0) {
                nat.map[idx] = { type: 'blank', loc: map[idx].loc };
            } else if (pos < text.length) {
                nat.map[idx] = {
                    type: 'identifier',
                    text: text.slice(0, pos).join(''),
                    loc: node.loc,
                };
            }
            const up = replacePathWith(fullPath.slice(0, -1), map, nat);
            return up ? { ...up, autoComplete: true } : up;
        }
        if (node.type === 'accessText' && ppath.type === 'attribute') {
            if (parent.type !== 'recordAccess') {
                throw new Error(
                    `accessText parent not a recordAccess ${parent.type}`,
                );
            }

            if (map[parent.target].type === 'blank' && textRaw === '') {
                // turn into a spread!
                const nat = newSpread(
                    parent.target,
                    [{ idx: parent.target, type: 'start' }],
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
            items.splice(ppath.at + 1, 0, nat.idx);
            nat.map[ppath.idx] = { ...parent, items };
            return {
                type: 'update',
                ...nat,
                selection: fullPath
                    .slice(0, -2)
                    .concat({
                        idx: ppath.idx,

                        type: 'attribute',
                        at: ppath.at + 1,
                    })
                    .concat(nat.selection),
            };
        }
        if (node.type !== 'identifier') {
            const at = newBlank(nidx());
            const one = newRecordAccess(at.idx, '', nidx(), nidx());
            return newNodeAfter(fullPath, map, mergeNew(at, one), nidx);
        }
    }

    return insertText(key, map, fullPath, hashNames, nidx);
};

export const insertText = (
    inputRaw: string,
    map: Map,
    fullPath: Path[],
    hashNames: { [idx: number]: string },
    nidx: () => number,
) => {
    const flast = fullPath[fullPath.length - 1];
    const node = map[flast.idx];
    const idx = flast.idx;
    // Ok, so now we're updating things
    const input = splitGraphemes(inputRaw);
    const textRaw = hashNames[node.loc.idx] ?? idText(node) ?? '';
    const pos = pathPos(fullPath, textRaw);

    if (
        node.type === 'identifier' ||
        node.type === 'accessText' ||
        node.type === 'stringText' ||
        node.type === 'hash'
    ) {
        return updateText(
            node,
            pos,
            input,
            idx,
            fullPath.slice(0, -1),
            hashNames[idx],
        );
    }

    if (flast.type === 'inside') {
        return addToListLike(map, idx, fullPath, newId(input, nidx()));
    }

    if (node.type === 'blank') {
        return replaceWith(fullPath.slice(0, -1), newId(input, idx));
    }

    if (flast.type === 'start') {
        return newNodeBefore(fullPath, map, newId(input, nidx()));
    }

    return newNodeAfter(fullPath, map, newId(input, nidx()), nidx);
};

function addToListLike(
    map: Map,
    pidx: number,
    path: Path[],
    newThing: NewThing,
): StateUpdate {
    const pnode = map[pidx];
    newThing.map[pidx] = {
        ...pnode,
        ...modChildren(pnode, (items) => items.unshift(newThing.idx)),
    };
    return {
        type: 'update',
        ...newThing,
        selection: path
            .slice(0, -1)
            .concat({
                idx: pidx,
                type: 'child',
                at: 0,
            })
            .concat(newThing.selection),
    };
}

function updateText(
    node: Extract<MNode, { text: string }> | Extract<MNode, { type: 'hash' }>,
    pos: number,
    input: string[],
    idx: number,
    path: Path[],
    hashName?: string,
): StateUpdate {
    const raw = hashName ?? idText(node) ?? '';
    let text = splitGraphemes(raw);
    if (pos === 0) {
        text.unshift(...input);
    } else if (pos === text.length) {
        text.push(...input);
    } else {
        text.splice(pos, 0, ...input);
    }
    return {
        type: 'update',
        map: {
            [idx]:
                node.type !== 'hash'
                    ? { ...node, text: text.join('') }
                    : {
                          type: 'identifier',
                          loc: node.loc,
                          text: text.join(''),
                      },
        },
        selection: path.concat([
            {
                idx,
                type: 'subtext',
                at: pos + input.length,
            },
        ]),
    };
}

function goToTannot(
    path: Path[],
    node: MNode,
    idx: number,
    map: Map,
    nidx: () => number,
): StateChange {
    if (path.length > 1 && path[path.length - 2].type === 'annot-target') {
        const node = map[path[path.length - 2].idx];
        if (node.type === 'annot') {
            const sel = selectStart(
                node.annot,
                path.slice(0, -2).concat({
                    idx: path[path.length - 2].idx,
                    type: 'annot-annot',
                }),
                map,
            );
            if (sel) {
                return { type: 'select', selection: sel };
            }
        }
    }
    return replacePathWith(
        path.slice(0, -1),
        map,
        newAnnot(idx, nidx(), newBlank(nidx())),
    );
}

export function openListLike({
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
}): StateUpdate | void {
    const type = ({ '(': 'list', '[': 'array', '{': 'record' } as const)[key]!;

    // Just replace it!
    if (node.type === 'blank') {
        return replaceWith(fullPath.slice(0, -1), newListLike(type, idx));
    }

    const flast = fullPath[fullPath.length - 1];

    // Gotta wrap it!
    if (
        flast.type === 'start' ||
        (flast.type === 'subtext' && flast.at === 0)
    ) {
        let ppath = fullPath[fullPath.length - 2];
        let subPath = fullPath;
        let nw: NewThing = {
            idx,
            map: {},
            selection: [flast],
        };
        if (ppath.type === 'record-target') {
            nw.selection = fullPath.slice(-2);
            subPath = fullPath.slice(0, -1);
            nw.idx = ppath.idx;
            //     idx: ppath.idx
            // }
            ppath = subPath[subPath.length - 2];
        }

        if (wrappable.includes(subPath[subPath.length - 2].type)) {
            // for (let i = subPath.length - 1; i--; i >= 2) {
            //     console.log('howww', i, subPath[i - 1], subPath);
            //     if (wrappable.includes(subPath[i - 1].type)) {
            //         return replacePathWith(
            //             subPath.slice(0, i),
            // }
            return replacePathWith(
                subPath.slice(0, -1),
                map,
                newListLike(type, nidx(), nw),
            );
        }
    }

    return newNodeAfter(fullPath, map, newListLike(type, nidx()), nidx);
}

export function replaceWith(path: Path[], newThing: NewThing): StateUpdate {
    return {
        type: 'update',
        ...newThing,
        selection: path.concat(newThing.selection),
    };
}

export type NewThing = {
    map: UpdateMap;
    idx: number;
    selection: Path[];
};

export const maybeClearParentList = (
    path: Path[],
    map: Map,
): StateUpdate | void => {
    if (path.length === 1) {
        return;
    }
    const gp = path[path.length - 1];
    if (gp && gp.type === 'child' && gp.at === 0) {
        const gpnode = map[gp.idx];
        if ('values' in gpnode && gpnode.values.length === 1) {
            return {
                type: 'update',
                map: { [gp.idx]: { ...gpnode, values: [] } },
                selection: path
                    .slice(0, -1)
                    .concat({ idx: gp.idx, type: 'inside' }),
            };
        }
    }
};
