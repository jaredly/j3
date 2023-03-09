import {
    EvalCtx,
    Path,
    PathChild,
    Selection,
    Store,
    UpdateMap,
} from '../store';
import { Events } from '../old/Nodes';
import {
    newListLike,
    newNodeAfter,
    wrappable,
    wrapWithParens,
} from './wrapWithParens';
import { Map, MNode } from '../../src/types/mcst';
import { nidx } from '../../src/grammar';
import { closeListLike } from './onKeyDown';
import { replacePath } from '../old/RecordText';
import { modChildren } from './modChildren';

export type SelectAndPath = {
    selection: Selection;
    path: Path[];
};

export type TheUpdate = {
    map: UpdateMap;
    selection: Selection;
    path: Path[];
};

export type KeyUpdate =
    | {
          type: 'update';
          update: TheUpdate | void;
          auto?: boolean;
      }
    | {
          type: 'select';
          selection: Selection;
          path: Path[];
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

export const getKeyUpdate = (
    key: string,
    pos: number,
    text: string,
    idx: number,
    path: Path[],
    map: Map,
): KeyUpdate => {
    const last = path[path.length - 1];
    const node = map[idx];

    if (node.type === 'stringText') {
        let text = node.text;
        if (key === '"' && pos === text.length) {
            // TODO: move selection to end
            return {
                type: 'select',
                selection: { idx: last.idx, loc: 'end' },
                path: path
                    .slice(0, -1)
                    .concat({ idx: last.idx, child: { type: 'end' } }),
            };
        }

        if (pos === 0) {
            text = key + text;
        } else if (pos === text.length) {
            text = text + key;
        } else {
            text = text.slice(0, pos) + key + text.slice(pos);
        }
        return {
            type: 'update',
            update: {
                map: { [idx]: { ...node, text } },
                path,
                selection: { idx, loc: pos + 1 },
            },
        };
    }

    // Start a list-like!
    if ('([{'.includes(key)) {
        return openListLike({ key, idx, last, node, path, map });
    }

    if (key === ' ') {
        return newBlankAfter(path, idx, map);
    }

    if (')]}'.includes(key)) {
        const selection = closeListLike(key, path, map);
        return selection ? { type: 'select', ...selection } : undefined;
    }

    if (key === ':') {
        return goToTannot(path, node, idx);
    }

    if (key === '"') {
        // are we at the start of a blank or id or something?
        if (node.type === 'blank') {
            const nid = nidx();
            return {
                type: 'update',
                update: {
                    map: {
                        [idx]: {
                            type: 'string',
                            first: nid,
                            templates: [],
                            loc: { idx, start: 0, end: 0 },
                        },
                        [nid]: {
                            type: 'stringText',
                            loc: { idx: nid, start: 0, end: 0 },
                            text: '',
                        },
                    },
                    selection: { idx: nid, loc: 0 },
                    path: path.concat({ idx, child: { type: 'text', at: 0 } }),
                },
            };
        }
    }

    // "special" locations
    // accessText

    // Ok, so now we're updating things

    if (node.type === 'identifier') {
        let text = node.text;
        if (pos === 0) {
            text = key + text;
        } else if (pos === text.length) {
            text = text + key;
        } else {
            text = text.slice(0, pos) + key + text.slice(pos);
        }
        return {
            type: 'update',
            update: {
                map: { [idx]: { ...node, text } },
                path,
                selection: { idx, loc: pos + 1 },
            },
        };
    }

    if (last.child.type === 'inside') {
        const nid = nidx();
        const pnode = map[last.idx];
        const update: UpdateMap = {
            [last.idx]: {
                ...pnode,
                ...modChildren(pnode, (items) => items.unshift(nid)),
            },
            [nid]: {
                type: 'identifier',
                text: key,
                loc: { idx: nid, start: 0, end: 0 },
            },
        };
        return {
            type: 'update',
            update: {
                map: update,
                path: path.slice(0, -1).concat({
                    idx: last.idx,
                    child: { type: 'child', at: 0 },
                }),
                selection: { idx: nid, loc: 1 },
            },
        };
    }

    if (node.type === 'blank') {
        return {
            type: 'update',
            update: {
                map: {
                    [idx]: {
                        type: 'identifier',
                        text: key,
                        loc: node.loc,
                    },
                },
                path,
                selection: { idx, loc: 1 },
            },
        };
    }

    throw new Error(
        `not handled ${JSON.stringify({
            path,
            node,
            key,
        })}`,
    );

    // if (last && (last.child.type === 'child' || last.child.type === 'expr')) {
    //     if ('([{'.includes(key) && pos === 0 && text.length !== 0) {
    //         return {
    //             type: 'update',
    //             update: wrapWithParens(
    //                 path,
    //                 idx,
    //                 map,
    //                 ({ '(': 'list', '[': 'array', '{': 'record' } as const)[
    //                     key
    //                 ]!,
    //                 'start',
    //             ),
    //         };
    //     }
    // }
};

function goToTannot(path: Path[], node: MNode, idx: number): KeyUpdate {
    if (node.tannot != null) {
        return {
            type: 'select',
            selection: { idx: node.tannot, loc: 'start' },
            path: path.concat({ idx, child: { type: 'tannot' } }),
        };
    }
    const nn: MNode = {
        type: 'blank',
        loc: { idx: nidx(), start: 0, end: 0 },
    };
    const update: UpdateMap = {
        [idx]: {
            ...node,
            tannot: nn.loc.idx,
        },
        [nn.loc.idx]: nn,
    };
    return {
        type: 'update',
        update: {
            map: update,
            selection: {
                idx: nn.loc.idx,
                loc: 'start',
            },
            path: path.concat({ idx, child: { type: 'tannot' } }),
        },
    };
}

function newBlankAfter(path: Path[], idx: number, map: Map): KeyUpdate {
    const nn: MNode = {
        type: 'blank',
        loc: { idx: nidx(), start: 0, end: 0 },
    };
    const update = newNodeAfter(path, idx, map, nn);
    return update
        ? {
              type: 'update',
              update: {
                  map: update.map,
                  selection: { idx: nn.loc.idx, loc: 'start' },
                  path: update.path,
              },
              auto: true,
          }
        : undefined;
}

function openListLike({
    key,
    idx,
    last,
    node,
    path,
    map,
}: {
    key: string;
    idx: number;
    last: Path;
    node: MNode;
    path: Path[];
    map: Map;
}): KeyUpdate {
    const type = ({ '(': 'list', '[': 'array', '{': 'record' } as const)[key]!;

    // Just replace it!
    if (node.type === 'blank') {
        return {
            type: 'update',
            update: {
                map: {
                    [idx]: {
                        type,
                        values: [],
                        loc: { idx, start: 0, end: 0 },
                    },
                },
                selection: { idx, loc: 'inside' },
                path: path.concat({ idx, child: { type: 'inside' } }),
            },
        };
    }

    // Gotta wrap it!
    if (last.child.type === 'start') {
        if (wrappable.includes(path[path.length - 2].child.type)) {
            return {
                type: 'update',
                update: wrapWithParens(
                    path.slice(0, -1),
                    idx,
                    map,
                    type,
                    'start',
                ),
            };
        }
    }

    if (wrappable.includes(last.child.type)) {
        return {
            type: 'update',
            update: wrapWithParens(path, idx, map, type, 'start'),
        };
    }

    const ll = newListLike(type);
    const update = newNodeAfter(path, idx, map, ll);
    return update
        ? {
              type: 'update',
              update: {
                  map: update.map,
                  selection: { idx: ll.loc.idx, loc: 'inside' },
                  path: update.path,
              },
              auto: true,
          }
        : undefined;
}
