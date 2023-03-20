// hmm
import { cmpFullPath } from '../../web/custom/isCoveredBySelection';
import { ClipboardItem, collectNodes, paste } from '../../web/mods/clipboard';
import {
    applyUpdate,
    getKeyUpdate,
    Mods,
    State,
} from '../../web/mods/getKeyUpdate';
import { Path } from '../../web/store';
import { Map, MNode } from '../types/mcst';

export const idText = (node: MNode) => {
    switch (node.type) {
        case 'identifier':
        case 'comment':
            return node.text;
        case 'unparsed':
            return node.raw;
        case 'accessText':
        case 'stringText':
            return node.text;
        case 'blank':
            return '';
    }
};

const seg = new Intl.Segmenter('en');

export const splitGraphemes = (text: string) => {
    return [...seg.segment(text)].map((seg) => seg.segment);
};

export const parseByCharacter = (rawText: string, debug = false): State => {
    let state: State = initialState();

    const text = splitGraphemes(
        rawText.replace(/\s+/g, (f) => (f.includes('\n') ? '\n' : ' ')),
    );

    let clipboard: ClipboardItem[] = [];

    for (let i = 0; i < text.length; i++) {
        let mods: Mods = {};
        let key = text[i];
        if (key === '^') {
            key = {
                l: 'ArrowLeft',
                r: 'ArrowRight',
                b: 'Backspace',
                L: 'ArrowLeft',
                R: 'ArrowRight',
                C: 'Copy',
                V: 'Paste',
            }[text[i + 1]]!;
            if (!key) {
                throw new Error(`Unexpected ^${text[i + 1]}`);
            }
            if (text[i + 1] === 'L' || text[i + 1] === 'R') {
                mods.shift = true;
            }
            i++;
        }
        if (key === '\n') {
            key = 'Enter';
        }
        if (key === 'Copy') {
            let { start, end } = state.at[0];
            if (!end) {
                throw new Error(`need end for copy`);
            }

            [start, end] =
                cmpFullPath(start, end) < 0 ? [start, end] : [end, start];

            clipboard = [collectNodes(state.map, start, end)];
            continue;
        }
        if (key === 'Paste') {
            state = paste(state, clipboard);
            continue;
        }

        const update = getKeyUpdate(
            key,
            state.map,
            state.at[0],
            state.nidx,
            mods,
        );
        if (debug) {
            console.log(JSON.stringify(key), state.at[0].start);
        }

        state = applyUpdate(state, 0, update) ?? state;
    }
    return state;
};

export const idxSource = () => {
    let idx = 0;
    return () => idx++;
};

function initialState() {
    const nidx = idxSource();
    const top = nidx();

    const map: Map = {
        [-1]: {
            type: 'list',
            values: [top],
            loc: { idx: -1, start: 0, end: 0 },
        },
        [top]: {
            type: 'blank',
            loc: { idx: 0, start: 0, end: 0 },
        },
    };

    let state: State = {
        nidx,
        map,
        at: [
            {
                start: [
                    { idx: -1, child: { type: 'child', at: 0 } },
                    { idx: top, child: { type: 'start' } },
                ],
            },
        ],
        root: -1,
    };
    return state;
}

export function pathPos(path: Path[], curText: string) {
    const last = path[path.length - 1];
    return last.child.type === 'subtext'
        ? last.child.at
        : last.child.type === 'end'
        ? splitGraphemes(curText).length
        : 0;
}
