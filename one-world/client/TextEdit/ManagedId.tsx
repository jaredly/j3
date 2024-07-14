import React, { useEffect, useMemo, useRef, useState } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Path, serializePath } from '../../shared/nodes';
import { NodeSelection } from '../../shared/state';
import { RenderTextAndCursor } from './renderTextAndCursor';
import { getNewSelection } from './getNewSelection';
import { useStore } from '../StoreContext';
import { useLatest } from '../../../web/custom/useLatest';
import { Action } from '../../shared/action';
import { getNodeForPath, selectNode, setSelection } from '../selectNode';
import { fasthash, getRainbowHashColor } from '../../../web/custom/rainbow';
import { colors } from './colors';

const blinkTime = 500;

export const ManagedId = ({
    path,
    selection,
    node,
}: {
    path: Path;
    selection: void | NodeSelection;
    node: {
        type: 'id' | 'stringText' | 'accessText';
        text: string;
        loc: number;
    };
}) => {
    const store = useStore();
    const [blink, setBlink] = useState(false);
    useEffect(() => {
        if (!selection) {
            return;
        }
        setBlink(false);
        const iv = setInterval(() => {
            setBlink((b) => !b);
        }, blinkTime);
        return () => clearInterval(iv);
    }, [selection]);

    const pathKey = useMemo(() => serializePath(path), [path]);

    const color = useMemo(
        () =>
            node.type === 'stringText'
                ? colors.string
                : getRainbowHashColor(
                      fasthash(
                          (selection?.type === 'id'
                              ? selection.text?.join('')
                              : null) ?? node.text,
                      ),
                  ),
        [node.text, selection?.type === 'id' ? selection.text : null],
    );

    return (
        <span
            style={{
                // padding: '0 4px',
                // backgroundColor: '#222',
                backgroundColor:
                    selection?.type === 'multi'
                        ? colors.nodeSelection
                        : undefined,
                boxSizing: 'border-box',
                whiteSpace: 'pre',
                cursor: 'text',
                color,
                // to lessen the jolty colors
                transition: '.2s ease color',
            }}
            ref={store.textRef(path, pathKey)}
            onDoubleClick={() => {
                setSelection(
                    store,
                    path.root.doc,
                    selectNode(
                        getNodeForPath(path, store.getState()),
                        path,
                        'all',
                    ),
                );
            }}
            onMouseDown={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const text =
                    (selection?.type === 'id' ? selection.text : null) ??
                    splitGraphemes(node.text);
                const range = new Range();

                let { sel, start } = getNewSelection(
                    selection?.type === 'id'
                        ? {
                              start: selection.start,
                              sel: selection.cursor,
                              text,
                          }
                        : null,
                    evt.currentTarget,
                    { x: evt.clientX, y: evt.clientY },
                    evt.shiftKey,
                    range,
                );

                // const action: Action = selectionAction(
                //     path,
                //     sel,
                //     start,
                //     evt.metaKey
                //         ? store.getDocSession(path.root.doc, store.session)
                //               .selections
                //         : [],
                //     selection?.type === 'id' ? selection.text : undefined,
                //     [],
                // );
                // store.update(action);
                store.startDrag(pathKey, path);
            }}
        >
            {selection?.type === 'id'
                ? RenderTextAndCursor({
                      state: {
                          start: selection.start,
                          sel: selection.cursor,
                          text: selection.text ?? splitGraphemes(node.text),
                      },
                      blink,
                  })
                : node.text}
        </span>
    );
};

export const useDrag = (selection: void | NodeSelection, path: Path) => {
    const store = useStore();
    const [drag, setDrag] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const latest = useLatest(selection);
    useEffect(() => {
        if (!drag) return;
        const up = () => setDrag(false);
        const move = (evt: MouseEvent) => {
            const selection = latest.current;
            const range = new Range();
            const sel = getNewSelection(
                selection?.type === 'id'
                    ? {
                          start: selection.start,
                          sel: selection.cursor,
                      }
                    : null,

                ref.current!,
                { x: evt.clientX, y: evt.clientY },
                true,
                range,
            );

            store.update({
                type: 'in-session',
                action: { type: 'multi', actions: [] },
                doc: path.root.doc,
                selections: [
                    {
                        type: 'id',
                        cursor: sel.sel,
                        start:
                            sel.start ??
                            (selection?.type === 'id'
                                ? selection.cursor
                                : undefined),
                        path,
                        pathKey: serializePath(path),
                        text:
                            selection?.type === 'id'
                                ? selection.text
                                : undefined,
                    },
                ],
            });
        };
        document.addEventListener('mouseup', up);
        document.addEventListener('mousemove', move);

        return () => {
            document.removeEventListener('mouseup', up);
            document.removeEventListener('mousemove', move);
        };
    }, [drag]);
    return { ref, setDrag };
};

// export function selectionAction(
//     path: Path,
//     sel: number,
//     start: number | undefined,
//     before: NodeSelection[],
//     text: string[] | undefined,
//     after: NodeSelection[],
// ): Action {
//     return {
//         type: 'in-session',
//         action: { type: 'multi', actions: [] },
//         doc: path.root.doc,
//         selections: [
//             ...before,
//             {
//                 type: 'id',
//                 cursor: sel,
//                 start,
//                 path,
//                 pathKey: serializePath(path),
//                 text,
//             },
//             ...after,
//         ],
//     };
// }
