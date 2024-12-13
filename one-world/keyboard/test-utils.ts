import { RecNodeT, Nodes, fromRec, childLocs, childNodes, Id, ListKind, RecText, TextSpan, TableKind, Style, IdRef, RecNode } from '../shared/cnodes';
import { Ctx, ParseResult } from '../syntaxes/dsl';
import { selEnd, Src } from './handleShiftNav';
import { charClass } from './insertId';
import { CollectionCursor, Cursor, IdCursor, ListWhere, NodeSelection, Path, selStart, TextCursor, Top } from './utils';

export type TestState = {
    top: Top;
    sel: NodeSelection;
    parser?: TestParser;
};
export type TestParser = {
    config: Config;
    parse(node: RecNode, cursor?: number): ParseResult<any>;
    spans(ast: any): Src[];
};

export const initTop: Top = {
    nextLoc: 1,
    nodes: { [0]: { type: 'id', text: '', loc: 0 } },
    root: 0,
};
export const init: TestState = {
    top: initTop,
    sel: {
        start: selStart({ root: { ids: [], top: '' }, children: [0] }, { type: 'id', end: 0 }),
    },
};

export const asTopAndPath = (node: RecNodeT<boolean>): { top: Top; sel: number[] } => {
    const nodes: Nodes = {};
    let nextLoc = 0;
    let sel: number[] = [];
    const root = fromRec(node, nodes, (l, node, path) => {
        const loc = nextLoc++;
        if (l) {
            sel = path.concat([loc]);
        }
        return loc;
    });
    return { top: { nextLoc, nodes, root }, sel };
};

export type Sels = null | [number, Cursor] | [number, Cursor][];

export const asTopAndLocs = (node: RecNodeT<number>): { top: Top; locs: Record<number, number[]> } => {
    const nodes: Nodes = {};
    let nextLoc = 0;
    let locs: Record<number, number[]> = {};
    const rootLoc = fromRec(node, nodes, (l, node, path) => {
        const loc = nextLoc++;
        if (l != null) {
            if (locs[l]) throw new Error(`duplicate num ${l}`);
            locs[l] = path.concat([loc]);
        }
        return loc;
    });
    return { top: { nextLoc, nodes, root: rootLoc }, locs };
};

export const asTopAndPaths = (node: RecNodeT<Sels>, root: Path['root']): { top: Top; sels: Record<number, NodeSelection> } => {
    const nodes: Nodes = {};
    let nextLoc = 0;
    let sels: Record<number, NodeSelection> = {};
    const rootLoc = fromRec(node, nodes, (l, node, path) => {
        const loc = nextLoc++;
        if (l != null) {
            if (Array.isArray(l[0])) {
                (l as [number, Cursor][]).forEach(([num, cursor]) => {
                    sels[num] = { start: selStart({ children: path.concat([loc]), root }, cursor) };
                });
            } else {
                const [num, cursor] = l as [number, Cursor];
                sels[num] = { start: selStart({ children: path.concat([loc]), root }, cursor) };
            }
        }
        return loc;
    });
    return { top: { nextLoc, nodes, root: rootLoc }, sels };
};

export const asTop = (node: RecNodeT<boolean>, cursor: Cursor): TestState => {
    const { top, sel } = asTopAndPath(node);
    return { top, sel: { start: selStart({ children: sel, root: { ids: [], top: '' } }, cursor) } };
};

export const asMultiTop = (node: RecNodeT<number>, cursor: Cursor): TestState => {
    const { top, locs } = asTopAndLocs(node);
    if (!locs[0] || !locs[1]) throw new Error(`need locs 0 and 1`);
    return {
        top,
        sel: {
            start: selStart({ children: locs[0], root: { ids: [], top: '' } }, cursor),
            multi: {
                end: selEnd({ children: locs[1], root: { ids: [], top: '' } }),
                aux: locs[2] ? selEnd({ children: locs[2], root: { ids: [], top: '' } }) : undefined,
            },
        },
    };
};

export const atPath = (root: number, top: Top, path: number[]) => {
    const res: number[] = [root];
    path = path.slice();
    while (path.length) {
        root = childLocs(top.nodes[root])[path.shift()!];
        res.push(root);
    }
    return res;
};

export const selPathN = <T>(exp: RecNodeT<T>, n: T) => {
    let found = null as number[] | null;
    const visit = (node: RecNodeT<T>, path: number[]) => {
        if (node.loc === n) {
            if (found != null) throw new Error(`multiple nodes marked as selected`);
            found = path;
        }
        childNodes(node).forEach((child, i) => visit(child, path.concat([i])));
    };
    visit(exp, []);
    return found;
};

export const selPath = (exp: RecNodeT<boolean>) => {
    const found = selPathN(exp, true);
    if (found == null) throw new Error(`no node marked for selection`);
    return found;
};

// kinds of keys:
// - tight
// - space
// - sep
// - id (everything else)
// MARK: makers
export const id = <T>(text: string, loc: T = null as T, config = lisp, ref?: IdRef): Id<T> => ({
    type: 'id',
    text,
    loc,
    ref,
    ccls: text.length === 0 ? undefined : text[0] === '.' && text.length > 1 ? charClass(text[1], config) : charClass(text[0], config),
});
export const list =
    (kind: ListKind<RecNodeT<unknown>>) =>
    <T>(children: RecNodeT<T>[], loc: T = null as T, forceMultiline?: boolean): RecNodeT<T> => ({
        type: 'list',
        kind: kind as ListKind<RecNodeT<T>>,
        forceMultiline,
        children,
        loc,
    });
export const smoosh = list('smooshed');
export const spaced = list('spaced');
export const round = list('round');
export const square = list('square');
export const curly = list('curly');
export const rich = list({ type: 'plain' });
export const bullet = list({ type: 'list', ordered: false });
export const checks = list({ type: 'checks', checked: {} });
// What do I do about you now
// export const angle = list('angle');
export const table = <T>(kind: TableKind, rows: RecNodeT<T>[][], loc: T = null as T): RecNodeT<T> => ({ type: 'table', kind, rows, loc });
export const text = <T>(spans: TextSpan<RecNodeT<T>>[], loc: T = null as T): RecText<T> => ({ type: 'text', loc, spans });

// ugh.
/*

In lisp, we want:
- ' ' to be the list sep
- no space sep
- '|' to be the table sep, but NOT the list sep

I guess it would be

list: ' \n'
table: '|\n

and js

list: ',;\n',
table: ';\n',

So instead of `listKind` it would be something like .. `isListSep(key, config)` and `isTableSep(key, config)`

and we only check tableSep in certain circumstances.

*/

export const lisp = {
    punct: [';', '.', '@', '=#+'],
    space: '',
    sep: ' \n',
    tableCol: ' :',
    tableRow: '\n',
    tableNew: ':',
} satisfies Config;

export const js = {
    // punct: [],
    // so js's default is just 'everything for itself'
    // tight: [...'~`!@#$%^&*_+-=\\./?:'],
    // punct: '~`!@#$%^&*_+-=\\./?:',
    punct: ['.', '/', '~`!@#$%^&*+-=\\/?:><'],
    space: ' ',
    sep: ',;\n',
    tableCol: ',:',
    tableRow: ';\n',
    tableNew: ':',
    xml: true,
} satisfies Config;

export type Config = {
    punct: string[];
    space: string;
    sep: string;
    xml?: boolean;
    tableCol: string;
    tableRow: string;
    tableNew: string;
};

// Classes of keys
/// IDkeys
const allkeys = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM~!@#$%^&*()_+{}|:"<>?`-=[]\\;\',./';
const idkeys = (config: Config) => [...allkeys].filter((k) => !config.punct.includes(k) && !config.space.includes(k) && !config.sep.includes(k));
const lispId = idkeys(lisp);
const jsId = idkeys(js);
export const idc = (end: number, start?: number): IdCursor => ({ type: 'id', end, start });
export const listc = (where: ListWhere): CollectionCursor => ({ type: 'list', where });
export const controlc = (index: number): CollectionCursor => ({ type: 'control', index });
export const noText = (cursor: Cursor): Cursor =>
    cursor.type === 'id' ? { ...cursor, text: undefined } : cursor.type === 'text' ? { ...cursor, end: { ...cursor.end, text: undefined } } : cursor;
export const textc = (index: number, cursor: number, text?: string[]): TextCursor => ({
    type: 'text',
    end: { index, cursor, text },
});
export const textcs = (index: number, cursor: number, sindex: number, scursor: number, text?: string[]): TextCursor => ({
    type: 'text',
    end: { index, cursor, text },
    start: { index: sindex, cursor: scursor },
});
export const tspan = (text: string, style?: Style): TextSpan<any> => ({ type: 'text', text, style });
