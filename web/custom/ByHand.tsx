import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { sexp } from '../../progress/sexp';
import {
    idText,
    parseByCharacter,
    selPos,
    splitGraphemes,
} from '../../src/parse/parse';
import { newCtx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { fromMCST, ListLikeContents, Map } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { layout } from '../layout';
import {
    applyUpdate,
    applyUpdateMap,
    getKeyUpdate,
    KeyUpdate,
} from '../mods/getKeyUpdate';
import { PathSel, selectEnd } from '../mods/navigate';
import { Path, Selection } from '../store';
import { Render } from './Render';
import { closestSelection, verticalMove } from './verticalMove';

// const initialText = '(let [x 10] (+ x 20))';
// const initialText = '(1 2) (3 [] 4) (5 6)';
// const initialText = `"Some 🤔 things"`;

const initialText = `
(def live (vec4 1. 0.6 1. 1.))
(def dead (vec4 0. 0. 0. 1.))
(defn isLive [{x}:Vec4] (> x 0.5))
(defn neighbor [offset:Vec2 coord:Vec2 res:Vec2 buffer:sampler2D] (let [coord (+ coord offset)] (if (isLive ([coord / res] buffer)) 1 0)))
(def person {name "Person" age 32 cats 1.5
description "This is a person with a \${"kinda"} normal-length description"
subtitle "Return of the person"
parties (let [parties (isLive (vec4 1.0)) another true]
(if parties "Some parties" "probably way too many parties"))})
`.trim();

// const initialText = `
// (def person {name "Pers\${aaaaaaaaaaaa}on"
// parties (let)})
// `.trim();

// (defn shape-to-svg [shape:shape]
//   (switch shape
//     ('Circle {$ pos radius})
//       "<circle cx='\${pos.x}' cy='\${pos.y}' r='\${radius}' />"
//     ('Rect {$ pos size})
//       "<rect x='\${pos.x}' y='\${pos.y}' width='\${size.x}' height='\${size.y}' />"
//   )
// )
// (defn wrap-svg [contents:string] "<svg>\${contents}</svg>")
// (defn show-shapes [shapes:(array shape)]
//   (wrap-svg (join
//     (map shapes shape-to-svg)
//     "\n")))

// '(fn [one:two three:(four five)]:six {10 20 yes "ok ${(some [2 3 "inner" ..more] ..things)} and ${a}"})';

export type State = {
    regs: RegMap;
    map: Map;
    root: number;
    at: PathSel[];
};

type RegMap = {
    [key: number]: {
        main?: { node: HTMLSpanElement; path: Path[] } | null;
        start?: { node: HTMLSpanElement; path: Path[] } | null;
        end?: { node: HTMLSpanElement; path: Path[] } | null;
        inside?: { node: HTMLSpanElement; path: Path[] } | null;
    };
};

export type Action =
    | {
          type: 'select';
          add?: boolean;
          at: PathSel[];
      }
    | {
          type: 'key';
          key: string;
      };

const reduce = (state: State, action: Action): State => {
    switch (action.type) {
        case 'key':
            if (action.key === 'ArrowUp' || action.key === 'ArrowDown') {
                return verticalMove(state, action.key === 'ArrowUp');
            }
            const newState = handleKey(state, action.key);
            if (newState) {
                if (newState.at.some((at) => isRootPath(at.path))) {
                    console.log('not selecting root node');
                    return state;
                }
                return newState;
            }
            return state;
        case 'select':
            // Ignore attempts to select the root node
            if (action.at.some((at) => isRootPath(at.path))) {
                return state;
            }
            return {
                ...state,
                at: action.add ? state.at.concat(action.at) : action.at,
            };
    }
};

export const ByHand = () => {
    const [debug, setDebug] = useLocalStorage('j3-debug', () => false);
    const [state, dispatch] = React.useReducer(reduce, null, (): State => {
        const map = parseByCharacter(initialText, debug).map;
        const idx = (map[-1] as ListLikeContents).values[0];
        const at = selectEnd(
            idx,
            [{ idx: -1, child: { type: 'child', at: 0 } }],
            map,
        )!;
        return { map, root: -1, at: [at], regs: {} };
    });

    // @ts-ignore
    window.state = state;

    const [blink, setBlink] = useState(false);

    const tops = (state.map[state.root] as ListLikeContents).values;

    const ctx = React.useMemo(() => {
        const ctx = newCtx();
        nodeToExpr(fromMCST(state.root, state.map), ctx);
        tops.forEach((top) => {
            layout(top, 0, state.map, ctx.display, true);
        });
        return ctx;
    }, [state.map]);

    const [cursorPos, setCursorPos] = useState(
        [] as ({ x: number; y: number; h: number; color?: string } | null)[],
    );

    const reg = useCallback(
        (
            node: HTMLSpanElement | null,
            idx: number,
            path: Path[],
            loc?: 'start' | 'end' | 'inside',
        ) => {
            if (!state.regs[idx]) {
                state.regs[idx] = {};
            }
            state.regs[idx][loc ?? 'main'] = node ? { node, path } : null;
        },
        [],
    );

    useEffect(() => {
        setCursorPos(
            state.at.map((at) => {
                const box = calcCursorPos(at.sel, state.regs);
                if (box) {
                    const offsetY = document.body.scrollTop;
                    const offsetX = document.body.scrollLeft;
                    return {
                        x: box.left - offsetX,
                        y: box.top - offsetY,
                        h: box.height,
                        color: box.color,
                    };
                }
                return null;
            }),
        );

        if (document.activeElement !== hiddenInput.current) {
            hiddenInput.current?.focus();
        }
    }, [state.at]);

    useEffect(() => {
        window.addEventListener(
            'blur',
            (evt) => {
                setTimeout(() => {
                    if (document.activeElement === document.body) {
                        hiddenInput.current?.focus();
                    }
                }, 50);
            },
            true,
        );
    }, []);

    const hiddenInput = useRef(null as null | HTMLInputElement);

    return (
        <div style={{ padding: 16 }}>
            {/* always capturing! dunno if this is totally wise lol */}
            <input
                ref={hiddenInput}
                autoFocus
                // onBlur={(evt) => evt.currentTarget.focus()}
                style={{
                    width: 0,
                    height: 0,
                    opacity: 0,
                    position: 'absolute',
                    border: 'none',
                    pointerEvents: 'none',
                }}
                onKeyDown={(evt) => {
                    if (evt.metaKey || evt.ctrlKey || evt.altKey) {
                        return;
                    }

                    evt.stopPropagation();
                    evt.preventDefault();
                    if (evt.key !== 'Unidentified') {
                        dispatch({ type: 'key', key: evt.key });
                    }
                }}
                onInput={(evt) => {
                    // console.log('Input', evt, evt.currentTarget.value);
                    if (evt.currentTarget.value) {
                        dispatch({ type: 'key', key: evt.currentTarget.value });
                        evt.currentTarget.value = '';
                    }
                }}
                onCompositionStart={(evt) => {
                    console.log(evt);
                }}
                onCompositionEnd={(evt) => {
                    console.log('end', evt);
                }}
                onCompositionUpdate={(evt) => {
                    console.log('update', evt);
                }}
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
            <div
                style={{ cursor: 'text' }}
                onMouseDown={(evt) => {
                    const sel = closestSelection(state.regs, {
                        x: evt.clientX,
                        y: evt.clientY,
                    });
                    if (sel) {
                        dispatch({
                            type: 'select',
                            add: evt.shiftKey,
                            at: [sel],
                        });
                    }
                }}
            >
                {tops.map((top, i) => (
                    <div key={top} style={{ marginBottom: 8 }}>
                        <Render
                            debug={debug}
                            idx={top}
                            state={state}
                            reg={reg}
                            display={ctx.display}
                            dispatch={dispatch}
                            path={[
                                {
                                    idx: state.root,
                                    child: { type: 'child', at: i },
                                },
                            ]}
                        />
                        {debug ? (
                            <div>{sexp(fromMCST(top, state.map))}</div>
                        ) : null}
                    </div>
                ))}
            </div>
            {cursorPos.map((cursorPos, i) =>
                cursorPos ? (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: 1,
                            pointerEvents: 'none',
                            backgroundColor: cursorPos.color ?? 'white',
                            left: cursorPos.x,
                            height: cursorPos.h,
                            top: cursorPos.y,
                            animationDuration: '1s',
                            animationName: blink ? 'blink' : 'unset',
                            animationIterationCount: 'infinite',
                        }}
                    />
                ) : null,
            )}
            {debug ? (
                <div>
                    <div>
                        Sel: {JSON.stringify(state.at.map((at) => at.sel))}
                    </div>
                    <div>Path: </div>
                    <div>
                        <table>
                            <tbody>
                                <tr>
                                    <td>idx</td>
                                    <td>child</td>
                                </tr>

                                {state.at.map((at, a) =>
                                    at.path.map((item, i) => (
                                        <tr key={i + ':' + a}>
                                            <td>{item.idx}</td>
                                            <td>
                                                {JSON.stringify(item.child)}
                                            </td>
                                        </tr>
                                    )),
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(ctx.display, null, 2)}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const subRect = (
    one: DOMRect,
    two: DOMRect,
    color?: string,
): { left: number; top: number; height: number; color?: string } => {
    return {
        left: one.left - two.left,
        top: one.top - two.top,
        height: one.height,
        color,
    };
};

export const calcCursorPos = (
    sel: Selection,
    regs: RegMap,
): void | { left: number; top: number; height: number; color?: string } => {
    const { idx, loc } = sel;
    const nodes = regs[idx];
    if (!nodes) {
        console.error('no nodes, sorry');
        return;
    }
    const blinker = nodes[loc as 'start'];
    if (blinker) {
        return subRect(
            blinker.node.getBoundingClientRect(),
            blinker.node.offsetParent!.getBoundingClientRect(),
        );
    } else if (nodes.main) {
        const r = new Range();
        r.selectNode(nodes.main.node);
        const textRaw = nodes.main.node.textContent!;
        const text = splitGraphemes(textRaw);
        if (!nodes.main.node.firstChild) {
            // nothing to do here
        } else if (loc === 'start' || loc === 0) {
            r.setStart(nodes.main.node.firstChild!, 0);
            r.collapse(true);
        } else if (loc === 'end' || loc === text.length) {
            r.setStart(nodes.main.node.firstChild!, textRaw.length);
            r.collapse(true);
        } else if (typeof loc === 'number') {
            r.setStart(
                nodes.main.node.firstChild!,
                text.slice(0, loc).join('').length,
            );
            r.collapse(true);
        } else {
            // console.log('dunno loc', loc, nodes.main);
            return;
        }
        const color = getComputedStyle(nodes.main.node).color;
        return subRect(
            r.getBoundingClientRect(),
            nodes.main.node.offsetParent!.getBoundingClientRect(),
            color,
        );
    } else {
        console.error('no box', loc, nodes);
        return;
    }
};

const isRootPath = (path: Path[]) => {
    return path.length === 1 && path[0].child.type !== 'child';
};

export const handleKey = (state: State, key: string): State => {
    state = { ...state };
    state.at = state.at.slice();
    for (let i = 0; i < state.at.length; i++) {
        const update = getKeyUpdate(key, state, state.at[i]);
        if (!update) continue;
        if (update?.type === 'select' && isRootPath(update.path)) {
            continue;
        }
        if (
            update?.type === 'update' &&
            update.update &&
            isRootPath(update.update.path)
        ) {
            continue;
        }
        if (update.type === 'select') {
            state.at[i] = { path: update.path, sel: update.selection };
        } else if (update.update) {
            state.map = applyUpdateMap(state.map, update.update.map);
            state.at[i] = {
                path: update.update.path,
                sel: update.update.selection,
            };
        }
    }
    return state;
};
