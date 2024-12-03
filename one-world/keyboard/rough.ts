import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { childLocs, Id, Node, Nodes } from '../shared/cnodes';
import { Flat } from './flatenate';
import { interleave } from './interleave';
import { replaceAt } from './replaceAt';
import { Cursor, IdCursor, ListCursor, parentPath, Path, pathWithChildren, selStart, Top, Update } from './utils';

export const flatten = (node: Node, top: Top, remap: Nodes = {}, depth: number = 0): Flat[] => {
    if (node.type !== 'list') return [node];
    if (node.kind === 'smooshed') {
        return interleave<Flat>(
            node.children.map((id) => remap[id] ?? top.nodes[id]),
            { type: 'smoosh', loc: node.loc },
        );
    }
    if (node.kind === 'spaced') {
        return interleave(
            node.children.map((id) => flatten(remap[id] ?? top.nodes[id], top, remap, depth + 1)),
            [{ type: 'space', loc: node.loc }],
        ).flat();
    }
    if (depth > 0) return [node]; // dont flatten nested lists
    return interleave(
        node.children.map((id) => flatten(remap[id] ?? top.nodes[id], top, remap, depth + 1)),
        [{ type: 'sep', loc: node.loc }],
    ).flat();
};

export const rough = (flat: Flat[], top: Top, sel: Node, outer?: number) => {
    const nodes: Nodes = {};
    let nextLoc = top.nextLoc;

    let sloc: number | null = null;

    let forceMultiline = undefined as undefined | boolean;

    const other: number[] = [];
    for (let i = 0; i < flat.length; i++) {
        const children: number[] = [];
        let ploc = -1;

        for (; i < flat.length && flat[i].type !== 'sep'; i++) {
            const schildren: number[] = [];
            let loc = -1;

            for (; i < flat.length && flat[i].type !== 'space' && flat[i].type !== 'sep'; i++) {
                if (loc === -1 && flat[i].type === 'smoosh' && !nodes[flat[i].loc]) {
                    loc = flat[i].loc;
                    continue;
                }
                if (flat[i].type === 'smoosh') continue;
                const node = flat[i] as Node;
                if (node.loc === -1) {
                    let nloc = nextLoc++;
                    nodes[nloc] = { ...node, loc: nloc };
                    schildren.push(nloc);
                    if (node === sel) {
                        sloc = nloc;
                    }
                } else {
                    nodes[node.loc] = node;
                    schildren.push(node.loc);
                    if (node === sel) {
                        sloc = node.loc;
                    }
                }
            }

            if (schildren.length === 1) {
                children.push(schildren[0]);
            } else {
                if (loc === -1) {
                    loc = nextLoc++;
                    nodes[loc] = { type: 'list', kind: 'smooshed', loc, children: schildren };
                } else {
                    const parent = top.nodes[loc];
                    if (parent.type !== 'list' || parent.kind !== 'smooshed') throw new Error(`not smoshed ${loc}`);
                    nodes[loc] = { ...parent, children: schildren };
                }
                children.push(loc);
            }

            // it's a space, and the loc hasnt been used yet
            if (ploc === -1 && i < flat.length && flat[i].type === 'space' && !nodes[flat[i].loc]) {
                ploc = flat[i].loc;
            }

            if (i < flat.length && flat[i].type === 'sep') break;
        }

        const that = flat[i];
        if (that && that.type === 'sep' && that.multiLine) {
            forceMultiline = true;
        }

        if (children.length === 1) {
            other.push(children[0]);
        } else {
            if (ploc === -1) {
                const loc = nextLoc++;
                nodes[loc] = { type: 'list', kind: 'spaced', loc, children };
                other.push(loc);
            } else {
                const node = top.nodes[ploc];
                if (node.type !== 'list' || node.kind !== 'spaced') throw new Error(`not spaced list ${ploc}`);
                // TODO: This will produce unnecessary "writes" unless we check
                // if children has changed
                nodes[ploc] = { ...node, children };
                other.push(ploc);
            }
        }
    }

    if (sloc == null) throw new Error(`sel node not encountered`);

    if (outer == null && other.length > 1) {
        throw new Error(`cant have seps without an outer loc provided`);
    }

    let root = other[0];

    if (outer != null) {
        const parent = top.nodes[outer];
        if (parent.type !== 'list') throw new Error(`outer not a list`);
        if (parent.kind !== 'spaced' && parent.kind !== 'smooshed') {
            nodes[outer] = { ...parent, children: other, forceMultiline: parent.forceMultiline || forceMultiline };
            root = outer;
        }
    }

    const selPath = findPath(root, nodes, sloc);
    if (selPath == null) {
        console.log(outer, other, nodes);
        throw new Error(`Cannot find path to selected node: ${sloc}`);
    }

    return { nodes, nextLoc, selPath, root };
};

// type FNode = Omit<List<number>, 'type' | 'children'> & { type: 'flist'; children: (Node | FNode)[] };

export const findPath = (root: number, nodes: Nodes, needle: number): number[] | null => {
    let found: number[] | null = null;
    const traverse = (loc: number, path: number[]) => {
        if (path.includes(loc)) throw new Error(`recursion?? ${loc} ${path}`);
        if (found != null) return;
        if (loc === needle) {
            found = path.concat([needle]);
            return;
        }
        const cpath = path.concat([loc]);
        if (!nodes[loc]) return; // not in nodes
        childLocs(nodes[loc]).forEach((child) => traverse(child, cpath));
    };
    traverse(root, []);
    return found;
};

export type NodeAndCursor = { node: Node; cursor: Cursor };

// Removes empty strings from smooshes
export const pruneEmptyIds = (flat: Flat[], selection: { node: Node; cursor: Cursor }) => {
    const res: Flat[] = [];
    flat.forEach((item) => {
        if (!res.length || item.type === 'space' || item.type === 'sep' || item.type === 'smoosh') {
            res.push(item);
            return;
        }
        let at = res.length - 1;
        for (; at >= 0 && res[at].type === 'smoosh'; at--); // ignore intervening smooshes
        if (at < 0) return res.push(item);
        const prev = res[at];

        // if prev separates, this can be blank
        if (prev.type === 'space' || prev.type === 'sep' || prev.type === 'smoosh') return res.push(item);

        if (prev.type === 'id' && prev.text === '') {
            if (prev === selection.node) {
                // move to item
                selection = { node: item as Node, cursor: item.type === 'id' ? { type: 'id', end: 0 } : { type: 'list', where: 'before' } };
            }

            res.splice(at, 1);
            res.push(item);
            return;
        }

        if (item.type === 'id' && item.text === '') {
            if (item === selection.node) {
                // move the selection to prev
                selection = {
                    node: prev,
                    cursor: prev.type === 'id' ? { type: 'id', end: splitGraphemes(prev.text).length } : { type: 'list', where: 'after' },
                };
            }

            return;
        }

        res.push(item);
    });
    return { items: res, selection };
};

export const collapseAdjacentIDs = (flat: Flat[], selection: { node: Node; cursor: Cursor }) => {
    const res: Flat[] = [];
    flat.forEach((item) => {
        if (!res.length || item.type !== 'id') {
            res.push(item);
            return;
        }
        let at = res.length - 1;
        for (; at >= 0 && res[at].type === 'smoosh'; at--); // ignore intervening smooshes
        const prev = res[at];
        if (prev.type === 'id' && (prev.ccls == null || item.ccls == null || prev.ccls === item.ccls)) {
            // mergerate
            const base = prev.loc === -1 ? item : prev;
            res[at] = { ...base, text: prev.text + item.text };

            // Update selections
            if (prev === selection.node) {
                selection = { ...selection, node: res[at] as Id<number> };
            } else if (item === selection.node && selection.cursor.type === 'id') {
                selection = {
                    node: res[at] as Id<number>,
                    cursor: { ...selection.cursor, end: selection.cursor.end + splitGraphemes(prev.text).length },
                };
            }
            return;
        }

        res.push(item);
    });
    return { items: res, selection };
};

export function flatToUpdateNew(
    flat: Flat[],
    selection: { node: Node; cursor: Cursor },
    parent: { isParent: boolean; node: Node; path: Path },
    nodes: Update['nodes'],
    top: Top,
) {
    const one = pruneEmptyIds(flat, selection);
    const two = collapseAdjacentIDs(one.items, one.selection);

    const r = rough(two.items, top, two.selection.node, parent.isParent ? parent.node.loc : undefined);
    Object.assign(r.nodes, nodes);
    // Object.assign(nodes, r.nodes);

    let root = undefined;
    if (r.root !== parent.node.loc) {
        const up = replaceAt(parent.path.children.slice(0, -1), top, parent.node.loc, r.root);
        root = up.root;
        Object.assign(r.nodes, up.nodes);
    }

    return {
        root,
        nodes: r.nodes,
        nextLoc: r.nextLoc,
        selection: {
            start: selStart(pathWithChildren(parentPath(parent.path), ...r.selPath), two.selection.cursor),
        },
    };
}
