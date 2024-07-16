import React from 'react';
import { Node, Path, pathWithChildren, serializePath } from '../shared/nodes';
import { NodeSelection } from '../shared/state';
import { TopNode } from './Edit';
import { Store, useStore } from './StoreContext';
import {
    cursorStyle,
    RenderTextAndCursor,
} from './TextEdit/renderTextAndCursor';
import {
    getNodeForPath,
    isLeft,
    selectAll,
    selectNode,
    setSelection,
} from './selectNode';
import { colors } from './TextEdit/colors';
import { clickPunctuation } from './clickPunctuation';
import { useBlink } from './TextEdit/ManagedId';
import { splitGraphemes } from '../../src/parse/splitGraphemes';

export const String = ({
    node,
    tid,
    path,
    selection,
}: {
    node: Extract<Node, { type: 'string' }>;
    tid: string;
    path: Path;
    selection: void | NodeSelection;
}) => {
    const store = useStore();

    const blink = useBlink(selection);

    return (
        <span
            style={{
                backgroundColor:
                    selection?.type === 'multi'
                        ? colors.nodeSelection
                        : colors.stringBg,
            }}
        >
            {selection?.type === 'other' && selection.location === 'start' ? (
                <span style={cursorStyle(false)}>{'|'}</span>
            ) : null}
            <span
                // onMouseDown={(evt) =>
                //     clickPunctuation(evt, store, null, node.first, path)
                // }
                style={{ color: colors.string }}
            >
                "
            </span>
            {selection?.type === 'string' && selection.cursor.part === 0
                ? RenderTextAndCursor({
                      state: {
                          start:
                              selection.start?.part === selection.cursor.part
                                  ? selection.start.char
                                  : selection.start
                                  ? -1
                                  : undefined,
                          sel: selection.cursor.char,
                          text:
                              selection.text?.[0] ?? splitGraphemes(node.first),
                      },
                      blink,
                  })
                : node.first}
            {/* <TopNode id={tid} loc={node.first} parentPath={path} /> */}
            {node.templates.map(({ expr, suffix }, i) => (
                <React.Fragment key={expr}>
                    <span
                    // onMouseDown={(evt) =>
                    //     clickPunctuation(
                    //         evt,
                    //         store,
                    //         i === 0
                    //             ? node.first
                    //             : node.templates[i - 1].suffix,
                    //         expr,
                    //         path,
                    //     )
                    // }
                    >
                        {'${'}
                    </span>
                    <TopNode id={tid} loc={expr} parentPath={path} />
                    <span
                    // onMouseDown={(evt) =>
                    //     clickPunctuation(evt, store, expr, suffix, path)
                    // }
                    >
                        {'}'}
                    </span>
                    {/* <TopNode id={tid} loc={suffix} parentPath={path} /> */}
                </React.Fragment>
            ))}
            <span
                onMouseDown={(evt) => {
                    const last = node.templates.length
                        ? node.templates[node.templates.length - 1].suffix
                        : node.first;
                    // clickPunctuation(evt, store, last, null, path);
                }}
                style={{ color: colors.string }}
            >
                "
            </span>
            {selection?.type === 'other' && selection.location === 'end' ? (
                <span style={cursorStyle(false)}>{'|'}</span>
            ) : null}
        </span>
    );
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
            selectNode(getNodeForPath(lpath, store.getState()), lpath, 'end'),
        );
    } else {
        const rpath = {
            ...path,
            children: path.children.concat([loc]),
        };
        setSelection(
            store,
            path.root.doc,
            selectNode(getNodeForPath(rpath, store.getState()), rpath, 'start'),
        );
    }
}
