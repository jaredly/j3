import { IRSelection } from '../../shared/IR/intermediate';
import {
    Block,
    vblock,
    hblock,
    line,
    irToBlock,
} from '../../shared/IR/ir-to-blocks';
import { white } from '../../shared/IR/ir-to-text';
import { LayoutCtx, LayoutChoices, layoutIR } from '../../shared/IR/layout';
import { IRCache2 } from '../../shared/IR/nav';
import { PathRoot } from '../../shared/nodes';
import { Doc, PersistedState } from '../../shared/state';
import { applySelectionText } from './docNodeToIR';
import { controlLayout, textLayout } from './drawDocNode';

export const drawDocNode2 = <Top>(
    id: number,
    nodes: number[],
    doc: Doc,
    state: PersistedState,
    cache: IRCache2<Top>,
    selections: IRSelection[],
    maxWidth: number,
): Block => {
    const node = doc.nodes[id];
    let top: Block | null = null;
    if (id !== 0) {
        top = drawToplevel2(
            node.toplevel,
            {
                doc: doc.id,
                ids: nodes.concat([id]),
                toplevel: node.toplevel,
                type: 'doc-node',
            },
            state.toplevels[node.toplevel].root,
            cache,
            selections,
            maxWidth,
        );
    }
    if (node.children.length) {
        const children = node.children.map((cid) =>
            drawDocNode2(
                cid,
                nodes.concat([id]),
                doc,
                state,
                cache,
                selections,
                maxWidth,
            ),
        );
        if (top == null) {
            return children.length === 1 ? children[0] : vblock(children);
        }
        return vblock([top, hblock([line(white(4)), vblock(children)])]);
    }

    return top!;
};
const drawToplevel2 = <Top>(
    id: string,
    root: PathRoot,
    rootLoc: number,
    cache: IRCache2<Top>,
    selections: IRSelection[],
    maxWidth: number,
) => {
    applySelectionText(selections, cache);

    const ctx: LayoutCtx = {
        maxWidth,
        leftWidth: maxWidth / 2,
        irs: cache[id].irs,
        layouts: {},
        textLayout,
        controlLayout,
    };

    const choices: LayoutChoices = {};
    const result = layoutIR(0, 0, cache[id].irs[rootLoc], choices, ctx);
    ctx.layouts[rootLoc] = { choices, result };

    const block = irToBlock(cache[id].irs[rootLoc], cache[id].irs, choices, {
        layouts: ctx.layouts,
        space: ' ',
        top: id,
    });
    block.node = { root: root, children: [rootLoc] };

    return hblock([line('▶️ '), block]);
};
