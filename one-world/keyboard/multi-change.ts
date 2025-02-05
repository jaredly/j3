import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { childLocs, fromRec, Loc, Node, Nodes, RecNode, RecNodeT } from '../shared/cnodes';
import { applySelUp } from './applyUpdate';
import { rebalanceSmooshed, joinSmooshed, disolveSmooshed } from './handleDelete';
import { selectEnd, selectStart } from './handleNav';
import { replaceAt } from './replaceAt';
import { replaceIn } from './replaceIn';
import { root } from './root';
import { updateNodes } from './rough';
import { collectSelectedNodes, Neighbor } from './selections';
import { TestState } from './test-utils';
import {
    Path,
    Cursor,
    Top,
    lastChild,
    parentLoc,
    Update,
    selStart,
    NodeSelection,
    parentPath,
    pathKey,
    JustSelUpdate,
    pathWithChildren,
} from './utils';

export const shouldNudgeRight = (path: Path, cursor: Cursor, top: Top) => {
    const node = top.nodes[lastChild(path)];
    const pnode = top.nodes[parentLoc(path)];
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
export const shouldNudgeLeft = (path: Path, cursor: Cursor, top: Top) => {
    const node = top.nodes[lastChild(path)];
    const pnode = top.nodes[parentLoc(path)];
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

export const handleDeleteTooMuch = (state: TestState): JustSelUpdate | void => {
    const [left, neighbors, right, _] = collectSelectedNodes(state.sel.start, state.sel.end!, state.top);
    const lnudge = shouldNudgeRight(left.path, left.cursor, state.top);
    const rnudge = shouldNudgeLeft(right.path, right.cursor, state.top);
    if (!lnudge) neighbors.push({ path: left.path, hl: { type: 'full' } });
    let rpartial = null as null | Node;
    {
        const rnode = state.top.nodes[lastChild(right.path)];
        if (rnode.type === 'id' && right.cursor.type === 'id') {
            const grems = splitGraphemes(rnode.text);
            if (right.cursor.end < grems.length) {
                rpartial = { ...rnode, text: grems.slice(right.cursor.end).join('') };
            }
        }
    }
    if (!rnudge && rpartial == null) neighbors.push({ path: right.path, hl: { type: 'full' } });
    const sorted = partitionNeighbors(neighbors, state.top, false);
    const lloc = lastChild(left.path);

    const nodes: Nodes = {};
    sorted.forEach(({ path, children: selected }) => {
        const node = state.top.nodes[lastChild(path)];
        if (node.type !== 'list') return;
        const children = node.children.slice().filter((c) => !selected.includes(c) || lloc === c);
        nodes[node.loc] = { ...node, children };
    });

    let leftCursor = 0;
    if (!lnudge) {
        nodes[lloc] = { type: 'id', text: '', loc: lloc };
        const lnode = state.top.nodes[lloc];
        if (lnode.type === 'id' && left.cursor.type === 'id' && left.cursor.end !== 0) {
            const text = splitGraphemes(lnode.text).slice(0, left.cursor.end).join('');
            nodes[lloc] = { type: 'id', text, loc: lloc, ccls: lnode.ccls };
            leftCursor = left.cursor.end;
        }
    }
    if (rpartial) {
        nodes[rpartial.loc] = rpartial;
    }
    const sel = lnudge ? selectEnd(left.path, state.top) : selStart(left.path, { type: 'id', end: leftCursor });
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
                nextLoc = state.top.nextLoc;
                const loc = nextLoc++;
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
const copyDeep = (loc: number, top: Top, dest: Nodes) => {
    if (dest[loc]) return; // already handled
    dest[loc] = top.nodes[loc];
    childLocs(top.nodes[loc]).forEach((child) => copyDeep(child, top, dest));
};

export type CopiedValues = { tree: RecNodeT<number>; single: boolean };

export const handlePaste = (state: TestState, values: CopiedValues): void | Update => {
    let update: JustSelUpdate = { nodes: {} };
    if (state.sel.end) {
        const up = handleDeleteTooMuch(state);
        if (!up) return;
        update = up;
    }

    let nextLoc = state.top.nextLoc;

    const root = fromRec(values.tree, update.nodes, (l) => {
        if (l == null || l < 0 || update.nodes[l] || state.top.nodes[l]) {
            return nextLoc++;
        }
        return l;
    });

    const sel = update.selection ?? state.sel;

    // options include:
    // it's just an ID, and we're in an ID.
    const node = state.top.nodes[lastChild(sel.start.path)];
    if (node.type === 'id') {
        if (node.text === '') {
            const rootNode = update.nodes[root]!;
            const pnode = state.top.nodes[parentLoc(sel.start.path)];
            if (!values.single && rootNode.type === 'list' && pnode?.type === 'list' && rootNode.kind === pnode.kind) {
                const upnode = replaceIn(pnode, node.loc, ...rootNode.children);
                update.nodes[upnode.loc] = upnode;

                rebalanceSmooshed(update, state.top);
                joinSmooshed(update, state.top);
                disolveSmooshed(update, state.top);

                const stop = { ...state.top, nodes: updateNodes(state.top.nodes, update.nodes) };
                const selS = selectStart(pathWithChildren(parentPath(sel.start.path), rootNode.children[0]), stop);
                const selE = selectEnd(pathWithChildren(parentPath(sel.start.path), rootNode.children[rootNode.children.length - 1]), stop);
                if (selS && selE) {
                    return { ...update, selection: { start: selS, end: selE }, nextLoc };
                }
            }

            update.nodes[node.loc] = { ...rootNode!, loc: node.loc };
            delete update.nodes[root];

            const top = { ...state.top, nodes: updateNodes(state.top.nodes, update.nodes) };

            const st = selectStart(sel.start.path, top);
            const ed = selectEnd(sel.start.path, top);
            if (st && ed) {
                return { ...update, selection: { start: st, end: ed }, nextLoc };
            }
            return update;
        }

        if (values.tree.type === 'id' && sel.start.cursor.type === 'id') {
            const grems = splitGraphemes(node.text);
            const nws = splitGraphemes(values.tree.text);
            grems.splice(sel.start.cursor.end, 0, ...nws);
            return {
                nodes: { [node.loc]: { ...node, text: grems.join('') } },
                selection: {
                    start: selStart(sel.start.path, { type: 'id', end: sel.start.cursor.end }),
                    end: selStart(sel.start.path, { type: 'id', end: sel.start.cursor.end + nws.length }),
                },
            };
        }
    }

    // ah ok here's the story.
    // if we're in a blank ID, and it's a multi, then we splice
};

export const handleCopyMulti = (state: TestState): void | CopiedValues => {
    if (!state.sel.end) return;
    const [left, neighbors, right, _] = collectSelectedNodes(state.sel.start, state.sel.end!, state.top);
    const lnudge = shouldNudgeRight(left.path, left.cursor, state.top);
    const rnudge = shouldNudgeLeft(right.path, right.cursor, state.top);
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
    const sorted = partitionNeighbors(neighbors, state.top, false);

    const allParents: Record<number, true> = {};
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

    const tree = root<number>({ top: { ...state.top, nodes: updateNodes(state.top.nodes, up.nodes), root: up.root! } });
    return { tree, single: left.key === right.key };
};

export const partitionNeighbors = (items: Neighbor[], top: Top, noSmoosh = true) => {
    const byParent: Record<string, { path: Path; children: number[] }> = {};
    items.forEach((item) => {
        if (item.hl.type === 'full') {
            let path = item.path;
            while (path.children.length > 1) {
                const pnode = top.nodes[parentLoc(path)];
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
