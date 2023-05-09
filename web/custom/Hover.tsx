import React, { useLayoutEffect, useState } from 'react';
import { getType } from '../../src/get-type/get-types-new';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { errorToString } from '../../src/to-cst/show-errors';
import { fromMCST } from '../../src/types/mcst';
import { State } from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { Action, UIState } from './UIState';
import { subRect } from './Cursors';

const getRegNode = (idx: number, regs: UIState['regs']) => {
    const got = regs[idx];
    return got?.main?.node ?? got?.start?.node ?? got?.outside?.node;
};

export const Hover = ({
    state,
    dispatch,
}: {
    state: UIState;
    dispatch: React.Dispatch<Action>;
}) => {
    let found: { idx: number; text: string }[] = [];
    for (let i = state.hover.length - 1; i >= 0; i--) {
        let idx = state.hover[i].idx;
        if (idx === -1) continue;
        if (state.ctx.results.errors[idx]?.length) {
            found.push({
                idx,
                text: state.ctx.results.errors[idx]
                    .map((err) => errorToString(err, state.ctx))
                    .join('\n'),
            });
        }
    }
    // if (found == null) {
    const last = state.hover[state.hover.length - 1]?.idx;
    if (last != null) {
        const style = state.ctx.results.display[last]?.style;
        if (
            (style?.type === 'id' ||
                style?.type === 'id-decl' ||
                style?.type === 'tag') &&
            style.ann
        ) {
            found.push({
                idx: last,
                text: nodeToString(
                    nodeForType(style.ann, state.ctx.results.hashNames),
                    state.ctx.results.hashNames,
                ),
                // ' ' +
                // (style.hash + '').slice(0, 10),
            });
        }
    }
    // }

    const node = found.length ? getRegNode(found[0].idx, state.regs) : null;
    // if (!node || found == null)
    //     return (
    //         <div>
    //             Hover {JSON.stringify(state.hover)} Node {!!node + ''} Found{' '}
    //             {found ? found.idx + '' : 'no found'} um{' '}
    //             {found
    //                 ? Object.keys(state.regs[found.idx] ?? {}).join('')
    //                 : null}
    //         </div>
    //     );
    if (!node || !found.length) return null;

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
                    display: 'block',
                    gridTemplateColumns: 'max-content max-content',
                }}
            >
                {found.map((f) => (
                    <div>{f.text}</div>
                ))}
            </div>
        </div>
    );
};
