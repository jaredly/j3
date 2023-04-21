// The main cheezy

import React from 'react';
import { useState } from 'react';
import { Builtins, Env, Sandbox } from '../../src/to-ast/library';
import { Library } from '../../src/to-ast/library';
import { HashedTree } from '../../src/db/hash-tree';
import { reduce } from '../custom/reduce';
import { UIState, uiState, useMenu } from '../custom/ByHand';
import { HiddenInput } from '../custom/HiddenInput';
import { ListLikeContents } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { Cursors } from '../custom/Cursors';
import { Root } from '../custom/Root';
import { Hover } from '../custom/Hover';
import { Menu } from '../custom/Menu';

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

const buttonStyle = {
    fontSize: '80%',
    borderRadius: 4,
    padding: '0px 4px',
    display: 'inline-block',
    backgroundColor: '#444',
};

export const Button = ({
    top,
    definitions,
    builtins,
}: {
    top: string;
    definitions: Library['definitions'];
    builtins: Builtins;
}) => {
    if (!top) {
        return null;
    }
    if (top.startsWith(':builtin:')) {
        const hash = top.slice(':builtin:'.length);
        return (
            <span style={buttonStyle}>
                {builtins[hash]?.type === 'type' ? 'T' : 'e'}
            </span>
        );
    }
    const defn = definitions[top];
    if (defn.type === 'term') {
        return <span style={buttonStyle}>e</span>;
    }
    if (defn.type === 'type') {
        return <span style={buttonStyle}>T</span>;
    }
    return <span style={buttonStyle}>unknown</span>;
};

export const NSTree = ({
    root,
    name,
    level,
    builtins,
    namespaces,
    definitions,
}: {
    root: string;
    name: string;
    level: number;
    builtins: Builtins;
    namespaces: HashedTree;
    definitions: Library['definitions'];
}) => {
    const [open, setOpen] = useState(false);
    const canBeOpen = level === 0 || open;

    const top = namespaces[root][''];
    const keys = Object.keys(namespaces[root]).sort();

    if (keys.length === 1 && keys[0] === '') {
        return (
            <div className="menu-hover" style={{ cursor: 'pointer' }}>
                <span
                    style={{
                        width: '2em',
                        display: 'inline-block',
                        textAlign: 'right',
                        marginRight: 4,
                    }}
                ></span>
                <Button
                    builtins={builtins}
                    top={top}
                    definitions={definitions}
                />
                <span style={{ display: 'inline-block', width: 4 }} />
                {name}
            </div>
        );
    }

    return (
        <div>
            <div
                onMouseDown={() => setOpen(!open)}
                style={{ cursor: 'pointer' }}
                className="menu-hover"
            >
                <span
                    style={{
                        width: '2em',
                        display: 'inline-block',
                        textAlign: 'right',
                        marginRight: 4,
                    }}
                >
                    {keys.length - (top ? 1 : 0)}
                </span>
                <Button
                    builtins={builtins}
                    top={top}
                    definitions={definitions}
                />
                <span style={{ display: 'inline-block', width: 4 }} />
                {name}/
            </div>

            {canBeOpen &&
                keys
                    .filter((k) => k !== '')
                    .map((name) => {
                        const hash = namespaces[root][name];
                        return (
                            <div key={name}>
                                <div style={{ marginLeft: 20 }}>
                                    <NSTree
                                        root={hash}
                                        name={name}
                                        level={level + 1}
                                        builtins={builtins}
                                        namespaces={namespaces}
                                        definitions={definitions}
                                    />
                                </div>
                            </div>
                        );
                    })}
        </div>
    );
};

export const Namespaces = ({ env }: { env: Env }) => {
    const root = env.library.root;
    return (
        <div
            style={{
                padding: 24,
                height: '100vh',
                overflow: 'auto',
                display: 'flex',
            }}
        >
            <div style={{ width: 300 }}>
                <NSTree
                    root={root}
                    level={0}
                    name={''}
                    builtins={env.builtins}
                    namespaces={env.library.namespaces}
                    definitions={env.library.definitions}
                />
            </div>
        </div>
    );
};

export const SandboxView = ({
    env,
    sandbox,
}: {
    env: Env;
    sandbox: Sandbox;
}) => {
    const [state, dispatch] = React.useReducer(reduce, null, (): UIState => {
        let idx =
            Object.keys(sandbox.map).reduce((a, b) => Math.max(a, +b), 0) + 1;
        return uiState({
            map: sandbox.map,
            root: sandbox.root,
            at: sandbox.history.length
                ? sandbox.history[sandbox.history.length - 1].at
                : [],
            nidx: () => idx++,
        });
    });

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

// We can expect to be wrapped in an error boundary
export const IDE = ({
    initial,
}: {
    initial: { env: Env; sandboxes: Sandbox['meta'][] };
}) => {
    // const [state, dispatch] = useReducer(reduce, null, getInitialState);
    // We'll want ... like ... something ...
    // yeah typical dispatch / state / reduce / deal
    return (
        <div>
            <Namespaces env={initial.env} />
            {/** Here we do the magic. of .. having an editor.
             * for sandboxes.
             */}
        </div>
    );
};
