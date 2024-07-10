import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiddenInput } from './HiddenInput';
import { EditState, Id } from './TextEdit/Id';
import { useSessionId, useStore } from './StoreContext';
import { Node, Path, Selection, serializePath } from '../shared/nodes';
import { DocSession, NodeSelection } from '../shared/state';

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
        console.log('use subscribe setup');
        if (first.current) {
            first.current = false;
        } else {
            // On change in dependencies, do a fresh get()
            update(get());
        }
        return sub(() => {
            console.log('sub trigger');
            update(get());
        });
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

export type EditSelection =
    | { type: 'range'; start: Selection; cursor: Selection; text?: string[] }
    | { type: 'cursor'; cursor: Selection; text?: string[] };

// TODO: potential optimization, we could cache the pathKey on the selection object.
const findSelection = (
    docSession: DocSession,
    pathKey: string,
): NodeSelection | void => {
    for (let sel of docSession.selections) {
        switch (sel.type) {
            case 'within':
                if (sel.pathKey === pathKey) return sel;
                break;
            case 'without':
                if (sel.pathKey === pathKey) return sel;
                break;
            case 'multi':
                if (sel.cursor.pathKey === pathKey) return sel;
                if (sel.start?.pathKey === pathKey) return sel;
                break;
        }
    }
};

const useTopNode = (path: Path) => {
    const store = useStore();
    const state = store.getState();
    const dnode = path.root.ids[path.root.ids.length - 1];
    const top = state.documents[path.root.doc].nodes[dnode].toplevel;
    const loc = path.children[path.children.length - 1];
    const session = useSessionId();
    const node = useSubscribe(
        (f) => store.onTopNode(top, loc, f),
        () => store.getState().toplevels[top].nodes[loc],
        [top, loc],
    );
    const pathKey = useMemo(() => serializePath(path), [path]);

    const editState = useSubscribe(
        (f) => store.onSelection(session, path, f),
        () => {
            const ds = store.getDocSession(path.root.doc, session);
            return findSelection(ds, pathKey);
        },
        [path, session],
    );

    return { node, state: editState };
};

// const editState = (sel?: NodeSelection): EditState | void => {
//     if (!sel) return;
//     if (sel.type === 'within') {
//         return { sel: sel.cursor, start: sel.start, text: sel.text };
//     }
//     // if (sel.type === 'cursor') {
//     //     return;
//     // }
// };

const TopNode = ({
    id,
    loc,
    parentPath,
}: {
    id: string;
    loc: number;
    parentPath: Path;
}) => {
    console.log('render top', id, loc);
    const path = useMemo(
        () => ({ ...parentPath, children: parentPath.children.concat([loc]) }),
        [loc, parentPath],
    );
    const { node, state } = useTopNode(path);
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
    console.log('render collection', tid);
    const [l, r] = { list: '()', array: '[]', record: '{}' }[node.type];
    return (
        <span
            style={
                {
                    // display: 'inline-flex',
                    // flexWrap: 'wrap',
                    // alignItems: 'center',
                }
            }
        >
            {l}
            {node.items.map((loc, i) => (
                <span key={loc} style={i === 0 ? undefined : { marginLeft: 8 }}>
                    <TopNode key={loc} id={tid} loc={loc} parentPath={path} />
                </span>
            ))}
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
