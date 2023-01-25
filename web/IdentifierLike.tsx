import * as React from 'react';
import { Map, MNode, MNodeContents, toMCST } from '../src/types/mcst';
import { EvalCtx, Path, setSelection, Store, updateStore } from './store';
import { Events } from './Nodes';
import { parse } from '../src/grammar';
import { Node } from '../src/types/cst';
import { getPos, onKeyDown, setPos } from './mods/onKeyDown';
import { SetHover } from './Doc';
import { Root } from 'react-dom/client';
import { AutoCompleteResult, Ctx } from '../src/to-ast/Ctx';
import { Type } from '../src/types/ast';
import { compareScores, fuzzyScore } from '../src/to-ast/fuzzy';
import { allTerms } from '../src/to-ast/to-ast';
import { nodeForType } from '../src/to-cst/nodeForType';
import { makeRCtx } from '../src/to-cst/nodeForExpr';
import { nodeToString } from '../src/to-cst/nodeToString';

export type Top = {
    store: Store;
    ctx: EvalCtx;
    setHover: SetHover;
    menuPortal: React.RefObject<null | Root>;
};

type MenuState = {
    // pos: { top: number; left: number };
    items: { label: AutoCompleteResult; action: () => void }[];
    selection: number;
};

export const Menu = ({
    state,
    ctx,
    pos,
}: {
    state: MenuState;
    ctx: Ctx;
    pos: { left: number; top: number };
}) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: pos.top,
                zIndex: 2000,
                left: pos.left,
                backgroundColor: 'black',
                border: '1px solid white',
                display: 'grid',
                gridTemplateColumns: 'max-content max-content',
                gap: 4,
                padding: 8,
                alignItems: 'center',
            }}
        >
            {state.items.map((item, idx) => (
                <div
                    key={idx}
                    onClick={() => item.action()}
                    style={{
                        // display: 'flex',
                        // alignItems: 'center',
                        display: 'contents',
                    }}
                >
                    <div
                        style={{
                            marginRight: 4,
                        }}
                    >
                        {item.label.text}
                    </div>
                    <div style={{ fontSize: '80%', opacity: 0.5 }}>
                        {item.label.ann
                            ? nodeToString(
                                  nodeForType(item.label.ann, makeRCtx(ctx)),
                              )
                            : 'no type'}
                    </div>
                </div>
            ))}
        </div>
    );
};

const getMenuState = (
    store: Store,
    ctx: Ctx,
    idx: number,
    text: string,
): MenuState | null => {
    const display = ctx.display[idx];
    if (display?.autoComplete) {
        return {
            items: display.autoComplete.map((item) => ({
                label: item,
                action: () => {},
            })),
            selection: 0,
        };
    } else {
        return null;
    }
    // const node = store.map[idx].node;
    // if (node.type !== 'identifier') {
    //     return null;
    // }
    // if (text === 'defn') {
    //     return null;
    // }
    // const results = allTerms(ctx);
    // const withScores = results
    //     .map((result) => ({
    //         result,
    //         score: fuzzyScore(0, text, result.name),
    //     }))
    //     .filter(({ score }) => score.full)
    //     .sort((a, b) => compareScores(a.score, b.score));
    // return withScores.length
    //     ? {
    //           items: withScores.map(({ result }) => ({
    //               label: result.name,
    //               action: () => {
    //                   console.log(result);
    //               },
    //           })),
    //           selection: 0,
    //       }
    //     : null;
};

export const IdentifierLike = ({
    idx,
    type,
    text,
    path,
    events,
    top: { store, ctx, setHover, menuPortal },
}: {
    type: MNodeContents['type'];
    text: string;
    idx: number;
    path: Path[];
    events: Events;
    top: Top;
}) => {
    const editing = store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);

    const [menuState, setMenuState] = React.useState(
        getMenuState(store, ctx.ctx, idx, text) as null | MenuState,
    );

    React.useEffect(() => {
        if (!menuPortal.current || !editing || !ref.current) {
            return;
        }
        const box = ref.current.getBoundingClientRect();
        const pos = { left: box.left, top: box.bottom };
        menuPortal.current.render(
            menuState ? (
                <Menu state={menuState} ctx={ctx.ctx} pos={pos} />
            ) : null,
        );
    }, [menuState, editing]);

    React.useEffect(() => {
        if (editing) {
            // return () => menuPortal.current?.render(null);
        }
    }, [editing]);

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

    const style =
        ctx.ctx.display[idx]?.style === 'italic'
            ? {
                  fontStyle: 'italic',
                  fontFamily: 'serif',
                  color: '#84a4a5',
              }
            : ctx.ctx.display[idx]?.style === 'bold'
            ? {
                  fontVariationSettings: '"wght" 500',
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
            onSelect={(evt) => {
                presel.current = getPos(evt.currentTarget);
            }}
            onMouseLeave={() => setHover({ idx, box: null })}
            onInput={(evt) => {
                onInput(evt, setEdit, idx, path, store, presel);
                setMenuState(
                    getMenuState(
                        store,
                        ctx.ctx,
                        idx,
                        evt.currentTarget.textContent!,
                    ),
                );
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
                if (events.onKeyDown && events.onKeyDown(evt)) {
                    // it's been handled
                    return;
                }
                onKeyDown(evt, idx, path, events, store);
            }}
        />
    );
};

const nodeColor = (text: string, type: MNodeContents['type']) => {
    if (text && text.startsWith(':')) {
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
    string: 'yellow',
    unparsed: 'red',
    ':': 'orange',
};

const ops = ['+', '-', '*', '/', '==', '<', '>', '<=', '>=', '!=', ','];
ops.forEach((op) => (colors[op] = '#c9cac9'));

const kwds = ['let', 'def', 'defn', 'fn', 'deftype', 'if', 'switch'];
kwds.forEach((kwd) => (colors[kwd] = '#df4fa2'));

export function focus(node: HTMLSpanElement, store: Store) {
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
