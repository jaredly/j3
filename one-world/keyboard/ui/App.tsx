import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { useLatest } from '../../../web/custom/useLatest';
import { applyUpdate } from '../applyUpdate';
import { handleDelete } from '../handleDelete';
import { handleKey } from '../handleKey';
import { init, js, TestState } from '../test-utils';

import { useLocalStorage } from '../../../web/Debug';
import { shape } from '../../shared/shape';
import { parse, show } from '../../syntaxes/dsl';
import { kwds, matchers, toXML } from '../../syntaxes/gleam2';
import { handleNav } from '../handleNav';
import { handleShiftNav, handleSpecial, Mods } from '../handleShiftNav';
import { closerKind, handleClose, handleWrap, wrapKind } from '../handleWrap';
import { root } from '../root';
import { RenderNode } from './RenderNode';
import { ShowXML } from './XML';
import { nodeToXML, XML } from '../../syntaxes/xml';
import { Loc } from '../../shared/cnodes';

const keyUpdate = (state: TestState, key: string, mods: Mods) => {
    if (key === 'Enter') key = '\n';
    if (key === 'Backspace') {
        return handleDelete(state);
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        return mods.shift ? handleShiftNav(state, key) : handleNav(key, state);
    } else if (splitGraphemes(key).length > 1) {
        console.log('ignoring', key);
    } else if (wrapKind(key)) {
        return handleWrap(state, key);
    } else if (closerKind(key)) {
        return handleClose(state, key);
    } else if (mods.meta || mods.ctrl || mods.alt) {
        return handleSpecial(state, key, mods);
    } else {
        return handleKey(state, key, js);
    }
};

export const App = () => {
    const [state, setState] = useLocalStorage('nuniiverse', () => init);

    const cstate = useLatest(state);
    // @ts-ignore
    window.state = state;

    useEffect(() => {
        const f = (evt: KeyboardEvent) => {
            let key = evt.key;
            const up = keyUpdate(cstate.current, evt.key, { meta: evt.metaKey, ctrl: evt.ctrlKey, alt: evt.altKey, shift: evt.shiftKey });
            if (!up) return;
            evt.preventDefault();
            evt.stopPropagation();
            setState(applyUpdate(state, up));
        };
        document.addEventListener('keydown', f);
        return () => document.removeEventListener('keydown', f);
    });

    const rootNode = root(state, (idx) => [{ id: '', idx }]);

    const gleam = parse(matchers.stmt, rootNode, { matchers: matchers, kwds: kwds });
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

    // const gnodes = useMemo(() => {
    //     if (!gleam.result) {
    //         return [];
    //     }
    //     const res: { left: number; right: number; text: string }[] = [];
    //     const add = (node: { type: string; src: { left: Loc; right?: Loc } }) => {
    //         res.push({ text: node.type, left: node.src.left[0].idx, right: node.src.right?.[0].idx ?? node.src.left[0].idx });
    //     };
    //     visitStmt(gleam.result, {
    //         stmt(s) {
    //             add(s);
    //         },
    //         expr(e) {
    //             add(e);
    //         },
    //         pat(p) {
    //             add(p);
    //         },
    //         sexpr(e) {
    //             add(e);
    //         },
    //     });
    // }, [gleam.result]);

    return (
        <div style={{ display: 'flex', inset: 0, position: 'absolute', flexDirection: 'column' }}>
            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: 50, paddingBottom: 0, minHeight: 0 }}>
                <RenderNode loc={state.top.root} state={state} inRich={false} ctx={{ errors, refs }} />
            </div>
            {xml ? <XMLShow xml={xml} state={state} refs={refs} /> : null}
            {/* <div>{shape(root(state))}</div>
            <div>
                {state.top.root} : {state.top.nextLoc}
            </div> */}
            {/* <button
                onClick={(evt) => {
                    setState(init);
                    evt.currentTarget.blur();
                }}
            >
                Clear
            </button> */}
            <div style={{ display: 'flex', flex: 3, minHeight: 0, whiteSpace: 'nowrap' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: 25 }}>
                    <h3>CST</h3>
                    <ShowXML root={xmlcst} />
                </div>
                <div style={{ flex: 3, overflow: 'auto', padding: 25 }}>
                    <h3>AST</h3>
                    {xml ? <ShowXML root={xml} /> : 'NO xml'}
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

const XMLShow = ({ xml, refs, state }: { state: TestState; xml: XML; refs: Record<string, HTMLElement> }) => {
    const alls = useMemo(() => {
        const lst: XML[] = [];
        walxml(xml, (m) => {
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

    // const [_, setTick] = useState(0);
    // useEffect(() => {
    //     setTimeout(() => {
    //         setTick(1);
    //     }, 10);
    // }, []);
    const calc = () => {
        const posed = alls
            .map((node) => {
                const sides = pos(node.src.left, node.src.right);
                if (!sides) return null;
                return { sides, node };
            })
            .filter(Boolean) as { sides: [number, number]; node: XML }[];
        posed.sort((a, b) => a.sides[1] - a.sides[0] - (b.sides[1] - b.sides[0]));

        const placed: { node: XML; sides: [number, number] }[][] = [[]];
        posed.forEach(({ node, sides }) => {
            for (let i = 0; i < placed.length; i++) {
                const row = placed[i];
                if (!row.some((one) => collides(one.sides, sides))) {
                    row.push({ node, sides });
                    return;
                }
            }
            placed.push([{ node, sides }]);
        });
        return placed;
    };
    const [placed, setPlaced] = useState<{ node: XML; sides: [number, number] }[][]>([]);
    useLayoutEffect(() => {
        // setTimeout(() => {
        setPlaced(calc());
        // }, 10);
    }, [state, xml]);

    return (
        <div>
            {placed.map((row, i) => {
                return (
                    <div key={i} style={{ position: 'relative', height: 6 }}>
                        {row.map(({ node, sides }, j) => {
                            return (
                                <div
                                    key={j}
                                    style={{
                                        position: 'absolute',
                                        left: sides[0],
                                        width: sides[1] - sides[0],
                                        backgroundColor: 'rgba(200,200,255)',
                                        marginTop: 2,
                                        height: 4,
                                        // height: 4,
                                        // fontSize: 8,
                                        borderRadius: 4,
                                        // padding: 2,
                                    }}
                                >
                                    {/* {node.tag} */}
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
