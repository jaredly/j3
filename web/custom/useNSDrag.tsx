import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { NsPath, Path } from '../../src/state/path';
import { Action, NUIState, RealizedNamespace } from './UIState';

export const canDrop = (drag: DragState) => {
    if (!drag.drop || !drag.moved) return false;
    const end = drag.drop.path[drag.drop.path.length - 1] as NsPath;
    if (
        drag.source.idx === end.idx &&
        (drag.source.at === end.at ||
            (drag.source.at === end.at + 1 && drag.drop.position === 'after') ||
            (drag.source.at === end.at - 1 && drag.drop.position === 'before'))
    ) {
        return false;
    }
    return true;
};

export type DragState = {
    ns: RealizedNamespace;
    onClick(): void;
    source: { idx: number; at: number };
    nsp: string;
    orig: {
        x: number;
        y: number;
    };
    moved: boolean;
    drop: null | {
        x: number;
        y: number;
        w: number;
        h: number;
        path: Path[];
        position: 'before' | 'after' | 'inside';
    };
};

export const useLatest = <T,>(v: T) => {
    const r = useRef(v);
    r.current = v;
    return r;
};

export const findDrop = (nsReg: NsReg, evt: MouseEvent): DragState['drop'] => {
    // console.log('regs', nsReg);
    let closest = null as null | [number, DOMRect, Path[]];
    // let offset = 4;
    let boffset = 13;
    let aoffset = 3;
    let insideOffset = 20;
    for (let v of Object.values(nsReg)) {
        if (!v) continue;
        const box = v.node.getBoundingClientRect();
        const dist =
            evt.clientY < box.top
                ? box.top - evt.clientY
                : evt.clientY > box.bottom
                ? evt.clientY - box.bottom
                : 0;
        if (!closest || closest[0] > dist) {
            closest = [dist, box, v.path];
        }
    }
    if (closest) {
        const [_, box, path] = closest;
        const position =
            evt.clientX > box.left + insideOffset * 3
                ? 'inside'
                : evt.clientY < (box.bottom + box.top) / 2
                ? 'before'
                : 'after';
        return {
            path,
            x: box.left + (position === 'inside' ? insideOffset : 0),
            y: position === 'before' ? box.top - boffset : box.bottom + aoffset,
            w: 200,
            h: 10,
            position,
        };
    }
    return null;
};

export const useNSDrag = (
    state: NUIState,
    dispatch: React.Dispatch<Action>,
) => {
    const [drag, setDrag] = useState(null as null | DragState);
    const latestDrag = useLatest(drag);

    const nsReg: NsReg = useMemo(() => ({}), []);

    useEffect(() => {
        if (!drag) return;
        const margin = 10;
        const move = (evt: MouseEvent) => {
            const drag = latestDrag.current!;
            if (
                drag.moved ||
                Math.abs(evt.clientX - drag.orig.x) > margin ||
                Math.abs(evt.clientY - drag.orig.y) > margin
            ) {
                setDrag({ ...drag, moved: true, drop: findDrop(nsReg, evt) });
            }
        };
        const up = (evt: MouseEvent) => {
            const drag = latestDrag.current;
            if (drag && !drag?.moved) {
                drag.onClick();
            }
            if (drag?.drop && canDrop(drag)) {
                let target = drag.drop.path[
                    drag.drop.path.length - 1
                ] as NsPath;
                console.log('dropping', target, drag.source);
                // const nsMap: NsUpdateMap = {};
                let targetParent = state.nsMap[target.idx] as RealizedNamespace;
                let children = targetParent.children.slice();
                const oldParent = state.nsMap[
                    drag.source.idx
                ] as RealizedNamespace;
                const nid = oldParent.children[drag.source.at];
                const moving = state.nsMap[nid] as RealizedNamespace;
                let tpath = drag.drop.path;

                if (drag.drop.position === 'inside') {
                    let tid = children[target.at];
                    targetParent = state.nsMap[tid] as RealizedNamespace;
                    children = targetParent.children.slice();
                    target = {
                        type: 'ns',
                        idx: tid,
                        at: targetParent.collapsed ? children.length : 0,
                    };
                    tpath = tpath.concat([target]);
                } else {
                    tpath = tpath.slice();
                    const last = { ...tpath[tpath.length - 1] } as Extract<
                        Path,
                        { type: 'ns' }
                    >;
                    tpath[tpath.length - 1] = last;
                    if (target.idx === drag.source.idx) {
                        if (drag.source.at < target.at) {
                            last.at -= 1;
                        }
                        if (drag.drop.position === 'after') {
                            last.at += 1;
                        }
                    } else if (drag.drop.position === 'after') {
                        last.at += 1;
                    }
                }

                const selection = tpath.concat([
                    { type: 'ns-top', idx: nid },
                    { type: 'start', idx: moving.top },
                ]);

                if (target.idx === drag.source.idx) {
                    children.splice(drag.source.at, 1);
                    children.splice(
                        target.at +
                            (drag.source.at < target.at ? -1 : 0) +
                            (drag.drop.position === 'after' ? 1 : 0),
                        0,
                        nid,
                    );
                    dispatch({
                        type: 'ns',
                        nsMap: {
                            [targetParent.id]: {
                                ...targetParent,
                                children,
                            },
                        },
                        selection: selection,
                    });
                } else {
                    children.splice(
                        target.at + (drag.drop.position === 'after' ? 1 : 0),
                        0,
                        nid,
                    );
                    dispatch({
                        type: 'ns',
                        nsMap: {
                            [targetParent.id]: {
                                ...targetParent,
                                children,
                            },
                            [oldParent.id]: {
                                ...oldParent,
                                children: oldParent.children.filter(
                                    (id) => id !== nid,
                                ),
                            },
                        },
                        selection,
                    });
                }
            }
            setDrag(null);
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        return () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        };
    }, [drag]);

    const startDrag = useCallback(
        (
            evt: React.MouseEvent,
            source: DragState['source'],
            ns: RealizedNamespace,
            nsp: string,
            onClick: () => void,
        ) => {
            setDrag({
                ns,
                nsp,
                onClick,
                orig: { x: evt.clientX, y: evt.clientY },
                moved: false,
                drop: null,
                source,
            });
        },
        [],
    );
    const cancelDrag = useCallback(() => setDrag(null), []);
    const dragObj = useMemo(
        (): Drag => ({ start: startDrag, cancel: cancelDrag }),
        [startDrag, cancelDrag],
    );

    const dragBox = drag?.moved
        ? nsReg[drag.nsp]?.node.getBoundingClientRect()
        : null;

    return {
        nsReg,
        dragObj,
        dragElements: (
            <>
                {dragBox ? (
                    <div
                        style={{
                            position: 'fixed',
                            top: dragBox.y,
                            left: dragBox.x,
                            width: Math.max(dragBox.width, 200),
                            height: dragBox.height,
                            backgroundColor: '#aaa',
                            borderRadius: 3,
                            opacity: 0.3,
                        }}
                    ></div>
                ) : null}
                {drag?.drop && canDrop(drag) ? (
                    <div
                        style={{
                            position: 'fixed',
                            top: drag.drop.y,
                            left: drag.drop.x,
                            width: drag.drop.w,
                            height: drag.drop.h,
                            backgroundColor: 'blue',
                            borderRadius: 3,
                            opacity: 0.8,
                        }}
                    ></div>
                ) : null}
            </>
        ),
    };
};
type StartDrag = (
    evt: React.MouseEvent,
    source: DragState['source'],
    ns: RealizedNamespace,
    nsp: string,
    onClick: () => void,
) => void;

export type Drag = { start: StartDrag; cancel: () => void };

export type NsReg = {
    [key: string]: {
        node: HTMLDivElement;
        path: Path[];
        dest: { idx: number; at: number };
    } | null;
};
