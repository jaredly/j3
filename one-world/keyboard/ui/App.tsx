import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLatest } from '../../../web/custom/useLatest';
import { applyUpdate } from '../applyUpdate';
import { init, TestState } from '../test-utils';

import { useLocalStorage } from '../../../web/Debug';
import { childLocs, Loc, Style } from '../../shared/cnodes';
import { parse, show, Span } from '../../syntaxes/dsl';
import { ctx, matchers, toXML } from '../../syntaxes/gleam2';
import { nodeToXML, XML } from '../../syntaxes/xml';
import { root } from '../root';
import { lastChild, NodeSelection, Path, pathKey, pathWithChildren, Top, Update } from '../utils';
import { keyUpdate } from './keyUpdate';
import { RenderNode } from './RenderNode';
import { posDown, posUp } from './selectionPos';
import { ShowXML } from './XML';
import { selectStart } from '../handleNav';
import { selEnd } from '../handleShiftNav';

const styleKinds: Record<string, Style> = {
    comment: { color: { r: 200, g: 200, b: 200 } },
    kwd: { color: { r: 123, g: 0, b: 177 }, fontStyle: 'italic' },
    punct: { color: { r: 150, g: 150, b: 150 } },
    bop: { color: { r: 150, g: 0, b: 0 } },
    uop: { color: { r: 150, g: 0, b: 0 } },
};

const lastCommonAncestor = (one: number[], two: number[]) => {
    let i = 0;
    for (; i < one.length && i < two.length && one[i] === two[i]; i++);
    return { common: one.slice(0, i), one: one[i], two: two[i] };
};

const multiSelChildren = (sel: NodeSelection, top: Top) => {
    if (!sel.end) return null;
    // so, we ... find the least common ancestor
    if (sel.start.path.root.top !== sel.end.path.root.top) return null; // TODO multi-top life
    let lca = lastCommonAncestor(sel.start.path.children, sel.end.path.children);
    const parent: Path = { root: sel.start.path.root, children: lca.common };
    if (lca.one == null || lca.two == null) {
        return { parent, children: lca.one == null ? [lca.two] : [lca.one] };
    }
    const pnode = top.nodes[lastChild(parent)];
    if (pnode.type !== 'list') return null; // not strings or stuff just yet sry
    const one = pnode.children.indexOf(lca.one);
    const two = pnode.children.indexOf(lca.two);
    const left = one < two ? one : two;
    const right = one < two ? two : one;
    return { parent, children: pnode.children.slice(left, right + 1) };
};

const multiSelKeys = (parent: Path, children: number[]) => {
    return children.map((child) => pathKey(pathWithChildren(parent, child)));
};

export const App = () => {
    const [state, setState] = useLocalStorage('nuniiverse', () => init);

    const cstate = useLatest(state);
    // @ts-ignore
    window.state = state;

    const msel = multiSelChildren(state.sel, state.top);
    const mkeys = msel ? multiSelKeys(msel.parent, msel.children) : null;

    useEffect(() => {
        const f = (evt: KeyboardEvent) => {
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
                },
            );
            if (!up) return;
            evt.preventDefault();
            evt.stopPropagation();
            setState(applyUpdate(state, up));
        };
        document.addEventListener('keydown', f);
        return () => document.removeEventListener('keydown', f);
    });

    const rootNode = root(state, (idx) => [{ id: '', idx }]);

    const c = ctx();
    const gleam = parse(matchers.stmt, rootNode, c);
    const errors = useMemo(() => {
        const errors: Record<number, string> = {};
        gleam.bads.forEach((bad) => {
            if (bad.type !== 'missing') {
                errors[bad.node.loc[0].idx] = bad.type === 'extra' ? 'Extra node in ' + show(bad.matcher) : 'Mismatch: ' + show(bad.matcher);
            }
        });
        return errors;
    }, [state, gleam.bads]);

    const refs: Record<number, HTMLElement> = useMemo(() => ({}), []);

    const xml = useMemo(() => (gleam.result ? toXML(gleam.result) : null), [gleam.result]);
    const xmlcst = useMemo(() => nodeToXML(rootNode), [rootNode]);
    const styles: Record<number, Style> = {};
    Object.entries(c.meta).forEach(([key, meta]) => {
        if (styleKinds[meta.kind]) {
            styles[+key] = styleKinds[meta.kind];
        }
    });

    // const [ps, sps] = useState(null as null | { left: number; top: number; height: number });
    // useLayoutEffect(() => {
    //     const msp = selectionPos(state.sel, refs, state.top);
    //     sps(msp);
    // }, [state.sel, state.top]);

    return (
        <div style={{ display: 'flex', inset: 0, position: 'absolute', flexDirection: 'column' }}>
            {/* {ps ? (
                <div
                    style={{
                        position: 'absolute',
                        top: ps.top,
                        left: ps.left,
                        width: 3,
                        height: ps.height,
                        background: 'red',
                        pointerEvents: 'none',
                    }}
                />
            ) : null} */}

            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: 50, paddingBottom: 0, minHeight: 0 }}>
                <RenderNode
                    loc={state.top.root}
                    parent={{ root: { ids: [], top: '' }, children: [] }}
                    state={state}
                    inRich={false}
                    ctx={{
                        errors,
                        refs,
                        styles,
                        msel: mkeys,
                        dispatch(up) {
                            setState((s) => applyUpdate(s, up));
                        },
                    }}
                />
            </div>
            {JSON.stringify(state.sel)}
            {xml ? (
                <XMLShow
                    xml={xml}
                    state={state}
                    refs={refs}
                    spans={gleam.spans}
                    dispatch={(up) => {
                        setState((s) => applyUpdate(s, up));
                    }}
                />
            ) : null}
            <div style={{ display: 'flex', flex: 3, minHeight: 0, whiteSpace: 'nowrap' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: 25 }}>
                    <h3>CST</h3>
                    <ShowXML root={xmlcst} />
                </div>
                <div style={{ flex: 3, overflow: 'auto', padding: 25 }}>
                    <h3>AST</h3>
                    {xml ? <ShowXML root={xml} /> : 'NO xml'}
                    <div style={{ marginTop: 50, whiteSpace: 'pre-wrap' }}>
                        {gleam.bads.map((er, i) => (
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
    spans: { start: Loc; end?: Loc }[];
    state: TestState;
    xml: XML;
    refs: Record<string, HTMLElement>;
    dispatch: (up: Update | void) => void;
}) => {
    // const alls = useMemo(() => {
    //     const lst: XML[] = [];
    //     walxml(xml, (m) => {
    //         if (!m.src) return;
    //         if (m.src.right || state.top.nodes[m.src.left[0].idx].type !== 'id') {
    //             lst.push(m);
    //         }
    //     });
    //     return lst;
    // }, [xml, state]);

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
            .map(({ start, end }) => {
                if (!end) return null;
                const sides = pos(start, end);
                if (!sides) return null;
                return { sides, span: { start, end } };
            })
            .filter(Boolean) as { sides: [number, number]; node?: XML; span: Span }[];
        posed.sort((a, b) => a.sides[1] - a.sides[0] - (b.sides[1] - b.sides[0]));

        const placed: { node?: XML; sides: [number, number]; span: Span }[][] = [[]];
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
    const [placed, setPlaced] = useState<{ node?: XML; sides: [number, number]; span: Span }[][]>([]);
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
                                        const st = all[span.start[0].idx];
                                        if (!span.end) {
                                            return;
                                        }
                                        const ssel = selectStart(st, state.top);
                                        if (!ssel) return;

                                        const ed = all[span.end[0].idx];
                                        dispatch({
                                            nodes: {},
                                            selection: {
                                                start: ssel,
                                                end: selEnd(ed),
                                            },
                                        });
                                        console.log(span, all[span.start[0].idx]);
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

const allPaths = (top: Top) => {
    const paths: Record<number, Path> = {};
    const add = (id: number, parent: Path) => {
        const path = pathWithChildren(parent, id);
        paths[id] = path;

        const node = top.nodes[id];
        const children = childLocs(node);
        children.forEach((child) => add(child, path));
    };
    add(top.root, { children: [], root: { ids: [], top: '' } });
    return paths;
};
