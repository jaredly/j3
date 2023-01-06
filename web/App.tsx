import * as React from 'react';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, Ctx, newCtx, noForm } from '../src/to-ast/to-ast';
import { Expr } from '../src/types/ast';
import { Node } from './Nodes';
import { initialStore, setSelection } from './store';

const init = `(== 5 (+ 2 3))
(== 5 5)

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
Thing
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

export const App = () => {
    // const [state, setState] = useLocalStorage<{ exprs: Expr[]; ctx: Ctx }>(
    //     'j3:test',
    //     getInitialState,
    // );
    const store = React.useMemo(() => initialStore(parse(init)), []);

    return (
        <div style={{ margin: 24 }}>
            {/* <button onClick={() => setState(getInitialState())}>Ok</button> */}
            {store.roots.map((root, i) => (
                <div key={root} style={{ marginBottom: 8 }}>
                    <Node
                        idx={root}
                        store={store}
                        path={[]}
                        events={{
                            onLeft() {
                                if (i > 0) {
                                    setSelection(store, {
                                        idx: store.roots[i - 1],
                                        side: 'end',
                                    });
                                }
                            },
                            onRight() {
                                if (i < store.roots.length - 1) {
                                    setSelection(store, {
                                        idx: store.roots[i + 1],
                                        side: 'start',
                                    });
                                }
                            },
                        }}
                    />
                </div>
            ))}
            <textarea
                style={{
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    height: 300,
                    width: 800,
                }}
                defaultValue={init}
                onBlur={(evt) => {
                    const text = evt.currentTarget.value;
                }}
            />
        </div>
    );
};
