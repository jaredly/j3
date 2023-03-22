import React from 'react';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { UIState } from './ByHand';

export const Menu = ({
    state,
    ctx,
    menu,
}: {
    state: UIState;
    ctx: Ctx;
    menu: { idx: number; items: AutoCompleteResult[] };
}) => {
    const node = state.regs[menu.idx]?.main?.node;
    if (!node) return null;

    const box = node.getBoundingClientRect();

    const selectionIndex = state.menu?.selection ?? 0;

    return (
        <div
            style={{
                position: 'absolute',
                top: box.bottom,
                left: box.left,
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
            {menu.items?.map((item, i) => {
                const selected = i === selectionIndex;
                return (
                    <React.Fragment key={i}>
                        <div
                            style={{
                                padding: 4,
                                gridColumn: 1,
                                cursor: 'pointer',
                                backgroundColor: selected ? '#222' : '',
                            }}
                        >
                            {item.text}
                        </div>
                        <div
                            style={{
                                padding: 4,
                                gridColumn: 2,
                                cursor: 'pointer',
                                backgroundColor: selected ? '#222' : '',
                            }}
                        >
                            {item.type === 'replace'
                                ? nodeToString(nodeForType(item.ann, ctx))
                                : null}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
