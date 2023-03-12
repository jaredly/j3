// Can go left & right

import { setIdx } from '../src/grammar';
import { idText, parseByCharacter, splitGraphemes } from '../src/parse/parse';
import { nodeToString, SourceMap } from '../src/to-cst/nodeToString';
import { Node } from '../src/types/cst';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { getKeyUpdate } from '../web/mods/getKeyUpdate';
import { Path, Selection } from '../web/store';

const sink = ``;

describe('going left', () => {
    it('should work', () => {
        const { map: data } = parseByCharacter(sink);
        Object.keys(data).forEach((key) => {
            expect(data[+key].loc.idx).toEqual(+key);
        });
        const idx = (data[-1] as ListLikeContents).values[0];
        const sourceMap: SourceMap = { map: {}, cur: 0 };
        let back = nodeToString(fromMCST(idx, data), sourceMap);
        expect(back).toEqual(sink);
        let selection: Selection = { idx, loc: 'end' };
        let path: Path[] = [{ idx: -1, child: { type: 'child', at: 0 } }];
        for (let i = 0; i < sink.length; i++) {
            const curText = idText(data[selection.idx]) ?? '';

            const pos =
                selection.loc === 'start' ||
                selection.loc === 'inside' ||
                selection.loc === 'change' ||
                !selection.loc
                    ? 0
                    : selection.loc === 'end'
                    ? splitGraphemes(curText).length
                    : selection.loc;

            const update = getKeyUpdate(
                'ArrowLeft',
                pos,
                curText,
                selection.idx,
                path,
                data,
            )!;
            console.log(i);
            expect(update).toBeTruthy();
            if (update.type !== 'select') {
                expect(update).toMatchObject({ type: 'select' });
            } else {
                selection = update.selection;
                path = update.path;
            }
        }
    });
});
