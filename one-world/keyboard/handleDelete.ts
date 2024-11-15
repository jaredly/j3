import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, List } from '../shared/cnodes';
import { cursorSides } from './cursorSplit';
import { flatten, flatToUpdate } from './flatenate';
import { TestState } from './test-utils';
import { Path, Top, Update, getCurrent, lastChild, parentPath, pathWithChildren, selStart } from './utils';

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

export const handleDelete = (state: TestState): Update | void => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'id': {
            let { left, right } = cursorSides(current.cursor);
            if (left === 0 && right === 0) {
                // doin a left join
                const got = joinParent(state.sel.start.path, state.top);
                if (!got) return; // prolly at the toplevel? or in a text or table, gotta handle tat
                const { at, parent, pnode } = got;
                if (at === 0) {
                    // Select the '(' opener
                    return { nodes: {}, selection: { start: selStart(parent, { type: 'list', where: 'start' }) } };
                }
                const flat = flatten(pnode, state.top);
                const node = state.top.nodes[lastChild(state.sel.start.path)] as Id<number>;
                const fat = flat.indexOf(node);
                if (fat === -1) throw new Error(`node not in flattened`);
                if (fat === 0) throw new Error(`node first in flat, should have been handled`);
                const prev = flat[fat - 1];
                if (prev.type === 'space' || prev.type === 'sep') {
                    flat.splice(fat - 1, 1);
                } else if (prev.type === 'id') {
                    // Delete from the prev ID actually
                    const text = splitGraphemes(prev.text).slice(0, -1);
                    if (text.length === 0) {
                        throw new Error(`todo check smoosh collapse`);
                    }
                    return {
                        nodes: {},
                        selection: {
                            start: selStart(pathWithChildren(parentPath(state.sel.start.path), prev.loc), { type: 'id', end: text.length, text }),
                        },
                    };
                } else {
                    // Select the closer??
                    return {
                        nodes: {},
                        selection: {
                            start: selStart(pathWithChildren(parentPath(state.sel.start.path), prev.loc), { type: 'list', where: 'end' }),
                        },
                    };
                }

                return flatToUpdate(
                    flat,
                    state.top,
                    {},
                    { type: 'existing', node: pnode, path: parent },
                    node,
                    { type: 'id', end: 0 },
                    state.sel.start.path,
                );
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
                        node = { ...node, text: '' };
                        return flatToUpdate(
                            parent.children.map((loc) => (loc === node.loc ? node : state.top.nodes[loc])),
                            state.top,
                            {},
                            { type: 'existing', node: parent, path: ppath },
                            node,
                            { type: 'id', end: 0 },
                            state.sel.start.path,
                        );
                    }
                }
                return { nodes: {}, selection: { start: selStart(state.sel.start.path, { type: 'id', end: left, text }) } };
            }
        }

        default:
            throw new Error('nop');
    }
};