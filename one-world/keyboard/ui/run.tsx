import React, { useEffect, useState } from 'react';
import { Node } from '../../shared/cnodes';
import { lastChild, NodeSelection, Top } from '../utils';
import { init, TestState } from '../test-utils';
import { interleave, interleaveF } from '../flatenate';
import { cursorSides, cursorSplit } from '../cursorSplit';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { createRoot, Root } from 'react-dom/client';
import { handleDelete } from '../handleDelete';
import { useLatest } from '../../../web/custom/useLatest';
import { applyUpdate } from '../applyUpdate';
import { handleKey } from '../handleKey';

import { root } from '../root';
import { shape } from '../../shared/shape';
import { handleNav } from '../handleNav';
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
            height: '1em',
            backgroundColor: 'red',
        }}
    />
);

const RenderNode = ({ loc, state }: { loc: number; state: TestState }) => {
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
            const children = node.children.map((loc) => <RenderNode key={loc} loc={loc} state={state} />);
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
        case 'text':
            return <span>"yes"</span>;
        case 'table':
            return <span>Table</span>;
    }
};

const getRoot = (): Root => {
    // @ts-ignore
    return window._root ?? (window._root = createRoot(document.getElementById('root')!));
};

const lisp = {
    punct: '.=#@;+',
    space: '',
    sep: ' ',
};

const js = {
    // punct: [],
    // so js's default is just 'everything for itself'
    // tight: [...'~`!@#$%^&*_+-=\\./?:'],
    punct: '~`!@#$%^&*_+-=\\./?:',
    space: ' ',
    sep: ';,\n',
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
            <RenderNode loc={state.top.root} state={state} />
            <div>{shape(root(state))}</div>
            <div>{JSON.stringify(state.sel)}</div>
        </>
    );
};

getRoot().render(<App />);
