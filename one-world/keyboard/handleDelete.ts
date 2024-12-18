import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Collection, Id, isRich, List, Node, Nodes, Table, Text, TextSpan } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { goLeft, isTag, justSel, selectEnd, selectStart, selUpdate, spanEnd, spanStart } from './handleNav';
import { selEnd, SelSide, SelStart } from './handleShiftNav';
import { mergeAdjacentSpans } from './handleSpecialText';
import { textCursorSides, textCursorSides2 } from './insertId';
import { replaceAt } from './replaceAt';
import { replaceIn } from './replaceIn';
import { collapseAdjacentIDs, findPath, fixSelection, flatten, flatToUpdateNew, pruneEmptyIds, unflat } from './rough';
import { TestState } from './test-utils';
import {
    Current,
    Cursor,
    findTableLoc,
    getCurrent,
    lastChild,
    NodeSelection,
    parentLoc,
    parentPath,
    Path,
    pathWithChildren,
    selStart,
    TextCursor,
    Top,
    Update,
} from './utils';

type JoinParent =
    | {
          type: 'list';
          at: number;
          pnode: List<number>;
          parent: Path;
      }
    | { type: 'tag'; pnode: List<number>; parent: Path }
    | { type: 'table'; pat: null | { row: number; col: number }; at: { row: number; col: number }; pnode: Table<number>; parent: Path };
export const joinParent = (path: Path, top: Top): void | JoinParent => {
    const loc = lastChild(path);
    const parent = parentPath(path);
    const pnode = top.nodes[lastChild(parent)];
    if (!pnode) return;
    if (pnode.type === 'table') {
        const { row, col } = findTableLoc(pnode.rows, loc);
        // if (col === 0 && row === 0) return;
        return {
            type: 'table',
            pnode,
            parent,
            at: { row, col },
            pat: row !== 0 || col !== 0 ? { row: col === 0 ? row - 1 : row, col: col === 0 ? pnode.rows[row - 1].length - 1 : col - 1 } : null,
        };
    }
    if (!pnode || pnode.type !== 'list') return;
    if (isTag(pnode.kind) && pnode.kind.node === loc) {
        return { type: 'tag', pnode, parent };
    }
    const at = pnode.children.indexOf(loc);
    if (at > 0 || (pnode.kind !== 'spaced' && pnode.kind !== 'smooshed')) return { type: 'list', pnode, parent, at };
    const up = joinParent(parent, top);
    return up ?? { type: 'list', pnode, parent, at };
};

const removeInPath = ({ root, children }: Path, loc: number): Path => ({
    root,
    children: children.filter((f) => f != loc),
});

const modSelSideTip = (sel: SelStart, mod: (loc: number, cursor: Cursor) => void | { loc: number; cursor: Cursor }): SelStart => {
    const res = mod(lastChild(sel.path), sel.cursor);
    if (res) {
        return selStart(pathWithChildren(parentPath(sel.path), res.loc), res.cursor);
    }
    return sel;
};

const modSelTip = (sel: NodeSelection, mod: (loc: number, cursor: Cursor) => void | { loc: number; cursor: Cursor }): NodeSelection => ({
    start: modSelSideTip(sel.start, mod),
    multi: sel.multi
        ? {
              end: sel.multi.end.cursor ? modSelSideTip(sel.multi.end as SelStart, mod) : sel.multi.end,
              aux: sel.multi.aux?.cursor ? modSelSideTip(sel.multi.aux as SelStart, mod) : sel.multi.aux,
          }
        : undefined,
});

const removeParent = (sel: NodeSelection, loc: number): NodeSelection => ({
    start: { ...sel.start, ...selEnd(removeInPath(sel.start.path, loc)) },
    multi: sel.multi
        ? {
              end: { ...sel.multi.end, ...selEnd(removeInPath(sel.multi.end.path, loc)) },
              aux: sel.multi.aux ? { ...sel.multi.aux, ...selEnd(removeInPath(sel.multi.aux.path, loc)) } : undefined,
          }
        : undefined,
});

export const unwrap = (path: Path, top: Top, sel: NodeSelection) => {
    const node = top.nodes[lastChild(path)];
    if (node.type === 'table') {
        // TODO
        console.warn('cant unwrap table just yet');
    }
    if (node.type !== 'list') return; // TODO idk
    const repl = replaceAt(parentPath(path).children, top, lastChild(path), ...node.children);
    repl.selection = removeParent(sel, lastChild(path));
    rebalanceSmooshed(repl, top);
    joinSmooshed(repl, top);
    disolveSmooshed(repl, top);
    return repl;
};

// oofs. the horror.
// like. now I gotta know who the parent issss
// waittt I can just assert that the relevant thing needs to be in the selection path.
// good deal.
export const disolveSmooshed = (update: Update, top: Top) => {
    // So, we go through anything that has an update...
    Object.keys(update.nodes).forEach((loc) => {
        let node = update.nodes[+loc];
        if (node?.type === 'list' && (node.kind === 'smooshed' || node.kind === 'spaced') && node.children.length === 1) {
            const child = node.children[0];
            const spath = update.selection?.start.path;
            if (!spath) return;
            const at = spath.children.indexOf(node.loc);
            if (at === -1) return;
            update.nodes[node.loc] = null;
            if (at === 0) {
                update.root = child;
            } else {
                const pnode = top.nodes[spath.children[at - 1]];
                const parent = replaceIn(pnode, node.loc, child);
                update.nodes[parent.loc] = parent;
            }
            update.selection = removeParent(update.selection!, node.loc);
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
                    update.nodes[prev.loc] = { ...prev, text: prev.text + child.text };
                    update.nodes[child.loc] = null;

                    const children = node.children.slice();
                    children.splice(i, 1);
                    node = { ...node, children };
                    update.nodes[node.loc] = node;
                    i--;

                    if (update.selection) {
                        update.selection = modSelTip(update.selection, (last, cursor) => {
                            if (last === cloc) {
                                if (cursor.type === 'id') {
                                    return {
                                        loc: ploc,
                                        cursor: {
                                            type: 'id',
                                            end: cursor.end + splitGraphemes(prev.text).length,
                                        },
                                    };
                                }
                                return { loc: ploc, cursor };
                            }
                        });
                    }
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
                if (child?.type === 'list' && child.kind === 'spaced') {
                    const children = node.children.slice();
                    children.splice(i, 1, ...child.children);
                    node = { ...node, children };
                    update.nodes[node.loc] = node;
                    i += child.children.length - 1;
                    // remove the thing
                    if (update.selection) update.selection = removeParent(update.selection, cloc);
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
                    if (update.selection) update.selection = removeParent(update.selection, cloc);
                }
            }
        }
    });
};

const removeSelf = (state: TestState, current: { path: Path; node: Node }): Update | void => {
    const pnode = state.top.nodes[parentLoc(current.path)];
    if (pnode && pnode.type === 'list' && pnode.kind === 'smooshed') {
        // removing an item from a smooshed, got to reevaulate it
        const items = pnode.children.map((loc) => state.top.nodes[loc]).filter((n) => n.loc !== current.node.loc);
        const at = pnode.children.indexOf(current.node.loc);
        if (items.length === 1) {
            const up = replaceAt(parentPath(parentPath(current.path)).children, state.top, pnode.loc, items[0].loc);
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
            state.top,
        );
    }

    if (pnode?.type === 'list' && isTag(pnode.kind) && pnode.kind.attributes === current.node.loc) {
        const sel = selectEnd(pathWithChildren(parentPath(current.path), pnode.kind.node), state.top);
        return sel
            ? {
                  nodes: { [pnode.loc]: { ...pnode, kind: { ...pnode.kind, attributes: undefined } } },
                  selection: { start: sel },
              }
            : undefined;
    }

    if (pnode?.type === 'list' && isRich(pnode.kind)) {
        if (current.node.type === 'text') {
            if (pnode.children.length === 1) {
                return removeSelf(state, { path: parentPath(current.path), node: pnode });
            }
            const children = pnode.children.slice();
            const at = children.indexOf(current.node.loc);
            children.splice(at, 1);
            const nsel = selectEnd(pathWithChildren(parentPath(current.path), children[at === 0 ? 0 : at - 1]), state.top);
            if (!nsel) return;
            return { nodes: { [pnode.loc]: { ...pnode, children } }, selection: { start: nsel } };
        }
    }

    const inRich = pnode?.type === 'list' && isRich(pnode.kind);

    let nextLoc = state.top.nextLoc;
    const loc = nextLoc++;
    const up = replaceAt(parentPath(current.path).children, state.top, current.node.loc, loc);
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

const leftJoin = (state: TestState, cursor: Cursor): Update | void => {
    const got = joinParent(state.sel.start.path, state.top);
    if (!got) {
        const pnode = state.top.nodes[parentLoc(state.sel.start.path)];
        const loc = lastChild(state.sel.start.path);
        if (pnode?.type === 'text') {
            const at = pnode.spans.findIndex((span) => span.type === 'embed' && span.item === loc);
            if (at === -1) return;
            const node = state.top.nodes[loc];
            if (node.type === 'id') {
                // check empty cursor
                const text = (cursor.type === 'id' && cursor.text) || splitGraphemes(node.text);
                if (text.length === 0) {
                    // remove the span
                    const spans = pnode.spans.slice();
                    const ppath = parentPath(state.sel.start.path);
                    spans.splice(at, 1);
                    const start =
                        spans.length === 0
                            ? selStart(ppath, { type: 'list', where: 'inside' })
                            : at === 0
                            ? spanStart(spans[0], 0, ppath, state.top, false)
                            : spanEnd(spans[at - 1], ppath, at - 1, state.top, false);
                    return start
                        ? {
                              nodes: { [pnode.loc]: { ...pnode, spans } },
                              selection: { start },
                          }
                        : undefined;
                }
            }
        }
        return; // prolly at the toplevel? or in a text or table, gotta handle tat
    }

    let node = state.top.nodes[lastChild(state.sel.start.path)];
    const remap: Nodes = {};
    // "maybe commit text changes"
    if (node.type === 'id' && cursor.type === 'id' && cursor.text) {
        node = remap[node.loc] = { ...node, text: cursor.text.join(''), ccls: cursor.text.length === 0 ? undefined : node.ccls };
    }

    // Here's the table folks
    if (got.type === 'table') {
        const { at, parent, pnode, pat } = got;

        if (node.type === 'id' && node.text === '' && pnode.rows.length === 1 && pnode.rows[0].length === 1) {
            if (pnode.forceMultiline) {
                return { nodes: { [pnode.loc]: { ...pnode, forceMultiline: false } } };
            }
            return removeSelf(state, { path: parent, node: pnode });
        } else if (!pat) {
            return selUpdate(selStart(parent, { type: 'list', where: 'start' }));
        }

        const lloc = at.col === 0 ? pnode.rows[at.row - 1][pnode.rows[at.row - 1].length - 1] : pnode.rows[at.row][at.col - 1];
        const rloc = pnode.rows[at.row][at.col];
        const left = flatten(remap[lloc] ?? state.top.nodes[lloc], state.top, remap, 1);
        const right = flatten(remap[rloc] ?? state.top.nodes[rloc], state.top, remap, 1);
        // const right = flatten(state.top.nodes[rloc], state.top, remap, 1);
        // if (rloc !== node.loc) throw new Error('very bad news indeed');

        const flat = [...left, ...right];

        const one = pruneEmptyIds(flat, { node, cursor: state.sel.start.cursor });
        const two = collapseAdjacentIDs(one.items, one.selection);
        const result = unflat(state.top, two.items, two.selection.node);
        const cursor = two.selection.cursor;
        // const result = unflat(state.top, flat, node);
        // const cursor = state.sel.start.cursor;
        if (result.sloc == null) throw new Error(`sel node not encountered`);
        // Object.assign(result.nodes, remap);

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
                start: fixSelection(selStart(pathWithChildren(parentPath(parent), ...selPath), cursor), result.nodes, state.top),
            },
        };

        rebalanceSmooshed(up, state.top);
        joinSmooshed(up, state.top);
        disolveSmooshed(up, state.top);

        return up;
    }

    if (got.type === 'tag') {
        if (node.type === 'id' && node.text === '' && isTag(got.pnode.kind) && got.pnode.kind.node === node.loc) {
            if (got.pnode.children.length === 0) {
                return removeSelf(state, { path: got.parent, node: got.pnode });
            }
        }
        return;
    }

    // There's the listies

    const { at, parent, pnode } = got;
    if (at === 0) {
        if (pnode.kind === 'smooshed' || pnode.kind === 'spaced') {
            const sel = goLeft(parent, state.top);
            return sel ? { nodes: {}, selection: { start: sel } } : undefined;
        }
        if (node.type === 'id' && node.text === '' && pnode.children.length === 1) {
            if (pnode.forceMultiline) {
                return { nodes: { [pnode.loc]: { ...pnode, forceMultiline: false } } };
            }
            if (isTag(pnode.kind)) {
                return {
                    nodes: { [pnode.loc]: { ...pnode, children: [] } },
                    selection: {
                        start: selStart(parent, { type: 'list', where: 'inside' }),
                    },
                };
            }
            return removeSelf(state, { path: parent, node: pnode });
        }
        // Select the '(' opener
        return { nodes: {}, selection: { start: selStart(parent, { type: 'list', where: 'start' }) } };
        // return unwrap(parent, state.top, state.sel);
    }

    let flat = flatten(pnode, state.top, remap);
    let fat = flat.indexOf(node);
    if (fat === -1) throw new Error(`node not in flattened`);
    if (fat === 0) throw new Error(`node first in flat, should have been handled`);
    for (; fat > 0 && flat[fat - 1].type === 'smoosh'; fat--);
    const prev = flat[fat - 1];
    if (prev.type === 'space' || prev.type === 'sep') {
        flat.splice(fat - 1, 1);
    } else {
        // Delete from the prev node actually
        const start = selectEnd(pathWithChildren(parentPath(state.sel.start.path), prev.loc), state.top);
        if (!start) return;
        const res = handleDelete({ top: { ...state.top, nodes: { ...state.top.nodes, ...remap } }, sel: { start } });
        res!.nodes[node.loc] = node;
        return res;
    }

    return flatToUpdateNew(flat, { node, cursor }, { isParent: true, node: pnode, path: parent }, {}, state.top);
};

export const handleDelete = (state: TestState): Update | void => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'list': {
            if (current.cursor.type === 'list') {
                if (current.cursor.where === 'after') {
                    // return { nodes: {}, selection: { start: selStart(current.path, { type: 'list', where: 'end' }) } };
                    if (current.node.type === 'list') {
                        if (current.node.children.length === 0) {
                            return selUpdate(selStart(current.path, { type: 'list', where: 'inside' }));
                        }
                        return selUpdate(
                            selectEnd(pathWithChildren(current.path, current.node.children[current.node.children.length - 1]), state.top),
                        );
                    }
                    if (current.node.type === 'table') {
                        if (current.node.rows.length === 0) {
                            return selUpdate(selStart(current.path, { type: 'list', where: 'inside' }));
                        }
                        const rows = current.node.rows;
                        const last = rows[rows.length - 1];
                        const cell = last[last.length - 1];
                        return selUpdate(selectEnd(pathWithChildren(current.path, cell), state.top));
                    }
                } else if (current.cursor.where === 'before') {
                    // left join agains
                    const up = leftJoin(state, current.cursor);
                    // if (!up) return;
                    // rebalanceSmooshed(up, state.top);
                    // joinSmooshed(up, state.top);
                    // disolveSmooshed(up, state.top);
                    return up;
                } else if (current.cursor.where === 'inside') {
                    if (current.node.type === 'list' && current.node.children.length === 0) {
                        return removeSelf(state, current);
                    }
                    if (current.node.type === 'table' && current.node.rows.length === 0) {
                        return removeSelf(state, current);
                    }
                    return selUpdate(selStart(current.path, { type: 'list', where: 'start' }));
                } else if (current.cursor.where === 'start' && current.node.type === 'list' && current.node.children.length === 0) {
                    if (current.node.type === 'list' && isTag(current.node.kind)) {
                        return selUpdate(
                            selectEnd(pathWithChildren(current.path, current.node.kind.attributes ?? current.node.kind.node), state.top),
                        );
                    }
                    return removeSelf(state, current);
                } else if (current.cursor.where === 'start') {
                    const sel =
                        current.node.type === 'list' && current.node.children.length
                            ? selectStart(pathWithChildren(current.path, current.node.children[0]), state.top)
                            : state.sel.start;
                    if (!sel) return console.warn('cant select start');
                    return unwrap(current.path, state.top, { start: sel });
                }
            }
            return;
        }
        case 'id': {
            let { left, right } = cursorSides(current.cursor);
            if (left === 0 && right === 0) {
                // doin a left join
                return leftJoin(state, current.cursor);
            } else {
                if (left === right) {
                    left--;
                }
                const text = current.cursor.text?.slice() ?? splitGraphemes(current.node.text);
                text.splice(left, right - left);
                if (text.length === 0) {
                    const ppath = parentPath(state.sel.start.path);
                    const parent = state.top.nodes[lastChild(ppath)];
                    if (parent?.type === 'list' && parent.kind === 'smooshed') {
                        let node = state.top.nodes[lastChild(state.sel.start.path)] as Id<number>;
                        node = { ...node, text: '', ccls: undefined };
                        return flatToUpdateNew(
                            parent.children.map((loc) => (loc === node.loc ? node : state.top.nodes[loc])),
                            { node, cursor: { type: 'id', end: 0 } },
                            { isParent: true, node: parent, path: ppath },
                            {},
                            state.top,
                        );
                    }
                }
                return { nodes: {}, selection: { start: selStart(state.sel.start.path, { type: 'id', end: left, text }) } };
            }
        }
        case 'text': {
            if (current.cursor.type === 'list') {
                if (current.cursor.where === 'after') {
                    // return justSel(current.path, { type: 'list', where: 'end' });
                    if (current.node.spans.length === 0) {
                        return selUpdate(selStart(current.path, { type: 'list', where: 'inside' }));
                    }
                    const last = current.node.spans[current.node.spans.length - 1];
                    return selUpdate(spanEnd(last, current.path, current.node.spans.length - 1, state.top, false));
                } else if (current.cursor.where === 'before') {
                    // left join agains
                    return leftJoin(state, current.cursor);
                } else if (current.cursor.where === 'inside') {
                    return removeSelf(state, current);
                }
                return;
            }

            return handleTextDelete(state, current);
        }

        default:
            throw new Error('nop');
    }
};

export const spanLength = (span: TextSpan<unknown>, text: undefined | { index: number; grems: string[] }, index: number) =>
    index === text?.index ? text.grems.length : span.type === 'text' ? splitGraphemes(span.text).length : 1;

const simpleSide = (node: Node, side: 'start' | 'end'): Cursor => {
    if (node.type === 'id') {
        return { type: 'id', end: side === 'start' ? 0 : splitGraphemes(node.text).length };
    }
    return { type: 'list', where: side === 'start' ? 'before' : 'after' };
};

export const normalizeTextCursorSide = (
    spans: TextSpan<number>[],
    side: { index: number; cursor: number },
    text?: { index: number; grems: string[] },
): 'before' | 'after' | { index: number; cursor: number } => {
    side = { ...side };
    while (true) {
        if (side.index >= spans.length) return 'after';
        if (side.index < 0) return 'before';

        const len = spanLength(spans[side.index], text, side.index);
        if (side.cursor > len) {
            side.cursor -= len;
            side.index += 1;
            continue;
        }
        if (side.cursor < 0) {
            if (side.index === 0) return 'before';
            const pix = side.index - 1;
            const len = spanLength(spans[pix], text, pix);
            side.cursor += len;
            side.index -= 1;
            continue;
        }

        break;
    }
    return side;
};

export const handleTextDelete = (state: TestState, current: Extract<Current, { type: 'text' }>): Update | void => {
    if (current.cursor.type !== 'text') return;
    const spans = current.node.spans.slice();
    let { left, right, text } = textCursorSides2(current.cursor);

    if (text) {
        const span = spans[text.index];
        if (span.type === 'text') {
            spans[text.index] = { ...span, text: text.grems.join('') };
        }
    }

    if (left.index === right.index && left.cursor === right.cursor) {
        left = { ...left, cursor: left.cursor - 1 };

        if (spans.length === 1 && spanLength(spans[0], text, 0) === 0) {
            return removeSelf(state, current);
        }

        const loff = normalizeTextCursorSide(spans, left, text);
        if (loff === 'before') {
            const parent = state.top.nodes[parentLoc(current.path)];
            if (parent?.type === 'list' && isRich(parent.kind)) {
                // joinn
                const at = parent.children.indexOf(current.node.loc);
                if (at === 0) {
                    return justSel(parentPath(current.path), { type: 'list', where: 'before' });
                }
                const ploc = parent.children[at - 1];
                const pnode = state.top.nodes[ploc];
                const children = parent.children.slice();
                children.splice(at, 1);
                if (pnode.type === 'text') {
                    const spans = pnode.spans.concat(current.node.spans);
                    const cursor: TextCursor = {
                        type: 'text',
                        end: { index: pnode.spans.length, cursor: 0 },
                    };
                    return {
                        nodes: {
                            [pnode.loc]: { ...pnode, spans: mergeAdjacentSpans(spans, cursor) },
                            [parent.loc]: { ...parent, children },
                        },
                        selection: {
                            start: selStart(pathWithChildren(parentPath(current.path), ploc), cursor),
                        },
                    };
                }
            }

            if (spans[0].type === 'text' && spans[0].text.length === 0) {
                // Remove empty spans
                return {
                    nodes: { [current.node.loc]: { ...current.node, spans: spans.filter((s) => s.type !== 'text' || s.text !== '') } },
                    selection: { start: selStart(current.path, { type: 'list', where: 'before' }) },
                };
            }
            // TODO remove empty at the starts
            return justSel(current.path, { type: 'list', where: 'before' });
        }
        if (loff === 'after') throw new Error(`cant be after`);
        left = loff;
    }

    if (left.index === right.index) {
        const span = spans[left.index];
        if (span.type === 'text') {
            const grems = text?.index === left.index ? text.grems : splitGraphemes(span.text);
            grems.splice(left.cursor, right.cursor - left.cursor);
            return {
                nodes: {},
                selection: {
                    start: selStart(state.sel.start.path, { type: 'text', end: { index: left.index, text: grems, cursor: left.cursor } }),
                },
            };
        }
    }

    let off = 0;
    for (let index = left.index; index <= right.index; index++) {
        const span = spans[index - off];
        const sl = spanLength(span, text, index);
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
        const grems = index === text?.index ? text.grems : splitGraphemes(span.text);
        spans[index - off] = { ...span, text: grems.slice(0, start).concat(grems.slice(end)).join('') };
    }

    return {
        nodes: { [current.node.loc]: { ...current.node, spans } },
        selection: {
            start: selStart(
                current.path,
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
