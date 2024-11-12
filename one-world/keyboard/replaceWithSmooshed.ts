import {
    Path,
    Top,
    PartialSel,
    Update,
    parentSmooshed,
    withPartial,
    parentPath,
    replaceAt,
    pathWithChildren,
} from './lisp';

export const replaceWithSmooshed = (
    path: Path,
    top: Top,
    old: number,
    locs: number[],
    sel?: PartialSel,
): Update => {
    const parent = parentSmooshed(top, path.children);
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

    let nextLoc = top.nextLoc;
    const parentLoc = nextLoc++;
    const update = replaceAt(path.children.slice(0, -1), top, old, parentLoc);
    update.nodes[parentLoc] = {
        type: 'list',
        kind: 'smooshed',
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
