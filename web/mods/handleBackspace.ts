import { Path, UpdateMap } from '../store';
import { ListLikeContents, Map, MNode, MNodeExtra } from '../../src/types/mcst';
import { newBlank } from './newNodes';
import { selectEnd } from './navigate';
import {
    KeyUpdate,
    maybeClearParentList,
    replacePathWith,
    State,
} from './getKeyUpdate';
import { selPos, splitGraphemes } from '../../src/parse/parse';
import { stringText } from '../../src/types/cst';

export function handleBackspace({
    map,
    at: {
        sel: { idx, loc },
        path,
    },
}: State): KeyUpdate {
    const node = map[idx];
    const last = path[path.length - 1];
    const atStart = loc === 0 || loc === 'start';

    if (node.type === 'stringText' && atStart) {
        const parent = map[last.idx];
        if (parent.type !== 'string') {
            throw new Error(`stringText parent not a string ${parent.type}`);
        }
        if (node.text === '' && parent.templates.length === 0) {
            // delete it!
            const cleared = maybeClearParentList(path.slice(0, -1), map);
            return (
                cleared ??
                replacePathWith(path.slice(0, -1), map, newBlank(last.idx))
            );
        }
        if (last.child.type === 'text' && last.child.at > 0) {
            const prev =
                last.child.at > 1
                    ? parent.templates[last.child.at - 2].suffix
                    : parent.first;
            const cur = parent.templates[last.child.at - 1];
            const pnode = map[prev] as stringText & MNodeExtra;
            const templates = parent.templates.slice();
            templates.splice(last.child.at - 1, 1);
            const um: UpdateMap = {
                [prev]: {
                    ...pnode,
                    text: pnode.text + node.text,
                },
                [idx]: null,
                [cur.expr]: null,
                [last.idx]: {
                    ...parent,
                    templates,
                },
            };
            return {
                type: 'update',
                update: {
                    map: um,
                    selection: { idx: prev, loc: pnode.text.length },
                    path: path.slice(0, -1).concat([
                        {
                            idx: last.idx,
                            child: { type: 'text', at: last.child.at - 1 },
                        },
                    ]),
                },
            };
        }
    }

    if (last.child.type === 'end') {
        const cleared = maybeClearParentList(path.slice(0, -1), map);
        return (
            cleared ??
            replacePathWith(path.slice(0, -1), map, newBlank(last.idx))
        );
    }

    if (node.type === 'blank') {
        if (last.child.type === 'expr') {
            const parent = map[last.idx];
            if (parent.type !== 'string') {
                throw new Error(`expr parent not a string ${parent.type}`);
            }
            // Join the exprs
            const prev =
                last.child.at > 1
                    ? parent.templates[last.child.at - 2].suffix
                    : parent.first;
            const cur = parent.templates[last.child.at - 1];
            const pnode = map[prev] as stringText & MNodeExtra;
            const snode = map[cur.suffix] as stringText & MNodeExtra;
            const templates = parent.templates.slice();
            templates.splice(last.child.at - 1, 1);
            const um: UpdateMap = {
                [prev]: {
                    ...pnode,
                    text: pnode.text + snode.text,
                },
                [idx]: null,
                [cur.suffix]: null,
                [last.idx]: {
                    ...parent,
                    templates,
                },
            };
            return {
                type: 'update',
                update: {
                    map: um,
                    selection: { idx: prev, loc: pnode.text.length },
                    path: path.slice(0, -1).concat([
                        {
                            idx: last.idx,
                            child: { type: 'text', at: last.child.at - 1 },
                        },
                    ]),
                },
            };
        }
        if (last.child.type === 'child') {
            if (last.child.at === 0) {
                // just go left, ok?
                // OR do we do a jailbreak?
                // like, this splats the contents up a level?
                // that sounds kinda cool
                return; // TODO: This will be an unwrap operation
            }
            const parent = map[last.idx] as ListLikeContents & MNodeExtra;
            const values = parent.values.slice();
            values.splice(last.child.at, 1);
            if (
                values.length === 1 &&
                map[values[0]].type === 'blank' &&
                path.length > 1
            ) {
                return {
                    type: 'update',
                    update: {
                        map: {
                            [last.idx]: { ...parent, values: [] },
                        },
                        selection: { idx: last.idx, loc: 'inside' },
                        path: path.slice(0, -1).concat({
                            idx: last.idx,
                            child: { type: 'inside' },
                        }),
                    },
                };
            }
            const sel = selectEnd(
                values[last.child.at - 1],
                path.slice(0, -1).concat([
                    {
                        idx: last.idx,
                        child: { type: 'child', at: last.child.at - 1 },
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
                    map: {
                        [last.idx]: {
                            ...parent,
                            values,
                        },
                    },
                    selection: sel.sel,
                    path: sel.path,
                },
            };
        }
    }

    if (last.child.type === 'inside') {
        // this is an empty listlike.
        // replace with a blank
        // OR if it's the only item of a list, we should
        // just delete.
        const cleared = maybeClearParentList(path.slice(0, -1), map);
        return (
            cleared ?? replacePathWith(path.slice(0, -1), map, newBlank(idx))
        );
    }
    if (!atStart && 'text' in node) {
        const text = splitGraphemes(node.text);
        const atEnd = loc === 'end' || loc === text.length;
        const pos =
            loc === 'end' ? text.length : typeof loc === 'number' ? loc : 0;
        if (text.length === 1 && atEnd) {
            const cleared = maybeClearParentList(path, map);
            if (cleared) {
                return cleared;
            }
        }
        return {
            type: 'update',
            update: {
                map: {
                    [idx]:
                        atEnd && text.length === 1 && node.type === 'identifier'
                            ? { type: 'blank', loc: node.loc }
                            : {
                                  ...node,
                                  text:
                                      text.slice(0, pos - 1).join('') +
                                      text.slice(pos).join(''),
                              },
                },
                selection: { idx, loc: pos - 1 },
                path,
            },
        };
    }
}
