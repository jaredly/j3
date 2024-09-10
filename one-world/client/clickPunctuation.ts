// import React from 'react';
// import { Path, pathWithChildren, serializePath } from '../shared/nodes';
// import {
//     getNodeForPath,
//     getTopForPath,
//     isLeft,
//     selectAll,
//     selectNode,
//     setSelection,
// } from './selectNode';
// import { Store } from './StoreContext';

// export const clickPunctuation = (
//     evt: React.MouseEvent<HTMLSpanElement>,
//     store: Store,
//     left: null | number,
//     right: null | number,
//     path: Path,
// ) => {
//     evt.preventDefault();
//     evt.stopPropagation();
//     if (evt.shiftKey) {
//         return setSelection(store, path.root.doc, selectAll(path));
//     }

//     const l = isLeft(evt);
//     const which = l ? left : right;
//     if (which == null) {
//         return setSelection(store, path.root.doc, {
//             type: 'other',
//             location: l ? 'start' : 'end',
//             path,
//             pathKey: serializePath(path),
//         });
//     }

//     const cpath = pathWithChildren(path, which);
//     setSelection(
//         store,
//         path.root.doc,
//         selectNode(
//             getNodeForPath(cpath, store.getState()),
//             cpath,
//             l ? 'end' : 'start',
//             getTopForPath(path, store.getState()).nodes,
//         ),
//     );
// };
