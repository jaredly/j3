import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Nodes } from '../../shared/cnodes';
import { richNode } from '../handleNav';
import { Spat } from '../handleSpecialText';
import { Top, Path, Update, parentLoc, lastChild, findTableLoc, selStart, pathWithChildren, parentPath, gparentLoc, getSpanIndex } from '../utils';

export const splitTextInRich = (top: Top, path: Path, at: Spat): void | Update => {
    let parent = top.nodes[parentLoc(path)];
    if (!richNode(parent)) return;
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'text') return;
    const lat = getSpanIndex(current.spans, at.index);
    const span = current.spans[lat];
    if (span.type !== 'text') return;
    const text = splitGraphemes(span.text);

    // nowww we split.
    // hrm but we also need to allow a mods
    const before = current.spans.slice(0, lat + 1);
    before[before.length - 1] = { ...span, text: text.slice(0, at.cursor).join('') };
    const after = current.spans.slice(lat);
    after[0] = { ...span, text: text.slice(at.cursor).join('') };

    let nextLoc = top.nextLoc;
    const loc = nextLoc++ + '';

    const nodes: Nodes = {};

    if (parent.type === 'list') {
        const pat = parent.children.indexOf(current.loc);
        if (pat === -1) throw new Error(`canrt find ${current.loc} in parent ${parent.loc} : ${parent.children}`);
        const children = parent.children.slice();
        children.splice(pat + 1, 0, loc);
        parent = { ...parent, children };
    } else if (parent.type === 'table') {
        const { row, col } = findTableLoc(parent.rows, current.loc);
        const rows = parent.rows.slice();
        const right = rows[row].slice(col + 1);
        rows[row] = rows[row].slice(0, col + 1);
        rows.splice(row + 1, 0, [loc, ...right]);
        if (!right.length) {
            for (let i = 1; i < rows[row].length; i++) {
                const cloc = nextLoc++ + '';
                nodes[cloc] = { type: 'text', spans: [{ type: 'text', text: '', loc: nextLoc++ + '' }], loc: cloc };
                rows[row + 1].push(cloc);
            }
        }
        parent = { ...parent, rows };
    }

    return {
        nodes: {
            ...nodes,
            [current.loc]: { ...current, spans: before },
            [loc]: { type: 'text', loc, spans: after },
            [parent.loc]: parent,
        },
        selection: { start: selStart(pathWithChildren(parentPath(path), loc), { type: 'text', end: { index: 0, cursor: 0 } }) },
        nextLoc,
    };
};

export const dedentOutOfRich = (top: Top, path: Path): void | Update => {
    const parent = top.nodes[parentLoc(path)];
    const gparent = top.nodes[gparentLoc(path)];
    const loc = lastChild(path);
    if (gparent.type !== 'list' || parent.type !== 'list' || !richNode(parent) || !richNode(gparent)) {
        return;
    }

    const gchildren = gparent.children.slice();
    const children = parent.children.slice();
    const at = children.indexOf(loc);
    const gat = gchildren.indexOf(parent.loc);
    const after = children.slice(at + 1);
    children.splice(at);
    gchildren.splice(gat + 1, 0, loc);
    let nextLoc = top.nextLoc;
    const nodes: Nodes = {};
    if (after.length) {
        const loc = nextLoc++ + '';
        gchildren.splice(gat + 2, 0, loc);
        nodes[loc] = { ...parent, children: after, loc };
    }
    nodes[gparent.loc] = { ...gparent, children: gchildren };
    nodes[parent.loc] = { ...parent, children };
    return {
        nodes,
        selection: {
            start: selStart(pathWithChildren(parentPath(parentPath(path)), loc), {
                type: 'text',
                end: { index: 0, cursor: 0 },
            }),
        },
        nextLoc,
    };
};
