import equal from 'fast-deep-equal';
import { splitGraphemes } from '../../src/parse/parse';
import { Map } from '../../src/types/mcst';
import { getNodes } from '../overheat/getNodes';
import { ONode } from '../overheat/types';
import { Path } from '../store';
import { KeyUpdate } from './getKeyUpdate';

export const selectStart = (
    idx: number,
    base: Path[],
    map: Map,
): null | Path[] => {
    const pnodes = getNodes(map[idx]);
    for (let pnode of pnodes) {
        const sel = pathSelForNode(pnode, idx, 'start', map);
        if (sel) {
            return base.concat(sel);
        }
    }
    return base.concat([{ idx, child: { type: 'start' } }]);
};

export const selectEnd = (
    idx: number,
    base: Path[],
    map: Map,
): null | Path[] => {
    const pnodes = getNodes(map[idx]).reverse();
    for (let pnode of pnodes) {
        const sel = pathSelForNode(pnode, idx, 'end', map);
        if (sel) {
            return base.concat(sel);
        }
    }
    return base.concat([{ idx, child: { type: 'end' } }]);
};

export const goLeft = (path: Path[], map: Map): KeyUpdate => {
    if (!path.length) return;
    const last = path[path.length - 1];
    const pnodes = getNodes(map[last.idx]);

    let prev: Path[] | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'end', map);
        if (!ps) continue;
        if (ps.length && equal(ps[0].child, last.child)) {
            return prev
                ? { type: 'select', selection: path.slice(0, -1).concat(prev) }
                : goLeft(path.slice(0, -1), map);
        }
        prev = ps;
    }

    return goLeft(path.slice(0, -1), map);
};

export const goRight = (
    path: Path[],
    idx: number,
    map: Map,
    // fromTannot = false,
): KeyUpdate => {
    if (!path.length) return;
    const last = path[path.length - 1];
    // if (!fromTannot && map[idx].tannot && idx !== last.idx) {
    //     const sel = selectStart(
    //         map[idx].tannot!,
    //         path.concat({
    //             idx: idx,
    //             child: { type: 'tannot' },
    //         }),
    //         map,
    //     );
    //     if (sel) {
    //         return {
    //             type: 'select',
    //             selection: sel,
    //         };
    //     }
    // }

    const pnodes = getNodes(map[last.idx]).reverse();
    let prev: Path[] | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'start', map);
        if (!ps) continue;
        if (ps.length && equal(ps[0].child, last.child)) {
            return prev
                ? {
                      type: 'select',
                      selection: path.slice(0, -1).concat(prev),
                  }
                : goRight(
                      path.slice(0, -1),
                      last.idx,
                      map,
                      //   last.child.type === 'tannot',
                  );
        }
        prev = ps;
    }

    // throw new Error(`current not vound in pnodes`);
    return goRight(path.slice(0, -1), last.idx, map);
};

export const pathSelForNode = (
    node: ONode,
    idx: number,
    loc: 'start' | 'end',
    map: Map,
): null | Path[] => {
    switch (node.type) {
        case 'punct':
            return null;
        case 'blinker':
            return [{ idx, child: { type: node.loc } }];
        case 'render':
            return [{ idx, child: { type: loc } }];
        case 'ref': {
            const path: Path[] = [{ idx, child: node.path }];
            const cnode = map[node.id];
            // if (cnode.tannot && loc === 'end') {
            //     return selectEnd(
            //         cnode.tannot,
            //         path.concat({
            //             idx: node.id,
            //             child: { type: 'tannot' },
            //         }),
            //         map,
            //     );
            // }
            switch (cnode.type) {
                case 'array':
                case 'list':
                case 'record':
                case 'string':
                    return [...path, { idx: node.id, child: { type: loc } }];
                case 'identifier':
                    return path.concat([
                        {
                            idx: node.id,
                            child: {
                                type: 'subtext',
                                at:
                                    loc === 'start'
                                        ? 0
                                        : splitGraphemes(cnode.text).length,
                            },
                        },
                    ]);
                case 'spread':
                case 'annot':
                case 'recordAccess':
                    if (loc === 'end') {
                        return selectEnd(node.id, path, map);
                    }
                    if (loc === 'start') {
                        return selectStart(node.id, path, map);
                    }
            }
            return path.concat([{ idx: node.id, child: { type: loc } }]);
        }
    }
};
