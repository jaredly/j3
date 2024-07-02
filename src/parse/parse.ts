// hmm
import { NsMap } from '../../web/custom/UIState';
import { Mods, State, applyUpdate } from '../state/getKeyUpdate';
import { Path, cmpFullPath } from '../state/path';
import { AutoCompleteReplace } from '../to-ast/Ctx';
import { applyMenuItem } from '../to-ast/autoComplete';
import { Display } from '../to-ast/library';
import { Map } from '../types/mcst';
import { splitGraphemes } from './splitGraphemes';
export const idxSource = () => {
    let idx = 0;
    return () => idx++;
};

export function orderStartAndEnd(
    start: Path[],
    end: Path[],
    nsMap: NsMap,
): [Path[], Path[]] {
    return cmpFullPath(start, end, nsMap) < 0 ? [start, end] : [end, start];
}

function determineKey(text: string[], i: number, mods: Mods) {
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
            n: 'Enter',
            T: 'Tab',
            t: 'Tab',
        }[text[i + 1]]!;
        if (!key) {
            throw new Error(`Unexpected ^${text[i + 1]}`);
        }
        if (text[i + 1] === 'L' || text[i + 1] === 'R' || text[i + 1] === 'T') {
            mods.shift = true;
        }
        i++;
    }
    if (key === '\n') {
        key = 'Enter';
    }
    return { key, i };
}

export function getAutoCompleteUpdate(state: State, display: Display) {
    const idx = state.at[0].start[state.at[0].start.length - 1].idx;
    const exacts = display[idx]?.autoComplete?.filter(
        (s) => s.type === 'update' && s.exact,
    ) as AutoCompleteReplace[];
    return exacts?.length === 1
        ? applyMenuItem(state.at[0].start, exacts[0], state)
        : null;
}

export function autoCompleteIfNeeded(state: State, display: Display) {
    const update = getAutoCompleteUpdate(state, display);
    if (update) {
        state = applyUpdate(state, 0, update);
    }
    return state;
}

export const emptyMap = (): Map => {
    return {
        [-1]: {
            type: 'list',
            values: [0],
            loc: -1,
        },
        [0]: { type: 'blank', loc: 0 },
    };
};

function initialState() {
    const nidx = idxSource();
    const top = nidx();

    const map: Map = {
        [-1]: {
            type: 'list',
            values: [top],
            loc: -1,
        },
        [top]: {
            type: 'blank',
            loc: 0,
        },
    };

    let state: State = {
        nidx,
        map,
        at: [
            {
                start: [
                    { idx: -1, type: 'card', card: 0 },
                    { idx: top, type: 'start' },
                ],
            },
        ],
        root: -1,
    };
    return state;
}

export function pathPos(path: Path[], curText: string) {
    const last = path[path.length - 1];
    return last.type === 'subtext'
        ? last.at
        : last.type === 'end'
        ? splitGraphemes(curText).length
        : 0;
}
