import generate from '@babel/generator';
import * as React from 'react';
import * as t from '@babel/types';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, Ctx, newCtx, noForm } from '../src/to-ast/to-ast';
import { stmtToTs } from '../src/to-ast/to-ts';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { Node } from './Nodes';
import { EvalCtx, initialStore, Store } from './store';
import objectHash from 'object-hash';

const _init = `
(def hello 10)
(== hello 10)
(== what 20)
`;

const init = `(== 5 (+ 2 3))
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
(\`Hello 10)
(\`What)
\`Yea
3
(let [(\`Ok x) (\`Ok 20)] (+ x 23))

(defn add2 [x :int] (+ x 2))
(== (add2 23) 25)

(def ok {23 100 yes 34})
(def yes (let [{yes} ok] yes))
(== yes 34)`;

const useLocalStorage = <T,>(key: string, initial: () => T) => {
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
    const cst = parse(init);
    let ctx = newCtx();
    const exprs = cst.map((node) => {
        const res = nodeToExpr(node, ctx);
        ctx = addDef(res, ctx);
        return res;
    });
    return { exprs, ctx };
};

const compile = (store: Store, ectx: EvalCtx) => {
    let { ctx, last, terms, nodes, results } = ectx;
    const root = store.map[store.root].node.contents as ListLikeContents;

    root.values.forEach((idx) => {
        if (store.map[idx].node.contents.type === 'comment') {
            results[idx] = {
                status: 'success',
                value: undefined,
                code: '// a comment',
            };
            return;
        }
        const res = nodeToExpr(fromMCST(idx, store.map), ctx);
        const hash = objectHash(noForm(res));
        if (last[idx] === hash) {
            return;
        }
        const ts = stmtToTs(res, ctx, 'top');
        const code = generate(t.file(t.program([ts]))).code;
        const fn = new Function('$terms', 'fail', code);
        try {
            results[idx] = {
                status: 'success',
                value: fn(terms, (message: string) => {
                    // console.log(`Encountered a compilation failure: `, message);
                    throw new Error(message);
                }),
                code,
            };
            last[idx] = hash;
        } catch (err) {
            results[idx] = {
                status: 'failure',
                error: (err as Error).message,
                code,
            };
            last[idx] = hash;
            return;
        }
        ctx = addDef(res, ctx);
    });

    ectx.ctx = ctx;
};

export const App = () => {
    const terms: { [key: string]: any } = React.useMemo(() => ({}), []);
    const ctx = React.useMemo(
        () => ({ ctx: newCtx(), last: {}, terms, nodes: {}, results: {} }),
        [],
    );
    const last = React.useMemo<{ [key: number]: string }>(() => ({}), []);
    const store = React.useMemo(() => {
        const store = initialStore(parse(init));
        compile(store, ctx);
        return store;
    }, []);

    const tick = React.useState(0);

    React.useEffect(() => {
        store.listeners[''] = [
            () => {
                compile(store, ctx);
                tick[1]((x) => x + 1);
            },
        ];
    }, []);

    return (
        <div style={{ margin: 24 }}>
            <div>
                <Node
                    idx={store.root}
                    store={store}
                    ctx={ctx}
                    path={[]}
                    events={{
                        onLeft() {},
                        onRight() {},
                    }}
                />
            </div>
        </div>
    );
};
