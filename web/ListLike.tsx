import * as React from 'react';
import { Map } from '../src/types/mcst';
import { Path, setSelection, Store } from './store';
import { Events, Node, rainbow } from './Nodes';

export const ListLike = ({
    left,
    right,
    children,
    store,
    path,
    layout,
    idx,
    events,
}: {
    left: string;
    right: string;
    children: number[];
    store: Store;
    path: Path[];
    layout: Map[0]['layout'];
    events: Events;
    idx: number;
}) => {
    const nodes = children.map((cidx, i) => (
        <Node
            idx={cidx}
            key={cidx}
            path={path.concat({
                idx,
                child: {
                    type: 'child',
                    at: i,
                },
            })}
            store={store}
            events={{
                onLeft() {
                    if (i > 0) {
                        setSelection(store, {
                            idx: children[i - 1],
                            side: 'end',
                        });
                    } else {
                        setSelection(store, { idx, side: 'start' });
                    }
                },
                onRight() {
                    if (i < children.length - 1) {
                        setSelection(store, {
                            idx: children[i + 1],
                            side: 'start',
                        });
                    } else {
                        setSelection(store, { idx, side: 'end' });
                    }
                },
            }}
        />
    ));

    const contents =
        layout?.type === 'multiline' ? (
            <span
                style={
                    layout.pairs
                        ? {
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0 8px',
                          }
                        : { display: 'flex', flexDirection: 'column' }
                }
            >
                {layout.tightFirst ? (
                    <span style={{ display: 'flex' }}>
                        {nodes.slice(0, layout.tightFirst).map((node, i) => (
                            <span
                                key={children[i]}
                                style={{ marginLeft: i === 0 ? 0 : 8 }}
                            >
                                {node}
                            </span>
                        ))}
                    </span>
                ) : null}

                {nodes.slice(layout.tightFirst).map((node, i) => (
                    <span
                        key={children[layout.tightFirst + i]}
                        style={{
                            marginLeft: layout.tightFirst ? 30 : 0,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                        }}
                    >
                        {node}
                    </span>
                ))}
            </span>
        ) : (
            nodes.map((node, i) => (
                <span key={children[i]} style={{ marginLeft: i === 0 ? 0 : 8 }}>
                    {node}
                </span>
            ))
        );

    return (
        <span
            className="hover"
            style={{
                display: 'flex',
            }}
        >
            {store.selection?.idx === idx &&
            store.selection.side === 'start' ? (
                <Blinker
                    style={{ color: rainbow[path.length % rainbow.length] }}
                    events={{
                        onLeft() {
                            events.onLeft();
                        },
                        onRight() {
                            setSelection(
                                store,
                                children.length
                                    ? {
                                          idx: children[0],
                                          side: 'start',
                                      }
                                    : { idx, side: 'inside' },
                            );
                        },
                    }}
                />
            ) : null}
            <span
                style={{
                    color: rainbow[path.length % rainbow.length],
                    opacity: 0.5,
                }}
                onMouseDown={sideClick((left) => {
                    if (left) {
                        setSelection(store, {
                            idx,
                            side: 'start',
                        });
                    } else {
                        setSelection(
                            store,
                            children.length
                                ? {
                                      idx: children[0],
                                      side: 'start',
                                  }
                                : { idx, side: 'inside' },
                        );
                    }
                })}
            >
                {left}
            </span>
            {store.selection?.idx === idx &&
            store.selection.side === 'inside' ? (
                <Blinker
                    style={{ color: rainbow[path.length % rainbow.length] }}
                    events={{
                        onLeft() {
                            setSelection(store, { idx, side: 'start' });
                        },
                        onRight() {
                            setSelection(store, { idx, side: 'end' });
                        },
                    }}
                />
            ) : null}
            {contents}
            <span
                style={{
                    color: rainbow[path.length % rainbow.length],
                    opacity: 0.5,
                    alignSelf: 'flex-end',
                }}
                onMouseDown={sideClick((left) => {
                    if (left) {
                        setSelection(
                            store,
                            children.length
                                ? {
                                      idx: children[children.length - 1],
                                      side: 'end',
                                  }
                                : { idx, side: 'inside' },
                        );
                    } else {
                        setSelection(store, {
                            idx,
                            side: 'end',
                        });
                    }
                })}
            >
                {right}
            </span>
            {store.selection?.idx === idx && store.selection.side === 'end' ? (
                <Blinker
                    style={{
                        color: rainbow[path.length % rainbow.length],
                        alignSelf: 'flex-end',
                    }}
                    events={{
                        onLeft() {
                            setSelection(
                                store,
                                children.length
                                    ? {
                                          idx: children[children.length - 1],
                                          side: 'end',
                                      }
                                    : { idx, side: 'inside' },
                            );
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

export const Blinker = ({
    events,
    style,
}: {
    events: Events;
    style: React.CSSProperties;
}) => {
    const ref = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        ref.current!.focus();
    }, []);

    return (
        <span
            contentEditable
            ref={ref}
            style={style}
            onKeyDown={(evt) => {
                switch (evt.key) {
                    case 'ArrowLeft':
                        evt.preventDefault();
                        return events.onLeft();
                    case 'ArrowRight':
                        evt.preventDefault();
                        return events.onRight();
                }
            }}
        />
    );
};

export const sideClick =
    (fn: (left: boolean) => void) =>
    (evt: React.MouseEvent<HTMLSpanElement>) => {
        evt.preventDefault();
        const rect = evt.currentTarget.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        fn(x < rect.width / 2);
    };
