// hmm
import { applyUpdate, getKeyUpdate, State } from '../../web/mods/getKeyUpdate';
import { Path } from '../../web/store';
import { nidx } from '../grammar';
import { Map, MNode } from '../types/mcst';

export const idText = (node: MNode) => {
    switch (node.type) {
        case 'identifier':
        case 'comment':
            return node.text;
        case 'number':
        case 'unparsed':
            return node.raw;
        case 'accessText':
        case 'stringText':
            return node.text;
        case 'blank':
            return '';
        case 'tag':
            return "'" + node.text;
    }
};

const seg = new Intl.Segmenter('en');

export const splitGraphemes = (text: string) => {
    return [...seg.segment(text)].map((seg) => seg.segment);
};

export const parseByCharacter = (
    rawText: string,
    debug = false,
): { map: Map; selection: Path[] } => {
    let state: State = initialState();

    const text = splitGraphemes(rawText.replace(/\s+/g, ' '));

    for (let i = 0; i < text.length; i++) {
        let key = text[i];
        if (key === '^') {
            key = {
                l: 'ArrowLeft',
                r: 'ArrowRight',
                b: 'Backspace',
            }[text[i + 1]]!;
            if (!key) {
                throw new Error(`Unexpected ^${text[i + 1]}`);
            }
            i++;
        }
        if (key === '\n') {
            key = 'Enter';
        }

        const update = getKeyUpdate(key, state.map, state.at[0].start);
        if (debug) {
            console.log(key, state.at[0].start);
            console.log(JSON.stringify(update));
        }

        state = applyUpdate(state, update) ?? state;
    }
    return { map: state.map, selection: state.at[0].start };
};

function initialState() {
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
