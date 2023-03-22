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

    return (
        <div
            style={{
                position: 'absolute',
                top: box.bottom,
                left: box.left,
                gap: '0px 8px',
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
            {menu.items?.map((item, i) => (
                <React.Fragment key={i}>
                    <div style={{ gridColumn: 1, padding: 4 }}>{item.text}</div>
                    <div style={{ gridColumn: 2, padding: 4 }}>
                        {item.type === 'replace'
                            ? nodeToString(nodeForType(item.ann, ctx))
                            : null}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};
