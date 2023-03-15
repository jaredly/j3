import { Path, PathChild, Selection } from '../store';
import { Map } from '../../src/types/mcst';
import { getNodes } from '../overheat/getNodes';
import equal from 'fast-deep-equal';
import { KeyUpdate } from './getKeyUpdate';
import { ONode } from '../overheat/types';

export type PathSel = {
    path: Path[];
    sel: Selection;
};

export const selectStart = (
    idx: number,
    base: Path[],
    map: Map,
): null | PathSel => {
    const pnodes = getNodes(map[idx]);
    for (let pnode of pnodes) {
        const sel = pathSelForNode(pnode, idx, 'start', map);
        if (sel) {
            return { sel: sel.sel, path: base.concat(sel.path) };
        }
    }
    return { sel: { idx, loc: 'start' }, path: base };
};

export const selectEnd = (
    idx: number,
    base: Path[],
    map: Map,
): null | PathSel => {
    const pnodes = getNodes(map[idx]).reverse();
    for (let pnode of pnodes) {
        const sel = pathSelForNode(pnode, idx, 'end', map);
        if (sel) {
            return { sel: sel.sel, path: base.concat(sel.path) };
        }
    }
    return { sel: { idx, loc: 'end' }, path: base };
};

export const goLeft = (path: Path[], idx: number, map: Map): KeyUpdate => {
    if (!path.length) return;
    const last = path[path.length - 1];
    const pnodes = getNodes(map[last.idx]);

    let prev: PathSel | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'end', map);
        if (!ps) continue;
        if (ps.path.length && equal(ps.path[0].child, last.child)) {
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

export const goRight = (
    path: Path[],
    idx: number,
    map: Map,
    fromTannot = false,
): KeyUpdate => {
    if (!path.length) return;
    const last = path[path.length - 1];
    if (!fromTannot && map[idx].tannot && idx !== last.idx) {
        const sel = selectStart(
            map[idx].tannot!,
            path.concat({
                idx: idx,
                child: { type: 'tannot' },
            }),
            map,
        );
        if (sel) {
            return {
                type: 'select',
                selection: sel.sel,
                path: sel.path,
            };
        }
    }

    const pnodes = getNodes(map[last.idx]).reverse();
    let prev: PathSel | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'start', map);
        if (!ps) continue;
        if (ps.path.length && equal(ps.path[0].child, last.child)) {
            return prev
                ? {
                      type: 'select',
                      selection: prev.sel,
                      path: path.slice(0, -1).concat(prev.path),
                  }
                : goRight(
                      path.slice(0, -1),
                      last.idx,
                      map,
                      last.child.type === 'tannot',
                  );
        }
        prev = ps;
    }

    throw new Error(`current not vound in pnodes`);
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
                    if (loc === 'start') {
                        return selectStart(node.id, path, map);
                    }
            }
            return { path, sel: { idx: node.id, loc } };
        }
    }
};
