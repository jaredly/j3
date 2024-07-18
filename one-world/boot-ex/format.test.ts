// testingi t up
import { test, expect } from 'bun:test';
import { reader } from './reader';
import { parse } from './format';
import { Nodes, Style, toMap } from '../shared/nodes';
import { IR, nodeToIR } from '../shared/IR/intermediate';
import { LayoutChoices, LayoutCtx, layoutIR } from '../shared/IR/layout';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { irToText, joinChunks, maxLength } from '../shared/IR/ir-to-text';

test('joinChunks', () => {
    expect(joinChunks(['a', 'b'])).toBe('ab');
    expect(joinChunks(['a\nc', 'b'])).toBe('ab\nc');
    expect(joinChunks(['a\ncd', 'b'])).toBe('a b\ncd');
    expect(joinChunks(['a\ncd', 'b', 'abc\na'])).toBe('a babc\ncd a');
});

const textLayout = (text: string, dedent: number, style?: Style) => {
    const lines = text.split('\n');
    const height = lines.length;
    const inlineHeight = 1;
    let inlineWidth = 0;
    let maxWidth = 0;
    lines.forEach((line) => {
        inlineWidth = splitGraphemes(line).length;
        maxWidth = Math.max(maxWidth, inlineWidth);
    });
    return { height, inlineHeight, inlineWidth, maxWidth };
};

const process = (text: string, maxWidth = 30, leftWidth = 20) => {
    const data = reader(text, 'a-top');
    if (!data) {
        throw new Error('nothing parsed');
    }
    const parsed = parse(data);
    const nodes: Nodes = {};
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
    };

    const choices: LayoutChoices = {};
    const result = layoutIR(0, 0, irs[root], choices, ctx);
    ctx.layouts[root] = { choices, result };
    const txt = irToText(irs[root], irs, choices, ctx.layouts, '•');
    return { txt: trimTrailingWhite(txt), result, ctx, parsed };
};

const trimTrailingWhite = (txt: string) =>
    txt
        .split('\n')
        .map((t) => t.trimEnd())
        .join('\n');

test('opk', () => {
    const { txt, result } = process(
        '(hello folks lets see how this goes and such like that)',
        30,
    );
    expect(txt).toMatchSnapshot();
    // expect(result).toMatchSnapshot();
});

test('let', () => {
    const { txt, result, ctx, parsed } = process('(let [x y] one two three)');
    expect(txt).toMatchSnapshot();
});

test('nesty nest', () => {
    const { txt, result, ctx, parsed } = process(
        '(one two (three four five size) seven eight nine)',
        30,
    );
    expect(txt).toMatchSnapshot();
});

test('smol wrap', () => {
    const { txt, result, ctx, parsed } = process(
        '(one two seven eight nine ten)',
        20,
    );
    expect(txt).toMatchSnapshot();
});
