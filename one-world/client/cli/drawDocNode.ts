import {
    Block,
    hblock,
    irToBlock,
    line,
    vblock,
} from '../../shared/IR/ir-to-blocks';
import { white } from '../../shared/IR/ir-to-text';
import { IRForLoc, LayoutCtx } from '../../shared/IR/layout';
import { IRCache2 } from '../../shared/IR/nav';
import { PathRoot } from '../../shared/nodes';
import { Doc, DocSelection, PersistedState } from '../../shared/state2';
import { controlLayout, textLayout } from './textLayout';

export const docToBlock = <Top>(
    id: number,
    ids: number[],
    doc: Doc,
    toplevels: PersistedState['toplevels'],
    cache: IRCache2<Top>,
    layoutCache: Record<string, LayoutCtx['layouts']>,
    selections: DocSelection[],
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
        let nsText = node.namespace;
        const sel = selections.find(
            (s) => s.type === 'namespace' && s.root.toplevel === node.toplevel,
        );
        if (sel?.type === 'namespace' && sel.text != null) {
            nsText = sel.text.join('');
        }
        top = vblock([
            line(
                nsText ?? 'namespace',
                {
                    type: 'namespace',
                    path: { root, children: [] },
                },
                {
                    fontStyle: nsText != null ? undefined : 'italic',
                },
            ),
            drawToplevel(
                node.toplevel,
                root,
                toplevels[node.toplevel].root,
                cache[node.toplevel].irs,
                layoutCache[node.toplevel],
                toplevels[node.toplevel].nextLoc,
            ),
        ]);
    }
    if (node.children.length) {
        const children = node.children.map((cid) =>
            docToBlock(
                cid,
                selfIds,
                doc,
                toplevels,
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

    return top!;
};

export const SHOW_IDS = false;

export const drawToplevel = (
    id: string,
    root: PathRoot,
    rootLoc: number,
    irs: IRForLoc,
    layoutCache: LayoutCtx['layouts'],
    next: number,
) => {
    const block = irToBlock(irs[rootLoc], irs, layoutCache[rootLoc].choices, {
        layouts: layoutCache,
        space: ' ',
        top: id,
    });
    block.node = { root: root, children: [rootLoc] };
    let prefix = '▶️ ';
    if (SHOW_IDS) prefix += next + ' ';
    return hblock([line(prefix), block]);
};

export const layoutCtx = (maxWidth: number, irs: IRForLoc): LayoutCtx => ({
    maxWidth,
    leftWidth: maxWidth / 2,
    irs,
    layouts: {},
    textLayout,
    controlLayout,
});
