import React, { useEffect, useState } from 'react';
import { Attachment as ATT } from '../../src/types/cst';
import { MNodeExtra } from '../../src/types/mcst';
import { handleBackspace, maybeRemoveEmptyPrev } from '../mods/handleBackspace';
import { addSpace, maybeUpdate } from '../mods/handleSpace';
import { getPos, isAtEnd, isAtStart } from '../mods/onKeyDown';
import { Path, setSelection, Store, UpdateMap, updateStore } from '../store';
import { focus, Top } from './IdentifierLike';
import { Events } from './Nodes';

export const Attachment = ({
    node,
    path,
    top,
    // layout,
    idx,
    events,
}: {
    node: ATT & MNodeExtra;
    path: Path[];
    // layout: Map[0]['layout'];
    events: Events;
    idx: number;
    top: Top;
}) => {
    const [loading, setLoading] = useState(false);

    const [expanded, setExpanded] = useState(false);

    const [url, setUrl] = useState(null as null | string);

    useEffect(() => {
        if (!node.file?.handle) {
            setUrl(null);
            return;
        }
        top.ctx.attachments.retrieve(node.file.handle).then((blob) => {
            setUrl(URL.createObjectURL(blob));
        });
    }, [node.file?.handle]);

    if (loading) {
        return <span>loading...</span>;
    }

    if (!node.file) {
        return (
            <div>
                <input
                    type="file"
                    accept="image/*, *"
                    multiple={false}
                    onInput={(evt) => {
                        // BTW would be cool to like support
                        // multiple files?
                        if (evt.currentTarget.files?.length === 1) {
                            const reader = new FileReader();
                            const file = evt.currentTarget.files[0];
                            const imageMeta = getImageMeta(file);
                            setLoading(true);
                            top.ctx.attachments.store(file).then(async (id) => {
                                setLoading(false);
                                const meta = await imageMeta;
                                updateStore(top.store, {
                                    map: {
                                        [idx]: {
                                            ...node,
                                            name: node.name || file.name,
                                            file: {
                                                handle: id,
                                                meta: {
                                                    type: 'image',
                                                    ...meta,
                                                    mime: file.type,
                                                },
                                            },
                                        },
                                    },
                                });
                            });
                        }
                    }}
                />
            </div>
        );
    }

    if (!url) {
        return <span>Loading</span>;
    }

    return (
        <div
            style={{
                // padding: '0 8px',
                backgroundColor: '#777',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 4,
                ...(expanded
                    ? {
                          flexDirection: 'column',
                      }
                    : {}),
            }}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                setSelection(top.store, { idx, loc: 'end' });
            }}
        >
            <AttachmentLabel
                top={top}
                text={node.name ?? 'Hello'}
                idx={idx}
                events={events}
                onBackspace={(empty) => {
                    if (!empty) {
                        maybeRemoveEmptyPrev(
                            path[path.length - 1],
                            top.store,
                        ) || events.onLeft();
                    } else {
                        handleBackspace('', true, idx, path, events, top.store);
                    }
                }}
                onInput={(pos, text, presel) => {
                    const mp: UpdateMap = {
                        [node.loc.idx]: {
                            ...node,
                            name: text,
                        },
                    };
                    updateStore(top.store, {
                        map: mp,
                        selection: { idx, loc: pos },
                        prev: { idx, loc: presel ?? undefined },
                    });
                }}
                onEnter={(start) => {
                    const parent = path[path.length - 1];
                    const update = addSpace(top.store, path, !start);
                    maybeUpdate(top.store, update);
                    return;
                }}
            />

            <img
                src={url}
                onMouseDown={(evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                    setExpanded(!expanded);
                }}
                style={{
                    transition: 'max-height .3s ease',
                    maxHeight: expanded ? 200 : 24,
                    borderRadius: 3,
                    marginInlineStart: expanded ? 0 : 8,
                    marginBlockStart: expanded ? 8 : 0,
                    // marginTop: 8,
                }}
            />
            {expanded ? (
                <div>
                    {node.file.meta.mime}
                    <button
                        onClick={() => {
                            updateStore(top.store, {
                                map: {
                                    [idx]: {
                                        ...node,
                                        file: null,
                                    },
                                },
                            });
                        }}
                    >
                        Clear
                    </button>
                </div>
            ) : null}
        </div>
    );
};

export const AttachmentLabel = ({
    top,
    text,
    idx,
    onInput,
    events,
    onEnter,
    onBackspace,
}: {
    top: Top;
    text: string;
    idx: number;
    onInput: (pos: number, text: string, presel: number | null) => void;
    events: Events;
    onEnter: (start: boolean) => void;
    onBackspace: (empty: boolean) => void;
}) => {
    const editing = top.store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);
    edit = edit == null ? text : edit;

    const presel = React.useRef(null as null | number);
    const ref = React.useRef(null as null | HTMLSpanElement);
    React.useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (editing) {
            ref.current.textContent = text;
            if (ref.current !== document.activeElement || true) {
                focus(ref.current, top.store);
            }
            presel.current = getPos(ref.current);
        }
    }, [editing, text, editing ? top.store.selection!.loc : null]);

    return !editing ? (
        <span
            style={{
                color: 'yellow',
                minHeight: '1.3em',
                whiteSpace: 'pre-wrap',
                paddingLeft: 8,
            }}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                setEdit(text);
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
            style={{
                color: 'yellow',
                whiteSpace: 'pre-wrap',
                outline: 'none',
                minHeight: '1.3em',
                paddingLeft: 8,
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
                onInput(pos, text, presel.current);
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
                    return onBackspace(evt.currentTarget.textContent! === '');
                }
                if (evt.key === ' ') {
                    if (isAtEnd(evt.currentTarget)) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        onEnter(false);
                        return;
                    }
                    if (isAtStart(evt.currentTarget)) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        onEnter(true);
                        return;
                    }
                }
                if (evt.key === 'Enter') {
                    evt.preventDefault();
                    evt.stopPropagation();
                    onEnter(
                        isAtStart(evt.currentTarget) &&
                            !isAtEnd(evt.currentTarget),
                    );
                    return;
                }
            }}
        />
    );
};

const getImageMeta = (
    file: Blob,
): Promise<{ width: number; height: number }> => {
    return new Promise((res, rej) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            res({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = (err) => rej(err);
    });
};
