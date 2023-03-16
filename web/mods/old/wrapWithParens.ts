import { nidx } from '../../../src/grammar';
import { Node } from '../../../src/types/cst';
import {
    ListLikeContents,
    Map,
    MCString,
    MNode,
    MNodeExtra,
    toMCST,
} from '../../../src/types/mcst';
import { replacePath } from '../../old/RecordText';
import { Path } from '../../store';
import { TheUpdate } from '../getKeyUpdate';
import { combinePathSel } from '../navigate';

export function wrapWithParens(
    path: Path[],
    idx: number,
    map: Map,
    kind: 'array' | 'list' | 'record',
    loc: 'start' | 'end' = 'end',
): TheUpdate | void {
    const parent = path[path.length - 1];
    const nw = newListLike(kind, idx);

    const childPath = path.concat({
        idx: nw.loc.idx,
        child: { type: 'child', at: 0 },
    });

    const update = replacePath(parent, nw.loc.idx, map);
    update[nw.loc.idx] = nw;
    return {
        map: update,
        selection: combinePathSel({ sel: { idx, loc }, path: childPath }),
    };
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
