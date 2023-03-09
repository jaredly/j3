import {
    EvalCtx,
    Path,
    PathChild,
    Selection,
    Store,
    StoreUpdate,
} from '../store';
import { Events } from '../old/Nodes';
import {
    newListLike,
    newNodeAfter,
    wrappable,
    wrapWithParens,
} from './wrapWithParens';
import { Map, MNode } from '../../src/types/mcst';

export type PathPlus = {
    idx: number;
    child: PathChild;
    leftSelect?: Selection;
    rightSelect?: Selection;
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

export const getKeyUpdate = (
    key: string,
    pos: number,
    text: string,
    idx: number,
    path: PathPlus[],
    map: Map,
):
    | { type: 'update'; update: StoreUpdate | void; auto?: boolean }
    | { type: 'select'; selection: Selection }
    | void => {
    const last = path[path.length - 1];
    const node = map[idx];

    // Start a list-like!
    if ('([{'.includes(key)) {
        return openListLike({ key, idx, last, node, path, map });
    }

    // "special" locations
    // accessText

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
    last: PathPlus;
    node: MNode;
    path: PathPlus[];
    map: Map;
}):
    | void
    | { type: 'update'; update: StoreUpdate | void; auto?: boolean | undefined }
    | { type: 'select'; selection: Selection } {
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
                  map: update,
                  selection: { idx: ll.loc.idx, loc: 'inside' },
              },
              auto: true,
          }
        : undefined;
}
