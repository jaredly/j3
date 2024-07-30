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
import { childLocs, Path, pathWithChildren } from '../../shared/nodes';
import { PersistedState } from '../../shared/state2';

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
        term.width - 1,
    );
    const { txt, sourceMaps } = redrawWithSelection(
        block,
        ds.selections,
        store.getState(),
    );
    term.moveTo(0, 2, txt);
    term.moveTo(0, 0);
    return { cache, sourceMaps, block };
};

export const redrawWithSelection = (
    block: Block,
    selections: IRSelection[],
    state: PersistedState,
) => {
    const sourceMaps: BlockEntry[] = [];
    const styles: StyleOverrides = selectionStyleOverrides(selections, state);
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

const nodesForSelection = (start: Path, end: Path, state: PersistedState) => {
    if (start.root.doc !== end.root.doc) return []; // this should never happen
    const doc = state.documents[start.root.doc];
    if (start.root.toplevel !== end.root.toplevel) return []; // TODO handle this later folks
    const top = state.toplevels[start.root.toplevel];
    // Case 1: end is a parent of start
    if (
        start.children.length >= end.children.length &&
        end.children.every((loc, i) => start.children[i] === loc)
    ) {
        return [end];
    }
    // Case 2: there's some kind of sibling thing going on
    for (let i = 0; i < end.children.length && i < start.children.length; i++) {
        if (start.children[i] === end.children[i]) continue;
        if (i === 0) {
            // no shared parent, this should never happen because the first id would be the
            // toplevel's root
            throw new Error('Bad news - first loc different');
        }
        const ploc = start.children[i - 1];
        const children = childLocs(top.nodes[ploc]);
        const a = children.indexOf(start.children[i]);
        const b = children.indexOf(end.children[i]);
        if (a === -1 || b == -1) {
            throw new Error(
                `cant find one of these things in the childLocs list ${children.join(
                    ',',
                )}: ${a} or ${b}`,
            );
        }
        const [st, ed] = a < b ? [a, b] : [b, a];
        const locs = children.slice(st, ed + 1);
        const ppath: Path = {
            root: start.root,
            children: start.children.slice(0, i - 1),
        };
        return locs.map((loc) => pathWithChildren(ppath, loc));
    }
    return [];
};

function selectionStyleOverrides(
    selections: IRSelection[],
    state: PersistedState,
) {
    const styles: StyleOverrides = {};
    selections.forEach((selection) => {
        if (selection.end) {
            nodesForSelection(
                selection.start.path,
                selection.end.path,
                state,
            ).forEach((path) => {
                styles[nodeKey(path)] = {
                    type: 'full',
                    color: termColors.fullHighlight,
                };
            });
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
