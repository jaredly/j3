import { splitGraphemes } from '../parse/parse';
import { State, StateChange, StateUpdate } from '../state/getKeyUpdate';
import { Path } from '../state/path';
import { MNode, Map } from '../types/mcst';
import { AutoCompleteReplace } from './Ctx';

export function autoCompleteUpdate(
    idx: number,
    map: Map,
    path: Path[],
    item: AutoCompleteReplace,
): StateUpdate {
    if (!map[idx]) {
        console.log(idx, 'not in the map');
        debugger;
    }
    const current = map[idx];
    return {
        type: 'update',
        map: {
            [idx]: applyAutoUpdateToNode(current, item),
        },
        selection: path.slice(0, -1).concat([
            {
                idx,
                type: 'subtext',
                at: splitGraphemes(item.text).length,
            },
        ]),
        autoComplete: true,
    };
}

export function applyAutoUpdateToNode(
    current: MNode,
    item: AutoCompleteReplace,
): MNode {
    return current.type === 'array' && item.update.type === 'array-hash'
        ? { ...current, hash: item.update.hash }
        : item.update.type === 'accessText'
        ? {
              loc: current.loc,
              type: 'accessText',
              text: item.update.text,
          }
        : {
              loc: current.loc,
              type: 'hash',
              hash: item.update.hash,
          };
}

export function applyMenuItem(
    path: Path[],
    item: AutoCompleteReplace,
    state: State,
): StateChange {
    const idx = path[path.length - 1].idx;
    return autoCompleteUpdate(idx, state.map, path, item);
}

export const verifyLocs = (map: Map, message: string) => {
    Object.keys(map).forEach((k) => {
        if (+k !== map[+k].loc) {
            console.log(+k, map[+k].loc);
            // debugger;
            console.error(
                new Error(`loc has the wrong loc! during ${message}`),
            );
        }
    });
};
