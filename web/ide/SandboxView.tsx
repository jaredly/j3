import React, { useState } from 'react';
import { Env, Sandbox } from '../../src/to-ast/library';
import { useMenu } from '../custom/ByHand';
import { Action, UIState } from '../custom/UIState';
import { HiddenInput } from '../custom/HiddenInput';
import { ListLikeContents } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { Cursors } from '../custom/Cursors';
import { Root } from '../custom/Root';
import { Hover } from '../custom/Hover';
import { Menu } from '../custom/Menu';
import { selectEnd } from '../../src/state/navigate';
import { getCtx } from '../../src/getCtx';
import {
    IconButton,
    IconBxCheck,
    IconBxsPencil,
    IconCancel,
} from '../fonts/Icons';
import { css } from '@linaria/core';
import { IDEAction } from './IDE';
import { updateSandboxMeta } from '../../src/db/sandbox';
import { Db } from '../../src/db/tables';

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
    db,
    meta,
    state,
    dispatch,
}: {
    db: Db;
    // env: Env;
    // sandbox: Sandbox;
    meta: Sandbox['meta'];
    state: UIState;
    dispatch: React.Dispatch<IDEAction>;
}) => {
    const [debug, setDebug] = useLocalStorage('j3-debug', () => false);
    const tops = (state.map[state.root] as ListLikeContents).values;
    const menu = useMenu(state);
    const [editNS, setEditNS] = useState(null as null | string);

    return (
        <div
            style={{ paddingBottom: 500, position: 'relative' }}
            onMouseEnter={(evt) => {
                dispatch({ type: 'hover', path: [] });
            }}
        >
            <div style={{ padding: 16, display: 'flex', alignItems: 'center' }}>
                Namespace:{' '}
                {editNS != null ? (
                    <>
                        <input
                            value={editNS}
                            onChange={(evt) => setEditNS(evt.target.value)}
                            className={css`
                                width: 200px;
                                margin-right: 8px;
                                font-size: inherit;
                                font-family: inherit;
                                background-color: transparent;
                                color: inherit;
                                border: 0.5px solid #444;
                            `}
                        />
                        <IconButton
                            onClick={() => {
                                updateSandboxMeta(db, meta.id, {
                                    settings: {
                                        ...meta.settings,
                                        namespace: editNS.split('/'),
                                    },
                                }).then(() => {
                                    dispatch({
                                        type: 'update-sandbox',
                                        meta: {
                                            ...meta,
                                            settings: {
                                                ...meta.settings,
                                                namespace: editNS.split('/'),
                                            },
                                        },
                                    });
                                    setEditNS(null);
                                });
                            }}
                        >
                            <IconBxCheck />
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setEditNS(null);
                            }}
                        >
                            <IconCancel />
                        </IconButton>
                    </>
                ) : (
                    <>
                        {meta.settings.namespace.join('/')}
                        <span style={{ width: 8 }} />
                        <IconButton
                            onClick={() => {
                                setEditNS(meta.settings.namespace.join('/'));
                            }}
                        >
                            <IconBxsPencil />
                        </IconButton>
                    </>
                )}
            </div>
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
    const { ctx, map } = getCtx(sandbox.map, -1, () => idx++, env);
    if (map !== sandbox.map) {
        throw new Error(`map change on load?`);
    }
    return {
        map: sandbox.map,
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
                                      at: 0,
                                      type: 'child',
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
