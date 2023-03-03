import * as React from 'react';
import {
    ListLikeContents,
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
import { focus, Top, useMenuStuff } from './IdentifierLike';
import { getPos, onKeyDown } from '../mods/onKeyDown';
import { nidx, parse } from '../../src/grammar';

export const RecordText = ({
    idx,
    path,
    events,
    top,
}: {
    idx: number;
    path: Path[];
    events: Events;
    top: Top;
}) => {
    const { store, ctx, setHover } = top;
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

    const { menuItems, menuSelection, setMenuSelection } = useMenuStuff(
        editing,
        ctx,
        idx,
        store,
        top.menuPortal,
        ref,
    );

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
                        path[path.length - 2],
                        last.idx,
                        last.child.at - 1,
                        store,
                        ctx,
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

export const replacePath = (
    parent: Path,
    newIdx: number,
    store: Store,
): UpdateMap => {
    const map: UpdateMap = {};
    const pnode = store.map[parent.idx];
    switch (parent.child.type) {
        case 'child': {
            const values = (pnode as ListLikeContents).values.slice();
            values[parent.child.at] = newIdx;
            map[parent.idx] = {
                ...(pnode as ListLikeContents & MNodeExtra),
                values,
            };
            break;
        }
        case 'expr': {
            const templates = (pnode as MCString).templates.slice();
            templates[parent.child.at] = {
                ...templates[parent.child.at],
                expr: newIdx,
            };
            map[parent.idx] = {
                ...(pnode as MCString & MNodeExtra),
                templates,
            };
            break;
        }
        default:
            throw new Error(
                `Can't replace parent. . is this a valid place for an expr?`,
            );
    }
    return map;
};

export const joinExprs = (
    grandParent: Path,
    parentIdx: number,
    itemIdx: number,
    store: Store,
    ctx: EvalCtx,
    remaining: string,
): {
    map: UpdateMap;
    selection: Selection;
} => {
    const node = store.map[parentIdx] as WithLoc<MCRecordAccess>;
    const map: UpdateMap = {};
    map[node.items[itemIdx]] = null;

    if (node.items.length === 1) {
        Object.assign(map, replacePath(grandParent, node.target, store));
    } else {
        const items = node.items;
        items.splice(itemIdx, 1);
        map[parentIdx] = {
            ...node,
            items,
        };
    }

    const prev = itemIdx > 0 ? node.items[itemIdx - 1] : node.target;

    const prevs = store.map[prev] as (accessText | Identifier) & MNodeExtra;
    let prevText = prevs.text;
    if (prevs.type === 'identifier' && remaining.length) {
        const idText = ctx.ctx.display[prev]?.style;
        if (idText?.type === 'id' && idText.text) {
            prevText = idText.text;
            console.log('got it', prevText);
        } else {
            console.log('no display sad', ctx.ctx.display, prev);
        }
    }
    map[prev] = {
        ...prevs,
        text: prevText + remaining,
    };
    if (prevs.type === 'identifier' && remaining.length) {
        (map[prev] as Identifier).hash = undefined;
    }

    return {
        map,
        selection: {
            idx: prev,
            loc: remaining.length ? prevText.length : 'end',
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
