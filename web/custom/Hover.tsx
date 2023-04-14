import React, { useLayoutEffect, useState } from 'react';
import { getType } from '../../src/get-type/get-types-new';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { errorToString } from '../../src/to-cst/show-errors';
import { fromMCST } from '../../src/types/mcst';
import { State } from '../mods/getKeyUpdate';
import { Path } from '../mods/path';
import { Action, UIState } from './ByHand';
import { subRect } from './Cursors';

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
    let found: null | { idx: number; text: string } = null;
    for (let i = state.hover.length - 1; i >= 0; i--) {
        let idx = state.hover[i].idx;
        if (state.ctx.errors[idx]?.length) {
            found = {
                idx,
                text: state.ctx.errors[idx]
                    .map((err) => errorToString(err, state.ctx.hashNames))
                    .join('\n'),
            };
            break;
        }
    }
    if (found == null) {
        const last = state.hover[state.hover.length - 1]?.idx;
        if (last != null) {
            const style = state.ctx.display[last]?.style;
            if (style?.type === 'id' || style?.type === 'id-decl') {
                found = {
                    idx: last,
                    text:
                        (style.type === 'id' && style.ann
                            ? nodeToString(
                                  nodeForType(style.ann, state.ctx.hashNames),
                                  state.ctx.hashNames,
                              ) + '\n'
                            : '') +
                        ' ' +
                        style.hash,
                };
            }
        }
    }

    const node = found != null ? getRegNode(found.idx, state.regs) : null;
    if (!node || found == null) return null;

    const box = subRect(
        node.getBoundingClientRect(),
        node.offsetParent!.getBoundingClientRect(),
    );

    const selectionIndex = state.menu?.selection ?? 0;

    return (
        <div>
            <div
                style={{
                    position: 'absolute',
                    whiteSpace: 'pre-wrap',
                    top: box.top + box.height + 5,
                    left: box.left,
                    pointerEvents: 'none',
                    padding: 8,
                    maxHeight: 500,
                    overflow: 'auto',
                    zIndex: 1000,
                    backgroundColor: 'black',
                    color: '#777',
                    border: '1px solid #555',
                    display: 'grid',
                    gridTemplateColumns: 'max-content max-content',
                }}
            >
                {found.text}
            </div>
        </div>
    );
};
