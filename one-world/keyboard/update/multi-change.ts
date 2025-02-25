import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { childLocs, fromRec, Node, NodeID, Nodes, RecNodeT } from '../../shared/cnodes';
import { applySelUp } from '../applyUpdate';
import { selectEnd, selectStart } from '../handleNav';
import { SelStart } from '../handleShiftNav';
import { replaceIn } from '../replaceIn';
import { root } from '../root';
import { updateNodes } from '../rough';
import { collectSelectedNodes, Neighbor } from '../selections';
import { TestState } from '../test-utils';
import { disolveSmooshed, joinSmooshed, rebalanceSmooshed } from './list';
import {
    Cursor,
    JustSelUpdate,
    lastChild,
    NodeSelection,
    parentLoc,
    parentPath,
    Path,
    pathKey,
    pathWithChildren,
    selStart,
    Top,
    Update,
} from '../utils';

export const shouldNudgeRight = (path: Path, cursor: Cursor, getNode: (id: string) => Node) => {
    const node = getNode(lastChild(path));
    const pnode = getNode(parentLoc(path));
    if (!pnode) return false;
    if (node.type === 'id') {
        if (cursor.type !== 'id' || cursor.end < splitGraphemes(node.text).length) {
            return false;
        }
    }
    if (node.type === 'list') {
        if (cursor.type !== 'list' || cursor.where !== 'after') {
            return false;
        }
    }
    if (pnode.type !== 'list') return false;
    return true;
};
export const shouldNudgeLeft = (path: Path, cursor: Cursor, getNode: (id: string) => Node) => {
    const node = getNode(lastChild(path));
    const pnode = getNode(parentLoc(path));
    if (!pnode) return false;
    if (node.type === 'id') {
        if (cursor.type !== 'id' || cursor.end > 0) {
            return false;
        }
    }
    if (node.type === 'list') {
        if (cursor.type !== 'list' || cursor.where !== 'before') {
            return false;
        }
    }
    if (pnode.type !== 'list') return false;
    return true;
};

export const handleDeleteTooMuch = (top: Top, start: SelStart, end: SelStart): JustSelUpdate | void => {
    const [left, neighbors, right, _] = collectSelectedNodes(start, end, (id) => top.nodes[id]);
    const lnudge = shouldNudgeRight(left.path, left.cursor, (id) => top.nodes[id]);
    const rnudge = shouldNudgeLeft(right.path, right.cursor, (id) => top.nodes[id]);
    if (!lnudge) neighbors.push({ path: left.path, hl: { type: 'full' } });
    let rpartial = null as null | Node;
    {
        const rnode = top.nodes[lastChild(right.path)];
        if (rnode.type === 'id' && right.cursor.type === 'id') {
            const grems = splitGraphemes(rnode.text);
            if (right.cursor.end < grems.length) {
                rpartial = { ...rnode, text: grems.slice(right.cursor.end).join('') };
            }
        }
    }
    if (!rnudge && rpartial == null) neighbors.push({ path: right.path, hl: { type: 'full' } });
    const sorted = partitionNeighbors(neighbors, (id) => top.nodes[id], false);
    const lloc = lastChild(left.path);

    const nodes: Nodes = {};
    sorted.forEach(({ path, children: selected }) => {
        const node = top.nodes[lastChild(path)];
        if (node.type !== 'list') return;
        const children = node.children.slice().filter((c) => !selected.includes(c) || lloc === c);
        nodes[node.loc] = { ...node, children };
    });

    let leftCursor = 0;
    if (!lnudge) {
        nodes[lloc] = { type: 'id', text: '', loc: lloc };
        const lnode = top.nodes[lloc];
        if (lnode.type === 'id' && left.cursor.type === 'id' && left.cursor.end !== 0) {
            const text = splitGraphemes(lnode.text).slice(0, left.cursor.end).join('');
            nodes[lloc] = { type: 'id', text, loc: lloc, ccls: lnode.ccls };
            leftCursor = left.cursor.end;
        }
    }
    if (rpartial) {
        nodes[rpartial.loc] = rpartial;
    }
    const sel = lnudge ? selectEnd(left.path, top) : selStart(left.path, { type: 'id', end: leftCursor });
    if (!sel) return;

    let selection: NodeSelection = { start: sel };

    let nextLoc = undefined as undefined | number;

    const lparent = parentLoc(left.path);
    const rparent = parentLoc(right.path);
    if (lparent === rparent) {
        const pnode = nodes[lparent];
        if (pnode?.type === 'list' && pnode.kind !== 'smooshed') {
            const i1 = pnode.children.indexOf(lastChild(left.path));
            const i2 = pnode.children.indexOf(lastChild(right.path));
            if (i2 === i1 + 1) {
                const children = pnode.children.slice();
                nextLoc = top.nextLoc;
                const loc = nextLoc++ + '';
                const two = children.splice(i1, 2, loc);
                nodes[loc] = { type: 'list', kind: 'smooshed', children: two, loc };
                nodes[pnode.loc] = { ...pnode, children };
                selection = applySelUp(selection, { type: 'addparent', loc: two[0], parent: loc });
                selection = applySelUp(selection, { type: 'addparent', loc: two[1], parent: loc });
            }
        }
    }

    return { nodes, selection, nextLoc };
};

const copyDeep = (loc: NodeID, top: Top, dest: Nodes) => {
    if (dest[loc]) return; // already handled
    dest[loc] = top.nodes[loc];
    childLocs(top.nodes[loc]).forEach((child) => copyDeep(child, top, dest));
};

export type CopiedValues = { tree: RecNodeT<NodeID>; single: boolean };

export const pasteUpdate = (top: Top, path: Path, cursor: Cursor, values: CopiedValues): void | Update => {
    let nextLoc = top.nextLoc;
    const nodes: Nodes = {};

    const root = fromRec(values.tree, nodes, (l) => {
        if (l == null || l === '-1' || nodes[l] || top.nodes[l]) {
            return nextLoc++ + '';
        }
        return l;
    });

    // options include:
    // it's just an ID, and we're in an ID.
    const node = top.nodes[lastChild(path)];
    if (node.type === 'id') {
        if (node.text === '') {
            const rootNode = nodes[root]!;
            const pnode = top.nodes[parentLoc(path)];
            if (!values.single && rootNode.type === 'list' && pnode?.type === 'list' && rootNode.kind === pnode.kind) {
                const upnode = replaceIn(pnode, node.loc, ...rootNode.children);
                nodes[upnode.loc] = upnode;
                const update: Update = { nodes };

                rebalanceSmooshed(update, top);
                joinSmooshed(update, top);
                disolveSmooshed(update, top);

                const stop = { ...top, nodes: updateNodes(top.nodes, update.nodes) };
                const selS = selectStart(pathWithChildren(parentPath(path), rootNode.children[0]), stop);
                const selE = selectEnd(pathWithChildren(parentPath(path), rootNode.children[rootNode.children.length - 1]), stop);
                if (selS && selE) {
                    return { ...update, selection: { start: selS, end: selE }, nextLoc };
                }
            }

            nodes[node.loc] = { ...rootNode!, loc: node.loc };
            delete nodes[root];

            const stop = { ...top, nodes: updateNodes(top.nodes, nodes) };
            const st = selectStart(path, stop);
            const ed = selectEnd(path, stop);

            if (st && ed) {
                return { nodes, selection: { start: st, end: ed }, nextLoc };
            }
            return;
        }

        if (values.tree.type === 'id' && cursor.type === 'id') {
            const grems = splitGraphemes(node.text);
            const nws = splitGraphemes(values.tree.text);
            grems.splice(cursor.end, 0, ...nws);
            return {
                nodes: { [node.loc]: { ...node, text: grems.join('') } },
                selection: {
                    start: selStart(path, { type: 'id', end: cursor.end }),
                    end: selStart(path, { type: 'id', end: cursor.end + nws.length }),
                },
            };
        }
    }

    // ah ok here's the story.
    // if we're in a blank ID, and it's a multi, then we splice
};

export const handleCopyMulti = (state: TestState): void | CopiedValues => {
    if (!state.sel.end) return;
    const [left, neighbors, right, _] = collectSelectedNodes(state.sel.start, state.sel.end!, (id) => state.top.nodes[id]);
    const lnudge = shouldNudgeRight(left.path, left.cursor, (id) => state.top.nodes[id]);
    const rnudge = shouldNudgeLeft(right.path, right.cursor, (id) => state.top.nodes[id]);
    if (!lnudge) neighbors.push({ path: left.path, hl: { type: 'full' } });

    if (left.key === right.key) {
        const nodes: Nodes = {};
        const lloc = lastChild(left.path);
        copyDeep(lloc, state.top, nodes);
        const node = nodes[lloc];
        if (node.type === 'id' && left.cursor.type === 'id' && right.cursor.type === 'id') {
            const grems = splitGraphemes(node.text);
            nodes[lloc] = { ...node, text: grems.slice(left.cursor.end, right.cursor.end).join('') };
        }
        return { tree: root({ top: { ...state.top, nodes: { ...state.top.nodes, ...nodes }, root: lloc } }), single: true };
    }

    let rpartial = null as null | Node;
    {
        const rnode = state.top.nodes[lastChild(right.path)];
        if (rnode.type === 'id' && right.cursor.type === 'id') {
            const grems = splitGraphemes(rnode.text);
            if (right.cursor.end < grems.length) {
                rpartial = { ...rnode, text: grems.slice(0, right.cursor.end).join('') };
            }
        }
    }

    if (!rnudge) neighbors.push({ path: right.path, hl: { type: 'full' } });
    const sorted = partitionNeighbors(neighbors, (id) => state.top.nodes[id], false);

    const allParents: Record<NodeID, true> = {};
    sorted.forEach(({ path }) => path.children.forEach((loc) => (allParents[loc] = true)));

    const nodes: Nodes = {};
    sorted.forEach(({ path, children: selected }) => {
        const node = state.top.nodes[lastChild(path)];
        if (node.type !== 'list') {
            console.warn(`not handling ${node.type} well`);
            return;
        }
        const children = node.children.filter((c) => selected.includes(c) || allParents[c]);
        nodes[node.loc] = { ...node, children };
        selected.forEach((sel) => copyDeep(sel, state.top, nodes));
    });

    if (!lnudge) {
        const lloc = lastChild(left.path);
        const lnode = state.top.nodes[lloc];
        if (lnode.type === 'id' && left.cursor.type === 'id' && left.cursor.end !== 0) {
            const text = splitGraphemes(lnode.text).slice(left.cursor.end).join('');
            nodes[lloc] = { type: 'id', text, loc: lloc, ccls: lnode.ccls };
        }
    }
    if (rpartial) {
        nodes[rpartial.loc] = rpartial;
    }

    const rootLoc = lastChild(sorted[sorted.length - 1].path);

    const up: Update = { nodes, root: rootLoc };
    rebalanceSmooshed(up, state.top);
    joinSmooshed(up, state.top);
    disolveSmooshed(up, state.top);

    const tree = root<NodeID>({ top: { ...state.top, nodes: updateNodes(state.top.nodes, up.nodes), root: up.root! } });
    return { tree, single: left.key === right.key };
};

export const partitionNeighbors = (items: Neighbor[], getNode: (id: string) => Node, noSmoosh = true) => {
    const byParent: Record<string, { path: Path; children: NodeID[] }> = {};
    items.forEach((item) => {
        if (item.hl.type === 'full') {
            let path = item.path;
            while (path.children.length > 1) {
                const pnode = getNode(parentLoc(path));
                if (pnode.type === 'list' && (!noSmoosh || (pnode.kind !== 'smooshed' && pnode.kind !== 'spaced'))) {
                    break;
                }
                path = parentPath(path);
            }
            if (path.children.length < 2) return;
            const ppath = parentPath(path);
            const k = pathKey(ppath);
            if (!byParent[k]) {
                byParent[k] = { path: ppath, children: [lastChild(path)] };
            } else if (!byParent[k].children.includes(lastChild(path))) {
                byParent[k].children.push(lastChild(path));
            }
        }
    });
    return Object.values(byParent).sort((a, b) => b.path.children.length - a.path.children.length);
};
