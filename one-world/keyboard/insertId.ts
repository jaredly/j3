import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { stylesEqual, Text } from '../shared/cnodes';
import { handleListKey } from './handleListKey';
import { justSel, selUpdate } from './handleNav';
import { lastChild, ListCursor, Path, pathWithChildren, selStart, TextCursor, Top, Update } from './utils';

export type Config = { punct: string[]; space: string; sep: string };
export type Kind = number | 'space' | 'sep' | 'string'; // | 'bar';

export const textKind = (grem: string, config: Config): Kind => {
    if (grem === '"') return 'string';
    if (config.sep.includes(grem)) return 'sep';
    if (config.space.includes(grem)) return 'space';
    return charClass(grem, config);
};

export const charClass = (grem: string, config: Config): number => {
    for (let i = 0; i < config.punct.length; i++) {
        if (config.punct[i].includes(grem)) {
            return i + 1;
        }
    }
    return 0;
};

export const textCursorSides = (cursor: TextCursor) => {
    const left = cursor.start ? Math.min(cursor.start.cursor, cursor.end.cursor) : cursor.end.cursor;
    const right = cursor.start ? Math.max(cursor.start.cursor, cursor.end.cursor) : cursor.end.cursor;
    return { left, right };
};

export const textCursorSides2 = (
    cursor: TextCursor,
): { left: { cursor: number; index: number }; right: { cursor: number; index: number }; text?: { grems: string[]; index: number } } => {
    const text = cursor.end.text ? { grems: cursor.end.text, index: cursor.end.index } : undefined;
    if (!cursor.start) return { left: cursor.end, right: cursor.end, text };
    if (cursor.start.index > cursor.end.index || (cursor.start.index === cursor.end.index && cursor.start.cursor > cursor.end.cursor)) {
        return { left: cursor.end, right: cursor.start, text };
    }
    return { left: cursor.start, right: cursor.end, text };
};

export const handleTextText = (cursor: TextCursor, current: Text<number>, grem: string, path: Path, top: Top): Update | void => {
    if (cursor.start && cursor.start.index !== cursor.end.index) {
        throw new Error('not multi yet sry');
    }
    const span = current.spans[cursor.end.index];
    if (span.type !== 'text') {
        if (span.type === 'embed') {
            // Either 0 or 1
            // do we ... go with ... hm. OK I do think that /embeds/ ought to be styleable.
            // Otherwise that diminishes their usefulness.
            if (cursor.end.cursor === 1) {
                let next = current.spans[cursor.end.index + 1];
                if (cursor.end.index === current.spans.length - 1 || next.type !== 'text' || !stylesEqual(span.style, next.style)) {
                    const spans = current.spans.slice();
                    spans.splice(cursor.end.index + 1, 0, { type: 'text', style: span.style, text: grem });
                    return {
                        nodes: { [current.loc]: { ...current, spans } },
                        selection: { start: selStart(path, { type: 'text', end: { index: cursor.end.index + 1, cursor: 1 } }) },
                    };
                }
                return justSel(path, { type: 'text', end: { index: cursor.end.index + 1, cursor: 1, text: [grem, ...splitGraphemes(next.text)] } });
            }
        }
        return;
    }

    const text = cursor.end.text ?? splitGraphemes(span.text);
    const { left, right } = textCursorSides(cursor);

    if (grem === '"' && cursor.end.index === current.spans.length - 1 && left === text.length) {
        return justSel(path, { type: 'list', where: 'after' });
    }

    if (grem === '{' && left === right && left > 0 && text[left - 1] === '$') {
        // split the span
        // and add a new thing
        let nextLoc = top.nextLoc;
        const loc = nextLoc++;
        const spans = current.spans.slice();
        let index = cursor.end.index;
        if (left > 1) {
            spans[cursor.end.index] = { ...span, text: text.slice(0, left - 1).join('') };
            spans.splice(cursor.end.index + 1, 0, { type: 'embed', item: loc });
            index = cursor.end.index + 1;
        } else {
            spans[cursor.end.index] = { type: 'embed', item: loc };
        }
        if (left < text.length) {
            spans.splice(index + 1, 0, { ...span, text: text.slice(left).join('') });
        }
        return {
            nodes: { [current.loc]: { ...current, spans }, [loc]: { type: 'id', text: '', loc } },
            selection: { start: selStart(pathWithChildren(path, loc), { type: 'id', end: 0 }) },
            nextLoc,
        };
    }

    // Sooo now we come to a choice.
    // How to do embeds?
    /*
    - ${} is tried and true
    - \ + dropdown would be ... more flexible? idk
    - some ... ctrl+ key combo? I don't like that quite as much
    - \() is swift, right? it has the benefit of 'not having a normal meaning',
      so you don't have to do extra to ~escape it.
      lol roc uses $() hwyy
      python uses f"hi {a}"
      hrm now a downside is that \((a b)) looks silly.
      does it look /more/ silly than ${(a b)}?
      eh maybe not.

    So, but here's a question: do I even ~need () brackets?
    like, it will be visually distinct.
    The only think brackets would do is make it clear how
    to type it. which to be fair is a pretty important thing.

    Honestly I think it should be an editor config thing to
    show/hide.

    And in "display" mode probably hide.

    OK so with that sorted, maybe we just go with ${}. it's fine.
    */

    const ntext = text.slice(0, left).concat([grem]).concat(text.slice(right));

    return justSel(path, {
        type: 'text',
        end: {
            index: cursor.end.index,
            cursor: left + 1,
            text: ntext,
        },
    });
};

export const handleTextKey = (config: Config, top: Top, path: Path, cursor: ListCursor | TextCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'text') throw new Error('not text');
    if (cursor.type === 'list') {
        return handleListKey(config, top, path, cursor, grem);
    }

    return handleTextText(cursor, current, grem, path, top);
};
