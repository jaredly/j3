import termkit from 'terminal-kit';
import { AnyEvaluator, Evaluator } from '../../boot-ex/types';
import {
    BlockEntry,
    blockToText,
    DropTarget,
    StyleOverrides,
} from '../../shared/IR/block-to-text';
import { IRSelection, nodeToIR } from '../../shared/IR/intermediate';
import { Block, blockSourceKey } from '../../shared/IR/ir-to-blocks';
import {
    IRForLoc,
    LayoutChoices,
    LayoutCtx,
    layoutIR,
} from '../../shared/IR/layout';
import { IRCache2, lastChild } from '../../shared/IR/nav';
import {
    parentPath,
    Path,
    PathRoot,
    pathWithChildren,
    serializePath,
} from '../../shared/nodes';
import {
    Doc,
    DocSession,
    DocumentNode,
    PersistedState,
} from '../../shared/state2';
import { Store } from '../StoreContext2';
import { isCollection } from '../TextEdit/actions';
import { termColors } from '../TextEdit/colors';
import {
    applySelectionText,
    iterDocNodes,
    iterTopNodes,
    topFromMap,
} from './docNodeToIR';
import { docToBlock, layoutCtx } from './drawDocNode2';
import { MultiSelect, resolveMultiSelect } from './resolveMultiSelect';
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
            // term.moveTo(0, 25, JSON.stringify(sel.start.cursor));
            term.moveTo(result.pos[0] + 1, result.pos[1] + 2);
        } else {
            // console.log(sel.start);
        }
    }
};

const root = (doc: string, ids: number[], node: DocumentNode): PathRoot => ({
    type: 'doc-node',
    toplevel: node.toplevel,
    doc,
    ids,
});

const cursorLoc = (
    selections: IRSelection[],
    id: string,
): number | undefined => {
    for (let sel of selections) {
        if (!sel.end) return;
        if (
            sel.start.cursor.type === 'text' &&
            sel.start.path.root.toplevel === id
        ) {
            return lastChild(sel.start.path);
        }
    }
};

export const render = (
    maxWidth: number,
    store: Store,
    docId: string,
    ev: AnyEvaluator,
) => {
    const ds = store.getDocSession(docId, store.session);
    const state = store.getState();
    const doc = state.documents[docId];

    const cache = calculateIRs(doc, state, ev, ds);
    applySelectionText(ds.selections, cache);
    const layoutCache = calculateLayouts(doc, state, maxWidth, cache);
    const block = docToBlock(0, [], doc, state.toplevels, cache, layoutCache);

    const { txt, sourceMaps, dropTargets } = redrawWithSelection(
        block,
        ds.selections,
        ds.dragState,
        state,
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

function calculateLayouts(
    doc: Doc,
    state: PersistedState,
    maxWidth: number,
    cache: IRCache2<any>,
): Record<string, LayoutCtx['layouts']> {
    const layoutCache: Record<string, LayoutCtx['layouts']> = {};
    iterDocNodes(0, [], doc, (docNode, ids) => {
        const top = state.toplevels[docNode.toplevel];
        const pathRoot = root(doc.id, ids, docNode);
        iterTopNodes(top.root, pathRoot, top.nodes, (node, path) => {
            const ctx = layoutCtx(maxWidth, cache[top.id].irs);
            const choices: LayoutChoices = {};
            const result = layoutIR(
                0,
                0,
                cache[top.id].irs[top.root],
                choices,
                ctx,
            );
            ctx.layouts[top.root] = { choices, result };
            layoutCache[top.id] = ctx.layouts;
        });
    });
    return layoutCache;
}

export function calculateIRs(
    doc: Doc,
    state: PersistedState,
    ev: AnyEvaluator,
    ds: DocSession,
): IRCache2<any> {
    const cache: IRCache2<any> = {};
    iterDocNodes(0, [], doc, (docNode, ids) => {
        const top = state.toplevels[docNode.toplevel];
        const { paths, node } = topFromMap(top);
        const parsed = ev.parse(node, cursorLoc(ds.selections, top.id));
        const irs: IRForLoc = {};
        const pathRoot = root(doc.id, ids, docNode);

        iterTopNodes(top.root, pathRoot, top.nodes, (node, path) => {
            irs[node.loc] = nodeToIR(node, path, {
                styles: parsed.styles,
                layouts: parsed.layouts,
                tableHeaders: parsed.tableHeaders,
                names: {},
            });
        });
        cache[docNode.toplevel] = {
            irs,
            paths,
            root: pathRoot,
            result: parsed,
        };
    });
    return cache;
}

export function selectionStyleOverrides(
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
        } else if (
            selection.start.cursor.type === 'text' &&
            selection.start.cursor.start
        ) {
            const { start, end } = selection.start.cursor;
            if (start.index === end.index) {
                const key = blockSourceKey({
                    type: 'text',
                    path: selection.start.path,
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
        let tmp = path;
        while (tmp.children.length) {
            const node = top.nodes[lastChild(tmp)];
            if (isCollection(node) || node.type === 'table') {
                styles[nodeKey(tmp) + `:brace`] = {
                    type: 'full',
                    color:
                        num === 0
                            ? termColors.fullHighlight
                            : termColors.highlight,
                };
                if (++num >= 3) break;
            }
            tmp = parentPath(tmp);
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
export type RState = {
    cache: IRCache2<any>;
    sourceMaps: BlockEntry[];
    dropTargets: DropTarget[];
    block: Block;
    txt: string;
};
