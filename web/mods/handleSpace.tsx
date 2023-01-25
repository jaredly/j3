import * as React from 'react';
import { Map, toMCST } from '../../src/types/mcst';
import { Path, Store, updateStore } from '../store';
import { parse } from '../../src/grammar';
import { Events } from '../Nodes';
import { getPos, modChildren } from './onKeyDown';

export const handleSpace = (
    evt: React.KeyboardEvent<HTMLSpanElement>,
    idx: number,
    path: Path[],
    events: Events,
    store: Store,
) => {
    const parent = path[path.length - 1];
    if (parent.child.type === 'start') {
        const gp = path[path.length - 2];
        if (gp && gp.child.type === 'child') {
            addSpaceBefore(gp, gp.child.at, store, evt, path);
            evt.preventDefault();
            return;
        }
    }

    const pos = getPos(evt.currentTarget);
    if (pos === 0 && parent.child.type === 'child') {
        addSpaceBefore(parent, parent.child.at, store, evt, path);
        evt.preventDefault();
        return;
    }

    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];
        if (parent.child.type !== 'child') {
            continue;
        }
        const child = parent.child;
        let nw = parse('_')[0];
        nw = { type: 'identifier', text: '', loc: nw.loc };
        const mp: Map = {};
        const nidx = toMCST(nw, mp);
        const pnode = store.map[parent.idx];
        mp[parent.idx] = {
            node: {
                ...pnode.node,
                ...modChildren(pnode.node, (items) => {
                    items.splice(child.at + 1, 0, nidx);
                }),
            },
        };
        updateStore(store, { map: mp, selection: { idx: nidx } }, [path]);
        evt.preventDefault();
        return;
    }
    return;
};

function addSpaceBefore(
    gp: Path,
    at: number,
    store: Store,
    evt: React.KeyboardEvent<HTMLSpanElement>,
    path: Path[],
) {
    let nw = parse('_')[0];
    nw = { type: 'identifier', text: '', loc: nw.loc };
    const mp: Map = {};
    const nidx = toMCST(nw, mp);
    const pnode = store.map[gp.idx];
    mp[gp.idx] = {
        node: {
            ...pnode.node,
            ...modChildren(pnode.node, (items) => {
                items.splice(at, 0, nidx);
            }),
        },
    };
    updateStore(
        store,
        {
            map: mp,
            selection: undefined,
        },
        [path],
    );
}
