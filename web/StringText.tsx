import * as React from 'react';
import { Map } from '../src/types/mcst';
import {
    EvalCtx,
    Path,
    setSelection,
    Store,
    updateStore,
    useStore,
} from './store';
import { Events } from './Nodes';
import { SetHover } from './App';
import { stringText } from '../src/types/cst';
import { focus } from './IdentifierLike';
import { getPos, onKeyDown } from './onKeyDown';

// export const StringText = ({
//     idx,
//     ...props
// }: {
//     idx: number;
//     store: Store;
//     path: Path[];
//     events: Events;
//     ctx: EvalCtx;
//     setHover: SetHover;
// }) => {
//     const { node } = useStore(props.store, idx);
//     const snode = node as stringText;
//     return (
//         <IdentifierLike
//             type="string"
//             text={snode.text}
//             idx={snode.loc.idx}
//             {...props}
//         />
//     );
// };

export const StringText = ({
    idx,
    store,
    path,
    events,
    ctx,
    setHover,
}: {
    idx: number;
    store: Store;
    path: Path[];
    events: Events;
    ctx: EvalCtx;
    setHover: SetHover;
}) => {
    const { node } = useStore(store, idx);
    const text = (node as stringText).text;
    const editing = store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);

    edit = edit == null ? text : edit;

    const presel = React.useRef(null as null | number);

    React.useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (editing) {
            ref.current.textContent = text;
            if (ref.current !== document.activeElement || true) {
                focus(ref.current, store);
            }
            presel.current = getPos(ref.current);
        }
    }, [editing, text, editing ? store.selection!.loc : null]);

    const dec = ctx.report.errors[idx]
        ? 'underline red'
        : // : ctx.report.types[idx] == null

          // ? 'underline gray'
          'none';

    const style = {};

    const ref = React.useRef(null as null | HTMLSpanElement);
    return !editing ? (
        <span
            className="idlike"
            style={{
                color: 'yello',
                minHeight: '1.3em',
                whiteSpace: 'pre-wrap',
                textDecoration: dec,
            }}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                setEdit(text);
                setSelection(store, { idx });
            }}
            onMouseOver={(evt) =>
                setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseLeave={() => setHover({ idx, box: null })}
        >
            {text}
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
            onMouseDown={(evt) => evt.stopPropagation()}
            onMouseOver={(evt) =>
                setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseUp={(evt) => {
                presel.current = getPos(evt.currentTarget);
            }}
            onMouseLeave={() => setHover({ idx, box: null })}
            onInput={(evt) => {
                const text = evt.currentTarget.textContent ?? '';
                setEdit(text);
                const pos = getPos(evt.currentTarget);
                const mp: Map = {
                    [node.loc.idx]: {
                        node: {
                            type: 'stringText',
                            loc: node.loc,
                            text,
                        },
                    },
                };
                updateStore(
                    store,
                    {
                        map: mp,
                        selection: {
                            idx,
                            loc: pos,
                        },
                        prev: {
                            idx,
                            loc: presel.current ?? undefined,
                        },
                    },
                    [path],
                );
                // onInput(evt, setEdit, idx, path, store, presel);
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(store, null);
            }}
            style={{
                color: 'yellow',
                whiteSpace: 'pre-wrap',
                outline: 'none',
                minHeight: '1.3em',
                textDecoration: dec,
                ...style,
            }}
            onKeyDown={(evt) => {
                if (
                    evt.key === 'ArrowLeft' ||
                    evt.key === 'ArrowRight' ||
                    evt.metaKey ||
                    evt.altKey ||
                    evt.ctrlKey
                ) {
                    onKeyDown(evt, idx, path, events, store);
                    return;
                }
            }}
        />
    );
};
