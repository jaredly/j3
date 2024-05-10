import { ListLikeContents, Map, MNode, MNodeExtra, NsMap } from '../types/mcst';
import { newBlank } from './newNodes';
import { selectEnd } from './navigate';
import { goLeft } from './goLeftUntil';
import {
    Mods,
    StateChange,
    UpdateMap,
    clearAllChildren,
    maybeClearParentList,
} from './getKeyUpdate';
import { replacePath, replacePathWith } from './replacePathWith';
import { orderStartAndEnd, pathPos, splitGraphemes } from '../parse/parse';
import { idText } from '../parse/idText';
import { accessText, Identifier, stringText } from '../types/cst';
import { collectNodes } from './clipboard';
import { Path } from './path';
import { removeNodes } from './removeNodes';
import { Ctx } from '../to-ast/Ctx';
import { modChildren } from './modChildren';
import { Card, RealizedNamespace } from '../../web/custom/UIState';

// const backspacers: ((node: MNode, last:Path) => StateChange | void)[] = [
//     (node, last) => {
//         if (last.type === 'text' && last.at > 0) {
//         }
//     }
// ]
// /**
//  * Backspace:
//  * - if we're text or subtext pos > 0, it's simple
//  */
const withLast = (path: Path[], last: Path) => path.slice(0, -1).concat([last]);

const backspaces = (
    map: Map,
    node: MNode,
    path: Path[],
): StateChange | void => {
    switch (node.type) {
        case 'identifier':
        case 'comment':
            const pos = pathPos(path, node.text);
            if (pos === 0) {
                if (node.type === 'comment') {
                    if (node.text === '') {
                        return {
                            type: 'update',
                            map: {
                                [node.loc]: { type: 'blank', loc: node.loc },
                            },
                            selection: withLast(path, {
                                type: 'start',
                                idx: node.loc,
                            }),
                        };
                    } else {
                        return {
                            type: 'select',
                            selection: withLast(path, {
                                type: 'start',
                                idx: node.loc,
                            }),
                        };
                    }
                }
                const gp = path[path.length - 2];
                return backspaces(map, map[gp.idx], path.slice(0, -1));
            }
            const text = splitGraphemes(node.text);
            if (text.length === 1) {
                const cleared = maybeClearParentList(path.slice(0, -1), map);
                if (cleared) return cleared;
            }
            text.splice(pos - 1, 1);
            if (!text.length) {
                return {
                    type: 'update',
                    map: { [node.loc]: { type: 'blank', loc: node.loc } },
                    selection: withLast(path, { type: 'start', idx: node.loc }),
                };
            }
            return {
                type: 'update',
                map: { [node.loc]: { ...node, text: text.join('') } },
                selection: withLast(path, {
                    type: 'subtext',
                    idx: node.loc,
                    at: pos - 1,
                }),
            };
    }
};

export function handleBackspace(
    map: Map,
    nsMap: NsMap,
    selection: { start: Path[]; end?: Path[] },
    hashNames: { [idx: number]: string },
    cards: Card[],
    mods?: Mods,
): StateChange {
    if (selection.end) {
        const [start, end] = orderStartAndEnd(
            selection.start,
            selection.end,
            nsMap,
        );
        const item = collectNodes({ map, nsMap, cards }, start, end, hashNames);
        if (item.type === 'text' && item.source) {
            const node = map[item.source.idx];
            if ('text' in node || node.type === 'hash') {
                const fullText = hashNames[node.loc] ?? idText(node, map) ?? '';
                const split = splitGraphemes(fullText);
                const text = split
                    .slice(0, item.source.start)
                    .concat(split.slice(item.source.end));
                if (!text.length && node.type !== 'stringText') {
                    return {
                        type: 'update',
                        map: {
                            [item.source.idx]: { type: 'blank', loc: node.loc },
                        },
                        selection: selection.start.slice(0, -1).concat({
                            idx: item.source.idx,
                            type: 'end',
                        }),
                    };
                }
                return {
                    type: 'update',
                    map: {
                        [item.source.idx]:
                            node.type === 'hash'
                                ? {
                                      type: 'identifier',
                                      loc: node.loc,
                                      text: text.join(''),
                                  }
                                : { ...node, text: text.join('') },
                    },
                    selection: selection.start.slice(0, -1).concat({
                        idx: item.source.idx,
                        type: 'subtext',
                        at: item.source.start,
                    }),
                };
            }
        }
        if (item.type === 'nodes') {
            return removeNodes(
                start,
                end,
                item.nodes,
                map,
                nsMap,
                cards,
                hashNames,
            );
        }
    }

    const fullPath = selection.start;
    const flast = fullPath[fullPath.length - 1];

    // non-terminal selection
    if (flast.type === 'child') {
        const pnode = map[flast.idx] as ListLikeContents & MNodeExtra;
        const values = pnode.values.slice();
        values.splice(flast.at, 1);
        return {
            type: 'update',
            map: {
                [flast.idx]: { ...pnode, values },
            },
            selection: values.length
                ? selectEnd(
                      values[flast.at - 1],
                      fullPath.slice(0, -1).concat([
                          {
                              idx: flast.idx,
                              type: 'child',
                              at: flast.at - 1,
                          },
                      ]),
                      map,
                  )!
                : fullPath
                      .slice(0, -1)
                      .concat({ idx: flast.idx, type: 'inside' }),
        };
    }

    const node = map[flast.idx];
    const atStart =
        flast.type === 'start' ||
        (flast.type === 'subtext' && flast.at === 0) ||
        node.type === 'blank';

    const ppath = fullPath[fullPath.length - 2];
    const parent = map[ppath.idx];

    if (
        atStart &&
        ppath.type === 'spread-contents' &&
        (parent.type === 'spread' || parent.type === 'comment-node')
    ) {
        const up = replacePath(
            fullPath.slice(0, -2),
            parent.contents,
            map,
            nsMap,
        );
        if (up?.update) {
            return {
                type: 'update',
                map: up.update,
                nsMap: up.nsMap,
                selection: [...fullPath.slice(0, -2), flast],
            };
        }
    }

    const gpath = fullPath[fullPath.length - 3];
    if (ppath.type === 'ns-top' && gpath.type === 'ns' && atStart) {
        const ns = nsMap[gpath.idx] as RealizedNamespace;
        const children = ns.children.slice();
        const at = children.indexOf(gpath.child);
        if (at > 0 && map[nsMap[children[at - 1]].top].type === 'blank') {
            const toRemove = children[at - 1];
            children.splice(at - 1, 1);
            return {
                type: 'update',
                map: { [nsMap[toRemove].top]: null },
                selection: fullPath,
                nsMap: {
                    [toRemove]: null,
                    [ns.id]: { ...ns, children },
                },
            };
        }

        if (node.type === 'blank') {
            console.log('back', node);
            const left = goLeft(selection.start, map, nsMap, cards);
            if (!left) return;
            const cid = children.splice(children.indexOf(gpath.child), 1)[0];
            // STOPSHIP cleanup the thing that was removed
            return {
                type: 'update',
                map: { [flast.idx]: null },
                selection: left.selection,
                nsMap: {
                    [cid]: null,
                    [ns.id]: { ...ns, children },
                },
            };
        }
    }

    if (ppath.type === 'ns' && atStart) {
        console.log('back', node);
        const left = goLeft(selection.start, map, nsMap, cards);
        if (!left) return;
        const ns = nsMap[ppath.idx] as RealizedNamespace;
        const children = ns.children.slice();
        const cid = children.splice(children.indexOf(ppath.child), 1)[0];
        // STOPSHIP cleanup the thing that was removed
        return {
            type: 'update',
            map: { [flast.idx]: null },
            selection: left.selection,
            nsMap: {
                [cid]: null,
                [ns.id]: { ...ns, children },
            },
        };
    }

    // Unwrap a list or array
    if (
        ppath.type === 'child' &&
        ppath.at === 0 &&
        atStart &&
        'values' in parent
    ) {
        const gpath = fullPath[fullPath.length - 3];
        if (gpath?.type === 'child') {
            const gparent = map[gpath.idx];
            const changed = modChildren(gparent, (children) => {
                children.splice(gpath.at, 1, ...parent.values);
            }) as MNode;
            return {
                type: 'update',
                map: { [gpath.idx]: changed, [ppath.idx]: null },
                selection: [...fullPath.slice(0, -3), gpath, flast],
            };
        }
        if (parent.values.length === 1) {
            const up = replacePath(
                fullPath.slice(0, -2),
                parent.values[0],
                map,
                nsMap,
            );
            if (up?.update) {
                return {
                    type: 'update',
                    map: up.update,
                    nsMap: up.nsMap,
                    selection: [...fullPath.slice(0, -2), flast],
                };
            }
        }
    }

    if (node.type === 'accessText' && (atStart || node.text === '')) {
        if (parent.type !== 'recordAccess') {
            throw new Error(
                `accessText not child of recordAccess ${parent.type}`,
            );
        }
        if (ppath.type !== 'attribute') {
            throw new Error(`bad path`);
        }
        if (ppath.at === 1 && parent.items.length === 1) {
            const target = map[parent.target];
            if (!node.text && target.type === 'blank') {
                const cleared = maybeClearParentList(
                    fullPath.slice(0, -2),
                    map,
                );
                if (cleared) {
                    return cleared;
                }
            }
            return replacePathWith(fullPath.slice(0, -2), map, nsMap, {
                idx: parent.target,
                map: !node.text
                    ? {}
                    : {
                          [parent.target]:
                              target.type === 'identifier' ||
                              target.type === 'hash'
                                  ? {
                                        type: 'identifier',
                                        text:
                                            hashNames[target.loc] ??
                                            idText(target, map) + node.text,
                                        loc: target.loc,
                                    }
                                  : {
                                        type: 'identifier',
                                        text: node.text,
                                        loc: target.loc,
                                    },
                      },
                selection: selectEnd(parent.target, [], map)!,
            });
        }

        const prev = ppath.at > 1 ? parent.items[ppath.at - 2] : parent.target;
        const items = parent.items.slice();
        items.splice(ppath.at - 1, 1);
        const um: UpdateMap = {
            [flast.idx]: null,
            [ppath.idx]: {
                ...parent,
                items,
            },
        };
        const pnode = map[prev] as (
            | accessText
            | Identifier
            | { type: 'blank' }
        ) &
            MNodeExtra;
        let loc = 0;
        if (pnode.type === 'blank') {
            um[prev] = {
                type: 'identifier',
                text: node.text,
                loc: pnode.loc,
            };
        } else {
            loc = pnode.text.length;
            um[prev] = {
                ...pnode,
                text: pnode.text + node.text,
            };
        }
        return {
            type: 'update',
            map: um,
            selection: fullPath.slice(0, -2).concat([
                {
                    idx: ppath.idx,
                    ...(ppath.at > 1
                        ? {
                              type: 'attribute',
                              at: ppath.at - 1,
                          }
                        : { type: 'record-target' }),
                },
                { idx: prev, type: 'subtext', at: loc },
            ]),
        };
    }

    if (node.type === 'stringText' && atStart) {
        if (parent.type !== 'string') {
            throw new Error(`stringText parent not a string ${parent.type}`);
        }
        if (node.text === '' && parent.templates.length === 0) {
            // delete it!
            const cleared = maybeClearParentList(fullPath.slice(0, -2), map);
            return (
                cleared ??
                replacePathWith(
                    fullPath.slice(0, -2),
                    map,
                    nsMap,
                    newBlank(ppath.idx),
                )
            );
        }
        if (ppath.type === 'text' && ppath.at > 0) {
            const prev =
                ppath.at > 1
                    ? parent.templates[ppath.at - 2].suffix
                    : parent.first;
            const cur = parent.templates[ppath.at - 1];
            const pnode = map[prev] as stringText & MNodeExtra;
            const templates = parent.templates.slice();
            templates.splice(ppath.at - 1, 1);
            const um: UpdateMap = {
                [prev]: { ...pnode, text: pnode.text + node.text },
                [flast.idx]: null,
                [cur.expr]: null,
                [ppath.idx]: { ...parent, templates },
            };
            return {
                type: 'update',
                map: um,
                selection: fullPath.slice(0, -2).concat([
                    {
                        idx: ppath.idx,
                        type: 'text',
                        at: ppath.at - 1,
                    },
                    {
                        idx: prev,
                        type: 'subtext',
                        at: pnode.text.length,
                    },
                ]),
            };
        }
    }

    if (node.type === 'tapply' && flast.type === 'end') {
        const sel = selectEnd(node.target, [], map);
        return replacePathWith(fullPath.slice(0, -1), map, nsMap, {
            idx: node.target,
            map: {},
            selection: sel ?? [],
        });
    }

    if (
        flast.type === 'end' &&
        !('text' in node) &&
        node.type !== 'hash' &&
        node.type !== 'blank'
    ) {
        const cleared = maybeClearParentList(fullPath.slice(0, -1), map);
        if (cleared) {
            return cleared;
        }

        const update = replacePathWith(
            fullPath.slice(0, -1),
            map,
            nsMap,
            newBlank(flast.idx),
        )!;
        update.map = {
            ...clearAllChildren([flast.idx], map),
            ...update.map,
        };

        return update;
    }

    if (node.type === 'blank') {
        if (ppath.type === 'annot-annot' && parent.type === 'annot') {
            const { update, nsMap: upNs } = replacePath(
                fullPath.slice(0, -2),
                parent.target,
                map,
                nsMap,
            );
            const sel = selectEnd(parent.target, fullPath.slice(0, -2), map);
            if (!sel) {
                console.error(
                    'Unable to select end of target',
                    map[parent.target],
                );
                return;
            }
            return {
                type: 'update',
                map: update,
                selection: sel,
                nsMap: upNs,
            };
        }
        if (ppath.type === 'expr') {
            const parent = map[ppath.idx];
            if (parent.type !== 'string') {
                throw new Error(`expr parent not a string ${parent.type}`);
            }
            // Join the exprs
            const prev =
                ppath.at > 1
                    ? parent.templates[ppath.at - 2].suffix
                    : parent.first;
            const cur = parent.templates[ppath.at - 1];
            const pnode = map[prev] as stringText & MNodeExtra;
            const snode = map[cur.suffix] as stringText & MNodeExtra;
            const templates = parent.templates.slice();
            templates.splice(ppath.at - 1, 1);
            const um: UpdateMap = {
                [prev]: {
                    ...pnode,
                    text: pnode.text + snode.text,
                },
                [flast.idx]: null,
                [cur.suffix]: null,
                [ppath.idx]: {
                    ...parent,
                    templates,
                },
            };
            return {
                type: 'update',
                map: um,
                selection: fullPath.slice(0, -2).concat([
                    {
                        idx: ppath.idx,
                        type: 'text',
                        at: ppath.at - 1,
                    },
                    {
                        idx: prev,
                        type: 'subtext',
                        at: pnode.text.length,
                    },
                ]),
            };
        }
        if (ppath.type === 'child') {
            if (ppath.at === 0) {
                // just go left, ok?
                // OR do we do a jailbreak?
                // like, this splats the contents up a level?
                // that sounds kinda cool
                return; // TODO: This will be an unwrap operation
            }
            const parent = map[ppath.idx] as ListLikeContents & MNodeExtra;
            const values = parent.values.slice();
            values.splice(ppath.at, 1);
            if (
                values.length === 1 &&
                map[values[0]].type === 'blank' &&
                fullPath.length > 2
            ) {
                return {
                    type: 'update',
                    map: {
                        [ppath.idx]: { ...parent, values: [] },
                        [flast.idx]: null,
                    },
                    selection: fullPath.slice(0, -2).concat({
                        idx: ppath.idx,
                        type: 'inside',
                    }),
                };
            }
            const sel = selectEnd(
                values[ppath.at - 1],
                fullPath.slice(0, -2).concat([
                    {
                        idx: ppath.idx,
                        type: 'child',
                        at: ppath.at - 1,
                    },
                ]),
                map,
            );
            if (!sel) {
                return console.warn('Failure');
            }
            return {
                type: 'update',
                map: { [ppath.idx]: { ...parent, values }, [flast.idx]: null },
                selection: sel,
            };
        }
    }

    if (flast.type === 'inside') {
        // this is an empty listlike.
        // replace with a blank
        // OR if it's the only item of a list, we should
        // just delete.
        const cleared = maybeClearParentList(fullPath.slice(0, -1), map);
        return (
            cleared ??
            replacePathWith(
                fullPath.slice(0, -1),
                map,
                nsMap,
                newBlank(flast.idx),
            )
        );
    }

    if (!atStart && ('text' in node || node.type === 'hash')) {
        const fullText = hashNames[node.loc] ?? idText(node, map) ?? '';
        const text = splitGraphemes(fullText);
        const atEnd =
            flast.type === 'end' ||
            (flast.type === 'subtext' && flast.at === text.length);
        const pos = atEnd
            ? text.length
            : flast.type === 'subtext'
            ? flast.at
            : 0;
        if (text.length === 1 && atEnd) {
            const cleared = maybeClearParentList(fullPath.slice(0, -1), map);
            if (cleared) {
                return cleared;
            }
        }
        return {
            type: 'update',
            map: {
                [flast.idx]:
                    atEnd &&
                    text.length === 1 &&
                    (node.type === 'identifier' || node.type === 'hash')
                        ? { type: 'blank', loc: node.loc }
                        : node.type === 'hash'
                        ? {
                              type: 'identifier',
                              loc: node.loc,
                              text:
                                  text.slice(0, pos - 1).join('') +
                                  text.slice(pos).join(''),
                          }
                        : {
                              ...node,
                              text:
                                  text.slice(0, pos - 1).join('') +
                                  text.slice(pos).join(''),
                          },
            },
            selection: fullPath.slice(0, -1).concat([
                {
                    idx: flast.idx,
                    type: 'subtext',
                    at: pos - 1,
                },
            ]),
        };
    }

    if (node.type === 'comment' && atStart && node.text === '') {
        return replacePathWith(
            fullPath.slice(0, -1),
            map,
            nsMap,
            newBlank(flast.idx),
        );
    }

    if (atStart) {
        const um = maybeRemovePrevBlank(fullPath, map);
        if (um) {
            return um;
        }
    }

    if (
        flast.type === 'subtext' &&
        node.type === 'identifier' &&
        parent &&
        'values' in parent &&
        ppath.type === 'child' &&
        ppath.at > 0
    ) {
        const pidx = parent.values[ppath.at - 1];
        const prev = map[pidx];
        if (prev.type === 'identifier') {
            const pt = splitGraphemes(prev.text);
            const values = parent.values.slice();
            values.splice(ppath.at, 1);
            return {
                type: 'update',
                map: {
                    [pidx]: { ...prev, text: prev.text + node.text },
                    [ppath.idx]: { ...parent, values },
                    [node.loc]: null,
                },
                selection: fullPath.slice(0, -2).concat([
                    { type: 'child', at: ppath.at - 1, idx: ppath.idx },
                    { type: 'subtext', at: pt.length, idx: pidx },
                ]),
            };
        }
    }

    return goLeft(selection.start, map, nsMap, cards);
}

export const maybeRemovePrevBlank = (path: Path[], map: Map): StateChange => {
    if (path.length === 1) {
        return;
    }
    const last = path[path.length - 1];
    const gp = path[path.length - 2];
    if (gp && gp.type === 'child' && gp.at > 0) {
        const gpnode = map[gp.idx] as ListLikeContents & MNodeExtra;
        const prev = map[gpnode.values[gp.at - 1]];
        if (prev.type === 'blank') {
            const values = gpnode.values.slice();
            values.splice(gp.at - 1, 1);
            return {
                type: 'update',
                map: { [gp.idx]: { ...gpnode, values } },
                selection: path
                    .slice(0, -2)
                    .concat({
                        idx: gp.idx,
                        type: 'child',
                        at: gp.at - 1,
                    })
                    .concat([last]),
            };
        }
    }
    if (gp.type === 'start') {
        return maybeRemovePrevBlank(path.slice(0, -1), map);
    }
};
