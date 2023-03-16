import { Path, Selection, UpdateMap } from '../store';
import { ListLikeContents, Map, MNode, MNodeExtra } from '../../src/types/mcst';
import { newBlank } from './newNodes';
import {
    combinePathSel,
    maybeToPathSel,
    PathSel,
    selectEnd,
    toPathSel,
} from './navigate';
import {
    KeyUpdate,
    maybeClearParentList,
    replacePathWith,
} from './getKeyUpdate';
import { splitGraphemes } from '../../src/parse/parse';
import { accessText, Identifier, stringText } from '../../src/types/cst';

export function handleBackspace(map: Map, fullPath: Path[]): KeyUpdate {
    const flast = fullPath[fullPath.length - 1];
    const node = map[flast.idx];
    const atStart =
        flast.child.type === 'start' ||
        (flast.child.type === 'subtext' && flast.child.at === 0);

    const ppath = fullPath[fullPath.length - 2];
    const parent = map[ppath.idx];

    if (node.type === 'accessText' && atStart) {
        if (parent.type !== 'recordAccess') {
            throw new Error(
                `accessText not child of recordAccess ${parent.type}`,
            );
        }
        if (ppath.child.type !== 'attribute') {
            throw new Error(`bad path`);
        }
        if (ppath.child.at === 1 && parent.items.length === 1) {
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
                        child:
                            target.type === 'identifier'
                                ? { type: 'subtext', at: target.text.length }
                                : { type: 'end' },
                    },
                ],
            });
        }

        const prev =
            ppath.child.at > 1
                ? parent.items[ppath.child.at - 2]
                : parent.target;
        const items = parent.items.slice();
        items.splice(ppath.child.at - 1, 1);
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
            update: {
                map: um,
                selection: fullPath.slice(0, -2).concat([
                    {
                        idx: ppath.idx,
                        child:
                            ppath.child.at > 1
                                ? {
                                      type: 'attribute',
                                      at: ppath.child.at - 1,
                                  }
                                : { type: 'record-target' },
                    },
                    { idx: prev, child: { type: 'subtext', at: loc } },
                ]),
            },
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
        if (ppath.child.type === 'text' && ppath.child.at > 0) {
            const prev =
                ppath.child.at > 1
                    ? parent.templates[ppath.child.at - 2].suffix
                    : parent.first;
            const cur = parent.templates[ppath.child.at - 1];
            const pnode = map[prev] as stringText & MNodeExtra;
            const templates = parent.templates.slice();
            templates.splice(ppath.child.at - 1, 1);
            const um: UpdateMap = {
                [prev]: { ...pnode, text: pnode.text + node.text },
                [flast.idx]: null,
                [cur.expr]: null,
                [ppath.idx]: { ...parent, templates },
            };
            return {
                type: 'update',
                update: {
                    map: um,
                    selection: fullPath.slice(0, -2).concat([
                        {
                            idx: ppath.idx,
                            child: { type: 'text', at: ppath.child.at - 1 },
                        },
                        {
                            idx: prev,
                            child: { type: 'subtext', at: pnode.text.length },
                        },
                    ]),
                },
            };
        }
    }

    if (flast.child.type === 'end' && !('text' in node)) {
        const cleared = maybeClearParentList(fullPath.slice(0, -1), map);
        return (
            cleared ??
            replacePathWith(fullPath.slice(0, -1), map, newBlank(flast.idx))
        );
    }

    if (node.type === 'blank') {
        if (ppath.child.type === 'expr') {
            const parent = map[ppath.idx];
            if (parent.type !== 'string') {
                throw new Error(`expr parent not a string ${parent.type}`);
            }
            // Join the exprs
            const prev =
                ppath.child.at > 1
                    ? parent.templates[ppath.child.at - 2].suffix
                    : parent.first;
            const cur = parent.templates[ppath.child.at - 1];
            const pnode = map[prev] as stringText & MNodeExtra;
            const snode = map[cur.suffix] as stringText & MNodeExtra;
            const templates = parent.templates.slice();
            templates.splice(ppath.child.at - 1, 1);
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
                update: {
                    map: um,
                    selection: fullPath.slice(0, -2).concat([
                        {
                            idx: ppath.idx,
                            child: { type: 'text', at: ppath.child.at - 1 },
                        },
                        {
                            idx: prev,
                            child: { type: 'subtext', at: pnode.text.length },
                        },
                    ]),
                },
            };
        }
        if (ppath.child.type === 'child') {
            if (ppath.child.at === 0) {
                // just go left, ok?
                // OR do we do a jailbreak?
                // like, this splats the contents up a level?
                // that sounds kinda cool
                return; // TODO: This will be an unwrap operation
            }
            const parent = map[ppath.idx] as ListLikeContents & MNodeExtra;
            const values = parent.values.slice();
            values.splice(ppath.child.at, 1);
            if (
                values.length === 1 &&
                map[values[0]].type === 'blank' &&
                fullPath.length > 2
            ) {
                return {
                    type: 'update',
                    update: {
                        map: {
                            [ppath.idx]: { ...parent, values: [] },
                        },
                        selection: fullPath.slice(0, -2).concat({
                            idx: ppath.idx,
                            child: { type: 'inside' },
                        }),
                    },
                };
            }
            const sel = selectEnd(
                values[ppath.child.at - 1],
                fullPath.slice(0, -2).concat([
                    {
                        idx: ppath.idx,
                        child: { type: 'child', at: ppath.child.at - 1 },
                    },
                ]),
                map,
            );
            if (!sel) {
                return console.warn('Failure');
            }
            return {
                type: 'update',
                update: {
                    map: { [ppath.idx]: { ...parent, values } },
                    selection: sel,
                },
            };
        }
    }

    if (flast.child.type === 'inside') {
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
            flast.child.type === 'end' ||
            (flast.child.type === 'subtext' && flast.child.at === text.length);
        const pos = atEnd
            ? text.length
            : flast.child.type === 'subtext'
            ? flast.child.at
            : 0;
        if (text.length === 1 && atEnd) {
            const cleared = maybeClearParentList(fullPath.slice(0, -1), map);
            if (cleared) {
                return cleared;
            }
        }
        return {
            type: 'update',
            update: {
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
                        child: { type: 'subtext', at: pos - 1 },
                    },
                ]),
            },
        };
    }

    if (atStart) {
        const um = maybeRemovePrevBlank(fullPath, map);
        if (um) {
            return um;
        }
    }
}

export const maybeRemovePrevBlank = (path: Path[], map: Map): KeyUpdate => {
    if (path.length === 1) {
        return;
    }
    const last = path[path.length - 1];
    const gp = path[path.length - 2];
    if (gp && gp.child.type === 'child' && gp.child.at > 0) {
        const gpnode = map[gp.idx] as ListLikeContents & MNodeExtra;
        const prev = map[gpnode.values[gp.child.at - 1]];
        if (prev.type === 'blank') {
            const values = gpnode.values.slice();
            values.splice(gp.child.at - 1, 1);
            return {
                type: 'update',
                update: {
                    map: { [gp.idx]: { ...gpnode, values } },
                    selection: path
                        .slice(0, -1)
                        .concat({
                            idx: gp.idx,
                            child: { type: 'child', at: gp.child.at - 1 },
                        })
                        .concat([last]),
                },
            };
        }
    }
    if (gp.child.type === 'start') {
        return maybeRemovePrevBlank(path.slice(0, -1), map);
    }
};
