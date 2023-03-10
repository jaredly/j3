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
        case 'extra':
            return null;
        case 'ref': {
            const path: Path[] = [{ idx, child: node.path }];
            const cnode = map[node.id];
            switch (cnode.type) {
                case 'array':
                case 'list':
                case 'record':
                case 'string':
                    return {
                        path: [...path, { idx: node.id, child: { type: loc } }],
                        sel: { idx: node.id, loc },
                    };
            }
            return { path, sel: { idx: node.id, loc } };
        }
    }
};

export const goLeft = (path: Path[], idx: number, map: Map): KeyUpdate => {
    if (!path.length) return;
    const last = path[path.length - 1];
    const pnodes = getNodes(map[last.idx]);

    console.log('going left', last.child, pnodes);
    let prev: PathSel | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'end', map);
        if (!ps) continue;
        if (equal(ps.path[0].child, last.child)) {
            console.log(ps.path, last.child, prev);
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
