import * as React from 'react';
import {
    Map,
    MCString,
    MNode,
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
import { Loc, stringText } from '../../src/types/cst';
import { focus, Top } from './IdentifierLike';
import { getPos, onKeyDown } from '../mods/old/onKeyDown';
import { nidx, parse } from '../../src/grammar';
import { replacePath } from './RecordText';

export const StringText = ({
    idx,
    // node,
    path,
    events,
    top,
}: {
    idx: number;
    // node: MNode;
    top: Top;
    path: Path[];
    events: Events;
}) => {
    const node = useStore(top.store, idx);
    return (
        <StringText2
            idx={idx}
            path={path}
            events={events}
            top={top}
            node={node}
        />
    );
};

export const StringText2 = ({
    idx,
    node,
    path,
    events,
    top,
}: {
    idx: number;
    node: MNode;
    top: Top;
    path: Path[];
    events: Events;
}) => {
    const { store, ctx, setHover } = top;
    const text = (node as stringText).text;
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
                color: 'yellow',
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
                        type: 'stringText',
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
                color: 'yellow',
                whiteSpace: 'pre-wrap',
                outline: 'none',
                minHeight: '1.3em',
                textDecoration: dec,
                ...style,
            }}
            onKeyDown={(evt) => {
                if (evt.key === '{') {
                    maybeAddExpression(evt, edit!, path, store, idx, presel);
                    return;
                }
                if (
                    evt.key === 'Backspace' &&
                    getPos(evt.currentTarget) === 0
                ) {
                    const last = path[path.length - 1];
                    if (last.child.type !== 'text') {
                        return;
                    }
                    evt.preventDefault();
                    if (last.child.at === 0) {
                        if (evt.currentTarget.textContent! !== '') {
                            return events.onLeft();
                        }
                        const parent = store.map[last.idx] as MCString;
                        if (parent.templates.length !== 0) {
                            return events.onLeft();
                        }
                        const n = nidx();
                        const map = replacePath(
                            path[path.length - 2],
                            n,
                            store,
                        );
                        map[n] = {
                            type: 'blank',
                            loc: { idx: n, start: 0, end: 0 },
                        };
                        updateStore(store, { map, selection: { idx: n } });
                        return;
                    }
                    const { map, selection } = joinExprs(
                        last.idx,
                        last.child.at - 1,
                        store,
                        edit!,
                    );
                    updateStore(store, {
                        map,
                        selection,
                        prev: { idx, loc: presel.current ?? undefined },
                    });
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

const joinExprs = (
    idx: number,
    templateIdx: number,
    store: Store,
    remaining: string,
): {
    map: UpdateMap;
    selection: Selection;
} => {
    const node = store.map[idx] as WithLoc<MCString>;
    const map: UpdateMap = {};
    const template = node.templates[templateIdx];
    // TODO: Remove an expr (deeply pleaseee)
    map[template.expr] = null;
    map[template.suffix] = null;
    const templates = node.templates;
    templates.splice(templateIdx, 1);

    map[idx] = {
        ...node,
        templates,
    };

    const prev =
        templateIdx > 0 ? templates[templateIdx - 1].suffix : node.first;

    const prevs = store.map[prev] as stringText & MNodeExtra;
    map[prev] = {
        ...prevs,
        text: prevs.text + remaining,
    };
    return {
        map,
        selection: {
            idx: prev,
            loc: prevs.text.length,
        },
    };
};

function maybeAddExpression(
    evt: React.KeyboardEvent<HTMLSpanElement>,
    edit: string,
    path: Path[],
    store: Store,
    idx: number,
    presel: React.MutableRefObject<number | null>,
) {
    const pos = getPos(evt.currentTarget);
    if (edit[pos - 1] !== '$') {
        console.log(`ok`, edit, pos, edit[pos - 1]);
        return;
    }
    const prefix = edit.slice(0, pos - 1);
    const suffix = edit.slice(pos);

    evt.preventDefault();

    const last = path[path.length - 1];
    const node = store.map[last.idx] as WithLoc<MCString>;
    let nw = parse('_')[0];
    nw = { type: 'identifier', text: '', loc: nw.loc };
    const mp: Map = {};
    const eidx = toMCST(nw, mp);
    const sidx = toMCST(
        {
            type: 'stringText',
            text: suffix,
            loc: { idx: nidx(), start: 0, end: 0 },
        },
        mp,
    );
    mp[idx] = {
        ...(store.map[idx] as stringText & MNodeExtra),
        text: prefix,
    };
    const templates = node.templates.slice();
    const ok = last.child.type === 'text' ? last.child.at : 0;
    templates.splice(ok, 0, { expr: eidx, suffix: sidx });
    mp[last.idx] = { ...node, templates };
    updateStore(store, {
        map: mp,
        selection: {
            idx: eidx,
            loc: 'start',
        },
        prev: {
            idx,
            loc: presel.current ?? undefined,
        },
    });
}
