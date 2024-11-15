import { ParseResult } from '../../evaluators/boot-ex/types';
import { blockToABlock } from '../../shared/IR/block-to-attributed-text';
import {
    Block,
    hblock,
    irToBlock,
    line,
    vblock,
} from '../../shared/IR/ir-to-blocks';
import { white } from '../../shared/IR/ir-to-text';
import {
    IRForLoc,
    LayoutChoices,
    LayoutCtx,
    layoutIR,
} from '../../shared/IR/layout';
import { IRCache2 } from '../../shared/IR/nav';
import { Loc, Nodes, PathRoot, RecNode, toMap } from '../../shared/nodes';
import { Doc, DocSelection, getTop, PersistedState } from '../../shared/state2';
import { createIRCache } from '../TextEdit/actions';
import { termColors } from '../TextEdit/colors';
import { controlLayout, textLayout } from './textLayout';

export type BlockConfig = {
    showRefHashes?: boolean;
};

export const docToBlock = <Top>(
    id: number,
    ids: number[],
    doc: Doc,
    state: PersistedState,
    cache: IRCache2<Top>,
    layoutCache: Record<string, LayoutCtx['layouts']>,
    selections: DocSelection[],
    config?: BlockConfig,
): Block => {
    const node = doc.nodes[id];
    let top: Block | null = null;
    const selfIds = ids.concat([id]);
    if (id !== 0) {
        const root: PathRoot = {
            doc: doc.id,
            ids: selfIds,
            toplevel: node.toplevel,
            type: 'doc-node',
        };
        let nsText = null; // node.namespace;
        const sel = selections.find(
            (s) => s.type === 'namespace' && s.root.toplevel === node.toplevel,
        );
        if (sel?.type === 'namespace' && sel.text != null) {
            nsText = sel.text.join('');
        }
        const toplevel = getTop(state, doc.id, node.toplevel);
        const items = [
            drawToplevel(
                node.toplevel,
                root,
                toplevel.root,
                cache[node.toplevel].irs,
                layoutCache[node.toplevel],
                toplevel.nextLoc,
                config,
            ),
        ];
        if (nsText || sel?.type === 'namespace') {
            items.unshift(
                line(
                    nsText ?? '',
                    {
                        type: 'namespace',
                        path: { root, children: [] },
                    },
                    {
                        fontStyle: nsText != null ? undefined : 'italic',
                    },
                ),
            );
        }
        const output = cache[node.toplevel].output;
        if (output?.type === 'success') {
            items.push(
                line(
                    typeof output.value === 'function'
                        ? '<function>'
                        : JSON.stringify(output.value) ?? '',
                    undefined,
                    { color: { r: 100, g: 150, b: 200 } },
                ),
            );
        } else if (output?.type === 'error') {
            items.push(
                line('failed to execute: ' + output.text, undefined, {
                    color: { r: 100, g: 50, b: 50 },
                }),
            );
        }
        top = vblock(items);
    }
    if (node.children.length) {
        const children = node.children.map((cid) =>
            docToBlock(
                cid,
                selfIds,
                doc,
                state,
                cache,
                layoutCache,
                selections,
            ),
        );
        if (top == null) {
            return children.length === 1 ? children[0] : vblock(children);
        }
        return vblock([top, hblock([line(white(4)), vblock(children)])]);
    }

    if (top == null) {
        return line('no top, no thing');
    }

    return top!;
};

export const SHOW_IDS = false;

export const recNodeToBlock = (
    node: RecNode,
    result: ParseResult<any>,
    maxWidth: number,
    getName?: (loc: Loc) => string | null,
) => {
    const nodes: Nodes = {};
    const root = toMap(node, nodes);
    const irs = createIRCache(
        root,
        nodes,
        { doc: '', ids: [], toplevel: '', type: 'doc-node' },
        result,
        getName,
    );

    const ctx = layoutCtx(maxWidth, irs);
    const choices: LayoutChoices = {};
    layoutIR(0, 0, irs[root], choices, ctx);

    const block = irToBlock(irs[root], irs, choices, {
        layouts: ctx.layouts,
        space: ' ',
        top: 'top',
    });
    return block;
};

// Only for debug n stuff I guess
export const recNodeToText = (
    node: RecNode,
    result: ParseResult<any>,
    maxWidth: number,
    getName?: (loc: Loc) => string | null,
) => {
    return blockToABlock(
        { x: 0, y: 0, x0: 0 },
        recNodeToBlock(node, result, maxWidth, getName),
        { styles: {} },
    );
};

export const drawToplevel = (
    id: string,
    root: PathRoot,
    rootLoc: number,
    irs: IRForLoc,
    layoutCache: LayoutCtx['layouts'],
    next: number,
    config?: BlockConfig,
) => {
    const block = irToBlock(irs[rootLoc], irs, layoutCache[rootLoc].choices, {
        layouts: layoutCache,
        space: ' ',
        top: id,
        showRefHashes: config?.showRefHashes,
    });
    block.node = { root: root, children: [rootLoc] };
    let prefix = '';
    if (SHOW_IDS) prefix += next + ' ';
    return hblock([
        { type: 'bullet', width: 2, height: 1, kind: 'toplevel-arrow' },
        line(prefix, undefined, {
            color: termColors.topHandle,
        }),
        block,
    ]);
};

export const layoutCtx = (maxWidth: number, irs: IRForLoc): LayoutCtx => ({
    maxWidth,
    leftWidth: maxWidth / 2,
    irs,
    layouts: {},
    textLayout,
    controlLayout,
});
