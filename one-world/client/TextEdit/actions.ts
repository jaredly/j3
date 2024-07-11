import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Action, ToplevelAction, ToplevelUpdate } from '../../shared/action';
import {
    inFromEnd,
    inFromStart,
    Node,
    Nodes,
    parentPath,
    Path,
    RecNode,
    RecNodeT,
    serializePath,
    toMap,
    toMapInner,
    toTheLeft,
    toTheRight,
} from '../../shared/nodes';
import { NodeSelection, PersistedState } from '../../shared/state';
import { Toplevel } from '../../shared/toplevels';
import { KeyAction } from '../keyboard';
import { selectNode } from '../selectNode';

const replaceChild = (node: Node, old: number, nw: number): Node | void => {
    switch (node.type) {
        case 'ref':
        case 'accessText':
        case 'id':
        case 'stringText':
            return;
        case 'annot':
            if (node.contents === old) return { ...node, contents: nw };
            if (node.annot === old) return { ...node, annot: nw };
            return;
        case 'array':
        case 'list':
        case 'record':
            const at = node.items.indexOf(old);
            if (at === -1) return;
            const items = node.items.slice();
            items[at] = nw;
            return { ...node, items };
        case 'comment':
        case 'spread':
            if (node.contents === old) return { ...node, contents: nw };
            return;
        case 'rich-text':
        case 'raw-code': {
            const at = node.embeds.indexOf(old);
            if (at === -1) return;
            const embeds = node.embeds.slice();
            embeds[at] = nw;
            return { ...node, embeds };
        }
        case 'record-access': {
            if (node.target === old) return { ...node, target: nw };
            const at = node.items.indexOf(old);
            if (at === -1) return;
            const items = node.items.slice();
            items[at] = nw;
            return { ...node, items };
        }
        case 'string':
            if (node.first === old) return { ...node, first: nw };
            let found = false;
            const templates = node.templates.map((tpl) => {
                if (tpl.expr === old) {
                    found = true;
                    return { ...tpl, expr: nw };
                }
                if (tpl.suffix === old) {
                    found = true;
                    return { ...tpl, suffix: nw };
                }
                return tpl;
            });
            if (!found) return;
            return { ...node, templates };
        default:
            const _: never = node;
    }
};

const replaceWith = (
    top: Toplevel,
    path: Path,
    loc: number,
): ToplevelUpdate | void => {
    const self = path.children[path.children.length - 1];
    if (path.children.length > 1) {
        const parent = top.nodes[path.children[path.children.length - 2]];
        const fixed = replaceChild(parent, self, loc);
        if (!fixed) return;
        return { type: 'update', update: { nodes: { [fixed.loc]: fixed } } };
    }
    return { type: 'update', update: { root: loc } };
};

export const joinLeft = (
    path: Path,
    top: Toplevel,
    rightText: string[],
): void | [ToplevelUpdate, NodeSelection] => {
    if (path.children.length === 1) {
        // soooo remove the toplevel, right? so it won't be a toplevelupdate.
        return;
    }

    const lloc = path.children[path.children.length - 1];
    const ploc = path.children[path.children.length - 2];
    const parent = top.nodes[ploc];

    const node = top.nodes[lloc];
    if (node.type !== 'id') return;

    if (
        parent.type !== 'list' &&
        parent.type !== 'array' &&
        parent.type !== 'record'
    ) {
        return;
    }

    const idx = parent.items.indexOf(lloc);
    if (idx === -1) return;

    // syk, we're doing an unwrap
    if (idx === 0) {
        if (path.children.length < 3) return;
        const gloc = path.children[path.children.length - 3];
        const gparent = top.nodes[gloc];
        if (
            gparent.type !== 'list' &&
            gparent.type !== 'array' &&
            gparent.type !== 'record'
        ) {
            return;
        }
        const items = gparent.items.slice();
        const pidx = items.indexOf(ploc);
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
                        [ploc]: undefined,
                    },
                },
            },
            {
                type: 'within',
                cursor: 0,
                path: npath,
                pathKey: serializePath(npath),
            },
        ];
    }

    if (idx === 0) return;
    const prev = parent.items[idx - 1];
    const pnode = top.nodes[prev];
    if (pnode.type !== 'id') return;

    const items = parent.items.slice();
    items.splice(idx, 1);

    const ppath: Path = {
        ...path,
        children: path.children.slice(0, -1).concat([prev]),
    };

    return [
        {
            type: 'update',
            update: {
                nodes: {
                    [ploc]: { ...parent, items },
                    [prev]: { ...pnode, text: pnode.text + rightText.join('') },
                    [lloc]: undefined,
                },
            },
        },
        {
            type: 'within',
            cursor: splitGraphemes(pnode.text).length,
            path: ppath,
            pathKey: serializePath(ppath),
        },
    ];
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
            // replaceWith(top, {...path, children: path.children.slice(0, -1)}, lloc)
            return;
    }
};

export const addSibling = (
    path: Path,
    top: Toplevel,
    sibling: RecNodeT<boolean>,
    left: boolean,
): void | { update: ToplevelUpdate; selection: NodeSelection } => {
    let containerParent = null;
    for (let i = path.children.length - 1; i >= 0; i--) {
        const node = top.nodes[path.children[i]];
        if (
            node.type === 'list' ||
            node.type === 'array' ||
            node.type === 'record'
        ) {
            containerParent = i;
            break;
        }
    }
    if (containerParent == null) {
        return; // TODO: toplevel whatsit
    }
    const child = path.children[containerParent + 1];
    const parent = top.nodes[path.children[containerParent]] as Extract<
        Node,
        { type: 'list' | 'array' | 'record' }
    >;
    const idx = parent.items.indexOf(child);
    if (idx === -1) return;

    const nodes: Nodes = {};

    const nidx = { next: top.nextLoc };

    let selected = null as null | number[];

    const nloc = toMapInner(sibling, [], nodes, (node, _, path) => {
        const id = nidx.next++;
        if (node.loc === true) {
            selected = path.concat([id]);
        }
        return id;
    });

    if (selected == null) {
        throw new Error(`invalid "sibling"; one node must have loc=true`);
    }

    const items = parent.items.slice();
    items.splice(idx + (left ? 0 : 1), 0, nloc);

    nodes[parent.loc] = { ...parent, items };

    const npath: Path = {
        root: path.root,
        children: path.children.slice(0, containerParent + 1).concat(selected),
    };
    console.log('new path folks', npath, nloc);

    return {
        update: {
            type: 'update',
            update: { nextLoc: nidx.next, nodes },
        },
        // select the dealio. ok?
        selection: {
            type: 'within',
            cursor: 0,
            path: npath,
            pathKey: serializePath(npath),
        },
    };
};

export const handleAction = (
    action: KeyAction,
    path: Path,
    state: PersistedState,
): Action | void => {
    if (path.root.type !== 'doc-node') return;
    const tid = path.root.toplevel;
    const top = state.toplevels[tid];
    const last = path.children[path.children.length - 1];
    switch (action.type) {
        case 'end': {
            for (let i = path.children.length - 2; i >= 0; i--) {
                const node = top.nodes[path.children[i]];
                if (node.type === action.which) {
                    const cpath = {
                        ...path,
                        children: path.children.slice(0, i + 1),
                    };
                    return {
                        type: 'in-session',
                        action: { type: 'multi', actions: [] },
                        doc: path.root.doc,
                        selections: [
                            {
                                type: 'without',
                                location: 'end',
                                path: cpath,
                                pathKey: serializePath(cpath),
                            },
                        ],
                    };
                }
            }
            console.log('no end', path);
            return;
        }

        case 'before':
        case 'after': {
            const update = addSibling(
                path,
                top,
                action.node,
                action.type === 'before',
            );
            return update
                ? {
                      type: 'in-session',
                      action: {
                          type: 'toplevel',
                          id: top.id,
                          action: update.update,
                      },
                      doc: path.root.doc,
                      selections: [update.selection],
                  }
                : undefined;
        }

        case 'delete': {
            const update = remove(path, top);
            return update
                ? { type: 'toplevel', id: top.id, action: update }
                : undefined;
        }

        case 'join-left': {
            const update = joinLeft(path, top, action.text);
            return update
                ? {
                      type: 'in-session',
                      action: {
                          type: 'toplevel',
                          id: top.id,
                          action: update[0],
                      },
                      doc: path.root.doc,
                      selections: [update[1]],
                  }
                : undefined;
        }

        case 'split': {
            const lastNode = top.nodes[last];
            if (lastNode.type !== 'id') return; // skipping othersss
            const left = action.text.slice(0, action.at);
            const right = action.text.slice(action.at + action.del);

            const update = addSibling(
                path,
                top,
                { type: 'id', loc: true, text: right.join('') },
                false,
            );
            if (update) {
                update.update.update.nodes = {
                    ...update.update.update.nodes,
                    [last]: { ...lastNode, text: left.join('') },
                };
            }

            // const npath: Path = {...path, children: path.children.slice(0, -1).concat([])}

            return update
                ? {
                      type: 'in-session',
                      action: {
                          type: 'toplevel',
                          id: top.id,
                          action: update.update,
                      },
                      doc: path.root.doc,
                      selections: [update.selection],
                  }
                : undefined;
        }

        case 'surround': {
            const loc = path.children[path.children.length - 1];
            let nidx = top.nextLoc;
            let idx = nidx++;
            const map: Record<number, Node> = {};
            if (
                action.kind === 'list' ||
                action.kind === 'array' ||
                action.kind === 'record'
            ) {
                map[idx] = { type: action.kind, items: [loc], loc: idx };
            } else if (action.kind === 'comment' || action.kind === 'spread') {
                map[idx] = { type: action.kind, contents: loc, loc: idx };
            } else {
                const fidx = nidx++;
                const sidx = nidx++;
                map[idx] = {
                    type: action.kind,
                    first: fidx,
                    templates: [{ expr: loc, suffix: sidx }],
                    loc: idx,
                };
                map[fidx] = { type: 'stringText', text: '', loc: fidx };
                map[sidx] = { type: 'stringText', text: '', loc: sidx };
            }
            const update = replaceWith(top, path, idx);
            if (!update) return;
            update.update.nodes = { ...map, ...update.update.nodes };
            update.update.nextLoc = nidx;
            const npath = {
                ...path,
                children: path.children.slice(0, -1).concat([idx, loc]),
            };
            return {
                type: 'in-session',
                action: { type: 'toplevel', id: tid, action: update },
                doc: path.root.doc,
                selections: [selectNode(top.nodes[loc], npath, 'start')],
            };
        }

        case 'nav': {
            switch (action.dir) {
                case 'left':
                    return justSel(goLeft(path, state), path.root.doc);
                case 'inside-end': {
                    const top = state.toplevels[path.root.toplevel];
                    const loc = path.children[path.children.length - 1];
                    return justSel(
                        inFromEnd(top.nodes[loc], path, top.nodes),
                        path.root.doc,
                    );
                }
                case 'right':
                    return justSel(goRight(path, state), path.root.doc);
                case 'inside-start': {
                    const top = state.toplevels[path.root.toplevel];
                    const loc = path.children[path.children.length - 1];
                    return justSel(
                        inFromStart(top.nodes[loc], path, top.nodes),
                        path.root.doc,
                    );
                }
                default:
                    return;
            }
        }
    }
};

const justSel = (sel: NodeSelection | void, doc: string): Action | void =>
    sel
        ? {
              type: 'in-session',
              action: { type: 'multi', actions: [] },
              doc,
              selections: [sel],
          }
        : undefined;

const goLeft = (path: Path, state: PersistedState): void | NodeSelection => {
    // If we're at the top of the toplevel...
    if (path.children.length < 2) {
        if (path.root.ids.length < 2) return;
        const loc = path.root.ids[path.root.ids.length - 1];
        const nodes = state.documents[path.root.doc].nodes;
        const parent = nodes[path.root.ids[path.root.ids.length - 2]];
        const idx = parent.children.indexOf(loc);
        if (idx === -1) return;
        // Select the end of the parent toplevel
        if (idx === 0) {
            const top = state.toplevels[parent.toplevel];
            if (!top) return; // root
            return selectNode(
                top.nodes[top.root],
                {
                    root: { ...path.root, ids: path.root.ids.slice(0, -1) },
                    children: [top.root],
                },
                'end',
            );
        }
        let nid = parent.children[idx - 1];
        let nids = path.root.ids.slice(0, -1).concat(nid);
        while (nodes[nid].children.length) {
            nid = nodes[nid].children[nodes[nid].children.length - 1];
            nids.push(nid);
        }
        const top = state.toplevels[nodes[nid].toplevel];
        return selectNode(
            top.nodes[top.root],
            {
                root: { ...path.root, ids: nids },
                children: [top.root],
            },
            'end',
        );
    }

    const top = state.toplevels[path.root.toplevel];
    const parent = path.children[path.children.length - 2];
    return toTheLeft(
        top.nodes[parent],
        path.children[path.children.length - 1],
        parentPath(path),
        top.nodes,
    );
};

const goRight = (path: Path, state: PersistedState): void | NodeSelection => {
    // If we're at the top of the toplevel...
    if (path.children.length < 2) {
        if (path.root.ids.length < 2) return;
        const loc = path.root.ids[path.root.ids.length - 1];
        const nodes = state.documents[path.root.doc].nodes;
        const parent = nodes[path.root.ids[path.root.ids.length - 2]];
        const idx = parent.children.indexOf(loc);
        if (idx === -1) return;
        // Select the end of the parent toplevel
        if (idx === 0) {
            const top = state.toplevels[parent.toplevel];
            if (!top) return; // root
            return selectNode(
                top.nodes[top.root],
                {
                    root: { ...path.root, ids: path.root.ids.slice(0, -1) },
                    children: [top.root],
                },
                'end',
            );
        }
        let nid = parent.children[idx - 1];
        let nids = path.root.ids.slice(0, -1).concat(nid);
        while (nodes[nid].children.length) {
            nid = nodes[nid].children[nodes[nid].children.length - 1];
            nids.push(nid);
        }
        const top = state.toplevels[nodes[nid].toplevel];
        return selectNode(
            top.nodes[top.root],
            {
                root: { ...path.root, ids: nids },
                children: [top.root],
            },
            'end',
        );
    }

    const top = state.toplevels[path.root.toplevel];
    const parent = path.children[path.children.length - 2];
    return toTheRight(
        top.nodes[parent],
        path.children[path.children.length - 1],
        parentPath(path),
        top.nodes,
    );
};
