import React, { useLayoutEffect, useState } from 'react';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { State } from '../mods/getKeyUpdate';
import { Path } from '../mods/path';
import { Action, UIState } from './ByHand';

const getRegNode = (idx: number, regs: UIState['regs']) => {
    const got = regs[idx];
    return got?.main?.node ?? got?.start?.node;
};

export const Hover = ({
    state,
    dispatch,
}: {
    state: UIState;
    dispatch: React.Dispatch<Action>;
}) => {
    const node = getRegNode(
        state.hover[state.hover.length - 1]?.idx,
        state.regs,
    );

    // useLayoutEffect(() => {
    //     const idx = state.hover[state.hover.length - 1].idx;
    //     const node = state.regs[idx]?.main?.node;
    //     setNode(node);
    // }, [menu]);

    // console.log('hov', node, regs, state.hover[state.hover.length - 1]);
    if (!node) return null;
    const box = node?.getBoundingClientRect();

    const selectionIndex = state.menu?.selection ?? 0;

    return (
        <div>
            <div
                style={{
                    position: 'absolute',
                    top: box.bottom + 5,
                    left: box.left,
                    pointerEvents: 'none',
                    padding: 8,
                    maxHeight: 500,
                    overflow: 'auto',
                    zIndex: 1000,
                    backgroundColor: 'black',
                    border: '1px solid #ccc',
                    display: 'grid',
                    gridTemplateColumns: 'max-content max-content',
                }}
            >
                Hoverrrr
            </div>
            {JSON.stringify(state.hover)}
        </div>
    );
};
