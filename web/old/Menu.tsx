import * as React from 'react';
import { Store, UpdateMap, updateStore } from '../store';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import { nodeForType } from '../../src/to-cst/nodeForType';
// import { makeRCtx } from '../src/to-cst/nodeForExpr';
import { nodeToString } from '../../src/to-cst/nodeToString';

export const Menu = ({
    state,
    ctx,
    pos,
    onAction,
}: {
    state: MenuState;
    ctx: Ctx;
    pos: { left: number; top: number };
    onAction: () => void;
}) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: pos.top,
                zIndex: 2000,
                left: pos.left,
                maxHeight: 300,
                overflow: 'auto',
                backgroundColor: 'black',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'grid',
                gridTemplateColumns: 'max-content max-content',
                // gap: 4,
                // padding: 8,
                alignItems: 'stretch',
            }}
        >
            {state.items.map((item, idx) =>
                item.label.type === 'replace' ? (
                    <div
                        key={idx}
                        className={
                            'menu-row' +
                            (state.selection === idx ? ' selected' : '')
                        }
                        onMouseDown={(evt) => {
                            evt.preventDefault();
                            item.action();
                            onAction();
                        }}
                        style={{
                            display: 'contents',
                            cursor: 'pointer',
                        }}
                    >
                        <div
                            style={{
                                padding: 8,
                                display: 'flex',
                                alignItems: 'flex-start',
                            }}
                            className="hover"
                        >
                            {item.label.text}
                        </div>
                        <div
                            style={{
                                fontSize: '80%',
                                opacity: 0.5,
                                padding: 8,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            className="hover"
                        >
                            {item.label.ann
                                ? nodeToString(nodeForType(item.label.ann, ctx))
                                : 'no type'}
                        </div>
                    </div>
                ) : (
                    <div
                        key={idx}
                        className={
                            'menu-row' +
                            (state.selection === idx ? ' selected' : '')
                        }
                        onMouseDown={(evt) => {}}
                        style={{
                            gridColumn: '1 2',
                            fontFamily: 'system-ui',
                            padding: 8,
                        }}
                    >
                        {item.label.text}
                    </div>
                ),
            )}
        </div>
    );
};
export type MenuState = {
    // pos: { top: number; left: number };
    items: { label: AutoCompleteResult; action: () => void }[];
    selection: number;
};
export const getMenuState = (
    store: Store,
    ctx: Ctx,
    idx: number,
    text: string,
): MenuState | null => {
    const display = ctx.display[idx];
    if (display?.autoComplete) {
        return {
            items: getMenuItems(display.autoComplete, idx, store),
            selection: 0,
        };
    } else {
        return null;
    }
};

export function getMenuItems(
    autoComplete: AutoCompleteResult[],
    idx: number,
    store: Store,
): { label: AutoCompleteResult; action: () => void }[] {
    return autoComplete.map((item) => ({
        label: item,
        action:
            item.type === 'replace'
                ? () => {
                      // OK here comes the tricky part.
                      // IN OUR CONTEXT (??)
                      // we want .. hmmm
                      // no that's not right.
                      // our CST needs to have the type annotations living within it.
                      // SO any time we "parse" and see a fn arg w/o an annotation, we need to fill it in.
                      // these are, by default, hidden (?) maybe not, maybe it's just "space" skips over them,
                      // but ":" replaces the autocompleted one. Yeah that sounds right.
                      const map: UpdateMap = {
                          [idx]: {
                              ...store.map[idx],
                              node: {
                                  type: 'identifier',
                                  text: '',
                                  hash: item.hash,
                                  loc: { start: -1, end: -1, idx },
                              },
                          },
                      };
                      updateStore(
                          store,
                          {
                              map,
                              selection: {
                                  idx,
                                  loc: item.text.length,
                              },
                          },
                          [],
                      );
                  }
                : () => {},
    }));
}
