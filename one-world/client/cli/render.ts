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
import {
    childLocs,
    parentPath,
    Path,
    PathRoot,
    pathWithChildren,
} from '../../shared/nodes';
import { PersistedState } from '../../shared/state2';
import { isCollection } from '../TextEdit/actions';

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

export type MultiSelect =
    | { type: 'top'; parent: Path; children: number[] }
    | { type: 'doc'; doc: string; parentIds: number[]; children: number[] };

export const resolveMultiSelect = (
    start: Path,
    end: Path,
    state: PersistedState,
): MultiSelect | void => {
    if (start.root.doc !== end.root.doc) return; // this should never happen
    if (start.root.toplevel !== end.root.toplevel) {
        const sids = start.root.ids;
        const eids = end.root.ids;
        const doc = state.documents[start.root.doc];
        for (let i = 0; i < sids.length && i < eids.length; i++) {
            if (sids[i] !== eids[i]) {
                // -
                if (i === 0) return; // no shared root??
                const pid = sids[i - 1];
                const parent = doc.nodes[pid];
                const sidx = parent.children.indexOf(sids[i]);
                const eidx = parent.children.indexOf(eids[i]);
                if (sidx === -1 || eidx === -1) return;
                const [left, right] = sidx < eidx ? [sidx, eidx] : [eidx, sidx];
                return {
                    type: 'doc',
                    doc: start.root.doc,
                    parentIds: sids.slice(0, i),
                    children: parent.children.slice(left, right + 1),
                };
            }
        }
    }

    const top = state.toplevels[start.root.toplevel];
    // Case 1: end is a parent of start
    if (
        start.children.length >= end.children.length &&
        end.children.every((loc, i) => start.children[i] === loc)
    ) {
        return {
            type: 'top',
            parent: parentPath(end),
            children: [lastChild(end)],
        };
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
            children: start.children.slice(0, i),
        };
        return { type: 'top', parent: ppath, children: locs };
    }

    // they're identical? this should be covered by case 1
    return { type: 'top', parent: parentPath(end), children: [lastChild(end)] };
};

const nodesForSelection = (start: Path, end: Path, state: PersistedState) => {
    const resolved = resolveMultiSelect(start, end, state);
    if (!resolved) return [];
    if (resolved.type === 'doc') return [];
    return resolved.children.map((id) => pathWithChildren(resolved.parent, id));
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
                    newLines: [],
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
        let path = selection.start.path;
        if (selection.end) {
            const match = resolveMultiSelect(
                selection.start.path,
                selection.end.path,
                state,
            );
            if (match && match.type === 'top') {
                path = match.parent;
            }
        }
        const top = state.toplevels[path.root.toplevel];
        let num = 0;
        for (let i = path.children.length - 1; i >= 0; i--) {
            const loc = path.children[i];
            if (isCollection(top.nodes[loc])) {
                styles[`${top.id}:${loc}:brace`] = {
                    type: 'full',
                    color:
                        num === 0
                            ? termColors.fullHighlight
                            : termColors.highlight,
                };
                if (++num >= 3) break;
            }
        }
    });
    return styles;
}
