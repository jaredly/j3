// Roughen

import { List, ListKind, Node, Nodes } from '../shared/cnodes';
import { Flat, flatten } from './flatenate';
import { asTop, id, idc, round, smoosh, spaced } from './test-utils';
import { Top } from './utils';

// First, we flat

test('flat', () => {
    const { top } = asTop(id('', true), idc(0));
    const n = top.nodes;
    expect(flatten(n[top.root], top)).toEqual([n[0]]);
});

test('simple round', () => {
    const { top } = asTop(round([id('', true)]), idc(0));
    const n = top.nodes;
    expect(flatten(n[top.root], top)).toEqual([n[1]]);
});

test('all three levels', () => {
    const { top } = asTop(round([id('', true), id(''), spaced([id(''), smoosh([id('a'), id('+')])])]), idc(0));
    const n = top.nodes;
    expect(flatten(n[top.root], top)).toEqual([
        n[1],
        { loc: 0, type: 'sep' },
        n[2],
        { loc: 0, type: 'sep' },
        n[4],
        { loc: 3, type: 'space' },
        n[6],
        { loc: 5, type: 'smoosh' },
        n[7],
    ]);
});

type FNode = Omit<List<number>, 'type' | 'children'> & { type: 'flist'; children: (Node | FNode)[] };

const rough = (flat: Flat[], top: Top, sel: Node, outer?: number) => {
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

            if (loc === -1) {
                loc = nextLoc++;
                nodes[loc] = { type: 'list', kind: 'smooshed', loc, children: schildren };
            } else {
                const parent = top.nodes[loc];
                if (parent.type !== 'list' || parent.kind !== 'smooshed') throw new Error(`not smoshed ${loc}`);
                nodes[loc] = { ...parent, children: schildren };
            }
            children.push(loc);

            // it's a space, and the loc hasnt been used yet
            if (ploc === -1 && i < flat.length && flat[i].type === 'space' && !nodes[flat[i].loc]) {
                ploc = flat[i].loc;
            }

            if (i < flat.length && flat[i].type === 'sep') break;
        }

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

    if (sloc == null) throw new Error(`sel node not encountered`);

    if (outer == null && other.length > 1) {
        throw new Error(`cant have seps without an outer loc provided`);
    }
    if (outer != null) {
        const parent = top.nodes[outer];
        if (parent.type !== 'list') throw new Error(`outer not a list`);
        nodes[outer] = { ...parent, children: other };
    }
};

// Then, we rough
