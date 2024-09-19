import { Action, ToplevelUpdate } from '../../../shared/action2';
import { IRSelection } from '../../../shared/IR/intermediate';
import { lastChild } from '../../../shared/IR/nav';
import { Path, parentPath, serializePath } from '../../../shared/nodes';
import { DocumentNode, getDoc, PersistedState } from '../../../shared/state2';
import { getNodeForPath } from '../../selectNode';
import { isCollection } from '../../TextEdit/actions';
import { MultiSelect, resolveMultiSelect } from '../resolveMultiSelect';
import { topUpdate } from './handleUpdate';

export const swapTop = (
    start: IRSelection['start'],
    end: Path,
    multi: Extract<MultiSelect, { type: 'doc' }>,
    state: PersistedState,
    dir: 'left' | 'right' | 'up' | 'down',
): Action[] | void => {
    if (!multi.parentIds.length) return;
    const doc = getDoc(state, multi.doc);
    const pnode = doc.nodes[multi.parentIds[multi.parentIds.length - 1]];

    const sidx = pnode.children.indexOf(multi.children[0]);
    const eidx = pnode.children.indexOf(
        multi.children[multi.children.length - 1],
    );
    if (sidx === -1 || eidx === -1) return;
    const pchildren = pnode.children.slice();
    const removed = pchildren.splice(sidx, eidx - sidx + 1);

    const up: Record<number, DocumentNode> = {
        [pnode.id]: { ...pnode, children: pchildren },
    };

    const idPos = start.path.root.ids.indexOf(pnode.id);
    if (idPos === -1) return;

    const spath: Path = {
        children: start.path.children,
        root: { ...start.path.root, ids: start.path.root.ids.slice() },
    };
    const epath: Path = {
        children: end.children,
        root: { ...end.root, ids: end.root.ids.slice() },
    };

    if (dir === 'right') {
        if (sidx === 0) return; // cant indent if we're at the top
        const sib = doc.nodes[pnode.children[sidx - 1]];
        const schildren = sib.children.slice();
        up[sib.id] = { ...sib, children: schildren };
        schildren.push(...removed);

        spath.root.ids.splice(idPos + 1, 0, sib.id);
        epath.root.ids.splice(idPos + 1, 0, sib.id);
    } else if (dir === 'up') {
        if (sidx === 0) {
            if (multi.parentIds.length < 2) return;
            const gpnode =
                doc.nodes[multi.parentIds[multi.parentIds.length - 2]];
            const pidx = gpnode.children.indexOf(pnode.id);
            if (pidx === -1) return;
            const gchildren = gpnode.children.slice();
            gchildren.splice(pidx, 0, ...removed);
            up[gpnode.id] = { ...gpnode, children: gchildren };

            spath.root.ids.splice(idPos, 1);
            epath.root.ids.splice(idPos, 1);
        } else {
            pchildren.splice(sidx - 1, 0, ...removed);
        }
    } else if (dir === 'down' && eidx < pnode.children.length - 1) {
        pchildren.splice(sidx + 1, 0, ...removed);
    } else {
        if (multi.parentIds.length < 2) return;
        const gpnode = doc.nodes[multi.parentIds[multi.parentIds.length - 2]];
        const pidx = gpnode.children.indexOf(pnode.id);
        if (pidx === -1) return;
        const gchildren = gpnode.children.slice();
        gchildren.splice(pidx + 1, 0, ...removed);
        up[gpnode.id] = { ...gpnode, children: gchildren };

        spath.root.ids.splice(idPos, 1);
        epath.root.ids.splice(idPos, 1);
    }

    const sel: Action = {
        type: 'selection',
        doc: end.root.doc,
        selections: [
            {
                type: 'ir',
                start: {
                    ...start,
                    path: spath,
                    key: serializePath(spath),
                },
                end: { path: epath, key: serializePath(epath) },
            },
        ],
    };

    return [
        {
            type: 'doc',
            id: doc.id,
            action: { type: 'update', update: { nodes: up } },
        },
        sel,
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
        return swapTop(start, end, multi, state, dir);
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
                    type: 'ir',
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
                        type: 'ir',
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
