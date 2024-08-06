import { BlockEntry } from '../../../shared/IR/block-to-text';
import { matchesSpan } from '../../../shared/IR/highlightSpan';
import { IRCache } from '../../../shared/IR/nav';
import { Path, serializePath } from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { selectionFromLocation } from '../selectionLocation';

export const handleMouse = (
    docId: string,
    sourceMaps: BlockEntry[],
    evt: { x: number; y: number },
    cache: IRCache,
    store: Store,
) => {
    const x = evt.x - 1;
    const y = evt.y - 2;
    const found = sourceMaps.find((m) => matchesSpan(x, y, m.shape));
    if (!found) return;
    const top = found.source.top;
    if (!cache[top].paths[found.source.loc]) return;
    const path: Path = {
        root: cache[top].root,
        children: cache[top].paths[found.source.loc].concat([found.source.loc]),
    };

    const cursor = selectionFromLocation(found, { x, y });

    store.update({
        type: 'selection',
        doc: docId,
        selections: [{ start: { cursor, key: serializePath(path), path } }],
    });
};

export const handleMouseDrag = (
    docId: string,
    sourceMaps: BlockEntry[],
    evt: { x: number; y: number },
    cache: IRCache,
    store: Store,
) => {
    const sels = store.getDocSession(docId, store.session).selections;
    if (!sels.length) return;
    const sel = sels[0];
    const x = evt.x - 1;
    const y = evt.y - 2;
    const found = sourceMaps.find((m) => matchesSpan(x, y, m.shape));
    if (!found) return;
    const top = found.source.top;
    if (!cache[top].paths[found.source.loc]) return;
    const path: Path = {
        root: cache[top].root,
        children: cache[top].paths[found.source.loc].concat([found.source.loc]),
    };

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
