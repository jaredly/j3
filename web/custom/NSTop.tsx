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
import { RealizedNamespace } from './UIState';
import { plugins } from './plugins';
import { Store } from './store/Store';
import { useExpanded, useGetStore } from './store/StoreCtx';
import { useNamespace } from './store/useNamespace';
import { useNode } from './store/useNode';
import { RenderProps } from './types';
import { RenderProduceItem } from './RenderProduceItem';

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
}: {
    idx: number;
    nsReg: NsReg;
    path: Path[];
    drag: Drag;
    debug: Debug;
    setPin: (pin: number | null) => void;
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
                            setPin={setPin}
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
                                    key={ns.top}
                                    debug={false}
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
                                collapsed={ns.collapsed}
                                value={produce}
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

const RenderProduce = ({
    value,
    collapsed,
}: {
    value: ProduceItem[];
    collapsed?: boolean;
}) => {
    const [hover, setHover] = useState(false);
    const [show, setShow] = useState(false);
    const inner = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(null as null | number);

    useEffect(() => {
        if (!hover) return setShow(false);
        let tid = setTimeout(() => setShow(true), 300);
        return () => clearTimeout(tid);
    }, [hover]);

    useLayoutEffect(() => {
        if (inner.current) {
            setHeight(inner.current.getBoundingClientRect().height);
        }
    }, [value]);

    const maxHeight = 40;

    if (!value.length) return null;

    if (collapsed) return <>...</>;
    return (
        <div
            style={{
                whiteSpace: 'pre',
                fontSize: '80%',
                color: 'rgba(255,255,255,0.5)',
                maxHeight: show ? 'unset' : `${maxHeight}px`,
                maxWidth: 1000,
                overflowY: 'hidden',
                overflowX: 'auto',
                padding: 4,
                border:
                    height != null && height > maxHeight
                        ? '1px solid #666'
                        : 'unset',
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div ref={inner}>
                {value?.map((item, i) => (
                    <div key={i}>
                        <RenderProduceItem value={item} />
                    </div>
                ))}
            </div>
        </div>
    );
};
