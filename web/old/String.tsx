import * as React from 'react';
import { MCString } from '../../src/types/mcst';
import { EvalCtx, Path, setSelection, Store } from '../store';
import { Events, Node, rainbow } from './Nodes';
import { Blinker } from './Blinker';
import { SetHover } from './Doc';
import { sideClick } from './ListLike';
import { StringText } from './StringText';
import { Top } from './IdentifierLike';

export const StringView = ({
    node,
    path,
    top,
    // layout,
    idx,
    events,
}: {
    node: MCString;
    path: Path[];
    // layout: Map[0]['layout'];
    events: Events;
    idx: number;
    top: Top;
}) => {
    const { store, ctx, setHover } = top;
    return (
        <span>
            {store.selection?.idx === idx && store.selection.loc === 'start' ? (
                <Blinker
                    idx={idx}
                    store={store}
                    ectx={top.ctx}
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
                top={top}
                path={path.concat([{ idx, child: { type: 'text', at: 0 } }])}
                events={{
                    onLeft() {
                        setSelection(store, {
                            idx,
                            loc: 'start',
                        });
                    },
                    onRight() {
                        if (node.templates.length === 0) {
                            setSelection(store, {
                                idx,
                                loc: 'end',
                            });
                        } else {
                            setSelection(store, {
                                idx: node.templates[0].expr,
                                loc: 'start',
                            });
                        }
                    },
                }}
            />
            {node.templates.flatMap((t, i) => [
                <span
                    key={i}
                    onMouseDown={sideClick((left) => {
                        if (left) {
                            if (i === 0) {
                                setSelection(store, {
                                    idx: node.first,
                                    loc: 'end',
                                    from: 'right',
                                });
                            } else {
                                const suffix = node.templates[i - 1].suffix;
                                setSelection(store, {
                                    idx: suffix,
                                    loc: 'end',
                                    from: 'right',
                                });
                            }
                        } else {
                            setSelection(store, {
                                idx: t.expr,
                                loc: 'start',
                                from: 'left',
                            });
                        }
                    })}
                >
                    {'${'}
                </span>,
                <Node
                    key={t.expr}
                    idx={t.expr}
                    top={top}
                    path={path.concat([
                        { idx, child: { type: 'expr', at: i + 1 } },
                    ])}
                    events={{
                        onLeft() {
                            if (i === 0) {
                                setSelection(store, {
                                    idx: node.first,
                                    loc: 'end',
                                });
                            } else {
                                setSelection(store, {
                                    idx: node.templates[i - 1].suffix,
                                    loc: 'end',
                                });
                            }
                        },
                        onRight() {
                            setSelection(store, {
                                idx: t.suffix,
                                loc: 'start',
                            });
                        },
                    }}
                />,
                <span
                    key={i + 'end'}
                    onMouseDown={sideClick((left) => {
                        if (left) {
                            setSelection(store, {
                                idx: t.expr,
                                loc: 'end',
                                from: 'right',
                            });
                        } else {
                            setSelection(store, {
                                idx: t.suffix,
                                loc: 'start',
                                from: 'left',
                            });
                        }
                    })}
                >
                    {'}'}
                </span>,
                <StringText
                    key={t.suffix}
                    idx={t.suffix}
                    // store={store}
                    top={top}
                    path={path.concat([
                        { idx, child: { type: 'text', at: i + 1 } },
                    ])}
                    events={{
                        onLeft() {
                            setSelection(store, {
                                idx: t.expr,
                                loc: 'end',
                            });
                        },
                        onRight() {
                            if (i === node.templates.length - 1) {
                                setSelection(store, {
                                    idx,
                                    loc: 'end',
                                });
                            } else {
                                setSelection(store, {
                                    idx: node.templates[i + 1].expr,
                                    loc: 'start',
                                });
                            }
                        },
                    }}
                    // ctx={ctx}
                    // setHover={setHover}
                />,
            ])}
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
                    ectx={top.ctx}
                    store={store}
                    path={path.concat([{ idx, child: { type: 'end' } }])}
                    style={{ color: rainbow[path.length % rainbow.length] }}
                    events={{
                        onLeft() {
                            if (node.templates.length === 0) {
                                setSelection(store, {
                                    idx: node.first,
                                    loc: 'end',
                                });
                            } else {
                                setSelection(store, {
                                    idx: node.templates[
                                        node.templates.length - 1
                                    ].suffix,
                                    loc: 'end',
                                });
                            }
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
