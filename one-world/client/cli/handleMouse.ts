import { BlockEntry } from '../../shared/IR/block-to-text';
import { matchesSpan } from '../../shared/IR/highlightSpan';
import { IRCache } from '../../shared/IR/nav';
import { Path, serializePath } from '../../shared/nodes';
import { Store } from '../StoreContext2';
import { selectionFromLocation } from './selectionLocation';

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
    const path: Path = {
        root: cache[top].root,
        children: cache[top].paths[found.source.loc].concat([found.source.loc]),
    };

    const cursor = selectionFromLocation(found, { x, y: y });

    store.update({
        type: 'selection',
        doc: docId,
        selections: [{ start: { cursor, key: serializePath(path), path } }],
    });
};
