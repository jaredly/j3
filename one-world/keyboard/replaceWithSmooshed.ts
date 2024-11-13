import { List } from '../shared/cnodes';
import {
    Path,
    Top,
    PartialSel,
    Update,
    withPartial,
    parentPath,
    replaceAt,
    pathWithChildren,
} from './lisp';

export const parentList = (
    top: Top,
    path: number[],
    kind: List<number>['kind'],
): List<number> | null => {
    if (path.length <= 1) return null;
    const ploc = path[path.length - 2];
    const parent = top.nodes[ploc];
    return parent.type === 'list' && parent.kind === kind ? parent : null;
};

export const replaceWithSmooshed = (
    path: Path,
    top: Top,
    old: number,
    locs: number[],
    sel?: PartialSel,
): Update => replaceWithList(path, top, old, locs, 'smooshed', sel);

export const replaceWithSpaced = (
    path: Path,
    top: Top,
    old: number,
    locs: number[],
    sel?: PartialSel,
): Update => replaceWithList(path, top, old, locs, 'spaced', sel);

export const replaceWithList = (
    path: Path,
    top: Top,
    old: number,
    locs: number[],
    kind: List<number>['kind'],
    sel?: PartialSel,
): Update => {
    const parent = parentList(top, path.children, kind);
    if (parent) {
        const children = parent.children.slice();
        const at = parent.children.indexOf(old);
        if (at === -1) {
            throw new Error(`id ${old} not a child of ${parent.loc}`);
        }
        children.splice(at, 1, ...locs);
        return {
            nodes: { [parent.loc]: { ...parent, children } },
            selection: withPartial(parentPath(path), sel),
            nextLoc: top.nextLoc,
        };
    }
    // const smooshed = parentList(top, path.children, 'smooshed');
    // TODO... hrm

    let nextLoc = top.nextLoc;
    const parentLoc = nextLoc++;
    const update = replaceAt(path.children.slice(0, -1), top, old, parentLoc);
    update.nodes[parentLoc] = {
        type: 'list',
        kind,
        children: locs,
        loc: parentLoc,
    };
    update.nextLoc = nextLoc;
    if (sel) {
        update.selection = withPartial(
            pathWithChildren(parentPath(path), parentLoc),
            sel,
        );
    }
    return update;
};
