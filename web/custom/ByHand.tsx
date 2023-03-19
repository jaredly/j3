import equal from 'fast-deep-equal';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sexp } from '../../progress/sexp';
import { idxSource, parseByCharacter } from '../../src/parse/parse';
import { newCtx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { layout } from '../layout';
import { collectNodes } from '../mods/clipboard';
import { applyUpdateMap, getKeyUpdate, State } from '../mods/getKeyUpdate';
import { selectEnd } from '../mods/navigate';
import { Path } from '../store';
import { Cursors } from './Cursors';
import { cmpFullPath } from './isCoveredBySelection';
import { Render } from './Render';
import { closestSelection, verticalMove } from './verticalMove';

const examples = {
    let: '(let [x 10] (+ x 20))',
    lists: '(1 2) (3 [] 4) (5 6)',
    string: `"Some 🤔 things\nare here for \${you} to\nsee"`,

    sink: `
(def live (vec4 1. 0.6 1. 1.))
(def dead (vec4 0. 0. 0. 1.))
(defn isLive [{x}:Vec4] (> x 0.5))
(defn neighbor [offset:Vec2 coord:Vec2 res:Vec2 buffer:sampler2D] (let [coord (+ coord offset)] (if (isLive ([coord / res] buffer)) 1 0)))
(def person {name "Person" age 32 cats 1.5
description "This is a person with a \${"kinda"} normal-length description"
subtitle "Return of the person"
parties (let [parties (isLive (vec4 1.0)) another true]
(if parties "Some parties" "probably way too many parties"))})
(defn shape-to-svg [shape:shape]
  (switch shape
    ('Circle {$ pos radius})
      "<circle cx='\${pos.x}' cy='\${pos.y}' r='\${radius}' />"
    ('Rect {$ pos size})
      "<rect x='\${pos.x}' y='\${pos.y}' width='\${size.x}' height='\${size.y}' />"))
(defn wrap-svg [contents:string] "<svg>\${contents}</svg>")
(defn show-shapes [shapes:(array shape)]
  (wrap-svg (join
    (map shapes shape-to-svg)
    "\n")))
`.trim(),
};

// const initialText = `
// (def person {name "Pers\${aaaaaaaaaaaa}on"
// parties (let)})
// `.trim();

// '(fn [one:two three:(four five)]:six {10 20 yes "ok ${(some [2 3 "inner" ..more] ..things)} and ${a}"})';

export type UIState = {
    regs: RegMap;
} & State;

export type RegMap = {
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
          at: { start: Path[]; end?: Path[] }[];
      }
    | {
          type: 'key';
          key: string;
      };

const reduce = (state: UIState, action: Action): UIState => {
    switch (action.type) {
        case 'key':
            if (action.key === 'ArrowUp' || action.key === 'ArrowDown') {
                return verticalMove(state, action.key === 'ArrowUp');
            }
            const newState = handleKey(state, action.key);
            if (newState) {
                if (newState.at.some((at) => isRootPath(at.start))) {
                    console.log('not selecting root node');
                    return state;
                }
                return newState;
            }
            return state;
        case 'select':
            // Ignore attempts to select the root node
            if (action.at.some((at) => isRootPath(at.start))) {
                return state;
            }
            return {
                ...state,
                at: action.add ? state.at.concat(action.at) : action.at,
            };
    }
};

export const ByHand = () => {
    const [which, setWhich] = useLocalStorage('j3-example-which', () => 'sink');
    return (
        <div>
            {Object.keys(examples).map((k) => (
                <button
                    disabled={which === k}
                    style={{
                        margin: 8,
                    }}
                    key={k}
                    onClick={() => setWhich(k)}
                >
                    {k}
                </button>
            ))}
            <Doc
                key={which}
                initialText={examples[which as 'sink'] ?? 'what'}
            />
        </div>
    );
};

export const Doc = ({ initialText }: { initialText: string }) => {
    const [debug, setDebug] = useLocalStorage('j3-debug', () => false);
    const [state, dispatch] = React.useReducer(reduce, null, (): UIState => {
        const { map, nidx } = parseByCharacter(initialText, debug);
        const idx = (map[-1] as ListLikeContents).values[0];
        const at = selectEnd(
            idx,
            [{ idx: -1, child: { type: 'child', at: 0 } }],
            map,
        )!;
        return {
            map,
            root: -1,
            at: [{ start: at }],
            regs: {},
            nidx,
        };
    });

    // @ts-ignore
    window.state = state;

    const tops = (state.map[state.root] as ListLikeContents).values;

    const ctx = React.useMemo(() => {
        const ctx = newCtx();
        try {
            nodeToExpr(fromMCST(state.root, state.map), ctx);
            tops.forEach((top) => {
                layout(top, 0, state.map, ctx.display, true);
            });
        } catch (err) {
            console.error(err);
        }
        return ctx;
    }, [state.map]);

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

    const [drag, setDrag] = useState(false);

    const selections = state.at
        .filter((s) => s.end)
        .map(({ start, end }) => {
            const cmp = cmpFullPath(start, end!);
            return cmp > 0 ? { start: end!, end: start } : { start, end };
        });

    return (
        <div style={{ padding: 16 }}>
            {/* always capturing! dunno if this is totally wise lol */}
            <input
                ref={hiddenInput}
                autoFocus
                value="whaa"
                // onBlur={(evt) => evt.currentTarget.focus()}
                style={{
                    width: 0,
                    height: 0,
                    opacity: 0,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    border: 'none',
                    pointerEvents: 'none',
                }}
                onCopy={(evt) => {
                    evt.preventDefault();
                    const start = state.at[0].start;
                    const end = state.at[0].end;
                    if (!end) return;
                    const collected = collectNodes(state.map, start, end);
                    const text =
                        collected.type === 'subtext'
                            ? collected.text
                            : collected.nodes
                                  .map((node) => nodeToString(node))
                                  .join(' ');
                    // navigator.clipboard.writeText(text);
                    navigator.clipboard.write([
                        new ClipboardItem({
                            ['text/plain']: new Blob([text], {
                                type: 'text/plain',
                            }),
                            ['text/html']: new Blob(
                                [
                                    '<!-- ' +
                                        encodeURI(JSON.stringify(collected)) +
                                        '-->' +
                                        text,
                                ],
                                // ['why'],
                                {
                                    type: 'text/html',
                                },
                            ),
                        }),
                    ]);
                    // navigator.clipboard.write()
                }}
                onPaste={(evt) => {
                    console.log('got', evt.clipboardData.getData('text/html'));
                    evt.preventDefault();
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
                onMouseDownCapture={() => {
                    setDrag(true);
                }}
                onMouseDown={(evt) => {
                    const sel = closestSelection(state.regs, {
                        x: evt.clientX,
                        y: evt.clientY,
                    });
                    if (sel) {
                        dispatch({
                            type: 'select',
                            add: evt.altKey,
                            at: [{ start: sel }],
                        });
                    }
                }}
                onMouseMove={(evt) => {
                    if (!drag) {
                        return;
                    }
                    const sel = closestSelection(state.regs, {
                        x: evt.clientX,
                        y: evt.clientY,
                    });
                    if (sel) {
                        const at = state.at.slice();
                        const idx = at.length - 1;
                        if (equal(at, at[idx].start)) {
                            at[idx] = { start: sel };
                            dispatch({ type: 'select', at });
                        } else {
                            at[idx] = { ...at[idx], end: sel };
                            dispatch({ type: 'select', at });
                        }
                    }
                }}
                onMouseUpCapture={(evt) => {
                    if (drag) {
                        setDrag(false);
                        // const sel = closestSelection(state.regs, {
                        //     x: evt.clientX,
                        //     y: evt.clientY,
                        // });
                        // if (sel && !equal(sel, state.at[0].start)) {
                        //     dispatch({
                        //         type: 'select',
                        //         add: evt.altKey,
                        //         at: [
                        //             {
                        //                 start: state.at[0].start,
                        //                 end: sel,
                        //             },
                        //         ],
                        //     });
                        // }
                    }
                }}
            >
                {tops.map((top, i) => (
                    <div key={top} style={{ marginBottom: 8 }}>
                        <Render
                            debug={debug}
                            idx={top}
                            map={state.map}
                            reg={reg}
                            display={ctx.display}
                            dispatch={dispatch}
                            selection={selections}
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
            <Cursors state={state} />
            <div>
                <div>
                    At: <div>{JSON.stringify(state.at)}</div>
                </div>
            </div>
            {debug ? (
                <div>
                    <div>
                        Sel:{' '}
                        {/* {JSON.stringify(
                            state.at.map((at) => [at.start.sel, at.end?.sel]),
                        )} */}
                        <div>{JSON.stringify(state.at[0].start)}</div>
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
                                    at.start.map((item, i) => (
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

const isRootPath = (path: Path[]) => {
    return path.length === 1 && path[0].child.type !== 'child';
};

export const handleKey = (state: UIState, key: string): UIState => {
    state = { ...state };
    state.at = state.at.slice();
    for (let i = 0; i < state.at.length; i++) {
        const update = getKeyUpdate(
            key,
            state.map,
            state.at[i].start,
            state.nidx,
        );
        if (!update) continue;
        if (update?.type === 'select' && isRootPath(update.selection)) {
            continue;
        }
        if (
            update?.type === 'update' &&
            update.update &&
            isRootPath(update.update.selection)
        ) {
            continue;
        }
        if (update.type === 'select') {
            state.at[i] = {
                start: update.selection,
            };
        } else if (update.update) {
            state.map = applyUpdateMap(state.map, update.update.map);
            state.at[i] = {
                start: update.update.selection,
            };
        }
    }
    return state;
};
