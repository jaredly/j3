import {
    EvalCtx,
    Path,
    PathChild,
    Selection,
    Store,
    UpdateMap,
} from '../store';
import { Events } from '../old/Nodes';
import { newListLike, wrappable, wrapWithParens } from './wrapWithParens';
import { Map, MNode, MNodeExtra } from '../../src/types/mcst';
import { nidx } from '../../src/grammar';
import { closeListLike } from './onKeyDown';
import { replacePath } from '../old/RecordText';
import { modChildren } from './modChildren';
import { Identifier, stringText } from '../../src/types/cst';

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
    if (!path.length) {
        throw new Error(`no path ${key} ${idx} ${JSON.stringify(map)}`);
    }
    const last = path[path.length - 1];
    const node = map[idx];

    if (node.type === 'stringText') {
        return handleStringText({ key, idx, node, pos, path, map });
    }

    // Start a list-like!
    if ('([{'.includes(key)) {
        return openListLike({ key, idx, last, node, path, map });
    }

    if (key === ' ') {
        return newNodeAfter(path, map, newBlank());
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
            return replaceWithString(idx, path);
        }
        return newStringAfter(path, idx, map);
    }

    if (key === '.') {
        //
    }

    // Ok, so now we're updating things

    if (node.type === 'identifier' || node.type === 'accessText') {
        return updateText(node, pos, key, idx, path);
    }

    if (last.child.type === 'inside') {
        return addToListLike(map, last.idx, path, newId(key));
    }

    if (node.type === 'blank') {
        return { type: 'update', update: { ...newId(key, idx), path } };
    }

    throw new Error(
        `not handled ${JSON.stringify({
            path,
            node,
            key,
        })}`,
    );
};

const newBlank = (idx = nidx()): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'blank',
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: { idx, loc: 'start' },
    };
};

const newId = (key: string, idx = nidx()): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'identifier',
                text: key,
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: { idx, loc: 1 },
    };
};

function addToListLike(
    map: Map,
    pidx: number,
    path: Path[],
    newThing: NewThing,
): KeyUpdate {
    // const res = newId(key);
    const pnode = map[pidx];
    newThing.map[pidx] = {
        ...pnode,
        ...modChildren(pnode, (items) => items.unshift(newThing.idx)),
    };
    return {
        type: 'update',
        update: {
            ...newThing,
            path: path
                .slice(0, -1)
                .concat({
                    idx: pidx,
                    child: { type: 'child', at: 0 },
                })
                .concat(newThing.path ?? []),
        },
    };
}

// function addIdToListLike(
//     map: Map,
//     pidx: number,
//     key: string,
//     path: Path[],
// ): KeyUpdate {
//     const res = newId(key);
//     const pnode = map[pidx];
//     res.map[pidx] = {
//         ...pnode,
//         ...modChildren(pnode, (items) => items.unshift(res.selection.idx)),
//     };
//     return {
//         type: 'update',
//         update: {
//             ...res,
//             path: path.slice(0, -1).concat({
//                 idx: pidx,
//                 child: { type: 'child', at: 0 },
//             }),
//         },
//     };
// }

function updateText(
    node: Extract<MNode, { text: string }>,
    pos: number,
    key: string,
    idx: number,
    path: Path[],
): KeyUpdate {
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

function newStringAfter(path: Path[], idx: number, map: Map): KeyUpdate {
    const res = newString();
    // const fid = nidx();
    // const first: MNode = {
    //     type: 'stringText',
    //     text: '',
    //     loc: { idx: fid, start: 0, end: 0 },
    // };
    // const nn: MNode = {
    //     type: 'string',
    //     first: fid,
    //     templates: [],
    //     loc: { idx: nidx(), start: 0, end: 0 },
    // };
    return newNodeAfter(path, map, res);
    // return update
    //     ? {
    //           type: 'update',
    //           update: {
    //               map: { ...update.map, [nn.loc.idx]: nn, [fid]: first },
    //               selection: { idx: nn.loc.idx, loc: 'start' },
    //               path: update.path,
    //           },
    //           auto: true,
    //       }
    //     : undefined;
}

const newString = (idx = nidx()): NewThing => {
    const nid = nidx();
    return {
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
        idx: idx,
        selection: { idx: nid, loc: 0 },
        path: [{ idx, child: { type: 'text', at: 0 } }],
    };
};

function replaceWithString(idx: number, path: Path[]): KeyUpdate {
    const res = newString(idx);
    return {
        type: 'update',
        update: {
            ...res,
            path: path.concat(res.path ?? []),
        },
    };
}

function handleStringText({
    key,
    idx,
    node,
    pos,
    path,
    map,
}: {
    key: string;
    idx: number;
    node: stringText & MNodeExtra;
    pos: number;
    path: Path[];
    map: Map;
}): KeyUpdate {
    const last = path[path.length - 1];

    let text = node.text;
    if (key === '"' && pos === text.length) {
        return {
            type: 'select',
            selection: { idx: last.idx, loc: 'end' },
            path: path
                .slice(0, -1)
                .concat({ idx: last.idx, child: { type: 'end' } }),
        };
    }

    if (key === '{' && pos > 0 && text[pos - 1] === '$') {
        return splitString(text, pos, map, last, idx, node, path);
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

function splitString(
    text: string,
    pos: number,
    map: Map,
    last: Path,
    idx: number,
    node: stringText & MNodeExtra,
    path: Path[],
): KeyUpdate {
    const prefix = text.slice(0, pos - 1);
    const suffix = text.slice(pos);
    const string = map[last.idx];
    if (string.type !== 'string') {
        throw new Error(`stringText parent not a string`);
    }
    if (last.child.type !== 'text') {
        throw new Error(`stringText path not a text`);
    }
    const nw: MNode = {
        type: 'blank',
        loc: {
            idx: nidx(),
            start: 0,
            end: 0,
        },
    };
    const sf: MNode = {
        type: 'stringText',
        text: suffix,
        loc: { idx: nidx(), start: 0, end: 0 },
    };
    const templates = string.templates.slice();
    if (last.child.at === 0) {
        templates.splice(last.child.at, 0, {
            expr: nw.loc.idx,
            suffix: sf.loc.idx,
        });
    }
    return {
        type: 'update',
        update: {
            map: {
                [idx]: {
                    ...node,
                    text: prefix,
                },
                [sf.loc.idx]: sf,
                [nw.loc.idx]: nw,
                [last.idx]: {
                    ...string,
                    templates,
                },
            },
            selection: { idx: nw.loc.idx, loc: 'start' },
            path: path.slice(0, -1).concat({
                idx: last.idx,
                child: { type: 'expr', at: last.child.at + 1 },
            }),
        },
    };
}

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
    return newNodeAfter(path, map, {
        map: { [ll.loc.idx]: ll },
        idx: ll.loc.idx,
        selection: {
            idx: ll.loc.idx,
            loc: 'inside',
        },
    });
}

export type NewThing = {
    map: UpdateMap;
    idx: number;
    selection: Selection;
    path?: Path[];
};

export const newNodeAfter = (
    path: Path[],
    map: Map,
    newThing: NewThing,
): KeyUpdate | void => {
    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];

        if (parent.child.type !== 'child' && parent.child.type !== 'inside') {
            continue;
        }
        const child = parent.child;

        const pnode = map[parent.idx];
        newThing.map[parent.idx] = {
            ...pnode,
            ...modChildren(pnode, (items) => {
                items.splice(
                    child.type === 'child' ? child.at + 1 : 0,
                    0,
                    newThing.idx,
                );
                return items;
            }),
        };
        return {
            type: 'update',
            update: {
                ...newThing,
                path: path
                    .slice(0, i)
                    .concat({
                        idx: parent.idx,
                        child: {
                            type: 'child',
                            at: child.type === 'child' ? child.at + 1 : 0,
                        },
                    })
                    .concat(newThing.path ?? []),
            },
        };
    }
};
