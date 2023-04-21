// The main cheezy

import { useReducer, useState } from 'react';
import { Builtins, Env } from '../../src/to-ast/library';
import { HistoryItem } from '../../src/to-ast/library';
import { Sandbox } from '../../src/to-ast/library';
import { CompilationResults } from '../../src/to-ast/library';
import { Library } from '../../src/to-ast/library';
import { Map } from '../../src/types/mcst';
import { RegMap, UIState } from '../custom/ByHand';
import { Cursor, State } from '../mods/getKeyUpdate';
import { Path } from '../mods/path';
import { newEnv } from '../../src/to-ast/Ctx';
import React from 'react';
import { HashedTree } from '../../src/db/hash-tree';

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

type Action = [];

const buttonStyle = {
    fontSize: '80%',
    borderRadius: 4,
    padding: '0px 4px',
    display: 'inline-block',
    backgroundColor: '#444',
};
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
            <div>
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
                />{' '}
                {name}
            </div>
        );
    }

    return (
        <div>
            <div
                onMouseDown={() => setOpen(!open)}
                style={{ cursor: 'pointer' }}
            >
                <span
                    style={{
                        width: '2em',
                        display: 'inline-block',
                        textAlign: 'right',
                        marginRight: 4,
                    }}
                >
                    {keys.length}
                </span>
                <Button
                    builtins={builtins}
                    top={top}
                    definitions={definitions}
                />{' '}
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
        <div style={{ padding: 24, height: '100vh', overflow: 'auto' }}>
            <NSTree
                root={root}
                level={0}
                name={''}
                builtins={env.builtins}
                namespaces={env.library.namespaces}
                definitions={env.library.definitions}
            />
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
