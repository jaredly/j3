// The main cheezy

import React, { useEffect, useReducer, useState } from 'react';
import { Env, Sandbox } from '../../src/to-ast/library';
import { reduce } from '../custom/reduce';
import { uiState } from '../custom/ByHand';
import { Action, UIState } from '../custom/UIState';
import { Namespaces } from './Namespaces';
import {
    addSandbox,
    getSandbox,
    transact,
    updateSandboxMeta,
} from '../../src/db/sandbox';
import { Db } from '../../src/db/tables';
import { usePersistStateChanges } from './usePersistStateChanges';
import { sandboxState, SandboxView } from './SandboxView';
import { NodeList } from '../../src/types/cst';
import { yankFromSandboxToLibrary } from './yankFromSandboxToLibrary';

export type SelectedSandbox = {
    type: 'sandbox';
    id: string;
    state: UIState;
};

export type IDEState = {
    sandboxes: Sandbox['meta'][];
    current: SelectedSandbox | { type: 'dashboard'; env: Env };
};

type IDEAction =
    | Action
    | { type: 'new-sandbox'; meta: Sandbox['meta'] }
    | { type: 'update-sandbox'; meta: Sandbox['meta'] }
    | { type: 'open-sandbox'; sandbox: Sandbox };

const topReduce = (state: IDEState, action: IDEAction): IDEState => {
    switch (action.type) {
        case 'update-sandbox':
            return {
                ...state,
                sandboxes: state.sandboxes.map((s) =>
                    s.id === action.meta.id ? action.meta : s,
                ),
            };
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
        case 'yank': {
            return yankFromSandboxToLibrary(state, action);
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
    initial: {
        env: Env;
        sandboxes: Sandbox['meta'][];
        db: Db;
        sandbox: Sandbox | null;
    };
}) => {
    const [state, dispatch] = useReducer(
        topReduce,
        null,
        (): IDEState => ({
            sandboxes: initial.sandboxes,
            current: initial.sandbox
                ? {
                      type: 'sandbox',
                      id: initial.sandbox.meta.id,
                      state: sandboxState(initial.sandbox, initial.env),
                  }
                : { type: 'dashboard', env: initial.env },
        }),
    );

    // @ts-ignore
    window.state = state;

    useEffect(() => {
        if (state.current.type === 'sandbox') {
            location.hash = '#' + state.current.id;
        }
    }, [state.current.type === 'sandbox' ? state.current.id : null]);

    usePersistStateChanges(initial.db, state);

    const env =
        state.current.type === 'sandbox'
            ? state.current.state.ctx.global
            : state.current.env;

    return (
        <div
            style={{
                padding: 24,
                height: '100vh',
                width: '100vw',
                overflow: 'auto',
                display: 'flex',
            }}
        >
            <Namespaces env={env} sandboxes={state.sandboxes} />
            {/** Here we do the magic. of .. having an editor.
             * for sandboxes. */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <SandboxTabs
                    db={initial.db}
                    state={state}
                    dispatch={dispatch}
                />
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {state.current.type === 'sandbox' ? (
                        <SandboxView
                            key={state.current.id}
                            state={state.current.state}
                            meta={
                                state.sandboxes.find(
                                    (s) =>
                                        s.id ===
                                        (state.current as SelectedSandbox).id,
                                )!
                            }
                            dispatch={dispatch}
                        />
                    ) : (
                        'Dasnboard'
                    )}
                </div>
            </div>
        </div>
    );
};

function SandboxTabs({
    db,
    state,
    dispatch,
}: {
    db: Db;
    state: IDEState;
    dispatch: React.Dispatch<IDEAction>;
}) {
    const [edit, setEdit] = useState(null as null | string);

    return (
        <div
            style={{}}
            onMouseMoveCapture={(evt) => {
                evt.stopPropagation();
            }}
            onMouseDownCapture={(evt) => {
                evt.stopPropagation();
            }}
            onClick={(evt) => {
                evt.stopPropagation();
            }}
        >
            Sandboxes:
            {state.sandboxes.map((k) =>
                state.current.type === 'sandbox' &&
                state.current.id === k.id ? (
                    <input
                        key={k.id}
                        value={edit ?? k.title}
                        onChange={(evt) => setEdit(evt.target.value)}
                        onBlur={() => {
                            //
                            const meta = { ...k, title: edit ?? k.title };
                            transact(db, () =>
                                updateSandboxMeta(db, meta),
                            ).then(() => {
                                dispatch({ type: 'update-sandbox', meta });
                            });
                        }}
                        style={
                            {
                                // background: 'red',
                                // color: 'white',
                                // border: 'none',
                            }
                        }
                    />
                ) : (
                    <button
                        key={k.id}
                        disabled={
                            state.current.type === 'sandbox' &&
                            state.current.id === k.id
                        }
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            margin: '0 4px',
                        }}
                        onClick={() => {
                            console.log('getting', k);
                            getSandbox(db, k).then((sandbox) => {
                                dispatch({ type: 'open-sandbox', sandbox });
                            });
                        }}
                    >
                        {k.title}
                    </button>
                ),
            )}
            <button
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    addSandbox(
                        db,
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
    );
}
