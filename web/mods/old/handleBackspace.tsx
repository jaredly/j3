import * as React from 'react';
import {
    ListLikeContents,
    Map,
    MCString,
    MNodeExtra,
} from '../../../src/types/mcst';
import { Path, Store, StoreUpdate, UpdateMap, updateStore } from '../../store';
import { Events } from '../../old/Nodes';
import { mnodeChildren, rmChild, isAtStart, getPos } from './onKeyDown';
import { stringText } from '../../../src/types/cst';

const removeEmptyPrev = (gp: Path, at: number, store: Store) => {
    const children = mnodeChildren(store.map[gp.idx]);
    const prev = children[at - 1];
    const pnode = store.map[prev];
    if (pnode.type === 'identifier' && pnode.text === '' && !pnode.hash) {
        const values = children.slice();
        values.splice(at - 1, 1);
        const mp: UpdateMap = {
            [prev]: null,
            [gp.idx]: {
                ...store.map[gp.idx],
                ...{
                    type: store.map[gp.idx].type as ListLikeContents['type'],
                    values,
                },
            },
        };
        updateStore(store, { map: mp });
        return true;
    }
    return false;
};

export const maybeRemoveEmptyPrev = (parent: Path, store: Store) => {
    if (parent.child.type === 'child' && parent.child.at > 0) {
        return removeEmptyPrev(parent, parent.child.at, store);
    }
};

export const handleBackspace = (
    // evt: React.KeyboardEvent<HTMLSpanElement>,
    text: string,
    atStart: boolean,
    idx: number,
    path: Path[],
    events: Events,
    store: Store,
): boolean => {
    const parent = path[path.length - 1];
    if (parent.child.type === 'start') {
        const gp = path[path.length - 2];
        if (gp.child.type === 'child' && gp.child.at > 0) {
            if (removeEmptyPrev(gp, gp.child.at, store)) {
                return true;
            }
        }

        events.onLeft();
        return true;
    }

    // Deleting an expr, joining it up
    if (parent.child.type === 'expr' && text.length === 0) {
        const node = store.map[parent.idx] as MCString & MNodeExtra;
        const templates = node.templates.slice();
        const prev = templates[parent.child.at - 1].suffix;
        const prevText = (store.map[prev] as stringText).text;
        templates.splice(parent.child.at - 1, 1);
        const update: StoreUpdate = { map: {} };
        if (parent.child.at > 1) {
            const suffix = templates[parent.child.at - 2].suffix;
            const pt = (store.map[suffix] as stringText).text;
            const text = pt + prevText;
            update.map[suffix] = {
                ...(store.map[suffix] as stringText & MNodeExtra),
                text,
            };
            update.selection = {
                idx: suffix,
                loc: pt.length,
            };
        } else {
            const pt = (store.map[node.first] as stringText).text;
            const text = pt + prevText;
            update.map[node.first] = {
                ...(store.map[node.first] as stringText & MNodeExtra),
                text,
            };
            update.selection = {
                idx: node.first,
                loc: pt.length,
            };
        }
        update.map[parent.idx] = { ...node, templates };
        updateStore(store, update);
        return true;
    }

    if (parent.child.type === 'child' && atStart && parent.child.at > 0) {
        if (removeEmptyPrev(parent, parent.child.at, store)) {
            return true;
        }
    }

    if (parent.child.type === 'inside' || parent.child.type === 'end') {
        // change the thing to an empty identifier prolly
        const mp: Map = {
            [idx]: {
                ...store.map[idx],
                ...{ type: 'identifier', text: '' },
            },
        };
        updateStore(store, { map: mp });
        return true;
    }

    if (parent.child.type === 'child') {
        if (text === '') {
            const mp: UpdateMap = {};
            const pnode = store.map[parent.idx];
            const res = rmChild(pnode, parent.child.at);
            if (!res) {
                return false;
            }
            const { contents, nidx } = res;
            if (contents.values.length === 0) {
                mp[parent.idx] = {
                    ...pnode,
                    ...{ type: 'identifier', text: '' },
                };
                updateStore(store, {
                    map: mp,
                    selection: {
                        idx: parent.idx,
                    },
                });
                return true;
            }
            mp[parent.idx] = { ...pnode, ...contents };
            updateStore(store, {
                map: mp,
                selection:
                    nidx != null
                        ? { idx: nidx, loc: 'end' }
                        : { idx: parent.idx, loc: 'start' },
            });
            return true;
        } else if (atStart) {
            // Can we merge with the previous child?
            // if so, go for it, otherwise just goLeft
            events.onLeft();
            return true;
        }
    }

    return false;
};
