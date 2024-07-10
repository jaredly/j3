import { Action, ToplevelAction, ToplevelUpdate } from '../../shared/action';
import {
    Node,
    Nodes,
    Path,
    RecNode,
    toMap,
    toMapInner,
} from '../../shared/nodes';
import { PersistedState } from '../../shared/state';
import { Toplevel } from '../../shared/toplevels';
import { KeyAction } from '../keyboard';

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

export const joinLeft = (path: Path, top: Toplevel): void | ToplevelUpdate => {
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
    if (idx === 0) return;
    const prev = parent.items[idx - 1];
    const pnode = top.nodes[prev];
    if (pnode.type !== 'id') return;

    const items = parent.items.slice();
    items.splice(idx, 1);

    return {
        type: 'update',
        update: {
            nodes: {
                [ploc]: { ...parent, items },
                [prev]: { ...pnode, text: pnode.text + node.text },
                [lloc]: undefined,
            },
        },
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
            // replaceWith(top, {...path, children: path.children.slice(0, -1)}, lloc)
            return;
    }
};

export const addSibling = (
    path: Path,
    top: Toplevel,
    sibling: RecNode,
    left: boolean,
): void | ToplevelUpdate => {
    let containerParent = null;
    for (let i = path.children.length - 1; i >= 0; i--) {
        const node = top.nodes[path.children[i]];
        if (
            node.type === 'list' ||
            node.type === 'array' ||
            node.type === 'record'
        ) {
            containerParent = i;
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

    const nloc = toMapInner(sibling, nodes, nidx);
    const items = parent.items.slice();
    items.splice(idx + (left ? 0 : 1), 0, nloc);

    nodes[parent.loc] = { ...parent, items };

    return {
        type: 'update',
        update: { nextLoc: nidx.next, nodes },
    };
};

export const handleAction = (
    action: KeyAction,
    path: Path,
    state: PersistedState,
): Action | void => {
    if (path.root.type !== 'doc-node') return;
    const docNode = path.root.ids[path.root.ids.length - 1];
    const tid = state.documents[path.root.doc].nodes[docNode].toplevel;
    const top = state.toplevels[tid];
    const last = path.children[path.children.length - 1];
    switch (action.type) {
        case 'before':
        case 'after': {
            const update = addSibling(
                path,
                top,
                action.node,
                action.type === 'before',
            );
            return update
                ? { type: 'toplevel', id: top.id, action: update }
                : undefined;
        }

        case 'delete': {
            const update = remove(path, top);
            return update
                ? { type: 'toplevel', id: top.id, action: update }
                : undefined;
        }

        case 'join-left': {
            const update = joinLeft(path, top);
            return update
                ? { type: 'toplevel', id: top.id, action: update }
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
                { type: 'id', loc: [], text: right.join('') },
                false,
            );
            if (update) {
                update.update.nodes = {
                    ...update.update.nodes,
                    [last]: { ...lastNode, text: left.join('') },
                };
            }
            return update
                ? { type: 'toplevel', id: top.id, action: update }
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
            return { type: 'toplevel', id: tid, action: update };
        }
    }
};
