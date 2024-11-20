import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, List, Node, Nodes, TextSpan } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { goLeft, justSel, selectEnd } from './handleNav';
import { textCursorSides } from './insertId';
import { replaceAt } from './replaceAt';
import { flatten, flatToUpdateNew } from './rough';
import { TestState } from './test-utils';
import { Cursor, getCurrent, lastChild, parentLoc, parentPath, Path, pathWithChildren, selStart, Top, Update } from './utils';

export const joinParent = (path: Path, top: Top): void | { at: number; pnode: List<number>; parent: Path } => {
    const loc = lastChild(path);
    const parent = parentPath(path);
    const pnode = top.nodes[lastChild(parent)];
    if (!pnode || pnode.type !== 'list') return;
    const at = pnode.children.indexOf(loc);
    if (at > 0 || (pnode.kind !== 'spaced' && pnode.kind !== 'smooshed')) return { pnode, parent, at };
    const up = joinParent(parent, top);
    return up ?? { pnode, parent, at };
};

const removeSelf = (state: TestState, current: { path: Path; node: Node }) => {
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
    let nextLoc = state.top.nextLoc;
    const loc = nextLoc++;
    const up = replaceAt(parentPath(current.path).children, state.top, current.node.loc, loc);
    up.nextLoc = nextLoc;
    up.nodes[loc] = { type: 'id', loc, text: '' };
    up.selection = {
        start: selStart(pathWithChildren(parentPath(current.path), loc), { type: 'id', end: 0 }),
    };
    return up;
};

const leftJoin = (state: TestState, cursor: Cursor) => {
    const got = joinParent(state.sel.start.path, state.top);
    if (!got) return; // prolly at the toplevel? or in a text or table, gotta handle tat
    const { at, parent, pnode } = got;
    let node = state.top.nodes[lastChild(state.sel.start.path)];
    const remap: Nodes = {};
    // "maybe commit text changes"
    if (node.type === 'id' && cursor.type === 'id' && cursor.text) {
        node = remap[node.loc] = { ...node, text: cursor.text.join(''), ccls: cursor.text.length === 0 ? undefined : node.ccls };
    }
    if (at === 0) {
        if (pnode.kind === 'smooshed' || pnode.kind === 'spaced') {
            const sel = goLeft(parent, state.top);
            return sel ? { nodes: {}, selection: { start: sel } } : undefined;
        }
        if (node.type === 'id' && node.text === '' && pnode.children.length === 1) {
            return removeSelf(state, { path: parent, node: pnode });
            // // HERG got to check grandparent smoosh here folks
            // const up = replaceAt(parentPath(parent).children, state.top, pnode.loc, node.loc);
            // up.selection = { start: selStart(pathWithChildren(parentPath(parent), node.loc), cursor) };
            // return up;
        }
        // Select the '(' opener
        return { nodes: {}, selection: { start: selStart(parent, { type: 'list', where: 'start' }) } };
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
            if (current.node.type === 'list') {
                if (current.cursor.type === 'list') {
                    if (current.cursor.where === 'after') {
                        return { nodes: {}, selection: { start: selStart(current.path, { type: 'list', where: 'end' }) } };
                    } else if (current.cursor.where === 'before') {
                        // left join agains
                        return leftJoin(state, current.cursor);
                    } else if (current.cursor.where === 'inside') {
                        return removeSelf(state, current);
                    }
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
                    return justSel(current.path, { type: 'list', where: 'end' });
                } else if (current.cursor.where === 'before') {
                    // left join agains
                    return leftJoin(state, current.cursor);
                } else if (current.cursor.where === 'inside') {
                    return removeSelf(state, current);
                }
                return;
            }
            let { left, right } = textCursorSides(current.cursor);

            if (left === right && left > 0) left--;
            const { index } = current.cursor.end;
            const span = current.node.spans[index];
            const spans = current.node.spans.slice();
            if (span.type !== 'text') throw new Error(`span not text ${span.type}`);
            const text = current.cursor.end.text ?? splitGraphemes(span.text);

            if (text.length === 0) {
                if (index === 0) {
                    if (current.node.spans.length === 1) {
                        return removeSelf(state, current);
                    }
                }
            }

            if (left === 0 && left === right) {
                if (index === 0) {
                    // TODO richhh
                    // return leftJoin(state, current.cursor)
                    return justSel(current.path, { type: 'list', where: 'start' });
                }
                if (text.length === 0) {
                    spans.splice(index, 1);
                } else {
                    spans[index] = { ...span, text: text.join('') };
                }

                let at = index - 1;
                const empty = (span: TextSpan<unknown>) => span.type === 'text' && span.text === '';

                for (; at >= 0 && empty(spans[at]); at--) {
                    spans.splice(at, 1);
                }

                if (at < 0) {
                    return {
                        nodes: { [current.node.loc]: { ...current.node, spans } },
                        selection: { start: selStart(current.path, { type: 'list', where: 'start' }) },
                    };
                }

                let prev = spans[at];
                if (prev.type !== 'text') {
                    return justSel(state.sel.start.path, { type: 'control', index: at });
                }
                const ptext = splitGraphemes(prev.text);
                spans[at] = { ...prev, text: ptext.slice(0, -1).join('') };
                return {
                    nodes: { [current.node.loc]: { ...current.node, spans } },
                    selection: { start: selStart(current.path, { type: 'text', end: { index: at, cursor: ptext.length - 1 } }) },
                };
            }

            text.splice(left, right - left);
            return { nodes: {}, selection: { start: selStart(state.sel.start.path, { type: 'text', end: { index, text, cursor: left } }) } };
        }

        default:
            throw new Error('nop');
    }
};

const simpleSide = (node: Node, side: 'start' | 'end'): Cursor => {
    if (node.type === 'id') {
        return { type: 'id', end: side === 'start' ? 0 : splitGraphemes(node.text).length };
    }
    return { type: 'list', where: side === 'start' ? 'before' : 'after' };
};
