// ok

import { RecNode, RecNodeT } from '../shared/nodes';
import { EditState } from './TextEdit/Id';
import { Mods } from './HiddenInput';
import { NodeSelection } from '../shared/state';
import { splitGraphemes } from '../../src/parse/splitGraphemes';

type Location = 'start' | 'middle' | 'end';

type LocalAction = {
    type: 'update';
    text?: string[];
    cursor: number;
    cursorStart?: number;
    after?: RecNode;
};

export type KeyAction =
    // non-mutative
    // mutative
    | {
          type: 'surround';
          kind: 'list' | 'record' | 'array' | 'string' | 'comment' | 'spread';
      }
    | { type: 'end'; which: 'list' | 'array' | 'record' }
    | { type: 'split'; at: number; del: number; text: string[] }
    | { type: 'delete'; direction: 'left' | 'right' | 'blank' }
    | { type: 'unwrap'; direction: 'left' | 'right' }
    | { type: 'shrink'; from: 'start' | 'end' }
    | { type: 'swap'; direction: 'left' | 'right' }
    | { type: 'join-left'; text: string[] }
    | {
          type: 'nav';
          dir:
              | 'up'
              | 'down'
              | 'left'
              | 'right'
              | 'inside-start'
              | 'inside-end'
              | 'to-start'
              | 'to-end';
      }
    | { type: 'after' | 'before'; node: RecNodeT<boolean> };

export const textKey = (
    key: string[],
    { text, sel, start }: EditState,
    mods: Mods,
) => {
    if (start != null) {
        const [left, right] = start < sel ? [start, sel] : [sel, start];
        return {
            text: text.slice(0, left).concat(key).concat(text.slice(right)),
            cursor: left + key.length,
        };
    }
    return {
        text: text.slice(0, sel).concat(key).concat(text.slice(sel)),
        cursor: sel + key.length,
    };
};

export const specials: Record<
    string,
    (
        sel: NodeSelection,
        mods: { shift: boolean; meta: boolean; ctrl: boolean },
        text?: string,
    ) => KeyAction | LocalAction | void
> = {
    Tab(selection, { shift }) {
        if (selection.type === 'within') {
            return { type: 'nav', dir: shift ? 'left' : 'right' };
        }
        if (selection.type === 'without') {
            if (selection.location === 'inside') {
                return { type: 'nav', dir: shift ? 'left' : 'right' };
            }
            if (selection.location === (shift ? 'end' : 'start')) {
                return {
                    type: 'nav',
                    dir: shift ? 'inside-end' : 'inside-start',
                };
            }
            return { type: 'nav', dir: shift ? 'left' : 'right' };
        }
    },

    Delete(selection, mods, rawText) {
        if (selection.type === 'multi') return;
        if (selection.type === 'without') {
            switch (selection.location) {
                case 'all':
                case 'inside':
                    return { type: 'delete', direction: 'blank' };
                case 'end':
                    return { type: 'unwrap', direction: 'right' };
                case 'start':
                    if (mods.shift) {
                        return { type: 'delete', direction: 'blank' };
                    }
                    return { type: 'shrink', from: 'start' };
            }
        }
    },
    Backspace(selection, mods, rawText) {
        if (selection.type === 'multi') return;
        if (selection.type === 'without') {
            switch (selection.location) {
                case 'all':
                case 'inside':
                    return { type: 'delete', direction: 'blank' };
                case 'end':
                    if (mods.shift) {
                        return { type: 'delete', direction: 'blank' };
                    }
                    return { type: 'shrink', from: 'end' };
                case 'start':
                    return { type: 'unwrap', direction: 'left' };
            }
            return;
        }
        const sel = selection.cursor;
        const text = selection.text ?? splitGraphemes(rawText ?? '');
        if (sel === 0) {
            return {
                type: 'join-left',
                text: text.slice(selection.start ?? 0),
            };
        }
        const start = selection.start;
        if (start != null) {
            const [left, right] = start < sel ? [start, sel] : [sel, start];
            return {
                type: 'update',
                text: text.slice(0, left).concat(text.slice(right)),
                cursor: left,
            };
        }
        return {
            type: 'update',
            text: text.slice(0, sel - 1).concat(text.slice(sel)),
            cursor: sel - 1,
        };
    },
    ' '(selection, meta, rawText) {
        if (selection.type === 'multi') return;
        if (selection.type !== 'within') {
            // todo handle multi
            return {
                type: selection.location === 'start' ? 'before' : 'after',
                node: { type: 'id', text: '', loc: true },
            };
        }
        const text = selection.text ?? splitGraphemes(rawText ?? '');
        if (
            (selection.start != null && selection.start !== selection.cursor) ||
            selection.cursor > 0
        ) {
            const [left, right] =
                selection.start != null
                    ? selection.cursor < selection.start
                        ? [selection.cursor, selection.start]
                        : [selection.start, selection.cursor]
                    : [selection.cursor, selection.cursor];
            return { type: 'split', at: left, del: right - left, text };
        }
        return {
            type:
                selection.cursor === 0 && text.length > 0 ? 'before' : 'after',
            node: { type: 'id', text: '', loc: true },
        };
    },
    Enter(loc) {
        // return loc === 'middle'
        //     ? { type: 'split' }
        //     : {
        //           type: loc === 'start' ? 'before' : 'after',
        //           node: { type: 'id', text: '', loc: [] },
        //       };
    },

    Escape() {},
    Meta() {},
    Alt() {},
    Shift() {},
    Control() {},

    ArrowUp: () => ({ type: 'nav', dir: 'up' }),
    ArrowDown: () => ({ type: 'nav', dir: 'down' }),
    ArrowLeft(selection, { shift, ctrl }, rawText) {
        if (ctrl) return { type: 'swap', direction: 'left' };
        if (selection.type !== 'within') {
            if (selection.type === 'without') {
                return {
                    type: 'nav',
                    dir:
                        selection.location === 'start'
                            ? 'left'
                            : selection.location === 'all'
                            ? 'to-start'
                            : 'inside-end',
                };
            }
            return { type: 'nav', dir: 'left' };
        }
        const { text, start, cursor } = selection;
        if (shift) {
            return {
                type: 'update',
                text: text,
                cursor: Math.max(0, cursor - 1),
                cursorStart: start ?? cursor,
            };
        }
        if (cursor > 0) {
            return {
                type: 'update',
                text: text,
                cursor: Math.max(0, cursor - 1),
            };
        } else {
            return { type: 'nav', dir: 'left' };
        }
    },
    ArrowRight(selection, { shift, ctrl }, rawText) {
        if (ctrl) return { type: 'swap', direction: 'right' };
        if (selection.type !== 'within') {
            if (selection.type === 'without') {
                return {
                    type: 'nav',
                    dir:
                        selection.location === 'end'
                            ? 'right'
                            : selection.location === 'all'
                            ? 'to-end'
                            : 'inside-start',
                };
            }
            return { type: 'nav', dir: 'right' };
        }
        let { text, start, cursor } = selection;
        text = text ?? splitGraphemes(rawText ?? '');
        if (shift) {
            return {
                type: 'update',
                text,
                cursor: Math.min(text.length, cursor + 1),
                cursorStart: start ?? cursor,
            };
        }
        if (cursor < text.length) {
            return {
                type: 'update',
                text,
                cursor: Math.min(text.length, cursor + 1),
            };
        } else {
            return { type: 'nav', dir: 'right' };
        }
    },
    ')': () => ({ type: 'end', which: 'list' }),
    ']': () => ({ type: 'end', which: 'array' }),
    '}': () => ({ type: 'end', which: 'record' }),
    '('(selection, mods, rawText) {
        return maybeSurround(selection, 'list');
    },
    '['(selection) {
        return maybeSurround(selection, 'array');
    },
    '{'(selection) {
        return maybeSurround(selection, 'record');
    },
};

function maybeSurround(
    selection: NodeSelection,
    kind: 'list' | 'array' | 'record',
): KeyAction {
    const surround =
        selection.type === 'without'
            ? selection.location === 'start' || selection.location === 'all'
            : selection.type === 'within'
            ? selection.cursor === 0
            : false;
    return surround
        ? { type: 'surround', kind: kind }
        : {
              type: 'after',
              node: {
                  type: kind,
                  items: [{ type: 'id', text: '', loc: true }],
                  loc: false,
              },
          };
}
