import { Action, ToplevelUpdate } from '../../../shared/action2';
import { IRSelection } from '../../../shared/IR/intermediate';
import { lastChild } from '../../../shared/IR/nav';
import { Path, parentPath, serializePath } from '../../../shared/nodes';
import { DocumentNode, PersistedState } from '../../../shared/state2';
import { getNodeForPath } from '../../selectNode';
import { isCollection } from '../../TextEdit/actions';
import { MultiSelect, resolveMultiSelect } from '../render';
import { topUpdate } from './handleUpdate';

export const swapTop = (
    multi: Extract<MultiSelect, { type: 'doc' }>,
    state: PersistedState,
    dir: 'left' | 'right',
): Action[] | void => {
    if (!multi.parentIds.length) return;
    if (dir === 'left') return;
    const doc = state.documents[multi.doc];
    const pnode = doc.nodes[multi.parentIds[multi.parentIds.length - 1]];
    const sidx = pnode.children.indexOf(multi.children[0]);
    const eidx = pnode.children.indexOf(
        multi.children[multi.children.length - 1],
    );
    if (sidx === -1 || eidx === -1) return;
    if (sidx === 0) return; // cant indent if we're at the top
    const sib = doc.nodes[pnode.children[sidx - 1]];
    const pchildren = pnode.children.slice();
    const schildren = sib.children.slice();
    schildren.push(...pchildren.splice(sidx, eidx - sidx + 1));
    const up: Record<number, DocumentNode> = {
        [sib.id]: { ...sib, children: schildren },
        [pnode.id]: { ...pnode, children: pchildren },
    };
    return [
        {
            type: 'doc',
            id: doc.id,
            action: { type: 'update', update: { nodes: up } },
        },
    ];
};

export const swap = (
    state: PersistedState,
    start: IRSelection['start'],
    end: Path,
    dir: 'left' | 'right',
    shift: boolean,
): Action[] | void => {
    const multi = resolveMultiSelect(start.path, end, state);
    if (!multi) return;
    if (multi.type !== 'top') {
        return swapTop(multi, state, dir);
    }
    const top = state.toplevels[start.path.root.toplevel];
    const node = getNodeForPath(multi.parent, state);
    if (!node) return;
    const ploc = lastChild(multi.parent);
    if (!isCollection(node)) return;

    const items = node.items.slice();
    const lidx = items.indexOf(multi.children[0]);
    const ridx = items.indexOf(multi.children[multi.children.length - 1]);

    const up: ToplevelUpdate['update']['nodes'] = {
        [lastChild(multi.parent)]: { ...node, items },
    };
    let sel: Action | null = null;
    const moving = items.splice(lidx, ridx + 1 - lidx);

    if (
        (dir === 'left' && lidx === 0) ||
        (dir === 'right' && ridx === node.items.length - 1)
    ) {
        if (!shift) return;
        // "Swap out"
        const gp = parentPath(multi.parent);
        const gnode = getNodeForPath(gp, state);
        if (!gnode || !isCollection(gnode)) return;
        const at = gnode.items.indexOf(ploc);
        if (at === -1) return;
        const gitems = gnode.items.slice();
        gitems.splice(at + (dir === 'left' ? 0 : 1), 0, ...moving);
        up[lastChild(gp)] = { ...gnode, items: gitems };

        const spath: Path = {
            children: start.path.children.filter((loc) => loc !== ploc),
            root: start.path.root,
        };
        const epath: Path = {
            root: end.root,
            children: end.children.filter((loc) => loc !== ploc),
        };

        sel = {
            type: 'selection',
            doc: end.root.doc,
            selections: [
                {
                    start: {
                        ...start,
                        path: spath,
                        key: serializePath(spath),
                    },
                    end: { path: epath, key: serializePath(epath) },
                },
            ],
        };
    } else {
        const neighbor = items[lidx + (dir === 'left' ? -1 : 0)];
        const nnode = top.nodes[neighbor];
        if (shift && isCollection(nnode)) {
            const nitems = nnode.items.slice();
            if (dir === 'left') {
                nitems.push(...moving);
            } else {
                nitems.unshift(...moving);
            }
            up[neighbor] = { ...nnode, items: nitems };

            const pos = start.path.children.indexOf(ploc);

            const spath: Path = {
                children: start.path.children.slice(),
                root: start.path.root,
            };
            const epath: Path = {
                root: end.root,
                children: end.children.slice(),
            };
            spath.children.splice(pos + 1, 0, neighbor);
            epath.children.splice(pos + 1, 0, neighbor);

            sel = {
                type: 'selection',
                doc: end.root.doc,
                selections: [
                    {
                        start: {
                            ...start,
                            path: spath,
                            key: serializePath(spath),
                        },
                        end: { path: epath, key: serializePath(epath) },
                    },
                ],
            };
        } else {
            items.splice(lidx + (dir === 'left' ? -1 : 1), 0, ...moving);
        }
    }

    return [topUpdate(end.root.toplevel, up), ...(sel ? [sel] : [])];
};
