// The main cheezy

import React, { useEffect, useReducer, useState } from 'react';
import { Env, Sandbox } from '../../src/to-ast/library';
import { reduce } from '../custom/reduce';
import { uiState } from '../custom/ByHand';
import { Action, UIState } from '../custom/UIState';
import { Namespaces } from './Namespaces';
import {
    addSandbox,
    deleteSandbox,
    getSandbox,
    getSandboxes,
    updateSandboxMeta,
} from '../../src/db/sandbox';
import { Db, dropTable } from '../../src/db/tables';
import { usePersistStateChanges } from './usePersistStateChanges';
import { sandboxState, SandboxView } from './SandboxView';
import { NodeList } from '../../src/types/cst';
import { yankFromSandboxToLibrary } from './yankFromSandboxToLibrary';
import { useMenu } from './useMenu';
import { Dashboard } from './Dashboard';
import { IconHome } from '../fonts/Icons';

export type SelectedSandbox = {
    type: 'sandbox';
    id: string;
    state: UIState;
};

export type IDEState = {
    sandboxes: Sandbox['meta'][];
    current: SelectedSandbox | { type: 'dashboard'; env: Env };
};

export type IDEAction =
    | Action
    | { type: 'new-sandbox'; meta: Sandbox['meta'] }
    | { type: 'update-sandbox'; meta: Sandbox['meta'] }
    | { type: 'delete-sandbox'; id: string }
    | { type: 'open-sandbox'; sandbox: Sandbox }
    | { type: 'dashboard'; sandboxes: Sandbox['meta'][] };

const topReduce = (state: IDEState, action: IDEAction): IDEState => {
    console.log(`Reducing`, action);
    switch (action.type) {
        case 'dashboard':
            return {
                ...state,
                current: {
                    type: 'dashboard',
                    env:
                        state.current.type === 'sandbox'
                            ? state.current.state.ctx.global
                            : state.current.env,
                },
                sandboxes: action.sandboxes,
            };
        case 'update-sandbox':
            return {
                ...state,
                sandboxes: state.sandboxes.map((s) =>
                    s.id === action.meta.id ? action.meta : s,
                ),
            };
        case 'delete-sandbox':
            return {
                ...state,
                sandboxes: state.sandboxes.filter((s) => s.id !== action.id),
                current:
                    state.current.type === 'sandbox' &&
                    state.current.id === action.id
                        ? {
                              type: 'dashboard',
                              env: state.current.state.ctx.global,
                          }
                        : state.current,
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
        } else {
            location.hash = '';
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
                        <Dashboard
                            db={initial.db}
                            initial={state.sandboxes}
                            dispatch={dispatch}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const isParentOf = (parent: HTMLElement, child: HTMLElement) => {
    if (child === parent) {
        return true;
    }
    while (child.parentElement && child.parentElement !== document.body) {
        child = child.parentElement;
        if (child === parent) {
            return true;
        }
    }
    return false;
};

const TabTitle = ({
    meta,
    db,
    dispatch,
    state,
}: {
    meta: Sandbox['meta'];
    db: Db;
    dispatch: React.Dispatch<IDEAction>;
    state: IDEState;
}) => {
    const [edit, setEdit] = useState(null as null | string);
    const [menu, toggleMenu] = useMenu([
        { title: 'Edit Title', action: () => setEdit(meta.title) },
        {
            title: 'Download as JSON',
            action() {
                if (state.current.type !== 'sandbox') {
                    return;
                }
                const { map, history, ctx } = state.current.state;
                // const env =
                // state.current.state.
                const data = JSON.stringify({ meta, map, history }, null, 2);
                const url = URL.createObjectURL(
                    new Blob([data], { type: 'application/json' }),
                );
                const a = document.createElement('a');
                a.href = url;
                a.download = `${meta.title} - ${meta.id}.json`;
                a.click();
            },
        },
        {
            title: 'Delete Sandbox',
            async action() {
                if (state.current.type !== 'sandbox') {
                    return;
                }
                if (confirm('Really delete sandbox?')) {
                    await deleteSandbox(db, state.current.id);
                    dispatch({ type: 'delete-sandbox', id: state.current.id });
                }
            },
        },
    ]);
    if (edit != null) {
        return (
            <div>
                <input
                    value={edit}
                    onChange={(evt) => setEdit(evt.target.value)}
                    style={{ width: 100 }}
                />
                <button
                    onClick={() => {
                        const newMeta = { ...meta, title: edit };
                        db.transact(() => updateSandboxMeta(db, newMeta)).then(
                            () => {
                                setEdit(null);
                                dispatch({
                                    type: 'update-sandbox',
                                    meta: newMeta,
                                });
                            },
                        );
                    }}
                >
                    Ok
                </button>
                <button onClick={() => setEdit(null)}>Cancel</button>
            </div>
        );
    }
    return (
        <div
            style={{
                position: 'relative',
                backgroundColor: '#000',
                padding: '4px 8px',
                borderRadius: 3,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {meta.title}
            <button
                onMouseDown={() => toggleMenu()}
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                }}
            >
                v
            </button>
            {menu}
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
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: '#222',
                // padding: '8px',
                // paddingBottom: 0,
                fontSize: '.8em',
            }}
            onMouseMoveCapture={(evt) => {
                evt.stopPropagation();
            }}
            // onMouseDownCapture={(evt) => {
            //     evt.stopPropagation();
            // }}
            onClick={(evt) => {
                evt.stopPropagation();
            }}
        >
            <div
                onClick={() => {
                    getSandboxes(db).then((sandboxes) =>
                        dispatch({ type: 'dashboard', sandboxes }),
                    );
                }}
                style={{ cursor: 'pointer', padding: 4, fontSize: 16 }}
            >
                <IconHome />
            </div>
            {state.sandboxes.map((k) =>
                state.current.type === 'sandbox' &&
                state.current.id === k.id ? (
                    <TabTitle
                        key={k.id}
                        meta={k}
                        db={db}
                        dispatch={dispatch}
                        state={state}
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
                            padding: '4px 8px',
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            whiteSpace: 'nowrap',
                        }}
                        onClick={() => {
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
