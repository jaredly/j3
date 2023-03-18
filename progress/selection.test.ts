import { setIdx } from '../src/grammar';
import { idText, parseByCharacter, pathPos } from '../src/parse/parse';
import {
    nodeToString,
    remapPos,
    showSourceMap,
    SourceMap,
} from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents, Map } from '../src/types/mcst';
import { applyUpdate, getKeyUpdate, State } from '../web/mods/getKeyUpdate';
import { goRight, selectEnd, selectStart } from '../web/mods/navigate';
import { Path } from '../web/store';
import { sexp } from './sexp';

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
`;

// So, um I want to ... do the sourcemap backwards?
// orr just go "right" until I happen upon it lol
export const posToPath = (
    root: number,
    pos: number,
    map: Map,
    sm: SourceMap,
) => {
    let at = 0;
    let path = selectStart(
        root,
        [{ idx: -1, child: { type: 'child', at: 0 } }],
        map,
    )!;
    while (at < pos) {
        const update = goRight(path, path[path.length - 1].idx, map);
        if (update?.type === 'select') {
            path = update.selection;
            at = remapPos(path, sm);
        } else {
            return null;
        }
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
                setIdx(0);
                const { map: data, selection } = parseByCharacter(input, only);

                const idx = (data[-1] as ListLikeContents).values[0];
                const sourceMap: SourceMap = { map: {}, cur: 0 };
                const back = nodeToString(fromMCST(idx, data), sourceMap);
                expect(back).toEqual(input);

                const first = selections.indexOf('^');
                const second = selections.indexOf('^', first + 1);

                const firstPath = posToPath(idx, first, data, sourceMap);
                const secondPath = posToPath(idx, second, data, sourceMap);
                if (!firstPath) {
                    throw new Error(`could not postopath`);
                }
                if (!secondPath) {
                    throw new Error('could not second postopath');
                }

                if (expected.includes('|')) {
                    const pos = remapPos(selection, sourceMap);
                    back = back.slice(0, pos) + '|' + back.slice(pos);
                }
                if (back !== expected) {
                    console.warn(JSON.stringify(data));
                }
                expect(sexp(fromMCST(idx, data))).toEqual(serialized);

                const state = selectEnd(
                    idx,
                    [{ idx: -1, child: { type: 'child', at: 0 } }],
                    data,
                );

                if (!state) {
                    throw new Error(
                        `cant select end ${idx} ${JSON.stringify(data)}`,
                    );
                }
            });
        });
});
