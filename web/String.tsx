import * as React from 'react';
import { Map, MCString } from '../src/types/mcst';
import {
    EvalCtx,
    Path,
    setSelection,
    Store,
    updateStore,
    useStore,
} from './store';
import { Events, rainbow } from './Nodes';
import { Blinker } from './Blinker';
import { SetHover } from './App';
import { Expr, Node } from '../src/types/ast';
import { Report } from '../src/get-type/get-types-new';
import { errorToString } from '../src/to-cst/show-errors';
import { Ctx } from '../src/to-ast/to-ast';
import { CString, stringText } from '../src/types/cst';
import { sideClick } from './ListLike';
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

export const StringView = ({
    node,
    store,
    path,
    // layout,
    idx,
    events,
    ctx,
    setHover,
}: {
    node: MCString;
    store: Store;
    path: Path[];
    // layout: Map[0]['layout'];
    events: Events;
    idx: number;
    ctx: EvalCtx;
    setHover: SetHover;
}) => {
    return (
        <span>
            {store.selection?.idx === idx && store.selection.loc === 'start' ? (
                <Blinker
                    idx={idx}
                    store={store}
                    path={path.concat([{ idx, child: { type: 'start' } }])}
                    style={{ color: rainbow[path.length % rainbow.length] }}
                    events={{
                        onLeft() {
                            events.onLeft();
                        },
                        onRight() {
                            setSelection(store, {
                                idx: node.first,
                                loc: 'start',
                            });
                        },
                    }}
                />
            ) : null}
            <span
                style={{
                    color: 'yellow',
                    fontVariationSettings:
                        store.selection?.idx === idx ? '"wght" 900' : '',
                }}
                onMouseDown={sideClick((left) => {
                    if (left) {
                        setSelection(store, {
                            idx,
                            loc: 'start',
                        });
                    } else {
                        setSelection(store, { idx: node.first, loc: 'start' });
                    }
                })}
            >
                "
            </span>
            <StringText
                idx={node.first}
                store={store}
                path={path}
                events={{
                    onLeft() {
                        setSelection(store, {
                            idx,
                            loc: 'start',
                        });
                    },
                    onRight() {
                        setSelection(store, {
                            idx,
                            loc: 'end',
                        });
                    },
                }}
                ctx={ctx}
                setHover={setHover}
            />
            <span
                style={{
                    color: 'yellow',
                    alignSelf: 'flex-end',
                    fontVariationSettings:
                        store.selection?.idx === idx ? '"wght" 900' : '',
                }}
                onMouseDown={sideClick((left) => {
                    if (left) {
                        setSelection(
                            store,
                            node.templates.length
                                ? {
                                      idx: node.templates[
                                          node.templates.length - 1
                                      ].suffix,
                                      loc: 'end',
                                  }
                                : { idx: node.first, loc: 'end' },
                        );
                    } else {
                        setSelection(store, {
                            idx,
                            loc: 'end',
                        });
                    }
                })}
            >
                "
            </span>
            {store.selection?.idx === idx && store.selection.loc === 'end' ? (
                <Blinker
                    idx={idx}
                    store={store}
                    path={path.concat([{ idx, child: { type: 'end' } }])}
                    style={{ color: rainbow[path.length % rainbow.length] }}
                    events={{
                        onLeft() {
                            setSelection(store, {
                                idx: node.first,
                                loc: 'end',
                            });
                        },
                        onRight() {
                            events.onRight();
                        },
                    }}
                />
            ) : null}
        </span>
    );
};
