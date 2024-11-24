import React, { useEffect, useMemo } from 'react';
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

    const gleam = parse(
        matchers.stmt,
        root(state, (idx) => [{ id: '', idx }]),
        { matchers: matchers, kwds: kwds },
    );
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
        <>
            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginBottom: 100 }}>
                <RenderNode loc={state.top.root} state={state} inRich={false} ctx={{ errors, refs }} />
            </div>
            <div>{shape(root(state))}</div>
            <div>
                {state.top.root} : {state.top.nextLoc}
            </div>
            {/* <div>{JSON.stringify(state.sel)}</div>
            <div>{JSON.stringify(gleam.result ?? 'No result')}</div>
            <div>
                {gleam.bads.map((bad, i) => (
                    <div style={{ paddingTop: 16 }}>{JSON.stringify(bad)}</div>
                ))}
            </div> */}
            <button
                onClick={(evt) => {
                    setState(init);
                    evt.currentTarget.blur();
                }}
            >
                Clear
            </button>
            {xml ? <ShowXML root={xml} /> : 'NO xml'}
        </>
    );
};
