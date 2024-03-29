import { parseByCharacter } from '../src/parse/parse';
import { newCtx } from '../src/to-ast/Ctx';
import { nodeToString, remapPos, SourceMap } from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents, Map } from '../src/types/mcst';
import { clipboardText, collectNodes } from '../src/state/clipboard';
import { getKeyUpdate } from '../src/state/getKeyUpdate';
import { selectStart } from '../src/state/navigate';

const data = `
(abc def ghi)
  ^   ^
abc def

((abc))
 ^    ^
(abc)

(abcdef)
   ^ ^
cd

(let [hello folks and stuff] yeah)
^                ^
(let [hello folks])

(one and (two [and:three four:five]))
     ^                       ^
and (two [and:three four])

"one \${two} three"
 ^        ^
"one \${two}"

(some:thing)
  ^     ^
some:thing

hello.folks.such
  ^     ^
hello.folks

hello.folks.such
        ^     ^
folks.such

"going on a \${cou.gar} hunt"
               ^     ^
cou.gar
`;

// So, um I want to ... do the sourcemap backwards?
// orr just go "right" until I happen upon it lol
export const posToPath = (
    root: number,
    pos: number,
    map: Map,
    sm: SourceMap,
    nidx: () => number,
) => {
    let at = 0;
    let path = selectStart(root, [{ idx: -1, type: 'child', at: 0 }], map)!;
    while (at < pos) {
        const update = getKeyUpdate(
            'ArrowRight',
            map,
            { start: path },
            {},
            nidx,
        );
        if (update?.type === 'select') {
            path = update.selection;
            at = remapPos(path, sm);
        } else {
            console.log('bad news bears!');
            return null;
        }
    }
    if (at !== pos) {
        throw new Error(`what, why is this even happening`);
    }
    return path;
};

describe('a test', () => {
    data.trim()
        .split('\n\n')
        .forEach((chunk, i) => {
            const only = chunk.startsWith('!!!');
            if (only) {
                chunk = chunk.slice(3);
            }
            const [input, selections, output] = chunk.split('\n');

            (only ? it.only : it)(i + ' ' + input, () => {
                const { map: data, nidx } = parseByCharacter(input, null, {
                    debug: only,
                });

                const idx = (data[-1] as ListLikeContents).values[0];
                const sourceMap: SourceMap = { map: {}, cur: 0 };
                const back = nodeToString(fromMCST(idx, data), {}, sourceMap);
                expect(back).toEqual(input);

                const first = selections.indexOf('^');
                const second = selections.indexOf('^', first + 1);

                const firstPath = posToPath(idx, first, data, sourceMap, nidx);
                const secondPath = posToPath(
                    idx,
                    second,
                    data,
                    sourceMap,
                    nidx,
                );
                if (!firstPath) {
                    throw new Error(`could not postopath`);
                }
                if (!secondPath) {
                    throw new Error('could not second postopath');
                }

                const collected = collectNodes(data, firstPath, secondPath, {});
                const printed = clipboardText([collected], {}, ' ');
                if (printed !== output) {
                    console.log(firstPath);
                    console.log(secondPath);
                    console.log(collected);
                }
                expect(printed).toEqual(output);
            });
        });
});
