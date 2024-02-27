import equal from 'fast-deep-equal';
import { splitGraphemes } from '../parse/parse';
import { Map } from '../types/mcst';
import { getNodes } from './getNestedNodes';
import { ONode } from './types';
import { StateSelect } from './getKeyUpdate';
import { Path } from './path';
import { Card } from '../../web/custom/UIState';
import { nsPath } from './newNodeBefore';

export const selectStart = (
    idx: number,
    base: Path[],
    map: Map,
): null | Path[] => {
    const pnodes = getNodes(map[idx], map);
    for (let pnode of pnodes) {
        const sel = pathSelForNode(pnode, idx, 'start', map);
        if (sel) {
            return base.concat(sel);
        }
    }
    return base.concat([{ idx, type: 'start' }]);
};

export const selectEnd = (
    idx: number,
    base: Path[],
    map: Map,
): null | Path[] => {
    const pnodes = getNodes(map[idx], map).reverse();
    for (let pnode of pnodes) {
        const sel = pathSelForNode(pnode, idx, 'end', map);
        if (sel) {
            return base.concat(sel);
        }
    }
    return base.concat([{ idx, type: 'end' }]);
};

export const pathChildEqual = (
    { idx: _, ...one }: Path,
    { idx, ...two }: Path,
) => {
    return equal(one, two);
};

export const goLeft = (
    path: Path[],
    map: Map,
    cards: Card[],
): StateSelect | void => {
    if (!path.length) return;
    const last = path[path.length - 1];

    if (last.type === 'ns') {
        // HERE we traverse the card/namespace dealio
        const nsp = nsPath(path);
        if (!nsp) return;
        let ns = cards[nsp[0]].ns;
        for (let at of nsp.slice(1, -1)) {
            const child = ns.children[at];
            if (!child || child.type !== 'normal') {
                return;
            }
            ns = child;
        }
        const last = nsp[nsp.length - 1];
        if (last === 0) return;
        const nns = ns.children[last - 1];
        if (nns.type !== 'normal') {
            return;
        }
        const end = selectEnd(
            nns.top,
            path.slice(0, -1).concat([
                {
                    type: 'ns',
                    idx: -1,
                    at: last - 1,
                },
            ]),
            map,
        );
        if (!end) return;
        return { type: 'select', selection: end };
    }

    const pnodes = getNodes(map[last.idx], map);

    let prev: Path[] | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'end', map);
        if (!ps) continue;
        if (ps.length && pathChildEqual(ps[0], last)) {
            return prev
                ? { type: 'select', selection: path.slice(0, -1).concat(prev) }
                : goLeft(path.slice(0, -1), map, cards);
        }
        prev = ps;
    }

    return goLeft(path.slice(0, -1), map, cards);
};

export const goRight = (
    path: Path[],
    idx: number,
    map: Map,
): StateSelect | void => {
    if (!path.length) return;
    const last = path[path.length - 1];

    const pnodes = getNodes(map[last.idx], map).reverse();
    let prev: Path[] | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'start', map);
        if (!ps) continue;
        if (ps.length && pathChildEqual(ps[0], last)) {
            return prev
                ? {
                      type: 'select',
                      selection: path.slice(0, -1).concat(prev),
                  }
                : goRight(path.slice(0, -1), last.idx, map);
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
            return [{ idx, type: node.loc }];
        case 'render':
            return [{ idx, type: loc }];
        case 'ref': {
            const path: Path[] = [{ idx, ...node.path }];
            const cnode = map[node.id];
            switch (cnode.type) {
                case 'array':
                case 'list':
                case 'record':
                case 'string':
                    return [...path, { idx: node.id, type: loc }];
                case 'identifier':
                    return path.concat([
                        {
                            idx: node.id,

                            type: 'subtext',
                            at:
                                loc === 'start'
                                    ? 0
                                    : splitGraphemes(cnode.text).length,
                        },
                    ]);
                case 'tapply':
                    if (loc === 'start') {
                        return selectStart(node.id, path, map);
                    }
                    break;
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
            return path.concat([{ idx: node.id, type: loc }]);
        }
    }
};
