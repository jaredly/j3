import termkit from 'terminal-kit';
import { BlockEntry, blockToText } from '../../shared/IR/block-to-text';
import { IRCache } from '../../shared/IR/nav';
import { Store } from '../StoreContext2';
import { drawDocNode } from './drawDocNode';
import { selectionLocation } from './selectionLocation';

export const renderSelection = (
    term: termkit.Terminal,
    store: Store,
    docId: string,
    sourceMaps: BlockEntry[],
) => {
    const ds = store.getDocSession(docId, store.session);
    if (ds.selections.length) {
        const sel = ds.selections[0];
        const result = selectionLocation(
            sourceMaps,
            sel.start.path,
            sel.start.cursor,
        );
        if (result) {
            term.moveTo(0, 25, JSON.stringify(sel.start.cursor));
            term.moveTo(result.pos[0] + 1, result.pos[1] + 2);
        } else {
            // console.log(sel.start);
        }
    }
};

export const render = (term: termkit.Terminal, store: Store, docId: string) => {
    const ds = store.getDocSession(docId, store.session);
    const doc = store.getState().documents[docId];
    const cache: IRCache = {};
    const block = drawDocNode(0, [], doc, store.getState(), cache);
    const sourceMaps: BlockEntry[] = [];
    const txt = blockToText({ x: 0, y: 0, x0: 0 }, block, {
        sourceMaps,
        color: true,
        styles: new Map(),
    });
    term.moveTo(0, 2, txt);
    return { cache, sourceMaps };
};

export const pickDocument = (store: Store, term: termkit.Terminal) => {
    return new Promise<string>((resolve, reject) => {
        const state = store.getState();
        const ids = Object.keys(state.documents);
        let sel = 0;

        const draw = () => {
            term.clear();
            // sb.clear()
            for (let i = 0; i < ids.length; i++) {
                term.moveTo(0, i);
                if (sel === i) {
                    term.bgGreen(state.documents[ids[i]].title);
                } else {
                    term(state.documents[ids[i]].title);
                }
                // sb.put({})
            }
        };

        const key = (key: string) => {
            if (key === 'ENTER') {
                term.off('key', key);
                return resolve(ids[sel]);
            }
            if (key === 'DOWN') {
                sel = Math.min(sel + 1, ids.length - 1);
            }
            if (key === 'UP') {
                sel = Math.max(0, sel - 1);
            }
            if (key === 'ESCAPE') {
                reject('quit');
            }
            draw();
        };

        term.on('key', key);
        draw();
    });
};
