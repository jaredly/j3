import React, { useEffect, useLayoutEffect, useMemo, useReducer, useState } from 'react';
import { useLatest } from '../../../web/custom/useLatest';
import { Config, TestParser, TestState } from '../test-utils';

import { Loc, RecNodeT, RichKind, Style } from '../../shared/cnodes';
import { ParseResult, show } from '../../syntaxes/dsl';
import * as dsl3 from '../../syntaxes/dsl3';
import { nodeToXML, toXML, XML } from '../../syntaxes/xml';
import { idText, spanText } from '../cursorSplit';
import { selectStart } from '../handleNav';
import { allPaths, Mods, SelStart, Src } from '../handleShiftNav';
import { root } from '../root';
import { argify, atomify, getCurrent, getSelectionStatuses } from '../selections';
import { lastChild, mergeHighlights, NodeSelection, pathWithChildren, SelectionStatuses, selStart, Top, Update } from '../utils';
import { HistoryItem, initialAppState, reducer } from './history';
import { Visual } from './keyUpdate';
import { RenderNode } from './RenderNode';
import { posDown, posUp, selectionPos } from './selectionPos';
import { ShowXML } from './XML';
import { parser as jsMinusParser } from '../../syntaxes/js--';
import { HiddenInput } from './HiddenInput';
import { handleCopyMulti } from '../handleWrap';
import { shape } from '../../shared/shape';

const styleKinds: Record<string, Style> = {
    comment: { color: { r: 200, g: 200, b: 200 } },
    kwd: { color: { r: 123, g: 0, b: 177 } },
    punct: { color: { r: 150, g: 150, b: 150 } },
    bop: { color: { r: 150, g: 0, b: 0 } },
    uop: { color: { r: 150, g: 0, b: 0 } },
    number: { color: { r: 0, g: 166, b: 255 } },
    unparsed: { color: { r: 255, g: 100, b: 100 }, textDecoration: 'underline' },
};

const showKey = (evt: React.KeyboardEvent) => {
    let key = evt.key;
    if (key === ' ') key = 'Space';
    if (evt.metaKey) key = 'Meta ' + key;
    if (evt.shiftKey) key = 'Shift ' + key;
    if (evt.altKey) key = 'Alt ' + key;
    if (evt.ctrlKey) key = 'Ctrl ' + key;
    return key;
};

export type Menu = {
    top: number;
    left: number;
    selection: number;
    items: {
        title: string;
        action(): void;
    }[];
};

// Ahhhhhhhhhhhh ok. sO actually what wee need is to, like, coalesce the updates?
// hm. yeah

export type Action =
    | { type: 'add-sel'; sel: NodeSelection }
    | { type: 'update'; update: Update | null | undefined }
    | { type: 'key'; key: string; mods: Mods; visual?: Visual; config: Config }
    | { type: 'paste'; data: string }
    | { type: 'undo' }
    | { type: 'redo' };

const getInitialState = (id: string): AppState => {
    const data: AppState = localStorage[id] ? JSON.parse(localStorage[id]) : initialAppState;
    // if (!data.top.tmpText) data.top.tmpText = {};
    // @ts-ignore
    if (data.sel) {
        // @ts-ignore
        data.selections = [data.sel];
        // @ts-ignore
        delete data.sel;
    }
    if (!data.history) data.history = [];
    return data;
};

const useAppState = (id: string) => {
    const [state, dispatch] = useReducer(reducer, id, getInitialState);
    useEffect(() => {
        if (state != null && state !== initialAppState) {
            localStorage[id] = JSON.stringify(state);
        }
    }, [state, id]);
    return [state, dispatch] as const;
};

const putOnWindow = (obj: any) => {
    Object.assign(window, obj);
};

export type AppState = {
    top: Top;
    selections: NodeSelection[];
    parser?: TestParser;
    history: HistoryItem[];
};

// 'nuniiverse'
export const App = ({ id }: { id: string }) => {
    const [state, dispatch] = useAppState(id);

    putOnWindow({ state });

    const [hover, setHover] = useState(null as null | NodeSelection);

    // const msel = multiSelChildren(state.sel, state.top);
    // const mkeys = msel ? multiSelKeys(msel.parent, msel.children) : null;

    // const mhover = hover ? multiSelChildren(hover, state.top) : null;
    // const hoverkeys = mhover ? multiSelKeys(mhover.parent, mhover.children) : null;

    // const xmlKeys = useMemo(() => {
    //     // msel?.children ??
    //     const keys = [lastChild(state.sel.start.path)];
    //     const extra: number[] = [];
    //     keys.forEach((key) => {
    //         extra.push(...childLocs(state.top.nodes[key]));
    //     });
    //     return keys.concat(extra);
    // }, [msel, state.sel]);

    const parser = jsMinusParser;
    // const parser = state.parser ?? dsl3.parser;
    // const parser = state.parser ?? ts.tsParser;
    const rootNode = root(state, (idx) => [{ id: '', idx }]);
    // state.sel.multi ? undefined :
    const cursor = lastChild(state.selections[0].start.path);
    const parsed = parser.parse(rootNode, cursor);
    const errors = useMemo(() => {
        const errors: Record<number, string> = {};
        parsed.bads.forEach((bad) => {
            if (bad.type !== 'missing') {
                errors[bad.node.loc[0].idx] = bad.type === 'extra' ? 'Extra node in ' + show(bad.matcher) : 'Mismatch: ' + show(bad.matcher);
            }
        });
        return errors;
    }, [state, parsed.bads]);

    const xml = useMemo(() => (parsed.result ? toXML(parsed.result) : null), [parsed.result]);
    const xmlcst = useMemo(() => nodeToXML(rootNode), [rootNode]);
    const styles: Record<number, Style> = {};
    const placeholders: Record<number, string> = {};
    Object.entries(parsed.ctx.meta).forEach(([key, meta]) => {
        if (meta.kind && styleKinds[meta.kind]) {
            styles[+key] = styleKinds[meta.kind];
        }
        if (meta.placeholder) {
            placeholders[+key] = meta.placeholder;
        }
    });

    const paths = useMemo(() => allPaths(state.top), [state.top]);
    const hoverSrc = (src: Src | null) => {
        if (!src || !src.left.length) return setHover(null);
        const l = paths[src.left[0].idx];
        if (!src.right || !src.right.length)
            return setHover({
                start: selStart(l, { type: 'list', where: 'before' }),
                // multi: { end: selEnd(l), aux: selEnd(l) },
            });
        const r = paths[src.right[0].idx];
        return setHover({
            start: selStart(l, { type: 'list', where: 'before' }),
            // multi: { end: selEnd(r) },
        });
    };

    const clickSrc = (src: Src | null) => {
        if (!src) return;
        const l = paths[src.left[0].idx];
        const start = selectStart(l, state.top);
        if (!start) return;
        if (!src.right) {
            return dispatch({ type: 'update', update: { nodes: {}, selection: { start } } }); // multi: { end: selEnd(l) }
        }
        const r = paths[src.right[0].idx];
        return dispatch({ type: 'update', update: { nodes: {}, selection: { start } } }); // multi: { end: selEnd(r) }
    };

    const [menu, setMenu] = useState(null as null | Menu);

    // const [dragMods, setDragMods] = useState({} as Mods);

    // const { lastKey, refs } = useKeyHandler(state, parsed, dispatch, parser, menu, setMenu);
    const { keyFns, lastKey, refs } = useKeyFns(state, parsed, dispatch, parser, menu, setMenu);

    const cstate = useLatest(state);

    useEffect(() => {
        const sel = state.selections[0];
        // if (state.sel.multi) return setMenu(null);
        const pos = selectionPos(sel.start, refs, state.top);
        if (!pos) return;
        const current = getCurrent(sel, state.top);
        if (current.type === 'text' && current.cursor.type === 'text') {
            const span = current.node.spans[current.cursor.end.index];
            const end = current.cursor.end;
            if (span.type === 'text') {
                const text = spanText(state.top.tmpText, current.node.loc, current.cursor.end, span);
                // idText(state.top.tmpText, current.cursor.end, span);
                if (text[current.cursor.end.cursor - 1] === '\\') {
                    return setMenu({
                        top: pos.top + pos.height,
                        left: pos.left,
                        selection: 0,
                        items: [
                            {
                                title: 'Image embed',
                                action() {
                                    // const spans = current.node.spans.slice()
                                    // spans[end.index] = {type: 'embed'}
                                    // setState((s) =>
                                    //     applyUpdate(s, {
                                    //         nodes: {
                                    //             [current.node.loc]: {
                                    //                 ...current.node,
                                    //                 spans
                                    //             },
                                    //         },
                                    //         selection: {
                                    //             start: selStart(pathWithChildren(current.path, s.top.nextLoc), { type: 'text', end: { index: 0, cursor: 0 } }),
                                    //         },
                                    //         nextLoc: s.top.nextLoc + 1,
                                    //     }),
                                    // );
                                },
                            },
                        ],
                    });
                }
            }
        }
        if (current.type !== 'id') return setMenu(null);
        // oh lol. the slash.
        // it's gotta be, a thing. gotta parse that out my good folks.
        const slash = idText(state.top.tmpText, current.cursor, current.node)[0] === '\\';
        if (!slash) return setMenu(null);

        const kinds: { title: string; kind: RichKind }[] = [
            { title: 'Rich Text', kind: { type: 'plain' } },
            { title: 'Rich Text: Bullet', kind: { type: 'list', ordered: false } },
            { title: 'Rich Text: Section', kind: { type: 'section' } },
            { title: 'Rich Text: Numbered', kind: { type: 'list', ordered: true } },
            { title: 'Rich Text: Checkboxes', kind: { type: 'checks', checked: {} } },
            { title: 'Rich Text: Radio', kind: { type: 'opts' } },
            { title: 'Rich Text: Quote', kind: { type: 'indent', quote: true } },
            { title: 'Rich Text: Indent', kind: { type: 'indent', quote: false } },
            { title: 'Rich Text: Info', kind: { type: 'callout', vibe: 'info' } },
            { title: 'Rich Text: Warning', kind: { type: 'callout', vibe: 'info' } },
            { title: 'Rich Text: Error', kind: { type: 'callout', vibe: 'info' } },
        ];

        setMenu({
            top: pos.top + pos.height,
            left: pos.left,
            selection: 0,
            items: kinds
                .map(({ title, kind }) => ({
                    title,
                    action() {
                        dispatch({
                            type: 'update',
                            update: {
                                nodes: {
                                    [current.node.loc]: {
                                        type: 'list',
                                        kind,
                                        loc: current.node.loc,
                                        children: [cstate.current.top.nextLoc],
                                    },
                                    [cstate.current.top.nextLoc]: {
                                        type: 'text',
                                        loc: cstate.current.top.nextLoc,
                                        spans: [{ type: 'text', text: '' }],
                                    },
                                },
                                selection: {
                                    start: selStart(pathWithChildren(current.path, cstate.current.top.nextLoc), {
                                        type: 'text',
                                        end: { index: 0, cursor: 0 },
                                    }),
                                },
                                nextLoc: cstate.current.top.nextLoc + 1,
                            },
                        });
                    },
                }))
                .concat([
                    {
                        title: 'Attachment',
                        action() {
                            // doing a thing
                        },
                    },
                    {
                        title: 'Rich Table',
                        action() {
                            dispatch({
                                type: 'update',
                                update: {
                                    nodes: {
                                        [current.node.loc]: {
                                            type: 'table',
                                            kind: { type: 'rich' },
                                            loc: current.node.loc,
                                            rows: [[cstate.current.top.nextLoc, cstate.current.top.nextLoc + 1]],
                                        },
                                        [cstate.current.top.nextLoc]: {
                                            type: 'text',
                                            loc: cstate.current.top.nextLoc,
                                            spans: [{ type: 'text', text: '' }],
                                        },
                                        [cstate.current.top.nextLoc + 1]: {
                                            type: 'text',
                                            loc: cstate.current.top.nextLoc + 1,
                                            spans: [{ type: 'text', text: '' }],
                                        },
                                    },
                                    selection: {
                                        start: selStart(pathWithChildren(current.path, cstate.current.top.nextLoc + 1), {
                                            type: 'text',
                                            end: { index: 0, cursor: 0 },
                                        }),
                                    },
                                    nextLoc: cstate.current.top.nextLoc + 2,
                                },
                            });
                        },
                    },
                ]),
        });
    }, [state.selections[0], state.top]);

    const selectionStatuses = useMemo(() => {
        let statuses: SelectionStatuses = {};
        state.selections.forEach((sel) => {
            const st = getSelectionStatuses(sel, state.top);
            Object.entries(st).forEach(([key, status]) => {
                if (statuses[key]) {
                    statuses[key].cursors.push(...status.cursors);
                    statuses[key].highlight = mergeHighlights(statuses[key].highlight, status.highlight);
                } else {
                    statuses[key] = status;
                }
            });
        });
        return statuses;
    }, [state.selections, state.top]);

    // const latestDragMods = useLatest(dragMods);

    const drag = useMemo(() => {
        const up = (evt: MouseEvent) => {
            document.removeEventListener('mouseup', up);
            drag.dragging = false;
        };
        const drag = {
            dragging: false,
            start(sel: SelStart, meta = false) {
                if (meta) {
                    dispatch(
                        { type: 'add-sel', sel: { start: sel } },
                        // cstate.current.selections.map((s): undefined | Update => undefined).concat([{ nodes: [], selection: { start: sel } }]),
                        // [undefined, { nodes: [], selection: { start: sel } }]
                    );
                } else {
                    drag.dragging = true;
                    dispatch({ type: 'update', update: { nodes: {}, selection: { start: sel } } });
                    document.addEventListener('mouseup', up);
                }
            },
            move(sel: SelStart, ctrl = false, alt = false) {
                let start = cstate.current.selections[0].start;
                if (ctrl) {
                    [start, sel] = argify(start, sel, cstate.current.top);
                } else if (alt) {
                    [start, sel] = atomify(start, sel, cstate.current.top);
                }
                dispatch({ type: 'update', update: { nodes: {}, selection: { start, end: sel } } });
            },
        };
        return drag;
    }, []);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
            <HiddenInput {...keyFns} sel={state.selections} />
            <div
                style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    padding: 50,
                    paddingBottom: 0,
                    minHeight: 0,
                    // maxHeight: '30vh',
                    overflow: 'auto',
                    flexShrink: 1,
                }}
            >
                <div style={{ height: '1em', paddingBottom: 20 }}>{lastKey ?? ''}</div>
                <RenderNode
                    loc={state.top.root}
                    parent={{ root: { ids: [], top: '' }, children: [] }}
                    top={state.top}
                    inRich={false}
                    ctx={{
                        drag,
                        errors,
                        refs,
                        styles,
                        placeholders,
                        selectionStatuses,
                        config: { sep: { curly: '; ', round: ', ', square: ', ' } },
                        // msel: mkeys,
                        // mhover: hoverkeys,
                        dispatch(up) {
                            dispatch({ type: 'update', update: up });
                        },
                    }}
                />
            </div>
            {menu ? (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        borderRadius: 5,
                        top: menu.top,
                        left: menu.left,
                        background: '#eee',
                    }}
                >
                    {menu.items.map(({ title, action }, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: i === menu.selection ? '#ddd' : undefined,
                                padding: '2px 4px',
                                cursor: 'pointer',
                            }}
                            onClick={() => {
                                action();
                            }}
                        >
                            {title}
                        </div>
                    ))}
                </div>
            ) : null}
            {/* <div style={{ paddingLeft: 50, paddingTop: 20 }}>
                SEL{' '}
                {state.selections.map((sel, i) => (
                    <div key={i}>{JSON.stringify(sel)}</div>
                ))}
            </div>
            <div style={{ paddingLeft: 50, paddingTop: 20 }}>TMPText {JSON.stringify(state.top.tmpText)}</div>
            <div style={{ paddingLeft: 50, paddingTop: 14 }}>
                {Object.entries(selectionStatuses).map(([k, v]) => (
                    <div key={k}>
                        {k}: {JSON.stringify(v)}
                    </div>
                ))}
            </div> */}
            {/* <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'auto', whiteSpace: 'nowrap' }}> */}
            {/* <div style={{ flex: 1, overflow: 'auto', padding: 25 }}>
                    <h3>History</h3>
                    <div>
                        {state.history.map((item, i) => (
                            <div key={i}>
                                <ShowHistoryItem item={item} />
                            </div>
                        ))}
                    </div>
                </div> */}
            <div style={{ overflow: 'auto', padding: 25 }}>
                <h3>CST</h3>
                <ShowXML root={xmlcst} onClick={clickSrc} setHover={hoverSrc} sel={[]} statuses={selectionStatuses} />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 25 }}>
                <h3>AST</h3>
                {xml ? <ShowXML root={xml} onClick={clickSrc} setHover={hoverSrc} statuses={selectionStatuses} sel={[]} /> : 'NO xml'}
                <div style={{ marginTop: 50, whiteSpace: 'pre-wrap' }}>
                    {parsed.bads.map((er, i) => (
                        <div key={i} style={{ color: 'red' }}>
                            <div>
                                {show(er.matcher)} {er.type}
                            </div>
                            <div style={{ fontSize: '80%', padding: 12 }}>{JSON.stringify(er)}</div>
                        </div>
                    ))}
                </div>
            </div>
            {/* </div> */}
        </div>
    );
};

const ShowHistoryItem = ({ item }: { item: HistoryItem }) => {
    const nodes = item.type === 'change' ? Object.keys(item.top.next.nodes).length : 0;
    return (
        <div>
            {/* {item.id + ' '} */}
            {/* onlyy {item.onlyy}
            reverts {item.reverts} */}
            {new Date(item.ts).toLocaleString()}
            {' ' + item.type}
            {' ' + nodes + ' nodes'}
        </div>
    );
};

const walxml = (xml: XML, f: (n: XML) => void) => {
    f(xml);
    if (xml.children) {
        Object.values(xml.children).forEach((value) => {
            if (!value) return;
            if (Array.isArray(value)) return value.forEach((v) => walxml(v, f));
            else return walxml(value, f);
        });
    }
};

const XMLShow = ({
    xml,
    refs,
    state,
    spans,
    dispatch,
}: {
    spans: Src[];
    state: TestState;
    xml: XML;
    refs: Record<string, HTMLElement>;
    dispatch: (up: Update | void) => void;
}) => {
    const alls = useMemo(() => {
        const lst: XML[] = [];
        walxml(xml, (m) => {
            if (!m.src) return;
            if (m.src.right || state.top.nodes[m.src.left[0].idx].type !== 'id') {
                lst.push(m);
            }
        });
        return lst;
    }, [xml, state]);

    const pos = (loc: Loc, right?: Loc): [number, number] | null => {
        const lf = refs[loc[0].idx];
        if (!lf) return null;
        const lb = lf.getBoundingClientRect();
        if (!right) {
            return [lb.left, lb.right];
        }
        const rf = refs[right[0].idx];
        if (!rf) return null;
        const rb = rf.getBoundingClientRect();
        return [lb.left, rb.right];
    };

    const calc = () => {
        const posed = spans
            .map((src) => {
                const { left, right } = src;
                // const { left, right } = node.src;
                if (!right) return null;
                const sides = pos(left, right);
                if (!sides) return null;
                return { sides, span: { left, right } };
            })
            .filter(Boolean) as { sides: [number, number]; node?: XML; span: Src }[];
        posed.sort((a, b) => a.sides[1] - a.sides[0] - (b.sides[1] - b.sides[0]));

        const placed: { node?: XML; sides: [number, number]; span: Src }[][] = [[]];
        posed.forEach(({ node, sides, span }) => {
            for (let i = 0; i < placed.length; i++) {
                const row = placed[i];
                if (!row.some((one) => collides(one.sides, sides))) {
                    row.push({ node, sides, span });
                    return;
                }
            }
            placed.push([{ node, sides, span }]);
        });
        return placed;
    };
    const [placed, setPlaced] = useState<{ node?: XML; sides: [number, number]; span: Src }[][]>([]);
    useLayoutEffect(() => {
        // setTimeout(() => {
        setPlaced(calc());
        // }, 10);
    }, [state, xml]);

    const h = 14;

    return (
        <div>
            {placed.map((row, i) => {
                return (
                    <div key={i} style={{ position: 'relative', height: h + 2 }}>
                        {row.map(({ node, sides, span }, j) => {
                            return (
                                <div
                                    key={j}
                                    onClick={() => {
                                        const all = allPaths(state.top);
                                        const st = all[span.left[0].idx];
                                        if (!span.right) {
                                            return;
                                        }
                                        const ssel = selectStart(st, state.top);
                                        if (!ssel) return;

                                        const ed = all[span.right[0].idx];
                                        dispatch({
                                            nodes: {},
                                            selection: {
                                                start: ssel,
                                                // multi: { end: selEnd(ed) },
                                            },
                                        });
                                        console.log(span, all[span.left[0].idx]);
                                        state.top;
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: sides[0],
                                        width: sides[1] - sides[0],
                                        backgroundColor: 'rgba(200,200,255)',
                                        marginTop: 2,
                                        height: h,
                                        // height: 4,
                                        // fontSize: 8,
                                        borderRadius: 4,
                                        // padding: 2,
                                    }}
                                >
                                    {node?.tag}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

const collides = (one: [number, number], two: [number, number]) => {
    return (
        (one[0] < two[0] && one[1] > two[0]) ||
        (one[0] < two[1] && one[1] > two[1]) ||
        (two[0] < one[0] && two[1] > one[0]) ||
        (two[0] < one[1] && two[1] > one[1])
    );
};

const useKeyFns = (
    state: AppState,
    parsed: ParseResult<any>,
    dispatch: (s: Action) => void,
    parser: TestParser,
    menu: Menu | null,
    setMenu: (m: Menu | null) => void,
) => {
    const cstate = useLatest(state);
    const spans: Src[] = parsed.result ? parser.spans(parsed.result) : [];
    const cspans = useLatest(spans);
    const [lastKey, setLastKey] = useState(null as null | string);
    const refs: Record<number, HTMLElement> = useMemo(() => ({}), []);
    const cmenu = useLatest(menu);

    const onKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.metaKey && (evt.key === 'r' || evt.key === 'l')) return;
        if (evt.metaKey && (evt.key === 'v' || evt.key === 'c')) return;

        if (evt.key === 'Dead') {
            return;
        }
        if (evt.key === 'z' && evt.metaKey) {
            evt.preventDefault();
            evt.stopPropagation();
            console.log('undo');
            return dispatch({ type: evt.shiftKey ? 'redo' : 'undo' });
        }
        if (cmenu.current) {
            const menu = cmenu.current;
            if (evt.key === 'Escape') {
                setMenu(null);
                evt.preventDefault();
                return;
            }
            if (evt.key === 'ArrowUp') {
                setMenu({
                    ...menu,
                    selection: menu.selection <= 0 ? menu.items.length - 1 : menu.selection - 1,
                });
                evt.preventDefault();
                return;
            }
            if (evt.key === 'ArrowDown') {
                setMenu({
                    ...menu,
                    selection: menu.selection >= menu.items.length - 1 ? 0 : menu.selection + 1,
                });
                evt.preventDefault();
                return;
            }
            if (evt.key === 'Enter') {
                const item = menu.items[menu.selection];
                if (item) {
                    item.action();
                    setMenu(null);
                    evt.preventDefault();
                    return;
                }
            }
        }

        setLastKey(showKey(evt));

        dispatch({
            type: 'key',
            key: evt.key,
            mods: { meta: evt.metaKey, ctrl: evt.ctrlKey, alt: evt.altKey, shift: evt.shiftKey },
            visual: {
                up(sel) {
                    const nxt = posUp(sel, cstate.current.top, refs);
                    return nxt ? { start: nxt } : null;
                },
                down(sel) {
                    const nxt = posDown(sel, cstate.current.top, refs);
                    return nxt ? { start: nxt } : null;
                },
                spans: cspans.current,
            },
            config: parser.config,
        });

        evt.preventDefault();
        evt.stopPropagation();
    };

    return {
        keyFns: {
            onKeyDown,
            getDataToCopy() {
                const state = cstate.current;
                const copied = state.selections.map((sel) => handleCopyMulti({ top: state.top, sel })).filter(Boolean) as RecNodeT<number>[];
                if (!copied.length) return null;
                console.log(copied, copied.map(shape));
                return { json: copied, display: 'lol thanks' };
            },
            onPaste(data: { type: 'json'; data: any } | { type: 'plain'; text: string }) {
                console.log('pasting I guess', data);
            },
            onInput(text: string) {
                //
            },
        },
        lastKey,
        refs,
    };
};

// const useKeyHandler = (
//     state: AppState,
//     parsed: ParseResult<any>,
//     dispatch: (s: Action) => void,
//     parser: TestParser,
//     menu: Menu | null,
//     setMenu: (m: Menu | null) => void,
//     // setDragMods: (f: (m: Mods) => Mods) => void,
// ) => {
//     const cstate = useLatest(state);
//     const spans: Src[] = parsed.result ? parser.spans(parsed.result) : [];
//     const cspans = useLatest(spans);
//     const [lastKey, setLastKey] = useState(null as null | string);
//     const refs: Record<number, HTMLElement> = useMemo(() => ({}), []);
//     // const [autoComplete, setAutocomplete] = useState(null as null | {
//     //     items: string[]
//     // })
//     const cmenu = useLatest(menu);

//     useEffect(() => {
//         const f = (evt: KeyboardEvent) => {
//             if (evt.metaKey && (evt.key === 'r' || evt.key === 'l')) return;

//             if (evt.key === 'Dead') {
//                 return;
//             }
//             if (evt.key === 'z' && evt.metaKey) {
//                 evt.preventDefault();
//                 evt.stopPropagation();
//                 console.log('undo');
//                 return dispatch({ type: evt.shiftKey ? 'redo' : 'undo' });
//             }
//             if (cmenu.current) {
//                 const menu = cmenu.current;
//                 if (evt.key === 'Escape') {
//                     setMenu(null);
//                     evt.preventDefault();
//                     return;
//                 }
//                 if (evt.key === 'ArrowUp') {
//                     setMenu({
//                         ...menu,
//                         selection: menu.selection <= 0 ? menu.items.length - 1 : menu.selection - 1,
//                     });
//                     evt.preventDefault();
//                     return;
//                 }
//                 if (evt.key === 'ArrowDown') {
//                     setMenu({
//                         ...menu,
//                         selection: menu.selection >= menu.items.length - 1 ? 0 : menu.selection + 1,
//                     });
//                     evt.preventDefault();
//                     return;
//                 }
//                 if (evt.key === 'Enter') {
//                     const item = menu.items[menu.selection];
//                     if (item) {
//                         item.action();
//                         setMenu(null);
//                         evt.preventDefault();
//                         return;
//                     }
//                 }
//             }

//             setLastKey(showKey(evt));

//             dispatch({
//                 type: 'key',
//                 key: evt.key,
//                 mods: { meta: evt.metaKey, ctrl: evt.ctrlKey, alt: evt.altKey, shift: evt.shiftKey },
//                 visual: {
//                     up(sel) {
//                         const nxt = posUp(sel, cstate.current.top, refs);
//                         return nxt ? { start: nxt } : null;
//                     },
//                     down(sel) {
//                         const nxt = posDown(sel, cstate.current.top, refs);
//                         return nxt ? { start: nxt } : null;
//                     },
//                     spans: cspans.current,
//                 },
//                 config: parser.config,
//             });

//             evt.preventDefault();
//             evt.stopPropagation();
//         };
//         document.addEventListener('keydown', f);
//         // document.addEventListener('keyup', up);
//         return () => {
//             document.removeEventListener('keydown', f);
//             // document.removeEventListener('keyup', up);
//         };
//     }, []);

//     return { lastKey, refs };
// };
