import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from './StoreContext';
import { HiddenInput, useKeyListener } from './HiddenInput';
import { Node } from '../shared/nodes';
import { specials } from './keyboard';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { useLatest } from '../../web/custom/useLatest';

export const Edit = () => {
    const params = useParams();
    const id = params.id;
    if (!id) throw new Error(`no id specified`);

    const store = useStore();
    const doc = useSubscribe(
        (f) => store.onDoc(id, f),
        () => store.getState().documents[id],
        [id],
    );

    return (
        <HiddenInput>
            <div style={{ padding: 100 }}>
                Editing {doc.title}
                <DocNode doc={doc.id} id={0} />
                {/** ok */}
            </div>
        </HiddenInput>
    );
};

const useSubscribe = <T,>(
    sub: (f: () => void) => () => void,
    get: () => T,
    deps: any[],
) => {
    const [value, update] = useState(get());
    useEffect(() => sub(() => update(get())), deps);
    return value;
};

const useDocNode = (did: string, id: number) => {
    const store = useStore();
    return useSubscribe(
        (f) => store.onDocNode(did, id, f),
        () => store.getState().documents[did].nodes[id],
        [did, id],
    );
};

const useToplevel = (id: string) => {
    const store = useStore();
    return useSubscribe(
        (f) => store.onTop(id, f),
        () => store.getState().toplevels[id],
        [id],
    );
};

const useTopNode = (id: string, loc: number) => {
    const store = useStore();
    return useSubscribe(
        (f) => store.onTopNode(id, loc, f),
        () => store.getState().toplevels[id].nodes[loc],
        [id, loc],
    );
};

const Id = ({
    node,
}: {
    node: {
        type: 'id' | 'stringText' | 'accessText';
        text: string;
        loc: number;
    };
}) => {
    const [text, setText] = useState(null as null | string[]);
    const [sel, setSel] = useState(null as null | number);
    const [blink, setBlink] = useState(true);
    const bid = useRef(null as null | Timer);

    const latest = useLatest({ text, sel });

    useKeyListener(sel != null, (key, mods) => {
        const { text, sel } = latest.current;
        if (sel == null) return;

        setBlink(false);

        clearTimeout(bid.current!);
        bid.current = setTimeout(() => setBlink(true), 200);

        const emes = text ?? splitGraphemes(node.text);

        if (specials[key]) {
            const action = specials[key](
                sel === emes.length ? 'end' : sel === 0 ? 'start' : 'middle',
                sel,
                emes,
            );
            if (action?.type === 'update') {
                setText(action.text);
                setSel(action.cursor);
            }
            return;
        }
        const extra = splitGraphemes(key);
        if (extra.length > 1) {
            console.log('Too many graphemes? What is this', key, extra);
            return;
        }
        setText([...emes.slice(0, sel), ...extra, ...emes.slice(sel)]);
        setSel(sel + extra.length);
    });

    return (
        <span
            onClick={() => setSel(0)}
            style={{
                padding: 4,
                backgroundColor: '#222',
                boxSizing: 'border-box',
            }}
        >
            {sel != null && text != null ? (
                <>
                    {text.slice(0, sel).join('')}
                    <span style={cursorStyle(blink)}>|</span>
                    {text.slice(sel).join('')}
                </>
            ) : (
                text?.join('') ?? node.text
            )}
        </span>
    );
};

const cursorStyle = (blink: boolean) =>
    ({
        width: 0,
        display: 'inline-block',
        marginLeft: -7,
        marginRight: 7,
        fontSize: 23,
        top: 3,
        position: 'relative',
        marginTop: -7,
        animationDuration: '1s',
        animationName: blink ? 'blink' : 'unset',
        animationIterationCount: 'infinite',
    } as const);

const TopNode = ({ id, loc }: { id: string; loc: number }) => {
    const node = useTopNode(id, loc);
    if (
        node.type === 'id' ||
        node.type === 'accessText' ||
        node.type === 'stringText'
    ) {
        return <Id node={node} />;
    }
    return <span>some other {node.type}</span>;
};

const Toplevel = ({ id }: { id: string }) => {
    const store = useStore();
    const top = useToplevel(id);
    return (
        <div>
            <TopNode id={id} loc={top.root} />
        </div>
    );
    // todo know about focus
    // useKeyListener(true, (key, mods) => {
    // })
};

const DocNode = ({ doc, id }: { doc: string; id: number }) => {
    const node = useDocNode(doc, id);
    return (
        <div>
            {id === 0 ? null : (
                <div>
                    A doc node toplevel: <Toplevel id={node.toplevel} />
                </div>
            )}
            <div style={{ paddingLeft: id === 0 ? 0 : 20 }}>
                {node.children.map((id) => (
                    <DocNode key={id} id={id} doc={doc} />
                ))}
            </div>
        </div>
    );
};
