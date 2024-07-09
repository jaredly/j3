// ok

import { RecNode } from '../shared/nodes';

type Location = 'start' | 'middle' | 'end';

type Action =
    | {
          type: 'surround';
          kind: 'list' | 'record' | 'array' | 'string' | 'comment' | 'spread';
      }
    | { type: 'split' }
    | { type: 'delete' | 'join-left' }
    | { type: 'update'; text: string[]; cursor: number; after?: RecNode }
    | { type: 'nav'; dir: 'up' | 'down' | 'left' | 'right' }
    | { type: 'after' | 'before'; node: RecNode };

export const specials: Record<
    string,
    (loc: Location, cursor: number, text: string[]) => Action | void
> = {
    Backspace(loc, cursor, text) {
        if (text.length === 0) {
            return { type: 'delete' };
        }
        if (cursor === 0) {
            return { type: 'join-left' };
        }
        return {
            type: 'update',
            text: text.slice(0, cursor - 1).concat(text.slice(cursor)),
            cursor: cursor - 1,
        };
    },
    ' '(loc) {
        return loc === 'middle'
            ? { type: 'split' }
            : {
                  type: loc === 'start' ? 'before' : 'after',
                  node: { type: 'id', text: '', loc: [] },
              };
    },
    Enter(loc) {
        return loc === 'middle'
            ? { type: 'split' }
            : {
                  type: loc === 'start' ? 'before' : 'after',
                  node: { type: 'id', text: '', loc: [] },
              };
    },

    Escape() {},
    Meta() {},
    Alt() {},
    Shift() {},
    Control() {},

    ArrowUp: () => ({ type: 'nav', dir: 'up' }),
    ArrowDown: () => ({ type: 'nav', dir: 'down' }),
    ArrowLeft(_, cursor, text) {
        if (cursor > 0) {
            return { type: 'update', text, cursor: cursor - 1 };
        }
    },
    ArrowRight(_, cursor, text) {
        if (cursor < text.length) {
            return { type: 'update', text, cursor: cursor + 1 };
        }
    },
    '('(loc) {
        return loc === 'start'
            ? { type: 'surround', kind: 'list' }
            : {
                  type: 'after',
                  node: {
                      type: 'list',
                      items: [{ type: 'id', text: '', loc: [] }],
                      loc: [],
                  },
              };
    },
    '['(loc) {
        return loc === 'start'
            ? { type: 'surround', kind: 'array' }
            : {
                  type: 'after',
                  node: {
                      type: 'array',
                      items: [{ type: 'id', text: '', loc: [] }],
                      loc: [],
                  },
              };
    },
    '{'(loc) {
        return loc === 'start'
            ? { type: 'surround', kind: 'record' }
            : {
                  type: 'after',
                  node: {
                      type: 'record',
                      items: [{ type: 'id', text: '', loc: [] }],
                      loc: [],
                  },
              };
    },
};
