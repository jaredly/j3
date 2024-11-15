import { RecNodeT, Nodes, fromRec, childLocs, childNodes, Id, ListKind, RecText, TextSpan, TableKind } from '../shared/cnodes';
import { Config } from './insertId';
import { CollectionCursor, Cursor, IdCursor, ListWhere, NodeSelection, selStart, Top } from './utils';

export type TestState = { top: Top; sel: NodeSelection };

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

export const asTop = (node: RecNodeT<boolean>, cursor: Cursor): TestState => {
    const { top, sel } = asTopAndPath(node);
    return { top, sel: { start: selStart({ children: sel, root: { ids: [], top: '' } }, cursor) } };
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
export const selPath = (exp: RecNodeT<boolean>) => {
    let found: number[] | null = null;
    const visit = (node: RecNodeT<boolean>, path: number[]) => {
        if (node.loc) {
            found = path;
            return;
        }
        childNodes(node).forEach((child, i) => visit(child, path.concat([i])));
    };
    visit(exp, []);
    if (found == null) throw new Error(`no node marked for selection`);
    return found;
}; // kinds of keys:
// - tight
// - space
// - sep
// - id (everything else)
// MARK: makers
export const id = <T>(text: string, loc: T = null as T): Id<T> => ({
    type: 'id',
    text,
    loc,
    punct: text.length === 0 ? undefined : [...text].some((k) => lisp.punct.includes(k)),
});
export const list =
    (kind: ListKind<RecNodeT<unknown>>) =>
    <T>(children: RecNodeT<T>[], loc: T = null as T): RecNodeT<T> => ({
        type: 'list',
        kind: kind as ListKind<RecNodeT<T>>,
        children,
        loc,
    });
export const smoosh = list('smooshed');
export const spaced = list('spaced');
export const round = list('round');
export const table = <T>(kind: TableKind, rows: RecNodeT<T>[][], loc: T = null as T): RecNodeT<T> => ({ type: 'table', kind, rows, loc });
export const text = <T>(spans: TextSpan<RecNodeT<T>>[], loc: T = null as T): RecText<T> => ({ type: 'text', loc, spans });
export const lisp = {
    punct: '.=#@;+',
    space: '',
    sep: ' ',
};
export const js = {
    // punct: [],
    // so js's default is just 'everything for itself'
    // tight: [...'~`!@#$%^&*_+-=\\./?:'],
    punct: '~`!@#$%^&*_+-=\\./?:',
    space: ' ',
    sep: ';,\n',
}; // Classes of keys
/// IDkeys
const allkeys = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM~!@#$%^&*()_+{}|:"<>?`-=[]\\;\',./';
const idkeys = (config: Config) => [...allkeys].filter((k) => !config.punct.includes(k) && !config.space.includes(k) && !config.sep.includes(k));
const lispId = idkeys(lisp);
const jsId = idkeys(js);
export const idc = (end: number): IdCursor => ({ type: 'id', end });
export const listc = (where: ListWhere): CollectionCursor => ({ type: 'list', where });
export const noText = (cursor: Cursor) => (cursor.type === 'id' ? { ...cursor, text: undefined } : cursor);
