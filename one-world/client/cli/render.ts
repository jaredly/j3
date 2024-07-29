import termkit from 'terminal-kit';
import {
    BlockEntry,
    blockToText,
    StyleOverrides,
} from '../../shared/IR/block-to-text';
import { IRCache, lastChild } from '../../shared/IR/nav';
import { Store } from '../StoreContext2';
import { drawDocNode } from './drawDocNode';
import { selectionLocation } from './selectionLocation';
import { IRSelection } from '../../shared/IR/intermediate';
import { Block, blockSourceKey } from '../../shared/IR/ir-to-blocks';
import { termColors } from '../TextEdit/colors';
import { Path } from '../../shared/nodes';

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
            // term.moveTo(0, 25, JSON.stringify(sel.start.cursor));
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
    const block = drawDocNode(
        0,
        [],
        doc,
        store.getState(),
        cache,
        ds.selections,
        term.width,
    );
    const { txt, sourceMaps } = redrawWithSelection(block, ds.selections);
    term.moveTo(0, 2, txt);
    term.moveTo(0, 0);
    return { cache, sourceMaps, block };
};

export const redrawWithSelection = (
    block: Block,
    selections: IRSelection[],
) => {
    const sourceMaps: BlockEntry[] = [];
    const styles: StyleOverrides = selectionStyleOverrides(selections);
    const txt = blockToText({ x: 0, y: 0, x0: 0 }, block, {
        sourceMaps,
        color: true,
        styles,
    });

    return { txt, sourceMaps };
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

const nodeKey = (path: Path) => `${path.root.toplevel}:${lastChild(path)}`;

function selectionStyleOverrides(selections: IRSelection[]) {
    const styles: StyleOverrides = {};
    selections.forEach((selection) => {
        if (selection.end) {
            styles[nodeKey(selection.end.path)] = {
                type: 'full',
                color: termColors.fullHighlight,
            };
            styles[nodeKey(selection.start.path)] = {
                type: 'full',
                color: termColors.fullHighlight,
            };
            // TODO: highlight all the things
        } else if (
            selection.start.cursor.type === 'text' &&
            selection.start.cursor.start
        ) {
            const { start, end } = selection.start.cursor;
            if (start.index === end.index) {
                const key = blockSourceKey({
                    type: 'text',
                    top: selection.start.path.root.toplevel,
                    loc: lastChild(selection.start.path),
                    index: start.index,
                    wraps: [],
                });
                const [st, ed] =
                    start.cursor < end.cursor
                        ? [start.cursor, end.cursor]
                        : [end.cursor, start.cursor];
                styles[key] = {
                    start: st,
                    end: ed,
                    color: termColors.highlight,
                    type: 'sub',
                };
            }
        }
    });
    return styles;
}
