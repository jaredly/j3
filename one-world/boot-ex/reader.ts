import { Loc, RecNode } from '../shared/nodes';

type RNode = RecNode;

export const reader = (
    text: string,
    top: string = 'test-top',
): RNode | void => {
    let i = 0;
    const pairs = { '[': ']', '{': '}', '(': ')' };
    const skipWhite = () => {
        while (i < text.length && text[i].match(/\s/)) i++;
        return i >= text.length;
    };
    const l = (num: number): Loc => [[top, num]];

    const readString = (): Extract<RNode, { type: 'string' }> | void => {
        const loc = i;
        i++;
        let first = '';
        let current = '';
        let templates: { suffix: string; expr: RNode; loc: number }[] = [];

        const next = () => {
            if (!templates.length) {
                first = current;
            } else {
                templates[templates.length - 1].suffix = current;
            }
            current = '';
        };

        for (; i < text.length; i++) {
            if (text[i] === '"') {
                i++;
                break;
            }
            if (text[i] === '\\') {
                current += text[i];
                i++;
            }
            if (text[i] === '$' && text[i + 1] === '{') {
                next();
                i += 2;
                const expr = read();
                if (!expr) return;
                templates.push({ expr, suffix: '', loc: i });
                if (text[i] !== '}')
                    throw new Error('unmatched } in template string');
                continue;
            }
            current += text[i];
            // console.log('a', current, text[i])
        }
        next();
        return {
            first,
            templates,
            type: 'string',
            loc: l(loc),
            tag: { type: 'id', text: '', loc: l(loc) },
        };
    };

    const stops = `"]}) \t\n`;
    const read = (): RNode | void => {
        if (skipWhite()) return;
        switch (text[i]) {
            case '[':
            case '{':
            case '(':
                const start = i;
                const last = pairs[text[i] as '['];
                i += 1;
                const items: RNode[] = [];
                while (true) {
                    const next = read();
                    if (!next) break;
                    items.push(next);
                }
                skipWhite();
                if (i >= text.length || text[i] !== last) {
                    throw new Error(`Expected ${last}: ${text[i]}`);
                }
                i++;
                return {
                    type:
                        last === ']'
                            ? 'array'
                            : last === ')'
                            ? 'list'
                            : 'record',
                    items,
                    loc: l(start),
                };
            case '"':
                return readString();
            case '.':
                if (text[i + 1] === '.') {
                    const loc = l(i);
                    i += 2;
                    const inner = read();
                    if (!inner) return;
                    return { type: 'spread', contents: inner, loc };
                }
            default: {
                let start = i;
                for (; i < text.length && !stops.includes(text[i]); i++) {}
                if (start === i) return;
                const id: RNode = {
                    type: 'id',
                    text: text.slice(start, i),
                    loc: l(start),
                };
                if (text[i] === '"') {
                    const string = readString();
                    if (!string) return string;
                    return { ...string, tag: id };
                }
                return id;
            }
        }
    };
    return read();
};