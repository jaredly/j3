import React, { ReactNode, useEffect, useRef } from 'react';
import { collectPaths, pathForIdx } from '../ide/ground-up/pathForIdx';
import { InferenceError, ProduceItem } from '../ide/ground-up/FullEvalator';
import { useGetStore } from './store/StoreCtx';
import { showError } from './store/processTypeInference';
import { RenderStatic } from './RenderStatic';

export const RenderProduceItem = ({
    value,
}: // dispatch,
{
    value: ProduceItem;
}) => {
    if (typeof value === 'string') {
        return (
            <>{value.length > 1000 ? value.slice(0, 1000) + '...' : value}</>
        );
    }
    switch (value.type) {
        case 'type':
            return <div style={{ color: 'rgb(45 149 100)' }}>{value.text}</div>;
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
            return <RenderInferenceError err={value.err} />;
        case 'withjs': {
            let parts = highlightIdxs(value.message);
            return <div style={{ color: 'rgb(255,50,50)' }}>{parts}</div>;
        }
        case 'error': {
            let parts = highlightIdxs(value.message);
            return <div style={{ color: 'rgb(255,50,50)' }}>{parts}</div>;
        }
        case 'pre':
            return <pre>{value.text}</pre>;
    }
    return <b>Unrecognized produce item {JSON.stringify(value)}</b>;
};

export function highlightIdxs(msg: string) {
    let at = 0;
    let parts: JSX.Element[] = [];
    msg.replace(/\d+/g, (match, idx) => {
        if (idx > at) {
            parts.push(<span key={at}>{msg.slice(at, idx)}</span>);
        }
        const loc = +match;
        parts.push(
            <JumpTo key={idx} loc={loc}>
                {match}
            </JumpTo>,
        );
        at = idx + match.length;
        return '';
    });
    if (at < msg.length) {
        parts.push(<span key={at}>{msg.slice(at)}</span>);
    }
    return parts;
}

export const JumpTo = ({
    children,
    loc,
}: {
    children: ReactNode;
    loc: number;
}) => {
    const store = useGetStore();
    const cleanup = useRef(null as null | (() => void));
    useEffect(() => {
        return () => cleanup.current?.();
    }, []);
    return (
        <span
            className="hover"
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
