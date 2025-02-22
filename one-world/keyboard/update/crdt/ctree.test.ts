import { fromRec, Node, Nodes, RecNodeT } from '../../../shared/cnodes';
import { shape } from '../../../shared/shape';
import { ticker } from '../../crdt-check.test';
import { fixTextSel, pathWith, withLocs } from '../../ctdt-test-utils';
import { isTag } from '../../handleNav';
import { root } from '../../root';
import { id, round } from '../../test-utils';
import { Cursor, NodeSelection, selStart, Top } from '../../utils';
import { LRW } from './crdt';
import { CId, CList, CTree, insertArray, Op, ParentOp } from './ctree';

export type CTop = {
    tree: CTree;
    ts: () => string;
};
export type CTState = { ctop: CTop; top: Top; sel: NodeSelection };

const insert = (node: Node, { ts, tree }: CTop): Op[] => {
    switch (node.type) {
        case 'id':
            return [new CId(node.loc, new LRW({ text: node.text, ccls: node.ccls }, node.loc), tree)];
        case 'list': {
            const result = insertArray(ts, tree, node.children);
            let kind = node.kind;
            const ops: Op[] = [];
            if (isTag(kind)) {
                ops.push(new ParentOp(kind.node, new LRW({ attr: 'tag', parent: node.loc }, node.loc)));
                if (kind.attributes) {
                    ops.push(new ParentOp(kind.attributes, new LRW({ attr: 'attributes', parent: node.loc }, node.loc)));
                }
                kind = { ...kind, node: '', attributes: '' };
            }
            return [
                new CList(node.loc, new LRW(node.kind, node.loc), new LRW(node.forceMultiline ?? null, node.loc), tree),
                ...result.ops,
                new ParentOp(result.head, new LRW({ attr: 'children', parent: node.loc }, node.loc)),
            ];
        }
    }
    throw new Error(`node type not yet ${node.type}`);
};

const asTop = (ctop: CTop) => {
    const roots = ctop.tree.children('root', 'root');
    if (roots.length > 1) throw new Error('multiple roots');
    if (!roots.length) throw new Error(`no root!!`);
    const top: Top = {
        nextLoc: 0,
        nodes: ctop.tree.asNodes(),
        root: roots[0],
    };
    return top;
};

export const initial = (
    iroot: RecNodeT<boolean | number | null> = { type: 'id', text: '', loc: true },
    cursor: Cursor = { type: 'id', end: 0 },
    endCursor?: Cursor,
): CTState => {
    const ts = ticker();
    const ctop: CTop = { ts, tree: new CTree({}, {}) };

    const { sels, root } = withLocs(iroot, ts);
    if (!sels[1]) throw new Error(`nothing selected?`);
    const sel: NodeSelection = {
        start: selStart(pathWith(sels[1]), cursor),
        end: endCursor ? selStart(pathWith(sels[2] ?? sels[1]), endCursor) : undefined,
    };
    fixTextSel(sel.start);

    const nodes: Nodes = {};
    fromRec(root, nodes, (loc) => loc);
    Object.values(nodes).forEach((node) => ctop.tree.apply(insert(node, ctop)));
    ctop.tree.apply([new ParentOp(root.loc, new LRW({ attr: 'root', parent: 'root' }, ts()))]);

    return { ctop, top: asTop(ctop), sel };
};

test('initial set up', () => {
    const state = initial(round([id('hello', true), id('yes')]));
    expect(shape(root(state))).toEqual('(id(hello/0) id(yes/0))');
});
