import * as React from 'react';
import { Map, MNodeExtra, toMCST } from '../../src/types/mcst';
import { Path, Store, StoreUpdate, updateStore } from '../store';
import { nidx, parse } from '../../src/grammar';
import { Events } from '../old/Nodes';
import { getPos, modChildren } from './onKeyDown';
import { Identifier, Node, NodeExtra } from '../../src/types/cst';

const addSpace = (store: Store, path: Path[], after = false): boolean => {
    const last = path[path.length - 1];
    if (last.child.type === 'child') {
        updateStore(
            store,
            addSpaceAdjacent(
                last,
                last.child.at + (after ? 1 : 0),
                store,
                after,
            ),
        );
        return true;
    }

    if (last.child.type === 'start' || last.child.type === 'end') {
        addSpace(store, path.slice(0, -1), after);
        return true;
    }

    return false;
    // ok, so ...
};

export const handleSpace = (
    evt: React.KeyboardEvent<HTMLSpanElement>,
    idx: number,
    path: Path[],
    events: Events,
    store: Store,
) => {
    evt.preventDefault();
    evt.stopPropagation();

    const parent = path[path.length - 1];
    if (parent.child.type === 'start' || parent.child.type === 'end') {
        const handled = addSpace(store, path, parent.child.type === 'end');
        // if (handled) {
        //     evt.preventDefault();
        //     evt.stopPropagation();
        // }
        if (!handled) {
            console.warn('didnt handle space?');
        }
        return;
    }

    if (parent.child.type === 'child') {
        const pos = getPos(evt.currentTarget);
        if (pos === 0) {
            addSpace(store, path, false);
            return;
        }
        if (pos === evt.currentTarget.textContent!.length) {
            addSpace(store, path, true);
            return;
        }
        const update = addSpaceAdjacent(
            parent,
            parent.child.at + 1,
            store,
            true,
            evt.currentTarget.textContent!.slice(pos),
        );
        const node = store.map[idx] as Identifier & MNodeExtra;
        update.map[idx] = { ...node, text: node.text.slice(0, pos) };
        updateStore(store, update);
    }
};

export function addSpaceAdjacent(
    gp: Path,
    at: number,
    store: Store,
    selectSpace = false,
    text = '',
): StoreUpdate {
    const nw: Node = {
        type: 'identifier',
        text,
        loc: {
            idx: nidx(),
            start: 0,
            end: text.length,
        },
    };
    const mp: Map = {};
    const idx = toMCST(nw, mp);
    const pnode = store.map[gp.idx];
    mp[gp.idx] = {
        ...pnode,
        ...modChildren(pnode, (items) => {
            items.splice(at, 0, idx);
        }),
    };
    return {
        map: mp,
        selection: selectSpace ? { idx, loc: 'start' } : undefined,
    };
}
