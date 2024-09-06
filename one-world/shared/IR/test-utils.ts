// testingi t up
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { BootExampleEvaluator } from '../../boot-ex';
import { parse } from '../../boot-ex/format';
import { reader } from '../../boot-ex/reader';
import { iterTopNodes } from '../../client/cli/docNodeToIR';
import { controlLayout, textLayout } from '../../client/cli/drawDocNode';
import { layoutCtx } from '../../client/cli/drawDocNode2';
import { IR, nodeToIR } from '../../shared/IR/intermediate';
import {
    IRForLoc,
    LayoutChoices,
    LayoutCtx,
    layoutIR,
} from '../../shared/IR/layout';
import {
    childLocs,
    IDRef,
    keyForLoc,
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

export const multi = (texts: string[], ev = BootExampleEvaluator) => {
    const globals: Record<string, IDRef> = {};
    const results: string[] = [];
    const names: Record<string, string> = {};
    texts.forEach((string, i) => {
        const tid = `top-${i}`;
        const recNode = reader(string, tid, globals);
        if (!recNode) return;
        const parsed = ev.parse(recNode);
        const nodes: Nodes = {};
        const root = toMap(recNode, nodes);
        parsed.exports?.forEach((exp) => {
            const loc = exp.loc[0][1];
            const node = nodes[loc];
            if (node?.type === 'id') {
                if (globals[node.text]) {
                    throw new Error(`duplicate definition`);
                }
                globals[node.text] = {
                    type: 'toplevel',
                    kind: exp.kind,
                    loc: exp.loc,
                };
                names[keyForLoc(exp.loc)] = node.text;
            }
        });

        const irs: IRForLoc = {};
        const pathRoot: PathRoot = {
            type: 'doc-node',
            doc: '',
            ids: [],
            toplevel: tid,
        };
        iterTopNodes(root, pathRoot, nodes, (node, path) => {
            irs[node.loc] = nodeToIR(node, path, {
                styles: parsed.styles,
                layouts: parsed.layouts,
                tableHeaders: parsed.tableHeaders,
                names,
            });
        });

        const ctx = layoutCtx(50, irs);

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

        results.push(txt);
    });

    return results.join('\n\n');
};

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
        irs[id] = nodeToIR(nodes[id], self, {
            styles: parsed.styles,
            layouts: parsed.layouts,
            tableHeaders: parsed.tableHeaders,
            names: {},
        });
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

export function showLayout(orig: string, width = 20, x = false) {
    let res = Array(width).join('-') + `| ${width}\n`;
    const { txt } = process(orig, width);
    res += trimTrailingWhite(fixDollar(txt)) + '\n\n';
    return res;
}

export function showSpans(orig: string, width = 20, x = false) {
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
