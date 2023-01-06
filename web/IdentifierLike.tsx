import * as React from 'react';
import { Map, MNode, MNodeContents, toMCST } from '../src/types/mcst';
import { Path, setSelection, Store, UpdateMap, updateStore } from './store';
import { Events } from './Nodes';
import { parse } from '../src/grammar';
import { Node } from '../src/types/cst';

export const IdentifierLike = ({
    idx,
    type,
    text,
    store,
    path,
}: {
    type: MNodeContents['type'];
    text: string;
    idx: number;
    store: Store;
    path: Path[];
    events: Events;
}) => {
    const editing = store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);

    // React.useEffect(() => {
    //     const current =
    // }, [edit])

    edit = edit == null ? text : edit;

    React.useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (editing) {
            ref.current.textContent = text;
            if (ref.current !== document.activeElement) {
                ref.current.focus();
                switch (store.selection!.side) {
                    case 'end': {
                        const sel = window.getSelection()!;
                        sel.selectAllChildren(ref.current);
                        sel.collapseToEnd();
                        break;
                    }
                    case 'start': {
                        const sel = window.getSelection()!;
                        sel.selectAllChildren(ref.current);
                        sel.collapseToStart();
                        break;
                    }
                    case 'change': {
                        const sel = window.getSelection()!;
                        sel.selectAllChildren(ref.current);
                        break;
                    }
                }
            }
        }
    }, [editing, text]);

    const ref = React.useRef(null as null | HTMLSpanElement);
    if (!editing) {
        return (
            <span
                className="hover"
                style={{
                    color: colors[type],
                    // color: pathColor(
                    //     path.concat([{ idx, cid: 0, punct: 0 }]),
                    //     store,
                    // ),
                    minHeight: '1.5em',
                    // backgroundColor: 'rgba(255, 255, 0, 0.05)',
                }}
                onMouseDown={(evt) => {
                    setEdit(text);
                    setSelection(store, { idx });
                }}
            >
                {text}
            </span>
        );
    }
    return (
        <span
            data-idx={idx}
            contentEditable
            ref={ref}
            className="hover"
            onInput={(evt) => {
                const text = evt.currentTarget.textContent!;
                setEdit(text);
                try {
                    const parsed = parse(text);
                    if (parsed.length === 1) {
                        const nw = {
                            ...parsed[0],
                            loc: { ...parsed[0].loc, idx },
                        };
                        const mp: Map = {};
                        toMCST(nw, mp);
                        updateStore(store, { map: mp });
                    } else {
                        // TODO remove it
                        // and like update the parent pls
                    }
                } catch (err) {
                    const nw: Node = {
                        contents: {
                            type: 'unparsed',
                            raw: text,
                        },
                        decorators: {},
                        loc: { start: 0, end: text.length, idx },
                    };
                    const mp: Map = {};
                    toMCST(nw, mp);
                    updateStore(store, { map: mp });
                }
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(store, null);
            }}
            style={{
                color: colors[type],
                outline: 'none',
                minHeight: '1.5em',
            }}
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    evt.preventDefault();
                    // commit();
                    return;
                }
                if (evt.key === 'Backspace') {
                    if (evt.currentTarget.textContent === '') {
                        const parent = path[path.length - 1];
                        if (parent.child.type === 'child') {
                            const mp: UpdateMap = {};
                            const pnode = store.map[parent.idx];
                            const { contents, nidx } = rmChild(
                                pnode.contents,
                                parent.child.at,
                            );
                            mp[parent.idx] = {
                                ...pnode,
                                contents,
                            };
                            updateStore(store, {
                                map: mp,
                                selection:
                                    nidx != null
                                        ? {
                                              idx: nidx,
                                              side: 'end',
                                          }
                                        : null,
                            });
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
                            ...pnode,
                            contents: addChild(
                                pnode.contents,
                                parent.child.at + 1,
                                nidx,
                            ),
                        };
                        updateStore(store, {
                            map: mp,
                            selection: {
                                idx: nidx,
                            },
                        });
                        evt.preventDefault();
                        return;
                    }
                }
                // if (keyHandlers[evt.key]) {
                //     const res = handleKey(
                //         store,
                //         path.concat([{ idx, cid: 0, punct: 0 }]),
                //         evt.key,
                //         evt.currentTarget.textContent!,
                //     );
                //     if (res !== false) {
                //         evt.preventDefault();
                //         evt.stopPropagation();
                //     }
                //     return;
                // }
                // if (
                //     evt.key === 'ArrowRight' &&
                //     getSelection()?.toString() === '' &&
                //     getPos(evt.currentTarget) ===
                //         evt.currentTarget.textContent!.length
                // ) {
                //     evt.preventDefault();
                //     evt.stopPropagation();
                //     const right = goRight(store, path);
                //     // console.log(`going right`, right);
                //     if (right) {
                //         setSelection(store, right.sel);
                //     }
                // }
                // if (
                //     evt.key === 'ArrowLeft' &&
                //     getSelection()?.toString() === '' &&
                //     getPos(evt.currentTarget) === 0
                // ) {
                //     evt.preventDefault();
                //     evt.stopPropagation();
                //     const left = goLeft(store, path);
                //     // console.log(`going left`, left);
                //     if (left) {
                //         setSelection(store, left.sel);
                //     }
                // }
            }}
        />
    );
};

const addChild = (node: MNodeContents, at: number, idx: number) => {
    switch (node.type) {
        case 'array':
        case 'list':
            const values = node.values.slice();
            values.splice(at, 0, idx);
            return { ...node, values };
        case 'record':
            const items = node.items.slice();
            items.splice(at, 0, idx);
            return { ...node, items };
    }
    return node;
};

const rmChild = (
    node: MNodeContents,
    at: number,
): { contents: MNodeContents; nidx: number | null } => {
    switch (node.type) {
        case 'array':
        case 'list': {
            const values = node.values.slice();
            values.splice(at, 1);
            const nidx = values.length > 0 ? values[Math.max(0, at - 1)] : null;
            return { contents: { ...node, values }, nidx };
        }
        case 'record': {
            const items = node.items.slice();
            items.splice(at, 1);
            const nidx = items.length > 0 ? items[Math.max(0, at - 1)] : null;
            return { contents: { ...node, items }, nidx };
        }
    }
    return { contents: node, nidx: null };
};

export const colors: {
    [key in MNodeContents['type']]: string;
} = {
    identifier: '#5bb6b7',
    tag: '#82f682',
    number: '#4848a5',
    unparsed: 'red',
    // lol
    ...({} as any),
};
