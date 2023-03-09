import { nidx } from '../../src/grammar';
import { Node } from '../../src/types/cst';
import {
    ListLikeContents,
    Map,
    MCString,
    MNode,
    MNodeExtra,
    toMCST,
} from '../../src/types/mcst';
import { Path, StoreUpdate } from '../store';
import { modChildren } from './modChildren';

export const wrappable = ['spread-contents', 'expr', 'child'];

export function wrapWithParens(
    path: Path[],
    idx: number,
    map: Map,
    kind: 'array' | 'list' | 'record',
    loc: 'start' | 'end' = 'end',
): StoreUpdate | void {
    const parent = path[path.length - 1];
    const nw = newListLike(kind, idx);
    const mp: Map = { [nw.loc.idx]: nw };
    const pnode = map[parent.idx];

    if (pnode.type === 'spread') {
        mp[parent.idx] = { ...pnode, contents: nw.loc.idx };
        return { map: mp, selection: { idx, loc } };
    }

    if (pnode.type === 'string' && parent.child.type === 'expr') {
        const templates = pnode.templates.slice();
        templates[parent.child.at - 1] = {
            expr: nw.loc.idx,
            suffix: templates[parent.child.at - 1].suffix,
        };
        mp[parent.idx] = { ...pnode, templates };
        return { map: mp, selection: { idx, loc } };
    }

    if (
        (pnode.type === 'list' ||
            pnode.type === 'array' ||
            pnode.type === 'record') &&
        parent.child.type === 'child'
    ) {
        const at = parent.child.at;
        mp[parent.idx] = {
            ...pnode,
            ...modChildren(pnode, (items) => {
                items.splice(at, 1, nw.loc.idx);
            }),
        };
        return { map: mp, selection: { idx, loc } };
    }

    return;
}

export function newListLike(
    kind: 'array' | 'list' | 'record',
    ...values: number[]
): MNode {
    return {
        type: kind,
        values,
        loc: { start: 0, end: 0, idx: nidx() },
    };
}

export const newNodeAfter = (
    path: Path[],
    idx: number,
    map: Map,
    node: MNode,
): Map | void => {
    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];

        if (parent.child.type !== 'child' && parent.child.type !== 'inside') {
            continue;
        }
        const child = parent.child;

        const mp: Map = { [node.loc.idx]: node };
        const pnode = map[parent.idx];
        mp[parent.idx] = {
            ...pnode,
            ...modChildren(pnode, (items) => {
                items.splice(
                    child.type === 'child' ? child.at + 1 : 0,
                    0,
                    node.loc.idx,
                );
                return items;
            }),
        };
        return mp;
    }
};
