import { lastChild } from '../../shared/IR/nav';
import { Path, parentPath, childLocs } from '../../shared/nodes';
import { getDoc, PersistedState } from '../../shared/state2';

export type MultiSelect =
    | { type: 'top'; parent: Path; children: number[] }
    | { type: 'doc'; doc: string; parentIds: number[]; children: number[] };

export const multiSelectContains = (
    multi: MultiSelect,
    path: Path,
    state: PersistedState,
) => {
    if (multi.type === 'doc') {
        const doc = getDoc(state, multi.doc);
        const tops = multi.children.map((loc) => doc.nodes[loc].toplevel);
        return tops.includes(path.root.toplevel);
    } else {
        if (
            path.root.doc !== multi.parent.root.doc ||
            path.root.toplevel !== multi.parent.root.toplevel
        ) {
            return false;
        }
        for (let i = 0; i < path.children.length; i++) {
            const loc = path.children[i];
            if (i === multi.parent.children.length) {
                return multi.children.includes(loc);
            }
            if (loc !== multi.parent.children[i]) {
                return false;
            }
        }
        return true;
    }
};

export const resolveMultiSelect = (
    start: Path,
    end: Path,
    state: PersistedState,
): MultiSelect | void => {
    if (start.root.doc !== end.root.doc) return; // this should never happen
    if (start.root.toplevel !== end.root.toplevel) {
        const sids = start.root.ids;
        const eids = end.root.ids;
        const doc = getDoc(state, start.root.doc);
        for (let i = 0; i < sids.length && i < eids.length; i++) {
            if (sids[i] !== eids[i]) {
                if (i === 0) return; // no shared root??
                const pid = sids[i - 1];
                const parent = doc.nodes[pid];
                const sidx = parent.children.indexOf(sids[i]);
                const eidx = parent.children.indexOf(eids[i]);
                if (sidx === -1 || eidx === -1) return;
                const [left, right] = sidx < eidx ? [sidx, eidx] : [eidx, sidx];
                return {
                    type: 'doc',
                    doc: start.root.doc,
                    parentIds: sids.slice(0, i),
                    children: parent.children.slice(left, right + 1),
                };
            }
        }
    }

    if (start.children.length === 1 || end.children.length === 1) {
        return {
            type: 'doc',
            doc: start.root.doc,
            parentIds: start.root.ids.slice(0, -1),
            children: [start.root.ids[start.root.ids.length - 1]],
        };
    }

    const top = state.toplevels[start.root.toplevel];
    // Case 1: end is a parent of start
    if (
        start.children.length >= end.children.length &&
        end.children.every((loc, i) => start.children[i] === loc)
    ) {
        return {
            type: 'top',
            parent: parentPath(end),
            children: [lastChild(end)],
        };
    }

    // Case 2: there's some kind of sibling thing going on
    for (let i = 0; i < end.children.length && i < start.children.length; i++) {
        if (start.children[i] === end.children[i]) continue;
        if (i === 0) {
            // no shared parent, this should never happen because the first id would be the
            // toplevel's root
            throw new Error('Bad news - first loc different');
        }
        const ploc = start.children[i - 1];
        const children = childLocs(top.nodes[ploc]);
        const a = children.indexOf(start.children[i]);
        const b = children.indexOf(end.children[i]);
        if (a === -1 || b == -1) {
            // throw new Error(
            //     `cant find one of these things in the childLocs list ${children.join(
            //         ',',
            //     )}: ${a} or ${b}`,
            // );
            console.error(
                `cant find one of these things in the childLocs list ${children.join(
                    ',',
                )}: ${a} or ${b}`,
            );
            return;
        }
        const [st, ed] = a < b ? [a, b] : [b, a];
        const locs = children.slice(st, ed + 1);
        const ppath: Path = {
            root: start.root,
            children: start.children.slice(0, i),
        };
        return { type: 'top', parent: ppath, children: locs };
    }

    // they're identical? this should be covered by case 1
    return { type: 'top', parent: parentPath(end), children: [lastChild(end)] };
};
