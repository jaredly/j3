import * as React from 'react';
import { Map } from '../src/types/mcst';
import { Path, setSelection, Store } from './store';
import { Events, Node, rainbow } from './Nodes';
import { Blinker } from './Blinker';

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
    const isRoot = idx === store.root;

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

    const contents = isRoot ? (
        <div
            style={{
                // display: 'flex',
                // flexDirection: 'column',
                // alignItems: 'flex-start',
                display: 'grid',
                gap: '0 8px',
                gridTemplateColumns: 'min-content min-content',
            }}
        >
            {nodes.map((node, i) => (
                <React.Fragment key={children[i]}>
                    <div
                        key={children[i]}
                        className="hover"
                        onMouseDown={(evt) => {
                            evt.stopPropagation();
                            evt.preventDefault();
                            setSelection(store, {
                                idx: children[i],
                                side: 'end',
                            });
                        }}
                    >
                        {node}
                    </div>
                    <ShowResult result={store.eval[children[i]]} />
                    {/* <EvalMyDudes idx={children[i]} store={store} /> */}
                </React.Fragment>
            ))}
        </div>
    ) : layout?.type === 'multiline' ? (
        <span
            style={
                layout.pairs
                    ? {
                          display: 'grid',
                          gridTemplateColumns: 'min-content min-content',
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
            <>
                {i != 0 ? (
                    <span
                        onMouseDown={sideClick((left) => {
                            if (left) {
                                setSelection(store, {
                                    idx: children[i - 1],
                                    side: 'end',
                                });
                            } else {
                                setSelection(store, {
                                    idx: children[i],
                                    side: 'start',
                                });
                            }
                        })}
                    >
                        &nbsp;
                    </span>
                ) : null}
                <span key={children[i]}>{node}</span>
            </>
        ))
    );

    // if (isRoot) {
    //     return (
    //         <div
    //             style={{
    //                 display: 'flex',
    //                 flexDirection: 'column',
    //                 alignItems: 'flex-start',
    //                 cursor: 'text',
    //             }}
    //             onMouseDown={(evt) => {
    //                 evt.stopPropagation();
    //                 evt.preventDefault();
    //                 setSelection(store, { idx, side: 'end' });
    //                 console.log('OK');
    //             }}
    //         >
    //             {contents}
    //         </div>
    //     );
    // }

    return (
        <span
            style={{
                display: 'flex',
                cursor: 'text',
            }}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                setSelection(store, { idx, side: 'end' });
                console.log('OK');
            }}
        >
            {store.selection?.idx === idx &&
            store.selection.side === 'start' ? (
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
            {!isRoot && (
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
            )}
            {store.selection?.idx === idx &&
            store.selection.side === 'inside' ? (
                <Blinker
                    idx={idx}
                    store={store}
                    path={path.concat([{ idx, child: { type: 'inside' } }])}
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
            {!isRoot && (
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
            )}
            {store.selection?.idx === idx && store.selection.side === 'end' ? (
                <Blinker
                    idx={idx}
                    store={store}
                    path={path.concat([{ idx, child: { type: 'end' } }])}
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

export const sideClick =
    (fn: (left: boolean) => void) =>
    (evt: React.MouseEvent<HTMLSpanElement>) => {
        evt.preventDefault();
        evt.stopPropagation();
        const rect = evt.currentTarget.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        fn(x < rect.width / 2);
    };

export const ShowResult = ({
    result,
}: {
    result:
        | { status: 'success'; value: any; code: string }
        | { status: 'failure'; message: string; code: string };
}) => {
    let body;
    if (result.status === 'success') {
        if (typeof result.value === 'function') {
            body = <pre>{result.value.toString().trim()}</pre>;
        } else {
            body = <pre>{JSON.stringify(result.value, null, 2)}</pre>;
        }
    } else {
        body = <pre>{result.message}</pre>;
    }
    const [hover, setHover] = React.useState(false);
    return (
        <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {body}
            {hover && (
                <pre
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: 0,
                        pointerEvents: 'none',
                        fontSize: '80%',
                        zIndex: 1000,
                        backgroundColor: 'black',
                        boxShadow: '0 0 2px white',
                        padding: 5,
                        border: '1px solid black',
                    }}
                >
                    {result.code}
                </pre>
            )}
        </div>
    );
};
