// import React from 'react';
// import { useState } from 'react';
// import { Builtins, Env } from '../../src/to-ast/library';
// import { Library } from '../../src/to-ast/library';
// import { HashedTree } from '../../src/db/hash-tree';
// import { useMenu } from './useMenu';
// import { css } from '@linaria/core';
// import { Action } from '../custom/UIState';

// const buttonStyle = {
//     fontSize: '80%',
//     borderRadius: 4,
//     padding: '0px 4px',
//     display: 'inline-block',
//     backgroundColor: '#444',
// };

// export const Button = ({
//     top,
//     definitions,
//     builtins,
// }: {
//     top: string;
//     definitions: Library['definitions'];
//     builtins: Builtins;
// }) => {
//     if (!top || top === '.') {
//         return <span style={buttonStyle}>&nbsp;</span>;
//     }
//     if (top.startsWith(':builtin:')) {
//         const hash = top.slice(':builtin:'.length);
//         return (
//             <span style={buttonStyle}>
//                 {builtins[hash]?.type === 'type' ? 'T' : 'e'}
//             </span>
//         );
//     }
//     const defn = definitions[top];
//     if (!defn) {
//         console.log('what', top, definitions);
//         return <span>No good</span>;
//     }
//     if (defn.type === 'term') {
//         return <span style={buttonStyle}>e</span>;
//     }
//     if (defn.type === 'type') {
//         return <span style={buttonStyle}>T</span>;
//     }
//     return <span style={buttonStyle}>unknown</span>;
// };

// export const NSTree = ({
//     root,
//     name,
//     full,
//     builtins,
//     namespaces,
//     definitions,
//     dispatch,
//     isTop = false,
// }: {
//     isTop?: boolean;
//     root: string;
//     name: string;
//     full: string[];
//     builtins: Builtins;
//     namespaces: HashedTree;
//     definitions: Library['definitions'];
//     dispatch: React.Dispatch<Action>;
// }) => {
//     const [open, setOpen] = useState(false);
//     const canBeOpen = isTop || open;
//     const [menu, setMenu] = useMenu((value) => {
//         return !isTop
//             ? [
//                   {
//                       title: 'Hello',
//                       action: () => {
//                           dispatch({
//                               type: 'namespace-rename',
//                               from: full,
//                               to: prompt('New namespace name')!.split('/'),
//                           });
//                       },
//                   },
//               ]
//             : [];
//     });

//     if (!namespaces[root]) {
//         return <div>Ok</div>;
//     }

//     const top = namespaces[root][''];
//     const keys = Object.keys(namespaces[root]).sort();

//     if (keys.length === 1 && keys[0] === '' && top !== '.') {
//         return (
//             <div
//                 className="menu-hover"
//                 style={{ cursor: 'pointer', position: 'relative' }}
//                 onContextMenu={(evt) => {
//                     evt.preventDefault();
//                     evt.stopPropagation();
//                     console.log('ctx');
//                     setMenu(10);
//                 }}
//             >
//                 <span
//                     style={{
//                         width: '2em',
//                         display: 'inline-block',
//                         textAlign: 'right',
//                         marginRight: 4,
//                     }}
//                 ></span>
//                 <Button
//                     builtins={builtins}
//                     top={top}
//                     definitions={definitions}
//                 />
//                 <span style={{ display: 'inline-block', width: 4 }} />
//                 {name}
//                 {menu}
//             </div>
//         );
//     }

//     return (
//         <div>
//             {!isTop ? (
//                 <div
//                     onMouseDown={(evt) => {
//                         if (evt.button === 0) {
//                             setOpen(!open);
//                         }
//                     }}
//                     style={{ cursor: 'pointer', position: 'relative' }}
//                     className={css`
//                         cursor: pointer;
//                         &:hover {
//                             background-color: #222;
//                         }
//                     `}
//                     onContextMenu={(evt) => {
//                         evt.preventDefault();
//                         evt.stopPropagation();
//                         console.log('ctx');
//                         setMenu(10);
//                     }}
//                 >
//                     <span
//                         style={{
//                             width: '2em',
//                             display: 'inline-block',
//                             textAlign: 'right',
//                             marginRight: 4,
//                         }}
//                     >
//                         {keys.length - (top ? 1 : 0)}
//                     </span>
//                     <Button
//                         builtins={builtins}
//                         top={top}
//                         definitions={definitions}
//                     />
//                     <span style={{ display: 'inline-block', width: 4 }} />
//                     {name}/{menu}
//                 </div>
//             ) : null}

//             {canBeOpen &&
//                 keys
//                     .filter((k) => k !== '')
//                     .map((name) => {
//                         const hash = namespaces[root][name];
//                         return (
//                             <div key={name}>
//                                 <div
//                                     style={{
//                                         marginLeft: !isTop ? 20 : 0,
//                                     }}
//                                 >
//                                     <NSTree
//                                         dispatch={dispatch}
//                                         root={hash}
//                                         name={name}
//                                         full={full.concat([name])}
//                                         builtins={builtins}
//                                         // sandboxes={sandboxes}
//                                         namespaces={namespaces}
//                                         definitions={definitions}
//                                     />
//                                 </div>
//                             </div>
//                         );
//                     })}
//         </div>
//     );
// };

// // export const addSandboxesToNamespaces = (
// //     library: Library,
// //     sandboxes: IDEState['sandboxes'],
// // ) => {
// //     const tree: Tree = { children: {} };
// //     sandboxes.forEach((meta) => {
// //         addToTree(tree, `/${meta.id}`, '.');
// //     });
// //     const namespaces: HashedTree = { ...library.namespaces };
// //     const root = addToHashedTree(namespaces, tree, makeHash, {
// //         root: library.root,
// //         tree: library.namespaces,
// //     })!;
// //     return { root, namespaces };
// // };

// export const Namespaces = ({
//     env,
//     root,
//     dispatch,
//     path = [],
// }: {
//     root?: string;
//     env: Env;
//     dispatch: React.Dispatch<Action>;
//     path?: string[];
// }) => {
//     return (
//         <div style={{ width: 300, minWidth: 300 }}>
//             <NSTree
//                 root={root ?? env.library.root}
//                 full={path}
//                 isTop
//                 name={''}
//                 dispatch={dispatch}
//                 builtins={env.builtins}
//                 namespaces={env.library.namespaces}
//                 definitions={env.library.definitions}
//             />
//         </div>
//     );
// };
