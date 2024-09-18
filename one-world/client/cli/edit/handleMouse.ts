import { BlockEntry, DropTarget } from '../../../shared/IR/block-to-text';
import { matchesSpan } from '../../../shared/IR/highlightSpan';
import { IRSelection } from '../../../shared/IR/intermediate';
import { cursorForNode, IRCache, IRCache2 } from '../../../shared/IR/nav';
import { Path, serializePath } from '../../../shared/nodes';
import { DocSelection } from '../../../shared/state2';
import { Store } from '../../StoreContext2';
import { selectionFromLocation } from '../selectionLocation';

export const selectionForPos = (
    x: number,
    y: number,
    sourceMaps: BlockEntry[],
    dropTargets: DropTarget[],
    cache: IRCache2<unknown>,
    yBias?: 'up' | 'down',
): { selection: DocSelection; exact: boolean } | void => {
    const found = sourceMaps.find((m) => matchesSpan(x, y, m.shape));
    if (found) {
        const path: Path = found.source.path;
        if (found.source.type === 'namespace') {
            const start = x - found.shape.start[0];
            return {
                selection: {
                    type: 'namespace',
                    root: path.root,
                    start,
                    end: start,
                },
                exact: true,
            };
        }
        const cursor = selectionFromLocation(found, { x, y });

        return {
            selection: {
                type: 'ir',
                start: { cursor, key: serializePath(path), path },
            },
            exact: true,
        };
    }

    for (let sm of sourceMaps) {
        if (
            sm.source.type === 'namespace' &&
            sm.shape.type === 'block' &&
            sm.shape.start[1] === y
        ) {
            const start = Math.min(x - sm.shape.start[0], sm.shape.width);
            return {
                selection: {
                    type: 'namespace',
                    root: sm.source.path.root,
                    start,
                    end: start,
                },
                exact: false,
            };
        }
    }

    // Otherwise, search for the "next best thing"
    const closest = dropTargets
        .map((target) => ({
            target,
            dx: Math.abs(target.pos.x - x),
            dy: Math.abs(target.pos.y - y),
            ay: target.pos.y - y,
        }))
        .filter((a) => (!yBias ? true : yBias === 'up' ? a.ay <= 0 : a.ay >= 0))
        .sort((a, b) => (a.dy === b.dy ? a.dx - b.dx : a.dy - b.dy));
    if (!closest.length) return;
    let { path, side } = closest[0].target;

    const { cursor, children } = cursorForNode(
        path.children,
        side === 'before' ? 'start' : 'end',
        cache[path.root.toplevel].irs,
    );

    path = { ...path, children };

    return {
        selection: {
            type: 'ir',
            start: { cursor, key: serializePath(path), path },
        },
        exact: false,
    };
};

export const handleMouseClick = (
    docId: string,
    sourceMaps: BlockEntry[],
    dropTargets: DropTarget[],
    evt: { x: number; y: number },
    cache: IRCache2<unknown>,
    store: Store,
) => {
    const x = evt.x - 1;
    const y = evt.y - 1;
    const found = selectionForPos(x, y, sourceMaps, dropTargets, cache);
    if (!found) return;
    const { selection, exact } = found;

    const cur = store.getDocSession(docId).selections[0];
    if (
        cur &&
        cur.type === 'ir' &&
        selection.type === 'ir' &&
        cur.start.key === selection.start.key &&
        cur.start.cursor.type === 'text' &&
        cur.start.cursor.end.text &&
        selection.start.cursor.type === 'text'
    ) {
        if (cur.start.cursor.end.index === selection.start.cursor.end.index) {
            selection.start.cursor.end.text = cur.start.cursor.end.text;
        }
    }

    store.update({
        type: 'selection',
        doc: docId,
        selections: [selection],
    });
};

export const handleMouseDrag = (
    docId: string,
    sourceMaps: BlockEntry[],
    evt: { x: number; y: number },
    store: Store,
) => {
    const sels = store.getDocSession(docId, store.session).selections;
    if (!sels.length) return;
    const sel = sels[0];
    if (sel.type !== 'ir') return;
    const x = evt.x - 1;
    const y = evt.y - 1;
    const found = sourceMaps.find((m) => matchesSpan(x, y, m.shape));
    if (!found) return;
    // const top = found.source.top;
    // if (!cache[top].paths[found.source.loc]) return;
    const path: Path = found.source.path;
    // {
    //     root: cache[top].root,
    //     children: cache[top].paths[found.source.loc].concat([found.source.loc]),
    // };

    const cursor = selectionFromLocation(found, { x, y });

    const pk = serializePath(path);
    if (
        pk === sel.start.key &&
        sel.start.cursor.type === 'text' &&
        cursor.type === 'text'
    ) {
        store.update({
            type: 'selection',
            doc: docId,
            selections: [
                {
                    type: 'ir',
                    start: {
                        cursor: {
                            type: 'text',
                            end: cursor.end,
                            start:
                                sel.start.cursor.start ?? sel.start.cursor.end,
                        },
                        key: serializePath(path),
                        path,
                    },
                },
            ],
        });
    } else {
        store.update({
            type: 'selection',
            doc: docId,
            selections: [
                { type: 'ir', start: sel.start, end: { path, key: pk } },
            ],
        });
    }
};
