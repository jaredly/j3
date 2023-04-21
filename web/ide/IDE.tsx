// The main cheezy

import { useReducer } from 'react';
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

export const NSTree = ({
    root,
    namespaces,
}: {
    root: string;
    namespaces: HashedTree;
}) => {
    return (
        <div>
            {Object.keys(namespaces[root])
                .sort()
                .map((name) =>
                    name === '' ? null : (
                        <div key={name}>
                            {name}
                            <div style={{ marginLeft: 20 }}>
                                <NSTree
                                    root={namespaces[root][name]}
                                    namespaces={namespaces}
                                />
                            </div>
                        </div>
                    ),
                )}
        </div>
    );
};

export const Namespaces = ({ env }: { env: Env }) => {
    const root = env.library.root;
    return (
        <div style={{ padding: 24, height: '100vh', overflow: 'auto' }}>
            <NSTree root={root} namespaces={env.library.namespaces} />
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
