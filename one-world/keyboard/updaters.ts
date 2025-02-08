import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, Node, Nodes, RecNodeT, Table, childLocs, fromRec, isRich } from '../shared/cnodes';
import { addUpdate, simpleSide, spanLength } from './handleDelete';
import { isTag, selectEnd, spanEnd, spanStart } from './handleNav';
import { Spat } from './handleSpecialText';
import { replaceAt } from './replaceAt';
import { replaceIn } from './replaceIn';
import { collapseAdjacentIDs, findPath, fixSelection, flatToUpdateNew, flatten, pruneEmptyIds, unflat } from './rough';
import { Cursor, Path, Top, Update, lastChild, parentLoc, parentPath, pathWithChildren, selStart } from './utils';

export const tagSetAttributes = (top: Top, path: Path, node: RecNodeT<boolean>, cursor: Cursor) => {
    const tag = top.nodes[lastChild(path)];
    if (tag.type !== 'list' || !isTag(tag.kind)) {
        return;
    }
    let nextLoc = top.nextLoc;
    const nodes: Nodes = {};
    let selPath: number[] = [];

    const root = fromRec(node, nodes, (loc, __, path) => {
        const nl = nextLoc!++;
        if (loc === true) {
            selPath = path.concat([nl]);
        }
        return nl;
    });

    nodes[tag.loc] = { ...tag, kind: { ...tag.kind, attributes: root } };

    return {
        nodes,
        nextLoc: top.nextLoc + 1,
        selection: { start: selStart(pathWithChildren(path, ...selPath), cursor) },
    };
};

export const textDelete = (top: Top, path: Path, left: Spat, right: Spat) => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;
    const spans = node.spans.slice();

    if (left.index === right.index) {
        const span = spans[left.index];
        if (span.type === 'text') {
            const grems = splitGraphemes(span.text);
            grems.splice(left.cursor, right.cursor - left.cursor);
            return setTextText(top, path, grems.join(''), left.index, left.cursor);
        }
    }

    let off = 0;
    for (let index = left.index; index <= right.index; index++) {
        const span = spans[index - off];
        const sl = spanLength(span, undefined, index);
        const start = left.index === index ? left.cursor : 0;
        const end = right.index === index ? right.cursor : sl;
        if (start === 0 && end === sl) {
            spans.splice(index - off, 1);
            off++;
            continue;
        }
        if (start === sl || end === 0) continue; // nothing to do here
        if (span.type !== 'text') {
            throw new Error(`a non-text span should either be not touched or entirely covered by a text selection`);
        }
        const grems = splitGraphemes(span.text);
        spans[index - off] = { ...span, text: grems.slice(0, start).concat(grems.slice(end)).join('') };
    }

    return {
        nodes: { [node.loc]: { ...node, spans } },
        selection: {
            start: selStart(
                path,
                !spans.length
                    ? { type: 'list', where: 'inside' }
                    : {
                          type: 'text',
                          end:
                              left.index >= spans.length
                                  ? { index: spans.length - 1, cursor: spanLength(spans[spans.length - 1], undefined, 0) }
                                  : { index: left.index, cursor: left.cursor },
                      },
            ),
        },
    };
};
export const joinInList = (top: Top, path: Path, child: { loc: number; cursor: Cursor }) => {
    const pnode = top.nodes[lastChild(path)];
    const node = top.nodes[child.loc];
    let flat = flatten(pnode, top, {});
    let fat = flat.indexOf(node);
    if (fat === -1) throw new Error(`node not in flattened`);
    if (fat === 0) throw new Error(`node first in flat, should have been handled`);
    for (; fat > 0 && flat[fat - 1].type === 'smoosh'; fat--);
    const prev = flat[fat - 1];
    flat.splice(fat - 1, 1);
    return flatToUpdateNew(flat, { node, cursor: child.cursor }, { isParent: true, node: pnode, path }, {}, top);
};
export const removeSpan = (top: Top, path: Path, index: number) => {
    const pnode = top.nodes[lastChild(path)];
    if (pnode.type !== 'text' || index >= pnode.spans.length) return;
    const spans = pnode.spans.slice();
    spans.splice(index, 1);
    const start =
        spans.length === 0
            ? selStart(path, { type: 'list', where: 'inside' })
            : index === 0
            ? spanStart(spans[0], 0, path, top, false)
            : spanEnd(spans[index - 1], path, index - 1, top, false);
    return start ? { nodes: { [pnode.loc]: { ...pnode, spans } }, selection: { start } } : undefined;
};
const prevTableLoc = (table: Table<unknown>, at: { row: number; col: number }) => {
    if (at.row === 0 && at.col === 0) return;
    if (at.col === 0) return { row: at.row - 1, col: table.rows[at.row - 1].length - 1 };
    return { row: at.row, col: at.col - 1 };
};

export const joinTable = (top: Top, path: Path, node: Node, cursor: Cursor, at: { row: number; col: number }): void | Update => {
    const pnode = top.nodes[lastChild(path)];
    if (pnode.type !== 'table') return;
    const pat = prevTableLoc(pnode, at);
    if (!pat) return;

    const lloc = at.col === 0 ? pnode.rows[at.row - 1][pnode.rows[at.row - 1].length - 1] : pnode.rows[at.row][at.col - 1];
    const rloc = pnode.rows[at.row][at.col];
    const left = flatten(top.nodes[lloc], top, {}, 1);
    const right = flatten(top.nodes[rloc], top, {}, 1);

    const flat = [...left, ...right];

    const one = pruneEmptyIds(flat, { node, cursor });
    const two = collapseAdjacentIDs(one.items, one.selection);
    const result = unflat(top, two.items, two.selection.node);
    const ncursor = two.selection.cursor;
    if (result.sloc == null) {
        throw new Error(`sel node not encountered`);
    }

    if (result.other.length !== 1) throw new Error(`join should result in 1 top`);

    const rows = pnode.rows.slice();
    rows[at.row] = rows[at.row].slice();
    rows[at.row].splice(at.col - 1, 1); // , ...result.other);
    if (pat.row !== at.row) {
        rows[pat.row] = rows[pat.row].concat(rows[at.row]);
        rows.splice(at.row, 1);
    }
    rows[pat.row][pat.col] = result.other[0];

    result.nodes[pnode.loc] = { ...pnode, rows };

    const selPath = findPath(pnode.loc, result.nodes, result.sloc);
    if (!selPath) throw new Error(`can't find sel in selpath.`);

    const up: Update = {
        nodes: result.nodes,
        nextLoc: result.nextLoc,
        selection: {
            start: fixSelection(selStart(pathWithChildren(parentPath(path), ...selPath), ncursor), result.nodes, top),
        },
    };

    rebalanceSmooshed(up, top);
    joinSmooshed(up, top);
    disolveSmooshed(up, top);

    return up;
};

export const replaceSelf = (top: Top, path: Path, node: RecNodeT<boolean>, cursor: Cursor) => {
    let nextLoc = top.nextLoc;
    const nodes: Nodes = {};
    let selPath: number[] = [];

    const root = fromRec(node, nodes, (loc, __, path) => {
        const nl = nextLoc!++;
        if (loc === true) {
            selPath = path.concat([nl]);
        }
        return nl;
    });

    if (!selPath.length) return;

    const up = replaceAt(parentPath(path).children, top, lastChild(path), root);
    up.nextLoc = nextLoc;
    Object.assign(up.nodes, nodes);
    up.selection = { start: selStart(pathWithChildren(parentPath(path), ...selPath), cursor) };
    return up;
};

export const removeSelf = (top: Top, current: { path: Path; node: Node }): Update | void => {
    const pnode = top.nodes[parentLoc(current.path)];
    if (pnode && pnode.type === 'list' && pnode.kind === 'smooshed') {
        // removing an item from a smooshed, got to reevaulate it
        const items = pnode.children.map((loc) => top.nodes[loc]).filter((n) => n.loc !== current.node.loc);
        const at = pnode.children.indexOf(current.node.loc);
        if (items.length === 1) {
            const up = replaceAt(parentPath(parentPath(current.path)).children, top, pnode.loc, items[0].loc);
            up.selection = {
                start: selStart(
                    pathWithChildren(parentPath(parentPath(current.path)), items[0].loc),
                    simpleSide(items[0], at === 0 ? 'start' : 'end'),
                ),
            };
        }
        if (items.length === 0) {
            throw new Error(`shouldnt have a 1-length smoosh`);
        }
        if (at === -1) throw new Error('current not in parent');
        const sel = at === 0 ? items[0] : items[at - 1];
        const ncursor = simpleSide(sel, at === 0 ? 'start' : 'end');
        return flatToUpdateNew(
            items,
            { node: sel, cursor: ncursor },
            { isParent: true, node: pnode, path: parentPath(current.path) },
            { [current.node.loc]: null },
            top,
        );
    }

    if (pnode?.type === 'list' && isTag(pnode.kind)) {
        if (pnode.kind.attributes === current.node.loc) {
            const sel = selectEnd(pathWithChildren(parentPath(current.path), pnode.kind.node), top);
            return sel
                ? {
                      nodes: { [pnode.loc]: { ...pnode, kind: { ...pnode.kind, attributes: undefined } } },
                      selection: { start: sel },
                  }
                : undefined;
        }
        if (pnode.children.length === 1 && pnode.children[0] === current.node.loc) {
            return {
                nodes: { [pnode.loc]: { ...pnode, children: [] } },
                selection: {
                    start: selStart(parentPath(current.path), { type: 'list', where: 'inside' }),
                },
            };
        }
    }

    if (pnode?.type === 'list' && isRich(pnode.kind)) {
        if (current.node.type === 'text') {
            if (pnode.children.length === 1) {
                return removeSelf(top, { path: parentPath(current.path), node: pnode });
            }
            const children = pnode.children.slice();
            const at = children.indexOf(current.node.loc);
            children.splice(at, 1);
            const nsel = selectEnd(pathWithChildren(parentPath(current.path), children[at === 0 ? 0 : at - 1]), top);
            if (!nsel) return;
            return { nodes: { [pnode.loc]: { ...pnode, children } }, selection: { start: nsel } };
        }
    }

    const inRich = pnode?.type === 'list' && isRich(pnode.kind);

    let nextLoc = top.nextLoc;
    const loc = nextLoc++;
    const up = replaceAt(parentPath(current.path).children, top, current.node.loc, loc);
    up.nextLoc = nextLoc;
    up.nodes[loc] = inRich ? { type: 'text', spans: [{ type: 'text', text: '' }], loc } : { type: 'id', loc, text: '' };
    up.selection = {
        start: selStart(
            pathWithChildren(parentPath(current.path), loc),
            inRich ? { type: 'text', end: { index: 0, cursor: 0 } } : { type: 'id', end: 0 },
        ),
    };
    return up;
};
export const setTextText = (top: Top, path: Path, text: string, index: number, end: number) => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;
    const spans = node.spans.slice();
    const span = spans[index];
    if (span.type !== 'text') return;

    spans[index] = { ...span, text };
    // this is 'set text text'
    return {
        nodes: { [node.loc]: { ...node, spans } },
        selection: {
            start: selStart(path, { type: 'text', end: { index, cursor: end } }),
        },
        // tmpText: { [`${current.node.loc}:${left.index}`]: grems },
    };
};

export const setIdText = (top: Top, path: Path, text: string, end: number, ccls?: number) => {
    if (text.length === 0) {
        const ppath = parentPath(path);
        const parent = top.nodes[lastChild(ppath)];
        if (parent?.type === 'list' && parent.kind === 'smooshed') {
            let node = top.nodes[lastChild(path)] as Id<number>;
            node = { ...node, text: '', ccls: undefined };
            return flatToUpdateNew(
                parent.children.map((loc) => (loc === node.loc ? node : top.nodes[loc])),
                { node, cursor: { type: 'id', end: 0 } },
                { isParent: true, node: parent, path: ppath },
                {},
                top,
            );
        }
    }
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'id') return;
    return {
        nodes: { [node.loc]: { ...node, text, ccls: text.length === 0 ? undefined : ccls ?? node.ccls } },
        // tmpText: { [current.node.loc]: text },
        selection: { start: selStart(path, { type: 'id', end }) },
    };
}; // oofs. the horror.
// like. now I gotta know who the parent issss
// waittt I can just assert that the relevant thing needs to be in the selection path.
// good deal.

export const disolveSmooshed = (update: Update, top: Top) => {
    // So, we go through anything that has an update...
    Object.keys(update.nodes).forEach((loc) => {
        let node = update.nodes[+loc];
        if (node?.type === 'list' && (node.kind === 'smooshed' || node.kind === 'spaced') && node.children.length === 1) {
            const child = node.children[0];
            if (top.root === node.loc) {
                update.root = child;
            } else {
                const ploc = findParent(update.nodes, node.loc) ?? findParent(top.nodes, node.loc);
                if (ploc == null) {
                    console.warn(`cant collapse smoosh; cant find parent of ${node.loc}`);
                    return;
                }
                const pnode = update.nodes[ploc] ?? top.nodes[ploc];
                const parent = replaceIn(pnode, node.loc, child);
                update.nodes[parent.loc] = parent;
            }
            update.nodes[node.loc] = null;
            update.selection = addUpdate(update.selection, { type: 'unparent', loc: node.loc });
        }
    });
};

export const joinSmooshed = (update: Update, top: Top) => {
    // So, we go through anything that has an update...
    Object.keys(update.nodes).forEach((loc) => {
        let node = update.nodes[+loc];
        if (node?.type === 'list' && node.kind === 'smooshed') {
            for (let i = 1; i < node.children.length; i++) {
                const cloc = node.children[i];
                const ploc = node.children[i - 1];
                const child = update.nodes[cloc] ?? top.nodes[cloc];
                const prev = update.nodes[ploc] ?? top.nodes[ploc];

                if (prev.type === 'id' && child.type === 'id' && (prev.ccls === child.ccls || child.text === '' || prev.text === '')) {
                    // we delete one of these
                    update.nodes[prev.loc] = { ...prev, text: prev.text + child.text, ccls: prev.ccls == null ? child.ccls : prev.ccls };
                    update.nodes[child.loc] = null;

                    const children = node.children.slice();
                    children.splice(i, 1);
                    node = { ...node, children };
                    update.nodes[node.loc] = node;
                    i--;

                    update.selection = addUpdate(update.selection, {
                        type: 'id',
                        from: { loc: cloc, offset: 0 },
                        to: { loc: ploc, offset: splitGraphemes(prev.text).length },
                    });
                }
            }
        }
    });
};

export const rebalanceSmooshed = (update: Update, top: Top) => {
    // So, we go through anything that has an update...
    Object.keys(update.nodes).forEach((loc) => {
        let node = update.nodes[+loc];
        if (node?.type === 'list' && node.kind === 'spaced') {
            for (let i = 0; i < node.children.length; i++) {
                const cloc = node.children[i];
                const child = update.nodes[cloc] ?? top.nodes[cloc];
                // We have a spaces within a spaced. splice grandchildren in
                if (child?.type === 'list' && child.kind === 'spaced') {
                    const children = node.children.slice();
                    children.splice(i, 1, ...child.children);
                    node = { ...node, children };
                    update.nodes[node.loc] = node;
                    i += child.children.length - 1;
                    // remove the thing
                    update.selection = addUpdate(update.selection, { type: 'unparent', loc: cloc });
                }
            }
        }

        if (node?.type === 'list' && node.kind === 'smooshed') {
            for (let i = 0; i < node.children.length; i++) {
                const cloc = node.children[i];
                const child = update.nodes[cloc] ?? top.nodes[cloc];
                if (child?.type === 'list' && child.kind === 'smooshed') {
                    const children = node.children.slice();
                    children.splice(i, 1, ...child.children);
                    node = { ...node, children };
                    update.nodes[node.loc] = node;
                    i += child.children.length - 1;
                    // remove the thing
                    update.selection = addUpdate(update.selection, { type: 'unparent', loc: cloc });
                }
            }
        }
    });
};
export const findParent = (nodes: Update['nodes'], loc: number): number | null => {
    for (let key of Object.keys(nodes)) {
        const node = nodes[+key];
        if (node) {
            const children = childLocs(node);
            if (children.includes(loc)) {
                return +key;
            }
        }
    }
    return null;
};
