import * as React from 'react';
import { parse, setIdx } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef } from '../src/to-ast/to-ast';
import { Ctx, newCtx, noForm } from '../src/to-ast/Ctx';
import { Node } from './Nodes';
import { EvalCtx, initialStore, newEvalCtx, Store } from './store';
import { compile } from './compile';
import { nodeToString } from '../src/to-cst/nodeToString';
import { makeRCtx } from '../src/to-cst/nodeForExpr';
import { nodeForType } from '../src/to-cst/nodeForType';
import { Node as NodeT } from '../src/types/cst';
import { errorToString } from '../src/to-cst/show-errors';
import localforage from 'localforage';
import { Type } from '../src/types/ast';
import { applyAndResolve } from '../src/get-type/matchesType';
import { Doc } from './Doc';

const _init = `
(one two )
`;

const init = `
(def hello 10)
(== hello 10)
(== what 20)
(switch 10 5 23 20 30)
`;

const __init = `(== 5 (+ 2 3))
(== 5 5)

; let's get this going

; (empties [] one () two {} hello folks)

(fn [v :int] (+ v 1))
(def hello 10)
(== hello 10)
(==
	(let [(, x y) (if (< 1 2) (, 2 3) (, 3 4))]
		(+ x y)
	)
	5
)
('Hello 10)
('What)
'Yea
3
(let [('Ok x) ('Ok 20)] (+ x 23))

(defn add2 [x :int] (+ x 2))
(== (add2 23) 25)

(def ok {23 100 yes 34})
(def yes (let [{yes} {yes 34}] yes))
(== yes 34)`;

export const useLocalStorage = <T,>(key: string, initial: () => T) => {
    const [state, setState] = React.useState<T>(
        localStorage[key] ? JSON.parse(localStorage[key]) : initial(),
    );
    React.useEffect(() => {
        if (state) {
            localStorage[key] = JSON.stringify(state);
        }
    }, [state]);
    return [state, setState] as const;
};

export const getInitialState = () => {
    const cst: NodeT[] = parse(init);
    let ctx = newCtx();
    const exprs = cst.map((node) => {
        const res = nodeToExpr(node, ctx);
        ctx = addDef(res, ctx);
        return res;
    });
    return { exprs, ctx };
};

export const debounce = () => {};

const useHash = () => {
    const [hash, setHash] = React.useState(location.hash.slice(1));
    React.useEffect(() => {
        window.addEventListener('hashchange', () => {
            setHash(location.hash.slice(1));
        });
    }, []);
    return hash;
};

export function updateIdxForStore(value: Store) {
    let mx = Object.keys(value.map).reduce(
        (mx, k) => Math.max(mx, parseInt(k)),
        0,
    );
    setIdx(mx + 1);
}

const filePrefix = 'j3:file:';

export const useFiles = () => {
    const [files, setFiles] = React.useState([] as string[]);

    React.useEffect(() => {
        localforage.keys().then((keys) => {
            setFiles(keys.filter((k) => k.startsWith(filePrefix)));
        });
    }, []);

    const addFile = React.useCallback(() => {
        const name = filePrefix + Math.random().toString(36).slice(2);
        setFiles((files) => [...files, name]);
    }, []);

    return { files, addFile };
};

export const App = () => {
    const hash = useHash();

    const { files, addFile } = useFiles();

    const [state, setState] = React.useState(
        null as null | {
            ctx: EvalCtx;
            store: Store;
            id: string;
        },
    );

    React.useEffect(() => {
        if (!hash || !hash.startsWith(filePrefix)) {
            setState(null);
            return;
        }
        localforage.getItem(hash).then((value) => {
            const ctx = newEvalCtx(newCtx());
            if (!value) {
                setIdx(0);
                const store = initialStore(parse(`; A new file for you`));
                compile(store, ctx);
                setState({
                    id: hash,
                    store,
                    ctx,
                });
                return;
            }

            updateIdxForStore(value as Store);
            compile(value as Store, ctx);
            setState({
                store: value as Store,
                id: hash,
                ctx,
            });
        });
    }, [hash]);

    React.useEffect(() => {
        if (!state) {
            return;
        }
        const { store, id, ctx } = state;
        store.listeners[':change'] = [
            () => {
                compile(store, ctx);
                localforage.setItem(id, { ...store, listeners: {} });
            },
        ];
    }, [state]);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <button
                    style={{ cursor: 'pointer', margin: 4 }}
                    onClick={() => addFile()}
                >
                    Add File
                </button>
                {files.map((name) => (
                    <div
                        key={name}
                        onClick={() => {
                            location.hash = name;
                        }}
                        style={{
                            backgroundColor: hash === name ? '#555' : undefined,
                            cursor: 'pointer',
                            padding: 4,
                            margin: 4,
                        }}
                        className="hover"
                    >
                        {name}
                    </div>
                ))}
            </div>
            {state ? (
                <Doc store={state.store} ctx={state.ctx} />
            ) : (
                'No file selected'
            )}
        </div>
    );
};
