import { UpdateMap } from '../store';
import { ListLikeContents, Map, MNodeExtra } from '../../src/types/mcst';
import { newBlank } from './newNodes';
import { selectEnd } from './navigate';
import { StateChange, maybeClearParentList } from './getKeyUpdate';
import { replacePath, replacePathWith } from './replacePathWith';
import {
    idText,
    orderStartAndEnd,
    splitGraphemes,
} from '../../src/parse/parse';
import { accessText, Identifier, stringText } from '../../src/types/cst';
import { collectNodes } from './clipboard';
import { Path } from './path';
import { removeNodes } from './removeNodes';
import { Ctx } from '../../src/to-ast/Ctx';

export function handleBackspace(
    map: Map,
    selection: { start: Path[]; end?: Path[] },
    hashNames: { [idx: number]: string },
): StateChange {
    if (selection.end) {
        const [start, end] = orderStartAndEnd(selection.start, selection.end);
        const item = collectNodes(map, start, end, hashNames);
        if (item.type === 'text' && item.source) {
            const node = map[item.source.idx];
            if ('text' in node || node.type === 'hash') {
                const fullText = hashNames[node.loc.idx] ?? idText(node) ?? '';
                const split = splitGraphemes(fullText);
                const text = split
                    .slice(0, item.source.start)
                    .concat(split.slice(item.source.end));
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
            return removeNodes(start, end, item.nodes, map, hashNames);
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
        flast.type === 'start' || (flast.type === 'subtext' && flast.at === 0);

    const ppath = fullPath[fullPath.length - 2];
    const parent = map[ppath.idx];

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
            return replacePathWith(fullPath.slice(0, -2), map, {
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
                                            hashNames[target.loc.idx] ??
                                            idText(target) + node.text,
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
                replacePathWith(fullPath.slice(0, -2), map, newBlank(ppath.idx))
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

    if (
        flast.type === 'end' &&
        !('text' in node) &&
        node.type !== 'hash' &&
        node.type !== 'blank'
    ) {
        const cleared = maybeClearParentList(fullPath.slice(0, -1), map);
        return (
            cleared ??
            replacePathWith(fullPath.slice(0, -1), map, newBlank(flast.idx))
        );
    }

    if (node.type === 'blank') {
        if (ppath.type === 'annot-annot' && parent.type === 'annot') {
            const update = replacePath(
                fullPath[fullPath.length - 3],
                parent.target,
                map,
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
                map: { [ppath.idx]: { ...parent, values } },
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
            replacePathWith(fullPath.slice(0, -1), map, newBlank(flast.idx))
        );
    }

    if (!atStart && ('text' in node || node.type === 'hash')) {
        const fullText = hashNames[node.loc.idx] ?? idText(node) ?? '';
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

    if (atStart) {
        const um = maybeRemovePrevBlank(fullPath, map);
        if (um) {
            return um;
        }
    }
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
                    .slice(0, -1)
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
