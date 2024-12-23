// ok
// so, I'd put so much into this `Intermediate Representation`, using that
// as the basis for navigation and rendering and such.
// BUT
// it would seem that I've managed to reduce the /Node/ repsentation down enough
// that I don't need that anymore. Is that so?
// Let's try it, it's for fun.

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Collection, Id, List, Node, Nodes, Text } from '../shared/cnodes';
import { addBlankAfter } from './addBlankAfter';
// import { replaceWithList, replaceWithSmooshed } from './replaceWithSmooshed';
import { splitInList } from './splitInList';
import { Top, Update, IdCursor, Path, selStart, CollectionCursor, splitOnCursor, PartialSel, NodeSelection, getCurrent } from './utils';
// import { wrapId } from './wrapId';

// const idHandlers: Record<string, (node: Id<number>, cursor: IdCursor, path: Path, top: Top) => Update | void> = {
//     ' ': (node, cursor, path, top) => splitInList(node, cursor, path, top),
//     ArrowLeft: (node, cursor, path, top) => {
//         if (cursor.end > 1) {
//             return {
//                 nodes: {},
//                 selection: {
//                     start: selStart(path, { ...cursor, end: cursor.end - 1 }),
//                 },
//             };
//         }
//     },
// };

// const listHandlers: Record<string, (node: Collection<number>, cursor: CollectionCursor, path: Path, top: Top) => Update | void> = {
//     ' ': (node, cursor, path, top) => {
//         if (cursor.type === 'control') return;
//         switch (cursor.where) {
//             case 'after':
//             case 'end':
//                 return addBlankAfter(node.loc, path, top);
//         }
//     },
// };

// const opens = { '(': 'round', '[': 'square', '{': 'curly' } as const;
// Object.entries(opens).forEach(([key, kind]) => {
//     idHandlers[key] = (node, cursor, path, top) => wrapId(node, kind, cursor, path, top);
// });

// const closes = { ')': 'round', ']': 'square', '}': 'curly' } as const;
// Object.entries(closes).forEach(([key, kind]) => {
//     idHandlers[key] = (node, cursor, path, top): Update | void => afterCloser(top, path, kind);
//     listHandlers[key] = (node, cursor, path, top): Update | void => afterCloser(top, path, kind);
// });

// export const afterCloser = (top: Top, path: Path, kind: List<number>['kind']): Update | void => {
//     for (let i = path.children.length - 1; i >= 0; i--) {
//         const pnode = top.nodes[path.children[i]];
//         if (pnode.type === 'list' && pnode.kind === kind) {
//             return {
//                 nodes: {},
//                 selection: {
//                     start: selStart({ ...path, children: path.children.slice(0, i + 1) }, { type: 'list', where: 'after' }),
//                 },
//             };
//         }
//     }
// };

// export const isBlank = (id: Id<number>, cursor: IdCursor) => {
//     return cursor.text ? cursor.text.length === 0 : id.text === '';
// };

// export const isPunct = (id: Id<number>, cursor: IdCursor) => {
//     return cursor.text ? cursor.text.every((t) => ops.includes(t)) : splitGraphemes(id.text).every((t) => ops.includes(t));
// };

// const ops = [...'.=#@;+'];

// // export const splitBraceless = (id: Id<number>, cursor: IdCursor, path: Path, top: Top, keys: string[], kind: 'smooshed' | 'spaced') => {
// //     let [left, mid, right] = splitOnCursor(id, cursor);

// //     if (!left.length && !right.length) {
// //         throw new Error('not for splitting');
// //     }

// //     const nodes: Nodes = {};
// //     const replace: number[] = [];
// //     let nextLoc = top.nextLoc;
// //     if (left.length) {
// //         nodes[id.loc] = { ...id, text: left.join('') };
// //         replace.push(id.loc);
// //     }

// //     let sel: PartialSel;
// //     if (keys.length) {
// //         const n = nextLoc++;
// //         nodes[n] = { type: 'id', text: keys.join(''), loc: n };
// //         replace.push(n);
// //         sel = {
// //             children: [n],
// //             cursor: { type: 'id', end: 1 },
// //         };
// //     } else {
// //         sel = {
// //             children: [id.loc],
// //             cursor: { type: 'id', end: 0 },
// //         };
// //     }

// //     if (right.length || !keys.length) {
// //         if (!left.length) {
// //             nodes[id.loc] = { ...id, text: right.join('') };
// //             replace.push(id.loc);
// //         } else {
// //             const r = nextLoc++;
// //             nodes[r] = { type: 'id', text: right.join(''), loc: r };
// //             replace.push(r);
// //             sel.children = [r];
// //         }
// //     }

// //     const update = replaceWithList(path, { ...top, nextLoc }, id.loc, replace, kind, sel);
// //     Object.assign(update.nodes, nodes);
// //     return update;
// // };

// // const idType = (node: Id<number>, cursor: IdCursor, path: Path, top: Top, key: string): Update => {
// //     if (!isBlank(node, cursor)) {
// //         if (ops.includes(key)) {
// //             if (!isPunct(node, cursor)) {
// //                 return splitBraceless(node, cursor, path, top, [key], 'smooshed');
// //             }
// //         } else if (isPunct(node, cursor)) {
// //             return splitBraceless(node, cursor, path, top, [key], 'smooshed');
// //         }
// //     }

// //     let [left, mid, right] = splitOnCursor(node, cursor);
// //     return {
// //         nodes: {},
// //         selection: {
// //             start: selStart(path, {
// //                 type: 'id',
// //                 text: [...left, key, ...right],
// //                 end: left.length + 1,
// //             }),
// //         },
// //     };
// // };

// // export const handleKey = (selection: NodeSelection, top: Top, key: string): Update | void => {
// //     if (selection.end) return; // TODO :/

// //     const current = getCurrent(selection, top);

// //     if (current.type === 'id') {
// //         const fn = idHandlers[key];
// //         if (fn != null) {
// //             return fn(current.node, current.cursor, selection.start.path, top);
// //         }
// //         if (splitGraphemes(key).length > 1) {
// //             throw new Error(`custok key not handled ${key}`);
// //         }
// //         return idType(current.node, current.cursor, selection.start.path, top, key);
// //     }

// //     if (current.type === 'list') {
// //         const fn = listHandlers[key];
// //         if (fn != null) {
// //             return fn(current.node, current.cursor, selection.start.path, top);
// //         }
// //         // return idType(current.node, current.cursor, selection.start.path, key);
// //     }

// //     // throw new Error(`not handling ${current.type}: ${key}`);
// //     // TODO: after an update:
// //     // - verify the `nextLoc` invariant
// //     // - verify the smooshed invariant
// //     // - verify that the selection is valid
// // };
