import * as React from 'react';
import { ListLikeContents, Map } from '../../src/types/mcst';
import { Path, Store, UpdateMap, updateStore } from '../store';
import { Events } from '../Nodes';
import { mnodeChildren, rmChild, isAtStart, getPos } from './onKeyDown';

const removeEmptyPrev = (
    gp: Path,
    at: number,
    store: Store,
    evt: React.KeyboardEvent<HTMLSpanElement>,
    path: Path[],
) => {
    const children = mnodeChildren(store.map[gp.idx].node);
    const prev = children[at - 1];
    const pnode = store.map[prev].node;
    if (pnode.type === 'identifier' && pnode.text === '') {
        const values = children.slice();
        values.splice(at - 1, 1);
        const mp: UpdateMap = {
            [prev]: null,
            [gp.idx]: {
                ...store.map[gp.idx],
                node: {
                    ...store.map[gp.idx].node,
                    ...{
                        type: store.map[gp.idx].node
                            .type as ListLikeContents['type'],
                        values,
                    },
                },
            },
        };
        updateStore(store, { map: mp }, [path]);
        evt.preventDefault();
        return true;
    }
    return false;
};

export const handleBackspace = (
    evt: React.KeyboardEvent<HTMLSpanElement>,
    idx: number,
    path: Path[],
    events: Events,
    store: Store,
) => {
    const parent = path[path.length - 1];
    if (parent.child.type === 'start') {
        const gp = path[path.length - 2];
        if (gp.child.type === 'child' && gp.child.at > 0) {
            if (removeEmptyPrev(gp, gp.child.at, store, evt, path)) {
                return;
            }
        }

        evt.preventDefault();
        events.onLeft();
        return;
    }

    if (parent.child.type === 'child' && getPos(evt.currentTarget) === 0) {
        if (removeEmptyPrev(parent, parent.child.at, store, evt, path)) {
            return;
        }
    }

    if (parent.child.type === 'inside' || parent.child.type === 'end') {
        // change the thing to an empty identifier prolly
        const mp: Map = {
            [idx]: {
                ...store.map[idx],
                node: {
                    ...store.map[idx].node,
                    ...{ type: 'identifier', text: '' },
                },
            },
        };
        updateStore(store, { map: mp }, [path]);
        evt.preventDefault();
        return;
    }

    if (parent.child.type === 'child') {
        if (evt.currentTarget.textContent === '') {
            const mp: UpdateMap = {};
            const pnode = store.map[parent.idx];
            const res = rmChild(pnode.node, parent.child.at);
            if (!res) {
                return;
            }
            const { contents, nidx } = res;
            if (contents.values.length === 0) {
                mp[parent.idx] = {
                    node: {
                        ...pnode.node,
                        ...{ type: 'identifier', text: '' },
                    },
                };
                updateStore(
                    store,
                    {
                        map: mp,
                        selection: {
                            idx: parent.idx,
                        },
                    },
                    [path],
                );
                evt.preventDefault();
                return;
            }
            mp[parent.idx] = { node: { ...pnode.node, ...contents } };
            updateStore(
                store,
                {
                    map: mp,
                    selection:
                        nidx != null
                            ? { idx: nidx, loc: 'end' }
                            : { idx: parent.idx, loc: 'start' },
                },
                [path],
            );
            evt.preventDefault();
        } else if (isAtStart(evt.currentTarget)) {
            // Can we merge with the previous child?
            // if so, go for it, otherwise just goLeft
            events.onLeft();
            evt.preventDefault();
        }
    }
};
