import termkit from 'terminal-kit';
import {
    BlockEntry,
    blockToText,
    DropTarget,
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
    Path,
    PathRoot,
    pathWithChildren,
    serializePath,
} from '../../shared/nodes';
import { Doc, DocSession, PersistedState } from '../../shared/state2';
import { isCollection } from '../TextEdit/actions';
import { MultiSelect, resolveMultiSelect } from './resolveMultiSelect';

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

export const render = (maxWidth: number, store: Store, docId: string) => {
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
        maxWidth,
    );
    const { txt, sourceMaps, dropTargets } = redrawWithSelection(
        block,
        ds.selections,
        ds.dragState,
        store.getState(),
    );
    return { cache, sourceMaps, dropTargets, block, txt };
};

export const redrawWithSelection = (
    block: Block,
    selections: IRSelection[],
    dragState: DocSession['dragState'],
    state: PersistedState,
) => {
    const sourceMaps: BlockEntry[] = [];
    const dropTargets: DropTarget[] = [];
    const styles: StyleOverrides = selectionStyleOverrides(
        selections,
        dragState,
        state,
    );
    const txt = blockToText({ x: 0, y: 0, x0: 0 }, block, {
        sourceMaps,
        dropTargets,
        color: true,
        styles,
    });

    return { txt, sourceMaps, dropTargets };
};

export const pickDocument = (store: Store, term: termkit.Terminal) => {
    return new Promise<string | null>((resolve, reject) => {
        const state = store.getState();
        const ids = Object.keys(state.documents);
        let sel = 0;

        const draw = () => {
            term.clear();
            // sb.clear()
            for (let i = 0; i <= ids.length; i++) {
                term.moveTo(0, i + 1);
                if (i === ids.length) {
                    if (sel === i) {
                        term.bgGreen('New Document');
                    } else {
                        term('New Document');
                    }
                } else if (sel === i) {
                    term.bgGreen(state.documents[ids[i]].title);
                } else {
                    term(state.documents[ids[i]].title);
                }
            }
        };

        const key = (key: string) => {
            if (key === 'ENTER') {
                term.off('key', key);
                if (sel === ids.length) {
                    resolve(null);
                } else {
                    resolve(ids[sel]);
                }
                return;
            }
            if (key === 'DOWN') {
                sel = Math.min(sel + 1, ids.length);
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

const nodeKey = (path: Path) => serializePath(path);

const docNodePaths = (
    loc: number,
    parentIds: number[],
    doc: Doc,
    state: PersistedState,
): Path[] => {
    const node = doc.nodes[loc];
    const ids = parentIds.concat([loc]);
    return [
        {
            root: {
                type: 'doc-node',
                ids,
                doc: doc.id,
                toplevel: node.toplevel,
            },
            children: [state.toplevels[node.toplevel].root],
        },
        ...node.children.flatMap((id) => docNodePaths(id, ids, doc, state)),
    ];
};

const nodesForMulti = (
    resolved: MultiSelect,
    state: PersistedState,
): Path[] => {
    if (resolved.type === 'doc') {
        const doc = state.documents[resolved.doc];
        return resolved.children.flatMap((id) =>
            docNodePaths(id, resolved.parentIds, doc, state),
        );
    }
    return resolved.children.map((id) => pathWithChildren(resolved.parent, id));
};

const nodesForSelection = (
    start: Path,
    end: Path,
    state: PersistedState,
): Path[] => {
    const resolved = resolveMultiSelect(start, end, state);
    if (!resolved) return [];
    return nodesForMulti(resolved, state);
};

function selectionStyleOverrides(
    selections: IRSelection[],
    dragState: DocSession['dragState'],
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
            // Whyy doesn't this work? idk
            // styles[nodeKey(selection.end.path)] = {
            //     type: 'full',
            //     color: { r: 255, g: 0, b: 0 },
            // };
        } else if (
            selection.start.cursor.type === 'text' &&
            selection.start.cursor.start
        ) {
            const { start, end } = selection.start.cursor;
            if (start.index === end.index) {
                const key = blockSourceKey({
                    type: 'text',
                    // top: selection.start.path.root.toplevel,
                    path: selection.start.path,
                    // loc: lastChild(selection.start.path),
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

    if (dragState) {
        nodesForMulti(dragState.source, state).forEach((path) => {
            styles[nodeKey(path)] = {
                type: 'full',
                color: termColors.dragHighlight,
            };
        });
    }

    return styles;
}
