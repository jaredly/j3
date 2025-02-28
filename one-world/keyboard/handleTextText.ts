import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { ListKind, NodeID, Text, TextSpan, childLocs, stylesEqual } from '../shared/cnodes';
import { spanText } from './cursorSplit';
import { handleListKey } from './handleListKey';
import { richNode } from './handleNav';
import { Mods } from './handleShiftNav';
import { KeyAction, moveA } from './keyActionToUpdate';
// import { textCursorSides } from './insertId';
import { Config } from './test-utils';
import { ListCursor, Path, TextCursor, Top, getSpan, gparentLoc, lastChild, parentLoc, parentPath, selStart } from './utils';

export const maybeJoin = (one?: TextSpan<NodeID>, two?: TextSpan<NodeID>) => {
    if (one?.type === 'text' && two?.type === 'text' && stylesEqual(one.style, two.style)) {
        return { joined: { ...one, text: one.text + two.text }, off: splitGraphemes(one.text).length };
    }
};

export const handleTextText = (
    cursor: TextCursor,
    sel: number | undefined,
    current: Text<NodeID>,
    grem: string,
    path: Path,
    top: Top,
    mods?: Mods,
): void | KeyAction[] => {
    const span = getSpan(current, cursor.end.index);
    if (span.type !== 'text') {
        if (span.type === 'embed') {
            // Either 0 or 1
            // do we ... go with ... hm. OK I do think that /embeds/ ought to be styleable.
            // Otherwise that diminishes their usefulness.
            const at = current.spans.indexOf(span);
            if (cursor.end.cursor === 0) {
                const spans = current.spans.slice();
                if (at > 0) {
                    const prev = spans[at - 1];
                    if (prev.type === 'text') {
                        const grems = splitGraphemes(prev.text);
                        spans[at - 1] = { ...prev, text: grems.concat([grem]).join('') };
                        return [{ type: 'set-text-text', path, text: grems.concat([grem]).join(''), index: at - 1, end: grems.length + 1 }];
                    }
                }
                return [{ type: 'add-span', path, span: { type: 'text', text: grem, loc: '' }, index: at, cursor: 1 }];
            }

            if (cursor.end.cursor === 1) {
                if (grem === '"' && at === current.spans.length - 1) {
                    return moveA(selStart(path, { type: 'list', where: 'after' }));
                }

                let next = current.spans[at + 1];
                if (at === current.spans.length - 1 || next.type !== 'text' || !stylesEqual(span.style, next.style)) {
                    return [{ type: 'add-span', path, index: next.loc, cursor: 1, span: { type: 'text', style: span.style, text: grem, loc: '' } }];
                }
                return moveA(selStart(path, { type: 'text', end: { index: next.loc, cursor: 1 } }));
            }
        }
        return;
    }

    const text = spanText(span);
    const [left, right] =
        sel == null ? [cursor.end.cursor, cursor.end.cursor] : sel < cursor.end.cursor ? [sel, cursor.end.cursor] : [cursor.end.cursor, sel];

    if (grem === ' ' && current.spans.length === 1 && left === text.length) {
        let parent = top.nodes[parentLoc(path)];
        if (richNode(parent)) {
            let kind: ListKind<NodeID> | null = null;
            if (text.length === 1 && text.join('') === '-') {
                kind = { type: 'list', ordered: false };
            } else if (text.length === 3 && text.join('') === '[ ]') {
                kind = { type: 'checks', checked: {} };
            } else if (text.length === 3 && text.join('') === '( )') {
                kind = { type: 'opts' };
            } else if (text.length > 0 && text.every((s) => s === '#')) {
                kind = { type: 'section', level: text.length };
            } else if (text.length === 2 && text.join('') === '1.') {
                kind = { type: 'list', ordered: true };
            }
            if (kind != null) {
                const locs = childLocs(parent);
                const at = locs.indexOf(current.loc);
                if (at === -1) return [];
                return [
                    { type: 'set-text-text', end: 0, index: 0, path, text: '' },
                    {
                        type: 'wrap',
                        path: parentPath(path),
                        min: at,
                        max: at,
                        kind,
                    },
                ];
            }
        }
    }

    if (grem === '"' && cursor.end.index === current.spans.length - 1 && left === text.length) {
        let parent = top.nodes[parentLoc(path)];
        if (!richNode(parent)) {
            return moveA(selStart(path, { type: 'list', where: 'after' }));
        }
    }

    if (grem === '`' && left === right && left > 0 && text[left - 1] !== '\\' && span.style?.format !== 'code') {
        let start = null;
        for (let i = left - 1; i >= 0; i--) {
            if (text[i] === '`') {
                start = i;
                break;
            }
        }
        if (start != null) {
            return [
                {
                    type: 'set-text-text',
                    path,
                    index: cursor.end.index,
                    end: left,
                    text: text
                        .slice(0, start)
                        .concat(text.slice(start + 1))
                        .join(''),
                },
                {
                    type: 'text-format',
                    format: { format: 'code' },
                    path,
                    left: { index: cursor.end.index, cursor: start },
                    right: { index: cursor.end.index, cursor: left - 1 },
                },
                { type: 'add-span', path, cursor: 0, index: 2, span: { type: 'text', text: '', loc: '' } },
            ];
        }
    }

    if (grem === '{' && left === right && left > 0 && text[left - 1] === '$') {
        return [
            {
                type: 'set-text-text',
                path,
                index: cursor.end.index,
                end: left,
                text: text
                    .slice(0, left - 1)
                    .concat(text.slice(left))
                    .join(''),
            },
            {
                type: 'add-span',
                span: { type: 'embed', item: { type: 'id', text: '', loc: true }, loc: '' },
                cursor: { type: 'id', end: 0 },
                index: cursor.end.index,
                path,
                within: left - 1,
            },
        ];
    }

    if (grem === '\n' && !mods?.shift) {
        let parent = top.nodes[parentLoc(path)];
        if (richNode(parent)) {
            if (current.spans.length === 1 && span.text === '') {
                // hrm hrm
                let gparent = top.nodes[gparentLoc(path)];
                if (parent?.type === 'list' && gparent?.type === 'list' && richNode(gparent)) {
                    return [{ type: 'dedent-out-of-rich', path }];
                } else {
                    // otherwise ... wrap the parent in a rich? eh.
                }
            }

            return [{ type: 'split-text-in-rich', path, at: { index: cursor.end.index, cursor: left } }];
        }
    }

    return [
        { type: 'set-text-text', end: left + 1, index: cursor.end.index, path, text: [...text.slice(0, left), grem, ...text.slice(right)].join('') },
    ];
};

export const handleTextKey = (
    config: Config,
    top: Top,
    path: Path,
    cursor: ListCursor | TextCursor,
    grem: string,
    mods?: Mods,
): KeyAction[] | void => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'text') throw new Error('not text');
    if (cursor.type === 'list') {
        return handleListKey(config, top, path, cursor, grem);
    }

    // TODO: selectionnnnn
    return handleTextText(cursor, undefined, current, grem, path, top, mods);
};
