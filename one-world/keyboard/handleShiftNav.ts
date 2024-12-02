import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, Text } from '../shared/cnodes';
import { spanLength } from './handleDelete';
import { goLeft, goRight, justSel, selectEnd, selectStart, selUpdate } from './handleNav';
import { handleSpecialText } from './handleSpecialText';
import { TestState } from './test-utils';
import { Cursor, getCurrent, IdCursor, lastChild, ListCursor, parentLoc, parentPath, Path, pathWithChildren, TextCursor, Top, Update } from './utils';

export const handleShiftNav = (state: TestState, key: string): Update | void => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'id':
            return handleShiftId(current, state.top, key === 'ArrowLeft');
        case 'text':
            return handleShiftText(current, state.top, key === 'ArrowLeft');
    }
};

export const expandShiftRight = (): Update | void => {};

export const expandShiftLeft = (path: Path, cursor: Cursor, top: Top): Update | void => {};

// export const next

export const handleTab = (state: TestState, shift?: boolean): Update | void => {
    const { path, cursor } = state.sel.start;
    const node = state.top.nodes[lastChild(path)];
    if (node.type === 'list' && cursor.type === 'list') {
        if (shift && cursor.where === 'after') {
            if (node.children.length === 0) {
                return justSel(path, { type: 'list', where: 'inside' });
            }
            return selUpdate(selectEnd(pathWithChildren(path, node.children[node.children.length - 1]), state.top));
        } else if (!shift && cursor.where === 'before') {
            if (node.children.length === 0) {
                return justSel(path, { type: 'list', where: 'inside' });
            }
            return selUpdate(selectStart(pathWithChildren(path, node.children[0]), state.top));
        }
    }
    return selUpdate(shift ? goLeft(state.sel.start.path, state.top, true) : goRight(state.sel.start.path, state.top, true));
};

// TabLeft

export const handleShiftId = ({ node, path, cursor }: { node: Id<number>; path: Path; cursor: IdCursor }, top: Top, left: boolean): Update | void => {
    if (left && cursor.end === 0) {
        if (cursor.start == null || cursor.start === cursor.end) {
            const parent = top.nodes[parentLoc(path)];
            if (parent.type === 'list' && parent.kind === 'smooshed') {
                const idx = parent.children.indexOf(node.loc);
                if (idx === -1) throw new Error(`node ${node.loc} not in parent ${parent.children}`);
                if (idx > 0) {
                    const next = parent.children[idx - 1];
                    const sel = selectEnd(pathWithChildren(parentPath(path), next), top);
                    if (!sel) return;
                    return handleShiftNav({ top, sel: { start: sel } }, left ? 'ArrowLeft' : 'ArrowRight');
                }
            }
        }

        return expandShiftLeft(path, cursor, top);
    }

    const text = cursor.text ?? splitGraphemes(node.text);
    if (!left && cursor.end === text.length) {
        if (cursor.start == null || cursor.start === cursor.end) {
            const parent = top.nodes[parentLoc(path)];
            if (parent.type === 'list' && parent.kind === 'smooshed') {
                const idx = parent.children.indexOf(node.loc);
                if (idx === -1) throw new Error(`node ${node.loc} not in parent ${parent.children}`);
                if (idx < parent.children.length - 1) {
                    const next = parent.children[idx + 1];
                    const sel = selectStart(pathWithChildren(parentPath(path), next), top);
                    if (!sel) return;
                    return handleShiftNav({ top, sel: { start: sel } }, left ? 'ArrowLeft' : 'ArrowRight');
                }
            }
        }
        return expandShiftRight();
    }
    // left--
    return justSel(path, { ...cursor, start: cursor.start ?? cursor.end, end: cursor.end + (left ? -1 : 1) });
};

export const handleShiftText = (
    { node, path, cursor }: { node: Text<number>; path: Path; cursor: TextCursor | ListCursor },
    top: Top,
    left: boolean,
) => {
    if (cursor.type === 'list') {
        return; /// TODO
    }
    let end = cursor.end;
    const span = node.spans[end.index];
    if (left) {
        if (end.cursor === 0) {
            if (end.index > 0) {
                let index = end.index - 1;
                for (; index >= 0 && node.spans[index].type !== 'text'; index--);
                if (index < 0) return;
                const pspan = node.spans[index];
                if (pspan.type !== 'text') return;
                end = { index, cursor: splitGraphemes(pspan.text).length };
                if (index === cursor.end.index - 1 && pspan.text !== '') {
                    end.cursor--;
                }
            } else {
                return;
            }
        } else {
            end = { ...end, cursor: end.cursor - 1 };
        }
    } else {
        const len = span.type === 'text' ? cursor.end.text?.length ?? splitGraphemes(span.text).length : 1;
        if (end.cursor === len) {
            if (end.index < node.spans.length) {
                let index = end.index + 1;
                const txt = end.text ? { grems: end.text, index: end.index } : undefined;
                for (; index < node.spans.length && spanLength(node.spans[index], txt, index) === 0; index++);
                if (index >= node.spans.length) return;
                const pspan = node.spans[index];
                // if (pspan.type !== 'text') return;
                end = { index, cursor: 0 };
                if (index === cursor.end.index + 1 && spanLength(node.spans[index], txt, index) > 0) {
                    end.cursor++;
                }
            }
        } else {
            end = { ...end, cursor: end.cursor + 1 };
        }
    }
    return justSel(path, { ...cursor, start: cursor.start ?? cursor.end, end });
};

export type Mods = { meta?: boolean; ctrl?: boolean; alt?: boolean; shift?: boolean };

export const handleSpecial = (state: TestState, key: string, mods: Mods): void | Update => {
    const current = getCurrent(state.sel, state.top);
    if (key === '\n' && mods.meta) {
        let path = state.sel.start.path;
        while (path.children.length) {
            const node = state.top.nodes[lastChild(path)];
            if (node.type === 'list' && node.kind !== 'smooshed' && node.kind !== 'spaced') {
                return { nodes: { [node.loc]: { ...node, forceMultiline: !node.forceMultiline } } };
            }
            path = parentPath(path);
        }
    }
    switch (current.type) {
        // case 'id':
        //     return handle(current, state.top, key === 'ArrowLeft');
        case 'text':
            return handleSpecialText(current, state.top, key, mods);
    }
};
