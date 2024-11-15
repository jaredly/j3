import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Path } from '../../src/state/path';
import { ProduceItem } from '../ide/ground-up/FullEvalator';
import { Debug } from '../ide/ground-up/GroundUp';
import { NSDragger } from './NSDragger';
import { Drag, NsReg } from './NsReg';
import { Render, RenderNNode } from './Render';
import { CollapseState, RealizedNamespace } from './UIState';
import { plugins } from './plugins';
import { Store } from './store/Store';
import { useExpanded, useGetStore, useSubscribe } from './store/StoreCtx';
import { useNamespace } from './store/useNamespace';
import { useNode } from './store/useNode';
import { RenderProps } from './types';
import { JumpTo, RenderProduceItem } from './RenderProduceItem';
import { nodeColor } from './rainbow';
import { NodeResults } from './store/getImmediateResults';
import 'victormono';
import equal from 'fast-deep-equal';
import { RenderStatic } from './RenderStatic';

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
                <Render key={ns.top} {...props} />
            </div>
        );
    return (
        <RenderNNode
            {...props}
            values={values}
            key={ns.top}
            nnode={rn}
            hoverPath={props.path}
            Recurse={Render}
        />
    );
};

function NSTop({
    idx,
    path,
    nsReg,
    drag,
    debug,
    setPin,
    setZoom,
    zoom,
}: {
    idx: number;
    nsReg: NsReg;
    path: Path[];
    drag: Drag;
    debug: Debug;
    setPin: (pin: number | null) => void;
    setZoom: (pin: Path[] | null) => void;
    zoom: Path[] | null;
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

    if (
        zoom != null &&
        !equal(path.slice(0, zoom.length), zoom.slice(0, path.length))
    ) {
        return null; // zoomed out
    }

    let type = null;
    let otherProduce = produce.slice();
    const numTypes = otherProduce.filter(
        (p) => typeof p !== 'string' && p.type === 'type',
    ).length;
    if (numTypes > 1) {
        otherProduce = otherProduce.filter(
            (p) => typeof p === 'string' || p.type !== 'type',
        );
    }
    const tidx = otherProduce.findIndex(
        (p) => typeof p !== 'string' && p.type === 'type',
    );
    if (tidx !== -1) {
        type = otherProduce.splice(tidx, 1)[0] as Extract<
            ProduceItem,
            { type: 'type' }
        >;
    }

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
                            setPin={setPin}
                            setZoom={setZoom}
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
                            {type?.cst ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        fontSize: '80%',
                                        borderLeft: '4px solid rgb(0, 80, 0)',
                                        paddingLeft: 8,
                                    }}
                                >
                                    <span
                                        style={{ marginRight: 8, opacity: 0.7 }}
                                    >
                                        type:
                                    </span>
                                    <RenderStatic node={type.cst} />
                                </div>
                            ) : null}
                            {ns.plugin ? (
                                <PluginRender
                                    ns={ns}
                                    key={ns.top}
                                    debug={debug.ids}
                                    idx={ns.top}
                                    // firstLineOnly={ns.collapsed}
                                    path={path.concat([
                                        { type: 'ns-top', idx: ns.id },
                                    ])}
                                />
                            ) : (
                                <Render
                                    key={ns.top}
                                    idx={ns.top}
                                    debug={debug.ids}
                                    // firstLineOnly={ns.collapsed}
                                    path={path.concat([
                                        { type: 'ns-top', idx: ns.id },
                                    ])}
                                />
                            )}
                            <RenderProduce
                                ns={ns.id}
                                collapsed={ns.collapsed}
                                value={otherProduce}
                            />
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
                            setPin={setPin}
                            debug={debug}
                            drag={drag}
                            nsReg={nsReg}
                            path={path.concat({
                                type: 'ns' as const,
                                child: id,
                                idx: ns.id,
                            })}
                            setZoom={setZoom}
                            zoom={zoom}
                        />
                    ))}
                {ns.collapsed ? (
                    <div
                        style={{
                            display: 'flex',
                            marginLeft: 12,
                            maxWidth: 800,
                            flexWrap: 'wrap',
                            gap: 8,
                        }}
                    >
                        {ns.children.map((id, i) => (
                            <PreviewChild id={id} key={id} store={store} />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

// const PreviewChildren = ({ idx }: { idx: number }) => {
//     const store = useGetStore();
//     const children = useSubscribe(
//         () => store.getState().nsMap[idx].children,
//         (fn) => store.onChange(`ns:${idx}`, fn),
//         [idx],
//     );
//     return (
//         <div style={{ display: 'flex' }}>
//             {children.map((id) => (
//                 <PreviewChild key={id} id={id} store={store} />
//             ))}
//         </div>
//     );
// };

const nodeName = (node: NodeResults<unknown>) => {
    if (!node) return;
    if (
        node.parsed?.type === 'success' &&
        node.parsed.allNames?.global.declarations.length
    ) {
        const name = node.parsed.allNames.global.declarations[0];
        return {
            ...name,
            style: {
                color: nodeColor('identifier', name.name),
                backgroundColor: name.kind === 'type' ? '#00101f' : '#111',
                // fontFamily: name.kind === 'type' ? 'Victor Mono' : undefined,
                // fontStyle: name.kind === 'type' ? 'italic' : undefined,
            },
        };
    }
    if (node.ns.plugin?.id === 'fixture') {
        return {
            name: 'Fixture tests',
            loc: node.ns.top,
            style: {
                color: '#aaa',
                fontFamily:
                    'Inter, "SF Pro Display", -apple-system, "system-ui"',
            },
        };
    }
    if (node.node.type === 'rich-text') {
        const arr = node.node.contents as Array<
            | {
                  type: 'heading';
                  content: Array<{ type: 'text'; text: string }>;
              }
            | { type: 'paragraph' }
        >;
        if (
            arr.length > 0 &&
            arr[0].type === 'heading' &&
            arr[0].content[0].type === 'text'
        ) {
            return {
                name: arr[0].content.map((m) => m.text).join(''),
                loc: node.node.loc,
                style: {
                    color: '#aaa',
                    fontFamily:
                        'Inter, "SF Pro Display", -apple-system, "system-ui"',
                },
            };
        }
    }
};

const PreviewChild = ({ id, store }: { id: number; store: Store }) => {
    const results = useSubscribe(
        () => store.getResults().results.nodes[id],
        (fn) => store.onChange(`ns:${id}`, fn),
        [id],
    );
    const name = nodeName(results);
    if (!name) return null;
    return (
        <JumpTo noOutline loc={name.loc}>
            <div
                style={{
                    cursor: 'pointer',
                    // marginRight: 8,
                    backgroundColor: '#111',
                    padding: '4px 8px',
                    borderRadius: 4,
                    wordBreak: 'keep-all',
                    whiteSpace: 'nowrap',
                    ...name.style,
                }}
            >
                {name.name}
            </div>
        </JumpTo>
    );
};

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
        pathsEqual(prevProps.path, nextProps.path) &&
        prevProps.zoom === nextProps.zoom
    );
});

export { Wrapped as NSTop };

const RenderProduce = ({
    ns,
    value,
    collapsed,
}: {
    ns: number;
    value: ProduceItem[];
    collapsed?: CollapseState;
}) => {
    const [hover, setHover] = useState(false);
    const [show, setShow] = useState(false);
    const inner = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(null as null | number);
    const store = useGetStore();

    useEffect(() => {
        // if (!hover) return setShow(false);
        let tid = setTimeout(() => setShow(hover), 300);
        return () => clearTimeout(tid);
    }, [hover]);

    useLayoutEffect(() => {
        if (inner.current) {
            setHeight(inner.current.getBoundingClientRect().height);
        }
    }, [value]);

    const maxHeight = 45;

    // HACK (maybe) to only show inferred type if tehre's only one of them...
    const numTypes = value.filter(
        (p) => typeof p !== 'string' && p.type === 'type',
    ).length;
    if (numTypes > 1) {
        value = value.filter((p) => typeof p === 'string' || p.type !== 'type');
    }

    if (!value.length) return null;

    const tooLong = height != null && height > maxHeight;

    if (collapsed === true) return <>...</>;
    return (
        <div
            style={{
                whiteSpace: 'pre',
                fontSize: '80%',
                color: 'rgba(255,255,255,0.5)',
                maxHeight: collapsed === 'pinned' ? 'unset' : `${maxHeight}px`,
                maxWidth: 1000,
                zIndex: show ? 100 : 0,
                position: 'relative',
                overflowY: show ? 'visible' : 'hidden',
                overflowX: show ? 'visible' : 'auto',
                border:
                    tooLong && collapsed !== 'pinned'
                        ? '1px solid #666'
                        : 'unset',
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div
                ref={inner}
                style={{
                    // position: 'relative',
                    backgroundColor: 'black',
                    padding: 4,
                    border:
                        tooLong && collapsed !== 'pinned'
                            ? '1px solid #666'
                            : 'unset',
                }}
            >
                {value?.map((item, i) => (
                    <div key={i}>
                        <RenderProduceItem value={item} ns={ns} />
                    </div>
                ))}
                {tooLong && (show || collapsed === 'pinned') ? (
                    <div
                        style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            const current = store.getState().nsMap[ns];
                            store.dispatch({
                                type: 'ns',
                                nsMap: {
                                    [ns]: {
                                        ...current,
                                        collapsed:
                                            collapsed === 'pinned'
                                                ? false
                                                : 'pinned',
                                    },
                                },
                            });
                        }}
                    >
                        📌
                    </div>
                ) : null}
            </div>
        </div>
    );
};
