import * as React from 'react';
import { Map } from '../src/types/mcst';
import { EvalCtx, Path, setSelection, Store } from './store';
import { Events, Node, rainbow } from './Nodes';
import { Blinker } from './Blinker';
import { SetHover } from './Doc';
import { Expr } from '../src/types/ast';
import { Report } from '../src/get-type/get-types-new';
import { errorToString } from '../src/to-cst/show-errors';
import { Ctx } from '../src/to-ast/Ctx';

export const ListLike = ({
    left,
    right,
    children,
    store,
    path,
    layout,
    idx,
    events,
    ctx,
    setHover,
}: {
    left: string;
    right: string;
    children: number[];
    store: Store;
    path: Path[];
    layout: Map[0]['layout'];
    events: Events;
    idx: number;
    ctx: EvalCtx;
    setHover: SetHover;
}) => {
    const isRoot = idx === store.root;

    const nodes = React.useMemo(
        () =>
            children.map((cidx, i) => (
                <Node
                    idx={cidx}
                    key={cidx}
                    ctx={ctx}
                    setHover={setHover}
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
                                    loc: 'end',
                                });
                            } else if (!isRoot) {
                                setSelection(store, { idx, loc: 'start' });
                            }
                        },
                        onRight() {
                            if (i < children.length - 1) {
                                setSelection(store, {
                                    idx: children[i + 1],
                                    loc: 'start',
                                });
                            } else if (!isRoot) {
                                setSelection(store, { idx, loc: 'end' });
                            }
                        },
                    }}
                />
            )),
        [children, idx],
    );

    const contents = formatContents(
        isRoot,
        nodes,
        children,
        setHover,
        store,
        ctx,
        layout,
    );

    const dec = ctx.report.errors[idx]?.length ? 'rgba(255,0,0,0.05)' : 'none';

    return (
        <span
            style={{
                display: 'flex',
                cursor: 'text',
                background: isRoot ? 'transparent' : dec,
            }}
            onMouseEnter={(evt) =>
                setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseLeave={() => setHover({ idx, box: null })}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                if (!isRoot) {
                    setSelection(store, { idx, loc: 'end' });
                    console.log('OK');
                }
            }}
        >
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
                            setSelection(
                                store,
                                children.length
                                    ? {
                                          idx: children[0],
                                          loc: 'start',
                                      }
                                    : { idx, loc: 'inside' },
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
                            setSelection(
                                store,
                                children.length
                                    ? {
                                          idx: children[0],
                                          loc: 'start',
                                      }
                                    : { idx, loc: 'inside' },
                            );
                        }
                    })}
                >
                    {left}
                </span>
            )}
            {store.selection?.idx === idx &&
            store.selection.loc === 'inside' ? (
                <Blinker
                    idx={idx}
                    store={store}
                    path={path.concat([{ idx, child: { type: 'inside' } }])}
                    style={{ color: rainbow[path.length % rainbow.length] }}
                    events={{
                        onLeft() {
                            setSelection(store, { idx, loc: 'start' });
                        },
                        onRight() {
                            setSelection(store, { idx, loc: 'end' });
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
                        fontVariationSettings:
                            store.selection?.idx === idx ? '"wght" 900' : '',
                    }}
                    onMouseDown={sideClick((left) => {
                        if (left) {
                            setSelection(
                                store,
                                children.length
                                    ? {
                                          idx: children[children.length - 1],
                                          loc: 'end',
                                      }
                                    : { idx, loc: 'inside' },
                            );
                        } else {
                            setSelection(store, {
                                idx,
                                loc: 'end',
                            });
                        }
                    })}
                >
                    {right}
                </span>
            )}
            {store.selection?.idx === idx && store.selection.loc === 'end' ? (
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
                                          loc: 'end',
                                      }
                                    : { idx, loc: 'inside' },
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
    ctx,
}: {
    ctx: Ctx;
    result:
        | { status: 'success'; value: any; code: string; expr: Expr }
        | { status: 'failure'; error: string; code: string; expr: Expr }
        | { status: 'errors'; expr: Expr; errors: Report['errors'] };
}) => {
    let body;
    if (result.status === 'success') {
        if (typeof result.value === 'function') {
            body = <pre>{result.value.toString().slice(0, 100)}...</pre>;
        } else {
            body = (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(result.value)}
                </pre>
            );
        }
    } else if (result.status === 'errors') {
        body = (
            <pre style={{ whiteSpace: 'pre-wrap' }}>
                {Object.values(result.errors).flatMap((errors, j) =>
                    errors.map((error, i) => (
                        <div key={j + ':' + i}>{errorToString(error, ctx)}</div>
                    )),
                )}
            </pre>
        );
    } else {
        body = <pre>{result.error}</pre>;
    }
    const [hover, setHover] = React.useState(false);
    return (
        <div
            style={{
                position: 'relative',
                color: '#666',
                fontSize: '80%',
                padding: 4,
            }}
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
                    {result.status !== 'errors' && result.code}
                    {JSON.stringify(result.expr, null, 2)}
                </pre>
            )}
        </div>
    );
};

function formatContents(
    isRoot: boolean,
    nodes: JSX.Element[],
    children: number[],
    setHover: SetHover,
    store: Store,
    ctx: EvalCtx,
    layout:
        | { type: 'flat'; width: number; pos: number }
        | {
              type: 'multiline';
              pairs?: boolean | undefined;
              tightFirst: number;
              pos: number;
          }
        | undefined,
) {
    if (isRoot) {
        return (
            <div
                style={{
                    display: 'grid',
                    gap: '0 8px',
                    gridTemplateColumns: 'max-content 1fr',
                }}
            >
                {nodes.map((node, i) => (
                    <React.Fragment key={children[i]}>
                        <div
                            key={children[i]}
                            onMouseEnter={(evt) =>
                                setHover({
                                    idx: children[i],
                                    box: evt.currentTarget.getBoundingClientRect(),
                                })
                            }
                            onMouseLeave={() =>
                                setHover({ idx: children[i], box: null })
                            }
                            onMouseDown={(evt) => {
                                evt.stopPropagation();
                                evt.preventDefault();
                                setSelection(store, {
                                    idx: children[i],
                                    loc: 'end',
                                });
                            }}
                        >
                            {node}
                        </div>
                        <ShowResult
                            result={ctx.results[children[i]]}
                            ctx={ctx.ctx}
                        />
                    </React.Fragment>
                ))}
            </div>
        );
    }
    if (layout?.type !== 'multiline') {
        return nodes.map((node, i) => (
            <React.Fragment key={children[i]}>
                {i != 0 ? (
                    <span
                        onMouseDown={sideClick((left) => {
                            if (left) {
                                setSelection(store, {
                                    idx: children[i - 1],
                                    loc: 'end',
                                });
                            } else {
                                setSelection(store, {
                                    idx: children[i],
                                    loc: 'start',
                                });
                            }
                        })}
                    >
                        &nbsp;
                    </span>
                ) : null}
                <span key={children[i]}>{node}</span>
            </React.Fragment>
        ));
    }

    const first = layout.tightFirst ? (
        <span style={{ display: 'flex' }}>
            {nodes.slice(0, layout.tightFirst).map((node, i) => (
                <span key={children[i]} style={{ marginLeft: i === 0 ? 0 : 8 }}>
                    {node}
                </span>
            ))}
        </span>
    ) : null;

    return (
        <span style={{ display: 'flex', flexDirection: 'column' }}>
            {first}

            <span
                style={{
                    marginLeft: layout.tightFirst ? 30 : 0,
                    ...(layout.pairs
                        ? {
                              display: 'grid',
                              gridTemplateColumns: 'min-content min-content',
                              gap: '0 8px',
                          }
                        : { display: 'flex', flexDirection: 'column' }),
                }}
            >
                {nodes.slice(layout.tightFirst).map((node, i) => (
                    <span
                        key={children[layout.tightFirst + i]}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            alignSelf: 'flex-start',
                        }}
                    >
                        {node}
                    </span>
                ))}
            </span>
        </span>
    );
}
