import React, { useLayoutEffect, useState } from 'react';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { Action, UIState } from './ByHand';

export const Menu = ({
    state,
    ctx,
    menu,
    dispatch,
}: {
    state: UIState;
    ctx: Ctx;
    menu: { idx: number; items: AutoCompleteResult[] };
    dispatch: React.Dispatch<Action>;
}) => {
    const [node, setNode] = useState(null as null | any);

    useLayoutEffect(() => {
        if (!node) {
            const node = state.regs[menu.idx]?.main?.node;
            setNode(node);
        }
    }, [state, menu]);

    if (!node) return null;
    const box = node?.getBoundingClientRect();

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
                const selected =
                    i === selectionIndex && item.type === 'replace';
                const onClick = (evt: React.MouseEvent) => {
                    if (item.type === 'replace') {
                        dispatch({ type: 'menu-select', idx: menu.idx, item });
                    }
                };
                const style = {
                    padding: 4,
                    cursor: item.type === 'replace' ? 'pointer' : 'text',
                    backgroundColor: selected ? '#222' : '',
                };
                return (
                    <React.Fragment key={i}>
                        <div
                            style={{ gridColumn: 1, ...style }}
                            onClick={onClick}
                        >
                            {item.text}
                        </div>
                        <div
                            style={{ gridColumn: 2, ...style }}
                            onClick={onClick}
                        >
                            {item.type === 'replace' && item.ann
                                ? nodeToString(nodeForType(item.ann, ctx))
                                : null}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
