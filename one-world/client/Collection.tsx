import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node, Path, Selection, serializePath } from '../shared/nodes';
import { DocSession, NodeSelection, PersistedState } from '../shared/state';
import { Hidden } from './HiddenInput';
import { Store, useStore } from './StoreContext';
import { EditState } from './TextEdit/Id';
import { ManagedId, selectionAction } from './TextEdit/ManagedId';
import { handleAction } from './TextEdit/actions';
import { specials, textKey } from './keyboard';
import { cursorStyle } from './TextEdit/renderTextAndCursor';
import { TopNode } from './Edit';

export const Collection = ({
    node,
    tid,
    path,
    selection,
}: {
    node: Extract<Node, { type: 'list' | 'array' | 'record' }>;
    tid: string;
    path: Path;
    selection: void | NodeSelection;
}) => {
    const [l, r] = { list: '()', array: '[]', record: '{}' }[node.type];
    const store = useStore();
    return (
        <span>
            {selection?.type === 'without' && selection.location === 'start' ? (
                <span style={cursorStyle(false)}>{'|'}</span>
            ) : null}
            <span
                onMouseDown={(evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    clickBracket(evt, store, node.items, path, true);
                }}
            >
                {l}
            </span>
            {selection?.type === 'without' &&
            selection.location === 'inside' ? (
                <span style={cursorStyle(false)}>{'|'}</span>
            ) : null}
            {node.items.map((loc, i) => (
                <React.Fragment key={loc}>
                    {i === 0 ? null : (
                        <span
                            style={{ width: 8, cursor: 'text' }}
                            onMouseDown={(evt) => {
                                evt.preventDefault();
                                evt.stopPropagation();
                                clickSpace(evt, path, node, i, store, loc);
                            }}
                        />
                    )}
                    <TopNode id={tid} loc={loc} parentPath={path} />
                </React.Fragment>
            ))}
            <span
                onMouseDown={(evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    clickBracket(evt, store, node.items, path, false);
                }}
            >
                {r}
            </span>
            {selection?.type === 'without' && selection.location === 'end' ? (
                <span style={cursorStyle(false)}>{'|'}</span>
            ) : null}
        </span>
    );
};

const isLeft = (evt: React.MouseEvent) => {
    const box = evt.currentTarget.getBoundingClientRect();
    return evt.clientX < (box.left + box.right) / 2;
};

const setSelection = (store: Store, doc: string, sel: NodeSelection) => {
    store.update({
        type: 'in-session',
        action: { type: 'multi', actions: [] },
        doc,
        selections: [sel],
    });
};

const selectNode = (node: Node, path: Path, start: boolean): NodeSelection => {
    if (
        node.type === 'id' ||
        node.type === 'accessText' ||
        node.type === 'stringText'
    ) {
        return {
            type: 'within',
            cursor: start ? 0 : splitGraphemes(node.text).length,
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
            location: start ? 'start' : 'end',
            path,
            pathKey: serializePath(path),
        };
    }
    throw new Error(`dont no how to select ${node.type}`);
};

const getNodeForPath = (path: Path, state: PersistedState) => {
    return state.toplevels[path.root.toplevel].nodes[
        path.children[path.children.length - 1]
    ];
};

const clickBracket = (
    evt: React.MouseEvent<HTMLSpanElement>,
    store: Store,
    items: number[],
    path: Path,
    left: boolean,
) => {
    console.log('clicjing brakcet');
    const box = evt.currentTarget.getBoundingClientRect();
    const l = evt.clientX < (box.left + box.right) / 2;

    if (l !== left && items.length) {
        const cid = items[left ? 0 : items.length - 1];
        const cpath: Path = { ...path, children: path.children.concat([cid]) };
        setSelection(
            store,
            path.root.doc,
            selectNode(getNodeForPath(cpath, store.getState()), cpath, left),
        );
        return;
    }

    setSelection(store, path.root.doc, {
        type: 'without',
        location: l === left ? (left ? 'start' : 'end') : 'inside',
        pathKey: serializePath(path),
        path,
    });
};

function clickSpace(
    evt: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    path: Path,
    node: { type: 'list' | 'array' | 'record'; items: number[]; loc: number },
    i: number,
    store: Store,
    loc: number,
) {
    if (isLeft(evt)) {
        const lpath = {
            ...path,
            children: path.children.concat([node.items[i - 1]]),
        };
        setSelection(
            store,
            path.root.doc,
            selectNode(getNodeForPath(lpath, store.getState()), lpath, false),
        );
    } else {
        const rpath = {
            ...path,
            children: path.children.concat([loc]),
        };
        setSelection(
            store,
            path.root.doc,
            selectNode(getNodeForPath(rpath, store.getState()), rpath, true),
        );
    }
}
