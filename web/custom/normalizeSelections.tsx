import { orderStartAndEnd } from '../../src/parse/parse';
import { Cursor } from '../../src/state/getKeyUpdate';
import { NsMap } from '../../src/types/mcst';

export function normalizeSelections(at: Cursor[], nsMap: NsMap): Cursor[] {
    return at
        .filter((s) => s.end)
        .map(({ start, end }) => {
            [start, end] = orderStartAndEnd(start, end!, nsMap);
            return { start, end };
        });
}
