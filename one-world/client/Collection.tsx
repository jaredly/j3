import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node, Path, Selection, serializePath } from '../shared/nodes';
import { DocSession, NodeSelection } from '../shared/state';
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
                                clickBracket(
                                    evt,
                                    store,
                                    node.items,
                                    path,
                                    false,
                                );
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
        const cpath: Path = {
            ...path,
            children: path.children.concat([cid]),
        };
        console.log('insides');
        const inside =
            store.getState().toplevels[path.root.toplevel].nodes[cid];
        store.update({
            type: 'in-session',
            action: { type: 'multi', actions: [] },
            doc: path.root.doc,
            selections: [
                inside.type === 'id'
                    ? {
                          type: 'within',
                          cursor: left ? 0 : splitGraphemes(inside.text).length,
                          path: cpath,
                          pathKey: serializePath(cpath),
                      }
                    : {
                          type: 'without',
                          location: 'start',
                          pathKey: serializePath(cpath),
                          path: cpath,
                      },
            ],
        });
        return;
    }

    store.update({
        type: 'in-session',
        action: { type: 'multi', actions: [] },
        doc: path.root.doc,
        selections: [
            {
                type: 'without',
                location: l === left ? (left ? 'start' : 'end') : 'inside',
                pathKey: serializePath(path),
                path,
            },
        ],
    });
};
