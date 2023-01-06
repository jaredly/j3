import { useState, useEffect } from 'react';
import { Node } from '../src/types/cst';
import { Map, MNode, toMCST } from '../src/types/mcst';

export type Store = {
    selection: { idx: number; side?: 'start' | 'end' | 'change' } | null;
    listeners: { [key: string]: Array<() => void> };
    roots: number[];
    map: Map;
};

export type Path = { cid: number; idx: number; punct: number };
export type Child = { item: Path; idx?: number };

export const initialStore = (nodes: Node[]): Store => {
    const map: Map = {};
    const roots = nodes.map((node) => toMCST(node, map));
    return {
        selection: { idx: roots[0], side: 'start' },
        roots,
        listeners: {},
        map,
    };
};

export const useStore = (store: Store, key: number): MNode => {
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
    idxs.forEach((idx) => {
        if (idx != null) {
            store.listeners[idx]?.forEach((fn) => fn());
        }
    });
    if (store.listeners['']) {
        store.listeners[''].forEach((fn) => fn());
    }
};

export const setSelection = (store: Store, selection: Store['selection']) => {
    const old = store.selection;
    if (old?.idx === selection?.idx) {
        return notify(store, [selection?.idx]);
    }
    store.selection = selection;
    notify(store, [old?.idx, selection?.idx]);
    return old;
};
