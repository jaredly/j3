import * as React from 'react';
import { Map, MCString, toMCST } from '../src/types/mcst';
import {
    EvalCtx,
    Path,
    setSelection,
    Store,
    updateStore,
    useStore,
} from './store';
import { Events } from './Nodes';
import { SetHover } from './App';
import { Loc, stringText } from '../src/types/cst';
import { focus } from './IdentifierLike';
import { getPos, onKeyDown } from './onKeyDown';
import { nidx, parse } from '../src/grammar';

export const StringText = ({
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
    const { node } = useStore(store, idx);
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

    const dec = ctx.report.errors[idx]
        ? 'underline red'
        : // : ctx.report.types[idx] == null

          // ? 'underline gray'
          'none';

    const style = {};

    const ref = React.useRef(null as null | HTMLSpanElement);
    return !editing ? (
        <span
            // className="idlike"
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
                        node: {
                            type: 'stringText',
                            loc: node.loc,
                            text,
                        },
                    },
                };
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
                // onInput(evt, setEdit, idx, path, store, presel);
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
                    evt.key === 'ArrowLeft' ||
                    evt.key === 'ArrowRight' ||
                    evt.metaKey ||
                    evt.altKey ||
                    evt.ctrlKey
                ) {
                    onKeyDown(evt, idx, path, events, store);
                    return;
                }
            }}
        />
    );
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
    const node = store.map[last.idx].node as MCString & {
        loc: Loc;
    };
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
        node: {
            ...(store.map[idx].node as stringText),
            text: prefix,
        },
    };
    mp[last.idx] = {
        node: {
            ...node,
            templates: [
                ...node.templates,
                {
                    expr: eidx,
                    suffix: sidx,
                },
            ],
        },
    };
    updateStore(
        store,
        {
            map: mp,
            selection: {
                idx: eidx,
                loc: 'start',
            },
            prev: {
                idx,
                loc: presel.current ?? undefined,
            },
        },
        [path],
    );
}
