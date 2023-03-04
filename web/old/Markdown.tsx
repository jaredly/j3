import React from 'react';
import { Markdown as MDT } from '../../src/types/cst';
import { MNodeExtra } from '../../src/types/mcst';
import { getPos, isAtEnd, isAtStart } from '../mods/onKeyDown';
import { Path, setSelection, UpdateMap, updateStore } from '../store';
import { focus, Top } from './IdentifierLike';
import { Events } from './Nodes';

export const Markdown = ({
    top,
    node,
    idx,
    events,
    path,
}: {
    path: Path[];
    top: Top;
    node: MDT & MNodeExtra;
    idx: number;
    events: Events;
}) => {
    const editing = top.store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);
    edit = edit == null ? node.text : edit;

    const presel = React.useRef(null as null | number);
    const ref = React.useRef(null as null | HTMLSpanElement);
    React.useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (editing) {
            ref.current.textContent = node.text;
            if (ref.current !== document.activeElement || true) {
                focus(ref.current, top.store);
            }
            presel.current = getPos(ref.current);
        }
    }, [editing, node.text, editing ? top.store.selection!.loc : null]);

    return !editing ? (
        <span
            style={{
                color: 'yellow',
                minHeight: '1.3em',
                whiteSpace: 'pre-wrap',
                // paddingLeft: 8,
            }}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                setEdit(node.text);
                setSelection(top.store, { idx });
            }}
            onMouseOver={(evt) =>
                top.setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseLeave={() => top.setHover({ idx, box: null })}
        >
            {node.text}
        </span>
    ) : (
        <span
            data-idx={idx}
            contentEditable
            ref={ref}
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
            className="idlike"
            style={{
                color: 'yellow',
                whiteSpace: 'pre-wrap',
                outline: 'none',
                minHeight: '1.3em',
                // paddingLeft: 8,
                // textDecoration: dec,
                // ...style,
            }}
            onMouseDown={(evt) => evt.stopPropagation()}
            onMouseOver={(evt) =>
                top.setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseUp={(evt) => {
                presel.current = getPos(evt.currentTarget);
            }}
            onMouseLeave={() => top.setHover({ idx, box: null })}
            onInput={(evt) => {
                const text = evt.currentTarget.textContent ?? '';
                setEdit(text);
                const pos = getPos(evt.currentTarget);
                // onInput(pos, text, presel.current);
                const mp: UpdateMap = {
                    [node.loc.idx]: { ...node, text },
                };
                updateStore(top.store, {
                    map: mp,
                    selection: { idx, loc: pos },
                    prev: { idx, loc: presel.current ?? undefined },
                });
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(top.store, null);
            }}
            onKeyDown={(evt) => {
                if (evt.key === 'ArrowLeft' && isAtStart(evt.currentTarget)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    events.onLeft();
                    return;
                }
                if (evt.key === 'ArrowRight' && isAtEnd(evt.currentTarget)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    events.onRight();
                    return;
                }
                if (evt.key === 'Backspace' && isAtStart(evt.currentTarget)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    // return onBackspace(evt.currentTarget.textContent! === '');
                }
                // if (evt.key === ' ') {
                //     if (isAtEnd(evt.currentTarget)) {
                //         evt.preventDefault();
                //         evt.stopPropagation();
                //         // onEnter(false);
                //         return;
                //     }
                //     if (isAtStart(evt.currentTarget)) {
                //         evt.preventDefault();
                //         evt.stopPropagation();
                //         // onEnter(true);
                //         return;
                //     }
                // }
                // if (evt.key === 'Enter') {
                //     evt.preventDefault();
                //     evt.stopPropagation();
                //     // onEnter(
                //     //     isAtStart(evt.currentTarget) &&
                //     //         !isAtEnd(evt.currentTarget),
                //     // );
                //     return;
                // }
            }}
        />
    );
};
