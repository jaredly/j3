import React, { useLayoutEffect, useState } from 'react';
import { getType } from '../../src/get-type/get-types-new';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { errorToString } from '../../src/to-cst/show-errors';
import { fromMCST } from '../../src/types/mcst';
import { State } from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { Action, NUIState, UIState } from './UIState';
import { subRect } from './Cursors';
import { Ctx } from '../../src/to-ast/library';
import type { Error } from '../../src/types/types';

const getRegNode = (idx: number, regs: UIState['regs']) => {
    const got = regs[idx];
    return got?.main?.node ?? got?.start?.node ?? got?.outside?.node;
};

export const calc = (
    state: NUIState,
    results: Ctx['results'],
    errorToString: (err: Error) => void,
) => {
    let found: { idx: number; text: string }[] = [];
    for (let i = state.hover.length - 1; i >= 0; i--) {
        let idx = state.hover[i].idx;
        if (idx === -1) continue;
        if (results.errors[idx]?.length) {
            found.push({
                idx,
                text: results.errors[idx]
                    .map((err) => errorToString(err))
                    .join('\n'),
            });
        }
    }
    const last = state.hover[state.hover.length - 1]?.idx;
    if (last != null) {
        const style = results.display[last]?.style;
        if (
            (style?.type === 'id' ||
                style?.type === 'id-decl' ||
                style?.type === 'tag') &&
            style.ann
        ) {
            found.push({
                idx: last,
                text: nodeToString(
                    nodeForType(style.ann, results.hashNames),
                    results.hashNames,
                ),
            });
        }
    }

    return found;
};

export const Hover = ({
    state,
    dispatch,
    calc,
}: {
    state: NUIState;
    dispatch: React.Dispatch<Action>;
    calc: () => { idx: number; text: string }[];
}) => {
    const found = calc();

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
                    // maxHeight: 500,
                    overflow: 'auto',
                    zIndex: 1000,
                    backgroundColor: 'black',
                    color: '#777',
                    border: '1px solid #555',
                    display: 'block',
                    gridTemplateColumns: 'max-content max-content',
                }}
            >
                {found.map((f, i) => (
                    <div
                        key={i}
                        style={
                            i > 0
                                ? {
                                      borderTop:
                                          '1px solid rgba(200,200,200,0.4)',
                                      marginTop: 4,
                                      paddingTop: 4,
                                  }
                                : undefined
                        }
                    >
                        {f.text}
                    </div>
                ))}
            </div>
        </div>
    );
};
