// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Path, Selection, serializePath } from '../shared/nodes';
// import { DocSession } from '../shared/state2';
// import { Collection } from './Collection';
// import { Hidden } from './HiddenInput';
// import { useStore } from './StoreContext';
// // import { String } from './String';
// // import { ManagedId } from './TextEdit/ManagedId';
// // import { handleAction } from './TextEdit/actions';
// // import { keys, runKey } from './keyboard';
// import { getNodeForPath } from './selectNode';

const emptyNodes: number[] = [];

// export const Edit = () => {
//     const params = useParams();
//     const id = params.id;
//     if (!id) throw new Error(`no id specified`);

//     const store = useStore();
//     const doc = useSubscribe(
//         (f) => store.onDoc(id, f),
//         () => store.getState().documents[id],
//         [id],
//     );

//     const iref = useRef<HTMLInputElement>(null);

//     useEffect(() => {
//         return store.on('selection', () => {
//             const ds = store.getDocSession(id, store.session);
//             if (ds.selections.length) {
//                 iref.current?.focus();
//             } else if (iref.current === document.activeElement) {
//                 iref.current?.blur();
//             }
//         });
//     }, []);

//     return (
//         <div style={{ padding: 100 }}>
//             <Hidden
//                 iref={iref}
//                 onKeyDown={(evt) => {
//                     if (evt.metaKey) return;

//                     const docSession = store.getDocSession(id, store.session);

//                     if (!docSession.selections.length) return;
//                     const sels = docSession.selections;
//                     docSession.selections.forEach((selection, i) => {
//                         const mods = {
//                             meta: evt.metaKey,
//                             shift: evt.shiftKey,
//                             ctrl: evt.ctrlKey,
//                         };

//                         if (selection.type === 'multi') {
//                             const node = getNodeForPath(
//                                 selection.start.path,
//                                 store.getState(),
//                             );
//                             return keys.multi[evt.key]?.(
//                                 selection,
//                                 mods,
//                                 [node],
//                                 evt.key,
//                             );
//                         }
//                         const last =
//                             selection.path.children[
//                                 selection.path.children.length - 1
//                             ];
//                         const node =
//                             store.getState().toplevels[
//                                 selection.path.root.toplevel
//                             ].nodes[last];

//                         const res = runKey(evt.key, mods, node, selection);
//                         if (res === false) return;
//                         evt.preventDefault();
//                         evt.stopPropagation();
//                         if (res) {
//                             const state = store.getState();
//                             // const saction = handleAction(
//                             //     res,
//                             //     selection.path,
//                             //     state,
//                             //     selection,
//                             // );
//                             // if (saction) {
//                             //     store.update(saction);
//                             // } else {
//                             //     console.warn('ignoring action', res);
//                             // }
//                             throw new Error('disabled lol');
//                         }
//                     });
//                 }}
//                 onBlur={(evt) => {
//                     // blur
//                     store.update({
//                         type: 'in-session',
//                         action: { type: 'multi', actions: [] },
//                         doc: id,
//                         selections: [],
//                     });
//                 }}
//             />
//             {/* Editing {doc.title} */}
//             <div
//                 style={{
//                     padding: 40,
//                     color: '#aac',
//                     fontFamily: 'Jet Brains',
//                     fontVariationSettings: "'wght' 100, 'wdth' 100",
//                 }}
//             >
//                 <DocNode doc={doc.id} id={0} parentNodes={emptyNodes} />
//             </div>
//             <div
//                 style={{
//                     fontFamily: 'Jet Brains',
//                     fontVariationSettings: "'wght' 100, 'wdth' 100",
//                     fontSize: '50%',
//                 }}
//             >
//                 <Monitor id={doc.id} />
//             </div>
//             {/* <pre>{JSON.stringify(store.getState(), null, 2)}</pre> */}
//         </div>
//     );
// };

// const Monitor = ({ id }: { id: string }) => {
//     const store = useStore();
//     const sel = useSubscribe(
//         (f) => store.on('selection', f),
//         () => store.getDocSession(id, store.session).selections,
//         [],
//     );
//     return <pre>{JSON.stringify(sel, null, 2)}</pre>;
// };

// const useSubscribe = <T,>(
//     sub: (f: () => void) => () => void,
//     get: () => T,
//     deps: any[],
// ) => {
//     const [value, update] = useState(get());
//     const first = useRef(true);
//     useEffect(() => {
//         if (first.current) {
//             first.current = false;
//         } else {
//             // On change in dependencies, do a fresh get()
//             update(get());
//         }
//         return sub(() => {
//             update(get());
//         });
//     }, deps);
//     return value;
// };

// const useDocNode = (did: string, id: number) => {
//     const store = useStore();
//     return useSubscribe(
//         (f) => store.onDocNode(did, id, f),
//         () => store.getState().documents[did].nodes[id],
//         [did, id],
//     );
// };

// const useToplevel = (id: string) => {
//     const store = useStore();
//     return useSubscribe(
//         (f) => store.onTop(id, f),
//         () => store.getState().toplevels[id],
//         [id],
//     );
// };

// export type EditSelection =
//     | { type: 'range'; start: Selection; cursor: Selection; text?: string[] }
//     | { type: 'cursor'; cursor: Selection; text?: string[] };

// // TODO: potential optimization, we could cache the pathKey on the selection object.
// const findSelection = (
//     docSession: DocSession,
//     pathKey: string,
// ): NodeSelection | void => {
//     for (let sel of docSession.selections) {
//         switch (sel.type) {
//             case 'string':
//             case 'id':
//             case 'other':
//                 if (sel.pathKey === pathKey) return sel;
//                 break;
//             case 'multi':
//                 if (sel.start.pathKey === pathKey) return sel;
//                 if (sel.end?.pathKey === pathKey) return sel;
//                 break;
//             default:
//                 throw new Error('unexpected selection kind');
//         }
//     }
// };

// const useTopNode = (path: Path) => {
//     const store = useStore();
//     // const state = store.getState();
//     // const dnode = path.root.ids[path.root.ids.length - 1];
//     // const top = state.documents[path.root.doc].nodes[dnode].toplevel;
//     const top = path.root.toplevel;
//     const loc = path.children[path.children.length - 1];
//     // const session = useSessionId();
//     const node = useSubscribe(
//         (f) => store.onTopNode(top, loc, f),
//         () => store.getState().toplevels[top].nodes[loc],
//         [top, loc],
//     );
//     const pathKey = useMemo(() => serializePath(path), [path]);

//     const selection = useSubscribe(
//         (f) => store.onSelection(store.session, path, f),
//         () => {
//             const ds = store.getDocSession(path.root.doc, store.session);
//             return findSelection(ds, pathKey);
//         },
//         [path, store.session],
//     );

//     return { node, selection };
// };

// // const editState = (sel?: NodeSelection): EditState | void => {
// //     if (!sel) return;
// //     if (sel.type === 'id') {
// //         return { sel: sel.cursor, start: sel.start, text: sel.text };
// //     }
// //     // if (sel.type === 'cursor') {
// //     //     return;
// //     // }
// // };

// export const TopNode = ({
//     id,
//     loc,
//     parentPath,
// }: {
//     id: string;
//     loc: number;
//     parentPath: Path;
// }) => {
//     const path = useMemo(
//         () => ({ ...parentPath, children: parentPath.children.concat([loc]) }),
//         [loc, parentPath],
//     );
//     const { node, selection } = useTopNode(path);
//     if (!node) return null;
//     if (node.type === 'id') {
//         // return <Id path={path} node={node} tid={id} />;
//         return <ManagedId path={path} node={node} selection={selection} />;
//     }
//     if (
//         node.type === 'list' ||
//         node.type === 'array' ||
//         node.type === 'record'
//     ) {
//         return (
//             <Collection
//                 node={node}
//                 tid={id}
//                 path={path}
//                 selection={selection}
//             />
//         );
//     }
//     if (node.type === 'string') {
//         return (
//             <String node={node} tid={id} path={path} selection={selection} />
//         );
//     }
//     return <span>some other {node.type}</span>;
// };

// const Toplevel = ({
//     id,
//     doc,
//     docNodes,
// }: {
//     id: string;
//     doc: string;
//     docNodes: number[];
// }) => {
//     const top = useToplevel(id);
//     const path: Path = useMemo(
//         () => ({
//             children: [],
//             root: { type: 'doc-node', ids: docNodes, doc, toplevel: id },
//         }),
//         [docNodes, id],
//     );
//     // console.log('rendering toplevel here', top.root);
//     return (
//         <div>
//             <TopNode id={id} loc={top.root} parentPath={path} />
//         </div>
//     );
//     // todo know about focus
//     // useKeyListener(true, (key, mods) => {
//     // })
// };

// const DocNode = ({
//     doc,
//     id,
//     parentNodes,
// }: {
//     doc: string;
//     id: number;
//     parentNodes: number[];
// }) => {
//     const node = useDocNode(doc, id);
//     const docNodes = useMemo(() => parentNodes.concat([id]), [parentNodes, id]);
//     return (
//         <div>
//             {id === 0 ? null : (
//                 <Toplevel id={node.toplevel} doc={doc} docNodes={docNodes} />
//             )}
//             <div style={{ paddingLeft: id === 0 ? 0 : 20 }}>
//                 {node.children.map((id) => (
//                     <DocNode
//                         key={id}
//                         id={id}
//                         doc={doc}
//                         parentNodes={docNodes}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };
