import * as React from 'react';
import { parse, setIdx } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef } from '../src/to-ast/to-ast';
import { Ctx, newCtx, noForm } from '../src/to-ast/Ctx';
import {
    EvalCtx,
    initialStore,
    migrateStore,
    newEvalCtx,
    Store,
} from './store';
import { compile } from './compile';
import { nodeToString } from '../src/to-cst/nodeToString';
// import { makeRCtx } from '../src/to-cst/nodeForExpr';
import { nodeForType } from '../src/to-cst/nodeForType';
import { Node as NodeT } from '../src/types/cst';
import { errorToString } from '../src/to-cst/show-errors';
import localforage from 'localforage';
import { Type } from '../src/types/ast';
import { applyAndResolve } from '../src/get-type/matchesType';
import { Doc } from './old/Doc';

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
        const name = filePrefix + randomString();
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
            const ctx = newEvalCtx(newCtx(), {
                async store(blob) {
                    const id = randomString();
                    await localforage.setItem(attachmentKey(hash, id), blob);
                    return id;
                },
                async retrieve(id) {
                    const res = await localforage.getItem(
                        attachmentKey(hash, id),
                    );
                    if (!res) {
                        throw new Error(`No attachment ${id}`);
                    }
                    return res as Blob;
                },
            });
            if (!value) {
                setIdx(0);
                const store = initialStore(parse(`"hello"`));
                compile(store, ctx);
                setState({
                    id: hash,
                    store,
                    ctx,
                });
                return;
            }

            const store = migrateStore(value as Store);

            updateIdxForStore(store);
            compile(store, ctx);
            setState({ store, id: hash, ctx });
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
                // @ts-ignore
                window.ctx = ctx;
                // @ts-ignore
                window.store = store;
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
                <Doc key={state.id} store={state.store} ctx={state.ctx} />
            ) : (
                'No file selected'
            )}
        </div>
    );
};
function attachmentKey(hash: string, id: string): string {
    return 'attachment:' + hash + ':' + id;
}

function randomString() {
    return Math.random().toString(36).slice(2);
}
