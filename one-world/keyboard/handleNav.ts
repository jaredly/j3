import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { isRich, Node } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { TestState } from './test-utils';
import { Current, Cursor, getCurrent, lastChild, NodeSelection, parentLoc, parentPath, Path, pathWithChildren, selStart, Top, Update } from './utils';

export const justSel = (path: Path, cursor: Cursor) => ({ nodes: {}, selection: { start: selStart(path, cursor) } });

export const selectStart = (path: Path, top: Top, plus1 = false): NodeSelection['start'] | void => {
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
            return selectStart(pathWithChildren(path, node.children[0]), top, plus1);
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

export const selectEnd = (path: Path, top: Top, plus1: boolean = false): NodeSelection['start'] | void => {
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
        if (plus1) {
            if (node.children.length === 0) {
                return selStart(path, { type: 'list', where: 'inside' });
            }
            return selectEnd(pathWithChildren(path, node.children[node.children.length - 1]), top);
        }
        return selStart(path, { type: 'list', where: 'after' });
    }
    if (node.type === 'table') {
        return selStart(path, { type: 'list', where: 'after' });
    }
    // TODO... if we are inside of a rich text ... then this text is different.
    // SHOULD that just be a flag on the /text/? hm. idk it might be worth denormalizing?
    const ploc = parentLoc(path);
    if (ploc != null && richNode(top.nodes[ploc])) {
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
    if (plus1) {
        if (node.spans.length === 0) {
            return selStart(path, { type: 'list', where: 'inside' });
        }
        const index = node.spans.length - 1;
        const last = node.spans[index];
        switch (last.type) {
            case 'text':
                return selStart(path, { type: 'text', end: { index, cursor: splitGraphemes(last.text).length } });
            case 'embed':
                return selectEnd(pathWithChildren(path, last.item), top);
            default:
                return selStart(path, { type: 'control', index });
        }
    }
    return selStart(path, { type: 'list', where: 'after' });
};

const richNode = (node: Node | undefined) => {
    return node?.type === 'list' && isRich(node.kind);
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
        case 'text': {
            if (current.cursor.type === 'text') {
                if (current.cursor.start) {
                    // TODO
                    return;
                }
                const span = current.node.spans[current.cursor.end.index];
                if (span.type !== 'text') throw new Error(`curent span is not text`);
                const text = current.cursor.end.text ?? splitGraphemes(span.text);
                if (current.cursor.end.cursor < text.length) {
                    return justSel(current.path, {
                        type: 'text',
                        end: {
                            index: current.cursor.end.index,
                            cursor: current.cursor.end.cursor + 1,
                            text: current.cursor.end.text,
                        },
                    });
                }
                if (current.cursor.end.index >= current.node.spans.length - 1) {
                    const parent = state.top.nodes[parentLoc(current.path)];
                    // Rich Text, we jump to the next item thankx
                    if (parent?.type === 'list' && isRich(parent.kind)) {
                        return selUpdate(goRight(current.path, state.top));
                    }
                    return justSel(current.path, { type: 'list', where: 'after' });
                }
                const next = current.node.spans[current.cursor.end.index + 1];
                switch (next.type) {
                    case 'text':
                        return justSel(current.path, {
                            type: 'text',
                            end: {
                                index: current.cursor.end.index + 1,
                                cursor: 1,
                            },
                        });
                    case 'embed':
                        return selUpdate(selectStart(pathWithChildren(current.path, next.item), state.top, true));
                }
            }
            if (current.cursor.type === 'list') {
                switch (current.cursor.where) {
                    case 'after':
                    case 'end':
                        return selUpdate(goRight(current.path, state.top));
                    case 'before':
                    case 'start':
                        if (current.node.spans.length > 0) {
                            const span = current.node.spans[0];
                            switch (span.type) {
                                case 'text':
                                    return justSel(current.path, { type: 'text', end: { index: 0, cursor: 0 } });
                                case 'embed':
                                    return selUpdate(selectStart(pathWithChildren(current.path, span.item), state.top));
                                default:
                                    return justSel(current.path, { type: 'control', index: 0 });
                            }
                        } else {
                            return justSel(current.path, { type: 'list', where: 'inside' });
                        }
                    case 'inside':
                        return justSel(current.path, { type: 'list', where: 'after' });
                }
            }
            return;
        }
        case 'list': {
            if (current.cursor.type === 'list') {
                switch (current.cursor.where) {
                    case 'after':
                        return selUpdate(goRight(current.path, state.top));
                    case 'before':
                    case 'start':
                        if (current.node.type === 'list') {
                            if (current.node.children.length > 0) {
                                const start = selectStart(pathWithChildren(current.path, current.node.children[0]), state.top);
                                return start ? { nodes: {}, selection: { start } } : undefined;
                            } else {
                                return justSel(current.path, { type: 'list', where: 'inside' });
                            }
                        }
                    case 'inside':
                    case 'end':
                        return justSel(current.path, { type: 'list', where: 'after' });
                }
            }
        }
    }
};

const selUpdate = (sel?: void | NodeSelection['start']): Update | void => (sel ? { nodes: {}, selection: { start: sel } } : undefined);

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
        case 'text': {
            if (current.cursor.type === 'text') {
                if (current.cursor.start) {
                    // TODO
                    return;
                }
                const { end } = current.cursor;
                if (end.cursor > 0) {
                    return justSel(current.path, {
                        type: 'text',
                        end: {
                            index: end.index,
                            cursor: end.cursor - 1,
                            text: end.text,
                        },
                    });
                }
                if (end.index > 0) {
                    const prev = current.node.spans[end.index - 1];
                    switch (prev.type) {
                        case 'text':
                            return justSel(current.path, {
                                type: 'text',
                                end: {
                                    index: end.index - 1,
                                    cursor: splitGraphemes(prev.text).length,
                                },
                            });
                        case 'embed':
                            return selUpdate(selectEnd(pathWithChildren(current.path, prev.item), state.top));
                        default:
                            return justSel(current.path, { type: 'control', index: end.index - 1 });
                    }
                }
                if (richNode(state.top.nodes[parentLoc(current.path)])) {
                    return selUpdate(goLeft(current.path, state.top));
                }
                return justSel(current.path, { type: 'list', where: 'before' });
            }
        }
        case 'list': {
            if (current.cursor.type === 'list') {
                switch (current.cursor.where) {
                    case 'before':
                        return selUpdate(goLeft(current.path, state.top));
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
