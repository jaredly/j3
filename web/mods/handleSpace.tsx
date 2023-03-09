import * as React from 'react';
import { Map, MNodeExtra, toMCST } from '../../src/types/mcst';
import { Path, Selection, Store, StoreUpdate, updateStore } from '../store';
import { nidx, parse } from '../../src/grammar';
import { Events } from '../old/Nodes';
import { getPos } from './onKeyDown';
import { modChildren } from './modChildren';
import { Identifier, Node, NodeExtra } from '../../src/types/cst';

export const addSpace = (
    store: Store,
    path: Path[],
    after = false,
): StoreUpdate | void => {
    const last = path[path.length - 1];
    if (last.child.type === 'child') {
        return addSpaceAdjacent(
            last,
            last.child.at + (after ? 1 : 0),
            store,
            after,
        );
    }

    if (last.child.type === 'start' || last.child.type === 'end') {
        return addSpace(store, path.slice(0, -1), after);
    }
    if (last.child.type === 'spread-contents') {
        return addSpace(store, path.slice(0, -1), after);
    }
    // ok, so ...
    console.log('Why cant I add a space', last);
};

export const maybeUpdate = (
    store: Store,
    update: StoreUpdate | void,
    prev?: Selection,
) => {
    if (update) {
        if (prev) {
            update.prev = prev;
        }
        updateStore(store, update);
    }
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

    let parent = path[path.length - 1];
    if (parent.child.type === 'start' || parent.child.type === 'end') {
        const update = addSpace(store, path, parent.child.type === 'end');
        maybeUpdate(store, update);
        return;
    }

    if (parent.child.type === 'attribute') {
        // idx = parent.idx;
        // parent = path[path.length - 2];
        // console.log('attr', parent, idx);
        const update = addSpace(store, path.slice(0, -1), true);
        maybeUpdate(store, update);
        return;
    }

    if (parent.child.type === 'spread-contents') {
        // parent = path[path.length - 2];
        // console.log('spread up', parent);
        const update = addSpace(store, path, true);
        maybeUpdate(store, update);
        return;
    }

    if (parent.child.type === 'child') {
        const pos = getPos(evt.currentTarget);
        if (pos === 0) {
            const update = addSpace(store, path, false);
            maybeUpdate(store, update, { idx, loc: pos });
            return;
        }
        if (pos === evt.currentTarget.textContent!.length) {
            const update = addSpace(store, path, true);
            maybeUpdate(store, update, { idx, loc: pos });
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
        update.prev = { idx, loc: pos };
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
