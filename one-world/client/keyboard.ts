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
    | { type: 'split-string'; left: string[][]; right: string[][] }
    | { type: 'update'; text?: string[]; cursor: number; start?: number }
    | {
          type: 'update-string';
          text?: string[][];
          cursor: { part: number; char: number };
          start?: { part: number; char: number };
      }
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

const cmpCursor = (
    one: { part: number; char: number },
    two: { part: number; char: number },
) => (one.part === two.part ? one.char - two.char : one.part - two.part);

const stringTexts = (node: Extract<Node, { type: 'string' }>) => {
    return [
        splitGraphemes(node.first),
        ...node.templates.map((n) => splitGraphemes(n.suffix)),
    ];
};

export const stringKey = (
    sel: Extract<NodeSelection, { type: 'string' }>,
    mods: Mods,
    node: Extract<Node, { type: 'string' }>,
    key: string,
): KeyRes => {
    const keys = splitGraphemes(key);
    if (keys.length > 1) {
        console.warn('Too many graphemes? What is this', key, keys);
        return;
    }
    const texts = sel.text?.slice() ?? stringTexts(node);
    if (sel.start != null) {
        const [left, right] =
            cmpCursor(sel.cursor, sel.start) < 0
                ? [sel.cursor, sel.start]
                : [sel.start, sel.cursor];
        if (right.part !== left.part) return; // TODO
        texts[left.part] = texts[left.part]
            .slice(0, left.char)
            .concat(keys)
            .concat(texts[left.part].slice(right.char));
        return {
            type: 'update-string',
            cursor: { part: left.part, char: left.char + keys.length },
            text: texts,
        };
    }
    const { part, char } = sel.cursor;
    texts[part] = texts[part]
        .slice(0, char)
        .concat(keys)
        .concat(texts[part].slice(char));
    return {
        type: 'update-string',
        cursor: { part, char: char + keys.length },
        text: texts,
    };
};

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
    if (selection.type === 'multi') {
        if (keys2.multi[key]) {
            return keys2.multi[key](selection, mods, [node], key);
        }
    }
    if (selection.type === 'id' && node.type === 'id') {
        if (keys2.id[key]) {
            return keys2.id[key](selection, mods, node, key);
        }
        if (keys2.all[key]) {
            return keys2.all[key](selection, mods, node, key);
        }
        return keys2.id[''](selection, mods, node, key);
    }

    if (selection.type === 'string' && node.type === 'string') {
        if (keys2.string[key]) {
            return keys2.string[key](selection, mods, node, key);
        }
        if (keys2.all[key]) {
            return keys2.all[key](selection, mods, node, key);
        }
        return keys2.string[''](selection, mods, node, key);
    }

    if (selection.type === 'other') {
        if (keys2.other[key]) {
            return keys2.other[key](selection, mods, node, key);
        }
    }

    if (keys2.all[key]) {
        return keys2.all[key](selection, mods, node, key);
    }

    // if (selection.type === '')

    // // um also ctrl and alt?
    // if (node.type === 'string') {
    //     if (keys.string[key]) {
    //         return keys.string[key](selection, mods, node, key);
    //     }
    // }
    // if (isText(node)) {
    //     if (keys.text[key]) {
    //         return keys.text[key](selection, mods, node, key);
    //     }
    //     if (keys.any[key]) {
    //         return keys.any[key](selection, mods, node, key);
    //     }
    //     return keys.text[''](selection, mods, node, key);
    // }
    // if (isCollection(node)) {
    //     if (keys.collection[key]) {
    //         return keys.collection[key](selection, mods, node, key);
    //     }
    // }
    // if (keys.any[key]) {
    //     return keys.any[key](selection, mods, node, key);
    // }
    // return keys.any[''](selection, mods, node, key);
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
    const keys = splitGraphemes(key);
    if (keys.length > 1) {
        console.warn('Too many graphemes? What is this', key, keys);
        return;
    }
    if (sel.type === 'multi' && !sel.end) {
        return { type: 'update', text: keys, cursor: keys.length };
    }
    if (sel.type !== 'id') return;
    // if (sel.type === 'other') {
    //     return { type: 'update', text: keys, cursor: keys.length };
    // }
    return textKey(
        keys,
        sel.text ?? splitGraphemes(node.text),
        sel.cursor,
        sel.start,
    );
};

type KeyRecord<Sel, NodeT> = KeyRecordT<Sel, Extract<Node, { type: NodeT }>>;

type KeyRecordT<Sel, Node> = Record<
    string,
    (
        sel: Extract<NodeSelection, { type: Sel }>,
        mods: Mods,
        node: Node,
        key: string,
    ) => KeyRes
>;

export const keys2: {
    id: KeyRecord<'id', 'id'>;
    string: KeyRecord<'string', 'string'>;
    other: KeyRecord<'other', string>;
    multi: KeyRecordT<'multi', Node[]>;
    all: KeyRecordT<string, Node>;
} = {
    id: {
        Backspace(selection, mods, node) {
            if (mods.shift) {
                return { type: 'delete', direction: 'blank' };
            }
            if (selection.type !== 'id' || node.type !== 'id') return;
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
        ' '(selection, _, node) {
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
        ''(sel, _, node, key) {
            const keys = splitGraphemes(key);
            if (keys.length > 1) {
                console.warn('Too many graphemes? What is this', key, keys);
                return;
            }
            return textKey(
                keys,
                sel.text ?? splitGraphemes(node.text),
                sel.cursor,
                sel.start,
            );
        },

        ArrowLeft(selection, { shift, ctrl }, rawText) {
            if (ctrl) return { type: 'swap', direction: 'left', into: shift };
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
    },
    multi: {
        Tab(selection, { shift }, nodes) {
            // TODO: get the path ... from the first node?
            // hrm.
            return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
        },
    },
    other: {
        Backspace(selection, mods, node) {
            if (selection.location === 'start') {
                return { type: 'nav', dir: 'left' };
            }
            if (mods.shift) {
                return { type: 'delete', direction: 'blank' };
            }
            return { type: 'nav', dir: 'inside-end' };
        },
        ' '(selection, _, node) {
            return {
                type: selection.location === 'start' ? 'before' : 'after',
                node: { type: 'id', text: '', loc: true },
            };
        },
        ArrowLeft(selection, { shift, ctrl }, rawText) {
            if (ctrl) return { type: 'swap', direction: 'left', into: shift };
            return {
                type: 'nav',
                dir: selection.location === 'start' ? 'left' : 'inside-end',
            };
        },
        ArrowRight(selection, { shift, ctrl }, rawText) {
            if (ctrl) return { type: 'swap', direction: 'right', into: shift };
            return {
                type: 'nav',
                dir: selection.location === 'end' ? 'right' : 'inside-start',
            };
        },
    },
    string: {
        '': stringKey,
        ' ': stringKey,
        '"': stringKey,
        "'": stringKey,
        '(': stringKey,
        ')': stringKey,
        '}': stringKey,
        '[': stringKey,
        ']': stringKey,
        '.': stringKey,
        '{'(sel, mods, node, key) {
            if (sel.start == null) {
                const text = sel.text ?? stringTexts(node);
                if (text[sel.cursor.part][sel.cursor.char - 1] === '$') {
                    return {
                        type: 'split-string',
                        left: text
                            .slice(0, sel.cursor.part)
                            .concat([
                                text[sel.cursor.part].slice(
                                    0,
                                    sel.cursor.char - 1,
                                ),
                            ]),
                        right: [
                            text[sel.cursor.part].slice(sel.cursor.char),
                            ...text.slice(sel.cursor.part),
                        ],
                    };
                }
            }
            return stringKey(sel, mods, node, '{');
        },
    },
    all: {
        // Tab(selection, _, node) {
        //     // ok
        //     selection.type;
        // },
        Tab(selection, { shift }, nodes) {
            // TODO: get the path ... from the first node?
            // hrm.
            return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
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

        ')': () => ({ type: 'end', which: 'list' }),
        ']': () => ({ type: 'end', which: 'array' }),
        '}': () => ({ type: 'end', which: 'record' }),

        '"': (s) => maybeSurround(s, 'string'),
        '(': (s) => maybeSurround(s, 'list'),
        '[': (s) => maybeSurround(s, 'array'),
        '{': (s) => maybeSurround(s, 'record'),
    },
};

export const keys: {
    any: Record<string, KFn<Node>>;
    multi: Record<
        string,
        (
            selection: Extract<NodeSelection, { type: 'multi' }>,
            mods: Mods,
            node: Node[],
            key: string,
        ) => KeyRes
    >;
    collection: KFns<'list' | 'array' | 'record'>;
    string: KFns<'string'>;
    text: Record<string, KFn<TextT>>;
} = {
    string: {
        '{'(sel, mods, node) {
            // STOP
            // if (sel.type === 'id' && sel.start == null) {
            //     const text = sel.text ?? splitGraphemes(node.text);
            //     if (text[sel.cursor - 1] === '$') {
            //         return {
            //             type: 'split',
            //             left: text.slice(0, sel.cursor - 1),
            //             right: text.slice(sel.cursor),
            //         };
            //     }
            // }
            // return textInsert(sel, mods, node, '{');
        },
    },
    text: {
        '': textInsert,
    },
    collection: {},
    multi: {
        Tab(selection, { shift }) {
            return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
        },
    },
    any: {
        ''(sel, _, node, key) {},
        Tab(selection, { shift }) {
            if (selection.type === 'id') {
                return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
            }
            if (selection.type === 'multi') {
                if (selection.end) return; // TODO
                return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
            }
            if (selection.type === 'other') {
                // if (selection.location === 'inside') {
                //     return { type: 'nav', dir: shift ? 'tab-left' : 'tab' };
                // }
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
            if (selection.type === 'other') {
                switch (selection.location) {
                    // case 'all':
                    // case 'inside':
                    //     return { type: 'delete', direction: 'blank' };
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
            if (selection.type === 'other') {
                switch (selection.location) {
                    // case 'all':
                    // case 'inside':
                    //     return { type: 'delete', direction: 'blank' };
                    case 'end':
                        if (mods.shift) {
                            return { type: 'delete', direction: 'blank' };
                        }
                        return { type: 'nav', dir: 'inside-end' };
                    case 'start':
                        return { type: 'unwrap', direction: 'left' };
                }
                return;
            }
            if (mods.shift) {
                return { type: 'delete', direction: 'blank' };
            }
            if (selection.type !== 'id' || node.type !== 'id') return;
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
            if (selection.type === 'other') {
                // if (selection.location === 'inside') {
                //     return {
                //         type: 'inside',
                //         nodes: [
                //             { type: 'id', text: '', loc: false },
                //             { type: 'id', text: '', loc: true },
                //         ],
                //     };
                // }
                // todo handle multi
                return {
                    type: selection.location === 'start' ? 'before' : 'after',
                    node: { type: 'id', text: '', loc: true },
                };
            }
            if (selection.type !== 'id' || node.type !== 'id') return;
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
            if (selection.type !== 'id') {
                if (selection.type === 'other') {
                    return {
                        type: 'nav',
                        dir:
                            selection.location === 'start'
                                ? 'left'
                                : // : selection.location === 'all' ||
                                  //   selection.location === 'inside'
                                  // ? 'to-start'
                                  'inside-end',
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
            if (selection.type !== 'id') {
                if (selection.type === 'other') {
                    return {
                        type: 'nav',
                        dir:
                            selection.location === 'end'
                                ? 'right'
                                : // : selection.location === 'all' ||
                                  //   selection.location === 'inside'
                                  // ? 'to-end'
                                  'inside-start',
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
        selection.type === 'other'
            ? selection.location === 'start'
            : selection.type === 'id'
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
                            tag: { type: 'id', loc: false, text: '' },
                            first: '',
                            templates: [],
                            loc: true,
                        }
                      : {
                            type: kind,
                            items: [{ type: 'id', text: '', loc: true }],
                            loc: false,
                        },
          };
}
