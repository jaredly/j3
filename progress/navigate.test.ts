// Can go left & right

import { setIdx } from '../src/grammar';
import {
    idText,
    parseByCharacter,
    selPos,
    splitGraphemes,
} from '../src/parse/parse';
import { nodeToString, SourceMap } from '../src/to-cst/nodeToString';
import { Node } from '../src/types/cst';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { applyUpdate } from '../web/custom/ByHand';
import { getKeyUpdate, State } from '../web/mods/getKeyUpdate';
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
        // let selection: Selection = { idx, loc: 'end' };
        // let path: Path[] = [{ idx: -1, child: { type: 'child', at: 0 } }];

        let state: State = {
            map: data,
            root: -1,
            at: {
                sel: { idx, loc: 'end' },
                path: [{ idx: -1, child: { type: 'child', at: 0 } }],
            },
        };

        for (let i = 0; i < sink.length; i++) {
            const curText = idText(data[state.at.sel.idx]) ?? '';

            const pos = selPos(state.at.sel, curText);

            const update = getKeyUpdate('ArrowLeft', state)!;
            expect(update).toBeTruthy();
            if (update.type !== 'select') {
                expect(update).toMatchObject({ type: 'select' });
            } else {
                state = applyUpdate(state, update) ?? state;
            }
        }
    });
});
