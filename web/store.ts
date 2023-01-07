import { useState, useEffect } from 'react';
import { Node } from '../src/types/cst';
import { Map, MNode, toMCST } from '../src/types/mcst';
import { layout } from './layout';

export type Selection = {
    idx: number;
    side?: 'start' | 'end' | 'change' | 'inside';
};
export type Store = {
    selection: Selection | null;
    listeners: { [key: string]: Array<() => void> };
    roots: number[];
    map: Map;
};

// Path Locations:
// child (idx)
// decorator (key) [tag or arg]

export type PathChild =
    | { type: 'root'; at: number }
    | {
          type: 'child';
          at: number;
      }
    | { type: 'inside' | 'start' | 'end' }
    | {
          type: 'decorator';
          key: string;
          at: number; // 0 for the key
      };

export type Path = { idx: number; child: PathChild };
// export type Child = { item: Path; idx?: number };

export const initialStore = (nodes: Node[]): Store => {
    const map: Map = {};
    const roots = nodes.map((node) => toMCST(node, map));
    roots.forEach((id) => layout(id, 0, map, true));
    return {
        selection: { idx: roots[0], side: 'start' },
        roots,
        listeners: {},
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

export const notify = (store: Store, idxs: (number | null | undefined)[]) => {
    let seen: { [key: string]: true } = {};
    idxs.forEach((idx) => {
        if (idx != null && !seen[idx]) {
            seen[idx] = true;
            store.listeners[idx]?.forEach((fn) => fn());
        }
    });
    if (store.listeners['']) {
        store.listeners[''].forEach((fn) => fn());
    }
};

export const setSelection = (
    store: Store,
    selection: Store['selection'],
    extras?: (number | null | undefined)[],
) => {
    const old = store.selection;
    if (old?.idx === selection?.idx && old?.side === selection?.side) {
        return notify(store, [selection?.idx, ...(extras || [])]);
    }
    store.selection = selection;
    notify(store, [old?.idx, selection?.idx, ...(extras || [])]);
    return old;
};

export type UpdateMap = { [key: string]: null | Map[0] };
export type StoreUpdate = {
    map: UpdateMap;
    selection?: Store['selection'] | null;
    prev?: Store['selection'] | null;
};

export const updateStore = (
    store: Store,
    { map: change, selection, prev }: StoreUpdate,
    paths: Path[][],
) => {
    // console.log(`-> updateStore`, change, selection);
    const pre: UpdateMap = {};
    Object.keys(change).forEach((item) => {
        pre[+item] = store.map[+item];
    });
    // const history: HistoryItem = {
    //     pre,
    //     post: change,
    //     preSelection: prev != undefined ? prev : store.selection,
    //     postSelection: selection,
    // };
    // if (store.history.idx > 0) {
    //     store.history.items = store.history.items.slice(0, store.history.idx);
    // }
    // store.history.items.push(history);
    // store.history.idx = 0;
    Object.keys(change).forEach((key) => {
        if (change[key] == null) {
            delete store.map[+key];
        } else {
            store.map[+key] = change[+key]!;
        }
    });

    paths.forEach((path) => {
        for (let i = path.length - 1; i >= 0; i--) {
            layout(
                path[i].idx,
                store.map[path[i].idx].layout?.pos ?? 0,
                store.map,
                true,
            );
        }
    });

    if (selection !== undefined) {
        setSelection(
            store,
            selection,
            Object.keys(change)
                .map(Number)
                .concat(paths.flatMap((p) => p.map((i) => i.idx))),
        );
    } else {
        notify(
            store,
            Object.keys(change)
                .map(Number)
                .concat(paths.flatMap((p) => p.map((i) => i.idx))),
        );
    }
};
