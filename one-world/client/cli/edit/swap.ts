import { Action, ToplevelUpdate } from '../../../shared/action2';
import { IRSelection } from '../../../shared/IR/intermediate';
import { lastChild } from '../../../shared/IR/nav';
import { Path, parentPath, serializePath } from '../../../shared/nodes';
import { PersistedState } from '../../../shared/state2';
import { getNodeForPath } from '../../selectNode';
import { isCollection } from '../../TextEdit/actions';
import { resolveMultiSelect } from '../render';
import { topUpdate } from './handleUpdate';

export const swap = (
    state: PersistedState,
    start: IRSelection['start'],
    end: Path,
    dir: 'left' | 'right',
    shift: boolean,
): Action[] | void => {
    const multi = resolveMultiSelect(start.path, end, state);
    if (!multi) return;
    if (multi.type !== 'top') return;
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
