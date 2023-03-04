import React, { useEffect, useState } from 'react';
import { Attachment as ATT } from '../../src/types/cst';
import { MNodeExtra } from '../../src/types/mcst';
import { handleBackspace, maybeRemoveEmptyPrev } from '../mods/handleBackspace';
import { addSpace, maybeUpdate } from '../mods/handleSpace';
import { Path, setSelection, UpdateMap, updateStore } from '../store';
import { AttachmentLabel } from './AttachmentLabel';
import { Top } from './IdentifierLike';
import { Events } from './Nodes';

export const Attachment = ({
    node,
    path,
    top,
    idx,
    events,
}: {
    node: ATT & MNodeExtra;
    path: Path[];
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
                    accept="image/*"
                    multiple={false}
                    onInput={(evt) => {
                        // BTW would be cool to like support
                        // multiple files?
                        if (evt.currentTarget.files?.length === 1) {
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
                                                    mime: file.type,
                                                    ...meta,
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
                backgroundColor: 'rgb(47 47 47)',
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
                        [node.loc.idx]: { ...node, name: text },
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
                    transition: 'max-height .1s ease',
                    maxHeight: expanded ? 200 : 24,
                    borderRadius: 3,
                    marginInlineStart: expanded ? 0 : 8,
                    marginBlockStart: expanded ? 8 : 0,
                    // marginTop: 8,
                }}
            />
            {expanded ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        alignSelf: 'stretch',
                        paddingLeft: 8,
                    }}
                >
                    {node.file.meta.mime}
                    <button
                        onClick={() => {
                            updateStore(top.store, {
                                map: { [idx]: { ...node, file: null } },
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
