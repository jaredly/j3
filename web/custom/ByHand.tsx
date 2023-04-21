import React, { useEffect, useMemo } from 'react';
import { parseByCharacter } from '../../src/parse/parse';
import { AutoCompleteReplace } from '../../src/to-ast/Ctx';
import { fromMCST, ListLikeContents, Map, toMCST } from '../../src/types/mcst';
import { useLocalStorage } from '../Debug';
import { type ClipboardItem } from '../mods/clipboard';
import { applyUpdate, getKeyUpdate, State, Mods } from '../mods/getKeyUpdate';
import { selectEnd } from '../mods/navigate';
import { Path } from '../mods/path';
import { Cursors } from './Cursors';
import { Menu } from './Menu';
import { DebugClipboard } from './DebugClipboard';
import { HiddenInput } from './HiddenInput';
import { Root } from './Root';
import { reduce } from './reduce';
import { getCtx } from './getCtx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { Node } from '../../src/types/cst';
import { Hover } from './Hover';
import { Expr } from '../../src/types/ast';
import { transformNode } from '../../src/types/transform-cst';
import { Ctx } from '../../src/to-ast/library';

const examples = {
    infer: '(+ 2)',
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
    // ui:{
    regs: RegMap;
    clipboard: ClipboardItem[][];
    ctx: Ctx;
    hover: Path[];
    // }
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
    | { type: 'hover'; path: Path[] }
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

export const lidx = (at: State['at']) =>
    at[0].start[at[0].start.length - 1].idx;

export const ByHand = () => {
    const [which, setWhich] = useLocalStorage('j3-example-which', () => 'sink');
    const extra = Object.keys(localStorage).filter((k) =>
        k.startsWith('j3-ex-'),
    );
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
            {extra.map((ex) => (
                <button
                    key={ex}
                    style={{ margin: 8 }}
                    onClick={() => setWhich(ex)}
                    disabled={which === ex}
                >
                    {ex}
                </button>
            ))}
            <button
                onClick={() => {
                    const id = 'j3-ex-' + Math.random().toString(36).slice(2);
                    saveState(id, parseByCharacter('"hello"', null).map);
                    setWhich(id);
                }}
            >
                +
            </button>
            <Doc
                key={which}
                initialState={
                    examples[which as 'sink']
                        ? parseByCharacter(
                              examples[which as 'sink'].replace(/\s+/g, (f) =>
                                  f.includes('\n') ? '\n' : ' ',
                              ),
                              // lol turning on updateCtx slows things down a tonnn
                              null,
                          )
                        : localStorage[which]
                        ? loadState(localStorage[which])
                        : parseByCharacter('"hello"', null)
                }
                saveKey={which.startsWith('j3-ex') ? which : undefined}
            />
        </div>
    );
};

export const saveState = (id: string, map: Map) => {
    localStorage[id] = JSON.stringify(map);
};

export const loadState = (raw: string): State => {
    const map = JSON.parse(raw);
    console.log('LOAD');
    let max = -1;
    transformNode(fromMCST(-1, map), {
        pre(node, path) {
            max = Math.max(max, node.loc);
        },
    });
    max += 1;
    return {
        nidx: () => max++,
        map,
        root: -1,
        at: [],
    };
};

export const uiState = (state: State): UIState => {
    const idx = (state.map[-1] as ListLikeContents).values[0];
    const at = selectEnd(idx, [{ idx: -1, type: 'child', at: 0 }], state.map)!;
    return {
        nidx: state.nidx,
        root: -1,
        regs: {},
        clipboard: [],
        hover: [],
        at: [{ start: at }],
        ...getCtx(state.map, -1),
    };
};

export const clipboardPrefix = '<!--""" jerd-clipboard ';
export const clipboardSuffix = ' """-->';

export const Doc = ({
    initialState,
    saveKey,
}: {
    initialState: State;
    saveKey?: string;
}) => {
    const [debug, setDebug] = useLocalStorage('j3-debug', () => false);
    const [state, dispatch] = React.useReducer(reduce, null, (): UIState => {
        return uiState(initialState);
    });

    useEffect(() => {
        if (saveKey) {
            saveState(saveKey, state.map);
        }
    }, [state.map]);

    // @ts-ignore
    window.state = state;

    const tops = (state.map[state.root] as ListLikeContents).values;

    const menu = useMenu(state);

    const start = state.at[0].start;
    const idx = start[start.length - 1].idx;

    return (
        <div
            style={{ paddingBottom: 500 }}
            onMouseEnter={(evt) => {
                dispatch({ type: 'hover', path: [] });
            }}
        >
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
            <Hover state={state} dispatch={dispatch} />
            {!state.menu?.dismissed && menu?.items.length ? (
                <Menu state={state} menu={menu} dispatch={dispatch} />
            ) : null}
            {debug ? (
                <div>
                    <button
                        onClick={() => {
                            console.log(state);
                            const node = fromMCST(-1, state.map);
                            console.log(node);
                            (node as { values: Node[] }).values.forEach(
                                (node) =>
                                    console.log(
                                        nodeToExpr(node, {
                                            ...state.ctx,
                                            local: { terms: [], types: [] },
                                        }),
                                    ),
                            );
                        }}
                    >
                        Log state and nodes
                    </button>
                    <br />
                    HashNames: {JSON.stringify(state.ctx.results.hashNames)}
                    MENU: STATE MENU {JSON.stringify(state.menu)} AND THE
                    {JSON.stringify(menu)}
                </div>
            ) : null}
            <DebugClipboard state={state} debug={debug} ctx={state.ctx} />
        </div>
    );
};

export const isRootPath = (path: Path[]) => {
    return path.length === 1 && path[0].type !== 'child';
};

export function useMenu(state: UIState) {
    return useMemo(() => {
        if (state.at.length > 1 || state.at[0].end) return;
        const path = state.at[0].start;
        const last = path[path.length - 1];
        const items = state.ctx.results.display[last.idx]?.autoComplete;
        return items ? { path, items } : undefined;
    }, [state.map, state.at, state.ctx]);
}
