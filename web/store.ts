import { useState, useEffect } from 'react';
import { Report } from '../src/get-type/get-types-new';
import { Ctx } from '../src/to-ast/Ctx';
import { Expr, Pattern, Type } from '../src/types/ast';
import { Node } from '../src/types/cst';
import { Map, MNode, toMCST } from '../src/types/mcst';
import { layout } from './layout';

export type Selection = {
    idx: number;
    loc?: 'start' | 'end' | 'change' | 'inside' | number;
};

export type Store = {
    selection: Selection | null;
    listeners: {
        [key: string]: Array<(changed?: (number | null | undefined)[]) => void>;
    };
    root: number;
    map: Map;
    history: History;
};

export type History = {
    items: HistoryItem[];
    idx: number;
};

export type HistoryItem = {
    pre: UpdateMap;
    post: UpdateMap;
    preSelection: Selection | null;
    postSelection: Selection | null | undefined;
};

export const newEvalCtx = (ctx: Ctx): EvalCtx => ({
    ctx,
    last: {},
    terms: {},
    nodes: {},
    results: {},
    // types: {},
    // globalTypes: {},
    report: { errors: {}, types: {} },
});

export type TopDef = {
    type: 'Def';
    node: Expr;
    names: { [name: string]: string };
};

export type Toplevel =
    | TopDef
    | {
          type: 'Expr';
          node: Expr;
      }
    | {
          type: 'Deftype';
          node: Type;
          names: { [name: string]: string };
      }
    | {
          type: 'Pattern';
          node: Pattern;
      };

export type Success = {
    status: 'success';
    value: any;
    type: Type | void;
    code: string;
    expr: Expr;
    display: Ctx['display'];
};

export type EvalCtx = {
    ctx: Ctx;
    // types: { [key: number]: Type };
    // globalTypes: { [hash: string]: Type };
    last: { [key: number]: string };
    terms: { [key: string]: any };
    nodes: {
        [idx: number]: Toplevel;
    };
    report: Report;
    results: {
        [key: string]:
            | Success
            | {
                  status: 'failure';
                  error: string;
                  code: string;
                  expr: Expr;
                  display: Ctx['display'];
              }
            | {
                  status: 'errors';
                  expr: Expr;
                  errors: Report['errors'];
                  display: Ctx['display'];
              };
    };
};

// Path Locations:
// child (idx)
// decorator (key) [tag or arg]

export type PathChild =
    | {
          type: 'child';
          at: number;
      }
    | { type: 'inside' | 'start' | 'end' }
    | { type: 'expr' | 'text'; at: number }
    | {
          type: 'decorator';
          key: string;
          at: number; // 0 for the key
      };

export type Path = { idx: number; child: PathChild };
// export type Child = { item: Path; idx?: number };

export const initialStore = (nodes: Node[]): Store => {
    const map: Map = {};
    const root = toMCST(
        {
            type: 'list',
            values: nodes,
            loc: { idx: -1, start: 0, end: 0 },
        },
        map,
    );
    return {
        selection: { idx: root, loc: 'start' },
        root,
        listeners: {},
        history: {
            idx: 0,
            items: [],
        },
        map,
    };
};

export const useStore = (store: Store, key: number): Map[0] => {
    const [_tick, setValue] = useState(0);
    useEffect(() => {
        const fn = () => {
            if (!store.map[key]) {
                // debugger;
            }
            setValue((v) => v + 1);
        };
        store.listeners[key] = store.listeners[key] || [];
        store.listeners[key].push(fn);
        return () => {
            store.listeners[key] = store.listeners[key].filter((x) => x !== fn);
        };
    }, [key]);
    return store.map[key];
};

export const notify = (
    store: Store,
    idxs: (number | null | undefined)[],
    change = false,
) => {
    let seen: { [key: string]: true } = {};
    idxs.forEach((idx) => {
        if (idx != null && !seen[idx]) {
            seen[idx] = true;
            store.listeners[idx]?.forEach((fn) => fn());
        }
    });
    if (store.listeners['']) {
        store.listeners[''].forEach((fn) => fn(idxs));
    }
    if (store.listeners[':change'] && change) {
        store.listeners[':change'].forEach((fn) => fn());
    }
};

export const setSelection = (
    store: Store,
    selection: Store['selection'],
    extras?: (number | null | undefined)[],
    change = false,
) => {
    const old = store.selection;
    if (old?.idx === selection?.idx && old?.loc === selection?.loc) {
        return notify(store, [selection?.idx, ...(extras || [])], change);
    }
    store.selection = selection;
    notify(store, [old?.idx, selection?.idx, ...(extras || [])], change);
    return old;
};

export type UpdateMap = { [key: string]: null | Map[0] };
export type StoreUpdate = {
    map: UpdateMap;
    selection?: Store['selection'] | null;
    prev?: Store['selection'] | null;
};

export const undo = (store: Store) => {
    if (store.history.idx >= store.history.items.length) {
        console.log('too far, its the end of history');
        return;
    }
    const item =
        store.history.items[store.history.items.length - 1 - store.history.idx];
    // console.log('presel', item.preSelection);
    updateStore(
        store,
        { map: item.pre, selection: item.preSelection },
        [],
        true,
    );
    store.history.idx += 1;
};

export const redo = (store: Store) => {
    if (store.history.idx <= 0) {
        console.log('too far, its the end of history');
        return;
    }
    const item =
        store.history.items[store.history.items.length - store.history.idx];
    // console.log('postsel', item.postSelection);
    updateStore(
        store,
        { map: item.post, selection: item.postSelection },
        [],
        true,
    );
    store.history.idx -= 1;
};

export const updateStore = (
    store: Store,
    { map: change, selection, prev }: StoreUpdate,
    paths: Path[][],
    skipHistory = false,
) => {
    // console.log('UP', change, selection);
    if (!skipHistory) {
        const pre: UpdateMap = {};
        Object.keys(change).forEach((item) => {
            pre[+item] = store.map[+item] ?? null;
        });

        const history: HistoryItem = {
            pre,
            post: change,
            preSelection: prev != undefined ? prev : store.selection,
            postSelection: selection,
        };
        if (store.history.idx > 0) {
            store.history.items = store.history.items.slice(
                0,
                store.history.idx,
            );
        }
        store.history.items.push(history);
        store.history.idx = 0;
    }

    // console.log('Store change', change);
    Object.keys(change).forEach((key) => {
        if (change[key] == null) {
            delete store.map[+key];
        } else {
            store.map[+key] = change[+key]!;
        }
    });

    // paths.forEach((path) => {
    //     for (let i = path.length - 1; i >= 0; i--) {
    //         layout(
    //             path[i].idx,
    //             ctx.display[path[i].idx]?.layout?.pos ?? 0,
    //             store.map,
    //             ctx,
    //             true,
    //         );
    //     }
    // });

    if (selection !== undefined) {
        setSelection(
            store,
            selection,
            Object.keys(change)
                .map(Number)
                .concat(paths.flatMap((p) => p.map((i) => i.idx))),
            true,
        );
    } else {
        notify(
            store,
            Object.keys(change)
                .map(Number)
                .concat(paths.flatMap((p) => p.map((i) => i.idx))),
            true,
        );
    }
};
