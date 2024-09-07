import equal from 'fast-deep-equal';
import { NUIState, NsMap, RealizedNamespace } from '../../web/custom/UIState';
import { StateChange } from './getKeyUpdate';
import { UpdateMap } from '../types/mcst';
import { Path } from './path';
import { newNodeAfter, newNodeBefore } from './newNodeBefore';
import { ListLikeContents, Map } from '../types/mcst';

export const moveNode = (
    { path, idx }: { path: Path[]; idx: number },
    dest: Path[],
    state: NUIState,
): StateChange | void => {
    if (pathStartsWith(dest, path)) {
        return {
            type: 'full-select',
            at: [
                {
                    start: [...path, { type: 'start', idx }],
                    end: [...path, { type: 'end', idx }],
                },
            ],
        };
    }

    const last = dest[dest.length - 1];
    let nsMap: NsMap | undefined = undefined;
    const updateMap: Map = {};
    const ppath = path[path.length - 1];
    if (ppath.type === 'child') {
        const parent = state.map[ppath.idx] as ListLikeContents & {
            loc: number;
        };
        updateMap[parent.loc] = {
            ...parent,
            values: parent.values.filter((v) => v !== idx),
        };
    } else if (ppath.type === 'ns-top') {
        const idx = state.nidx();
        nsMap = {
            [ppath.idx]: {
                ...(state.nsMap[ppath.idx] as RealizedNamespace),
                top: idx,
            },
        };
        updateMap[idx] = { type: 'blank', loc: idx };
    } else {
        console.log('cant remove from', ppath);
        return;
    }

    if (
        last.type === 'subtext' ||
        last.type === 'start' ||
        last.type === 'end'
    ) {
        const before =
            (last.type === 'subtext' && last.at === 0) || last.type === 'start';
        if (before) {
            return newNodeBefore(
                dest,
                state.map, // { ...state.map, ...updateMap },
                state.nsMap,
                {
                    idx,
                    map: updateMap,
                    nsMap,
                    selection: [{ type: 'start', idx }],
                },
                state.nidx,
            );
        }

        return newNodeAfter(
            dest,
            state.map, // { ...state.map, ...updateMap },
            state.nsMap,
            { idx, map: updateMap, nsMap, selection: [{ type: 'start', idx }] },
            state.nidx,
        );
    }

    if (last.type === 'inside') {
        const parent = state.map[last.idx] as ListLikeContents & {
            loc: number;
        };
        updateMap[last.idx] = {
            ...parent,
            values: [idx],
        };
        return {
            type: 'update',
            map: updateMap,
            nsMap,
            selection: dest.slice(0, -1).concat([
                { type: 'child', at: 0, idx: last.idx },
                { type: 'start', idx },
            ]),
        };
    }

    console.log('cant drop', last, dest);
};

const pathStartsWith = (one: Path[], prefix: Path[]) => {
    for (let i = 0; i < prefix.length; i++) {
        if (!one[i]) return false;
        if (!equal(one[i], prefix[i])) return false;
    }
    return true;
};
