import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { ParseResult } from '../../evaluators/boot-ex/types';
import { Action, ToplevelUpdate } from '../../shared/action2';
import { IRCursor, IRSelection, nodeToIR } from '../../shared/IR/intermediate';
import { IRForLoc } from '../../shared/IR/layout';
import { cursorForNode, cursorSelect, IRCache, irNavigable, selectNode, toSelection } from '../../shared/IR/nav';
import { childLocs, Loc, Node, Nodes, Path, PathRoot, pathWithChildren, RecNodeT, serializePath, toMapInner } from '../../shared/nodes';
import { Toplevel } from '../../shared/toplevels';
// import { getNodeForPath, selectAll, selectNode } from '../selectNode';

export const isText = (node: Node): node is TextT => node.type === 'id';
// node.type === 'stringText' ||
// node.type === 'accessText';
export const isCollection = (node: Node): node is CollectionT => node.type === 'list' || node.type === 'record' || node.type === 'array';
export type CollectionT = Extract<Node, { type: 'list' | 'array' | 'record' }>;
export type TextT = Extract<Node, { type: 'id' }>;

const replaceChild = (node: Node, old: number, nw: number): Node | void => {
    switch (node.type) {
        case 'id':
        case 'rich-inline':
            return;
        case 'annot':
            if (node.contents === old) return { ...node, contents: nw };
            if (node.annot === old) return { ...node, annot: nw };
            return;
        case 'table': {
            const rows = node.rows.slice();
            rows.forEach((row, i) => {
                const at = row.indexOf(old);
                if (at !== -1) {
                    rows[i] = row.slice();
                    rows[i][at] = nw;
                }
            });
            return { ...node, rows };
        }
        case 'array':
        case 'list':
        case 'record':
        case 'rich-block':
            const at = node.items.indexOf(old);
            if (at === -1) return;
            const items = node.items.slice();
            items[at] = nw;
            return { ...node, items };
        case 'comment':
        case 'spread':
            if (node.contents === old) return { ...node, contents: nw };
            return;
        case 'record-access': {
            if (node.target === old) return { ...node, target: nw };
            const at = node.items.indexOf(old);
            if (at === -1) return;
            const items = node.items.slice();
            items[at] = nw;
            return { ...node, items };
        }
        case 'string':
            // if (node.first === old) return { ...node, first: nw };
            let found = false;
            const templates = node.templates.map((tpl) => {
                if (tpl.expr === old) {
                    found = true;
                    return { ...tpl, expr: nw };
                }
                // if (tpl.suffix === old) {
                //     found = true;
                //     return { ...tpl, suffix: nw };
                // }
                return tpl;
            });
            if (!found) return;
            return { ...node, templates };
        default:
            const _: never = node;
    }
};

const replaceWith = (top: Toplevel, path: Path, loc: number): ToplevelUpdate | void => {
    const self = path.children[path.children.length - 1];
    if (path.children.length > 1) {
        const parent = top.nodes[path.children[path.children.length - 2]];
        const fixed = replaceChild(parent, self, loc);
        if (!fixed) return;
        return { type: 'update', update: { nodes: { [fixed.loc]: fixed } } };
    }
    return { type: 'update', update: { root: loc } };
};

const unwrap = (path: Path, top: Toplevel, parent: CollectionT, cache: IRForLoc): void | [ToplevelUpdate, IRSelection] => {
    if (path.children.length < 3) return;
    const lloc = path.children[path.children.length - 1];
    const gloc = path.children[path.children.length - 3];
    const gparent = top.nodes[gloc];
    if (!isCollection(gparent)) return;
    const items = gparent.items.slice();
    const pidx = items.indexOf(parent.loc);
    items.splice(pidx, 1, ...parent.items);
    const npath = {
        ...path,
        children: path.children.slice(0, -2).concat([lloc]),
    };
    return [
        {
            type: 'update',
            update: {
                nodes: {
                    [gloc]: { ...gparent, items },
                    [parent.loc]: undefined,
                },
            },
        },
        selectNode(npath, 'start', cache),
    ];
};

export const joinLeft = (path: Path, top: Toplevel, rightText: string[], cache: IRCache): void | [ToplevelUpdate, IRSelection] => {
    if (path.children.length === 1) {
        // soooo remove the toplevel, right? so it won't be a toplevelupdate.
        return;
    }

    const lloc = path.children[path.children.length - 1];
    const ploc = path.children[path.children.length - 2];
    const parent = top.nodes[ploc];

    const node = top.nodes[lloc];
    // STOP
    // if (node.type === 'stringText' && parent.type === 'string') {
    //     if (parent.first === lloc) return;
    //     const idx = parent.templates.findIndex((t) => t.suffix === lloc);
    //     if (idx === -1) return;
    //     const prev =
    //         idx === 0 ? parent.first : parent.templates[idx - 1].suffix;
    //     const pnode = top.nodes[prev];
    //     if (pnode.type !== 'stringText') return;
    //     const templates = parent.templates.slice();
    //     templates.splice(idx, 1);
    //     // const up = topUpdate(top.id, { });
    //     const npath = pathWithChildren(parentPath(path), prev);
    //     return [
    //         {
    //             type: 'update',
    //             update: {
    //                 nodes: {
    //                     [ploc]: { ...parent, templates },
    //                     [prev]: {
    //                         ...pnode,
    //                         text: pnode.text + rightText.join(''),
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             type: 'id',
    //             cursor: splitGraphemes(pnode.text).length,
    //             path: npath,
    //             pathKey: serializePath(npath),
    //         },
    //     ];
    // }

    if (node.type !== 'id') return;

    if (parent.type !== 'list' && parent.type !== 'array' && parent.type !== 'record') {
        return;
    }

    const idx = parent.items.indexOf(lloc);
    if (idx === -1) return;

    // syk, we're doing an unwrap
    if (idx === 0) {
        return unwrap(path, top, parent, cache[top.id].irs);
    }

    const prev = parent.items[idx - 1];
    const prevNode = top.nodes[prev];

    const items = parent.items.slice();
    items.splice(idx, 1);

    const ppath: Path = {
        ...path,
        children: path.children.slice(0, -1).concat([prev]),
    };

    if (rightText.length === 0) {
        return [
            {
                type: 'update',
                update: {
                    nodes: {
                        [ploc]: { ...parent, items },
                        [lloc]: undefined,
                    },
                },
            },
            selectNode(ppath, 'end', cache[top.id].irs),
        ];
    }

    if (prevNode.type !== 'id') return;

    return [
        {
            type: 'update',
            update: {
                nodes: {
                    [ploc]: { ...parent, items },
                    [prev]: {
                        ...prevNode,
                        text: prevNode.text + rightText.join(''),
                    },
                    [lloc]: undefined,
                },
            },
        },
        {
            type: 'ir',
            start: {
                path: ppath,
                key: serializePath(ppath),
                cursor: {
                    type: 'text',
                    end: {
                        index: 0,
                        cursor: splitGraphemes(prevNode.text).length,
                    },
                },
            },
        },
    ];
};

const withPath = (sel: IRSelection, path: Path): IRSelection | void => {
    return {
        type: 'ir',
        start: { ...sel.start, path, key: serializePath(path) },
    };
};

export const remove = (path: Path, top: Toplevel): void | ToplevelUpdate => {
    if (path.children.length === 1) {
        // soooo remove the toplevel, right? so it won't be a toplevelupdate.
        return;
    }

    const lloc = path.children[path.children.length - 1];
    const ploc = path.children[path.children.length - 2];
    const parent = top.nodes[ploc];

    switch (parent.type) {
        case 'list':
        case 'array':
        case 'record': {
            const idx = parent.items.indexOf(lloc);
            if (idx === -1) return;
            const items = parent.items.slice();
            items.splice(idx, 1);
            return {
                type: 'update',
                update: {
                    nodes: { [ploc]: { ...parent, items }, [lloc]: undefined },
                },
            };
        }
        case 'spread':
        case 'comment':
            return;
    }
};

export const addSibling = (
    path: Path,
    top: Toplevel,
    sibling: RecNodeT<boolean>,
    left: boolean,
): void | { update: ToplevelUpdate; selection?: IRSelection } => {
    let containerParent = null;
    for (let i = path.children.length - 2; i >= 0; i--) {
        const node = top.nodes[path.children[i]];
        if (isCollection(node)) {
            containerParent = i;
            break;
        }
    }
    if (containerParent == null) {
        return; // TODO: toplevel whatsit
    }
    const child = path.children[containerParent + 1];
    const parent = top.nodes[path.children[containerParent]];
    if (!isCollection(parent)) return;
    const idx = parent.items.indexOf(child);
    if (idx === -1) return;

    const { selected, nloc, nodes, nidx } = inflateRecNode(top.nextLoc, sibling);

    if (selected == null) {
        throw new Error(`invalid "sibling"; one node must have loc=true`);
    }

    const items = parent.items.slice();
    items.splice(idx + (left ? 0 : 1), 0, nloc);

    nodes[parent.loc] = { ...parent, items };

    const npath: Path = {
        root: path.root,
        children: path.children.slice(0, containerParent + 1).concat(selected.children),
    };

    return {
        update: {
            type: 'update',
            update: { nextLoc: nidx.next, nodes },
        },
        // select the dealio. ok?
        selection: left
            ? undefined
            : {
                  type: 'ir',
                  start: {
                      cursor: selected.cursor,
                      path: npath,
                      key: serializePath(npath),
                  },
              },
    };
};

export const idSel = (cursor: number, path: Path): IRSelection => ({
    type: 'ir',
    start: {
        cursor: { type: 'text', end: { cursor, index: 0 } },
        path,
        key: serializePath(path),
    },
});

// export const handleAction = (
//     action: KeyAction,
//     path: Path,
//     state: PersistedState,
//     selection: IRSelection,
//     cache: IRCache
// ): Action | void => {
//     if (path.root.type !== 'doc-node') return;
//     const tid = path.root.toplevel;
//     const top = state.toplevels[tid];
//     const last = path.children[path.children.length - 1];
//     switch (action.type) {
//         case 'select':
//             return justSel(
//                 selectNode(
//                     action.child,
//                     pathWithChildren(path, action.child),
//                     action.location,
//                     cache[tid].irs
//                 ),
//                 path.root.doc,
//             );
//         case 'update-string': {
//             return justSel(
//                 {
//                     type: 'string',
//                     cursor: action.cursor,
//                     start: action.start,
//                     text: action.text,
//                     path,
//                     pathKey: serializePath(path),
//                 },
//                 path.root.doc,
//             );
//         }
//         case 'update': {
//             return justSel(
//                 {
//                     type: 'id',
//                     cursor: action.cursor,
//                     start: action.start,
//                     text: action.text,
//                     path,
//                     pathKey: serializePath(path),
//                 },
//                 path.root.doc,
//             );
//         }
//         case 'end': {
//             for (let i = path.children.length - 2; i >= 0; i--) {
//                 const node = top.nodes[path.children[i]];
//                 if (node.type === action.which) {
//                     const cpath = {
//                         ...path,
//                         children: path.children.slice(0, i + 1),
//                     };
//                     return {
//                         type: 'in-session',
//                         action: { type: 'multi', actions: [] },
//                         doc: path.root.doc,
//                         selections: [
//                             {
//                                 type: 'other',
//                                 location: 'end',
//                                 path: cpath,
//                                 pathKey: serializePath(cpath),
//                             },
//                         ],
//                     };
//                 }
//             }
//             console.log('no end', path);
//             return;
//         }

//         case 'before':
//         case 'after': {
//             const update = addSibling(
//                 path,
//                 top,
//                 action.node,
//                 action.type === 'before',
//             );
//             return update
//                 ? justSel(update.selection, path.root.doc, {
//                       type: 'toplevel',
//                       id: top.id,
//                       action: update.update,
//                   })
//                 : undefined;
//         }

//         case 'swap': {
//             if (path.children.length < 2) return;
//             const loc = path.children[path.children.length - 1];
//             const ploc = path.children[path.children.length - 2];
//             const parent = top.nodes[ploc];
//             if (!isCollection(parent)) return;
//             const idx = parent.items.indexOf(loc);
//             if (idx === -1) return;
//             const items = parent.items.slice();
//             if (action.direction === 'left') {
//                 if (idx === 0) {
//                     return action.into
//                         ? jumpOut(path, top, parent, selection, 'first')
//                         : undefined;
//                 }
//                 const sloc = items[idx - 1];
//                 const sib = top.nodes[sloc];
//                 if (action.into && isCollection(sib)) {
//                     const sitems = sib.items.slice();
//                     sitems.push(loc);
//                     items.splice(idx, 1);
//                     return justSel(
//                         withPath(
//                             selection,
//                             pathWithChildren(parentPath(path), sloc, loc),
//                         ),
//                         path.root.doc,
//                         topUpdate(tid, {
//                             [ploc]: { ...parent, items },
//                             [sloc]: { ...sib, items: sitems },
//                         }),
//                     );
//                 }
//                 items.splice(idx - 1, 1);
//                 items.splice(idx, 0, sloc);
//             } else {
//                 if (idx === items.length - 1) {
//                     return action.into
//                         ? jumpOut(path, top, parent, selection, 'last')
//                         : undefined;
//                 }

//                 const sloc = items[idx + 1];
//                 const sib = top.nodes[sloc];
//                 if (action.into && isCollection(sib)) {
//                     const sitems = sib.items.slice();
//                     sitems.unshift(loc);
//                     items.splice(idx, 1);
//                     return justSel(
//                         withPath(
//                             selection,
//                             pathWithChildren(parentPath(path), sloc, loc),
//                         ),
//                         path.root.doc,
//                         topUpdate(tid, {
//                             [ploc]: { ...parent, items },
//                             [sloc]: { ...sib, items: sitems },
//                         }),
//                     );
//                 }

//                 // if (idx === parent.items.length - 1) return;
//                 items.splice(idx + 1, 1);
//                 items.splice(idx, 0, sloc);
//             }

//             return topUpdate(tid, { [ploc]: { ...parent, items } });
//         }

//         case 'shrink': {
//             const loc = path.children[path.children.length - 1];
//             const node = top.nodes[loc];
//             if (!isCollection(node)) return;
//             if (node.items.length === 1) {
//                 const update = replaceWith(top, path, node.items[0]);
//                 return update
//                     ? justSel(
//                           selectNode(
//                               top.nodes[node.items[0]],
//                               pathWithChildren(parentPath(path), node.items[0]),
//                               action.from,
//                               top.nodes,
//                           ),
//                           path.root.doc,
//                           { type: 'toplevel', id: top.id, action: update },
//                       )
//                     : undefined;
//             }
//             if (node.items.length === 0) {
//                 return justSel(
//                     {
//                         type: 'id',
//                         cursor: 0,
//                         path,
//                         pathKey: serializePath(path),
//                     },
//                     path.root.doc,
//                     topUpdate(top.id, { [loc]: { type: 'id', text: '', loc } }),
//                 );
//             }
//             if (path.children.length < 2) return;
//             const ploc = path.children[path.children.length - 2];
//             const parent = top.nodes[ploc];
//             if (!isCollection(parent) || !isCollection(node)) return;
//             const idx = parent.items.indexOf(loc);

//             const items = parent.items.slice();
//             const citems = node.items.slice();

//             // delete it
//             if (citems.length === 0) {
//                 return {
//                     type: 'toplevel',
//                     id: tid,
//                     action: {
//                         type: 'update',
//                         update: {
//                             nodes: {
//                                 [loc]: { type: 'id', loc, text: '' },
//                             },
//                         },
//                     },
//                 };
//             }

//             if (action.from === 'end') {
//                 const last = citems[citems.length - 1];
//                 citems.pop();
//                 if (!citems.length) items[idx] = last;
//                 else items.splice(idx + 1, 0, last);
//             } else {
//                 const first = citems[0];
//                 citems.shift();
//                 if (!citems.length) items[idx] = first;
//                 else items.splice(idx, 0, first);
//             }

//             const up = topUpdate(tid, {
//                 [loc]: { ...node, items: citems },
//                 [ploc]: { ...parent, items },
//             });
//             if (!citems.length) {
//                 return justSel(
//                     selectNode(
//                         top.nodes[items[idx]],
//                         pathWithChildren(parentPath(path), items[idx]),
//                         action.from,
//                         top.nodes,
//                     ),
//                     path.root.doc,
//                     up,
//                 );
//             } else {
//                 return up;
//             }
//         }

//         case 'unwrap': {
//             const loc = path.children[path.children.length - 1];
//             const ploc = path.children[path.children.length - 2];
//             const node = top.nodes[loc];
//             const parent = top.nodes[ploc];
//             if (!isCollection(parent)) return;
//             const idx = parent.items.indexOf(loc);
//             if (
//                 action.direction === 'left'
//                     ? idx === 0
//                     : idx === parent.items.length - 1
//             ) {
//                 const update = unwrap(path, top, parent);
//                 return update
//                     ? {
//                           type: 'in-session',
//                           action: {
//                               type: 'toplevel',
//                               id: top.id,
//                               action: update[0],
//                           },
//                           doc: path.root.doc,
//                           selections: [update[1]],
//                       }
//                     : undefined;
//             }
//             const items = parent.items.slice();
//             if (!isCollection(node)) {
//                 if (action.direction === 'left') {
//                     const prev = top.nodes[items[idx - 1]];
//                     if (prev.type === 'id' && prev.text === '') {
//                         items.splice(idx - 1, 1);
//                         return topUpdate(tid, {
//                             [ploc]: { ...parent, items },
//                         });
//                     }
//                 }
//                 return;
//             }
//             const citems = node.items.slice();

//             if (action.direction === 'left') {
//                 const prev = items[idx - 1];
//                 items.splice(idx - 1, 1);
//                 const node = top.nodes[prev];
//                 if (node.type !== 'id' || node.text !== '') {
//                     citems.unshift(prev);
//                 }
//             } else {
//                 const next = items[idx + 1];
//                 items.splice(idx + 1, 1);
//                 citems.push(next);
//             }

//             return topUpdate(tid, {
//                 [loc]: { ...node, items: citems },
//                 [ploc]: { ...parent, items },
//             });
//         }

//         case 'delete': {
//             if (action.direction === 'blank') {
//                 const loc = path.children[path.children.length - 1];
//                 return {
//                     type: 'in-session',
//                     action: {
//                         type: 'toplevel',
//                         id: tid,
//                         action: {
//                             type: 'update',
//                             update: {
//                                 nodes: { [loc]: { type: 'id', loc, text: '' } },
//                             },
//                         },
//                     },
//                     doc: path.root.doc,
//                     selections: [
//                         {
//                             type: 'id',
//                             cursor: 0,
//                             path,
//                             pathKey: serializePath(path),
//                         },
//                     ],
//                 };
//             }
//             const update = remove(path, top);
//             return update
//                 ? { type: 'toplevel', id: top.id, action: update }
//                 : undefined;
//         }

//         case 'join-left': {
//             const update = joinLeft(path, top, action.text);
//             return update
//                 ? justSel(update[1], path.root.doc, {
//                       type: 'toplevel',
//                       id: top.id,
//                       action: update[0],
//                   })
//                 : undefined;
//         }

//         case 'split-string': {
//             const lastNode = top.nodes[last];
//             // STOP
//             if (lastNode.type !== 'string') {
//                 return;
//             }

//             // const ploc = path.children[path.children.length - 2];
//             // let parent = top.nodes[ploc];
//             // if (parent.type !== 'string') return;
//             const tpl = lastNode.templates.slice();
//             const map: Nodes = {};
//             let nidx = top.nextLoc;
//             const expr = nidx++;
//             const suffix = nidx++;
//             map[expr] = { type: 'id', loc: expr, text: '' };

//             tpl.splice(action.left.length - 1, 0, { expr, suffix: '' });
//             const texts = action.left.concat(action.right);
//             tpl.forEach((t, i) => {
//                 tpl[i] = { expr: t.expr, suffix: texts[i + 1].join('') };
//             });

//             // map[suffix] = {
//             //     type: 'stringText',
//             //     loc: suffix,
//             //     text: action.right.join(''),
//             // };
//             map[last] = {
//                 ...lastNode,
//                 first: action.left[0].join(''),
//                 templates: tpl,
//             };

//             // map[ploc] = { ...lastNode, templates: tpl };
//             // if (lastNode.first === last) {
//             //     tpl.unshift({ expr, suffix });
//             // } else {
//             //     const idx = lastNode.templates.findIndex(
//             //         (t) => t.suffix === last,
//             //     );
//             //     if (idx === -1) return;
//             //     tpl.splice(idx + 1, 0, { expr, suffix });
//             // }
//             const npath = pathWithChildren(path, expr);
//             return justSel(
//                 {
//                     type: 'id',
//                     cursor: 0,
//                     path: npath,
//                     pathKey: serializePath(npath),
//                 },
//                 path.root.doc,
//                 topUpdate(top.id, map, nidx),
//             );
//         }

//         case 'split': {
//             const lastNode = top.nodes[last];
//             // STOP
//             // if (lastNode.type === 'stringText') {
//             //     const ploc = path.children[path.children.length - 2];
//             //     let parent = top.nodes[ploc];
//             //     if (parent.type !== 'string') return;
//             //     const tpl = parent.templates.slice();
//             //     const map: Nodes = {};
//             //     let nidx = top.nextLoc;
//             //     const expr = nidx++;
//             //     const suffix = nidx++;
//             //     map[expr] = { type: 'id', loc: expr, text: '' };
//             //     map[suffix] = {
//             //         type: 'stringText',
//             //         loc: suffix,
//             //         text: action.right.join(''),
//             //     };
//             //     map[last] = { ...lastNode, text: action.left.join('') };
//             //     map[ploc] = { ...parent, templates: tpl };
//             //     if (parent.first === last) {
//             //         tpl.unshift({ expr, suffix });
//             //     } else {
//             //         const idx = parent.templates.findIndex(
//             //             (t) => t.suffix === last,
//             //         );
//             //         if (idx === -1) return;
//             //         tpl.splice(idx + 1, 0, { expr, suffix });
//             //     }
//             //     const npath = pathWithChildren(parentPath(path), expr);
//             //     return justSel(
//             //         {
//             //             type: 'id',
//             //             cursor: 0,
//             //             path: npath,
//             //             pathKey: serializePath(npath),
//             //         },
//             //         path.root.doc,
//             //         topUpdate(top.id, map, nidx),
//             //     );
//             // }
//             if (lastNode.type !== 'id') return; // skipping othersss
//             // const left = action.text.slice(0, action.at);
//             // const right = action.text.slice(action.at + action.del);

//             const update = addSibling(
//                 path,
//                 top,
//                 { type: 'id', loc: true, text: action.right.join('') },
//                 false,
//             );
//             if (update) {
//                 update.update.update.nodes = {
//                     ...update.update.update.nodes,
//                     [last]: { ...lastNode, text: action.left.join('') },
//                 };
//             }

//             // const npath: Path = {...path, children: path.children.slice(0, -1).concat([])}

//             return update
//                 ? justSel(update.selection, path.root.doc, {
//                       type: 'toplevel',
//                       id: top.id,
//                       action: update.update,
//                   })
//                 : undefined;
//         }

//         case 'surround': {
//             const loc = path.children[path.children.length - 1];
//             let nidx = top.nextLoc;
//             let idx = nidx++;
//             const map: Record<number, Node> = {};
//             if (
//                 action.kind === 'list' ||
//                 action.kind === 'array' ||
//                 action.kind === 'record'
//             ) {
//                 map[idx] = { type: action.kind, items: [loc], loc: idx };
//             } else if (action.kind === 'comment' || action.kind === 'spread') {
//                 map[idx] = { type: action.kind, contents: loc, loc: idx };
//             } else {
//                 const node = top.nodes[loc];
//                 if (isText(node) && node.text === '') {
//                     // const idx = top.nextLoc;
//                     const npath = pathWithChildren(path, idx);
//                     const tid = top.nextLoc;
//                     return justSel(
//                         {
//                             type: 'string',
//                             cursor: { part: 0, char: 0 },
//                             path: npath,
//                             pathKey: serializePath(npath),
//                         },
//                         path.root.doc,
//                         topUpdate(
//                             top.id,
//                             {
//                                 [tid]: { type: 'id', loc: tid, text: '' },
//                                 [loc]: {
//                                     type: 'string',
//                                     tag: tid,
//                                     first: '',
//                                     templates: [],
//                                     loc,
//                                 },
//                             },
//                             top.nextLoc + 1,
//                         ),
//                     );
//                 }
//                 const fidx = nidx++;
//                 map[fidx] = { type: 'id', text: '', loc: fidx };
//                 // const sidx = nidx++;
//                 map[idx] = {
//                     type: action.kind,
//                     first: '',
//                     tag: fidx,
//                     templates: [{ expr: loc, suffix: '' }],
//                     loc: idx,
//                 };
//                 // map[sidx] = { type: 'stringText', text: '', loc: sidx };
//             }
//             const update = replaceWith(top, path, idx);
//             if (!update) return;
//             update.update.nodes = { ...map, ...update.update.nodes };
//             update.update.nextLoc = nidx;
//             const npath = {
//                 ...path,
//                 children: path.children.slice(0, -1).concat([idx, loc]),
//             };
//             return {
//                 type: 'in-session',
//                 action: { type: 'toplevel', id: tid, action: update },
//                 doc: path.root.doc,
//                 selections: [
//                     selectNode(top.nodes[loc], npath, 'start', top.nodes),
//                 ],
//             };
//         }

//         // case 'unwrap':

//         case 'nav': {
//             switch (action.dir) {
//                 case 'left':
//                     return justSel(goLeft(path, state), path.root.doc);
//                 case 'inside-end': {
//                     const top = state.toplevels[path.root.toplevel];
//                     const loc = path.children[path.children.length - 1];
//                     return justSel(
//                         inFromEnd(top.nodes[loc], path, top.nodes),
//                         path.root.doc,
//                     );
//                 }
//                 case 'right':
//                     return justSel(goRight(path, state), path.root.doc);
//                 case 'inside-start': {
//                     const top = state.toplevels[path.root.toplevel];
//                     const loc = path.children[path.children.length - 1];
//                     return justSel(
//                         inFromStart(top.nodes[loc], path, top.nodes),
//                         path.root.doc,
//                     );
//                 }
//                 case 'to-end':
//                     return justSel(
//                         selectNode(
//                             getNodeForPath(path, state),
//                             path,
//                             'end',
//                             top.nodes,
//                         ),
//                         path.root.doc,
//                     );
//                 case 'to-start':
//                     return justSel(
//                         selectNode(
//                             getNodeForPath(path, state),
//                             path,
//                             'start',
//                             top.nodes,
//                         ),
//                         path.root.doc,
//                     );

//                 case 'tab-left': {
//                     const at = prevAtom(path, top.nodes);
//                     return at
//                         ? justSel(selectAll(at), path.root.doc)
//                         : undefined;
//                 }
//                 case 'tab': {
//                     const at = nextAtom(path, top.nodes);
//                     return at
//                         ? justSel(selectAll(at), path.root.doc)
//                         : undefined;
//                 }

//                 case 'contract':
//                     if (selection.type !== 'multi') {
//                         return; // what
//                     }
//                     if (selection.end) {
//                         return justSel(
//                             { ...selection, end: null },
//                             path.root.doc,
//                         );
//                     }
//                     if (selection.start.children.length) {
//                         const cpath = pathWithChildren(
//                             path,
//                             selection.start.children[0],
//                         );
//                         return justSel(
//                             {
//                                 type: 'multi',
//                                 start: {
//                                     path: cpath,
//                                     pathKey: serializePath(cpath),
//                                     children: selection.start.children.slice(1),
//                                     final: selection.start.final,
//                                 },
//                                 end: null,
//                             },
//                             path.root.doc,
//                         );
//                     }
//                     return justSel(selection.start.final, path.root.doc);

//                 case 'expand':
//                     if (selection?.type !== 'multi') {
//                         return justSel(
//                             {
//                                 type: 'multi',
//                                 start: {
//                                     path,
//                                     pathKey: serializePath(path),
//                                     children: [],
//                                     final: selection,
//                                 },
//                                 end: null,
//                             },
//                             path.root.doc,
//                         );
//                     }
//                     if (path.children.length > 1) {
//                         const parent = parentPath(path);
//                         return justSel(
//                             {
//                                 type: 'multi',
//                                 start: {
//                                     path: parent,
//                                     pathKey: serializePath(parent),
//                                     children: [
//                                         path.children[path.children.length - 1],
//                                         ...selection.start.children,
//                                     ],
//                                     final: selection.start.final,
//                                 },
//                                 end: null,
//                             },
//                             path.root.doc,
//                         );
//                     }
//                     return;
//                 default:
//                     return;
//             }
//         }
//     }
// };

// export const jumpOut = (
//     path: Path,
//     top: Toplevel,
//     parent: CollectionT,
//     selection: IRSelection,
//     which: 'first' | 'last',
// ) => {
//     const loc = path.children[path.children.length - 1];
//     const ploc = path.children[path.children.length - 2];
//     if (path.children.length < 3) return;
//     const gloc = path.children[path.children.length - 3];
//     const gparent = top.nodes[gloc];
//     if (!isCollection(gparent)) return;
//     const idx = gparent.items.indexOf(ploc);
//     if (idx === -1) return;
//     const items = parent.items.slice();
//     if (which === 'first') {
//         items.shift();
//     } else {
//         items.pop();
//     }
//     const gitems = gparent.items.slice();
//     gitems.splice(idx + (which === 'last' ? 1 : 0), 0, loc);
//     const dpath = pathWithChildren(parentPath(parentPath(path)), loc);
//     return justSel(
//         withPath(selection, dpath),
//         path.root.doc,
//         topUpdate(top.id, {
//             [ploc]: { ...parent, items },
//             [gloc]: { ...gparent, items: gitems },
//         }),
//     );
// };

// const justSel = (sel: IRSelection, doc: string): Action | void => ({
//     type: 'selection',
//     doc,
//     selections: [sel],
// });

export const createIRCache = (
    root: number,
    nodes: Record<number, Node>,
    pathRoot: PathRoot,
    parsed?: ParseResult<any>,
    getName: (loc: Loc) => string | null = () => null,
): IRForLoc => {
    const map: IRForLoc = {};
    const ctx = parsed
        ? {
              styles: parsed.styles,
              layouts: parsed.layouts,
              getName,
              tableHeaders: parsed.tableHeaders,
          }
        : undefined;
    const process = (loc: number, path: Path) => {
        const self = pathWithChildren(path, loc);
        const ir = nodeToIR(nodes[loc], self, ctx); // this will mess up some style things
        map[loc] = ir;
        childLocs(nodes[loc]).forEach((l) => process(l, self));
    };
    process(root, { root: pathRoot, children: [] });
    return map;
};

export function inflateRecNode(
    nextLoc: number,
    sibling: RecNodeT<boolean>,
): {
    selected: { children: number[]; cursor: IRCursor };
    nloc: number;
    nodes: Nodes;
    nidx: { next: number };
} {
    const nodes: Nodes = {};
    const nidx = { next: nextLoc };
    let selected = null as null | number[];
    const nloc = toMapInner(sibling, [], nodes, (node, _, path) => {
        const id = nidx.next++;
        if (node.loc === true) {
            selected = path.concat([id]);
        }
        return id;
    });
    if (selected === null) {
        selected = [nloc];
    }
    const sloc = selected[selected.length - 1];

    return {
        selected: cursorForNode(
            selected,
            'end',
            createIRCache(sloc, nodes, {
                type: 'doc-node',
                doc: '',
                ids: [],
                toplevel: '',
            }),
        ),
        nloc,
        nodes,
        nidx,
    };
}

// export const goLeft = (
//     path: Path,
//     state: PersistedState,
//     cache: IRCache,
//     all?: boolean,
// ): void | IRSelection => {
//     // If we're at the top of the toplevel...
//     if (path.children.length < 2) {
//         if (path.root.ids.length < 2) return;
//         const loc = path.root.ids[path.root.ids.length - 1];
//         const nodes = state.documents[path.root.doc].nodes;
//         const parent = nodes[path.root.ids[path.root.ids.length - 2]];
//         const idx = parent.children.indexOf(loc);
//         if (idx === -1) return;
//         // Select the end of the parent toplevel
//         if (idx === 0) {
//             const top = state.toplevels[parent.toplevel];
//             if (!top) return; // root
//             return selectNode(
//                 top.root,
//                 {
//                     root: { ...path.root, ids: path.root.ids.slice(0, -1) },
//                     children: [top.root],
//                 },
//                 'end',
//                 cache[path.root.toplevel].irs
//             );
//         }
//         let nid = parent.children[idx - 1];
//         let nids = path.root.ids.slice(0, -1).concat(nid);
//         while (nodes[nid].children.length) {
//             nid = nodes[nid].children[nodes[nid].children.length - 1];
//             nids.push(nid);
//         }
//         const top = state.toplevels[nodes[nid].toplevel];
//         return selectNode(
//             top.root,
//             {
//                 root: { ...path.root, ids: nids },
//                 children: [top.root],
//             },
//             'end',
//             cache[path.root.toplevel].irs
//         );
//     }

//     const top = state.toplevels[path.root.toplevel];
//     const parent = path.children[path.children.length - 2];
//     return toTheLeft(
//         top.nodes[parent],
//         path.children[path.children.length - 1],
//         parentPath(path),
//         top.nodes,
//     );
// };

// const goRight = (
//     path: Path,
//     state: PersistedState,
//     all?: boolean,
// ): void | IRSelection => {
//     // If we're at the top of the toplevel...
//     if (path.children.length < 2) {
//         if (path.root.ids.length < 2) return;
//         const loc = path.root.ids[path.root.ids.length - 1];
//         const nodes = state.documents[path.root.doc].nodes;
//         const parent = nodes[path.root.ids[path.root.ids.length - 2]];
//         const idx = parent.children.indexOf(loc);
//         if (idx === -1) return;
//         // Select the end of the parent toplevel
//         if (idx === 0) {
//             const top = state.toplevels[parent.toplevel];
//             if (!top) return; // root
//             return selectNode(
//                 top.nodes[top.root],
//                 {
//                     root: { ...path.root, ids: path.root.ids.slice(0, -1) },
//                     children: [top.root],
//                 },
//                 'end',
//                 top.nodes,
//             );
//         }
//         let nid = parent.children[idx - 1];
//         let nids = path.root.ids.slice(0, -1).concat(nid);
//         while (nodes[nid].children.length) {
//             nid = nodes[nid].children[nodes[nid].children.length - 1];
//             nids.push(nid);
//         }
//         const top = state.toplevels[nodes[nid].toplevel];
//         return selectNode(
//             top.nodes[top.root],
//             {
//                 root: { ...path.root, ids: nids },
//                 children: [top.root],
//             },
//             'end',
//             top.nodes,
//         );
//     }

//     const top = state.toplevels[path.root.toplevel];
//     const parent = path.children[path.children.length - 2];
//     return toTheRight(
//         top.nodes[parent],
//         path.children[path.children.length - 1],
//         parentPath(path),
//         top.nodes,
//     );
// };
