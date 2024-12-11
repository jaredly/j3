import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { stylesEqual, Nodes, Text, TextSpan } from '../shared/cnodes';
import { handleListKey } from './handleListKey';
import { justSel, richNode } from './handleNav';
import { Mods } from './handleShiftNav';
import { textCursorSides } from './insertId';
import { Config } from './test-utils';
import { TextCursor, Path, Top, Update, selStart, pathWithChildren, parentLoc, findTableLoc, parentPath, ListCursor, lastChild } from './utils';

export const handleTextText = (cursor: TextCursor, current: Text<number>, grem: string, path: Path, top: Top, mods?: Mods): Update | void => {
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

    if (grem === '`' && left === right && left > 0 && text[left - 1] !== '\\' && span.style?.format !== 'code') {
        let start = null;
        for (let i = left - 1; i >= 0; i--) {
            if (text[i] === '`') {
                start = i;
                break;
            }
        }
        if (start != null) {
            const pre = text.slice(0, start);
            const post = text.slice(left);
            const mid = text.slice(start + 1, left);
            const spans = current.spans.slice();
            const mspan: TextSpan<number> = { type: 'text', style: { ...span.style, format: 'code' }, text: mid.join('') };
            let at = cursor.end.index;
            if (pre.length) {
                spans[at] = { ...span, text: pre.join('') };
                at++;
                spans.splice(at, 0, mspan);
            } else {
                spans[at] = mspan;
            }
            spans.splice(at + 1, 0, { ...span, text: post.join('') });
            return {
                nodes: { [current.loc]: { ...current, spans } },
                selection: { start: selStart(path, { type: 'text', end: { index: at + 1, cursor: 0 } }) },
            };
        }
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

    if (grem === '\n' && !mods?.shift) {
        let parent = top.nodes[parentLoc(path)];
        if (richNode(parent)) {
            // nowww we split.
            // hrm but we also need to allow a mods
            const before = current.spans.slice(0, cursor.end.index + 1);
            before[before.length - 1] = { ...span, text: text.slice(0, left).join('') };
            const after = current.spans.slice(cursor.end.index);
            after[0] = { ...span, text: text.slice(right).join('') };

            let nextLoc = top.nextLoc;
            const loc = nextLoc++;

            const nodes: Nodes = {};

            if (parent.type === 'list') {
                const pat = parent.children.indexOf(current.loc);
                if (pat === -1) throw new Error(`canrt find ${current.loc} in parent ${parent.loc} : ${parent.children}`);
                const children = parent.children.slice();
                children.splice(pat + 1, 0, loc);
                parent = { ...parent, children };
            } else if (parent.type === 'table') {
                const { row, col } = findTableLoc(parent.rows, current.loc);
                const rows = parent.rows.slice();
                const right = rows[row].slice(col + 1);
                rows[row] = rows[row].slice(0, col + 1);
                rows.splice(row + 1, 0, [loc, ...right]);
                if (!right.length) {
                    for (let i = 1; i < rows[row].length; i++) {
                        const cloc = nextLoc++;
                        nodes[cloc] = { type: 'text', spans: [], loc: cloc };
                        rows[row + 1].push(cloc);
                    }
                }
                parent = { ...parent, rows };
            }

            return {
                nodes: {
                    ...nodes,
                    [current.loc]: { ...current, spans: before },
                    [loc]: { type: 'text', loc, spans: after },
                    [parent.loc]: parent,
                },
                selection: { start: selStart(pathWithChildren(parentPath(path), loc), { type: 'text', end: { index: 0, cursor: 0 } }) },
                nextLoc,
            };
        }
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

export const handleTextKey = (config: Config, top: Top, path: Path, cursor: ListCursor | TextCursor, grem: string, mods?: Mods): Update | void => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'text') throw new Error('not text');
    if (cursor.type === 'list') {
        return handleListKey(config, top, path, cursor, grem);
    }

    return handleTextText(cursor, current, grem, path, top, mods);
};
