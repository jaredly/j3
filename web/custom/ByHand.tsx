import React, { useMemo } from 'react';
import { parseByCharacter } from '../../src/parse/parse';
import { AutoCompleteReplace, Ctx, newCtx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { fromMCST, ListLikeContents, Map } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { layout } from '../layout';
import { type ClipboardItem, paste } from '../mods/clipboard';
import { applyUpdate, getKeyUpdate, State, Mods } from '../mods/getKeyUpdate';
import { selectEnd } from '../mods/navigate';
import { Path } from '../mods/path';
import { Cursors } from './Cursors';
import { Menu } from './Menu';
import { DebugClipboard } from './DebugClipboard';
import { HiddenInput } from './HiddenInput';
import { Root } from './Root';
import { verticalMove } from './verticalMove';

const examples = {
    let: '(let [x 10] (+ x 20))',
    lists: '(1 2) (3 [] 4) (5 6)',
    string: `"Some 🤔 things\nare here for \${you} to\nsee"`,
    fn: `(fn [hello:int] (+ hello 2))`,

    sink: `
(def live (vec4 1. 0.6 1. 1.))
(def dead (vec4 0. 0. 0. 1.))
(defn isLive [{x}:Vec4] (> x 0.5))
{..one two three ..four five ..(one two) three four}
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

export type UIState = {
    regs: RegMap;
    clipboard: ClipboardItem[][];
    ctx: Ctx;
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
    | { type: 'copy'; items: ClipboardItem[] }
    | { type: 'menu'; selection: number }
    | { type: 'menu-select'; path: Path[]; item: AutoCompleteReplace }
    | {
          type: 'key';
          key: string;
          mods: Mods;
      }
    | {
          type: 'paste';
          items: ClipboardItem[];
      };

const lidx = (at: State['at']) => at[0].start[at[0].start.length - 1].idx;

const maxSym = (map: Map) => {
    let max = 0;
    Object.keys(map).forEach((id) => {
        const node = map[+id];
        if (node.type === 'identifier' && node.hash?.startsWith(':')) {
            max = Math.max(max, +node.hash.slice(1));
        }
    });
    return max;
};

const getCtx = (map: Map, root: number) => {
    const tops = (map[root] as ListLikeContents).values;
    const ctx = newCtx();
    ctx.sym.current = maxSym(map) + 1;
    try {
        nodeToExpr(fromMCST(root, map), ctx);
        tops.forEach((top) => {
            layout(top, 0, map, ctx.display, true);
        });
        const mods = Object.keys(ctx.mods);
        if (mods.length) {
            map = { ...map };
            mods.forEach((key) => {
                ctx.mods[+key].forEach((mod) => {
                    if (mod.type === 'hash') {
                        const node = map[+key];
                        if (node.type === 'identifier') {
                            map[+key] = { ...node, hash: mod.hash };
                        }
                    }
                });
            });
        }
        return { ctx, map };
    } catch (err) {
        return { ctx, map };
    }
};

const reduce = (state: UIState, action: Action): UIState => {
    const newState = reduceInner(state, action);
    if (state.map !== newState.map) {
        const ctx = getCtx(newState.map, newState.root);
        return ctx ? { ...newState, ...ctx } : newState;
    }
    return newState;
};

const reduceInner = (state: UIState, action: Action): UIState => {
    switch (action.type) {
        case 'menu':
            return { ...state, menu: { selection: action.selection } };
        case 'menu-select': {
            const idx = action.path[action.path.length - 1].idx;
            return {
                ...state,
                map: {
                    ...state.map,
                    [idx]: {
                        loc: state.map[idx].loc,
                        ...action.item.node,
                    },
                },
            };
        }
        case 'copy':
            return { ...state, clipboard: [action.items, ...state.clipboard] };
        case 'key':
            if (action.key === 'ArrowUp' || action.key === 'ArrowDown') {
                return verticalMove(
                    { ...state, menu: undefined },
                    action.key === 'ArrowUp',
                    action.mods,
                );
            }
            if (action.key === 'Escape') {
                console.log('dismiss');
                return { ...state, menu: { dismissed: true, selection: 0 } };
            }
            const newState = handleKey(state, action.key, action.mods);
            if (newState) {
                if (newState.at.some((at) => isRootPath(at.start))) {
                    console.log('not selecting root node');
                    return state;
                }
                const idx = lidx(newState.at);
                const prev = lidx(state.at);
                if (idx !== prev) {
                    return { ...newState, menu: undefined };
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
            return { ...state, ...paste(state, state.ctx, action.items) };
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

export const clipboardPrefix = '<!--""" jerd-clipboard ';
export const clipboardSuffix = ' """-->';

export const Doc = ({ initialText }: { initialText: string }) => {
    const [debug, setDebug] = useLocalStorage('j3-debug', () => false);
    const [state, dispatch] = React.useReducer(reduce, null, (): UIState => {
        const { map, nidx } = parseByCharacter(
            initialText.replace(/\s+/g, (f) => (f.includes('\n') ? '\n' : ' ')),
            newCtx(),
            debug,
        );
        const idx = (map[-1] as ListLikeContents).values[0];
        const at = selectEnd(idx, [{ idx: -1, type: 'child', at: 0 }], map)!;
        return {
            nidx,
            root: -1,
            regs: {},
            clipboard: [],
            at: [{ start: at }],
            ...getCtx(map, -1),
        };
    });

    // @ts-ignore
    window.state = state;

    const tops = (state.map[state.root] as ListLikeContents).values;

    const menu = useMemo(() => {
        if (state.at.length > 1 || state.at[0].end) return;
        const path = state.at[0].start;
        const last = path[path.length - 1];
        const items = state.ctx.display[last.idx]?.autoComplete;
        return items ? { path, items } : undefined;
    }, [state.map, state.at, state.ctx]);

    return (
        <div>
            <HiddenInput
                ctx={state.ctx}
                state={state}
                dispatch={dispatch}
                menu={!state.menu?.dismissed ? menu : undefined}
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
            <Root
                state={state}
                dispatch={dispatch}
                tops={tops}
                debug={debug}
                ctx={state.ctx}
            />
            <Cursors state={state} />
            {!state.menu?.dismissed && menu?.items.length ? (
                <Menu
                    state={state}
                    ctx={state.ctx}
                    menu={menu}
                    dispatch={dispatch}
                />
            ) : null}
            Menu: {JSON.stringify(state.menu)}
            <DebugClipboard state={state} debug={debug} ctx={state.ctx} />
        </div>
    );
};

const isRootPath = (path: Path[]) => {
    return path.length === 1 && path[0].type !== 'child';
};

export const handleKey = (state: UIState, key: string, mods: Mods): UIState => {
    for (let i = 0; i < state.at.length; i++) {
        const update = getKeyUpdate(
            key,
            state.map,
            state.at[i],
            state.ctx.display,
            state.nidx,
            mods,
        );
        state = { ...state, ...applyUpdate(state, i, update) };
    }
    return state;
};
