import equal from 'fast-deep-equal';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { orderStartAndEnd } from '../../src/parse/parse';
import { Cursor, pathCard } from '../../src/state/getKeyUpdate';
import { NsPath, Path } from '../../src/state/path';
import { Ctx } from '../../src/to-ast/library';
import { Render } from './Render';
import { Action, NUIState, RealizedNamespace } from './UIState';
import { Reg } from './types';
import { closestSelection } from './verticalMove';

type StartDrag = (
    evt: React.MouseEvent,
    source: DragState['source'],
    ns: RealizedNamespace,
    nsp: string,
    onClick: () => void,
) => void;

const Whatsit = ({
    ns,
    nsp,
    path,
    dispatch,
    startDrag,
}: {
    ns: RealizedNamespace;
    nsp: string;
    path: Path[];
    dispatch: React.Dispatch<Action>;
    startDrag: StartDrag;
}) => {
    const [hover, setHover] = useState(false);
    const source = useMemo(() => {
        const last = path[path.length - 1];
        if (last.type !== 'ns') {
            console.log(path);
            throw new Error('bad path');
        }
        return { idx: last.idx, at: last.at };
    }, [path]);

    return (
        <div
            style={{
                cursor: 'pointer',
                marginRight: 12,
                color: hover ? 'white' : '#444',
            }}
            data-handle="true"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onMouseDown={(evt) =>
                startDrag(evt, source, ns, nsp, () => {
                    dispatch({
                        type: 'ns',
                        nsMap: {
                            [ns.id]: { ...ns, collapsed: !ns.collapsed },
                        },
                    });
                })
            }
        >
            [{ns.collapsed ? '>' : 'v'}]
        </div>
    );
};

export function ViewSNS({
    ns,
    state,
    reg,
    results,
    dispatch,
    selections,
    produce,
    path,
    nsReg,
    startDrag,
}: {
    nsReg: NsReg;
    path: Path[];
    dispatch: React.Dispatch<Action>;
    state: NUIState;
    reg: Reg;
    results: Ctx['results'];
    ns: RealizedNamespace;
    selections: Cursor[];
    produce: { [key: number]: string };
    startDrag: StartDrag;
}) {
    // const nsp = useMemo(() => nsPath(path), []);
    // if (!nsp) return <div>Invalid ns path</div>;
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
        >
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {ns.top !== -1 && source ? (
                    <>
                        <Whatsit
                            startDrag={startDrag}
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
                            <Render
                                debug={false}
                                idx={ns.top}
                                map={state.map}
                                reg={reg}
                                display={results.display ?? empty}
                                hashNames={results.hashNames ?? empty}
                                errors={results.errors ?? empty}
                                dispatch={dispatch}
                                selection={selections}
                                path={path}
                            />
                            {ns.collapsed ? null : (
                                <div
                                    style={{
                                        whiteSpace: 'pre',
                                        fontSize: '80%',
                                    }}
                                >
                                    {produce[ns.top]?.trim() ?? 'hrm'}
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
            <div style={{ marginLeft: 30, marginTop: 8, marginBottom: -8 }}>
                {ns.children
                    .map((id) => state.nsMap[id])
                    .map((child, i) =>
                        child.type === 'normal' ? (
                            <ViewSNS
                                reg={reg}
                                startDrag={startDrag}
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

type NsReg = {
    [key: string]: {
        node: HTMLDivElement;
        path: Path[];
        dest: { idx: number; at: number };
    } | null;
};

const useLatest = <T,>(v: T) => {
    const r = useRef(v);
    r.current = v;
    return r;
};

export function CardRoot({
    state,
    card,
    dispatch,
    results,
    produce,
}: {
    card: number;
    state: NUIState;
    dispatch: React.Dispatch<Action>;
    results: Ctx['results'];
    produce: { [key: number]: string };
}) {
    const selections = React.useMemo(
        () =>
            normalizeSelections(
                state.at.filter((s) => pathCard(s.start) === card),
            ),
        [state.at, card],
    );
    const reg = useRegs(state);
    const dragProps = useDrag(dispatch, state);

    const cardPath: Path[] = useMemo(
        () => [{ type: 'card', idx: -1, card }],
        [card],
    );

    const nsReg: NsReg = useMemo(() => ({}), []);

    const [drag, setDrag] = useState(null as null | DragState);
    const latestDrag = useLatest(drag);

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
                let tparent = state.nsMap[target.idx] as RealizedNamespace;
                let children = tparent.children.slice();
                const oparent = state.nsMap[
                    drag.source.idx
                ] as RealizedNamespace;
                const nid = oparent.children[drag.source.at];

                if (drag.drop.position === 'inside') {
                    let tid = children[target.at];
                    tparent = state.nsMap[tid] as RealizedNamespace;
                    children = tparent.children.slice();
                    target = { type: 'ns', idx: tid, at: 0 };
                }

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
                            [tparent.id]: {
                                ...tparent,
                                children,
                            },
                        },
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
                            [tparent.id]: {
                                ...tparent,
                                children,
                            },
                            [oparent.id]: {
                                ...oparent,
                                children: oparent.children.filter(
                                    (id) => id !== nid,
                                ),
                            },
                        },
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

    const ok = drag?.moved
        ? nsReg[drag.nsp]?.node.getBoundingClientRect()
        : null;

    return (
        <div
            {...dragProps}
            onMouseLeave={(evt) => {
                dispatch({ type: 'hover', path: [] });
            }}
            onMouseDown={(evt) => {
                let action = selectionAction(evt, state.at, state.regs);
                if (action) {
                    dispatch(action);
                }
            }}
        >
            <ViewSNS
                reg={reg}
                nsReg={nsReg}
                startDrag={startDrag}
                ns={state.nsMap[state.cards[card].top] as RealizedNamespace}
                path={cardPath}
                state={state}
                dispatch={dispatch}
                results={results}
                produce={produce}
                selections={selections}
            />
            {ok ? (
                <div
                    style={{
                        position: 'absolute',
                        top: ok.y,
                        left: ok.x,
                        width: Math.max(ok.width, 200),
                        height: ok.height,
                        backgroundColor: '#aaa',
                        borderRadius: 3,
                        opacity: 0.3,
                    }}
                ></div>
            ) : null}
            {drag?.drop && canDrop(drag) ? (
                <div
                    style={{
                        position: 'absolute',
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
            <pre>{JSON.stringify(state.nsMap, null, 2)}</pre>
        </div>
    );
}

const canDrop = (drag: DragState) => {
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

const empty = {};

// hmm don't actually need this yet
// export const sameCardAndNs = (p1: Path[], p2: Path[]) => {
//     if (
//         p1[0].type !== 'card' ||
//         p2[0].type !== 'card' ||
//         p1[0].card !== p2[0].card
//     ) {
//         return false;
//     }
//     for (let i = 1; i < p1.length && i < p2.length; i++) {
//         const a = p1[i];
//         const b = p2[i];
//         if (a.type === 'ns' && b.type === 'ns') {
//             if (a.at !== b.at) return false;
//             continue;
//         }
//         if (a.type === 'ns' || b.type === 'ns') return false;
//         break;
//     }
//     return true;
// };

function selectionAction(
    evt: React.MouseEvent<HTMLDivElement, MouseEvent>,
    at: Cursor[],
    regs: NUIState['regs'],
): Action | void {
    const sel = closestSelection(regs, {
        x: evt.clientX, // + window.scrollX,
        y: evt.clientY, // + window.scrollY,
    });
    if (!sel) return;

    if (evt.shiftKey && at.length) {
        const sels = at.slice();
        sels[sels.length - 1] = {
            ...sels[sels.length - 1],
            end: sel,
        };
        return { type: 'select', at: sels };
    } else {
        return {
            type: 'select',
            add: evt.altKey,
            at: [{ start: sel }],
        };
    }
}

function normalizeSelections(at: Cursor[]): Cursor[] {
    return at
        .filter((s) => s.end)
        .map(({ start, end }) => {
            [start, end] = orderStartAndEnd(start, end!);
            return { start, end };
        });
}

function useRegs(state: NUIState): Reg {
    return useCallback((node, idx, path, loc) => {
        if (!state.regs[idx]) {
            state.regs[idx] = {};
        }
        state.regs[idx][loc ?? 'main'] = node ? { node, path } : null;
    }, []);
}

function useDrag(dispatch: React.Dispatch<Action>, state: NUIState) {
    const [drag, setDrag] = useState(false);
    const currentState = useRef(state);
    currentState.current = state;

    useEffect(() => {
        if (!drag) {
            return;
        }
        const up = () => {
            setDrag(false);
        };
        const move = (evt: MouseEvent) => {
            const state = currentState.current;
            const sel = closestSelection(state.regs, {
                x: evt.clientX, // + window.scrollX,
                y: evt.clientY, // + window.scrollY,
            });
            if (sel) {
                const at = state.at.slice();
                const idx = at.length - 1;
                if (equal(sel, at[idx].start)) {
                    at[idx] = { start: sel };
                    dispatch({ type: 'select', at });
                } else {
                    at[idx] = { ...at[idx], end: sel };
                    dispatch({ type: 'select', at });
                }
            }
        };
        document.addEventListener('mouseup', up, { capture: true });
        document.addEventListener('mousemove', move);
        return () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up, { capture: true });
        };
    }, [drag]);
    return {
        onMouseDownCapture: (evt: React.MouseEvent) => {
            if ((evt.target as HTMLElement).getAttribute('data-handle')) {
                return;
            }
            setDrag(true);
        },
    };
}

type DragState = {
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

const findDrop = (nsReg: NsReg, evt: MouseEvent): DragState['drop'] => {
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