// testingi t up
import { test, expect } from 'bun:test';
import { reader } from '../../boot-ex/reader';
import { parse } from '../../boot-ex/format';
import { Nodes, RecNode, Style, toMap } from '../../shared/nodes';
import { Control, IR, nodeToIR } from '../../shared/IR/intermediate';
import { LayoutChoices, LayoutCtx, layoutIR } from '../../shared/IR/layout';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { irToText, joinChunks, maxLength } from '../../shared/IR/ir-to-text';
import { irToBlock } from './ir-to-blocks';
import { blockToText } from './block-to-text';

const textLayout = (text: string, firstLine: number, style?: Style) => {
    const lines = text.split('\n');
    const height = lines.length;
    const inlineHeight = 1;
    let inlineWidth = firstLine;
    let maxWidth = 0;
    lines.forEach((line, i) => {
        inlineWidth = splitGraphemes(line).length;
        if (i === 0) inlineWidth += firstLine;
        maxWidth = Math.max(maxWidth, inlineWidth);
    });
    return { height, inlineHeight, inlineWidth, maxWidth };
};

const controlLayout = (control: Control) => {
    let w = 4;
    if (control.type === 'number') {
        w = control.width + 3;
    }
    return { height: 1, inlineHeight: 1, inlineWidth: w, maxWidth: w };
};

const processNode = (data: RecNode, maxWidth = 30, leftWidth = 20) => {
    const nodes: Nodes = {};
    const parsed = parse(data);
    const root = toMap(data, nodes);
    const irs: Record<number, IR> = {};
    Object.entries(nodes).forEach(([id, node]) => {
        irs[+id] = nodeToIR(node, parsed.styles, parsed.layouts, {});
    });

    const ctx: LayoutCtx = {
        maxWidth,
        leftWidth,
        irs,
        layouts: {},
        textLayout,
        controlLayout,
    };

    const choices: LayoutChoices = {};
    const result = layoutIR(0, 0, irs[root], choices, ctx);
    ctx.layouts[root] = { choices, result };
    const block = irToBlock(irs[root], irs, choices, null, {
        space: ',',
        layouts: ctx.layouts,
        annotateNewlines: true,
        sourceMap: {},
    });
    const txt = blockToText(block);
    return {
        txt: '\n' + trimTrailingWhite(txt) + '\n',
        result,
        ctx,
        parsed,
        block,
    };
};

const process = (text: string, maxWidth = 30, leftWidth = 20) => {
    const data = reader(text, 'a-top');
    if (!data) {
        throw new Error('nothing parsed');
    }
    return processNode(data, maxWidth, leftWidth);
};

const trimTrailingWhite = (txt: string) =>
    txt
        .split('\n')
        .map((t) => t.trimEnd())
        .join('\n');

test('gradual string wrapp with simple inclusions', () => {
    const orig =
        '"nnnnnn nnnnnnnn nnnnnnnnnnn ab cd ${abc} de ${abcdef} abcdefg ab cd ef gh"'; //'(abc def ghi a)';
    const max = 40; // 20
    const min = 20;

    let res = '';
    for (let i = max; i > min; i--) {
        const { txt, block } = process(orig, i);
        res += Array(i).join('-') + `| ${i}\n`;
        res += txt.trim() + '\n';
        res += `${block.width}x${block.height}\n`;
        // res += JSON.stringify(block, null, 2);
    }
    expect('\n' + res).toMatchSnapshot();
});
