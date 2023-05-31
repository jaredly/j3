import React from 'react';
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
    meta,
    state,
    dispatch,
}: {
    // env: Env;
    // sandbox: Sandbox;
    meta: Sandbox['meta'];
    state: UIState;
    dispatch: React.Dispatch<Action>;
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
            <div style={{ padding: 16 }}>
                Namespace: {meta.settings.namespace.join('/')}
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
