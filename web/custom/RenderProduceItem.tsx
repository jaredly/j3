import React, { ReactNode } from 'react';
import { pathForIdx } from '../ide/ground-up/pathForIdx';
import { ProduceItem } from '../ide/ground-up/FullEvalator';
import { useGetStore } from './store/StoreCtx';

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
        case 'withjs': {
            let parts = highlightIdxs(value.message);
            return (
                <div style={{ color: 'rgb(255,50,50)' }}>
                    {parts}
                    {/* <i>Not doing symbolication because it wont really work</i> */}
                    {/* {value.locs.map((n, i) => (
                        <JumpTo loc={n.loc}>
                            idx: {n.loc} ({n.row}:{n.col})
                        </JumpTo>
                    ))} */}
                    {/* <pre>
                        {value.js
                            .split('\n')
                            .map(
                                (l, i) => `${(i + 1 + '').padStart(3, ' ')} : ${l}`,
                            )
                            .join('\n')}
                    </pre> */}
                </div>
            );
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
    return (
        <span
            className="hover"
            onMouseEnter={() => {
                const got = store.getState().regs[loc];
                const node = got?.main ?? got?.outside;
                if (!node) return;
                node.node.style.backgroundColor = 'red';
            }}
            onClick={() => {
                console.log('jumping', loc);
                const path = pathForIdx(loc, store.getState());
                if (!path) return alert('nope');
                store.dispatch({
                    type: 'select',
                    at: [{ start: path }],
                });
            }}
            onMouseLeave={() => {
                const got = store.getState().regs[loc];
                const node = got?.main ?? got?.outside;
                if (!node) return;
                node.node.style.backgroundColor = 'unset';
            }}
        >
            {children}
        </span>
    );
};
