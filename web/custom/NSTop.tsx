import React, { useMemo } from 'react';
import { Cursor } from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { Render, RenderNNode } from './Render';
import {
    Action,
    NUIState,
    NamespacePlugin,
    RealizedNamespace,
} from './UIState';
import { Reg, RenderProps } from './types';
import { Results } from '../ide/ground-up/GroundUp';
import { NSDragger } from './NSDragger';
import { NsReg, Drag } from './useNSDrag';
import { fromMCST } from '../../src/types/mcst';
import {
    MyEvalError,
    FullEvalator,
    LocError,
    bootstrap,
    Display,
} from '../ide/ground-up/Evaluators';
import { plugins } from './plugins';
import { useExpanded, useGetStore, useNode } from './store/Store';
import { pathForIdx } from '../ide/ground-up/CommandPalette';

const PluginRender = ({
    ns,
    env,
    ev,
    ...props
}: RenderProps & {
    ev: FullEvalator<any, any, any>;
    env: any;
    ns: RealizedNamespace;
}) => {
    const pid = typeof ns.plugin === 'string' ? ns.plugin : ns.plugin!.id;
    const options = typeof ns.plugin === 'string' ? null : ns.plugin!.options;
    const plugin = plugins.find((p) => p.id === pid)!;

    const values = useNode(props.idx, props.path);
    const expanded = useExpanded(props.idx);
    const store = useGetStore();
    const results = store.getResults().pluginResults[props.idx];
    const rn = useMemo(
        () => (results ? plugin.render(expanded, results, store, ns) : null),
        [expanded, results, ns.plugin],
    );
    // if (!results) return <div>NO RESULTS</div>;
    if (!rn || !results) return <Render {...props} />;
    return <RenderNNode {...props} values={values} nnode={rn} />;
};

export function NSTop({
    ns,
    state,
    reg,
    results,
    dispatch,
    selections,
    produce,
    path,
    nsReg,
    drag,
    env,
    ev,
    debug,
}: {
    ev: FullEvalator<any, any, any> | void | null;
    env: any;
    nsReg: NsReg;
    path: Path[];
    dispatch: React.Dispatch<Action>;
    state: NUIState;
    reg: Reg;
    results: Results;
    ns: RealizedNamespace;
    selections: Cursor[];
    produce: { [key: number]: Display };
    drag: Drag;
    debug: boolean;
}) {
    const source = useMemo(() => {
        const last = path[path.length - 1];
        if (last.type !== 'ns') {
            return null;
        }
        return { idx: last.idx, at: last.at };
    }, [path]);

    const nsp = path
        .map((p) => (p.type === 'ns' ? `${p.idx}$${p.at}` : `${p.idx}`))
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
                dispatch({ type: 'hover', path: [] });
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {ns.top !== -1 && source ? (
                    <>
                        <NSDragger
                            drag={drag}
                            nsp={nsp}
                            ns={ns}
                            dispatch={dispatch}
                            path={path}
                        />
                        <div
                            ref={(node) => {
                                if (node) {
                                    nsReg[nsp] = { node, path, dest: source };
                                } else {
                                    nsReg[nsp] = null;
                                }
                            }}
                        >
                            {ns.plugin && ev ? (
                                <PluginRender
                                    ns={ns}
                                    env={env}
                                    ev={ev}
                                    // plugin={
                                    //     plugins.find((p) => p.id === ns.plugin)!
                                    // }
                                    debug={false}
                                    idx={ns.top}
                                    // reg={reg}
                                    // map={state.map}
                                    firstLineOnly={ns.collapsed}
                                    // display={results.display ?? empty}
                                    // hashNames={results.hashNames ?? empty}
                                    // errors={results.errors ?? empty}
                                    // selection={selections}
                                    // dispatch={dispatch}
                                    path={path.concat([
                                        { type: 'ns-top', idx: ns.id },
                                    ])}
                                />
                            ) : (
                                <Render
                                    debug={debug}
                                    idx={ns.top}
                                    // reg={reg}
                                    // map={state.map}
                                    firstLineOnly={ns.collapsed}
                                    // display={results.display ?? empty}
                                    // hashNames={results.hashNames ?? empty}
                                    // errors={results.errors ?? empty}
                                    // selection={selections}
                                    // dispatch={dispatch}
                                    path={path.concat([
                                        { type: 'ns-top', idx: ns.id },
                                    ])}
                                />
                            )}
                            {ns.plugin ? null : ns.collapsed ? (
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
                                    {renderProduce(
                                        produce[ns.top],
                                        state,
                                        dispatch,
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
            <div style={{ marginLeft: 30, marginTop: 8, marginBottom: -8 }}>
                {!ns.collapsed &&
                    ns.children
                        .map((id) => state.nsMap[id])
                        .map((child, i) =>
                            child.type === 'normal' ? (
                                <NSTop
                                    env={env}
                                    debug={debug}
                                    ev={ev}
                                    reg={reg}
                                    drag={drag}
                                    nsReg={nsReg}
                                    produce={produce}
                                    key={child.top + ':' + i}
                                    ns={child}
                                    path={path.concat({
                                        type: 'ns' as const,
                                        at: i,
                                        idx: ns.id,
                                    })}
                                    state={state}
                                    dispatch={dispatch}
                                    results={results}
                                    selections={selections}
                                />
                            ) : null,
                        )}
            </div>
        </div>
    );
}

const renderProduce = (
    value: Display,
    state: NUIState,
    dispatch: React.Dispatch<Action>,
) => {
    if (value instanceof MyEvalError) {
        let parts: JSX.Element[] = highlightIdxs(
            value.source.message,
            state,
            dispatch,
        );
        return (
            <div style={{ color: 'rgb(255,50,50)' }}>
                {value.message + '\n'}
                {parts}
            </div>
        );
    }
    if (value instanceof LocError) {
        let parts = highlightIdxs(value.message, state, dispatch);
        return (
            <div>
                Traceback: {parts}
                {value.locs.map((n, i) => (
                    <div
                        className="hover"
                        key={i}
                        onMouseEnter={() => {
                            const got = state.regs[n.loc];
                            const node = got?.main ?? got?.outside;
                            if (!node) return;
                            node.node.style.backgroundColor = 'red';
                        }}
                        onClick={() => {
                            const path = pathForIdx(n.loc, state);
                            if (!path) return alert('nope');
                            dispatch({
                                type: 'select',
                                at: [{ start: path }],
                            });
                        }}
                        onMouseLeave={() => {
                            const got = state.regs[n.loc];
                            const node = got?.main ?? got?.outside;
                            if (!node) return;
                            node.node.style.backgroundColor = 'unset';
                        }}
                    >
                        idx: {n.loc} ({n.row}:{n.col})
                    </div>
                ))}
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
    if (value instanceof Error) {
        return <div>Error {value.message}</div>;
    }
    if (typeof value === 'string') {
        return value;
    }
    if (!value) return '';
    return value;
};
function highlightIdxs(
    msg: string,
    state: NUIState,
    dispatch: React.Dispatch<Action>,
) {
    let at = 0;
    let parts: JSX.Element[] = [];
    msg.replace(/\d+/g, (match, idx) => {
        if (idx > at) {
            parts.push(<span key={at}>{msg.slice(at, idx)}</span>);
        }
        const loc = +match;
        parts.push(
            <button
                key={idx}
                onMouseDown={(evt) => evt.stopPropagation()}
                style={{
                    color: 'inherit',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                }}
                onMouseEnter={() => {
                    const got = state.regs[loc];
                    const node = got?.main ?? got?.outside;
                    if (!node) return;
                    node.node.style.outline = '1px solid red';
                }}
                onClick={() => {
                    const path = pathForIdx(loc, state);
                    if (!path) return alert('nope');
                    dispatch({
                        type: 'select',
                        at: [{ start: path }],
                    });
                }}
                onMouseLeave={() => {
                    const got = state.regs[loc];
                    const node = got?.main ?? got?.outside;
                    if (!node) return;
                    node.node.style.outline = 'unset';
                }}
            >
                {match}
            </button>,
        );
        at = idx + match.length;
        return '';
    });
    if (at < msg.length) {
        parts.push(<span key={at}>{msg.slice(at)}</span>);
    }
    return parts;
}
