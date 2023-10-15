import { useMemo } from 'react';
import { getCtx } from '../../src/getCtx';
import { State } from '../../src/state/getKeyUpdate';
import { selectEnd } from '../../src/state/navigate';
import { Path } from '../../src/state/path';
import { ListLikeContents, Map, fromMCST } from '../../src/types/mcst';
import { transformNode } from '../../src/types/transform-cst';
import { UIState } from './UIState';

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

export const lidx = (at: State['at']) =>
    at[0].start[at[0].start.length - 1].idx;

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
        collapse: {},
        root: -1,
        regs: {},
        clipboard: [],
        hover: [],
        history: [],
        at: [{ start: at }],
        ...getCtx(state.map, -1, state.nidx),
    };
};

export const clipboardPrefix = '<!--""" jerd-clipboard ';
export const clipboardSuffix = ' """-->';

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
