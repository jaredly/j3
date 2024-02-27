import equal from 'fast-deep-equal';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { sexp } from '../../progress/sexp';
import { nilt } from '../../src/to-ast/Ctx';
import { fromMCST } from '../../src/types/mcst';
import { Path } from '../../src/state/path';
import { Render } from './Render';
import { closestSelection } from './verticalMove';
import {
    UIState,
    Action,
    NUIState,
    SandboxNamespace,
    RealizedNamespace,
} from './UIState';
import { orderStartAndEnd } from '../../src/parse/parse';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { getType } from '../../src/get-type/get-types-new';
import { Ctx } from '../../src/to-ast/library';
import { Cursor, pathCard } from '../../src/state/getKeyUpdate';
import { Reg } from './types';
import { nsPath } from '../../src/state/newNodeBefore';

const Whatsit = ({
    ns,
    path,
    dispatch,
}: {
    ns: RealizedNamespace;
    path: Path[];
    dispatch: React.Dispatch<Action>;
}) => {
    const [hover, setHover] = useState(false);
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
            onClick={() => {
                console.log('clicked it');
                const nsp = nsPath(path);
                if (!nsp) throw new Error('path not nspath');
                dispatch({
                    type: 'ns',
                    nsUpdate: {
                        type: 'replace',
                        path: nsp,
                        collapsed: !ns.collapsed,
                    },
                });
            }}
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
}: {
    path: Path[];
    dispatch: React.Dispatch<Action>;
    state: NUIState;
    reg: Reg;
    results: Ctx['results'];
    ns: RealizedNamespace;
    selections: Cursor[];
    produce: { [key: number]: string };
}) {
    return (
        <div
            style={{
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {ns.top !== -1 ? (
                    <>
                        <Whatsit ns={ns} dispatch={dispatch} path={path} />
                        <div>
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
            <div>
                {ns.children.map((child, i) =>
                    child.type === 'normal' ? (
                        <ViewSNS
                            reg={reg}
                            produce={produce}
                            key={i}
                            ns={child}
                            path={path.concat({
                                type: 'ns' as const,
                                at: i,
                                idx: ns.top,
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
                ns={state.cards[card].ns}
                path={cardPath}
                state={state}
                dispatch={dispatch}
                results={results}
                produce={produce}
                selections={selections}
            />
            {/* {tops.map((top, i) => {
                const got = results?.toplevel[top];
                return ;
            })} */}
        </div>
    );
}

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
