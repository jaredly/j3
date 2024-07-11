// ok

import { RecNode, RecNodeT } from '../shared/nodes';
import { EditState } from './TextEdit/Id';
import { Mods } from './HiddenInput';

type Location = 'start' | 'middle' | 'end';

type LocalAction = {
    type: 'update';
    text: string[];
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
    | { type: 'split'; at: number; del: number; text: string[] }
    | { type: 'delete' }
    | { type: 'join-left'; text: string[] }
    | { type: 'nav'; dir: 'up' | 'down' | 'left' | 'right' }
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
        loc: Location,
        state: EditState,
        mods: { shift: boolean; meta: boolean },
    ) => KeyAction | LocalAction | void
> = {
    Backspace(loc, { text, sel, start }, mods) {
        if (sel === 0) {
            return { type: 'join-left', text };
        }
        // if (text.length === 0) {
        //     return { type: 'delete' };
        // }
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
    ' '(loc, state) {
        if (loc === 'middle') {
            const [left, right] =
                state.start != null
                    ? state.sel < state.start
                        ? [state.sel, state.start]
                        : [state.start, state.sel]
                    : [state.sel, state.sel];
            return {
                type: 'split',
                at: left,
                del: right - left,
                text: state.text,
            };
        }
        return {
            type: loc === 'start' ? 'before' : 'after',
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
    ArrowLeft(_, { text, sel, start }, { shift }) {
        if (shift) {
            return {
                type: 'update',
                text,
                cursor: Math.max(0, sel - 1),
                cursorStart: start ?? sel,
            };
        }
        if (sel > 0) {
            return { type: 'update', text, cursor: Math.max(0, sel - 1) };
        }
    },
    ArrowRight(_, { text, sel, start }, { shift }) {
        if (shift) {
            return {
                type: 'update',
                text,
                cursor: Math.min(text.length, sel + 1),
                cursorStart: start ?? sel,
            };
        }
        if (sel < text.length) {
            return {
                type: 'update',
                text,
                cursor: Math.min(text.length, sel + 1),
            };
        }
        // if (cursor < text.length) {
        //     return { type: 'update', text, cursor: cursor + 1 };
        // }
    },
    '('(loc, { text }) {
        return loc === 'start' || text.length === 0
            ? { type: 'surround', kind: 'list' }
            : {
                  type: 'after',
                  node: {
                      type: 'list',
                      items: [{ type: 'id', text: '', loc: true }],
                      loc: false,
                  },
              };
    },
    '['(loc, { text }) {
        return loc === 'start' || text.length === 0
            ? { type: 'surround', kind: 'array' }
            : {
                  type: 'after',
                  node: {
                      type: 'array',
                      items: [{ type: 'id', text: '', loc: true }],
                      loc: false,
                  },
              };
    },
    '{'(loc, { text }) {
        return loc === 'start' || text.length === 0
            ? { type: 'surround', kind: 'record' }
            : {
                  type: 'after',
                  node: {
                      type: 'record',
                      items: [{ type: 'id', text: '', loc: true }],
                      loc: false,
                  },
              };
    },
};
