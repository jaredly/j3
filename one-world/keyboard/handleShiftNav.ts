import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, Text } from '../shared/cnodes';
import { spanLength } from './handleDelete';
import { goLateral, justSel, selectEnd, selectStart, selUpdate } from './handleNav';
import { handleSpecialText } from './handleSpecialText';
import { TestState } from './test-utils';
import {
    getCurrent,
    IdCursor,
    lastChild,
    ListCursor,
    NodeSelection,
    parentLoc,
    parentPath,
    Path,
    pathKey,
    pathWithChildren,
    selStart,
    TextCursor,
    Top,
    Update,
} from './utils';

export const handleShiftNav = (state: TestState, key: string): Update | void => {
    if (state.sel.end) {
        const next = goTabLateral(state.sel.end, state.top, key === 'ArrowLeft');
        if (!next) return;
        return { nodes: {}, selection: { start: state.sel.start, end: next } };
    }
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'id':
            return handleShiftId(current, state.top, key === 'ArrowLeft');
        case 'text':
            return handleShiftText(current, state.top, key === 'ArrowLeft');
    }
};

export const expandShiftRight = (): Update | void => {};

export const expandLateral = (side: SelSide, top: Top, shift: boolean): Update | void => {
    const next = goTabLateral(side, top, shift);
    if (!next) return;
    return { nodes: {}, selection: { start: side, end: next } };
};

export type SelSide = NonNullable<NodeSelection['end']>;

export const goTabLateral = (side: SelSide, top: Top, shift: boolean): NodeSelection['start'] | void => {
    const { path, cursor } = side;
    const node = top.nodes[lastChild(path)];
    if (node.type === 'list' && cursor.type === 'list') {
        // Maybe go inside?
        if (shift && cursor.where === 'after') {
            if (node.children.length === 0) {
                return selStart(path, { type: 'list', where: 'inside' });
            }
            return selectEnd(pathWithChildren(path, node.children[node.children.length - 1]), top);
        } else if (!shift && cursor.where === 'before') {
            if (node.children.length === 0) {
                return selStart(path, { type: 'list', where: 'inside' });
            }
            return selectStart(pathWithChildren(path, node.children[0]), top);
        }
    }
    if (cursor.type === 'list') {
        if (cursor.where === (shift ? 'before' : 'after')) {
            // check for smoosh
            const parent = top.nodes[parentLoc(path)];
            if (parent?.type === 'list' && parent.kind === 'smooshed') {
                const at = parent.children.indexOf(lastChild(path));
                if (at !== (shift ? 0 : parent.children.length - 1)) {
                    // go double
                    const next = goLateral(path, top, shift, true);
                    return next ? goLateral(next.path, top, shift, true) : next;
                }
            }
        }
    }

    return goLateral(path, top, shift, true);
};

export const handleTab = (state: TestState, shift: boolean): Update | void => {
    const next = goTabLateral(state.sel.end ?? state.sel.start, state.top, shift);
    return selUpdate(next);
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

        console.log('lateral');
        return expandLateral({ path, cursor, key: pathKey(path) }, top, left);
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
        return expandLateral({ path, cursor, key: pathKey(path) }, top, left);
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
