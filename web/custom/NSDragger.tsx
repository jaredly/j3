import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Path } from '../../src/state/path';
import { Action, RealizedNamespace } from './UIState';
import { isAncestor } from './CardRoot';
import { Drag } from './NsReg';
import { NSMenu } from './NSMenu';
import { useGetStore, useSubscribe } from './store/StoreCtx';
import { hasErrors, hasTrackedChanges } from './hasErrors';

export const NSDragger = ({
    ns,
    nsp,
    path,
    dispatch,
    drag,
    setPin,
}: {
    ns: RealizedNamespace;
    nsp: string;
    path: Path[];
    dispatch: React.Dispatch<Action>;
    drag: Drag;
    setPin: (pin: number | null) => void;
}) => {
    const [hover, setHover] = useState(false);
    const source = useMemo(() => {
        const last = path[path.length - 1];
        if (last.type !== 'ns') {
            console.log(path);
            throw new Error('bad path');
        }
        return { idx: last.idx, child: last.child };
    }, [path]);

    const [cm, setCM] = useState(false);
    const mref = useRef<HTMLDivElement>(null);

    const store = useGetStore();
    const errs = useSubscribe(
        () => hasErrors(ns.id, store.getState(), store.getResults()),
        (fn) => store.on('results', fn),
        [ns.id],
    );

    const trackChange = useSubscribe(
        () => hasTrackedChanges(ns.id, store.getState()),
        (fn) => store.on('map', fn),
        [ns.id],
    );

    useEffect(() => {
        if (!cm) return;
        const fn = (evt: MouseEvent) => {
            if (!isAncestor(evt.target as HTMLElement, mref.current!)) {
                drag.cancel();
                evt.preventDefault();
                evt.stopPropagation();
                setCM(false);
            }
        };
        document.addEventListener('mousedown', fn, { capture: true });
        return () =>
            document.removeEventListener('mousedown', fn, { capture: true });
    });

    return (
        <div
            style={{
                cursor: 'pointer',
                marginRight: 12,
                color: hover || cm ? 'white' : '#444',
                opacity: hover || cm || errs || ns.collapsed === true ? 1 : 0.6,
                transition: '.2s ease opacity',
                position: 'relative',
                width: 30,
            }}
            onContextMenu={(evt) => {
                drag.cancel();
                evt.preventDefault();
                setCM(true);
            }}
            data-handle="true"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onMouseDown={(evt) =>
                drag.start(evt, source, ns, nsp, () => {
                    dispatch({
                        type: 'ns',
                        nsMap: {
                            [ns.id]: { ...ns, collapsed: !ns.collapsed },
                        },
                    });
                })
            }
        >
            <span
                style={{
                    outline: trackChange
                        ? '2px dotted rgb(50 100 30)'
                        : undefined,
                }}
            >
                [
                {ns.collapsed === true ? (
                    <span style={{ color: errs ? 'red' : '#aaa' }}>
                        {ns.children.length}
                    </span>
                ) : errs ? (
                    '🚨'
                ) : (
                    '⋯'
                )}
                ]
            </span>
            {cm ? (
                <NSMenu mref={mref} setCM={setCM} ns={ns} setPin={setPin} />
            ) : null}
        </div>
    );
};
