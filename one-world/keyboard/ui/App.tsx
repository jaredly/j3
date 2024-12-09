import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLatest } from '../../../web/custom/useLatest';
import { applyUpdate } from '../applyUpdate';
import { init, js, TestState } from '../test-utils';

import { useLocalStorage } from '../../../web/Debug';
import { childLocs, Loc, Style } from '../../shared/cnodes';
import { parse, show, Span } from '../../syntaxes/dsl';
import * as glm from '../../syntaxes/gleam2';
import * as ts from '../../syntaxes/ts';
import * as tsTypes from '../../syntaxes/ts-types';
import { toXML } from '../../syntaxes/xml';
import { nodeToXML, XML } from '../../syntaxes/xml';
import { root } from '../root';
import { lastChild, NodeSelection, selStart, Update } from '../utils';
import { keyUpdate } from './keyUpdate';
import { RenderNode } from './RenderNode';
import { posDown, posUp } from './selectionPos';
import { ShowXML } from './XML';
import { selectStart } from '../handleNav';
import { allPaths, multiSelChildren, multiSelKeys, selEnd, Src } from '../handleShiftNav';

const styleKinds: Record<string, Style> = {
    comment: { color: { r: 200, g: 200, b: 200 } },
    kwd: { color: { r: 123, g: 0, b: 177 }, fontStyle: 'italic' },
    punct: { color: { r: 150, g: 150, b: 150 } },
    bop: { color: { r: 150, g: 0, b: 0 } },
    uop: { color: { r: 150, g: 0, b: 0 } },
};

const defaultParser: TestState['parser'] = {
    config: js,
    parse(node, cursor) {
        return parse(ts.matchers.stmt, node, ts.ctx(cursor));
    },
    spans: tsTypes.stmtSpans,
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

// 'nuniiverse'
export const App = ({ id }: { id: string }) => {
    const [state, setState] = useLocalStorage(id, () => init);

    const cstate = useLatest(state);
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

    const parser = state.parser ?? defaultParser;

    const [lastKey, setLastKey] = useState(null as null | string);

    useEffect(() => {
        const f = (evt: KeyboardEvent) => {
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

    const refs: Record<number, HTMLElement> = useMemo(() => ({}), []);

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

    const spans: Src[] = parsed.result ? parser.spans(parsed.result) : [];
    const cspans = useLatest(spans);

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
            {/* <div style={{ paddingLeft: 50, paddingTop: 20 }}>Auto complete {JSON.stringify(parsed.ctx.autocomplete)}</div> */}
            <div style={{ paddingLeft: 50, paddingTop: 20 }}>Auto complete {JSON.stringify(state.sel)}</div>
            <div style={{ display: 'flex', flex: 3, minHeight: 0, whiteSpace: 'nowrap' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: 25 }}>
                    <h3>CST</h3>
                    <ShowXML root={xmlcst} onClick={clickSrc} setHover={hoverSrc} sel={xmlKeys} />
                </div>
                <div style={{ flex: 3, overflow: 'auto', padding: 25 }}>
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
