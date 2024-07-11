import React from 'react';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node, Path, serializePath } from '../shared/nodes';
import { NodeSelection, PersistedState } from '../shared/state';
import { Store } from './StoreContext';

export const isLeft = (evt: React.MouseEvent) => {
    const box = evt.currentTarget.getBoundingClientRect();
    return evt.clientX < (box.left + box.right) / 2;
};

export const setSelection = (store: Store, doc: string, sel: NodeSelection) => {
    store.update({
        type: 'in-session',
        action: { type: 'multi', actions: [] },
        doc,
        selections: [sel],
    });
};

export const selectNode = (
    node: Node,
    path: Path,
    side: 'start' | 'end' | 'all',
): NodeSelection => {
    if (
        node.type === 'id' ||
        node.type === 'accessText' ||
        node.type === 'stringText'
    ) {
        return {
            type: 'within',
            cursor: side === 'start' ? 0 : splitGraphemes(node.text).length,
            start: side === 'all' ? 0 : undefined,
            path,
            pathKey: serializePath(path),
        };
    }
    if (
        node.type === 'list' ||
        node.type === 'array' ||
        node.type === 'record'
    ) {
        return {
            type: 'without',
            location: side,
            path,
            pathKey: serializePath(path),
        };
    }
    throw new Error(`dont no how to select ${node.type}`);
};

export const getNodeForPath = (path: Path, state: PersistedState) => {
    return state.toplevels[path.root.toplevel].nodes[
        path.children[path.children.length - 1]
    ];
};
