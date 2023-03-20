import equal from 'fast-deep-equal';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sexp } from '../../progress/sexp';
import {
    idxSource,
    parseByCharacter,
    splitGraphemes,
} from '../../src/parse/parse';
import { newCtx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { layout } from '../layout';
import {
    type ClipboardItem,
    clipboardText,
    collectClipboard,
    collectNodes,
    paste,
} from '../mods/clipboard';
import {
    applyUpdate,
    applyUpdateMap,
    getKeyUpdate,
    StateChange,
    State,
    Mods,
} from '../mods/getKeyUpdate';
import { selectEnd } from '../mods/navigate';
import { Path } from '../mods/path';
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
(def person {name "Person" age 32 animals {cats 1.5 dogs 0}
description "This is a person with a \${"kinda"} normal-length description"
subtitle "Return of the person"
parties (let [parties (isLive (vec4 1.0)) another true]
(if parties "Some parties" "probably way too many parties"))})
person.description
person.animals.dogs
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
          mods: Mods;
      }
    | {
          type: 'paste';
          items: ClipboardItem[];
      };

const reduce = (state: UIState, action: Action): UIState => {
    switch (action.type) {
        case 'key':
            if (action.key === 'ArrowUp' || action.key === 'ArrowDown') {
                return verticalMove(
                    state,
                    action.key === 'ArrowUp',
                    action.mods,
                );
            }
            const newState = handleKey(state, action.key, action.mods);
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
        case 'paste': {
            return { ...paste(state, action.items), regs: state.regs };
        }
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

const clipboardPrefix = '<!--""" jerd-clipboard ';
const clipboardSuffix = ' """-->';

export const Doc = ({ initialText }: { initialText: string }) => {
    const [debug, setDebug] = useLocalStorage('j3-debug', () => false);
    const [state, dispatch] = React.useReducer(reduce, null, (): UIState => {
        const { map, nidx } = parseByCharacter(initialText, debug);
        const idx = (map[-1] as ListLikeContents).values[0];
        const at = selectEnd(idx, [{ idx: -1, type: 'child', at: 0 }], map)!;
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
        <div>
            <input
                ref={hiddenInput}
                autoFocus
                value="whaa"
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
                    const items = collectClipboard(state.map, state.at);
                    if (!items.length) {
                        return;
                    }

                    const text = clipboardText(items);
                    navigator.clipboard.write([
                        new ClipboardItem({
                            ['text/plain']: new Blob([text], {
                                type: 'text/plain',
                            }),
                            ['text/html']: new Blob(
                                [
                                    clipboardPrefix +
                                        JSON.stringify(items) +
                                        clipboardSuffix +
                                        text,
                                ],
                                { type: 'text/html' },
                            ),
                        }),
                    ]);
                }}
                onPaste={(evt) => {
                    evt.preventDefault();
                    const text = evt.clipboardData.getData('text/html');
                    if (text) {
                        const start = text.indexOf(clipboardPrefix);
                        const end = text.indexOf(clipboardSuffix);
                        if (start !== -1 && end !== -1) {
                            const sub = text.slice(
                                start + clipboardPrefix.length,
                                end,
                            );
                            try {
                                const items: ClipboardItem[] = JSON.parse(sub);
                                dispatch({ type: 'paste', items });
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        return;
                    }
                    const plain = evt.clipboardData.getData('text/plain');
                    if (plain) {
                        dispatch({
                            type: 'paste',
                            items: [
                                { type: 'text', text: plain, trusted: false },
                            ],
                        });
                    }
                }}
                onKeyDown={(evt) => {
                    if (evt.metaKey || evt.ctrlKey || evt.altKey) {
                        return;
                    }

                    evt.stopPropagation();
                    evt.preventDefault();
                    if (evt.key !== 'Unidentified') {
                        dispatch({
                            type: 'key',
                            key: evt.key,
                            mods: {
                                shift: evt.shiftKey,
                                alt: evt.altKey,
                                meta: evt.metaKey,
                            },
                        });
                    }
                }}
                onInput={(evt) => {
                    if (evt.currentTarget.value) {
                        dispatch({
                            type: 'key',
                            key: evt.currentTarget.value,
                            mods: {},
                        });
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
                style={{ cursor: 'text', padding: 16 }}
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
                        if (equal(sel, at[idx].start)) {
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
                                    type: 'child',
                                    at: i,
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
                    At:{' '}
                    <div>
                        {state.at.map(({ start, end }, i) => (
                            <div key={i} style={{ display: 'flex' }}>
                                <div>
                                    {start.map((item, i) => (
                                        <div key={i}>
                                            {JSON.stringify(item)}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    {end?.map((item, i) => (
                                        <div key={i}>
                                            {JSON.stringify(item)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
                                            <td>{JSON.stringify(item)}</td>
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
    return path.length === 1 && path[0].type !== 'child';
};

export const handleKey = (state: UIState, key: string, mods: Mods): UIState => {
    // state = { ...state };
    // state.at = state.at.slice();
    for (let i = 0; i < state.at.length; i++) {
        const update = getKeyUpdate(
            key,
            state.map,
            state.at[i],
            state.nidx,
            mods,
        );
        state = { ...applyUpdate(state, i, update), regs: state.regs };
    }
    return state;
};
