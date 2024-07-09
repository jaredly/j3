import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiddenInput } from './HiddenInput';
import { Id } from './TextEdit/Id';
import { useStore } from './StoreContext';

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

const TopNode = ({ id, loc }: { id: string; loc: number }) => {
    const node = useTopNode(id, loc);
    if (
        node.type === 'id' ||
        node.type === 'accessText' ||
        node.type === 'stringText'
    ) {
        return <Id node={node} tid={id} />;
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
