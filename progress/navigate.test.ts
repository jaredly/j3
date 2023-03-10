// Can go left & right

import { setIdx } from '../src/grammar';
import { parseByCharacter } from '../src/parse/parse';
import { nodeToString, SourceMap } from '../src/to-cst/nodeToString';
import { Node } from '../src/types/cst';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { Selection } from '../web/store';

const sink = `(fn [one:two three:(four five)]:six {10 20 yes "ok \${(some [2 3 ..more] ..things)} and \${a}" })`;

describe('going left', () => {
    it('should work', () => {
        const { map: data, selection } = parseByCharacter(sink);
        Object.keys(data).forEach((key) => {
            expect(data[+key].loc.idx).toEqual(+key);
        });
        const idx = (data[-1] as ListLikeContents).values[0];
        const sourceMap: SourceMap = { map: {}, cur: 0 };
        let back = nodeToString(fromMCST(idx, data), sourceMap);
        expect(back).toEqual(sink);
        // for (let i=0; i<sink.length; i++) {

        // }
    });
});
