import { Action } from '../../../shared/action2';
import { lastChild } from '../../../shared/IR/nav';
import {
    Path,
    pathWithChildren,
    parentPath,
    Nodes,
    serializePath,
    Node,
} from '../../../shared/nodes';
import { findTableLoc, topUpdate } from './handleUpdate';

export const addTableColumn = (
    pnode: Extract<Node, { type: 'table' }>,
    path: Path,
    topId: string,
    nextLoc: number,
): Action[] => {
    const loc = lastChild(path);
    const { row, col } = findTableLoc(pnode, loc);
    const rows = pnode.rows.slice();
    rows[row] = rows[row].slice();
    const nidx = nextLoc++;
    rows[row].splice(col + 1, 0, nidx);
    const npath = pathWithChildren(parentPath(path), nidx);
    const update: Nodes = {
        [pnode.loc]: {
            type: 'table',
            loc: pnode.loc,
            kind: pnode.kind,
            rows,
        },
        [nidx]: { type: 'id', loc: nidx, text: '' },
    };

    const maxCols = pnode.rows.reduce((m, r) => Math.max(m, r.length), 0);
    if (pnode.rows[row].length === maxCols) {
        // add to everything
        for (let i = 0; i < rows.length; i++) {
            if (i === row) continue;
            rows[i] = rows[i].slice();
            const loc = nextLoc++;
            rows[i].splice(col + 1, 0, loc);
            update[loc] = { type: 'id', loc, text: '' };
        }
    }

    return [
        topUpdate(topId, update, nextLoc),
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                {
                    type: 'ir',
                    start: {
                        path: npath,
                        key: serializePath(npath),
                        cursor: {
                            type: 'text',
                            end: { index: 0, cursor: 0 },
                        },
                    },
                },
            ],
        },
    ];
};
