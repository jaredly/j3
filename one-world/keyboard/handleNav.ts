import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { isRich, Node, Text, TextSpan } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { textCursorSides, textCursorSides2 } from './insertId';
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
        if (plus1) {
            if (node.children.length) {
                return selectStart(pathWithChildren(path, node.children[0]), top);
            }
            return selStart(path, { type: 'list', where: 'inside' });
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
        // Rich Text, we select the start of the first item in the text
        if (parent.type === 'list' && isRich(parent.kind)) {
            if (node.spans.length === 0) {
                return selStart(path, { type: 'list', where: 'inside' });
            }
            return spanStart(node.spans[0], 0, path, top, plus1);
        }
    }
    if (plus1) {
        if (node.spans.length === 0) {
            return selStart(path, { type: 'list', where: 'inside' });
        }
        return spanStart(node.spans[0], 0, path, top, false);
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
        const idx = node.spans.length - 1;
        return spanEnd(node.spans[idx], path, idx, top, plus1);
    }
    if (plus1) {
        if (node.spans.length === 0) {
            return selStart(path, { type: 'list', where: 'inside' });
        }
        const index = node.spans.length - 1;
        return spanEnd(node.spans[index], path, index, top, false);
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
    if (pnode.type === 'text') {
        const index = pnode.spans.findIndex((n) => n.type === 'embed' && n.item === loc);
        if (index === -1) throw new Error('not actually in the text idk ' + loc);
        return selStart(parentPath(path), { type: 'text', end: { index, cursor: 0 } });
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
    if (pnode.type === 'text') {
        const index = pnode.spans.findIndex((n) => n.type === 'embed' && n.item === loc);
        if (index === -1) throw new Error('not actually in the text idk ' + loc);
        return selStart(parentPath(path), { type: 'text', end: { index, cursor: 1 } });
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

export const sideEqual = (one: { cursor: number; index: number }, two: { cursor: number; index: number }) =>
    one.cursor === two.cursor && one.index === two.index;

export const navRight = (current: Current, state: TestState): Update | void => {
    switch (current.type) {
        case 'id': {
            if (current.cursor.start != null && current.cursor.start !== current.cursor.end) {
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
                if (current.cursor.start && !sideEqual(current.cursor.start, current.cursor.end)) {
                    const { right } = textCursorSides2(current.cursor);
                    return justSel(current.path, { type: 'text', end: right });
                }
                const { end } = current.cursor;
                const span = current.node.spans[end.index];
                if (span.type !== 'text') {
                    if (end.cursor === 0) {
                        return selUpdate(spanStart(span, end.index, current.path, state.top, true));
                    }
                    if (end.index < current.node.spans.length - 1) {
                        return selUpdate(spanStart(current.node.spans[end.index + 1], end.index + 1, current.path, state.top, true));
                    }
                    return justSel(current.path, { type: 'list', where: 'after' });
                }
                const text = end.text ?? splitGraphemes(span.text);
                if (end.cursor < text.length) {
                    return justSel(current.path, {
                        type: 'text',
                        end: {
                            index: end.index,
                            cursor: end.cursor + 1,
                            text: end.text,
                        },
                    });
                }
                if (end.index >= current.node.spans.length - 1) {
                    const parent = state.top.nodes[parentLoc(current.path)];
                    // Rich Text, we jump to the next item thankx
                    if (parent?.type === 'list' && isRich(parent.kind)) {
                        return selUpdate(goRight(current.path, state.top));
                    }
                    return justSel(current.path, { type: 'list', where: 'after' });
                }
                const idx = end.index + 1;
                return selUpdate(spanStart(current.node.spans[idx], idx, current.path, state.top, true));
            }
            if (current.cursor.type === 'list') {
                switch (current.cursor.where) {
                    case 'after':
                    case 'end':
                        return selUpdate(goRight(current.path, state.top));
                    case 'before':
                    case 'start':
                        if (current.node.spans.length > 0) {
                            return selUpdate(spanStart(current.node.spans[0], 0, current.path, state.top, false));
                        } else {
                            return justSel(current.path, { type: 'list', where: 'inside' });
                        }
                    case 'inside':
                        // TODO isRich
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

export const selUpdate = (sel?: void | NodeSelection['start']): Update | void => (sel ? { nodes: {}, selection: { start: sel } } : undefined);

export const navLeft = (current: Current, state: TestState): Update | void => {
    switch (current.type) {
        case 'id': {
            if (current.cursor.start != null && current.cursor.start !== current.cursor.end) {
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
                if (current.cursor.start && !sideEqual(current.cursor.start, current.cursor.end)) {
                    const { left } = textCursorSides2(current.cursor);
                    return justSel(current.path, { type: 'text', end: left });
                }
                const { end } = current.cursor;
                if (end.cursor > 0) {
                    const span = current.node.spans[end.index];
                    if (span.type !== 'text') {
                        return selUpdate(spanEnd(current.node.spans[end.index], current.path, end.index, state.top, true));
                    }

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
                    const idx = end.index - 1;
                    return selUpdate(spanEnd(current.node.spans[idx], current.path, idx, state.top, true));
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
                        } else if (current.node.type === 'text') {
                            if (current.node.spans.length === 0) {
                                return justSel(current.path, { type: 'list', where: 'inside' });
                            } else {
                                return selUpdate(
                                    spanEnd(
                                        current.node.spans[current.node.spans.length - 1],
                                        current.path,
                                        current.node.spans.length - 1,
                                        state.top,
                                        false,
                                    ),
                                );
                            }
                        }
                    case 'inside':
                        return justSel(current.path, { type: 'list', where: 'before' });
                }
            }
        }
    }
};

export function spanEnd(last: TextSpan<number>, path: Path, index: number, top: Top, plus1: boolean) {
    switch (last.type) {
        case 'text':
            return selStart(path, { type: 'text', end: { index, cursor: splitGraphemes(last.text).length - (plus1 ? 1 : 0) } });
        case 'embed':
            if (plus1) {
                return selectEnd(pathWithChildren(path, last.item), top);
            }
            return selStart(path, { type: 'text', end: { index, cursor: 1 } });
        default:
            return selStart(path, { type: 'control', index });
    }
}

export const spanStart = (span: TextSpan<number>, index: number, path: Path, top: Top, plus1: boolean) => {
    if (span.type === 'text') {
        return selStart(path, { type: 'text', end: { index, cursor: plus1 ? 1 : 0 } });
    }
    if (span.type === 'embed') {
        if (plus1) {
            return selectStart(pathWithChildren(path, span.item), top);
        }
        return selStart(path, { type: 'text', end: { index, cursor: 0 } });
    }
    return selStart(path, { type: 'control', index });
};
