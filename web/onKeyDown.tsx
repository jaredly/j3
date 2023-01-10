import * as React from 'react';
import {
    ListLikeContents,
    Map,
    MNodeContents,
    toMCST,
} from '../src/types/mcst';
import {
    Path,
    redo,
    setSelection,
    Store,
    undo,
    UpdateMap,
    updateStore,
} from './store';
import { parse } from '../src/grammar';
import { NodeContents } from '../src/types/cst';
import { Events } from './Nodes';

export const onKeyDown = (
    evt: React.KeyboardEvent<HTMLSpanElement>,
    idx: number,
    path: Path[],
    events: Events,
    store: Store,
) => {
    // if (evt.key === 'Enter') {
    //     evt.preventDefault();
    //     // TODO decide what to do here
    //     return;
    // }
    if (evt.key === 'z' && (evt.ctrlKey || evt.metaKey)) {
        evt.preventDefault();
        return evt.shiftKey ? redo(store) : undo(store);
    }

    if (evt.key === 'Backspace' && path.length) {
        const parent = path[path.length - 1];
        if (parent.child.type === 'start') {
            const gp = path[path.length - 2];
            if (gp.child.type === 'child' && gp.child.at > 0) {
                const children = mnodeChildren(store.map[gp.idx].node);
                const prev = children[gp.child.at - 1];
                const pnode = store.map[prev].node;
                if (pnode.type === 'identifier' && pnode.text === '') {
                    const values = children.slice();
                    values.splice(gp.child.at - 1, 1);
                    const mp: UpdateMap = {
                        [prev]: null,
                        [gp.idx]: {
                            ...store.map[gp.idx],
                            node: {
                                ...store.map[gp.idx].node,
                                ...{
                                    type: store.map[gp.idx].node
                                        .type as ListLikeContents['type'],
                                    values,
                                },
                            },
                        },
                    };
                    updateStore(store, { map: mp }, [path]);
                    evt.preventDefault();
                    return;
                }
            }

            evt.preventDefault();
            events.onLeft();
            return;
        }

        if (parent.child.type === 'inside' || parent.child.type === 'end') {
            // change the thing to an empty identifier prolly
            const mp: Map = {
                [idx]: {
                    ...store.map[idx],
                    node: {
                        ...store.map[idx].node,
                        ...{ type: 'identifier', text: '' },
                    },
                },
            };
            updateStore(store, { map: mp }, [path]);
            evt.preventDefault();
            return;
        }

        if (parent.child.type === 'child') {
            if (evt.currentTarget.textContent === '') {
                const mp: UpdateMap = {};
                const pnode = store.map[parent.idx];
                const res = rmChild(pnode.node, parent.child.at);
                if (!res) {
                    return;
                }
                const { contents, nidx } = res;
                if (contents.values.length === 0) {
                    mp[parent.idx] = {
                        node: {
                            ...pnode.node,
                            ...{ type: 'identifier', text: '' },
                        },
                    };
                    updateStore(
                        store,
                        {
                            map: mp,
                            selection: {
                                idx: parent.idx,
                            },
                        },
                        [path],
                    );
                    evt.preventDefault();
                    return;
                }
                mp[parent.idx] = { node: { ...pnode.node, ...contents } };
                updateStore(
                    store,
                    {
                        map: mp,
                        selection:
                            nidx != null
                                ? { idx: nidx, loc: 'end' }
                                : { idx: parent.idx, loc: 'start' },
                    },
                    [path],
                );
                evt.preventDefault();
            } else if (isAtStart(evt.currentTarget)) {
                // Can we merge with the previous child?
                // if so, go for it, otherwise just goLeft
                events.onLeft();
                evt.preventDefault();
            }
        }
    }

    const isComment = store.map[idx].node.type === 'comment';

    if ((evt.key === ' ' && !isComment) || evt.key === 'Enter') {
        const parent = path[path.length - 1];
        if (parent.child.type === 'start') {
            const gp = path[path.length - 2];
            if (gp.child.type === 'child') {
                const child = gp.child;
                let nw = parse('_')[0];
                nw = { type: 'identifier', text: '', loc: nw.loc };
                const mp: Map = {};
                const nidx = toMCST(nw, mp);
                const pnode = store.map[gp.idx];
                mp[gp.idx] = {
                    node: {
                        ...pnode.node,
                        ...modChildren(pnode.node, (items) => {
                            items.splice(child.at, 0, nidx);
                        }),
                    },
                };
                updateStore(store, { map: mp }, [path]);
                evt.preventDefault();
                return;
            }
        }
        for (let i = path.length - 1; i >= 0; i--) {
            const parent = path[i];
            if (parent.child.type !== 'child') {
                continue;
            }
            const child = parent.child;
            let nw = parse('_')[0];
            nw = { type: 'identifier', text: '', loc: nw.loc };
            const mp: Map = {};
            const nidx = toMCST(nw, mp);
            const pnode = store.map[parent.idx];
            mp[parent.idx] = {
                node: {
                    ...pnode.node,
                    ...modChildren(pnode.node, (items) => {
                        items.splice(child.at + 1, 0, nidx);
                    }),
                },
            };
            updateStore(store, { map: mp, selection: { idx: nidx } }, [path]);
            evt.preventDefault();
            return;
        }
    }

    if (evt.key === ')' || evt.key === ']' || evt.key === '}') {
        evt.preventDefault();
        const looking = { ')': 'list', ']': 'array', '}': 'record' }[evt.key];
        for (let i = path.length - 1; i >= 0; i--) {
            const parent = path[i];
            if (parent.child.type === 'end') {
                continue;
            }
            const node = store.map[parent.idx].node;
            if (node.type === looking) {
                return setSelection(store, {
                    idx: parent.idx,
                    loc: 'end',
                });
            }
        }
    }

    if (evt.key === '·' || (evt.key === '(' && evt.altKey)) {
        evt.preventDefault();
        const parent = path[path.length - 1];
        if (parent.child.type === 'child') {
            const child = parent.child;
            const nw = parse('()')[0];
            const mp: Map = {};
            const nidx = toMCST(nw, mp);
            (mp[nw.loc.idx].node as ListLikeContents).values.push(idx);
            const pnode = store.map[parent.idx];
            mp[parent.idx] = {
                node: {
                    ...pnode.node,
                    ...modChildren(pnode.node, (items) => {
                        items.splice(child.at, 1, nidx);
                    }),
                },
            };
            updateStore(store, { map: mp, selection: { idx, loc: 'end' } }, [
                path,
            ]);
        }
        return;
    }

    if (evt.key === '(' || evt.key === '[' || evt.key === '{') {
        const overwrite =
            evt.currentTarget.textContent === '' &&
            path[path.length - 1].child.type === 'child';

        for (let i = path.length - 1; i >= 0; i--) {
            const parent = path[i];

            if (
                parent.child.type !== 'child' &&
                parent.child.type !== 'inside'
            ) {
                continue;
            }
            const child = parent.child;
            const nw = parse(
                evt.key === '(' ? '()' : evt.key === '[' ? '[]' : '{}',
            )[0];

            if (overwrite) {
                nw.loc.idx = idx;
            }

            const mp: Map = {};
            toMCST(nw, mp);
            const pnode = store.map[parent.idx];
            mp[parent.idx] = {
                node: {
                    ...pnode.node,
                    ...modChildren(pnode.node, (items) => {
                        if (overwrite && child.type === 'child') {
                            items[child.at] = nw.loc.idx;
                        } else {
                            items.splice(
                                child.type === 'child' ? child.at + 1 : 0,
                                0,
                                nw.loc.idx,
                            );
                        }
                        return items;
                    }),
                },
            };
            updateStore(
                store,
                { map: mp, selection: { idx: nw.loc.idx, loc: 'inside' } },
                [path],
            );
            evt.preventDefault();
            return;
        }
    }

    if (evt.key === 'ArrowRight' && isAtEnd(evt.currentTarget)) {
        evt.preventDefault();
        events.onRight();
        return;
    }
    if (evt.key === 'ArrowLeft' && isAtStart(evt.currentTarget)) {
        evt.preventDefault();
        events.onLeft();
        return;
    }
};

export const isAtStart = (node: HTMLSpanElement) => {
    const sel = window.getSelection()!;
    if (sel.rangeCount > 1 || !sel.isCollapsed) {
        return false;
    }
    return getPos(node) === 0;
};

/**
 * set caret position
 * @param {number} position - caret position
 */
export const setPos = (target: ChildNode, position: number) => {
    var selection = window.getSelection()!;
    let range = document.createRange();
    range.selectNode(target);
    range.setStart(target, 0);
    createRange(
        target,
        {
            count: position,
        },
        range,
    );
    if (range) {
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

export const createRange = (
    node: ChildNode,
    chars: { count: number },
    range: Range,
): boolean => {
    if (chars.count === 0) {
        range.setEnd(node, chars.count);
        return true;
    } else if (node && chars.count > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent!.length < chars.count) {
                chars.count -= node.textContent!.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
                return true;
            }
        } else {
            for (var lp = 0; lp < node.childNodes.length; lp++) {
                if (createRange(node.childNodes[lp], chars, range)) {
                    return true;
                }
            }
            if (node.nodeName === 'DIV') {
                chars.count--;
            }
        }
    }
    return false;
};

export const getPos = (target: HTMLElement) => {
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

export const mnodeChildren = (node: MNodeContents) => {
    switch (node.type) {
        case 'array':
        case 'list':
        case 'record':
            return node.values;
    }
    return [];
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
): { contents: ListLikeContents; nidx: number | null } | null => {
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
    return null;
};
