import equal from 'fast-deep-equal';
import {
    Card,
    MetaDataUpdateMap,
    RegMap,
    SandboxNamespace,
    NsMap,
} from '../../web/custom/UIState';
import { plugins } from '../../web/custom/plugins';
import { idText } from '../parse/idText';
import { pathPos } from '../parse/parse';
import { splitGraphemes } from '../parse/splitGraphemes';
import { Type } from '../types/ast';
import { MNode, Map } from '../types/mcst';
import { closeListLike } from './closeListLike';
import { goLeft, goLeftUntil } from './goLeftUntil';
import { goRight, goRightUntil } from './goRightUntil';
import { handleBackspace } from './handleBackspace';
import { handleStringText } from './handleStringText';
import { modChildren } from './modChildren';
import { selectStart } from './navigate';
import { newNodeAfter, newNodeBefore } from './newNodeBefore';
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
import { UpdateMap } from '../types/mcst';

export const wrappable: Path['type'][] = [
    'spread-contents',
    'expr',
    'child',
    'ns-top',
];

export type StateUpdate = {
    type: 'update';
    map: UpdateMap;
    selection: Path[];
    selectionEnd?: Path[];
    at?: Cursor[]; // overrides selection & selectionEnd
    autoComplete?: boolean;
    nsMap?: { [key: string]: SandboxNamespace | null };
};

export type NewCard = {
    type: 'new-card';
    current: number;
    after: boolean;
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
    | { type: 'config:evaluator'; id: string | string[] | null }
    | { type: 'meta'; meta: MetaDataUpdateMap }
    | { type: 'full-select'; at: State['at']; autoComplete?: boolean }
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

export const pathCard = (path: Path[]) => {
    if (path[0].type !== 'card') {
        throw new Error(`path doesnt start with a card`);
    }
    return path[0].card;
};

export type Cursor = {
    start: Path[];
    end?: Path[];
};

export type State = {
    nidx: () => number;
    map: Map;
    root: number;
    at: Cursor[];
    menu?: { selection: number; dismissed?: boolean };
};
export type NsUpdateMap = { [key: string]: null | SandboxNamespace };

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
    let at = state.at.slice();
    if (update.type === 'select') {
        at[i] = {
            start: update.selection,
            end: update.selectionEnd,
        };
        return { ...state, at };
    } else if (update.type === 'update') {
        if (update.at) {
            at = update.at;
        } else {
            at[i] = {
                start: update.selection,
                end: update.selectionEnd,
            };
        }
        return {
            ...state,
            at,
            map: applyUpdateMap(state.map, update.map),
        };
    } else if (update.type === 'menu') {
        return { ...state, menu: update.menu };
    } else if (update.type === 'config:evaluator') {
        return state;
    }
    if (update.type === 'full-select') {
        return { ...state, at: update.at };
    }
    if (update.type === 'meta') {
        console.warn('Trying to apply meta update, but were not NUIState');
        return state;
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
    nsMap: NsMap,
    cards: Card[],
    selection: { start: Path[]; end?: Path[] },
    hashNames: { [idx: number]: string },
    nidx: () => number,
    mods?: Mods,
    valid?: RegMap,
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

    if (key === '∞' || (key === '5' && mods?.alt)) {
        if (flast.type === 'start' || flast.type === 'end') {
            return {
                type: 'select',
                selection: fullPath.slice(0, -1).concat([
                    {
                        ...flast,
                        type: flast.type === 'start' ? 'end' : 'start',
                    },
                ]),
            };
        }
        for (let i = 1; i < fullPath.length; i++) {
            const pt = fullPath[fullPath.length - i];
            const node = map[pt.idx];
            if (!node) break;
            if (
                node.type === 'list' ||
                node.type === 'array' ||
                node.type === 'record'
            ) {
                return {
                    type: 'select',
                    selection: fullPath
                        .slice(0, -i)
                        .concat([{ type: 'end', idx: pt.idx }]),
                };
            }
        }
        return;
    }

    if (
        key === 'Meta' ||
        key === 'Shift' ||
        key === 'Alt' ||
        key === 'Control'
    ) {
        return;
    }

    if (key === 'Backspace' || key === 'Delete') {
        return handleBackspace(map, nsMap, selection, hashNames, cards, mods);
    }

    const textRaw = hashNames[node.loc] ?? idText(node, map) ?? '';
    const text = splitGraphemes(textRaw);
    const idx = flast.idx;

    if (textRaw === "'" && key === "'" && node.type === 'identifier') {
        return replaceWith(fullPath.slice(0, -1), {
            map: {
                [idx]: {
                    type: 'rich-text',
                    contents: null,
                    loc: idx,
                },
            },
            idx,
            selection: [{ idx, type: 'rich-text', sel: 0 }],
        });
    }

    if (key === 'ArrowLeft') {
        let flast = fullPath[fullPath.length - 1];
        if ('text' in node || node.type === 'hash') {
            const text = hashNames[node.loc] ?? idText(node, map) ?? '';
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
            if (
                node.type === 'comment' &&
                flast.type === 'subtext' &&
                flast.at === 0
            ) {
                return {
                    type: 'select',
                    selection: fullPath
                        .slice(0, -1)
                        .concat([{ type: 'start', idx: node.loc }]),
                };
            }
        }
        const lll = goLeftUntil(fullPath, map, nsMap, cards, valid);
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
        if (node.type === 'comment' && flast.type === 'start') {
            return {
                type: 'select',
                selection: fullPath
                    .slice(0, -1)
                    .concat([{ type: 'subtext', at: 0, idx: node.loc }]),
            };
        }
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
        const rrr = goRightUntil(fullPath, map, nsMap, cards, valid);
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
            ? goLeft(fullPath, map, nsMap, cards)
            : goRight(fullPath, map, nsMap, cards);
        // if (rrr && mods?.shift) {
        //     return {
        //         type: 'select',
        //         selection: selection.start,
        //         selectionEnd: rrr.selection,
        //     };
        // }
        // return rrr;
    }

    if (node.type === 'comment' && key !== 'Enter' && key !== '\n') {
        return updateText(
            node,
            pos,
            splitGraphemes(key),
            idx,
            fullPath.slice(0, -1),
            map,
            hashNames[idx],
        );
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
        return openListLike({
            key,
            idx,
            node,
            fullPath,
            map,
            nsMap,
            nidx,
            start: selection.end ? selection.start : null,
        });
    }

    const ppath = fullPath[fullPath.length - 2];
    const parent = map[ppath.idx];

    if (key === ' ' || key === 'Enter' || key === '\n') {
        if (ppath.type === 'child' && 'values' in parent) {
            // Move forward into next blank, if it exists
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
            return newNodeBefore(
                fullPath.slice(0, -1),
                map,
                nsMap,
                {
                    ...newBlank(nidx()),
                    selection: fullPath.slice(-1),
                },
                nidx,
                true,
            );
        }

        const nsTop = fullPath.find((p) => p.type === 'ns-top');
        if (nsTop) {
            const ns = nsMap[nsTop.idx];
            if (ns.type === 'normal' && ns.plugin) {
                const pid =
                    typeof ns.plugin === 'string' ? ns.plugin : ns.plugin.id;
                const plugin = plugins.find((p) => p.id === pid);
                if (plugin) {
                    const change = plugin.newNodeAfter(
                        fullPath,
                        map,
                        nsMap,
                        nidx,
                    );
                    if (change) {
                        console.log('plugin change', change);
                        return change;
                    }
                }
            }
        }

        if (node.type === 'identifier' && flast.type === 'subtext') {
            const eme = splitGraphemes(node.text);
            if (flast.at < eme.length) {
                const nw = newId(eme.slice(flast.at), nidx(), 0);
                const up = newNodeAfter(fullPath, map, nsMap, nw, nidx);
                if (up) {
                    up.map[flast.idx] = {
                        ...node,
                        text: eme.slice(0, flast.at).join(''),
                    };
                    return up;
                }
            }
        }

        return newNodeAfter(fullPath, map, nsMap, newBlank(nidx()), nidx);
    }

    if (
        key === '<' &&
        ((node.type === 'identifier' &&
            (flast.type === 'end' ||
                (flast.type === 'subtext' && flast.at === text.length))) ||
            node.type === 'hash' ||
            (node.type === 'list' && flast.type === 'end'))
    ) {
        const nat = newTapply(idx, '', nidx(), nidx());
        const up = replacePathWith(fullPath.slice(0, -1), map, nsMap, nat);
        if (up) {
            up.autoComplete = true;
        }
        return up;
    }
    if (key === '>' && node.type !== 'blank') {
        for (let i = fullPath.length - 1; i >= 0; i--) {
            const parent = fullPath[i];
            if (parent.type === 'end') {
                continue;
            }
            if (parent.type === 'ns-top') {
                break;
            }
            const node = map[parent.idx];
            if (node.type === 'tapply') {
                const sel = fullPath
                    .slice(0, i)
                    .concat({ idx: parent.idx, type: 'end' });
                return {
                    type: 'select',
                    selection: sel,
                    autoComplete: true,
                };
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
        return goToTannot(fullPath, idx, map, nsMap, nidx);
    }

    if (key === '"') {
        // are we at the start of a blank or id or something?
        if (node.type === 'blank') {
            return replaceWith(fullPath.slice(0, -1), newString(idx, nidx));
        }

        const flast = fullPath[fullPath.length - 1];
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
                ppath = subPath[subPath.length - 2];
            }

            if (wrappable.includes(subPath[subPath.length - 2].type)) {
                return replacePathWith(
                    subPath.slice(0, -1),
                    map,
                    nsMap,
                    newString(nidx(), nidx, '', nw),
                );
            }
        }

        return newNodeAfter(
            fullPath,
            map,
            nsMap,
            newString(nidx(), nidx),
            nidx,
        );
    }

    if (key === ';') {
        if (node.type === 'blank') {
            return replaceWith(fullPath.slice(0, -1), {
                map: {
                    [idx]: {
                        type: 'comment',
                        text: '',
                        loc: idx,
                    },
                },
                idx: idx,
                selection: [{ idx, type: 'subtext', at: 0 }],
            });
        }
        if (
            node.type === 'list' ||
            node.type === 'array' ||
            (node.type === 'identifier' && pos === 0)
        ) {
            const n = nidx();
            return replacePathWith(fullPath.slice(0, -1), map, nsMap, {
                map: {
                    [n]: { type: 'comment-node', loc: n, contents: idx },
                },
                idx: n,
                selection: [
                    { idx: n, type: 'spread-contents' },
                    { idx, type: 'start' },
                ],
            });
        }
    }

    if (key === '.') {
        if (node.type === 'blank') {
            const nat = newRecordAccess(idx, '', nidx(), nidx());
            return replacePathWith(fullPath.slice(0, -1), map, nsMap, nat);
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
            const up = replacePathWith(fullPath.slice(0, -1), map, nsMap, nat);
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
                return replacePathWith(fullPath.slice(0, -2), map, nsMap, nat);
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

        if (
            node.type === 'list' ||
            node.type === 'array' ||
            (node.type === 'identifier' && pos === 0)
        ) {
            const n = nidx();
            return replacePathWith(fullPath.slice(0, -1), map, nsMap, {
                map: {
                    [n]: { type: 'spread', loc: n, contents: idx },
                },
                idx: n,
                selection: [
                    { idx: n, type: 'spread-contents' },
                    { idx, type: 'start' },
                ],
            });
        }

        if (node.type !== 'identifier') {
            const at = newBlank(nidx());
            const one = newRecordAccess(at.idx, '', nidx(), nidx());
            return newNodeAfter(fullPath, map, nsMap, mergeNew(at, one), nidx);
        }
    }

    return insertText(
        key,
        map,
        nsMap,
        fullPath,
        hashNames,
        nidx,
        selection.end ? selection.start : undefined,
    );
};

export const insertText = (
    inputRaw: string,
    map: Map,
    nsMap: NsMap,
    fullPath: Path[],
    hashNames: { [idx: number]: string },
    nidx: () => number,
    start?: Path[],
) => {
    const flast = fullPath[fullPath.length - 1];
    const node = map[flast.idx];
    const idx = flast.idx;
    // Ok, so now we're updating things
    const input = splitGraphemes(inputRaw);
    const textRaw = hashNames[node.loc] ?? idText(node, map) ?? '';
    const pos = pathPos(fullPath, textRaw);

    if (
        node.type === 'identifier' ||
        node.type === 'accessText' ||
        node.type === 'stringText' ||
        node.type === 'comment' ||
        node.type === 'hash'
    ) {
        const multi =
            start && equal(start.slice(0, -1), fullPath.slice(0, -1))
                ? start[start.length - 1]
                : undefined;
        return updateText(
            node,
            pos,
            input,
            idx,
            fullPath.slice(0, -1),
            map,
            hashNames[idx],
            multi?.type === 'subtext'
                ? multi.at
                : multi?.type === 'start'
                ? 0
                : undefined,
        );
    }

    if (flast.type === 'inside') {
        return addToListLike(map, idx, fullPath, newId(input, nidx()));
    }

    if (node.type === 'blank') {
        return replaceWith(fullPath.slice(0, -1), newId(input, idx));
    }

    if (flast.type === 'start') {
        return newNodeBefore(fullPath, map, nsMap, newId(input, nidx()), nidx);
    }

    return newNodeAfter(fullPath, map, nsMap, newId(input, nidx()), nidx);
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
    } as MNode;
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
    map: Map,
    hashName?: string,
    posEnd?: number,
): StateUpdate {
    const raw = hashName ?? idText(node, map) ?? '';
    let text = splitGraphemes(raw);
    let dest = pos + input.length;
    if (posEnd != null) {
        const [left, right] = posEnd > pos ? [pos, posEnd] : [posEnd, pos];
        text.splice(left, right - left, ...input);
        dest = left + input.length;
    } else if (pos === 0) {
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
        selection: path.concat([{ idx, type: 'subtext', at: dest }]),
    };
}

function goToTannot(
    path: Path[],
    idx: number,
    map: Map,
    nsMap: NsMap,
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
        nsMap,
        newAnnot(idx, nidx(), newBlank(nidx())),
    );
}

export function openListLike({
    key,
    idx,
    node,
    fullPath,
    map,
    nsMap,
    nidx,
    start,
}: {
    key: string;
    idx: number;
    node: MNode;
    fullPath: Path[];
    map: Map;
    nsMap: NsMap;
    nidx: () => number;
    start: Path[] | null;
}): StateUpdate | void {
    const type = ({ '(': 'list', '[': 'array', '{': 'record' } as const)[key]!;

    // Just replace it!
    if (node.type === 'blank') {
        return replaceWith(fullPath.slice(0, -1), newListLike(type, idx));
    }

    if (start) {
        let i = 0;
        for (let i = 0; i < fullPath.length && i < start.length; i++) {
            const st = start[i];
            const ed = fullPath[i];
            if (st.idx !== ed.idx) break;
            // two childs, most alike in dignity
            if (st.type === 'child' && ed.type === 'child' && st.at !== ed.at) {
                const left = Math.min(st.at, ed.at);
                const right = Math.max(st.at, ed.at);
                let parent = map[st.idx];
                if (!('values' in parent)) break;
                const newOne = newListLike(
                    type,
                    nidx(),
                    parent.values.slice(left, right + 1).map((idx) => ({
                        idx,
                        map: {},
                        selection: [],
                    })),
                );
                parent = { ...parent, values: parent.values.slice() };
                parent.values.splice(left, right - left + 1, newOne.idx);

                return {
                    type: 'update',
                    map: { [parent.loc]: parent, ...newOne.map },
                    selection: fullPath.slice(0, i).concat([
                        { type: 'child', at: left, idx: st.idx },
                        { type: 'start', idx: newOne.idx },
                    ]),
                };
            }
        }
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
            return replacePathWith(
                subPath.slice(0, -1),
                map,
                nsMap,
                newListLike(type, nidx(), [nw]),
            );
        }
    }

    return newNodeAfter(fullPath, map, nsMap, newListLike(type, nidx()), nidx);
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
    nsMap?: NsMap;
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
                map: {
                    [gp.idx]: { ...gpnode, values: [] },
                    ...clearAllChildren(gpnode.values, map),
                },
                selection: path
                    .slice(0, -1)
                    .concat({ idx: gp.idx, type: 'inside' }),
            };
        }
    }
};

export const clearAllChildren = (idxs: number[], map: Map) => {
    const res: UpdateMap = {};

    const clear = (idx: number) => {
        res[idx] = null;
        const node = map[idx];
        if (!node) {
            debugger;
        }
        switch (node.type) {
            case 'array':
            case 'list':
            case 'record':
                node.values.forEach(clear);
                break;
            case 'annot':
                clear(node.annot);
                clear(node.target);
                break;
            case 'recordAccess':
                clear(node.target);
                node.items.forEach(clear);
                break;
            case 'spread':
                clear(node.contents);
                break;
            case 'string':
                clear(node.first);
                node.templates.forEach((t) => (clear(t.expr), clear(t.suffix)));
                break;
            case 'tapply':
                clear(node.target);
                node.values.forEach(clear);
                break;
        }
    };

    idxs.forEach(clear);

    return res;
};
