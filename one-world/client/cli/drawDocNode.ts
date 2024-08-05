import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { parse } from '../../boot-ex/format';
import {
    Control,
    IR,
    IRSelection,
    nodeToIR,
} from '../../shared/IR/intermediate';
import {
    Block,
    vblock,
    hblock,
    line,
    irToBlock,
} from '../../shared/IR/ir-to-blocks';
import { white } from '../../shared/IR/ir-to-text';
import { LayoutCtx, LayoutChoices, layoutIR } from '../../shared/IR/layout';
import { IRCache, irNavigable, lastChild } from '../../shared/IR/nav';
import { Style, PathRoot, fromMap, childLocs, Loc } from '../../shared/nodes';
import { Doc, PersistedState } from '../../shared/state';

export const drawDocNode = (
    id: number,
    nodes: number[],
    doc: Doc,
    state: PersistedState,
    cache: IRCache,
    selections: IRSelection[],
    maxWidth: number,
): Block => {
    const node = doc.nodes[id];
    let top: Block | null = null;
    if (id !== 0) {
        top = drawToplevel(
            node.toplevel,
            {
                doc: doc.id,
                ids: nodes.concat([id]),
                toplevel: node.toplevel,
                type: 'doc-node',
            },
            state,
            cache,
            selections,
            maxWidth,
        );
        return top;
    }
    if (node.children.length) {
        const children = node.children.map((cid) =>
            drawDocNode(
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

export const textLayout = (text: string, firstLine: number, style?: Style) => {
    const lines = text.split('\n');
    const height = lines.length;
    const inlineHeight = 1;
    let inlineWidth = firstLine;
    let maxWidth = 0;
    let firstLineWidth = 0;
    lines.forEach((line, i) => {
        inlineWidth = splitGraphemes(line).length;
        if (i === 0) {
            firstLineWidth = inlineWidth + firstLine;
        }
        if (i === 0) inlineWidth += firstLine;
        maxWidth = Math.max(maxWidth, inlineWidth);
    });
    return {
        height,
        inlineHeight,
        inlineWidth,
        maxWidth,
        firstLineWidth,
        multiLine: lines.length > 1,
    };
};

export const controlLayout = (control: Control) => {
    let w = 4;
    if (control.type === 'number') {
        w = control.width + 3;
    }
    return {
        height: 1,
        inlineHeight: 1,
        firstLineWidth: w,
        inlineWidth: w,
        maxWidth: w,
    };
};

const drawToplevel = (
    id: string,
    root: PathRoot,
    state: PersistedState,
    cache: IRCache,
    selections: IRSelection[],
    maxWidth: number,
) => {
    const top = state.toplevels[id];
    const paths: Record<number, number[]> = {};
    const recNode = fromMap((n) => [[top.id, n]] as Loc, top.root, top.nodes, {
        children: [],
        map: paths,
    });
    const parsed = parse(recNode);

    const irs: Record<number, IR> = {};

    const process = (id: number, path: number[]) => {
        irs[id] = nodeToIR(
            top.nodes[id],
            path,
            parsed.styles,
            parsed.layouts,
            {},
        );
        const children = childLocs(top.nodes[id]);
        const childPath = path.concat([id]);
        children.forEach((child) => process(child, childPath));
    };
    process(top.root, []);

    // Object.entries(top.nodes).forEach(([id, node]) => {
    //     irs[+id] = nodeToIR(node, parsed.styles, parsed.layouts, {});
    // });

    selections.forEach((sel) => {
        if (sel.start.path.root.toplevel != id) return;
        if (
            sel.start.cursor.type === 'text' &&
            sel.start.cursor.end.text != null
        ) {
            const loc = lastChild(sel.start.path);
            const texts = irNavigable(irs[loc]).filter(
                (t) => t.type === 'text',
            ) as Extract<IR, { type: 'text' }>[];
            const one = texts[sel.start.cursor.end.index];
            one.text = sel.start.cursor.end.text.join('');
        }
    });

    const ctx: LayoutCtx = {
        maxWidth,
        leftWidth: maxWidth / 2,
        irs,
        layouts: {},
        textLayout,
        controlLayout,
    };

    const choices: LayoutChoices = {};
    const result = layoutIR(0, 0, irs[top.root], choices, ctx);
    ctx.layouts[top.root] = { choices, result };
    const block = irToBlock(irs[top.root], irs, choices, {
        layouts: ctx.layouts,
        space: ' ',
        top: id,
    });
    block.node = { top: id, loc: top.root };

    cache[id] = { irs, layouts: ctx.layouts, paths, root };
    return hblock([line('▶️ '), block]);
};
