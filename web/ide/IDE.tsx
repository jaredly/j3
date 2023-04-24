// The main cheezy

import React, { useEffect, useReducer, useState } from 'react';
import { Env, Sandbox } from '../../src/to-ast/library';
import { prevMap, reduce } from '../custom/reduce';
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
import { UpdateMap } from '../store';
import { NodeExtra, NodeList } from '../../src/types/cst';
import { MNodeList } from '../../src/types/mcst';
import { applyUpdateMap, clearAllChildren } from '../mods/getKeyUpdate';
import { validName, validateExpr } from '../../src/get-type/validate';
import { Error } from '../../src/types/types';
import { getType } from '../../src/get-type/get-types-new';
import { transformExpr } from '../../src/types/walk-ast';
import { makeHash } from './initialData';
import { selectEnd } from '../mods/navigate';
import { addToHashedTree, flatToTree } from '../../src/db/hash-tree';
import { Def, DefType } from '../../src/types/ast';
import { noForm } from '../../src/to-ast/builtins';
import { getCtx } from '../custom/getCtx';

export type IDEState = {
    sandboxes: Sandbox['meta'][];
    current:
        | { type: 'sandbox'; id: string; state: UIState }
        | { type: 'dashboard'; env: Env };
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
            if (state.current.type === 'sandbox') {
                const sstate = state.current.state;
                const top = sstate.map[-1] as MNodeList & NodeExtra;
                const pos = top.values.indexOf(action.loc);
                if (pos === -1) {
                    console.log('bad yank', top, action.loc);
                    return state;
                }

                // Here, we do some validation as well.
                const errors: { [idx: number]: Error[] } = {};
                validateExpr(action.expr, sstate.ctx, errors);
                const ann = getType(action.expr, sstate.ctx, {
                    errors,
                    types: {},
                });

                if (Object.keys(errors).length) {
                    console.error('trying to yank something with errors');
                    return state;
                }
                if (!ann) {
                    console.error('cant get type');
                    return state;
                }

                let bad = false;

                let lloc = 1;
                let locMap: { [old: number]: number } = {};
                const reloced = transformExpr(
                    action.expr,
                    {
                        Loc() {
                            return 0;
                        },
                        Expr(node, ctx) {
                            if (node.type === 'toplevel') {
                                console.error(
                                    `depends on a toplevel cant do it`,
                                );
                                bad = true;
                            }
                            if (node.type === 'local') {
                                if (!locMap[node.sym]) {
                                    console.error(
                                        'no locmap for the local sym',
                                    );
                                    bad = true;
                                }
                                return { ...node, sym: locMap[node.sym] };
                            }
                            return null;
                        },
                        Pattern(node, ctx) {
                            if (node.type === 'local') {
                                locMap[node.sym] = lloc++;
                                return { ...node, sym: locMap[node.sym] };
                            }
                            return null;
                        },
                    },
                    null,
                ) as Def | DefType;
                console.log('reloced', action.expr, reloced);
                const newHash = makeHash(noForm(reloced));

                // TODO if iti's the last one, replace with a blank
                const values = top.values.slice();
                values.splice(pos, 1);
                const update: UpdateMap = {
                    [top.loc]: { ...top, values },
                    ...clearAllChildren([action.loc], sstate.map),
                };

                if (values.length === 0) {
                    values.push(action.loc);
                    update[action.loc] = {
                        type: 'blank',
                        loc: action.loc,
                    };
                }

                // START HERE: add to library,
                // replace refefences
                Object.keys(sstate.map).map((k) => {
                    const node = sstate.map[+k];
                    if (node.type === 'hash' && node.hash === action.loc) {
                        update[+k] = {
                            ...node,
                            hash: newHash,
                        };
                    }
                });

                const prev: UpdateMap = prevMap(sstate.map, update);

                const map = applyUpdateMap(sstate.map, update);
                const ntop = pos < values.length ? values[pos] : values[0];
                const nselect = selectEnd(
                    ntop,
                    [{ idx: -1, at: values.indexOf(ntop), type: 'child' }],
                    map,
                )!;

                const name = action.expr.name;
                if (!validName(name)) {
                    console.error('invalid name sry', name);
                    return state;
                }

                const nnames = { ...sstate.ctx.global.library.namespaces };
                const newRoot = addToHashedTree(
                    nnames,
                    flatToTree({
                        // Add relevant prefix
                        [action.expr.name]: newHash,
                    }),
                    makeHash,
                    {
                        root: sstate.ctx.global.library.root,
                        tree: nnames,
                    },
                );
                const library = {
                    ...sstate.ctx.global.library,
                    namespaces: nnames,
                };
                if (newRoot) {
                    library.root = newRoot;
                    library.history = [
                        {
                            hash: newRoot,
                            date: Date.now() / 1000,
                        },
                    ].concat(library.history);
                }
                library.definitions = { ...library.definitions };
                library.definitions[newHash] =
                    reloced.type === 'def'
                        ? {
                              type: 'term',
                              value: reloced.value,
                              ann,
                              originalName: reloced.name,
                          }
                        : {
                              type: 'type',
                              value: reloced.value,
                              originalName: reloced.name,
                          };

                // console.log(
                //     'all kinds of changes',
                //     newRoot,
                //     newHash,
                //     update,
                //     library,
                // );

                return {
                    ...state,
                    current: {
                        ...state.current,
                        state: {
                            ...sstate,
                            map,
                            history: sstate.history.concat([
                                {
                                    map: update,
                                    prev,
                                    at: [{ start: nselect }],
                                    prevAt: sstate.at,
                                    id:
                                        sstate.history[
                                            sstate.history.length - 1
                                        ].id + 1,
                                    ts: Date.now() / 1000,
                                },
                            ]),
                            at: [{ start: nselect }],
                            ctx: getCtx(map, -1, {
                                ...sstate.ctx.global,
                                library,
                            }).ctx,
                        },
                    },
                };
            }
            return state;
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
            <Namespaces env={env} />
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
