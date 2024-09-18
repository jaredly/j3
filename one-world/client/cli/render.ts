import objectHash from 'object-hash';
import { AnyEvaluator } from '../../evaluators/boot-ex/types';
import { init, parse } from '../../graphh/by-hand';
import {
    BlockEntry,
    DropTarget,
    StyleOverrides,
} from '../../shared/IR/block-to-text';
import { nodeToIR } from '../../shared/IR/intermediate';
import { Block, blockSourceKey } from '../../shared/IR/ir-to-blocks';
import {
    IRForLoc,
    LayoutChoices,
    LayoutCtx,
    layoutIR,
} from '../../shared/IR/layout';
import { IRCache2, lastChild, ParseAndEval } from '../../shared/IR/nav';
import {
    Loc,
    mapNode,
    parentPath,
    Path,
    PathRoot,
    pathWithChildren,
    RecNode,
    serializePath,
} from '../../shared/nodes';
import {
    Doc,
    DocSelection,
    DocSession,
    DocumentNode,
    PersistedState,
} from '../../shared/state2';
import { Toplevel } from '../../shared/toplevels';
import { Store } from '../StoreContext2';
import { isCollection } from '../TextEdit/actions';
import { termColors } from '../TextEdit/colors';
import {
    applySelectionText,
    iterDocNodes,
    iterTopNodes,
    topFromMap,
} from './docNodeToIR';
import { docToBlock, layoutCtx } from './drawDocNode';
import { Terminal } from './drawToTerminal';
import { MultiSelect, resolveMultiSelect } from './resolveMultiSelect';
import { selectionLocation } from './selectionLocation';
import { blockToText } from '../../shared/IR/block-to-attributed-text';

export const selectionPos = (
    store: Store,
    docId: string,
    sourceMaps: BlockEntry[],
    nodeStart = false,
) => {
    const ds = store.getDocSession(docId, store.session);
    if (ds.selections.length) {
        const sel = ds.selections[0];
        const result = selectionLocation(sourceMaps, sel);
        if (nodeStart) {
            return result?.source.shape.start;
        }
        return result?.pos;
    }
};

export const renderSelection = (
    term: Terminal,
    store: Store,
    docId: string,
    sourceMaps: BlockEntry[],
) => {
    const pos = selectionPos(store, docId, sourceMaps);
    if (pos) {
        term.moveTo(pos[0] + 1, pos[1] + 1);
    }
};

const root = (doc: string, ids: number[], node: DocumentNode): PathRoot => ({
    type: 'doc-node',
    toplevel: node.toplevel,
    doc,
    ids,
});

const cursorLoc = (
    selections: DocSelection[],
    id: string,
): number | undefined => {
    for (let sel of selections) {
        if (sel.type !== 'ir') return;
        if (sel.end) return;
        if (
            sel.start.cursor.type === 'text' &&
            sel.start.path.root.toplevel === id
        ) {
            return lastChild(sel.start.path);
        }
    }
};

export type EvalCache = Record<string, any>;

export const render = (
    maxWidth: number,
    store: Store,
    docId: string,
    parseAndEval: ParseAndEval<any>,
): RState => {
    const ds = store.getDocSession(docId, store.session);
    const state = store.getState();
    const doc = state.documents[docId];

    // The IRs
    const cache = calculateIRs(doc, state, ds, parseAndEval);

    applySelectionText(ds.selections, cache);
    const layoutCache = calculateLayouts(doc, state, maxWidth, cache);
    const block = docToBlock(
        0,
        [],
        doc,
        state.toplevels,
        cache,
        layoutCache,
        ds.selections,
    );

    const { txt, sourceMaps, dropTargets } = redrawWithSelection(
        block,
        ds.selections,
        ds.dragState,
        state,
    );
    return { cache, sourceMaps, dropTargets, block, txt, parseAndEval };
};

export const redrawWithSelection = (
    block: Block,
    selections: DocSelection[],
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

function makeRunNode(
    top: Toplevel,
    texts: Record<number, { text: string[]; index: number }>,
): (node: RecNode) => RecNode | false {
    return (node) => {
        if (
            node.loc.length === 1 &&
            node.loc[0][0] === top.id &&
            texts[node.loc[0][1]]
        ) {
            const repl = texts[node.loc[0][1]];
            if (node.type === 'id') {
                const text = repl.text.join('');
                if (text !== node.text) {
                    return {
                        ...node,
                        text: repl.text.join(''),
                        ref: undefined,
                    };
                }
            }
            if (node.type === 'string') {
                if (repl.index === 0) {
                    return { ...node, first: repl.text.join('') };
                }
                const tpl = node.templates.slice();
                tpl[repl.index - 1] = {
                    ...tpl[repl.index - 1],
                    suffix: repl.text.join(''),
                };
                return { ...node, templates: tpl };
            }
        }
        return node;
    };
}

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

export const parseAndCache = (
    store: Store,
    docId: string,
    oldCache: ParseAndEval<unknown>,
    // state: PersistedState,
    // doc: Doc,
    // ds: DocSession,
    ev: AnyEvaluator,
) => {
    const state = store.getState();
    const doc = state.documents[docId];
    const ds = store.getDocSession(docId);
    const { ctx, caches } = init();
    const parseCache: ParseAndEval<unknown> = {};

    iterDocNodes(0, [], doc, (docNode) => {
        const top = state.toplevels[docNode.toplevel];
        const { paths, node } = topFromMap(top);

        let texts: Record<number, { text: string[]; index: number }> = {};
        let found = false;
        ds.selections.forEach((sel) => {
            if (
                sel.type === 'ir' &&
                sel.start.cursor.type === 'text' &&
                sel.start.path.root.toplevel === docNode.toplevel &&
                sel.start.cursor.end.text
            ) {
                found = true;
                texts[lastChild(sel.start.path)] = {
                    text: sel.start.cursor.end.text,
                    index: sel.start.cursor.end.index,
                };
            }
        });

        let runNode = node;
        if (found) {
            runNode = mapNode(node, makeRunNode(top, texts));
        }

        // const parsed = ev.parse(node, cursorLoc(ds.selections, top.id));
        ctx.tops[top.id] = { hash: objectHash(runNode), node: runNode };
        const parseResult = parse(
            top.id,
            ctx,
            caches,
            ev,
            cursorLoc(ds.selections, top.id),
        );

        parseCache[top.id] = {
            node,
            paths,
            parseResult: parseResult.result,
        };
        if (oldCache[top.id]) {
            parseCache[top.id].output = oldCache[top.id].output;
        }
    });

    return { parseCache, caches, ctx };
};

export function calculateIRs(
    doc: Doc,
    state: PersistedState,
    ds: DocSession,
    parseCache: ParseAndEval<unknown>,
): IRCache2<any> {
    const cache: IRCache2<any> = {};

    iterDocNodes(0, [], doc, (docNode, ids) => {
        const top = state.toplevels[docNode.toplevel];

        const { parseResult: parsed } = parseCache[docNode.toplevel];

        const irs: IRForLoc = {};
        const pathRoot = root(doc.id, ids, docNode);

        iterTopNodes(top.root, pathRoot, top.nodes, (node, path) => {
            irs[node.loc] = nodeToIR(node, path, {
                styles: parsed.styles,
                layouts: parsed.layouts,
                tableHeaders: parsed.tableHeaders,
                getName: getName(state, ds),
            });
        });
        cache[docNode.toplevel] = {
            irs,
            root: pathRoot,
            result: parsed,
            output: parseCache[docNode.toplevel].output,
        };
    });

    return cache;
}

function getName(
    state: PersistedState,
    ds: DocSession,
): (loc: Loc) => string | null {
    return (loc) => {
        if (loc.length > 1) return null;
        const [tid, idx] = loc[0];
        // TODO THis will not work with macros.
        // we'll have to do the actual graph resolution for that.
        const node = state.toplevels[tid].nodes[idx];
        if (!node) return null;
        const sel = ds.selections.find(
            (s) =>
                s.type === 'ir' &&
                s.start.path.root.toplevel === tid &&
                lastChild(s.start.path) === idx,
        );
        if (
            sel &&
            sel.type === 'ir' &&
            sel.start.cursor.type === 'text' &&
            sel.start.cursor.end.text
        ) {
            return sel.start.cursor.end.text.join('');
        }
        // HRM ok so ... what if we want to report the ... temporary name?
        // seemsl ike that would be nice.
        return node.type === 'id' ? node.text : null;
    };
}

export function selectionStyleOverrides(
    selections: DocSelection[],
    dragState: DocSession['dragState'],
    state: PersistedState,
) {
    const styles: StyleOverrides = {};
    selections.forEach((selection) => {
        if (selection.type !== 'ir') return;
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
    parseAndEval: ParseAndEval<any>;
    sourceMaps: BlockEntry[];
    dropTargets: DropTarget[];
    block: Block;
    txt: string;
};
