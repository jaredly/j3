import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node, Path, Selection, serializePath } from '../shared/nodes';
import { DocSession, NodeSelection } from '../shared/state';
import { Hidden } from './HiddenInput';
import { useStore } from './StoreContext';
import { EditState } from './TextEdit/Id';
import { ManagedId, selectionAction } from './TextEdit/ManagedId';
import { handleAction } from './TextEdit/actions';
import { specials, textKey } from './keyboard';

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

    const docSession = store.getDocSession(id, store.session);

    return (
        <div style={{ padding: 100 }}>
            <Hidden
                onKeyDown={(evt) => {
                    if (evt.metaKey) return;
                    if (!docSession.selections.length) return;
                    docSession.selections.forEach((selection) => {
                        if (selection.type !== 'within') return; // TODO will do this later
                        const last =
                            selection.path.children[
                                selection.path.children.length - 1
                            ];
                        const node =
                            store.getState().toplevels[
                                selection.path.root.toplevel
                            ].nodes[last];
                        if (
                            node.type !== 'id' &&
                            node.type !== 'accessText' &&
                            node.type !== 'stringText'
                        )
                            return;
                        const text =
                            selection.text ?? splitGraphemes(node.text);
                        const sel = selection.cursor;
                        const mods = { meta: evt.metaKey, shift: evt.shiftKey };
                        const editState: EditState = {
                            text,
                            sel,
                            start: selection.start,
                        };

                        const key = evt.key;
                        if (specials[key]) {
                            const action = specials[key](
                                sel === text.length
                                    ? 'end'
                                    : sel === 0
                                    ? 'start'
                                    : 'middle',
                                editState,
                                mods,
                            );
                            if (!action) {
                            } else if (action.type === 'update') {
                                // setState({ text: action.text, sel: action.cursor, start: action.cursorStart, });
                                store.update(
                                    selectionAction(
                                        selection.path,
                                        action.cursor,
                                        action.cursorStart,
                                        selection,
                                        action.text,
                                    ),
                                );
                                return;
                            } else {
                                // maybeCommitTextChanges(
                                //     editState,
                                //     store,
                                //     tid,
                                //     loc,
                                // );

                                const state = store.getState();
                                const saction = handleAction(
                                    action,
                                    selection.path,
                                    state,
                                );
                                if (saction) {
                                    store.update(saction);
                                } else {
                                    console.warn('ignoring action', action);
                                }
                            }
                            return;
                        }
                        const extra = splitGraphemes(key);
                        if (extra.length > 1) {
                            console.warn(
                                'Too many graphemes? What is this',
                                key,
                                extra,
                            );
                            return;
                        }
                        const results = textKey(extra, editState, {
                            meta: evt.metaKey,
                            shift: evt.shiftKey,
                        });
                        // setState({ text: results.text, sel: results.cursor });
                        store.update(
                            selectionAction(
                                selection.path,
                                results.cursor,
                                undefined,
                                // results.cursorStart,
                                selection,
                                results.text,
                            ),
                        );
                    });
                }}
                onBlur={(evt) => {
                    // blur
                }}
            />
            Editing {doc.title}
            <DocNode doc={doc.id} id={0} parentNodes={emptyNodes} />
        </div>
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
    // const state = store.getState();
    // const dnode = path.root.ids[path.root.ids.length - 1];
    // const top = state.documents[path.root.doc].nodes[dnode].toplevel;
    const top = path.root.toplevel;
    const loc = path.children[path.children.length - 1];
    // const session = useSessionId();
    const node = useSubscribe(
        (f) => store.onTopNode(top, loc, f),
        () => store.getState().toplevels[top].nodes[loc],
        [top, loc],
    );
    const pathKey = useMemo(() => serializePath(path), [path]);

    const selection = useSubscribe(
        (f) => store.onSelection(store.session, path, f),
        () => {
            const ds = store.getDocSession(path.root.doc, store.session);
            return findSelection(ds, pathKey);
        },
        [path, store.session],
    );

    return { node, selection };
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
    const { node, selection } = useTopNode(path);
    if (!node) return null;
    if (
        node.type === 'id' ||
        node.type === 'accessText' ||
        node.type === 'stringText'
    ) {
        // return <Id path={path} node={node} tid={id} />;
        return <ManagedId path={path} node={node} selection={selection} />;
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
            root: { type: 'doc-node', ids: docNodes, doc, toplevel: id },
        }),
        [docNodes, id],
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
