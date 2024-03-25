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
import { Path } from '../../src/state/path';
import { Debug, Results } from '../ide/ground-up/GroundUp';
import { verifyState } from '../ide/ground-up/reduce';
import { NSTop } from './NSTop';
import { Action, NUIState, RealizedNamespace } from './UIState';
import { Reg } from './types';
import { useNSDrag } from './useNSDrag';
import { closestSelection } from './verticalMove';
import {
    MyEvalError,
    FullEvalator,
    LocError,
    Produce,
    ProduceItem,
} from '../ide/ground-up/Evaluators';

export function CardRoot({
    state,
    card,
    dispatch,
    // results,
    produce,
    debug,
    env,
    ev,
}: {
    debug: Debug;
    env: any;
    card: number;
    state: NUIState;
    dispatch: React.Dispatch<Action>;
    // results: Results;
    produce: { [key: number]: ProduceItem[] };
    ev: FullEvalator<any, any, any> | void | null;
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

    const { dragObj, nsReg, dragElements } = useNSDrag(state, dispatch);

    const invalid = useMemo(() => {
        try {
            verifyState(state);
        } catch (err) {
            return err as Error;
        }
    }, []);

    return (
        <div
            style={{
                // maxWidth: 1400,
                overflow: 'auto',
            }}
            {...dragProps}
            onMouseDown={(evt) => {
                let current = evt.target as HTMLElement;
                while (current && current !== document.body) {
                    if (current.classList.contains('rich-text')) return;
                    current = current.parentElement!;
                }

                let action = selectionAction(evt, state.at, state.regs);
                if (action) {
                    dispatch(action);
                }
            }}
        >
            <NSTop
                reg={reg}
                debug={debug}
                ev={ev}
                nsReg={nsReg}
                drag={dragObj}
                ns={state.nsMap[state.cards[card].top] as RealizedNamespace}
                path={cardPath}
                state={state}
                dispatch={dispatch}
                // results={results}
                produce={produce}
                selections={selections}
                env={env}
            />
            {dragElements}
            {invalid ? (
                <pre
                    style={{
                        backgroundColor: 'rgba(100,0,0)',
                        margin: 16,
                        padding: 16,
                    }}
                >
                    INVALID STATE detecteed
                    {'\n' + invalid.message}
                </pre>
            ) : null}
        </div>
    );
}

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

export function normalizeSelections(at: Cursor[]): Cursor[] {
    return at
        .filter((s) => s.end)
        .map(({ start, end }) => {
            [start, end] = orderStartAndEnd(start, end!);
            return { start, end };
        });
}

export function useRegs(state: NUIState): Reg {
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
            let current = evt.target as HTMLElement;
            while (current && current !== document.body) {
                if (current.classList.contains('rich-text')) return;
                current = current.parentElement!;
            }

            setDrag(true);
        },
    };
}

export const isAncestor = (node: HTMLElement, parent: HTMLElement) => {
    while (
        node !== parent &&
        node.parentElement !== node &&
        node.parentElement
    ) {
        node = node.parentElement;
    }
    return node === parent;
};
