import React from 'react';
import { Db } from '../../src/db/tables';
import { getCtx } from '../../src/getCtx';
import { selectEnd } from '../../src/state/navigate';
import { Env, Sandbox } from '../../src/to-ast/library';
import { ListLikeContents } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { useMenu } from '../custom/ByHand';
import { Cursors } from '../custom/Cursors';
import { HiddenInput } from '../custom/HiddenInput';
import { Menu } from '../custom/Menu';
import { Root } from '../custom/old-stuff/Root';
import { UIState } from '../custom/UIState';
import { IDEAction } from './IDE';
import { nilt } from '../../src/to-ast/builtins';
import { getType } from '../../src/get-type/get-types-new';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { errorToString } from '../../src/to-cst/show-errors';

export const SandboxView = ({
    state,
    dispatch,
}: {
    state: UIState;
    dispatch: React.Dispatch<IDEAction>;
}) => {
    const [debug, setDebug] = useLocalStorage('j3-debug', () => false);
    const tops = (state.map[state.root] as ListLikeContents).values;
    const menu = useMenu(state);

    return (
        <div
            style={{ paddingBottom: 500, position: 'relative' }}
            onMouseEnter={(evt) => {
                dispatch({ type: 'hover', path: [] });
            }}
        >
            <HiddenInput
                hashNames={state.ctx.results.hashNames}
                state={state}
                dispatch={dispatch}
                menu={!state.menu?.dismissed ? menu : undefined}
            />
            <button
                onClick={() => setDebug(!debug)}
                style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                }}
            >
                {debug ? 'Debug on' : 'Debug off'}
            </button>
            <Root
                state={state}
                dispatch={dispatch}
                tops={tops}
                debug={debug}
                results={state.ctx.results}
                showTop={(top) => {
                    const got = state.ctx.results.toplevel[top];
                    const tt = got
                        ? got.type === 'def'
                            ? got.ann ?? nilt
                            : got.type === 'deftype'
                            ? got.value
                            : getType(got, state.ctx)
                        : null;
                    if (tt) {
                        return nodeToString(
                            nodeForType(tt, state.ctx.results.hashNames),
                            state.ctx.results.hashNames,
                        );
                    }
                    return 'no type';
                }}
            />
            <Cursors at={state.at} regs={state.regs} />
            {/* <Hover
                state={state}
                dispatch={dispatch}
                calc={() =>
                    calc(state, state.ctx.results, (err) =>
                        errorToString(err, state.ctx),
                    )
                }
            /> */}
            {!state.menu?.dismissed && menu?.items.length ? (
                <Menu state={state} menu={menu} dispatch={dispatch} />
            ) : null}
        </div>
    );
};

export function sandboxState(sandbox: Sandbox, env: Env): UIState {
    let idx = Object.keys(sandbox.map).reduce((a, b) => Math.max(a, +b), 0) + 1;
    const { ctx, map } = getCtx(sandbox.map, -1, () => idx++, env);
    if (map !== sandbox.map) {
        throw new Error(`map change on load?`);
    }
    return {
        map: sandbox.map,
        meta: {},
        nsMap: {},
        cards: [
            // {
            //     path: [],
            //     ns: {
            //         type: 'normal',
            //         children: [],
            //         top: idx,
            //     },
            // },
        ],
        root: sandbox.root,
        history: sandbox.history,
        at: sandbox.history.length
            ? sandbox.history[sandbox.history.length - 1].at
            : [
                  {
                      start:
                          selectEnd(
                              (sandbox.map[-1] as { values: number[] })
                                  .values[0],
                              [
                                  {
                                      idx: -1,
                                      type: 'card',
                                      card: 0,
                                  },
                              ],
                              sandbox.map,
                          ) ?? [],
                  },
              ],
        nidx: () => idx++,
        ctx,
        clipboard: [],
        hover: [],
        regs: {},
    };
}
