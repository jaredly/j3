import { Path, PathChild, Selection } from '../store';
import { Map } from '../../src/types/mcst';
import { getNodes } from '../overheat/getNodesWithAnnot';
import equal from 'fast-deep-equal';
import { KeyUpdate } from './getKeyUpdate';
import { ONode } from '../overheat/types';

export type PathSel = {
    path: PathChild;
    sel: Selection;
};

export const pathSelForNode = (
    node: ONode,
    idx: number,
    loc: 'start' | 'end',
): null | PathSel => {
    switch (node.type) {
        case 'punct':
            return null;
        case 'blinker':
            return { path: { type: node.loc }, sel: { idx, loc: node.loc } };
        case 'render':
        case 'extra':
            return null;
        case 'ref':
            return { path: node.path, sel: { idx: node.id, loc } };
    }
};

export const goLeft = (path: Path[], idx: number, map: Map): KeyUpdate => {
    if (!path.length) return;
    const last = path[path.length - 1];
    const pnodes = getNodes(map[last.idx]);

    let prev: PathSel | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'end');
        if (!ps) continue;
        if (equal(ps.path, last.child)) {
            return prev
                ? {
                      type: 'select',
                      selection: prev.sel,
                      path: path
                          .slice(0, -1)
                          .concat([{ idx: last.idx, child: prev.path }]),
                  }
                : goLeft(path.slice(0, -1), last.idx, map);
        }
        prev = ps;
    }

    throw new Error(`current not vound in pnodes`);
};
