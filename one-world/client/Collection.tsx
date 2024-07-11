import React from 'react';
import { Node, Path, serializePath } from '../shared/nodes';
import { NodeSelection } from '../shared/state';
import { TopNode } from './Edit';
import { Store, useStore } from './StoreContext';
import { cursorStyle } from './TextEdit/renderTextAndCursor';
import { getNodeForPath, isLeft, selectNode, setSelection } from './selectNode';

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