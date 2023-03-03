import * as React from 'react';
import {
    Map,
    MCRecordAccess,
    MCString,
    MNodeExtra,
    toMCST,
    WithLoc,
} from '../../src/types/mcst';
import {
    EvalCtx,
    Path,
    setSelection,
    Store,
    UpdateMap,
    updateStore,
    useStore,
    Selection,
} from '../store';
import { Events } from './Nodes';
import { SetHover } from './Doc';
import { accessText, Identifier, Loc, Node } from '../../src/types/cst';
import { focus } from './IdentifierLike';
import { getPos, onKeyDown } from '../mods/onKeyDown';
import { nidx, parse } from '../../src/grammar';

export const RecordText = ({
    idx,
    store,
    path,
    events,
    ctx,
    setHover,
}: {
    idx: number;
    store: Store;
    path: Path[];
    events: Events;
    ctx: EvalCtx;
    setHover: SetHover;
}) => {
    const node = useStore(store, idx);
    const text = (node as accessText).text;
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

    const dec = ctx.report.errors[idx] ? 'underline red' : 'none';

    const style = {};

    const ref = React.useRef(null as null | HTMLSpanElement);
    return !editing ? (
        <span
            style={{
                color: '#00ff58',
                minHeight: '1.3em',
                whiteSpace: 'pre-wrap',
                textDecoration: dec,
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
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
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
                const text = evt.currentTarget.textContent ?? '';
                setEdit(text);
                const pos = getPos(evt.currentTarget);
                const mp: Map = {
                    [node.loc.idx]: {
                        type: 'accessText',
                        loc: node.loc,
                        text,
                    },
                };
                updateStore(store, {
                    map: mp,
                    selection: {
                        idx,
                        loc: pos,
                    },
                    prev: {
                        idx,
                        loc: presel.current ?? undefined,
                    },
                });
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(store, null);
            }}
            style={{
                color: '#00ff58',
                whiteSpace: 'pre-wrap',
                outline: 'none',
                minHeight: '1.3em',
                textDecoration: dec,
                ...style,
            }}
            onKeyDown={(evt) => {
                if (evt.key === '.') {
                    splitAttr(evt, edit!, path, store, idx, presel);
                    return;
                }
                if (
                    evt.key === 'Backspace' &&
                    getPos(evt.currentTarget) === 0
                ) {
                    const last = path[path.length - 1];
                    if (last.child.type !== 'attribute') {
                        console.log('idkno');
                        return;
                    }
                    const { map, selection } = joinExprs(
                        last.idx,
                        last.child.at - 1,
                        store,
                        edit!,
                    );
                    evt.preventDefault();
                    updateStore(store, {
                        map,
                        selection,
                        prev: { idx, loc: presel.current ?? undefined },
                    });
                    return;
                }
                if (
                    evt.key === 'ArrowLeft' ||
                    evt.key === 'ArrowRight' ||
                    evt.key === 'Tab' ||
                    evt.metaKey ||
                    evt.altKey ||
                    evt.ctrlKey
                ) {
                    onKeyDown(evt, idx, path, events, store, ctx);
                    return;
                }
            }}
        />
    );
};

export const joinExprs = (
    parentIdx: number,
    itemIdx: number,
    store: Store,
    remaining: string,
): {
    map: UpdateMap;
    selection: Selection;
} => {
    console.log('joinplx');
    const node = store.map[parentIdx] as WithLoc<MCRecordAccess>;
    const map: UpdateMap = {};
    map[node.items[itemIdx]] = null;
    const items = node.items;
    items.splice(itemIdx, 1);

    map[parentIdx] = {
        ...node,
        items,
    };

    const prev = itemIdx > 0 ? items[itemIdx - 1] : node.target;

    const prevs = store.map[prev] as (accessText | Identifier) & MNodeExtra;
    map[prev] = {
        ...prevs,
        text: prevs.text + remaining,
    };
    // console.log(prevs, map[prev], remaining);
    return {
        map,
        selection: {
            idx: prev,
            loc: prevs.text.length,
        },
    };
};

function splitAttr(
    evt: React.KeyboardEvent<HTMLSpanElement>,
    edit: string,
    path: Path[],
    store: Store,
    idx: number,
    presel: React.MutableRefObject<number | null>,
) {
    const pos = getPos(evt.currentTarget);
    const prefix = edit.slice(0, pos);
    const suffix = edit.slice(pos);

    evt.preventDefault();

    const last = path[path.length - 1];
    const node = store.map[last.idx] as WithLoc<MCRecordAccess>;
    let nw: Node = {
        type: 'accessText',
        text: suffix,
        loc: { start: 0, end: 0, idx: nidx() },
    };
    const mp: Map = {};
    const eidx = toMCST(nw, mp);
    mp[idx] = {
        ...(store.map[idx] as accessText & MNodeExtra),
        text: prefix,
    };
    const items = node.items.slice();
    const loc = last.child.type === 'attribute' ? last.child.at : 0;
    items.splice(loc, 0, eidx);
    mp[last.idx] = { ...node, items };
    updateStore(store, {
        map: mp,
        selection: {
            idx: eidx,
            loc: 'start',
        },
        prev: { idx, loc: presel.current ?? undefined },
    });
}
