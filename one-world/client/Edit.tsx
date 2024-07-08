import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
        <div style={{ padding: 100 }}>
            Editing {doc.title}
            <DocNode doc={doc.id} id={0} />
            {/** ok */}
        </div>
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
    const dnode = useSubscribe(
        (f) => store.onDocNode(did, id, f),
        () => store.getState().documents[did].nodes[id],
        [did, id],
    );
    return dnode;
};

const DocNode = ({ doc, id }: { doc: string; id: number }) => {
    const node = useDocNode(doc, id);
    return (
        <div>
            {id === 0 ? null : <div>A doc node toplevel: {node.toplevel}</div>}
            <div style={{ paddingLeft: id === 0 ? 0 : 20 }}>
                {node.children.map((id) => (
                    <DocNode key={id} id={id} doc={doc} />
                ))}
            </div>
        </div>
    );
};
