// ok

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node, RecNodeT } from '../shared/nodes';
import { NodeSelection } from '../shared/state';
import { Mods } from './HiddenInput';
import { isCollection, isText, TextT } from './TextEdit/actions';

export type KeyAction =
    | {
          type: 'surround';
          kind: 'list' | 'record' | 'array' | 'string' | 'comment' | 'spread';
      }
    | { type: 'end'; which: 'list' | 'array' | 'record' }
    | { type: 'split'; left: string[]; right: string[] }
    | { type: 'update'; text?: string[]; cursor: number; start?: number }
    | { type: 'delete'; direction: 'left' | 'right' | 'blank' }
    | { type: 'unwrap'; direction: 'left' | 'right' }
    | { type: 'shrink'; from: 'start' | 'end' }
    | { type: 'swap'; direction: 'left' | 'right'; into: boolean }
    | { type: 'join-left'; text: string[] }
    | { type: 'inside'; nodes: RecNodeT<boolean>[] }
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
              | 'to-end'
              | 'expand'
              | 'contract'
              | 'tab'
              | 'tab-left';
      }
    | { type: 'after' | 'before'; node: RecNodeT<boolean> };

export const textKey = (
    key: string[],
    text: string[],
    sel: number,
    start?: number,
): KeyAction => {
    if (start != null) {
        const [left, right] = start < sel ? [start, sel] : [sel, start];
        return {
            type: 'update',
            text: text.slice(0, left).concat(key).concat(text.slice(right)),
            cursor: left + key.length,
        };
    }
    return {
        type: 'update',
        text: text.slice(0, sel).concat(key).concat(text.slice(sel)),
        cursor: sel + key.length,
    };
};

type KeyRes = KeyAction | void | false;

export const runKey = (
    key: string,
    mods: Mods,
    node: Node,
    selection: NodeSelection,
) => {
    if (mods.meta) return false;
    // um also ctrl and alt?
    if (node.type === 'stringText') {
        if (keys.stringText[key]) {
            return keys.stringText[key](selection, mods, node, key);
        }
    }
    if (isText(node)) {
        if (keys.text[key]) {
            return keys.text[key](selection, mods, node, key);
        }
        if (keys.any[key]) {
            return keys.any[key](selection, mods, node, key);
        }
        return keys.text[''](selection, mods, node, key);
    }
    if (isCollection(node)) {
        if (keys.collection[key]) {
            return keys.collection[key](selection, mods, node, key);
        }
    }
    if (keys.any[key]) {
        return keys.any[key](selection, mods, node, key);
    }
    return keys.any[''](selection, mods, node, key);
};

type KFn<T> = (
    selection: NodeSelection,
    mods: Mods,
    node: T,
    key: string,
) => KeyRes;
type KFns<S> = Record<string, KFn<Extract<Node, { type: S }>>>;

const textInsert = (
    sel: NodeSelection,
    _: Mods,
    node: TextT,
    key: string,
): KeyRes => {
    if (sel.type === 'multi') return;
    const keys = splitGraphemes(key);
    if (keys.length > 1) {
        console.warn('Too many graphemes? What is this', key, keys);
        return;
    }
    if (sel.type === 'without') {
        return { type: 'update', text: keys, cursor: keys.length };
    }
    return textKey(
        keys,
        sel.text ?? splitGraphemes(node.text),
        sel.cursor,
        sel.start,
    );
};

export const keys: {
    any: Record<string, KFn<Node>>;
    collection: KFns<'list' | 'array' | 'record'>;
    stringText: Record<string, KFn<TextT>>;
    text: Record<string, KFn<TextT>>;
} = {
    stringText: {
        ' ': textInsert,
        '"': textInsert,
        "'": textInsert,
        '(': textInsert,
        ')': textInsert,
        '}': textInsert,
        '[': textInsert,
        ']': textInsert,
        '.': textInsert,
        '{'(sel, mods, node) {
            if (sel.type === 'within' && sel.start == null) {
                const text = sel.text ?? splitGraphemes(node.text);
                if (text[sel.cursor - 1] === '$') {
                    return {
                        type: 'split',
                        left: text.slice(0, sel.cursor - 1),
                        right: text.slice(sel.cursor),
                    };
                }
            }
            return textInsert(sel, mods, node, '{');
        },
    },
    text: {
        '': textInsert,
    },
    collection: {},
    any: {
        ''(sel, _, node, key) {},
        Tab(selection, { shift }) {
            if (selection.type === 'within') {
                return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
            }
            if (selection.type === 'without') {
                if (selection.location === 'inside') {
                    return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
                }
                if (selection.location === (shift ? 'end' : 'start')) {
                    return {
                        type: 'nav',
                        dir: shift ? 'inside-end' : 'inside-start',
                    };
                }
                return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
            }
        },

        Delete(selection, mods) {
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

        Backspace(selection, mods, node) {
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
            if (mods.shift) {
                return { type: 'delete', direction: 'blank' };
            }
            if (!isText(node)) return;
            const sel = selection.cursor;
            const text = selection.text ?? splitGraphemes(node.text);
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

        ' '(selection, meta, node) {
            if (selection.type === 'multi') return;
            if (selection.type !== 'within') {
                if (selection.location === 'inside') {
                    return {
                        type: 'inside',
                        nodes: [
                            { type: 'id', text: '', loc: false },
                            { type: 'id', text: '', loc: true },
                        ],
                    };
                }
                // todo handle multi
                return {
                    type: selection.location === 'start' ? 'before' : 'after',
                    node: { type: 'id', text: '', loc: true },
                };
            }
            if (!isText(node)) return;
            const text = selection.text ?? splitGraphemes(node.text);
            if (
                (selection.start != null &&
                    selection.start !== selection.cursor) ||
                selection.cursor > 0
            ) {
                const [left, right] =
                    selection.start != null
                        ? selection.cursor < selection.start
                            ? [selection.cursor, selection.start]
                            : [selection.start, selection.cursor]
                        : [selection.cursor, selection.cursor];
                return {
                    type: 'split',
                    left: text.slice(0, left),
                    right: text.slice(right),
                };
            }
            return {
                type:
                    selection.cursor === 0 && text.length > 0
                        ? 'before'
                        : 'after',
                node: { type: 'id', text: '', loc: true },
            };
        },

        Enter(loc) {},

        Escape() {},
        Meta() {},
        Alt() {},
        Shift() {},
        Control() {},

        ArrowUp: (_, { shift }) => {
            if (shift) {
                return { type: 'nav', dir: 'expand' };
            }
            return { type: 'nav', dir: 'up' };
        },
        ArrowDown: (_, { shift }) => {
            if (shift) {
                return { type: 'nav', dir: 'contract' };
            }
            return { type: 'nav', dir: 'down' };
        },

        ArrowLeft(selection, { shift, ctrl }, rawText) {
            if (ctrl) return { type: 'swap', direction: 'left', into: shift };
            if (selection.type !== 'within') {
                if (selection.type === 'without') {
                    return {
                        type: 'nav',
                        dir:
                            selection.location === 'start'
                                ? 'left'
                                : selection.location === 'all' ||
                                  selection.location === 'inside'
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
                    start: start ?? cursor,
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

        ArrowRight(selection, { shift, ctrl }, node) {
            if (ctrl) return { type: 'swap', direction: 'right', into: shift };
            if (selection.type !== 'within') {
                if (selection.type === 'without') {
                    return {
                        type: 'nav',
                        dir:
                            selection.location === 'end'
                                ? 'right'
                                : selection.location === 'all' ||
                                  selection.location === 'inside'
                                ? 'to-end'
                                : 'inside-start',
                    };
                }
                return { type: 'nav', dir: 'right' };
            }
            if (!isText(node)) return;
            let { text, start, cursor } = selection;
            text = text ?? splitGraphemes(node.text);
            if (shift) {
                return {
                    type: 'update',
                    text,
                    cursor: Math.min(text.length, cursor + 1),
                    start: start ?? cursor,
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

        '"'(selection) {
            return maybeSurround(selection, 'string');
        },
        '('(selection) {
            return maybeSurround(selection, 'list');
        },
        '['(selection) {
            return maybeSurround(selection, 'array');
        },
        '{'(selection) {
            return maybeSurround(selection, 'record');
        },
    },
};

function maybeSurround(
    selection: NodeSelection,
    kind: 'list' | 'array' | 'record' | 'string',
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
              node:
                  kind === 'string'
                      ? {
                            type: kind,
                            first: { type: 'stringText', text: '', loc: true },
                            templates: [],
                            loc: false,
                        }
                      : {
                            type: kind,
                            items: [{ type: 'id', text: '', loc: true }],
                            loc: false,
                        },
          };
}
