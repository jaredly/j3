import React, { ReactNode, useMemo } from 'react';
import { Path } from '../../src/state/path';
import { pathForIdx } from '../ide/ground-up/CommandPalette';
import { ProduceItem } from '../ide/ground-up/FullEvalator';
import { Debug } from '../ide/ground-up/GroundUp';
import { NSDragger } from './NSDragger';
import { Drag, NsReg } from './NsReg';
import { Render, RenderNNode } from './Render';
import { NUIState, RealizedNamespace } from './UIState';
import { plugins } from './plugins';
import { Store } from './store/Store';
import { useExpanded, useGetStore } from './store/StoreCtx';
import { useNamespace } from './store/useNamespace';
import { useNode } from './store/useNode';
import { RenderProps } from './types';
import { ImmediateResults } from './store/getImmediateResults';
import { WorkerResults } from './store/useSyncStore';

const PluginRender = ({
    ns,
    ...props
}: RenderProps & {
    ns: RealizedNamespace;
}) => {
    const pid = typeof ns.plugin === 'string' ? ns.plugin : ns.plugin!.id;
    // const options = typeof ns.plugin === 'string' ? null : ns.plugin!.options;
    const plugin = plugins.find((p) => p.id === pid)!;

    const values = useNode(props.idx, props.path);
    const expanded = useExpanded(props.idx);
    const store = useGetStore();
    const results =
        store.getResults().workerResults.nodes[ns.id]?.pluginResults;
    const parsed = store.getResults().results.nodes[ns.id]?.parsed;
    // const results = parsed?.type === 'plugin' ? parsed.parsed : null;
    const rn = useMemo(
        () =>
            results != null && parsed?.type === 'plugin'
                ? plugin.render(parsed.parsed, results, store, ns)
                : null,
        [expanded, results, ns.plugin],
    );
    if (!rn || results == null)
        return (
            <div>
                {results == null ? 'No plugin results...' : ''}
                <Render {...props} />
            </div>
        );
    return (
        <RenderNNode
            {...props}
            values={values}
            nnode={rn}
            hoverPath={props.path}
        />
    );
};

export const hasErrors = (
    id: number,
    state: NUIState,
    {
        results,
        workerResults,
    }: { results: ImmediateResults<any>; workerResults: WorkerResults },
): boolean => {
    const ns = state.nsMap[id] as RealizedNamespace;
    if (!ns) {
        debugger;
        return false;
    }
    if (results.nodes[ns.id].parsed?.type === 'failure') {
        return true;
    }
    if (Object.keys(workerResults.nodes[ns.id]?.errors ?? {}).length) {
        return true;
    }
    if (
        workerResults.nodes[ns.id]?.produce.some(
            (p) =>
                typeof p !== 'string' &&
                (p.type === 'withjs' ||
                    p.type === 'error' ||
                    p.type === 'eval'),
        )
    ) {
        return true;
    }
    return ns.children.some((id) =>
        hasErrors(id, state, { results, workerResults }),
    );
};

function NSTop({
    idx,
    path,
    nsReg,
    drag,
    debug,
}: {
    idx: number;
    nsReg: NsReg;
    path: Path[];
    drag: Drag;
    debug: Debug;
}) {
    const store = useGetStore();
    const { ns, produce } = useNamespace(idx, path);

    const source = useMemo(() => {
        const last = path[path.length - 1];
        if (last.type !== 'ns') {
            return null;
        }
        return { idx: last.idx, child: last.child };
    }, [path]);

    const nsp = path
        .map((p) => (p.type === 'ns' ? `${p.idx}$${p.child}` : `${p.idx}`))
        .join(':');

    return (
        <div
            style={{
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'column',
                padding: 4,
            }}
            onMouseLeave={() => {
                store.dispatch({ type: 'hover', path: [] });
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {ns.top !== -1 && source ? (
                    <>
                        <NSDragger
                            drag={drag}
                            nsp={nsp}
                            ns={ns}
                            dispatch={store.dispatch}
                            path={path}
                        />
                        {debug.ids ? (
                            <div
                                style={{
                                    fontSize: '80%',
                                    opacity: 0.7,
                                    width: 20,
                                }}
                            >
                                {ns.id}
                            </div>
                        ) : null}
                        <div
                            ref={(node) => {
                                if (node) {
                                    nsReg[nsp] = { node, path, dest: source };
                                } else {
                                    nsReg[nsp] = null;
                                }
                            }}
                        >
                            {ns.plugin ? (
                                <PluginRender
                                    ns={ns}
                                    debug={false}
                                    idx={ns.top}
                                    firstLineOnly={ns.collapsed}
                                    path={path.concat([
                                        { type: 'ns-top', idx: ns.id },
                                    ])}
                                />
                            ) : (
                                <Render
                                    key={ns.top}
                                    idx={ns.top}
                                    debug={debug.ids}
                                    firstLineOnly={ns.collapsed}
                                    path={path.concat([
                                        { type: 'ns-top', idx: ns.id },
                                    ])}
                                />
                            )}
                            {ns.plugin ? (
                                <div
                                    style={{
                                        whiteSpace: 'pre',
                                        fontSize: '80%',
                                        // opacity: 0.5,
                                        color: 'rgba(255,255,255,0.5)',
                                    }}
                                >
                                    {renderProduce(produce)}
                                </div>
                            ) : ns.collapsed ? (
                                '...'
                            ) : (
                                <div
                                    style={{
                                        whiteSpace: 'pre',
                                        fontSize: '80%',
                                        // opacity: 0.5,
                                        color: 'rgba(255,255,255,0.5)',
                                    }}
                                >
                                    {renderProduce(produce)}
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
            <div style={{ marginLeft: 30, marginTop: 8, marginBottom: -8 }}>
                {!ns.collapsed &&
                    ns.children.map((id, i) => (
                        <NSTop
                            key={id}
                            idx={id}
                            debug={debug}
                            drag={drag}
                            nsReg={nsReg}
                            path={path.concat({
                                type: 'ns' as const,
                                child: id,
                                idx: ns.id,
                            })}
                        />
                    ))}
            </div>
        </div>
    );
}

const pathEqual = (one: Path, two: Path) => {
    return one.idx === two.idx && one.type === two.type;
};

const pathsEqual = (one: Path[], two: Path[]) => {
    return (
        one.length === two.length && one.every((p, i) => pathEqual(p, two[i]))
    );
};

const Wrapped = React.memo(NSTop, (prevProps, nextProps) => {
    return (
        prevProps.idx === nextProps.idx &&
        prevProps.debug === nextProps.debug &&
        pathsEqual(prevProps.path, nextProps.path)
    );
});

export { Wrapped as NSTop };

const renderProduce = (value: ProduceItem[]) => {
    return value?.map((item, i) => (
        <div key={i}>
            <RenderProduceItem value={item} />
        </div>
    ));
};

const RenderProduceItem = ({
    value,
}: // state,
// dispatch,
{
    value: ProduceItem;
    // state: NUIState;
    // dispatch: React.Dispatch<Action>;
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
