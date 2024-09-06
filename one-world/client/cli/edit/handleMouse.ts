import { BlockEntry, DropTarget } from '../../../shared/IR/block-to-text';
import { matchesSpan } from '../../../shared/IR/highlightSpan';
import { cursorForNode, IRCache, IRCache2 } from '../../../shared/IR/nav';
import { Path, serializePath } from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { selectionFromLocation } from '../selectionLocation';

export const selectionForPos = (
    x: number,
    y: number,
    sourceMaps: BlockEntry[],
    dropTargets: DropTarget[],
    cache: IRCache2<unknown>,
) => {
    const found = sourceMaps.find((m) => matchesSpan(x, y, m.shape));
    if (found) {
        const path: Path = found.source.path;
        const cursor = selectionFromLocation(found, { x, y });

        return {
            selection: { start: { cursor, key: serializePath(path), path } },
            exact: true,
        };
    }

    // Otherwise, search for the "next best thing"
    const closest = dropTargets
        .map((target) => ({
            target,
            dx: Math.abs(target.pos.x - x),
            dy: Math.abs(target.pos.y - y),
        }))
        .filter((a) => a.dy === 0)
        .sort((a, b) => a.dx - b.dx);
    if (!closest.length) return;
    let { path, side } = closest[0].target;

    const { cursor, children } = cursorForNode(
        path.children,
        side === 'before' ? 'start' : 'end',
        cache[path.root.toplevel].irs,
    );

    path = { ...path, children };

    return {
        selection: { start: { cursor, key: serializePath(path), path } },
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
    const y = evt.y - 2;
    const found = selectionForPos(x, y, sourceMaps, dropTargets, cache);
    if (!found) return;
    const { selection, exact } = found;

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
    const x = evt.x - 1;
    const y = evt.y - 2;
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
            selections: [{ start: sel.start, end: { path, key: pk } }],
        });
    }
};
