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
import { UIState, Action, NUIState, SandboxNamespace } from './UIState';
import { orderStartAndEnd } from '../../src/parse/parse';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { getType } from '../../src/get-type/get-types-new';
import { Ctx } from '../../src/to-ast/library';
import { Cursor, pathCard } from '../../src/state/getKeyUpdate';
import { Reg } from './types';

export function ViewSNS({
    ns,
    state,
    reg,
    results,
    dispatch,
    selections,
    card,
}: {
    path: string[];
    dispatch: React.Dispatch<Action>;
    state: NUIState;
    reg: Reg;
    results: Ctx['results'];
    ns: Extract<SandboxNamespace, { type: 'normal' }>;
    selections: Cursor[];
    card: number;
}) {
    const cardPath: Path[] = useMemo(
        () => [{ type: 'card', card, idx: -1 }],
        [card],
    );
    return (
        <div style={{ marginBottom: 8, display: 'flex' }}>
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
                    path={cardPath}
                />
            </div>
        </div>
    );
}

export function CardRoot({
    state,
    card,
    dispatch,
    results,
}: {
    card: number;
    state: NUIState;
    dispatch: React.Dispatch<Action>;
    results: Ctx['results'];
}) {
    useEffect(() => {
        console.log('ROOT First render');
    }, []);
    const selections = React.useMemo(
        () =>
            normalizeSelections(
                state.at.filter((s) => pathCard(s.start) === card),
            ),
        [state.at, card],
    );
    const reg = useRegs(state);
    const dragProps = useDrag(dispatch, state);

    return (
        <div
            {...dragProps}
            style={{ cursor: 'text', padding: 16 }}
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
                card={card}
                reg={reg}
                ns={state.cards[card].ns}
                path={state.cards[card].path}
                state={state}
                dispatch={dispatch}
                results={results}
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

    if (
        evt.shiftKey &&
        at.length &&
        pathCard(at[at.length - 1].start) === pathCard(sel)
    ) {
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
                if (
                    equal(sel, at[idx].start) ||
                    pathCard(at[idx].start) !== pathCard(sel)
                ) {
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
    return { onMouseDownCapture: () => setDrag(true) };
}
