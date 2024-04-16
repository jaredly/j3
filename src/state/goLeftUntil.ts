import { Map, NsMap } from '../types/mcst';
import { getNodes } from './getNestedNodes';
import { StateSelect } from './getKeyUpdate';
import { Path } from './path';
import { Card, RealizedNamespace, RegMap } from '../../web/custom/UIState';
import { isValidCursorLocation } from '../../web/custom/isValidCursorLocation';
import { selectEnd, pathSelForNode, pathChildEqual } from './navigate';

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
