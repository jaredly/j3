import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { isRich } from '../shared/cnodes';
import { cursorSides } from './cursorSplit';
import { TestState } from './test-utils';
import { Current, Cursor, getCurrent, lastChild, NodeSelection, parentLoc, parentPath, Path, pathWithChildren, selStart, Top, Update } from './utils';

const justSel = (path: Path, cursor: Cursor) => ({ nodes: {}, selection: { start: selStart(path, cursor) } });

const selectStart = (path: Path, top: Top, plus1 = false): NodeSelection['start'] | void => {
    const loc = lastChild(path);
    const node = top.nodes[loc];
    if (node.type === 'id') {
        if (plus1 && node.text === '') {
            return goRight(path, top);
        }

        return selStart(path, { type: 'id', end: plus1 ? 1 : 0 });
    }
    if (node.type === 'list') {
        if (node.kind === 'spaced' || node.kind === 'smooshed') {
            if (!node.children.length) throw new Error('empty spaced/smooshed');
            return selectStart(pathWithChildren(path, node.children[0]), top);
        }
        return selStart(path, { type: 'list', where: 'before' });
    }
    if (node.type === 'table') {
        return selStart(path, { type: 'list', where: 'before' });
    }
    // TODO... if we are inside of a rich text ... then this text is different.
    // SHOULD that just be a flag on the /text/? hm. idk it might be worth denormalizing?
    const ploc = parentLoc(path);
    if (ploc != null) {
        const parent = top.nodes[ploc];
        // Rich Text, we select the end of the last item in the text
        if (parent.type === 'list' && isRich(parent.kind)) {
            if (node.spans.length === 0) {
                return selStart(path, { type: 'list', where: 'inside' });
            }
            const last = node.spans[0];
            if (last.type === 'text') {
                return selStart(path, { type: 'text', end: { index: 0, cursor: 0 } });
            }
            if (last.type === 'embed') {
                return selectStart(pathWithChildren(path, last.item), top);
            }
            return selStart(path, { type: 'control', index: 0 });
        }
    }
    return selStart(path, { type: 'list', where: 'before' });
};

const selectEnd = (path: Path, top: Top, plus1: boolean = false): NodeSelection['start'] | void => {
    const loc = lastChild(path);
    const node = top.nodes[loc];
    if (node.type === 'id') {
        const end = splitGraphemes(node.text).length;
        if (end === 0 && plus1) {
            return goLeft(path, top);
        }
        return selStart(path, { type: 'id', end: end - (plus1 ? 1 : 0) });
    }
    if (node.type === 'list') {
        if (node.kind === 'spaced' || node.kind === 'smooshed') {
            if (!node.children.length) throw new Error('empty spaced/smooshed');
            return selectEnd(pathWithChildren(path, node.children[node.children.length - 1]), top, plus1);
        }
        return selStart(path, { type: 'list', where: 'after' });
    }
    if (node.type === 'table') {
        return selStart(path, { type: 'list', where: 'after' });
    }
    // TODO... if we are inside of a rich text ... then this text is different.
    // SHOULD that just be a flag on the /text/? hm. idk it might be worth denormalizing?
    const ploc = parentLoc(path);
    if (ploc != null) {
        const parent = top.nodes[ploc];
        // Rich Text, we select the end of the last item in the text
        if (parent.type === 'list' && isRich(parent.kind)) {
            if (node.spans.length === 0) {
                return selStart(path, { type: 'list', where: 'inside' });
            }
            const last = node.spans[node.spans.length - 1];
            if (last.type === 'text') {
                return selStart(path, { type: 'text', end: { index: node.spans.length - 1, cursor: splitGraphemes(last.text).length } });
            }
            if (last.type === 'embed') {
                return selectEnd(pathWithChildren(path, last.item), top, plus1);
            }
            return selStart(path, { type: 'control', index: node.spans.length - 1 });
        }
    }
    return selStart(path, { type: 'list', where: 'after' });
};

export const goLeft = (path: Path, top: Top): NodeSelection['start'] | void => {
    const loc = lastChild(path);
    const ploc = parentLoc(path);
    const pnode = top.nodes[ploc];
    if (!pnode) return;
    if (pnode.type === 'list') {
        const at = pnode.children.indexOf(loc);
        if (at === -1) return;
        if (at === 0) {
            if (pnode.kind === 'smooshed' || pnode.kind === 'spaced') {
                return goLeft(parentPath(path), top);
            }
            return selStart(parentPath(path), { type: 'list', where: 'before' });
        }
        return selectEnd(pathWithChildren(parentPath(path), pnode.children[at - 1]), top, pnode.kind === 'smooshed');
    }
};

export const goRight = (path: Path, top: Top): NodeSelection['start'] | void => {
    const loc = lastChild(path);
    const ploc = parentLoc(path);
    const pnode = top.nodes[ploc];
    if (!pnode) return;
    if (pnode.type === 'list') {
        const at = pnode.children.indexOf(loc);
        if (at === -1) return;
        if (at === pnode.children.length - 1) {
            if (pnode.kind === 'smooshed' || pnode.kind === 'spaced') {
                return goRight(parentPath(path), top);
            }
            return selStart(parentPath(path), { type: 'list', where: 'after' });
        }
        return selectStart(pathWithChildren(parentPath(path), pnode.children[at + 1]), top, pnode.kind === 'smooshed');
    }
};

export const handleNav = (key: string, state: TestState): Update | void => {
    if (key === 'ArrowLeft') {
        const current = getCurrent(state.sel, state.top);
        return navLeft(current, state);
    }
    if (key === 'ArrowRight') {
        const current = getCurrent(state.sel, state.top);
        return navRight(current, state);
    }
};

export const navRight = (current: Current, state: TestState): Update | void => {
    switch (current.type) {
        case 'id': {
            if (current.cursor.start) {
                const { right } = cursorSides(current.cursor);
                return justSel(current.path, { type: 'id', end: right, text: current.cursor.text });
            }
            const text = current.cursor.text ?? splitGraphemes(current.node.text);
            if (current.cursor.end < text.length) {
                return justSel(current.path, { type: 'id', end: current.cursor.end + 1, text: current.cursor.text });
            }
            const sel = goRight(current.path, state.top);
            if (sel) {
                return { nodes: {}, selection: { start: sel } };
            }
            break;
        }
        case 'list': {
            if (current.cursor.type === 'list') {
                switch (current.cursor.where) {
                    case 'after':
                    case 'end':
                        return justSel(current.path, { type: 'list', where: 'before' });
                    case 'before':
                    case 'start':
                        if (current.node.type === 'list') {
                            if (current.node.children.length > 0) {
                                const start = selectEnd(
                                    pathWithChildren(current.path, current.node.children[current.node.children.length - 1]),
                                    state.top,
                                );
                                return start ? { nodes: {}, selection: { start } } : undefined;
                            } else {
                                return justSel(current.path, { type: 'list', where: 'inside' });
                            }
                        }
                    case 'inside':
                        return justSel(current.path, { type: 'list', where: 'after' });
                }
            }
        }
    }
};

export const navLeft = (current: Current, state: TestState): Update | void => {
    switch (current.type) {
        case 'id': {
            if (current.cursor.start) {
                const { left } = cursorSides(current.cursor);
                return justSel(current.path, { type: 'id', end: left, text: current.cursor.text });
            }
            if (current.cursor.end > 0) {
                return justSel(current.path, { type: 'id', end: current.cursor.end - 1, text: current.cursor.text });
            }
            const sel = goLeft(current.path, state.top);
            if (sel) {
                return { nodes: {}, selection: { start: sel } };
            }
            break;
        }
        case 'list': {
            if (current.cursor.type === 'list') {
                switch (current.cursor.where) {
                    case 'start':
                        return justSel(current.path, { type: 'list', where: 'before' });
                    case 'after':
                    case 'end':
                        if (current.node.type === 'list') {
                            if (current.node.children.length > 0) {
                                const start = selectEnd(
                                    pathWithChildren(current.path, current.node.children[current.node.children.length - 1]),
                                    state.top,
                                );
                                return start ? { nodes: {}, selection: { start } } : undefined;
                            } else {
                                return justSel(current.path, { type: 'list', where: 'inside' });
                            }
                        }
                    case 'inside':
                        return justSel(current.path, { type: 'list', where: 'before' });
                }
            }
        }
    }
};
