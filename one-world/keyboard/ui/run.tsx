import React, { useEffect, useState } from 'react';
import { isRich, Node } from '../../shared/cnodes';
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
import { shape } from '../../shared/shape';
import { handleNav } from '../handleNav';
import { textCursorSides } from '../insertId';
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
            const children = node.spans.map((span, i) => {
                if (span.type === 'text') {
                    if (cursor?.type === 'text' && cursor.end.index === i) {
                        const { left, right } = textCursorSides(cursor);
                        const text = cursor.end.text ?? splitGraphemes(span.text);
                        return (
                            <span key={i}>
                                {text.slice(0, left).join('')}
                                {left === right ? <Cursor /> : <span style={{ background: hl }}>{text.slice(left, right).join('')}</span>}
                                {text.slice(right).join('')}
                            </span>
                        );
                    }
                    // TODO show cursor here
                    return <span key={i}>{span.text}</span>;
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
    const [state, setState] = useState(init);

    const cstate = useLatest(state);

    useEffect(() => {
        const f = (evt: KeyboardEvent) => {
            if (evt.key === 'Backspace') {
                const up = handleDelete(cstate.current);
                setState(applyUpdate(cstate.current, up));
            } else if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
                const up = handleNav(evt.key, cstate.current);
                setState(applyUpdate(cstate.current, up));
            } else if (splitGraphemes(evt.key).length > 1) {
                console.log('ignoring', evt.key);
            } else {
                const up = handleKey(cstate.current, evt.key, js);
                setState(applyUpdate(cstate.current, up));
            }
        };
        document.addEventListener('keydown', f);
        return () => document.removeEventListener('keydown', f);
    });

    return (
        <>
            <RenderNode loc={state.top.root} state={state} inRich={false} />
            <div>{shape(root(state))}</div>
            <div>
                {Object.keys(state.top.nodes)} : {state.top.root} : {state.top.nextLoc}
            </div>
            <div>{JSON.stringify(state.sel)}</div>
        </>
    );
};

getRoot().render(<App />);
