// testingi t up
import { test, expect } from 'bun:test';
import { reader } from './reader';
import { parse } from './format';
import { Nodes, RecNode, Style, toMap } from '../shared/nodes';
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
    };

    const choices: LayoutChoices = {};
    const result = layoutIR(0, 0, irs[root], choices, ctx);
    ctx.layouts[root] = { choices, result };
    const txt = irToText(irs[root], irs, choices, ctx.layouts, ',');
    return { txt: '\n' + trimTrailingWhite(txt) + '\n', result, ctx, parsed };
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

test('basic wrap', () => {
    const { txt, result } = process(
        '(hello folks lets see how this goes and such like that)',
        20,
    );
    expect(txt).toMatchSnapshot();
});

test('let + pairs', () => {
    const { txt, result, ctx, parsed } = process(
        '(let [x y a b (one two three four five) 6] one two three)',
    );
    expect(txt).toMatchSnapshot();
});

test('nesty nest', () => {
    const { txt, result, ctx, parsed } = process(
        '(one two (three four five size) seven eight nine)',
        20,
    );
    expect(txt).toMatchSnapshot();
});

test('smol wrap', () => {
    const { txt, result, ctx, parsed } = process(
        '(one two seven eight nine ten eleven twelve thirteen fourteen)',
        15,
    );
    expect(txt).toMatchSnapshot();
});

test('stringsss', () => {
    const { txt } = process('"Here is a string"');
    expect(txt).toMatchSnapshot();
    const r2 = process('"Here ${is} a string"');
    expect(r2.txt).toMatchSnapshot();
});

// test('stringsss nl', () => {
//     const { txt } = process(
//         '"Here is a \nstring ${a} with things\nand such. ${(one two three)} you know."',
//     );
//     expect(txt).toMatchSnapshot();
// });

test('string long one', () => {
    const { txt } = process(
        '"Here is a string what in the world here we are it is good somewhat things-that tend-to-be splittable insufficiently"',
        20,
    );
    expect(txt).toMatchSnapshot();
});

test('long string with inclusions', () => {
    const { txt } = process(
        '"Here is a ${here} we are it is good somewhat things-that ${tend-to-be} splittable insufficiently"',
        20,
    );
    expect(txt).toMatchSnapshot();
});

test('gradual wrap', () => {
    const orig = //'(abc def ghi a)';
        '(a b c d e f g h i j ab ac ad ae af ag ah ai aj abc abcd abcde abcdef abcdefg)';
    const max = 20; // 20
    const min = 7;

    let res = '';
    for (let i = max; i > min; i--) {
        const { txt } = process(orig, i);
        res += Array(i).join('-') + '|\n';
        res += txt.trim() + '\n';
    }
    expect('\n' + res).toMatchSnapshot();
});

test('gradual wrap complex', () => {
    const orig = //'(abc def ghi a)';
        '(a b c d (e f g h i) j ab ac ad ae af ag ah ai aj abc abcd abcde abcdef abcdefg)';
    // '(a b c d e f g h i j ab ac ad ae af ag ah ai aj abc abcd abcde abcdef abcdefg)';
    const max = 20; // 20
    const min = 16;

    let res = '';
    for (let i = max; i > min; i--) {
        const { txt } = process(orig, i);
        res += Array(i).join('-') + '|\n';
        res += txt.trim() + '\n';
    }
    expect('\n' + res).toMatchSnapshot();
});

test('gradual string wrapp', () => {
    const orig = //'(abc def ghi a)';
        '"a b c d e f g h i j ab ac ad ae af\nag ah ai aj abc abcd abcde abcdef abcdefg"';
    const max = 20; // 20
    const min = 5;

    let res = '';
    for (let i = max; i > min; i--) {
        const { txt } = process(orig, i);
        res += Array(i).join('-') + '|\n';
        res += txt.trim() + '\n';
    }
    expect('\n' + res).toMatchSnapshot();
});

test('gradual string wrapp with simple inclusions', () => {
    const orig =
        '"e f g ${ac} ah ai aj ${abc} ab cd abc de ${abcdef} abcdefg ab cd ef gh"'; //'(abc def ghi a)';
    const max = 43; // 20
    const min = 20;

    let res = '';
    for (let i = max; i > min; i--) {
        const { txt } = process(orig, i);
        res += Array(i).join('-') + `| ${i}\n`;
        res += txt.trim() + '\n';
    }
    expect('\n' + res).toMatchSnapshot();
});

test('gradual string wrapp with simple inclusions', () => {
    const orig = '"${abcdef} aaa aaaaaaaaabcdnnnnnnnnnnnnnnh"'; //'(abc def ghi a)';
    const max = 35; // 43; // 20
    const min = 10;

    let res = '';
    for (let i = max; i > min; i--) {
        const { txt } = process(orig, i);
        res += Array(i).join('-') + `| ${i}\n`;
        res += txt.trim() + '\n';
    }
    expect('\n' + res).toMatchSnapshot();
});

test('gradual string wrapp with simple inclusions', () => {
    debugger;
    const orig =
        '"nnnnnnnnnnnnnnnnnnnnnnnnnnn ab cd ${abc} de ${abcdef} abcdefg ab cd ef gh"'; //'(abc def ghi a)';
    const max = 40; // 20
    const min = 39;

    let res = '';
    for (let i = max; i > min; i--) {
        const { txt } = process(orig, i);
        res += Array(i).join('-') + `| ${i}\n`;
        res += txt.trim() + '\n';
    }
    expect('\n' + res).toMatchSnapshot();
});
