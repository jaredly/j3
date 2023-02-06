import * as React from 'react';
import {
    ListLikeContents,
    Map,
    MNodeContents,
    toMCST,
} from '../../src/types/mcst';
import {
    Path,
    redo,
    setSelection,
    Store,
    undo,
    UpdateMap,
    updateStore,
} from '../store';
import { parse } from '../../src/grammar';
import { CString, Loc, NodeContents } from '../../src/types/cst';
import { Events } from '../Nodes';
import { handleBackspace } from './handleBackspace';
import { handleSpace } from './handleSpace';

export const onKeyDown = (
    evt: React.KeyboardEvent<HTMLSpanElement>,
    idx: number,
    path: Path[],
    events: Events,
    store: Store,
) => {
    if (evt.key === ':') {
        evt.preventDefault();
        let tannot = store.map[idx].node.tannot;
        if (tannot != null) {
            return setSelection(store, { idx: tannot, loc: 'start' });
        }
        for (let i = path.length - 1; i >= 0; i--) {
            let tannot = store.map[path[i].idx].node.tannot;
            if (tannot != null) {
                return setSelection(store, { idx: tannot, loc: 'start' });
            }
        }
        return;
        // assume we're going to the thing
        // if (node.tannot) {
        // }
    }

    if (evt.key === 'Tab') {
        evt.preventDefault();
        const last = path[path.length - 1];
        if (last.child.type === 'text') {
            // if there's an expr after us, go to their start
            // otherwise, go to the end of the containing string
            setSelection(store, { idx: last.idx, loc: 'end' });
            return;
        }
    }

    if (evt.key === 'z' && (evt.ctrlKey || evt.metaKey)) {
        evt.preventDefault();
        return evt.shiftKey ? redo(store) : undo(store);
    }

    if (evt.key === 'Backspace' && path.length) {
        return handleBackspace(evt, idx, path, events, store);
    }

    const isComment = store.map[idx].node.type === 'comment';

    if ((evt.key === ' ' && !isComment) || evt.key === 'Enter') {
        return handleSpace(evt, idx, path, events, store);
    }

    if (evt.currentTarget.textContent === '' && evt.key === '"') {
        evt.preventDefault();
        const nw = parse('""')[0] as CString & { loc: Loc };
        nw.loc.idx = idx;
        const mp: Map = {};
        toMCST(nw, mp);
        updateStore(
            store,
            { map: mp, selection: { idx: nw.first.loc.idx, loc: 'start' } },
            [path],
        );
        evt.preventDefault();
        return;
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
        return wrapWithParens(evt, path, idx, store);
    }

    if (evt.key === '(' || evt.key === '[' || evt.key === '{') {
        return newListLike(evt, path, idx, store);
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

function newListLike(
    evt: React.KeyboardEvent<HTMLSpanElement>,
    path: Path[],
    idx: number,
    store: Store,
) {
    const last = path[path.length - 1];
    if (evt.currentTarget.textContent === '' && last.child.type === 'child') {
        const mp: UpdateMap = {};
        const nw = parse(
            evt.key === '(' ? '()' : evt.key === '[' ? '[]' : '{}',
        )[0];
        nw.loc.idx = idx;
        toMCST(nw, mp);
        updateStore(
            store,
            { map: mp, selection: { idx: nw.loc.idx, loc: 'inside' } },
            [path],
        );
        evt.preventDefault();
        return;
    }

    const overwrite =
        evt.currentTarget.textContent === '' && last.child.type === 'child';

    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];

        if (parent.child.type !== 'child' && parent.child.type !== 'inside') {
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
                    } else if (
                        last.child.type === 'start' &&
                        child.type === 'child'
                    ) {
                        (mp[nw.loc.idx].node as ListLikeContents).values = [
                            items[child.at],
                        ];
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

function wrapWithParens(
    evt: React.KeyboardEvent<HTMLSpanElement>,
    path: Path[],
    idx: number,
    store: Store,
) {
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
        updateStore(store, { map: mp, selection: { idx, loc: 'end' } }, [path]);
    }
    return;
}
