import { Node, NodeID, Nodes, RecNodeT, childLocs, fromRec, isRich } from '../../shared/cnodes';
import { findParent as fp, listKindForKeyKind } from '../flatenate';
import { simpleSide } from '../handleDelete';
import { whatNeighbor, addIdNeighbor } from '../handleIdKey';
import { addNeighbor } from '../handleListKey';
import { isTag, richNode, selectEnd } from '../handleNav';
import { KeyWhat, selUpdate } from '../keyActionToUpdate';
import { replaceAt } from '../replaceAt';
import { flatten, flatToUpdateNew } from '../rough';
import {
    Cursor,
    NodeSelection,
    Path,
    TextIndex,
    Top,
    UNodes,
    Update,
    getSpanIndex,
    lastChild,
    parentLoc,
    parentPath,
    pathWithChildren,
    selStart,
} from '../utils';

export { selUpdate };

export const replaceSelf = (top: Top, path: Path, node: RecNodeT<boolean>, cursor: Cursor) => {
    let nextLoc = top.nextLoc;
    const nodes: Nodes = {};
    let selPath: NodeID[] = [];

    const root = fromRec(node, nodes, (loc, __, path) => {
        const nl = nextLoc!++ + '';
        if (loc === true) {
            selPath = path.concat([nl]);
        }
        return nl;
    });

    if (!selPath.length) return;

    const up = replaceAt(parentPath(path).children, top, lastChild(path), root);
    up.nextLoc = nextLoc;
    Object.assign(up.nodes, nodes);
    up.selection = { start: selStart(pathWithChildren(parentPath(path), ...selPath), cursor) };
    return up;
};

export const removeSelf = (top: Top, current: { path: Path; node: Node }): Update | void => {
    const pnode = top.nodes[parentLoc(current.path)];
    if (pnode && pnode.type === 'list' && pnode.kind === 'smooshed') {
        // removing an item from a smooshed, got to reevaulate it
        const items = pnode.children.map((loc) => top.nodes[loc]).filter((n) => n.loc !== current.node.loc);
        const at = pnode.children.indexOf(current.node.loc);
        if (items.length === 1) {
            const up = replaceAt(parentPath(parentPath(current.path)).children, top, pnode.loc, items[0].loc);
            up.selection = {
                start: selStart(
                    pathWithChildren(parentPath(parentPath(current.path)), items[0].loc),
                    simpleSide(items[0], at === 0 ? 'start' : 'end'),
                ),
            };
        }
        if (items.length === 0) {
            throw new Error(`shouldnt have a 1-length smoosh`);
        }
        if (at === -1) throw new Error('current not in parent');
        const sel = at === 0 ? items[0] : items[at - 1];
        const ncursor = simpleSide(sel, at === 0 ? 'start' : 'end');
        return flatToUpdateNew(
            items,
            { node: sel, cursor: ncursor },
            { isParent: true, node: pnode, path: parentPath(current.path) },
            { [current.node.loc]: null },
            top,
        );
    }

    if (pnode?.type === 'list' && isTag(pnode.kind)) {
        if (pnode.kind.attributes === current.node.loc) {
            const sel = selectEnd(pathWithChildren(parentPath(current.path), pnode.kind.node), top);
            return sel
                ? {
                      nodes: { [pnode.loc]: { ...pnode, kind: { ...pnode.kind, attributes: undefined } } },
                      selection: { start: sel },
                  }
                : undefined;
        }
        if (pnode.children.length === 1 && pnode.children[0] === current.node.loc) {
            return {
                nodes: { [pnode.loc]: { ...pnode, children: [] } },
                selection: {
                    start: selStart(parentPath(current.path), { type: 'list', where: 'inside' }),
                },
            };
        }
    }

    if (pnode?.type === 'list' && isRich(pnode.kind)) {
        if (current.node.type === 'text') {
            if (pnode.children.length === 1) {
                return removeSelf(top, { path: parentPath(current.path), node: pnode });
            }
            const children = pnode.children.slice();
            const at = children.indexOf(current.node.loc);
            children.splice(at, 1);
            const nsel = selectEnd(pathWithChildren(parentPath(current.path), children[at === 0 ? 0 : at - 1]), top);
            if (!nsel) return;
            return { nodes: { [pnode.loc]: { ...pnode, children } }, selection: { start: nsel } };
        }
    }

    const inRich = pnode?.type === 'list' && isRich(pnode.kind);

    let nextLoc = top.nextLoc;
    const loc = nextLoc++ + '';
    const up = replaceAt(parentPath(current.path).children, top, current.node.loc, loc);
    up.nextLoc = nextLoc;
    up.nodes[loc] = inRich ? { type: 'text', spans: [{ type: 'text', text: '', loc: '' }], loc } : { type: 'id', loc, text: '' };
    up.selection = {
        start: selStart(
            pathWithChildren(parentPath(current.path), loc),
            inRich ? { type: 'text', end: { index: 0, cursor: 0 } } : { type: 'id', end: 0 },
        ),
    };
    return up;
};

export const findParent = (nodes: Update['nodes'], loc: NodeID): NodeID | null => {
    for (let key of Object.keys(nodes)) {
        const node = nodes[+key];
        if (node) {
            const children = childLocs(node);
            if (children.includes(loc)) {
                return key;
            }
        }
    }
    return null;
};

export const controlToggle = (top: Top, path: Path, index: TextIndex): void | Update => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'list' || typeof current.kind === 'string') return;
    const loc = typeof index === 'number' ? current.children[index] : index;
    if (current.kind.type === 'checks') {
        return {
            nodes: {
                [current.loc]: {
                    ...current,
                    kind: { type: 'checks', checked: { ...current.kind.checked, [loc]: !current.kind.checked[loc] } },
                },
            },
        };
    }
    if (current.kind.type === 'opts') {
        const loc = typeof index === 'number' ? current.children[index] : index;
        return { nodes: { [current.loc]: { ...current, kind: { type: 'opts', which: loc === current.kind.which ? undefined : loc } } } };
    }
};

export const addInside = (top: Top, path: Path, children: RecNodeT<boolean>[], cursor: Cursor): void | Update => {
    let nextLoc = top.nextLoc;

    const node = top.nodes[lastChild(path)];
    if (node.type !== 'list' && node.type !== 'table') return;

    const nodes: Nodes = {};
    let selPath: NodeID[] = [];
    const roots = children.map((child) =>
        fromRec(child, nodes, (loc, __, path) => {
            const nl = nextLoc!++ + '';
            if (loc === true) {
                selPath = path.concat([nl]);
            }
            return nl;
        }),
    );

    if (cursor.type === 'text' && typeof cursor.end.index === 'number') {
        cursor.end.index = selPath.pop()!;
    }

    if (selPath.length === 0) throw new Error(`nothing selected in node to add`);

    nodes[node.loc] = node.type === 'table' ? { ...node, rows: [roots] } : { ...node, children: roots };

    return {
        nodes,
        nextLoc,
        selection: { start: selStart(pathWithChildren(path, ...selPath), cursor) },
    };
};
export const handleInsertText = (top: Top, path: Path, pos: 'before' | 'after' | number, what: KeyWhat) => {
    const node = top.nodes[lastChild(path)];
    const kind = what.type === 'text' ? what.ccls : what.type;

    const parent = fp(listKindForKeyKind(kind), parentPath(path), top);

    const flat = parent ? flatten(parent.node, top) : [node];

    const neighbor = whatNeighbor(what);
    if (typeof pos === 'number' && node.type === 'id') {
        const nodes: UNodes = {};
        const { sel, ncursor } = addIdNeighbor({ neighbor, current: { node, cursor: { type: 'id', end: pos } }, flat, nodes, top });

        return flatToUpdateNew(
            flat,
            { node: sel, cursor: ncursor },
            { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
            nodes,
            top,
        );
    } else {
        const pnode = top.nodes[parentLoc(path)];
        const blank: Node = richNode(pnode)
            ? { type: 'text', spans: [{ type: 'text', text: '', loc: '' }], loc: '-1' }
            : { type: 'id', text: '', loc: '-1' };

        var { sel, ncursor, nodes } = addNeighbor({
            flat,
            current: node,
            neighbor,
            cursor: {
                type: 'list',
                where: typeof pos === 'number' ? 'inside' : pos,
            },
            blank,
        });

        return flatToUpdateNew(
            flat,
            { node: sel, cursor: ncursor },
            { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
            nodes,
            top,
        );
    }
};
