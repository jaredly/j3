import * as React from 'react';
import { Map, MNode, MNodeContents, toMCST } from '../src/types/mcst';
import { EvalCtx, Path, setSelection, Store, updateStore } from './store';
import { Events } from './Nodes';
import { parse } from '../src/grammar';
import { Node } from '../src/types/cst';
import { getPos, onKeyDown, setPos } from './onKeyDown';
import { SetHover } from './App';

export const IdentifierLike = ({
    idx,
    type,
    text,
    store,
    path,
    events,
    ctx,
    setHover,
}: {
    type: MNodeContents['type'];
    text: string;
    idx: number;
    store: Store;
    path: Path[];
    events: Events;
    ctx: EvalCtx;
    setHover: SetHover;
}) => {
    const editing = store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);

    edit = edit == null ? text : edit;

    const presel = React.useRef(null as null | number);

    React.useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (editing) {
            ref.current.textContent = text;
            if (ref.current !== document.activeElement || true) {
                focus(ref.current, store);
            }
            presel.current = getPos(ref.current);
        }
    }, [editing, text, editing ? store.selection!.loc : null]);

    const dec = ctx.report.errors[idx]
        ? 'underline red'
        : // : ctx.report.types[idx] == null
          // ? 'underline gray'
          'none';

    const style =
        ctx.ctx.styles[idx] === 'italic'
            ? {
                  fontStyle: 'italic',
                  fontFamily: 'serif',
                  color: '#84a4a5',
              }
            : {};

    const ref = React.useRef(null as null | HTMLSpanElement);
    return !editing ? (
        <span
            className="idlike"
            style={{
                color: nodeColor(edit, type),
                minHeight: '1.3em',
                whiteSpace: 'pre-wrap',
                textDecoration: dec,
                ...style,
            }}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                setEdit(text);
                setSelection(store, { idx });
            }}
            onMouseOver={(evt) =>
                setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseLeave={() => setHover({ idx, box: null })}
        >
            {text}
        </span>
    ) : (
        <span
            data-idx={idx}
            contentEditable
            ref={ref}
            className="idlike"
            onMouseDown={(evt) => evt.stopPropagation()}
            onMouseOver={(evt) =>
                setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseUp={(evt) => {
                presel.current = getPos(evt.currentTarget);
            }}
            onMouseLeave={() => setHover({ idx, box: null })}
            onInput={(evt) => {
                onInput(evt, setEdit, idx, path, store, presel);
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(store, null);
            }}
            style={{
                color: nodeColor(edit, type),
                whiteSpace: 'pre-wrap',
                outline: 'none',
                minHeight: '1.3em',
                textDecoration: dec,
                ...style,
            }}
            onKeyDown={(evt) => {
                onKeyDown(evt, idx, path, events, store);
            }}
        />
    );
};

const nodeColor = (text: string, type: MNodeContents['type']) => {
    if (text.startsWith(':')) {
        return colors[':'];
    }
    if (colors[text]) {
        return colors[text];
    }
    return colors[type];
};

export const colors: {
    [key: string]: string;
} = {
    identifier: '#5bb6b7',
    comment: '#616162',
    tag: '#82f682',
    number: '#4848a5',
    unparsed: 'red',
    ':': 'orange',
};

const ops = ['+', '-', '*', '/', '==', '<', '>', '<=', '>=', '!=', ','];
ops.forEach((op) => (colors[op] = '#c9cac9'));

const kwds = ['let', 'def', 'defn', 'fn', 'deftype', 'if', 'switch'];
kwds.forEach((kwd) => (colors[kwd] = '#df4fa2'));

function focus(node: HTMLSpanElement, store: Store) {
    node.focus();
    if (!store.selection) {
        return;
    }
    if (typeof store.selection!.loc === 'number') {
        setPos(node, store.selection!.loc);
        store.selection = { idx: store.selection!.idx, loc: undefined };
        return;
    }
    switch (store.selection!.loc) {
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
        case 'end':
            const sel = window.getSelection()!;
            sel.selectAllChildren(node);
            sel.collapseToEnd();
            break;
    }
    store.selection!.loc = undefined;
}

function onInput(
    evt: React.FormEvent<HTMLSpanElement>,
    setEdit: React.Dispatch<React.SetStateAction<string | null>>,
    idx: number,
    path: Path[],
    store: Store,
    presel: { current: number | null },
) {
    const text = evt.currentTarget.textContent ?? '';
    setEdit(text);
    const pos = getPos(evt.currentTarget);

    let nw: Node;
    try {
        const parsed = parse(text);
        nw = {
            ...parsed[0],
            loc: { ...parsed[0].loc, idx },
        };
    } catch (err) {
        nw = {
            ...(text.length === 0
                ? { type: 'identifier', text: '' }
                : {
                      type: 'unparsed',
                      raw: text,
                  }),
            // decorators: {},
            loc: { start: 0, end: text.length, idx },
        };
    }

    const mp: Map = {};
    toMCST(nw, mp);
    updateStore(
        store,
        {
            map: mp,
            selection: {
                idx,
                loc: pos,
            },
            prev: {
                idx,
                loc: presel.current ?? undefined,
            },
        },
        [path],
    );
}
