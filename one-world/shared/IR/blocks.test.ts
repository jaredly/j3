// testingi t up
import { expect, test } from 'bun:test';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { parse } from '../../boot-ex/format';
import { reader } from '../../boot-ex/reader';
import { Control, IR, nodeToIR } from '../../shared/IR/intermediate';
import { LayoutChoices, LayoutCtx, layoutIR } from '../../shared/IR/layout';
import { Nodes, RecNode, Style, toMap } from '../../shared/nodes';
import { BlockEntry, blockToText } from './block-to-text';
import { highlightSpan } from './highlightSpan';
import { Block, irToBlock } from './ir-to-blocks';

const textLayout = (text: string, firstLine: number, style?: Style) => {
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
    };
};

const controlLayout = (control: Control) => {
    let w = 4;
    if (control.type === 'number') {
        w = control.width + 3;
    }
    return {
        height: 1,
        firstLineWidth: w,
        inlineHeight: 1,
        inlineWidth: w,
        maxWidth: w,
    };
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
    const block = irToBlock(irs[root], irs, choices, {
        space: ',',
        layouts: ctx.layouts,
        annotateNewlines: true,
        top: '',
    });
    const sourceMap: BlockEntry[] = [];
    const txt = blockToText({ x: 0, y: 0, x0: 0 }, block, {
        sourceMaps: sourceMap,
        color: false,
        styles: {},
    });
    return {
        txt,
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

// test('showing spans of string with inclusion', () => {
//     expect(
//         '\n' +
//             showSpans(
//                 '(What ok-folks js"abcd${what}here${(what and such js"ok" and stuff)}")',
//             ),
//     ).toMatchSnapshot();
// });

test('simple list', () => {
    expect(
        '\n' + showSpans('(what is)', 100).replaceAll('$', '!'),
    ).toMatchSnapshot();
});

test('list in inclusion', () => {
    expect(
        '\n' + showSpans('"${(what is)}"', 100).replaceAll('$', '!'),
    ).toMatchSnapshot();
});

test('wow ok so bigbug here', () => {
    expect(
        '\n' +
            showSpans(
                'js"sdfgsad${what}asdfjkljsdfk${(loveit and-what"${for}" -what you)}P{} sdfb"',
                100,
            ),
    ).toMatchSnapshot();
    expect(
        '\n' +
            showSpans(
                'js"sdfgsad${what}asdfjkljsdfk${(loveit and-what"${for}" -what you)}P{} sdfb"',
                20,
            ),
    ).toMatchSnapshot();
    expect('\n' + showSpans('"${(lov -sss)}NNN"', 10)).toMatchSnapshot();

    debugger;
    expect(
        '\n' +
            showLayout(
                // STOPSHIP:It should be wrapping before the $(loveit
                // ALSO: The trailing " is way too far out
                '(What js"${10}P n sdfb")',
                10,
            ),
    ).toMatchSnapshot();
    expect(
        '\n' +
            showLayout(
                // STOPSHIP:It should be wrapping before the $(loveit
                // ALSO: The trailing " is way too far out
                '(What js"${10}P nnsdfb")',
                10,
            ),
    ).toMatchSnapshot();

    expect(
        '\n' +
            showSpans(
                // STOPSHIP:It should be wrapping before the $(loveit
                // ALSO: The trailing " is way too far out
                '(What js"${what}asdfaASDJK ${(loveit and-what"${for}" -what you)}P{} sdfb")',
                10,
            ),
    ).toMatchSnapshot();
    expect(
        '\n' +
            showSpans(
                '(What ok-folks hs "" js"sdfasdf${what}asdfaASDJK${(loveit and-what"${for}" -what you)}P{} sdfb")',
                50,
            ),
    ).toMatchSnapshot();
});

test('template string', () => {
    expect('\n' + showSpans('nnnnnnnn"${lol}"')).toMatchSnapshot();
    expect('\n' + showSpans('nnnnnnnnnnnnnnnnn"${lol}"')).toMatchSnapshot();
});

test('small inline', () => {
    let res = [];
    for (let i = 10; i < 20; i++) {
        res.push(showSpans('"One ${two} three"', i));
    }
    expect('\n' + res.join('\n')).toMatchSnapshot();
    // expect('\n' + showSpans('nnnnnnnnnnnnnnnnn"${lol}"')).toMatchSnapshot();
});

const fixDollar = (txt: string) =>
    splitGraphemes(txt)
        .map((t) => (t === '$' ? '!' : t))
        .join('');

export const blockInfo = (block: Block): string => {
    let res = `${block.width}x${block.height}`;
    if (block.type === 'inline') {
        if (typeof block.contents === 'string') {
            res += 'T';
        } else {
            res += `(${block.contents
                .map((line) => line.map(blockInfo).join('|'))
                .join('↩')})`;
        }
    } else if (block.type === 'block') {
        res += `[${block.contents
            .map(blockInfo)
            .join(block.horizontal === false ? '|' : '-')}]`;
    } else {
        res += '[||]';
    }
    return res;
};

function showLayout(orig: string, width = 20, x = false) {
    let res = Array(width).join('-') + `| ${width}\n`;
    const { txt, block, sourceMap } = process(orig, width);
    res += trimTrailingWhite(fixDollar(txt)) + '\n\n';
    return res;
}

function showSpans(orig: string, width = 20, x = false) {
    let res = Array(width).join('-') + `| ${width}\n`;
    const { txt, block, sourceMap } = process(orig, width);
    res += trimTrailingWhite(fixDollar(txt)) + '\n\n';

    if (x) {
        res += blockInfo(block) + '\n\n';
    }

    sourceMap.forEach((item) => {
        res += `[ # ] ` + JSON.stringify(item.shape) + '\n';
        res +=
            trimTrailingWhite(fixDollar(highlightSpan(txt, item.shape))) + '\n';
    });
    if (x) {
        res += JSON.stringify(block, null, 2);
    }
    return res;
}
