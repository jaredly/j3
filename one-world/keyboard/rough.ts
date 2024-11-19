import { Nodes, List, childLocs, Node } from '../shared/cnodes';
import { Flat } from './flatenate';
import { Top } from './utils';

export const rough = (flat: Flat[], top: Top, sel: Node, outer?: number) => {
    const nodes: Nodes = {};
    let nextLoc = top.nextLoc;

    let sloc: number | null = null;

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
            nodes[outer] = { ...parent, children: other };
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
        if (path.includes(loc)) throw new Error(`recursion??`);
        if (found != null) return;
        if (loc === needle) {
            found = path.concat([needle]);
            return;
        }
        const cpath = path.concat([loc]);
        childLocs(nodes[loc]).forEach((child) => traverse(child, cpath));
    };
    traverse(root, []);
    return found;
};
