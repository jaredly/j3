import * as React from 'react';
import { Map, MNode, MNodeContents, toMCST } from '../src/types/mcst';
import { Path, setSelection, Store, updateStore } from './store';
import { Events } from './Nodes';
import { parse } from '../src/grammar';
import { Node } from '../src/types/cst';
import { onKeyDown } from './onKeyDown';

export const IdentifierLike = ({
    idx,
    type,
    text,
    store,
    path,
    events,
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
                focus(ref.current, store);
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
                    minHeight: '1.3em',
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
                onInput(evt, setEdit, idx, store);
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(store, null);
            }}
            style={{
                color: colors[type],
                outline: 'none',
                minHeight: '1.3em',
            }}
            onKeyDown={(evt) => {
                onKeyDown(evt, idx, path, events, store);
            }}
        />
    );
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

function focus(node: HTMLSpanElement, store: Store) {
    node.focus();
    switch (store.selection!.side) {
        case 'end': {
            const sel = window.getSelection()!;
            sel.selectAllChildren(node);
            sel.collapseToEnd();
            break;
        }
        case 'start': {
            const sel = window.getSelection()!;
            sel.selectAllChildren(node);
            sel.collapseToStart();
            break;
        }
        case 'change': {
            const sel = window.getSelection()!;
            sel.selectAllChildren(node);
            break;
        }
    }
}

function onInput(
    evt: React.FormEvent<HTMLSpanElement>,
    setEdit: React.Dispatch<React.SetStateAction<string | null>>,
    idx: number,
    store: Store,
) {
    const text = evt.currentTarget.textContent ?? '';
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
            throw new Error('unparseable?');
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
}
