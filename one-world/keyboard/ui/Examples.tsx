import { useEffect, useMemo, useState } from 'react';
import { Config, init, js, lisp, TestState } from '../test-utils';
import React from 'react';
import { DisplayConfig, RenderNode } from './RenderNode';
import { applyUpdate } from '../applyUpdate';
import { keyUpdate } from './keyUpdate';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { ShowXML } from './XML';
import { nodeToXML } from '../../syntaxes/xml';
import { root } from '../root';
import { lastChild, pathWithChildren, selStart } from '../utils';

/*
Things to showcase:

- identifier
- list


*/

const examples = [
    // '23.3',
    '+23.3',
    'person.2.3',
    '127.0.0.1',
    'localhost:8080',
    // '1.23e370',
    'let x = (x,y) => {\nlet z = 12;z + 4}',
];

type State = { state: TestState; running: boolean; at: number };

const precompute = (text: string[], config: Config) => {
    let state = init;
    text.forEach((grem) => {
        if (grem === '\r') {
            const path = state.sel.start.path;
            const node = state.top.nodes[lastChild(path)];
            state = applyUpdate(state, {
                nodes: {
                    [node.loc]: { type: 'list', kind: { type: 'plain' }, children: [state.top.nextLoc], loc: node.loc },
                    [state.top.nextLoc]: { type: 'text', loc: state.top.nextLoc, spans: [{ type: 'text', text: '' }] },
                },
                selection: { start: selStart(pathWithChildren(path, state.top.nextLoc), { type: 'text', end: { index: 0, cursor: 0 } }) },
                nextLoc: state.top.nextLoc + 1,
            });
            return;
        }

        if (grem === '\t') {
            grem = 'Tab';
        } else if (grem === '\n') {
            grem = 'Enter';
        }
        if (grem === '\b') {
            state = applyUpdate(state, keyUpdate(state, 'i', { meta: true }, undefined, config));
        } else {
            state = applyUpdate(state, keyUpdate(state, grem, {}, undefined, config));
        }
    });
    return { state, running: false, at: text.length };
};

const Example = ({ text }: { text: string[] }) => {
    const [state, setState] = useState(precompute(text, js));
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
                    top={state.state.top}
                    inRich={false}
                    ctx={{
                        drag: { dragging: false, start() {}, move() {} },
                        config: { sep: { curly: ';', round: ',', square: ',' } },
                        selectionStatuses: {},
                        errors: {},
                        refs: {},
                        styles: {},
                        placeholders: {},
                        // msel: null,
                        // mhover: null,
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
    if (true) {
        return (
            <div
                style={{
                    position: 'absolute',
                    inset: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingBottom: 50,
                }}
            >
                <h1>Concrete Syntax Tree</h1>
                <p>The missing layer between "plain text" and "abstract syntax".</p>
                <h2>Lisp style</h2>
                <ExTable examples={lispEx} config={lisp} dconfig={{ sep: { curly: ' ', round: ' ', square: ' ' } }} />
                <h2>C style</h2>
                <ExTable examples={jsEx} config={js} dconfig={{ sep: { curly: '; ', round: ', ', square: ', ' } }} />
                <h2>Going beyond "plain text"</h2>
                <ExTable examples={coolEx} config={js} dconfig={{ sep: { curly: '; ', round: ', ', square: ', ' } }} />
                <div style={{ flexBasis: 500, flexShrink: 0, width: 10 }} />
            </div>
        );
    }

    return (
        <div>
            {examples.map((ex) => (
                <Example text={splitGraphemes(ex)} />
            ))}
        </div>
    );
};

const lispEx: [string, string][] = [
    ['id', 'abc'],
    ['list(round)', '(abc def)'],
    ['list(square)', '[abc def]'],
    ['list(curly)', '{1 2 3}'],
    ['string', '"string w/ ${(str vbl)}"'],
    ['method defn', '(def dup [x] (* x x))'],
];

const jsEx: [string, string][] = [
    ['id', 'abc'],
    ['list(round)', '(abc,def)'],
    ['list(square)', '[abc,def]'],
    ['list(curly)', '{1,2,3}'],
    ['attributes', 'hello.world'],
    ['function calls', 'hello(the,world)'],
    ['lambda, binop', '(one,two) => one + two'],
    ['type annotation, return', '{\nlet x:int = 10;return f(x)}'],
];

const coolEx: [string, string][] = [
    ['Table(curly)', 'let person = {:name:"me"\nage\t3;cows\t7'],
    ['Table(square)', '[:1:0:0\n0:1:0;0\t0\t1'],
    ["JSX y'all", '</div>"Hello world",</fancy(expr) id:"xyz"\t\tchild\nchild'],
    ['rich text', '\rRich text\nin a block, with \bformatting\b.\n- and bullets\nfor lists\n\n[ ] and checkboxes\nfor todo items'],
];

const ExTable = ({ examples, config, dconfig }: { examples: [string, string][]; config: Config; dconfig: DisplayConfig }) => {
    const states = useMemo(() => {
        return examples.map((ex) => precompute(splitGraphemes(ex[1]), config));
    }, [examples]);

    const xmls = useMemo(() => states.map((state, i) => nodeToXML(root(state.state, (idx) => [{ id: '', idx }]))), [states]);

    return (
        <div>
            <div
                style={{
                    padding: 12,
                    display: 'grid',
                    rowGap: 32,
                    columnGap: 24,
                    gridTemplateColumns: 'min-content max-content 1fr',
                }}
            >
                {/* <div style={{ gridColumn: 1, padding: '8px 12px', fontStyle: 'italic' }}>{examples[i][0]}</div> */}
                <div style={{ gridColumn: 1, fontWeight: 'bold' }}>Title</div>
                <div style={{ gridColumn: 2, fontWeight: 'bold' }}>Code</div>
                <div style={{ gridColumn: 3, fontWeight: 'bold' }}>Representation</div>
                {states.map((state, i) => (
                    <React.Fragment key={i}>
                        <div style={{ gridColumn: 1, fontStyle: 'italic' }}>{examples[i][0]}</div>
                        <div style={{ gridColumn: 2 }}>
                            <RenderNode
                                loc={state.state.top.root}
                                parent={{ root: { ids: [], top: '' }, children: [] }}
                                top={state.state.top}
                                inRich={false}
                                ctx={{
                                    config: dconfig,
                                    drag: { dragging: false, start() {}, move() {} },
                                    selectionStatuses: {},
                                    errors: {},
                                    refs: {},
                                    styles: {},
                                    placeholders: {},
                                    dispatch(up) {},
                                }}
                            />
                        </div>
                        <div style={{ gridColumn: 3 }}>
                            <ShowXML root={xmls[i]} onClick={() => {}} setHover={() => {}} sel={[]} />
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
