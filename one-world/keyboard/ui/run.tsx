import React, { useEffect, useState } from 'react';
import { isRich, Node, Style } from '../../shared/cnodes';
import { lastChild, NodeSelection, Top } from '../utils';
import { init, js, TestState } from '../test-utils';
import { interleave, interleaveF } from '../interleave';
import { cursorSplit } from '../cursorSplit';
import { cursorSides } from '../cursorSides';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { createRoot, Root } from 'react-dom/client';
import { handleDelete } from '../handleDelete';
import { useLatest } from '../../../web/custom/useLatest';
import { applyUpdate } from '../applyUpdate';
import { handleKey } from '../handleKey';

import { root } from '../root';
import { asStyle, shape } from '../../shared/shape';
import { handleNav } from '../handleNav';
import { textCursorSides, textCursorSides2 } from '../insertId';
import { closerKind, handleClose, handleWrap, wrapKind } from '../handleWrap';
import { handleShiftNav, handleSpecial } from '../handleShiftNav';
import { useLocalStorage } from '../../../web/Debug';
export {};

const opener = { round: '(', square: '[', curly: '{', angle: '<' };
const closer = { round: ')', square: ']', curly: '}', angle: '>' };

const hl = 'rgba(100,100,100,0.2)';

const Cursor = () => (
    <span
        style={{
            display: 'inline-block',
            width: 2,
            marginRight: -1,
            marginLeft: -1,
            marginBottom: -4,
            height: '1em',
            backgroundColor: 'red',
            zIndex: -1,
            position: 'relative',
        }}
    />
);

const RenderNode = ({ loc, state, inRich }: { loc: number; state: TestState; inRich: boolean }) => {
    const node = state.top.nodes[loc];
    const cursor = loc === lastChild(state.sel.start.path) ? state.sel.start.cursor : null;
    switch (node.type) {
        case 'id':
            if (cursor?.type === 'id') {
                const { left, right } = cursorSides(cursor);
                const text = cursor.text ?? splitGraphemes(node.text);
                return (
                    <span>
                        {text.slice(0, left).join('')}
                        {left === right ? <Cursor /> : <span style={{ background: hl }}>{text.slice(left, right).join('')}</span>}
                        {text.slice(right).join('')}
                    </span>
                );
            }
            return <span>{node.text}</span>;
        case 'list':
            const children = node.children.map((loc) => <RenderNode key={loc} loc={loc} state={state} inRich={isRich(node.kind)} />);
            if (typeof node.kind !== 'string') {
                return <span>lol</span>;
            }
            switch (node.kind) {
                case 'smooshed':
                    return <span>{children}</span>;
                case 'spaced':
                    return (
                        <span>
                            {interleaveF(children, (i) => (
                                <span key={'sep' + i}>&nbsp;</span>
                            ))}
                        </span>
                    );
                default:
                    return (
                        <span>
                            {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor /> : null}
                            {cursor?.type === 'list' && cursor.where === 'start' ? (
                                <span style={{ background: hl }}>{opener[node.kind]}</span>
                            ) : (
                                opener[node.kind]
                            )}
                            {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}
                            {interleaveF(children, (i) => (
                                <span key={'sep' + i}>,&nbsp;</span>
                            ))}
                            {cursor?.type === 'list' && cursor.where === 'end' ? (
                                <span style={{ background: hl }}>{closer[node.kind]}</span>
                            ) : (
                                closer[node.kind]
                            )}
                            {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
                        </span>
                    );
            }
        case 'text': {
            const sides = cursor?.type === 'text' ? textCursorSides2(cursor) : null;
            const children = node.spans.map((span, i) => {
                if (span.type === 'text') {
                    if (sides && sides.left.index <= i && sides.right.index >= i) {
                        const text = sides.text?.index === i ? sides.text.grems : splitGraphemes(span.text);
                        const left = i === sides.left.index ? sides.left.cursor : 0;
                        const right = i === sides.right.index ? sides.right.cursor : text.length;
                        return (
                            <span key={i} style={asStyle(span.style)}>
                                {text.slice(0, left).join('')}
                                {left === right && sides.left.index === sides.right.index ? (
                                    <Cursor />
                                ) : (
                                    <span style={{ background: hl }}>{text.slice(left, right).join('')}</span>
                                )}
                                {text.slice(right).join('')}
                            </span>
                        );
                    }
                    // TODO show cursor here
                    return (
                        <span key={i} style={asStyle(span.style)}>
                            {span.text}
                        </span>
                    );
                } else if (span.type === 'embed') {
                    return <RenderNode key={i} inRich={false} loc={span.item} state={state} />;
                } else {
                    return <span key={i}>custom?</span>;
                }
            });
            if (inRich) {
                // no quotes, and like ... some other things
                // are maybe different?
                return (
                    <span>
                        {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}
                        {children}
                    </span>
                );
            }
            return (
                <span style={{ backgroundColor: 'rgba(255,255,0,0.2)' }}>
                    {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor /> : null}
                    {cursor?.type === 'list' && cursor.where === 'start' ? <span style={{ background: hl }}>"</span> : '"'}
                    {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}
                    {children}
                    {cursor?.type === 'list' && cursor.where === 'end' ? <span style={{ background: hl }}>"</span> : '"'}
                    {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
                </span>
            );
        }
        case 'table':
            return <span>Table</span>;
    }
};

const getRoot = (): Root => {
    // @ts-ignore
    return window._root ?? (window._root = createRoot(document.getElementById('root')!));
};

const App = () => {
    const [state, setState] = useLocalStorage('nuniiverse', () => init);

    const cstate = useLatest(state);
    // @ts-ignore
    window.state = state;

    useEffect(() => {
        const f = (evt: KeyboardEvent) => {
            let key = evt.key;
            if (key === 'Enter') key = '\n';
            if (key === 'Backspace') {
                const up = handleDelete(cstate.current);
                setState(applyUpdate(cstate.current, up));
            } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
                const up = evt.shiftKey ? handleShiftNav(cstate.current, key) : handleNav(key, cstate.current);
                setState(applyUpdate(cstate.current, up));
            } else if (splitGraphemes(key).length > 1) {
                console.log('ignoring', key);
            } else if (wrapKind(key)) {
                setState(applyUpdate(cstate.current, handleWrap(cstate.current, key)));
            } else if (closerKind(key)) {
                setState(applyUpdate(cstate.current, handleClose(cstate.current, key)));
            } else if (evt.metaKey || evt.ctrlKey || evt.altKey) {
                setState(
                    applyUpdate(
                        cstate.current,
                        handleSpecial(cstate.current, key, { meta: evt.metaKey, ctrl: evt.ctrlKey, alt: evt.altKey, shift: evt.shiftKey }),
                    ),
                );
            } else {
                setState(applyUpdate(cstate.current, handleKey(cstate.current, key, js)));
            }
        };
        document.addEventListener('keydown', f);
        return () => document.removeEventListener('keydown', f);
    });

    return (
        <>
            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', wordBreak: 'break-all', marginBottom: 100 }}>
                <RenderNode loc={state.top.root} state={state} inRich={false} />
            </div>
            <div>{shape(root(state))}</div>
            <div>
                {state.top.root} : {state.top.nextLoc}
            </div>
            <div>{JSON.stringify(state.sel)}</div>
            <button
                onClick={(evt) => {
                    setState(init);
                    evt.currentTarget.blur();
                }}
            >
                Clear
            </button>
        </>
    );
};

getRoot().render(<App />);
