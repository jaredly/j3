import { useEffect, useMemo, useState } from 'react';
import { init, js, TestState } from '../test-utils';
import React from 'react';
import { RenderNode } from './RenderNode';
import { applyUpdate } from '../applyUpdate';
import { keyUpdate } from './keyUpdate';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { ShowXML } from './XML';
import { nodeToXML } from '../../syntaxes/xml';
import { root } from '../root';

const examples = [
    // '23.3',
    '+23.3',
    'person.2.3',
    '127.0.0.1',
    'localhost:8080',
    // '1.23e370',
    // 'let x = (x,y) => {\nlet z = 12;z + 4}',
];

type State = { state: TestState; running: boolean; at: number };

const Example = ({ text }: { text: string[] }) => {
    const [state, setState] = useState({ state: init, running: false, at: 0 });
    useEffect(() => {
        if (!state.running) return;
        const v = setInterval(() => {
            setState((st) => {
                if (st.at >= text.length) return { ...st, running: false };
                return { ...st, at: st.at + 1, state: applyUpdate(st.state, keyUpdate(st.state, text[st.at], {}, undefined, js)) };
            });
        }, 150);
        return () => clearInterval(v);
    }, [state.running]);

    const rootNode = root(state.state, (idx) => [{ id: '', idx }]);
    const xmlcst = useMemo(() => nodeToXML(rootNode), [rootNode]);

    return (
        <div style={{ padding: 12 }}>
            <span>{text.join('')}</span>
            <button
                onClick={() =>
                    setState((s) => ({ ...s, running: true, state: s.at === text.length ? init : s.state, at: s.at === text.length ? 0 : s.at }))
                }
                style={{ marginLeft: 8 }}
            >
                ▶️
            </button>
            <div style={{ padding: 12 }}>
                <RenderNode
                    loc={state.state.top.root}
                    parent={{ root: { ids: [], top: '' }, children: [] }}
                    state={state.state}
                    inRich={false}
                    ctx={{
                        selectionStatuses: {},
                        errors: {},
                        refs: {},
                        styles: {},
                        placeholders: {},
                        msel: null,
                        mhover: null,
                        dispatch(up) {
                            // setState((s) => applyUpdate(s, up));
                        },
                    }}
                />
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
                <ShowXML root={xmlcst} onClick={() => {}} setHover={() => {}} sel={[]} />
            </div>
        </div>
    );
};

export const Examples = () => {
    // here we are
    return (
        <div>
            {examples.map((ex) => (
                <Example text={splitGraphemes(ex)} />
            ))}
        </div>
    );
};
