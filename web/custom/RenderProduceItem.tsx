import React, { ReactNode, useEffect, useRef } from 'react';
import { collectPaths, pathForIdx } from '../ide/ground-up/pathForIdx';
import { InferenceError, ProduceItem } from '../ide/ground-up/FullEvalator';
import { useGetStore } from './store/StoreCtx';
import { showError } from './store/processTypeInference';
import { RenderStatic } from './RenderStatic';
import { highlightIdxs } from './highlightIdxs';

export const RenderProduceItem = ({
    value,
}: // dispatch,
{
    value: ProduceItem;
}) => {
    const store = useGetStore();
    if (typeof value === 'string') {
        return (
            <div
                className="mouse-capture"
                onMouseDownCapture={(evt) => {
                    navigator.clipboard.writeText(value);
                    evt.stopPropagation();
                    evt.preventDefault();
                }}
            >
                {value.length > 1000 ? value.slice(0, 1000) + '...' : value}
            </div>
        );
    }
    switch (value.type) {
        case 'trigger':
            return (
                <button
                    onClick={() => {
                        store.respond.trigger(value.f as number);
                    }}
                >
                    Trigger this yall
                </button>
            );
        case 'ask':
            switch (value.kind) {
                case 'int':
                    return <div>{value.text}</div>;
                case 'bool':
                    return (
                        <div>
                            {value.text}
                            <button
                                onClick={() => {
                                    store.respond.ask(value.f as number, true);
                                }}
                            >
                                True
                            </button>
                            <button
                                onClick={() => {
                                    store.respond.ask(value.f as number, false);
                                }}
                            >
                                False
                            </button>
                        </div>
                    );
                case 'string':
                    return <div>{value.text} Want a string</div>;
                default:
                    return (
                        <div>
                            {value.text} Unknonwn ask kind: {value.kind}
                        </div>
                    );
            }
        case 'type':
            return (
                <div
                    style={{
                        borderLeft: '4px solid rgb(0,60,0)',
                        paddingLeft: 8,
                    }}
                >
                    {value.cst ? (
                        <RenderStatic node={value.cst} />
                    ) : (
                        <div style={{ color: 'rgb(45 149 100)' }}>
                            {value.text}
                        </div>
                    )}
                </div>
            );
        case 'eval': {
            let parts: JSX.Element[] = highlightIdxs(value.inner);
            return (
                <div style={{ color: 'rgb(255,50,50)' }}>
                    {value.message + '\n'}
                    {parts}
                </div>
            );
        }
        case 'inference-error':
            return (
                <div
                    style={{
                        borderLeft: '4px solid rgb(255,50,50)',
                        paddingLeft: 8,
                    }}
                >
                    <RenderInferenceError err={value.err} />
                </div>
            );
        case 'withjs': {
            let parts = highlightIdxs(value.message);
            return <div style={{ color: 'rgb(255,50,50)' }}>{parts}</div>;
        }
        case 'error': {
            let parts = highlightIdxs(value.message);
            return <div style={{ color: 'rgb(255,50,50)' }}>{parts}</div>;
        }
        case 'pre':
            return (
                <pre
                    className="mouse-capture"
                    onMouseDownCapture={(evt) => {
                        navigator.clipboard.writeText(value.text);
                        evt.stopPropagation();
                        evt.preventDefault();
                    }}
                >
                    {value.text}
                </pre>
            );
        case 'node':
            return <RenderStatic node={value.node} />;
    }
    return <b>Unrecognized produce item {JSON.stringify(value)}</b>;
};

export const JumpTo = ({
    children,
    noOutline,
    loc,
}: {
    children: ReactNode;
    loc: number;
    noOutline?: boolean;
}) => {
    const store = useGetStore();
    const cleanup = useRef(null as null | (() => void));
    useEffect(() => {
        return () => cleanup.current?.();
    }, []);
    return (
        <span
            className={noOutline ? '' : 'hover'}
            onMouseEnter={() => {
                const got = store.getState().regs[loc];
                const node = got?.main ?? got?.outside;
                if (!node) return;
                node.node.style.backgroundColor = 'red';
                cleanup.current = () =>
                    (node.node.style.backgroundColor = 'unset');
            }}
            onClick={() => {
                console.log('jumping', loc);
                const paths = collectPaths(store.getState())(loc);
                // const path = pathForIdx(loc, store.getState());
                if (!paths.length) return alert('nope');
                console.log('found', paths);
                store.dispatch({
                    type: 'select',
                    at: [{ start: paths[0] }],
                });
            }}
            onMouseLeave={() => {
                const got = store.getState().regs[loc];
                const node = got?.main ?? got?.outside;
                if (!node) return;
                cleanup.current?.();
                cleanup.current = null;
            }}
        >
            {children}
        </span>
    );
};

const RenderInferenceError = ({ err }: { err: InferenceError }) => {
    if (err.type === 'missing') {
        return (
            <div style={{ color: 'rgb(255,50,50)' }}>
                Missing (or erroring) terms:
                {err.missing.map((m, i) => (
                    <div key={i}>
                        <JumpTo loc={m.loc}>
                            - {m.name} ({m.loc})
                        </JumpTo>
                    </div>
                ))}
            </div>
        );
    }
    if (err.type === 'types') {
        return (
            <div style={{ color: 'rgb(255,50,50)' }}>
                <div>Types don't match</div>
                <JumpTo loc={err.one.loc}>
                    <RenderStatic node={err.one} />
                </JumpTo>
                {' vs '}
                <JumpTo loc={err.two.loc}>
                    <RenderStatic node={err.two} />
                </JumpTo>
            </div>
        );
    }
    if (err.type === 'nested') {
        return (
            <div style={{ color: 'rgb(255,50,50)' }}>
                Nested
                <RenderInferenceError err={err.outer} />
                -&gt;
                <RenderInferenceError err={err.inner} />
            </div>
        );
    }
    return (
        <div style={{ color: 'rgb(255,50,50)' }}>
            {highlightIdxs(showError(err))}
        </div>
    );
};
