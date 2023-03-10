import { Path, PathChild, Selection } from '../store';
import { Map } from '../../src/types/mcst';
import { getNodes } from '../overheat/getNodesWithAnnot';
import equal from 'fast-deep-equal';
import { KeyUpdate } from './getKeyUpdate';
import { ONode } from '../overheat/types';

export type PathSel = {
    path: Path[];
    sel: Selection;
};

export const selectEnd = (
    idx: number,
    base: Path[],
    map: Map,
): null | PathSel => {
    const pnodes = getNodes(map[idx]);
    for (let i = pnodes.length - 1; i >= 0; i--) {
        const sel = pathSelForNode(pnodes[i], idx, 'end', map);
        if (sel) {
            // console.log(`sel end at ${i}`, sel);
            return { sel: sel.sel, path: base.concat(sel.path) };
        }
    }
    // console.warn('no end?');
    return { sel: { idx, loc: 'end' }, path: base };
};

export const pathSelForNode = (
    node: ONode,
    idx: number,
    loc: 'start' | 'end',
    map: Map,
): null | PathSel => {
    switch (node.type) {
        case 'punct':
            return null;
        case 'blinker':
            return {
                path: [{ idx, child: { type: node.loc } }],
                sel: { idx, loc: node.loc },
            };
        case 'render':
            return {
                path: [],
                sel: { idx, loc },
            };
        case 'extra':
            return null;
        case 'ref': {
            const path: Path[] = [{ idx, child: node.path }];
            const cnode = map[node.id];
            if (cnode.tannot && loc === 'end') {
                return selectEnd(
                    cnode.tannot,
                    path.concat({ idx: node.id, child: { type: 'tannot' } }),
                    map,
                );
            }
            switch (cnode.type) {
                case 'array':
                case 'list':
                case 'record':
                case 'string':
                    return {
                        path: [...path, { idx: node.id, child: { type: loc } }],
                        sel: { idx: node.id, loc },
                    };
                case 'spread':
                case 'recordAccess':
                    if (loc === 'end') {
                        return selectEnd(node.id, path, map);
                    }
            }
            return { path, sel: { idx: node.id, loc } };
        }
    }
};

export const goLeft = (path: Path[], idx: number, map: Map): KeyUpdate => {
    if (!path.length) return;
    const last = path[path.length - 1];
    const pnodes = getNodes(map[last.idx]);

    // console.log('going left', last.child, pnodes);
    let prev: PathSel | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'end', map);
        if (!ps) continue;
        // 🤔 🧐 I'm a little skeptical about this.
        // Does this mean that if we're selected in a `render`,
        // we'll never ... get to know? idx.
        if (ps.path.length && equal(ps.path[0].child, last.child)) {
            // console.log(ps.path, last.child, prev);
            return prev
                ? {
                      type: 'select',
                      selection: prev.sel,
                      path: path.slice(0, -1).concat(prev.path),
                  }
                : goLeft(path.slice(0, -1), last.idx, map);
        }
        prev = ps;
    }

    throw new Error(`current not vound in pnodes`);
};
