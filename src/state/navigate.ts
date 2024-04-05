import equal from 'fast-deep-equal';
import { splitGraphemes } from '../parse/parse';
import { Map } from '../types/mcst';
import { getNodes } from './getNestedNodes';
import { ONode } from './types';
import { Path } from './path';

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
