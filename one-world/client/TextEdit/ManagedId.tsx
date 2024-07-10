import React, { useEffect, useRef, useState } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Path, serializePath } from '../../shared/nodes';
import { NodeSelection } from '../../shared/state';
import { RenderTextAndCursor } from './renderTextAndCursor';
import { getNewSelection } from './getNewSelection';
import { useStore } from '../StoreContext';
import { useLatest } from '../../../web/custom/useLatest';
import { Action } from '../../shared/action';

const blinkTime = 500;
const blinkWait = 200;

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

    const { ref, setDrag } = useDrag(node.text, selection, path);

    return (
        <span
            style={{
                padding: '0 4px',
                backgroundColor: '#222',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
            }}
            ref={ref}
            onMouseDown={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const text =
                    (selection?.type === 'within' ? selection.text : null) ??
                    splitGraphemes(node.text);
                const range = new Range();

                let { sel, start } = getNewSelection(
                    text,
                    selection?.type === 'within'
                        ? {
                              start: selection.start,
                              sel: selection.cursor,
                              text,
                          }
                        : null,
                    evt.currentTarget,
                    evt.clientX,
                    evt.shiftKey,
                    range,
                );

                const action: Action = selectionAction(
                    path,
                    sel,
                    start,
                    selection,
                    selection?.type === 'within' ? selection.text : undefined,
                );
                store.update(action);

                // setState({ sel, start, text });
                // resetBlink();
                setDrag(true);
            }}
        >
            {selection?.type === 'within'
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

export const useDrag = (
    nodeText: string,
    selection: void | NodeSelection,
    path: Path,
    // latest: React.MutableRefObject<EditState | null>,
    // setState: React.Dispatch<React.SetStateAction<EditState | null>>,
    // resetBlink: () => void,
) => {
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
            const text =
                (selection?.type === 'within' ? selection.text : undefined) ??
                splitGraphemes(nodeText);
            const sel = getNewSelection(
                text,
                selection?.type === 'within'
                    ? {
                          start: selection.start,
                          sel: selection.cursor,
                          text,
                      }
                    : null,

                ref.current!,
                evt.clientX,
                true,
                range,
            );
            // setState({ text, sel: sel.sel, start: state?.start ?? state?.sel });

            store.update({
                type: 'in-session',
                action: { type: 'multi', actions: [] },
                doc: path.root.doc,
                selections: [
                    {
                        type: 'within',
                        cursor: sel.sel,
                        start:
                            sel.start ??
                            (selection?.type === 'within'
                                ? selection.cursor
                                : undefined),
                        path,
                        pathKey: serializePath(path),
                        text:
                            selection?.type === 'within'
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

export function selectionAction(
    path: Path,
    sel: number,
    start: number | undefined,
    selection: void | NodeSelection,
    text?: string[],
): Action {
    return {
        type: 'in-session',
        action: { type: 'multi', actions: [] },
        doc: path.root.doc,
        selections: [
            {
                type: 'within',
                cursor: sel,
                start,
                path,
                pathKey: serializePath(path),
                text, //: selection?.type === 'within' ? selection.text : undefined,
            },
        ],
    };
}
