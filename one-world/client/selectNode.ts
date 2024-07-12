import React from 'react';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node, Path, serializePath } from '../shared/nodes';
import { NodeSelection, PersistedState } from '../shared/state';
import { Store } from './StoreContext';
import { isCollection, isText } from './TextEdit/actions';

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

export const selectAll = (path: Path): NodeSelection => ({
    type: 'without',
    location: 'all',
    path,
    pathKey: serializePath(path),
});

export const selectNode = (
    node: Node,
    path: Path,
    side: 'start' | 'end' | 'all',
): NodeSelection => {
    if (side === 'all') {
        return {
            type: 'without',
            location: 'all',
            path,
            pathKey: serializePath(path),
        };
    }
    if (isText(node)) {
        return {
            type: 'within',
            cursor: side === 'start' ? 0 : splitGraphemes(node.text).length,
            // start: side === 'all' ? 0 : undefined,
            path,
            pathKey: serializePath(path),
        };
    }
    return {
        type: 'without',
        location: side,
        path,
        pathKey: serializePath(path),
    };
};

export const getNodeForPath = (path: Path, state: PersistedState) => {
    return state.toplevels[path.root.toplevel].nodes[
        path.children[path.children.length - 1]
    ];
};
