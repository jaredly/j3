import { Text } from '../shared/cnodes';
import { Top, Update, findTableLoc } from './lisp';

export const replaceWithListItems = (
    path: number[],
    top: Top,
    old: number,
    locs: number[],
): Update['nodes'] => {
    if (path.length <= 1) throw new Error(`no parent`);
    const ploc = path[path.length - 2];
    const parent = top.nodes[ploc];

    if (parent.type === 'id') throw new Error(`id cant be parent`);
    if (parent.type === 'text') {
        const spans = parent.spans.slice();
        const at = spans.findIndex((s) => s.type === 'embed' && s.item === old);
        if (at === -1) throw new Error(`not in parent`);
        const insert: Text<number>['spans'] = [];
        for (let i = 0; i < locs.length; i++) {
            if (i > 0) {
                insert.push({ type: 'text', text: ' ' });
            }
            insert.push({ type: 'embed', item: locs[i] });
        }
        spans.splice(at, 1, ...insert);
        return { [ploc]: { ...parent, spans } };
    }

    if (parent.type === 'table') {
        const rows = parent.rows.slice();
        const { row, col } = findTableLoc(rows, old);
        rows[row].splice(col, 1, ...locs);
        // soo ... we want to always keep rows the same length, btw
        // TODO: readjust the other table columns thanks
        // const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
        return { [ploc]: { ...parent, rows } };
    }

    if (parent.kind === 'smooshed') {
        throw new Error(`parent is smooshed, cannot insert list items`);
    }

    // const parent = parentSmooshed(top, path);
    const children = parent.children.slice();
    const at = parent.children.indexOf(old);
    if (at === -1) {
        throw new Error(`id ${old} not a child of ${parent.loc}`);
    }
    children.splice(at, 1, ...locs);
    return { [parent.loc]: { ...parent, children } };
};
