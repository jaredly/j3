// testingi t up
import { expect, test } from 'bun:test';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { parse } from '../../boot-ex/format';
import { reader } from '../../boot-ex/reader';
import { controlLayout, textLayout } from '../../client/cli/drawDocNode';
import { IR, nodeToIR } from '../../shared/IR/intermediate';
import { LayoutChoices, LayoutCtx, layoutIR } from '../../shared/IR/layout';
import {
    childLocs,
    Nodes,
    Path,
    PathRoot,
    pathWithChildren,
    RecNode,
    toMap,
} from '../../shared/nodes';
import { BlockEntry, blockToText } from './block-to-text';
import { highlightSpan } from './highlightSpan';
import { Block, irToBlock } from './ir-to-blocks';

const processNode = (
    data: RecNode,
    pathRoot: PathRoot,
    maxWidth = 30,
    leftWidth = 20,
) => {
    const nodes: Nodes = {};
    const parsed = parse(data);
    const root = toMap(data, nodes);
    const irs: Record<number, IR> = {};

    const process = (id: number, path: Path) => {
        const self = pathWithChildren(path, id);
        irs[id] = nodeToIR(nodes[id], self, parsed.styles, parsed.layouts, {});
        const children = childLocs(nodes[id]);
        children.forEach((child) => process(child, self));
    };
    process(root, { root: pathRoot, children: [] });

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
    return processNode(
        data,
        { type: 'doc-node', doc: '', ids: [], toplevel: '' },
        maxWidth,
        leftWidth,
    );
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
});

test('one wrap', () => {
    let res = [];
    for (let i = 12; i >= 7; i--) {
        res.push(showLayout('(one two 3)', i));
    }
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('nested wraps', () => {
    let res = [];
    for (let i = 21; i >= 15; i--) {
        res.push(showLayout('(one two (three four five) six seven)', i));
    }
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('string with newlines', () => {
    let res = [];
    res.push(showSpans('(one "Hello\nYall" two)', 20));
    res.push(showSpans('"Hello\nYall"', 20));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('wrap after interpolation', () => {
    let res = [];
    for (let i = 12; i >= 10; i--) {
        res.push(showLayout('"${abc} A B three four"', i));
    }
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('simple a/b', () => {
    let res = [];
    res.push(showSpans('"A\nB"', 20));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('simple a/b with interp', () => {
    debugger;
    let res = [];
    res.push(showSpans('"${0}A\nB"', 20));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('string with newlines in interp', () => {
    let res = [];
    res.push(showSpans('"A${"B\nC"}D E F"', 20));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('pairs placement?', () => {
    let res = [];
    res.push(showSpans('(let [a b] ))', 10));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('try a table maybe', () => {
    let res = [];
    res.push(showSpans('(|lol|folks\nhi  |ho\n(lol what)|)', 10));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

const fixDollar = (txt: string) =>
    splitGraphemes(txt)
        .map((t) => (t === '$' ? '!' : t))
        .join('');

export const blockInfo = (block: Block): string => {
    let res = `${block.width}x${block.height}`;
    if (block.type === 'inline') {
        if (typeof block.contents === 'string') {
            res += JSON.stringify(block.contents.slice(0, 5));
            if (block.contents.length > 5) res += '+';
        } else {
            res += `(${block.contents
                .map((line) => line.map(blockInfo).join('|'))
                .join('↩')})`;
        }
    } else if (block.type === 'block') {
        res += `[${block.contents
            .map(blockInfo)
            .join(block.horizontal === false ? '|' : ',')}]`;
    } else if (block.type === 'table') {
        // res += '[||]';
        res += `[${block.rows
            .map((row) => row.map(blockInfo).join('~'))
            .join('/')}]`;
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
