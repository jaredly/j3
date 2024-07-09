import { Action, ToplevelAction } from '../../shared/action';
import { Node, Path } from '../../shared/nodes';
import { PersistedState } from '../../shared/state';
import { Toplevel } from '../../shared/toplevels';
import { KeyAction } from '../keyboard';
import { Store } from '../StoreContext';

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
): Extract<ToplevelAction, { type: 'update' }> | void => {
    const self = path.children[path.children.length - 1];
    if (path.children.length > 1) {
        const parent = top.nodes[path.children[path.children.length - 2]];
        const fixed = replaceChild(parent, self, loc);
        if (!fixed) return;
        return { type: 'update', update: { nodes: { [fixed.loc]: fixed } } };
    }
    return { type: 'update', update: { root: loc } };
};

export const handleAction = (
    action: KeyAction,
    path: Path,
    state: PersistedState,
): Action | void => {
    if (path.root.type !== 'doc-node') return;
    const docNode = path.root.ids[path.root.ids.length - 1];
    const top = state.documents[path.root.doc].nodes[docNode].toplevel;
    switch (action.type) {
        case 'surround': {
            const loc = path.children[path.children.length - 1];
            let nidx = state.toplevels[top].nextLoc + 1;
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
            const update = replaceWith(state.toplevels[top], path, idx);
            if (!update) return;
            update.update.nodes = { ...map, ...update.update.nodes };
            update.update.nextLoc = nidx;
            return { type: 'toplevel', id: top, action: update };
        }
    }
};
