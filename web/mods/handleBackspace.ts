import { UpdateMap } from '../store';
import {
    fromMCST,
    ListLikeContents,
    Map,
    MNode,
    MNodeExtra,
} from '../../src/types/mcst';
import { newBlank } from './newNodes';
import { goLeft, selectEnd, selectStart } from './navigate';
import {
    StateChange,
    maybeClearParentList,
    getKeyUpdate,
    StateSelect,
} from './getKeyUpdate';
import { replacePathWith } from './replacePathWith';
import { splitGraphemes } from '../../src/parse/parse';
import {
    accessText,
    Identifier,
    Node,
    NodeExtra,
    stringText,
} from '../../src/types/cst';
import { collectNodes, commonAncestor, validatePath } from './clipboard';
import { cmpFullPath } from '../custom/isCoveredBySelection';
import { transformNode } from '../../src/types/transform-cst';
import { Path } from './path';

export function handleBackspace(
    map: Map,
    selection: { start: Path[]; end?: Path[] },
): StateChange {
    if (selection.end) {
        const [start, end] =
            cmpFullPath(selection.start, selection.end) < 0
                ? [selection.start, selection.end]
                : [selection.end, selection.start];
        const item = collectNodes(map, start, end);
        if (item.type === 'text' && item.source) {
            const node = map[item.source.idx];
            if ('text' in node) {
                const split = splitGraphemes(node.text);
                const text = split
                    .slice(0, item.source.start)
                    .concat(split.slice(item.source.end));
                return {
                    type: 'update',
                    map: {
                        [item.source.idx]: { ...node, text: text.join('') },
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
            return removeNodes(start, end, item.nodes, map);
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

    if (node.type === 'accessText' && atStart) {
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
            return replacePathWith(fullPath.slice(0, -2), map, {
                idx: parent.target,
                map:
                    target.type === 'blank' && !node.text
                        ? {}
                        : {
                              [parent.target]:
                                  target.type === 'identifier'
                                      ? {
                                            ...target,
                                            text: target.text + node.text,
                                        }
                                      : {
                                            type: 'identifier',
                                            text: node.text,
                                            loc: target.loc,
                                        },
                          },
                selection: [
                    {
                        idx: parent.target,
                        ...(target.type === 'identifier'
                            ? { type: 'subtext', at: target.text.length }
                            : { type: 'end' }),
                    },
                ],
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

    if (flast.type === 'end' && !('text' in node)) {
        const cleared = maybeClearParentList(fullPath.slice(0, -1), map);
        return (
            cleared ??
            replacePathWith(fullPath.slice(0, -1), map, newBlank(flast.idx))
        );
    }

    if (node.type === 'blank') {
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

    if (!atStart && 'text' in node) {
        const text = splitGraphemes(node.text);
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
                    atEnd && text.length === 1 && node.type === 'identifier'
                        ? { type: 'blank', loc: node.loc }
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

export const removeNodes = (
    start: Path[],
    end: Path[],
    nodes: Node[],
    map: Map,
): StateChange | void => {
    const ancestor = commonAncestor(start, end);
    if (!ancestor) {
        console.warn('no common ancestor', start, end);
        return;
    }
    const toRemove: { [idx: number]: boolean } = {};
    nodes.forEach((node) => (toRemove[node.loc.idx] = true));

    // hmmm changed?
    let update: UpdateMap = {};

    transformNode(fromMCST(ancestor, map), {
        pre(node, path) {
            if ('values' in node) {
                let values = node.values.filter(
                    (node) => !toRemove[node.loc.idx],
                );
                if (values.length < node.values.length) {
                    update[node.loc.idx] = {
                        ...node,
                        values: values.map((v) => v.loc.idx),
                    };
                }
                return;
            }
            // if (node.type === 'recordAccess') {
            //     if (toRemove[node.target.loc.idx]) {
            //         update[node.target.loc.idx] = {
            //             type: 'blank',
            //             loc: node.target.loc,
            //         };
            //     }
            // }
            // HM
            if (node.type === 'spread') {
                if (toRemove[node.contents.loc.idx]) {
                    console.log('remove node contents', node);
                    update[node.contents.loc.idx] = {
                        type: 'blank',
                        loc: node.contents.loc,
                    };
                }
            }
            if (node.type === 'annot') {
                //
            }
            if (node.type === 'string') {
                let first = node.first;
                if (toRemove[first.loc.idx]) {
                    first = { ...first, text: '' };
                }
                let templates: {
                    expr: Node;
                    suffix: stringText & NodeExtra;
                }[] = [];
                node.templates.forEach(({ expr, suffix }) => {
                    if (toRemove[expr.loc.idx]) {
                        if (!toRemove[suffix.loc.idx]) {
                            if (templates.length) {
                                templates[templates.length - 1].suffix.text +=
                                    suffix.text;
                            } else {
                                first = {
                                    ...first,
                                    text: first.text + suffix.text,
                                };
                            }
                        }
                    } else if (toRemove[suffix.loc.idx]) {
                        templates.push({
                            expr,
                            suffix: { ...suffix, text: '' },
                        });
                    } else {
                        templates.push({ expr, suffix });
                    }
                });
                if (first !== node.first) {
                    update[first.loc.idx] = first;
                }
                if (templates.length !== node.templates.length) {
                    update[node.loc.idx] = {
                        ...node,
                        first: first.loc.idx,
                        templates: templates.map(({ expr, suffix }) => {
                            update[suffix.loc.idx] = suffix;
                            return {
                                expr: expr.loc.idx,
                                suffix: suffix.loc.idx,
                            };
                        }),
                    };
                }
            }
        },
    });

    if (update[-2] !== undefined) {
        console.log('got some');
        delete update[-2];
    }
    console.log('removing', update);

    const updated = { ...map, ...update } as Map;

    let left = start;

    let parent = start[start.length - 2];
    if (parent.type === 'child' && parent.at === 0) {
        const node = updated[parent.idx];
        if ('values' in node) {
            if (!node.values.length) {
                left = start.slice(0, -2).concat({
                    idx: parent.idx,
                    type: 'inside',
                });
            } else {
                left = selectStart(
                    node.values[0],
                    start.slice(0, -2).concat({
                        idx: parent.idx,
                        type: 'child',
                        at: 0,
                    }),
                    updated,
                )!;
            }
        }
    }

    // const left = getKeyUpdate('ArrowLeft', map, { start }, () => -100);
    // let left = goLeft(start, map)?.selection;
    // if (!left) {
    //     console.log('cannot left');
    //     return;
    // }
    while (!validatePath(updated, left!)) {
        left = goLeft(left!, map)?.selection!;
        if (!left) {
            console.log('cannot left');
            return;
        }
    }

    return {
        type: 'update',
        map: update,
        selection: left,
    };
};
