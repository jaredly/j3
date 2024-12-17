import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLatest } from '../../../web/custom/useLatest';
import { applyUpdate } from '../applyUpdate';
import { init, js, TestState } from '../test-utils';

import { useLocalStorage } from '../../../web/Debug';
import { childLocs, Loc, RichKind, Style } from '../../shared/cnodes';
import { parse, ParseResult, show, Span } from '../../syntaxes/dsl';
import * as glm from '../../syntaxes/gleam2';
import * as dsl3 from '../../syntaxes/dsl3';
import * as ts from '../../syntaxes/ts';
import * as tsTypes from '../../syntaxes/ts-types';
import { toXML } from '../../syntaxes/xml';
import { nodeToXML, XML } from '../../syntaxes/xml';
import { root } from '../root';
import { getCurrent, lastChild, NodeSelection, pathWithChildren, selStart, Update } from '../utils';
import { keyUpdate } from './keyUpdate';
import { RenderNode } from './RenderNode';
import { posDown, posUp, selectionPos } from './selectionPos';
import { ShowXML } from './XML';
import { selectStart } from '../handleNav';
import { allPaths, multiSelChildren, multiSelKeys, selEnd, Src } from '../handleShiftNav';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';

const styleKinds: Record<string, Style> = {
    comment: { color: { r: 200, g: 200, b: 200 } },
    kwd: { color: { r: 123, g: 0, b: 177 } },
    punct: { color: { r: 150, g: 150, b: 150 } },
    bop: { color: { r: 150, g: 0, b: 0 } },
    uop: { color: { r: 150, g: 0, b: 0 } },
    number: { color: { r: 0, g: 166, b: 255 } },
};

const showKey = (evt: KeyboardEvent) => {
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

// 'nuniiverse'
export const App = ({ id }: { id: string }) => {
    const [state, setState] = useLocalStorage(id, () => init);

    // @ts-ignore
    window.state = state;

    const [hover, setHover] = useState(null as null | NodeSelection);

    const msel = multiSelChildren(state.sel, state.top);
    const mkeys = msel ? multiSelKeys(msel.parent, msel.children) : null;

    const mhover = hover ? multiSelChildren(hover, state.top) : null;
    const hoverkeys = mhover ? multiSelKeys(mhover.parent, mhover.children) : null;

    const xmlKeys = useMemo(() => {
        const keys = msel?.children ?? [lastChild(state.sel.start.path)];
        const extra: number[] = [];
        keys.forEach((key) => {
            extra.push(...childLocs(state.top.nodes[key]));
        });
        return keys.concat(extra);
    }, [msel, state.sel]);

    const parser = state.parser ?? dsl3.parser;
    // const parser = state.parser ?? ts.tsParser;
    const rootNode = root(state, (idx) => [{ id: '', idx }]);
    const cursor = state.sel.multi ? undefined : lastChild(state.sel.start.path);
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
        if (!src) return setHover(null);
        const l = paths[src.left[0].idx];
        if (!src.right)
            return setHover({
                start: selStart(l, { type: 'list', where: 'before' }),
                multi: { end: selEnd(l), aux: selEnd(l) },
            });
        const r = paths[src.right[0].idx];
        return setHover({
            start: selStart(l, { type: 'list', where: 'before' }),
            multi: { end: selEnd(r) },
        });
    };

    const clickSrc = (src: Src | null) => {
        if (!src) return;
        const l = paths[src.left[0].idx];
        const start = selectStart(l, state.top);
        if (!start) return;
        if (!src.right) {
            return setState((s) => applyUpdate(s, { nodes: {}, selection: { start, multi: { end: selEnd(l) } } }));
        }
        const r = paths[src.right[0].idx];
        return setState((s) => applyUpdate(s, { nodes: {}, selection: { start, multi: { end: selEnd(r) } } }));
    };

    const [menu, setMenu] = useState(null as null | Menu);

    const { lastKey, refs } = useKeyHandler(state, parsed, setState, parser, menu, setMenu);

    useEffect(() => {
        if (state.sel.multi) return setMenu(null);
        const pos = selectionPos(state.sel, refs, state.top);
        if (!pos) return;
        const current = getCurrent(state.sel, state.top);
        if (current.type === 'text' && current.cursor.type === 'text') {
            const span = current.node.spans[current.cursor.end.index];
            const end = current.cursor.end;
            if (span.type === 'text') {
                const text = current.cursor.end.text ?? splitGraphemes(span.text);
                if (text[current.cursor.end.cursor - 1] === '\\') {
                    return setMenu({
                        top: pos.top + pos.height,
                        left: pos.left,
                        selection: 0,
                        items: [
                            {
                                title: 'Image embed',
                                action() {
                                    //         const spans = current.node.spans.slice()
                                    //         spans[end.index] = {type: 'embed'}
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
        const slash = current.cursor.text ? current.cursor.text[0] === '\\' : current.node.text.startsWith('\\');
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
                        setState((s) =>
                            applyUpdate(s, {
                                nodes: {
                                    [current.node.loc]: {
                                        type: 'list',
                                        kind,
                                        loc: current.node.loc,
                                        children: [s.top.nextLoc],
                                    },
                                    [s.top.nextLoc]: {
                                        type: 'text',
                                        loc: s.top.nextLoc,
                                        spans: [{ type: 'text', text: '' }],
                                    },
                                },
                                selection: {
                                    start: selStart(pathWithChildren(current.path, s.top.nextLoc), { type: 'text', end: { index: 0, cursor: 0 } }),
                                },
                                nextLoc: s.top.nextLoc + 1,
                            }),
                        );
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
                            setState((s) => {
                                return applyUpdate(s, {
                                    nodes: {
                                        [current.node.loc]: {
                                            type: 'table',
                                            kind: { type: 'rich' },
                                            loc: current.node.loc,
                                            rows: [[state.top.nextLoc, state.top.nextLoc + 1]],
                                        },
                                        [state.top.nextLoc]: {
                                            type: 'text',
                                            loc: state.top.nextLoc,
                                            spans: [{ type: 'text', text: '' }],
                                        },
                                        [state.top.nextLoc + 1]: {
                                            type: 'text',
                                            loc: state.top.nextLoc + 1,
                                            spans: [{ type: 'text', text: '' }],
                                        },
                                    },
                                    selection: {
                                        start: selStart(pathWithChildren(current.path, state.top.nextLoc + 1), {
                                            type: 'text',
                                            end: { index: 0, cursor: 0 },
                                        }),
                                    },
                                    nextLoc: state.top.nextLoc + 2,
                                });
                            });
                        },
                    },
                ]),
        });
    }, [state.sel, state.top]);

    // sooo
    // do I just have, like, some state here? Yeah, right?
    // autocomplete menu, would live here.
    // Anddd if
    // oh wait, what if I just do \"" produces a rich?
    // but yeah I want to allow ... different options n stuff.

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: 50, paddingBottom: 0, minHeight: 0 }}>
                <div style={{ height: '1em', paddingBottom: 20 }}>{lastKey ?? ''}</div>
                <RenderNode
                    loc={state.top.root}
                    parent={{ root: { ids: [], top: '' }, children: [] }}
                    state={state}
                    inRich={false}
                    ctx={{
                        errors,
                        refs,
                        styles,
                        placeholders,
                        msel: mkeys,
                        mhover: hoverkeys,
                        dispatch(up) {
                            setState((s) => applyUpdate(s, up));
                        },
                    }}
                />
            </div>
            {menu ? (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        // height: 5,
                        // width: 5,
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
            {/* <div style={{ paddingLeft: 50, paddingTop: 20 }}>Auto complete {JSON.stringify(parsed.ctx.autocomplete)}</div> */}
            {/* <div style={{ paddingLeft: 50, paddingTop: 20 }}>Auto complete {JSON.stringify(state.sel)}</div> */}
            <div style={{ display: 'flex', flex: 3, minHeight: 0, whiteSpace: 'nowrap' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: 25 }}>
                    <h3>CST</h3>
                    <ShowXML root={xmlcst} onClick={clickSrc} setHover={hoverSrc} sel={xmlKeys} />
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: 25 }}>
                    <h3>AST</h3>
                    {xml ? <ShowXML root={xml} onClick={clickSrc} setHover={hoverSrc} sel={xmlKeys} /> : 'NO xml'}
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
            </div>
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
                                                multi: { end: selEnd(ed) },
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

const useKeyHandler = (
    state: TestState,
    parsed: ParseResult<any>,
    setState: (s: TestState) => void,
    parser: NonNullable<TestState['parser']>,
    menu: Menu | null,
    setMenu: (m: Menu | null) => void,
) => {
    const cstate = useLatest(state);
    const spans: Src[] = parsed.result ? parser.spans(parsed.result) : [];
    const cspans = useLatest(spans);
    const [lastKey, setLastKey] = useState(null as null | string);
    const refs: Record<number, HTMLElement> = useMemo(() => ({}), []);
    // const [autoComplete, setAutocomplete] = useState(null as null | {
    //     items: string[]
    // })
    const cmenu = useLatest(menu);

    useEffect(() => {
        const f = (evt: KeyboardEvent) => {
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
            const up = keyUpdate(
                cstate.current,
                evt.key,
                { meta: evt.metaKey, ctrl: evt.ctrlKey, alt: evt.altKey, shift: evt.shiftKey },
                {
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
                parser.config,
            );
            if (!up) return;
            // console.log('up', up);
            evt.preventDefault();
            evt.stopPropagation();
            setState(applyUpdate(cstate.current, up));
        };
        document.addEventListener('keydown', f);
        return () => document.removeEventListener('keydown', f);
    }, []);

    return { lastKey, refs };
};
