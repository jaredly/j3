// The main cheezy

import React, { useReducer } from 'react';
import { Env, Library, Sandbox } from '../../src/to-ast/library';
import { reduce } from '../custom/reduce';
import { Action, UIState, uiState, useMenu } from '../custom/ByHand';
import { HiddenInput } from '../custom/HiddenInput';
import { ListLikeContents } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { Cursors } from '../custom/Cursors';
import { Root } from '../custom/Root';
import { Hover } from '../custom/Hover';
import { Menu } from '../custom/Menu';
import { Namespaces } from './Namespaces';
import { addSandbox, getSandbox } from '../../src/db/sandbox';
import { Db } from '../../src/db/tables';
import { selectEnd } from '../mods/navigate';
import { UpdateMap } from '../store';

// type SandboxState = {
//     id: string;
//     history: HistoryItem;
//     regs: RegMap;
//     hover: Path[];
//     latestResults: CompilationResults;
// } & State;

// const st : UIState = {}

// type IDEState = {
//     builtins: Builtins;
//     library: Library;
//     sandboxes: { [id: string]: Sandbox['meta'] };
//     // One active sandbox at a time is fine
//     sandbox?: SandboxState;
//     clipboard: ClipboardItem[][];
// };

// export const reduce = (state: IDEState, action: Action): IDEState => {
//     return state;
// };

// const getInitialState = (v: null): IDEState => {
//     return {
//         ...newEnv(),
//         sandboxes: {},
//         clipboard: [],
//     };
// };

export const SandboxView = ({
    // env,
    // sandbox,
    state,
    dispatch,
}: {
    // env: Env;
    // sandbox: Sandbox;
    state: UIState;
    dispatch: React.Dispatch<Action>;
}) => {
    const [debug, setDebug] = useLocalStorage('j3-debug', () => false);
    const tops = (state.map[state.root] as ListLikeContents).values;
    const menu = useMenu(state);

    return (
        <div
            style={{ paddingBottom: 500 }}
            onMouseEnter={(evt) => {
                dispatch({ type: 'hover', path: [] });
            }}
        >
            <HiddenInput
                ctx={state.ctx}
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
                ctx={state.ctx}
            />
            <Cursors state={state} />
            <Hover state={state} dispatch={dispatch} />
            {!state.menu?.dismissed && menu?.items.length ? (
                <Menu state={state} menu={menu} dispatch={dispatch} />
            ) : null}
        </div>
    );
};

export function sandboxState(sandbox: Sandbox, env: Env): UIState {
    let idx = Object.keys(sandbox.map).reduce((a, b) => Math.max(a, +b), 0) + 1;
    return {
        map: sandbox.map,
        root: sandbox.root,
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
                                      at: 0,
                                      type: 'child',
                                  },
                              ],
                              sandbox.map,
                          ) ?? [],
                  },
              ],
        nidx: () => idx++,
        ctx: {
            global: env,
            results: {
                display: {},
                errors: {},
                hashNames: {},
                localMap: { terms: {}, types: {} },
                mods: {},
                toplevel: {},
            },
        },
        clipboard: [],
        hover: [],
        regs: {},
    };
}

type DBUpdate =
    | {
          type: 'sandbox-nodes';
          map: UpdateMap;
      }
    | {
          type: 'sandbox-history';
          history: Sandbox['history'];
      }
    | {
          type: 'names';
          namespaces: Library['namespaces'];
          root: { hash: string; date: number };
      }
    | {
          type: 'definitions';
          definitions: Library['definitions'];
      };

type IDEState = {
    sandboxes: Sandbox['meta'][];
    updates: DBUpdate[];
    current:
        | {
              type: 'sandbox';
              id: string;
              state: UIState;
          }
        | {
              type: 'dashboard';
              env: Env;
          };
};

type IDEAction =
    | Action
    | {
          type: 'new-sandbox';
          meta: Sandbox['meta'];
      }
    | {
          type: 'open-sandbox';
          sandbox: Sandbox;
      };

const topReduce = (state: IDEState, action: IDEAction): IDEState => {
    switch (action.type) {
        case 'new-sandbox':
            return {
                ...state,
                sandboxes: state.sandboxes.concat([action.meta]),
            };
        case 'open-sandbox': {
            const meta = state.sandboxes.find(
                (s) => s.id === action.sandbox.meta.id,
            );
            if (!meta) {
                return state;
            }
            return {
                ...state,
                current: {
                    type: 'sandbox',
                    id: action.sandbox.meta.id,
                    state: sandboxState(
                        action.sandbox,
                        state.current.type === 'dashboard'
                            ? state.current.env
                            : state.current.state.ctx.global,
                    ),
                },
            };
        }
        default:
            if (state.current.type === 'sandbox') {
                return {
                    ...state,
                    current: {
                        ...state.current,
                        state: reduce(state.current.state, action),
                    },
                };
            }
    }
    return state;
};

// We can expect to be wrapped in an error boundary
export const IDE = ({
    initial,
}: {
    initial: { env: Env; sandboxes: Sandbox['meta'][]; db: Db };
}) => {
    const [state, dispatch] = useReducer(
        topReduce,
        null,
        (): IDEState => ({
            updates: [],
            sandboxes: initial.sandboxes,
            current: { type: 'dashboard', env: initial.env },
        }),
    );

    return (
        <div
            style={{
                padding: 24,
                height: '100vh',
                overflow: 'auto',
                display: 'flex',
            }}
        >
            <Namespaces env={initial.env} />
            {/** Here we do the magic. of .. having an editor.
             * for sandboxes. */}
            <div>
                <div style={{}}>
                    Sandboxes:
                    {initial.sandboxes.map((k) => (
                        <button
                            key={k.id}
                            disabled={
                                state.current.type === 'sandbox' &&
                                state.current.id === k.id
                            }
                            onClick={() => {
                                getSandbox(initial.db, k).then((sandbox) => {
                                    dispatch({ type: 'open-sandbox', sandbox });
                                });
                            }}
                        >
                            {k.title}
                        </button>
                    ))}
                    <button
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            // ok
                            addSandbox(
                                initial.db,
                                Math.random().toString(36).slice(2),
                                'Untitled sandbox',
                            ).then((sandbox) => {
                                dispatch({
                                    type: 'new-sandbox',
                                    meta: sandbox.meta,
                                });
                            });
                        }}
                    >
                        +
                    </button>
                </div>
                {state.current.type === 'sandbox' ? (
                    <SandboxView
                        state={state.current.state}
                        dispatch={dispatch}
                    />
                ) : (
                    'Dasnboard'
                )}
            </div>
        </div>
    );
};
