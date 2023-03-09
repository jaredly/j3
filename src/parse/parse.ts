// hmm
import { getKeyUpdate } from '../../web/mods/getKeyUpdate';
import { Path, Selection } from '../../web/store';
import { Map } from '../types/mcst';

export const parseByCharacter = (text: string) => {
    const map: Map = {
        [-1]: {
            type: 'list',
            values: [0],
            loc: { idx: -1, start: 0, end: 0 },
        },
        [0]: {
            type: 'blank',
            loc: { idx: 0, start: 0, end: 0 },
        },
    };
    let selection: Selection = { idx: 0, loc: 0 };
    let path: Path[] = [{ idx: -1, child: { type: 'child', at: 0 } }];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const current = map[selection.idx];
        const update = getKeyUpdate(char, 0, '', selection.idx, path, map);
    }
};
