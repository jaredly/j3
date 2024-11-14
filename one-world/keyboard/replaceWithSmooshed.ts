import { List, Nodes } from '../shared/cnodes';
import { replaceAt } from './replaceAt';
import { parentPath, PartialSel, Path, pathWithChildren, Top, Update, withPartial } from './utils';

export const parentList = (top: Top, path: number[], kind: List<number>['kind']): List<number> | null => {
    if (path.length <= 1) return null;
    const ploc = path[path.length - 2];
    const parent = top.nodes[ploc];
    return parent.type === 'list' && parent.kind === kind ? parent : null;
};

export const replaceWithSmooshed = (path: Path, top: Top, old: number, locs: number[], sel?: PartialSel): Update =>
    replaceWithList(path, top, old, locs, 'smooshed', sel);

export const replaceWithSpaced = (path: Path, top: Top, old: number, locs: number[], sel?: PartialSel): Update =>
    replaceWithList(path, top, old, locs, 'spaced', sel);

export const replaceWithList = (
    path: Path,
    top: Top,
    old: number,
    locs: number[],
    kind: List<number>['kind'],
    sel?: PartialSel,
    nodes: Update['nodes'] = {},
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
            nodes: { ...nodes, [parent.loc]: { ...parent, children } },
            selection: withPartial(parentPath(path), sel),
            nextLoc: top.nextLoc,
        };
    }

    // Can't have spaced inside smooshed
    if (kind === 'spaced') {
        const smooshed = parentList(top, path.children, 'smooshed');
        if (smooshed) {
            if (locs.length !== 2) {
                throw new Error(`spaced in smooshed, must have 2 locs, not ${locs.length}. Expected a left and right side`);
            }
            const [left, right] = locs;
            let nextLoc = top.nextLoc;

            const at = smooshed.children.indexOf(old);
            if (at === -1) throw new Error(`${old} not in children ${smooshed.children}`);
            const litems = smooshed.children.slice(0, at);
            const ritems = smooshed.children.slice(at + 1);

            if (litems.length && nodes[left]?.type === 'id' && nodes[left]?.text === '') {
                // do nothing
            } else {
                litems.push(left);
            }
            if (ritems.length && nodes[right]?.type === 'id' && nodes[right]?.text === '') {
                // do nothing
            } else {
                ritems.unshift(right);
            }

            let res: number[] = [];

            nodes[smooshed.loc] = null;

            if (litems.length > 1) {
                nodes[smooshed.loc] = { ...smooshed, children: litems };
                res.push(smooshed.loc);

                if (sel && sel.children.includes(left)) {
                    sel = {
                        cursor: sel.cursor,
                        children: [smooshed.loc, ...sel.children],
                    };
                }
            } else {
                res.push(litems[0]);
            }

            if (ritems.length > 1) {
                let rsmooshed = smooshed.loc;

                if (litems.length > 1) {
                    rsmooshed = nextLoc++;
                    nodes[rsmooshed] = { type: 'list', kind: 'smooshed', loc: rsmooshed, children: ritems };
                } else {
                    nodes[smooshed.loc] = { ...smooshed, children: ritems };
                }

                res.push(rsmooshed);

                if (sel && sel.children.includes(right)) {
                    sel = {
                        cursor: sel.cursor,
                        children: [rsmooshed, ...sel.children],
                    };
                }
            } else {
                res.push(ritems[0]);
            }

            // NOW we make 2 smoosheds.
            const outer = replaceWithList(
                parentPath(path),
                { ...top, nextLoc },
                smooshed.loc,
                res,
                'spaced',
                // TODO: sel needs to be modified Im sure
                sel,
            );
            Object.assign(outer.nodes, nodes);
            return outer;
        }
    }

    // TODO... hrm

    let nextLoc = top.nextLoc;
    const parentLoc = nextLoc++;
    const update = replaceAt(path.children.slice(0, -1), top, old, parentLoc);
    Object.assign(update.nodes, nodes);
    update.nodes[parentLoc] = {
        type: 'list',
        kind,
        children: locs,
        loc: parentLoc,
    };
    update.nextLoc = nextLoc;
    if (sel) {
        update.selection = withPartial(pathWithChildren(parentPath(path), parentLoc), sel);
    }
    return update;
};
