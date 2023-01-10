import * as React from 'react';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, Ctx, newCtx, noForm } from '../src/to-ast/to-ast';
import { Node } from './Nodes';
import { EvalCtx, initialStore, newEvalCtx } from './store';
import { compile } from './compile';
import { nodeToString } from '../src/to-cst/nodeToString';
import { nodeForType } from '../src/to-cst/nodeForExpr';

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
(def yes (let [{yes} {yes 34}] yes))
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
    const ctx = React.useMemo<EvalCtx>(() => newEvalCtx(newCtx()), []);
    const last = React.useMemo<{ [key: number]: string }>(() => ({}), []);
    const store = React.useMemo(() => {
        const store = initialStore(parse(init));
        compile(store, ctx);
        return store;
    }, []);

    const tick = React.useState(0);

    const [altDown, setAltDown] = React.useState(false);

    React.useEffect(() => {
        const fn = (evt: KeyboardEvent) => {
            if (evt.key === 'Alt') {
                setAltDown(true);
                console.log('good');
            }
            console.log('ya');
        };
        const up = (evt: KeyboardEvent) => {
            if (evt.key === 'Alt') {
                setAltDown(false);
            }
        };
        document.addEventListener('keydown', fn);
        document.addEventListener('keyup', up);
        return () => {
            document.removeEventListener('keydown', fn);
            document.removeEventListener('keyup', up);
        };
    }, []);

    React.useEffect(() => {
        store.listeners[''] = [
            () => {
                compile(store, ctx);
                tick[1]((x) => x + 1);
            },
        ];
    }, []);

    const [hover, setHover] = React.useState([] as { idx: number; box: any }[]);

    const best = React.useMemo(() => {
        for (let i = hover.length - 1; i >= 0; i--) {
            if (ctx.types[hover[i].idx]) {
                return hover[i];
            }
        }
    }, [hover]);

    return (
        <div style={{ margin: 24 }}>
            <div>
                <Node
                    idx={store.root}
                    store={store}
                    ctx={ctx}
                    path={[]}
                    setHover={(hover) => {
                        setHover((h) => {
                            if (hover.box) {
                                return [...h, hover];
                            } else {
                                for (let i = h.length - 1; i >= 0; i--) {
                                    if (h[i].idx === hover.idx) {
                                        const res = [...h];
                                        res.splice(i, 1);
                                        return res;
                                    }
                                }
                                return h;
                            }
                        });
                    }}
                    events={{
                        onLeft() {},
                        onRight() {},
                    }}
                />
            </div>
            {best && altDown && (
                <div
                    style={{
                        position: 'absolute',

                        left: best.box.left,
                        top: best.box.bottom,
                        pointerEvents: 'none',
                        zIndex: 100,
                        backgroundColor: 'black',
                        fontSize: '80%',
                        // boxShadow: '0 0 4px white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: 8,
                    }}
                >
                    Type:{' '}
                    {nodeToString(nodeForType(ctx.types[best.idx], ctx.ctx))}
                    {/* {JSON.stringify(noForm(ctx.types[best.idx]))} */}
                </div>
            )}
            {best && altDown && (
                <div
                    style={{
                        position: 'absolute',

                        left: best.box.left,
                        top: best.box.top,
                        height: best.box.height,
                        width: best.box.width,
                        pointerEvents: 'none',
                        zIndex: 50,
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                    }}
                ></div>
            )}
        </div>
    );
};

export type SetHover = (hover: { idx: number; box: any | null }) => void;
