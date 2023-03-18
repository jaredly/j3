import * as React from 'react';
import { Map, MNode, MNodeContents, toMCST } from '../../src/types/mcst';
import { EvalCtx, Path, setSelection, Store, updateStore } from '../store';
import { Events, idText } from './Nodes';
import { parse } from '../../src/grammar';
import { Identifier, Node } from '../../src/types/cst';
import {
    getPos,
    isAtEnd,
    isAtStart,
    maybeCommitAutoComplete,
    onKeyDown,
    setPos,
} from '../mods/old/onKeyDown';
import { SetHover } from './Doc';
import { Root } from 'react-dom/client';
import { getMenuState, MenuState, Menu, getMenuItems } from './Menu';
import objectHash from 'object-hash';
import { rainbow } from '../rainbow';
import { AutoCompleteResult, NodeStyle } from '../../src/to-ast/Ctx';
import { replacePath } from './RecordText';
import { nidx } from '../../src/grammar-raw';
import { walkBackTree } from '../../tests/incrementallyBuildTree';

export type Top = {
    store: Store;
    ctx: EvalCtx;
    setHover: SetHover;
    menuPortal: React.RefObject<null | Root>;
};

export const IdentifierLike2 = ({
    node,
    top,
    events,
    path,
    idx,
}: {
    node: MNode;
    top: Top;
    events: Events;
    path: Path[];
    idx: number;
}) => {
    return (
        <IdentifierLike
            type={node.type}
            text={idText(node, idx, top.ctx.ctx)!}
            events={events}
            idx={idx}
            path={path}
            top={top}
        />
    );
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
    const ref = React.useRef(null as null | HTMLSpanElement);

    const menuStuff = useMenuStuff(editing, ctx, idx, store, menuPortal, ref);

    const displayStyle = ctx.ctx.display[idx]?.style;

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
        ? `underline ${
              ctx.report.errors[idx].some((e) => e.type !== 'misc')
                  ? 'red'
                  : '#a77924 wavy 1px'
          }`
        : 'none';

    const style = getStyle(ctx, idx);

    return !editing ? (
        <span
            className="idlike"
            style={{
                color: nodeColor(edit, type),
                minHeight: '1.3em',
                whiteSpace: 'pre',
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
            {text === ''
                ? displayStyle?.type === 'id'
                    ? displayStyle.hash
                    : text
                : text}
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
                onInput(evt, displayStyle, setEdit, idx, path, store, presel);
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(store, null);
            }}
            style={{
                color: nodeColor(edit, type),
                whiteSpace: 'pre',
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
                if (handleMenu(evt, menuStuff)) {
                    return;
                }

                if (
                    evt.key === 'Backspace' &&
                    events.onBackspace &&
                    isAtStart(evt.currentTarget)
                ) {
                    const handled = events.onBackspace(
                        evt.currentTarget.textContent!.length === 0,
                    );
                    if (handled) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        return;
                    }
                }

                if (evt.key === '.') {
                    const num = parseInt(evt.currentTarget.textContent!);
                    if (!isNaN(num)) {
                        return;
                    }
                    if (isAtEnd(evt.currentTarget)) {
                        createRecordAccess(path, idx, store, evt);

                        console.log('walking back');
                        const tmp = path.slice(1).map((p) => ({
                            idx: p.idx,
                            child: p.child.type === 'child' ? p.child.at : -1,
                        }));

                        maybeCommitAutoComplete(idx, ctx, store);

                        while (tmp.length) {
                            walkBackTree(tmp, idx, store, ctx);
                            tmp.pop();
                        }
                        return;
                    }
                }

                onKeyDown(evt, idx, path, events, store, ctx);
            }}
        />
    );
};

export const handleMenu = (
    evt: React.KeyboardEvent,
    menuStuff: MenuStuff,
): boolean => {
    const { menuItems, menuSelection, setMenuSelection } = menuStuff;
    if (menuItems) {
        const item = menuItems[menuSelection];
        if (item) {
            if (evt.key === 'Enter') {
                evt.preventDefault();
                item.action();
                return true;
            }
            if (evt.key === 'ArrowDown') {
                evt.preventDefault();
                const next = (menuSelection + 1) % menuItems.length;
                setMenuSelection(next);
                return true;
            }
            if (evt.key === 'ArrowUp') {
                evt.preventDefault();
                const next =
                    menuSelection === 0
                        ? menuItems.length - 1
                        : menuSelection - 1;
                setMenuSelection(next);
                return true;
            }
        }
    }
    return false;
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

export type MenuStuff = {
    menuItems:
        | {
              label: AutoCompleteResult;
              action: () => void;
          }[]
        | undefined;
    menuSelection: number;
    setMenuSelection: React.Dispatch<React.SetStateAction<number>>;
};

export function createRecordAccess(
    path: Path[],
    idx: number,
    store: Store,
    evt: React.KeyboardEvent<HTMLSpanElement>,
) {
    const last = path[path.length - 1];
    const nw = {
        type: 'recordAccess',
        items: [] as number[],
        target: idx,
        loc: { start: 0, end: 0, idx: nidx() },
    } satisfies MNode;
    const map = replacePath(last, nw.loc.idx, store);
    map[nw.loc.idx] = nw;
    const attr = {
        type: 'accessText',
        text: '',
        loc: { start: 0, end: 0, idx: nidx() },
    } satisfies MNode;
    nw.items.push(attr.loc.idx);
    map[attr.loc.idx] = attr;
    evt.preventDefault();
    evt.stopPropagation();
    return updateStore(store, {
        map,
        selection: {
            idx: attr.loc.idx,
        },
    });
}

export function useMenuStuff(
    editing: boolean,
    ctx: EvalCtx,
    idx: number,
    store: Store,
    menuPortal: React.RefObject<Root | null>,
    ref: React.MutableRefObject<HTMLSpanElement | null>,
): MenuStuff {
    const [menuSelection, setMenuSelection] = React.useState(0);

    const menuItems = React.useMemo(() => {
        if (!editing || !ctx.ctx.display[idx]?.autoComplete) {
            return;
        }
        return getMenuItems(ctx.ctx.display[idx]?.autoComplete!, idx, store);
    }, [editing, ctx.ctx.display[idx]?.autoComplete]);

    React.useEffect(() => {
        if (!menuPortal.current || !ref.current) {
            return;
        }

        const box = ref.current.getBoundingClientRect();
        const pos = { left: box.left, top: box.bottom };
        menuPortal.current.render(
            menuItems ? (
                <Menu
                    state={{ items: menuItems, selection: menuSelection }}
                    onAction={() => {
                        // setMenuState(null);
                    }}
                    ctx={ctx.ctx}
                    pos={pos}
                />
            ) : null,
        );
    }, [menuItems, menuSelection]);

    React.useEffect(() => {
        if (editing) {
            return () => menuPortal.current?.render(null);
        }
    }, [editing]);
    return { menuItems, menuSelection, setMenuSelection };
}

function getStyle(ctx: EvalCtx, idx: number) {
    const style = ctx.ctx.display[idx]?.style;
    if (!style) return { fontStyle: 'normal' };
    switch (style.type) {
        case 'record-attr':
            return {
                fontStyle: 'italic',
                fontFamily: 'serif',
                color: '#84a4a5',
            };
        case 'tag':
            return {
                fontVariationSettings: '"wght" 500',
            };
        case 'id':
        case 'id-decl':
            const color = getRainbowHashColor(style.hash);
            return { fontStyle: 'normal', color };
    }
    return { fontStyle: 'normal' };
}

export function getRainbowHashColor(hash: string) {
    const idx = hash.startsWith(':')
        ? +hash.slice(1) * (rainbow.length / 5 - 1)
        : parseInt(hash, 16);
    const color = rainbow[idx % rainbow.length];
    return color;
}

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
    displayStyle: NodeStyle | void,
    setEdit: React.Dispatch<React.SetStateAction<string | null>>,
    idx: number,
    path: Path[],
    store: Store,
    presel: { current: number | null },
) {
    const text = evt.currentTarget.textContent ?? '';
    setEdit(text);
    const pos = getPos(evt.currentTarget);

    const old = store.map[idx];

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
    // mp[idx].tannot = old.tannot;
    // mp[idx].tapply = old.tapply;

    // Waaaait I need to know here ... if
    // ... OH YEAH ok so, if the old id has text,
    // then we carry over. Otherwise we don't.

    if (old.type === 'identifier' && displayStyle?.type === 'id-decl') {
        (mp[idx] as Identifier).hash = old.hash;
    }

    updateStore(store, {
        map: mp,
        selection: {
            idx,
            loc:
                nw.type === 'array' ||
                nw.type === 'list' ||
                nw.type === 'record'
                    ? 'end'
                    : pos,
        },
        prev: {
            idx,
            loc: presel.current ?? undefined,
        },
    });
}
