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
    if (typeof value === 'string') {
        return (
            <>{value.length > 1000 ? value.slice(0, 1000) + '...' : value}</>
        );
    }
    switch (value.type) {
        case 'type':
            if (value.cst) {
                return <RenderStatic node={value.cst} />
            }
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
            return <div style={{borderLeft: '4px solid rgb(255,50,50)', paddingLeft: 8}}><RenderInferenceError err={value.err} /></div>;
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
                </JumpTo>{' vs '}
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
