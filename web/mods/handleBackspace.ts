import { Path } from '../store';
import { ListLikeContents, Map, MNode, MNodeExtra } from '../../src/types/mcst';
import { newBlank } from './newNodes';
import { selectEnd } from './navigate';
import {
    KeyUpdate,
    maybeClearParentList,
    replacePathWith,
} from './getKeyUpdate';
import { splitGraphemes } from '../../src/parse/parse';

export function handleBackspace({
    idx,
    node,
    pos,
    path,
    map,
}: {
    idx: number;
    node: MNode;
    pos: number;
    path: Path[];
    map: Map;
}): KeyUpdate {
    const last = path[path.length - 1];
    if (node.type === 'stringText' && pos === 0 && node.text === '') {
        const parent = map[last.idx];
        if (parent.type !== 'string') {
            throw new Error(`stringText parent not a string ${parent.type}`);
        }
        if (parent.templates.length === 0) {
            // delete it!
            const cleared = maybeClearParentList(path.slice(0, -1), map);
            return (
                cleared ??
                replacePathWith(path.slice(0, -1), map, newBlank(last.idx))
            );
        }
    }

    if (node.type === 'blank') {
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
            if (values.length === 1 && map[values[0]].type === 'blank') {
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
    if (pos > 0 && 'text' in node) {
        const text = splitGraphemes(node.text);
        if (pos === 1 && text.length === 1) {
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
                        pos === 1 &&
                        text.length === 1 &&
                        node.type === 'identifier'
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
