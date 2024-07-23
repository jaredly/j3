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
import { BlockEntry, blockToText } from './block-to-text';
import { highlightSpan } from './highlightSpan';

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
        top: '',
    });
    const sourceMap: BlockEntry[] = [];
    const txt = blockToText({ x: 0, y: 0, x0: 0 }, block, sourceMap);
    return {
        txt: trimTrailingWhite(txt),
        result,
        ctx,
        parsed,
        block,
        sourceMap,
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

test('showing spans of simple string', () => {
    expect('\n' + showSpans('"hi"')).toMatchSnapshot();
});

test('showing spans of id', () => {
    expect('\n' + showSpans('hi')).toMatchSnapshot();
});

test('showing spans of string with tag', () => {
    expect('\n' + showSpans('js"hi"')).toMatchSnapshot();
});

test('showing spans of string with inclusion', () => {
    expect('\n' + showSpans('"hi${abc}ho"')).toMatchSnapshot();
});

test('showing spans of wrap string', () => {
    expect(
        '\n' + showSpans('"Hello folks this will wrap, thanks."'),
    ).toMatchSnapshot();
});

test('showing spans of wrap string, short last', () => {
    expect('\n' + showSpans('"Hello folks this will wrap."')).toMatchSnapshot();
});

test('showing spans of wrap string, short last', () => {
    expect(
        '\n' + showSpans('"Hello folks this will ${a} wrap."'),
    ).toMatchSnapshot();
});

test('text with wrap on inclusion', () => {
    expect(
        '\n' + showSpans('"Hello folks ${this} will wrap."'),
    ).toMatchSnapshot();
});

test('highlight over wrap', () => {
    expect('\n' + showSpans('"Hello ${folks} this will."')).toMatchSnapshot();
});

test('showing spans of string with inclusion', () => {
    expect(
        '\n' + showSpans('"hi this is ${a} something ${abc} that will wrap"'),
    ).toMatchSnapshot();
});

const fixDollar = (txt: string) =>
    splitGraphemes(txt)
        .map((t) => (t === '$' ? '＄' : t))
        .join('');

function showSpans(orig: string, x = false) {
    let res = '';
    const { txt, block, sourceMap } = process(orig, 20);
    res += fixDollar(txt) + '\n\n';
    sourceMap.forEach((item) => {
        res += `[ # ] ` + JSON.stringify(item.shape) + '\n';
        res += fixDollar(highlightSpan(txt, item.shape)) + '\n';
    });
    if (x) {
        res += JSON.stringify(block, null, 2);
    }
    return res;
}
