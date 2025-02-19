import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { isRich, List, Node, NodeID, Table, Text, TextSpan } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { isBlank } from './flatenate';
import { goLeft, isTag, selectEnd, selectStart, spanEnd } from './handleNav';
import { Spat } from './handleSpecialText';
// import { textCursorSides, textCursorSides2 } from './insertId';
import { idText } from './cursorSplit';
import { KeyAction, moveA } from './keyActionToUpdate';
import { replaceAt } from './replaceAt';
import { flatten, updateNodes } from './rough';
import { getCurrent } from './selections';
import { TestState } from './test-utils';
import { disolveSmooshed, joinSmooshed, rebalanceSmooshed } from './update/list';
import {
    Cursor,
    findTableLoc,
    getSpan,
    getSpanIndex,
    lastChild,
    move,
    NodeSelection,
    parentLoc,
    parentPath,
    Path,
    pathWithChildren,
    selStart,
    SelUpdate,
    TextIndex,
    Top,
} from './utils';

type JoinParent =
    | {
          type: 'list';
          at: number;
          pnode: List<NodeID>;
          parent: Path;
      }
    | { type: 'tag'; pnode: List<NodeID>; parent: Path }
    | { type: 'table'; pat: null | { row: number; col: number }; at: { row: number; col: number }; pnode: Table<NodeID>; parent: Path };
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

export const removeInPath = ({ root, children }: Path, loc: NodeID): Path => ({
    root,
    children: children.filter((f) => f != loc),
});

export const addInPath = ({ root, children }: Path, loc: NodeID, parent: NodeID): Path => ({
    root,
    children: addInChildren(children, loc, parent),
});

export const addInChildren = (children: NodeID[], loc: NodeID, parent: NodeID): NodeID[] => {
    if (!children.includes(loc)) return children;
    children = children.slice();
    const at = children.indexOf(loc);
    children.splice(at, 0, parent);
    return children;
};

export const addUpdate = (s: NodeSelection | SelUpdate[] | undefined, ...updates: SelUpdate[]) =>
    s == null ? updates : Array.isArray(s) ? [...s, ...updates] : [move(s), ...updates];

export const unwrap = (path: Path, top: Top) => {
    // , sel: NodeSelection
    const node = top.nodes[lastChild(path)];
    if (node.type === 'table') {
        // TODO
        console.warn('cant unwrap table just yet');
    }
    if (node.type !== 'list') return; // TODO idk
    const repl = replaceAt(parentPath(path).children, top, lastChild(path), ...node.children);
    const stop = { ...top, nodes: updateNodes(top.nodes, repl.nodes) };
    const sel = selectStart(pathWithChildren(parentPath(path), node.children[0]), stop);
    if (!sel) return;
    repl.selection = [move({ start: sel })];
    rebalanceSmooshed(repl, top);
    joinSmooshed(repl, top);
    disolveSmooshed(repl, top);
    return repl;
};

export const leftJoin = (state: TestState, cursor: Cursor): KeyAction[] | void => {
    const got = joinParent(state.sel.start.path, state.top);
    if (!got) {
        const pnode = state.top.nodes[parentLoc(state.sel.start.path)];
        const loc = lastChild(state.sel.start.path);
        if (pnode?.type === 'text') {
            const at = pnode.spans.findIndex((span) => span.type === 'embed' && span.item === loc);
            if (at === -1) return;
            const node = state.top.nodes[loc];
            if (node.type === 'id') {
                if (cursor.type !== 'id') throw new Error(`invalid cursor for id node`);
                // check empty cursor
                const text = idText(state.top.tmpText, cursor, node);
                if (text.length === 0) {
                    const ppath = parentPath(state.sel.start.path);
                    return [{ type: 'remove-span', path: ppath, index: at }];
                }
            }
        }
        return; // prolly at the toplevel? or in a text or table, gotta handle tat
    }

    const node = state.top.nodes[lastChild(state.sel.start.path)];

    // Here's the table folks
    if (got.type === 'table') {
        const { at, parent, pnode, pat } = got;

        if (node.type === 'id' && node.text === '' && pnode.rows.length === 1 && pnode.rows[0].length === 1) {
            if (pnode.forceMultiline) {
                return [{ type: 'toggle-multiline', loc: pnode.loc }];
            }
            return [{ type: 'remove-self', path: parent }];
        } else if (!pat) {
            return moveA(selStart(parent, { type: 'list', where: 'start' }));
        }

        return [{ type: 'join-table', path: parent, child: { loc: node.loc, cursor: state.sel.start.cursor }, at }];
    }

    if (got.type === 'tag') {
        if (node.type === 'id' && node.text === '' && isTag(got.pnode.kind) && got.pnode.kind.node === node.loc) {
            if (got.pnode.children.length === 0 || (got.pnode.children.length === 1 && isBlank(state.top.nodes[got.pnode.children[0]]))) {
                return [{ type: 'remove-self', path: got.parent }];
            }
        }
        return moveA(selStart(got.parent, { type: 'list', where: 'start' }));
    }

    // There's the listies

    const { at, parent, pnode } = got;
    if (at === 0) {
        if (pnode.kind === 'smooshed' || pnode.kind === 'spaced') {
            const sel = goLeft(parent, state.top);
            return moveA(sel);
        }
        if (node.type === 'id' && node.text === '' && pnode.children.length === 1) {
            if (pnode.forceMultiline) {
                return [{ type: 'toggle-multiline', loc: pnode.loc }];
            }
            if (isTag(pnode.kind)) {
                return [{ type: 'remove-self', path: pathWithChildren(parent, pnode.children[0]) }];
            }
            return [{ type: 'remove-self', path: parent }];
        }
        // Select the '(' opener
        return moveA(selStart(parent, { type: 'list', where: 'start' }));
    }

    let flat = flatten(pnode, state.top, {});
    let fat = flat.indexOf(node);
    if (fat === -1) throw new Error(`node not in flattened`);
    if (fat === 0) throw new Error(`node first in flat, should have been handled`);
    for (; fat > 0 && flat[fat - 1].type === 'smoosh'; fat--);
    const prev = flat[fat - 1];
    if (prev.type === 'space' || prev.type === 'sep') {
        return [{ type: 'join-list', path: parent, child: { loc: node.loc, cursor } }];
    } else {
        // Delete from the prev node actually
        const start = selectEnd(pathWithChildren(parentPath(state.sel.start.path), prev.loc), state.top);
        if (!start) return;
        const res = handleDelete({ top: state.top, sel: { start } });
        return res;
    }
};

export const handleDelete = (state: TestState): KeyAction[] | void => {
    if (state.sel.end && state.sel.end.key !== state.sel.start.key) {
        return [{ type: 'multi-delete', start: state.sel.start, end: state.sel.end }];
    }

    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'list': {
            if (current.cursor.type === 'list') {
                if (current.cursor.where === 'after') {
                    // return { nodes: {}, selection: { start: selStart(current.path, { type: 'list', where: 'end' }) } };
                    if (current.node.type === 'list') {
                        if (current.node.children.length === 0) {
                            return moveA(selStart(current.path, { type: 'list', where: 'inside' }));
                        }
                        return moveA(selectEnd(pathWithChildren(current.path, current.node.children[current.node.children.length - 1]), state.top));
                    }
                    if (current.node.type === 'table') {
                        if (current.node.rows.length === 0) {
                            return moveA(selStart(current.path, { type: 'list', where: 'inside' }));
                        }
                        const rows = current.node.rows;
                        const last = rows[rows.length - 1];
                        const cell = last[last.length - 1];
                        return moveA(selectEnd(pathWithChildren(current.path, cell), state.top));
                    }
                } else if (current.cursor.where === 'before') {
                    // left join agains
                    return leftJoin(state, current.cursor);
                } else if (current.cursor.where === 'inside') {
                    if (current.node.type === 'list' && isTag(current.node.kind)) {
                        return moveA(selectEnd(pathWithChildren(current.path, current.node.kind.attributes ?? current.node.kind.node), state.top));
                    }
                    if (current.node.type === 'list' && current.node.children.length === 0) {
                        return [{ type: 'remove-self', path: current.path }];
                    }
                    if (current.node.type === 'table' && current.node.rows.length === 0) {
                        return [{ type: 'remove-self', path: current.path }];
                    }
                    return moveA(selStart(current.path, { type: 'list', where: 'start' }));
                } else if (current.cursor.where === 'start' && current.node.type === 'list' && current.node.children.length === 0) {
                    return [{ type: 'remove-self', path: current.path }];
                } else if (current.cursor.where === 'start') {
                    return [{ type: 'unwrap', path: current.path }];
                }
            }
            return;
        }
        case 'id': {
            let { left, right } = cursorSides(current.cursor, current.start);
            if (left === 0 && right === 0) {
                // doin a left join
                return leftJoin(state, current.cursor);
            } else {
                if (left === right) {
                    left--;
                }
                const text = idText(state.top.tmpText, current.cursor, current.node).slice();
                text.splice(left, right - left);
                return [{ type: 'set-id-text', path: state.sel.start.path, text: text.join(''), end: left }];
            }
        }
        case 'text': {
            if (current.cursor.type === 'list') {
                if (current.cursor.where === 'after') {
                    if (current.node.spans.length === 0) {
                        return moveA(selStart(current.path, { type: 'list', where: 'inside' }));
                    }
                    const last = current.node.spans[current.node.spans.length - 1];
                    return moveA(spanEnd(last, current.path, current.node.spans.length - 1, state.top, false));
                } else if (current.cursor.where === 'before') {
                    // left join agains
                    return leftJoin(state, current.cursor);
                } else if (current.cursor.where === 'inside') {
                    return [{ type: 'remove-self', path: current.path }];
                }
                return;
            }

            // TODO: gotta do a left/right story here pls

            if (current.cursor.type !== 'text') return;
            // const grems = state.top.tmpText[`${current.node.loc}:${current.cursor.end.index}`];
            return handleTextDelete(state, current, current.cursor.end, current.cursor.end);
        }

        default:
            throw new Error('nop');
    }
};

export const spanLength = (span: TextSpan<unknown>, text: undefined | { index: number; grems: string[] }, index: number) =>
    index === text?.index ? text.grems.length : span.type === 'text' ? splitGraphemes(span.text).length : 1;

export const simpleSide = (node: Node, side: 'start' | 'end'): Cursor => {
    if (node.type === 'id') {
        return { type: 'id', end: side === 'start' ? 0 : splitGraphemes(node.text).length };
    }
    return { type: 'list', where: side === 'start' ? 'before' : 'after' };
};

export const normalizeTextCursorSide = (
    spans: TextSpan<NodeID, any>[],
    side: { index: TextIndex; cursor: number },
    text?: { index: TextIndex; grems: string[] },
): 'before' | 'after' | { index: TextIndex; cursor: number } => {
    side = { ...side };
    let sideindex = getSpanIndex(spans, side.index);
    while (true) {
        if (sideindex >= spans.length) return 'after';
        if (sideindex < 0) return 'before';

        const len = spanLength(spans[sideindex], undefined, sideindex);
        if (side.cursor > len) {
            side.cursor -= len;
            sideindex += 1;
            continue;
        }
        if (side.cursor < 0) {
            if (sideindex === 0) return 'before';
            const pix = sideindex - 1;
            const len = spanLength(spans[pix], undefined, pix);
            side.cursor += len;
            sideindex -= 1;
            continue;
        }

        break;
    }
    // return side;
    return { index: sideindex, cursor: side.cursor };
};

export const handleTextDelete = (state: TestState, current: { node: Text<NodeID>; path: Path }, left: Spat, right: Spat): KeyAction[] | void => {
    const spans = current.node.spans.slice();

    if (left.index === right.index && left.cursor === right.cursor) {
        left = { ...left, cursor: left.cursor - 1 };

        if (spans.length === 1 && spanLength(spans[0], undefined, 0) === 0) {
            return [{ type: 'remove-self', path: current.path }];
        }

        const loff = normalizeTextCursorSide(spans, left, undefined);
        if (loff === 'before') {
            const parent = state.top.nodes[parentLoc(current.path)];
            if (parent?.type === 'list' && isRich(parent.kind)) {
                // joinn
                const at = parent.children.indexOf(current.node.loc);
                if (at === 0) {
                    return moveA(selStart(parentPath(current.path), { type: 'list', where: 'before' }));
                }
                const ploc = parent.children[at - 1];
                const pnode = state.top.nodes[ploc];
                if (pnode.type === 'text') {
                    return [{ type: 'join-text', path: current.path }];
                }
            }

            return moveA(selStart(current.path, { type: 'list', where: 'before' }));
        }
        if (loff === 'after') throw new Error(`cant be after`);
        left = loff;
    }

    return [{ type: 'text-delete', path: current.path, left, right }];
};
