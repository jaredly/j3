import * as React from 'react';
import { Map, MNodeContents, toMCST } from '../src/types/mcst';
import { Path, Store, UpdateMap, updateStore } from './store';
import { parse } from '../src/grammar';
import { NodeContents, NodeList } from '../src/types/cst';
import { Events } from './Nodes';

export const onKeyDown = (
    evt: React.KeyboardEvent<HTMLSpanElement>,
    idx: number,
    path: Path[],
    events: Events,
    store: Store,
) => {
    if (evt.key === 'Enter') {
        evt.preventDefault();
        // TODO decide what to do here
        return;
    }

    if (evt.key === 'Backspace') {
        if (evt.currentTarget.textContent === '') {
            const parent = path[path.length - 1];
            if (parent.child.type === 'child') {
                const mp: UpdateMap = {};
                const pnode = store.map[parent.idx];
                const { contents, nidx } = rmChild(
                    pnode.node.contents,
                    parent.child.at,
                );
                mp[parent.idx] = {
                    node: {
                        ...pnode.node,
                        contents,
                    },
                };
                updateStore(
                    store,
                    {
                        map: mp,
                        selection:
                            nidx != null
                                ? {
                                      idx: nidx,
                                      side: 'end',
                                  }
                                : { idx: parent.idx, side: 'start' },
                    },
                    [path],
                );
                evt.preventDefault();
            }
        }
    }

    if (evt.key === ' ') {
        for (let i = path.length - 1; i >= 0; i--) {
            const parent = path[i];
            if (parent.child.type !== 'child') {
                continue;
            }
            const nw = parse('_')[0];
            nw.contents = { type: 'identifier', text: '' };
            const mp: Map = {};
            const nidx = toMCST(nw, mp);
            const pnode = store.map[parent.idx];
            mp[parent.idx] = {
                node: {
                    ...pnode.node,
                    contents: modChildren(pnode.node.contents, (items) => {
                        items.splice(parent.child.at + 1, 0, nidx);
                    }),
                },
            };
            updateStore(
                store,
                {
                    map: mp,
                    selection: {
                        idx: nidx,
                    },
                },
                [path],
            );
            evt.preventDefault();
            return;
        }
    }

    // if (evt.key === ')') {
    // }

    if (evt.key === '(' || evt.key === '[' || evt.key === '{') {
        for (let i = path.length - 1; i >= 0; i--) {
            const parent = path[i];
            if (parent.child.type !== 'child') {
                continue;
            }
            const nw = parse(
                evt.key === '(' ? '()' : evt.key === '[' ? '[]' : '{}',
            )[0];

            if (evt.currentTarget.textContent === '') {
                nw.loc.idx = idx;
            }

            const mp: Map = {};
            toMCST(nw, mp);
            const pnode = store.map[parent.idx];
            mp[parent.idx] = {
                node: {
                    ...pnode.node,
                    contents: modChildren(pnode.node.contents, (items) => {
                        if (idx === nw.loc.idx) {
                            items[parent.child.at] = nw.loc.idx;
                        } else {
                            items.splice(parent.child.at + 1, 0, nw.loc.idx);
                        }
                        return items;
                    }),
                },
            };
            updateStore(
                store,
                {
                    map: mp,
                    selection: { idx: nw.loc.idx, side: 'inside' },
                },
                [path],
            );
            evt.preventDefault();
            return;
        }
    }

    if (evt.key === 'ArrowRight' && isAtEnd(evt.currentTarget)) {
        evt.preventDefault();
        events.onRight();
    }
    if (evt.key === 'ArrowLeft' && isAtStart(evt.currentTarget)) {
        evt.preventDefault();
        events.onLeft();
    }
};

export const isAtStart = (node: HTMLSpanElement) => {
    const sel = window.getSelection()!;
    if (sel.rangeCount > 1 || !sel.isCollapsed) {
        return false;
    }
    return getPos(node) === 0;
};

const getPos = (target: HTMLElement) => {
    const sel = document.getSelection()!;
    const r = sel.getRangeAt(0).cloneRange();
    sel.extend(target, 0);
    const pos = sel.toString().length;
    sel.removeAllRanges();
    sel.addRange(r);
    return pos;
};

export const isAtEnd = (node: HTMLSpanElement) => {
    return getPos(node) === node.textContent?.length;
};

export const nodeChildren = (node: NodeContents) => {
    switch (node.type) {
        case 'array':
        case 'list':
        case 'record':
            return node.values;
    }
    return [];
};

export const modChildren = (
    node: MNodeContents,
    fn: (children: number[]) => void,
) => {
    switch (node.type) {
        case 'array':
        case 'list':
        case 'record':
            const values = node.values.slice();
            fn(values);
            return { ...node, values };
    }
    return node;
};

export const rmChild = (
    node: MNodeContents,
    at: number,
): { contents: MNodeContents; nidx: number | null } => {
    switch (node.type) {
        case 'record':
        case 'array':
        case 'list': {
            const values = node.values.slice();
            values.splice(at, 1);
            const nidx = values.length > 0 ? values[Math.max(0, at - 1)] : null;
            return { contents: { ...node, values }, nidx };
        }
    }
    return { contents: node, nidx: null };
};
