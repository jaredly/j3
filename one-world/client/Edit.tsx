import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiddenInput } from './HiddenInput';
import { Id } from './TextEdit/Id';
import { useStore } from './StoreContext';
import { Node, Path } from '../shared/nodes';

const emptyNodes: number[] = [];

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
                <DocNode doc={doc.id} id={0} parentNodes={emptyNodes} />
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
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
        } else {
            // On change in dependencies, do a fresh get()
            update(get());
        }
        return sub(() => update(get()));
    }, deps);
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

const TopNode = ({
    id,
    loc,
    parentPath,
}: {
    id: string;
    loc: number;
    parentPath: Path;
}) => {
    const node = useTopNode(id, loc);
    const path = useMemo(
        () => ({ ...parentPath, children: parentPath.children.concat([loc]) }),
        [loc, parentPath],
    );
    if (!node) return null;
    if (
        node.type === 'id' ||
        node.type === 'accessText' ||
        node.type === 'stringText'
    ) {
        return <Id path={path} node={node} tid={id} />;
    }
    if (
        node.type === 'list' ||
        node.type === 'array' ||
        node.type === 'record'
    ) {
        return <Collection node={node} tid={id} path={path} />;
    }
    return <span>some other {node.type}</span>;
};

const Collection = ({
    node,
    tid,
    path,
}: {
    node: Extract<Node, { type: 'list' | 'array' | 'record' }>;
    tid: string;
    path: Path;
}) => {
    const [l, r] = { list: '()', array: '[]', record: '{}' }[node.type];
    return (
        <span>
            {l}
            <span style={{ gap: 8, display: 'inline-flex', flexWrap: 'wrap' }}>
                {node.items.map((loc) => (
                    <TopNode key={loc} id={tid} loc={loc} parentPath={path} />
                ))}
            </span>
            {r}
        </span>
    );
};

const Toplevel = ({
    id,
    doc,
    docNodes,
}: {
    id: string;
    doc: string;
    docNodes: number[];
}) => {
    const store = useStore();
    const top = useToplevel(id);
    const path: Path = useMemo(
        () => ({
            children: [],
            root: { type: 'doc-node', ids: docNodes, doc },
        }),
        [docNodes],
    );
    console.log('rendering toplevel here', top.root);
    return (
        <div>
            <TopNode id={id} loc={top.root} parentPath={path} />
        </div>
    );
    // todo know about focus
    // useKeyListener(true, (key, mods) => {
    // })
};

const DocNode = ({
    doc,
    id,
    parentNodes,
}: {
    doc: string;
    id: number;
    parentNodes: number[];
}) => {
    const node = useDocNode(doc, id);
    const docNodes = useMemo(() => parentNodes.concat([id]), [parentNodes, id]);
    return (
        <div>
            {id === 0 ? null : (
                <div>
                    A doc node toplevel:{' '}
                    <Toplevel
                        id={node.toplevel}
                        doc={doc}
                        docNodes={docNodes}
                    />
                </div>
            )}
            <div style={{ paddingLeft: id === 0 ? 0 : 20 }}>
                {node.children.map((id) => (
                    <DocNode
                        key={id}
                        id={id}
                        doc={doc}
                        parentNodes={docNodes}
                    />
                ))}
            </div>
        </div>
    );
};
