import React, { useLayoutEffect, useState } from 'react';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { Path } from '../mods/path';
import { Action, UIState } from './UIState';
import { subRect } from './Cursors';

export const Menu = ({
    state,
    menu,
    dispatch,
}: {
    state: UIState;
    menu: { path: Path[]; items: AutoCompleteResult[] };
    dispatch: React.Dispatch<Action>;
}) => {
    const [node, setNode] = useState(null as null | any);

    useLayoutEffect(() => {
        const idx = menu.path[menu.path.length - 1].idx;
        const node = state.regs[idx]?.main?.node;
        setNode(node);
    }, [menu]);
    const [hover, setHover] = useState(null as null | number);

    if (!node) return null;
    const box = subRect(
        node.getBoundingClientRect(),
        node.offsetParent!.getBoundingClientRect(),
    );

    const selectionIndex = state.menu?.selection ?? 0;

    return (
        <div
            style={{
                position: 'absolute',
                top: box.top + box.height,
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
            onMouseLeave={() => setHover(null)}
        >
            {menu.items?.map((item, i) => {
                const selected = i === selectionIndex && item.type === 'update';
                const onClick = (evt: React.MouseEvent) => {
                    if (item.type === 'update') {
                        dispatch({
                            type: 'menu-select',
                            path: menu.path,
                            item,
                        });
                    }
                };
                const style = {
                    padding: 4,
                    cursor: item.type === 'update' ? 'pointer' : 'text',
                    backgroundColor:
                        i === hover && item.type === 'update'
                            ? '#444'
                            : selected
                            ? '#222'
                            : '',
                };
                return (
                    <React.Fragment key={i}>
                        <div
                            style={{ gridColumn: 1, ...style }}
                            onClick={onClick}
                            onMouseEnter={(evt) => setHover(i)}
                        >
                            {item.text}
                        </div>
                        <div
                            style={{ gridColumn: 2, ...style }}
                            onClick={onClick}
                            onMouseEnter={(evt) => setHover(i)}
                        >
                            {item.type === 'update' && item.ann
                                ? nodeToString(
                                      nodeForType(
                                          item.ann,
                                          state.ctx.results.hashNames,
                                      ),
                                      state.ctx.results.hashNames,
                                  )
                                : null}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
