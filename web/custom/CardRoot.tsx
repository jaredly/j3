import React, { useCallback, useMemo } from 'react';
import { Cursor } from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { Debug } from '../ide/ground-up/GroundUp';
import { verifyState } from '../ide/ground-up/reduce';
import { NSTop } from './NSTop';
import { Action, NUIState } from './UIState';
import { closestSelection } from './closestSelection';
import { Reg } from './types';
import { useDrag } from './useDrag';
import { useNSDrag } from './useNSDrag';

export function CardRoot({
    state,
    card,
    dispatch,
    debug,
}: {
    debug: Debug;
    card: number;
    state: NUIState;
    dispatch: React.Dispatch<Action>;
}) {
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
                overflow: 'auto',
                paddingBottom: 300,
            }}
            {...dragProps}
            onMouseDown={(evt) => {
                if (evt.metaKey) return;
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
                debug={debug}
                nsReg={nsReg}
                drag={dragObj}
                idx={state.cards[card].top}
                path={cardPath}
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

export function useRegs(state: NUIState): Reg {
    return useCallback((node, idx, path, loc) => {
        if (!state.regs[idx]) {
            state.regs[idx] = {};
        }
        state.regs[idx][loc ?? 'main'] = node ? { node, path } : null;
    }, []);
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
