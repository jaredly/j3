import equal from 'fast-deep-equal';
import { splitGraphemes } from '../parse/parse';
import { Map, NsMap } from '../types/mcst';
import { getNodes } from './getNestedNodes';
import { ONode } from './types';
import { StateSelect } from './getKeyUpdate';
import { Path } from './path';
import { Card, RealizedNamespace, RegMap } from '../../web/custom/UIState';
import { isValidCursorLocation } from '../../web/custom/Cursors';

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

export const goLeftUntil = (
    path: Path[],
    map: Map,
    nsMap: NsMap,
    cards: Card[],
    valid?: RegMap,
) => {
    let next = goLeft(path, map, nsMap, cards);
    while (valid && next && !isValidCursorLocation(next.selection, valid)) {
        next = goLeft(next.selection, map, nsMap, cards);
    }
    return next;
};

export const goLeft = (
    path: Path[],
    map: Map,
    nsMap: NsMap,
    cards: Card[],
): StateSelect | void => {
    if (!path.length) return;
    // debugger;
    const last = path[path.length - 1];

    if (last.type === 'ns') {
        const ns = nsMap[last.idx] as RealizedNamespace;
        const at = ns.children.indexOf(last.child);
        if (at === 0) return goLeft(path.slice(0, -1), map, nsMap, cards);
        const end = selectEnd(
            (nsMap[ns.children[at - 1]] as RealizedNamespace).top,
            path.slice(0, -1).concat([
                { ...last, child: ns.children[at - 1] },
                {
                    type: 'ns-top',
                    idx: ns.children[at - 1],
                },
            ]),
            map,
        );
        if (!end) return;
        return { type: 'select', selection: end };
    }
    if (last.type === 'ns-top') {
        return goLeft(path.slice(0, -1), map, nsMap, cards);
    }

    const pnodes = getNodes(map[last.idx], map);

    let prev: Path[] | null = null;
    for (let pnode of pnodes) {
        const ps = pathSelForNode(pnode, last.idx, 'end', map);
        if (!ps) continue;
        if (ps.length && pathChildEqual(ps[0], last)) {
            return prev
                ? { type: 'select', selection: path.slice(0, -1).concat(prev) }
                : goLeft(path.slice(0, -1), map, nsMap, cards);
        }
        prev = ps;
    }

    return goLeft(path.slice(0, -1), map, nsMap, cards);
};

export const goRightUntil = (
    path: Path[],
    map: Map,
    nsMap: NsMap,
    cards: Card[],
    valid?: RegMap,
) => {
    let next = goRight(path, map, nsMap, cards);
    while (valid && next && !isValidCursorLocation(next.selection, valid)) {
        next = goRight(next.selection, map, nsMap, cards);
    }
    return next;
};

export const goRight = (
    path: Path[],
    map: Map,
    nsMap: NsMap,
    cards: Card[],
): StateSelect | void => {
    if (!path.length) return;
    const last = path[path.length - 1];

    if (last.type === 'ns') {
        const ns = nsMap[last.idx] as RealizedNamespace;
        const at = ns.children.indexOf(last.child);
        if (at === ns.children.length - 1)
            return goRight(path.slice(0, -1), map, nsMap, cards);
        const end = selectStart(
            (nsMap[ns.children[at + 1]] as RealizedNamespace).top,
            path.slice(0, -1).concat([
                { ...last, child: ns.children[at + 1] },
                {
                    type: 'ns-top',
                    idx: ns.children[at + 1],
                },
            ]),
            map,
        );
        if (!end) return;
        return { type: 'select', selection: end };
    }
    if (last.type === 'ns-top') {
        return goRight(path.slice(0, -1), map, nsMap, cards);
    }

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
                : goRight(path.slice(0, -1), map, nsMap, cards);
        }
        prev = ps;
    }

    return goRight(path.slice(0, -1), map, nsMap, cards);
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
            if (node.ancestors) {
                console.log('got ancestors folks');
            }
            const path: Path[] = [
                ...(node.ancestors ?? []),
                ...(node.path ? [{ idx, ...node.path }] : []),
            ];
            const cnode = map[node.id];
            if (!cnode) return [];
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
