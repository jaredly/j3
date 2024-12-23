import { IDRef, Loc, RecNode, RecNodeT } from '../../shared/nodes';

type RNode = RecNode;

export const reader = (
    text: string,
    top: string = 'test-top',
    globals: Record<string, IDRef> = {},
): RNode | void => {
    return readerMulti<Loc>(0, text, top, globals)?.node;
};

export const readerMulti = <Loc>(
    i: number,
    text: string,
    top: string = 'test-top',
    globals: Record<string, IDRef> = {},
    specials = true,
    l: (start: number, end: number) => Loc = (n) => [[top, n]] as Loc,
): { i: number; node: RecNodeT<Loc> } | void => {
    const pairs = { '[': ']', '{': '}', '(': ')' };
    const skipWhite = () => {
        while (i < text.length && text[i].match(/\s/)) i++;
        return i >= text.length;
    };

    type RNode = RecNodeT<Loc>;

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
        }
        next();
        return {
            first,
            templates,
            type: 'string',
            loc: l(loc, i),
            tag: { type: 'id', text: '', loc: l(loc, i) },
        };
    };

    const stops = `|"]}) \t\n`;
    const read = (): RNode | void => {
        if (skipWhite()) return;
        if (text[i] === '(' && text[i + 1] === '|') {
            const start = i;
            i += 2;
            const rows: RNode[][] = [[]];
            while (true) {
                if (text[i] === '\n') {
                    rows.push([]);
                    i++;
                }
                if (skipWhite()) return;
                if (text[i] === '|' && text[i + 1] === ')') {
                    break;
                }
                if (text[i] === '|') {
                    i++;
                }
                const next = read();
                if (!next) break;
                rows[rows.length - 1].push(next);
            }
            return {
                type: 'table',
                kind: '(',
                rows,
                loc: l(start, i),
            };
        }

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
                    loc: l(start, i),
                };
            case '"':
                return readString();
            case ';':
                while (i < text.length && text[i] != '\n') {
                    i++;
                }
                return read();
            case '.':
                if (text[i + 1] === '.') {
                    const start = i;
                    i += 2;
                    const inner = read();
                    if (!inner) return;
                    return {
                        type: 'spread',
                        contents: inner,
                        loc: l(start, i),
                    };
                }
            default: {
                let start = i;
                for (; i < text.length && !stops.includes(text[i]); i++) {}
                if (start === i) return;
                let idText = text.slice(start, i);
                if (idText.includes('#')) {
                    const [left, right] = idText.split('#');
                    idText = left;
                    start = +right;
                    if (isNaN(start)) {
                        throw new Error(`invalid hash`);
                    }
                }
                let ref: IDRef | undefined = undefined;
                if (idText.includes('!') && specials) {
                    const [left, right] = idText.split('!');
                    idText = left;
                    const key = right.length ? right : left;
                    if (left === '') {
                        ref = { type: 'placeholder', text: right };
                    } else {
                        ref = globals[key];
                        if (!globals[key]) {
                            throw new Error(`global missing: ${key}`);
                        }
                    }
                }
                const id: RNode = {
                    type: 'id',
                    text: idText,
                    loc: l(start, i),
                    ref,
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
    const node = read();
    return node ? { node, i } : node;
};
