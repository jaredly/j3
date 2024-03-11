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
import { FullEvalator, bootstrap } from '../ide/ground-up/Evaluators';
import { plugins } from './plugins';
import { useExpanded, useNode } from './Store';

const empty = {};

const PluginRender = ({
    ns,
    plugin,
    // map,
    env,
    ev,
    ...props
}: RenderProps & {
    ev: FullEvalator<any, any, any>;
    env: any;
    ns: RealizedNamespace;
    plugin: NamespacePlugin<any>;
}) => {
    const values = useNode(props.idx, props.path);
    const expanded = useExpanded(props.idx);
    // const expanded = useMemo(() => fromMCST(ns.top, map), [ns.top, map]);
    const results = useMemo(
        () =>
            plugin.process(expanded, (node) => {
                const errors = {};
                const expr = ev.parseExpr(node, errors);
                return ev.evaluate(expr, env);
            }),
        [ev, env, expanded],
    );
    const rn = useMemo(
        () => plugin.render(expanded, results, values.dispatch),
        [expanded, results],
    );
    if (!rn) return <Render {...props} />;
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
    produce: { [key: number]: string | JSX.Element };
    drag: Drag;
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
                                    plugin={
                                        plugins.find((p) => p.id === ns.plugin)!
                                    }
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
                                    debug={true}
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
                                        opacity: 0.5,
                                    }}
                                >
                                    {produce[ns.top] ?? 'hrm'}
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
                                    ev={ev}
                                    reg={reg}
                                    drag={drag}
                                    nsReg={nsReg}
                                    produce={produce}
                                    key={i}
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
