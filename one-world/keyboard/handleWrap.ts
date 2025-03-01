import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { List, ListKind, Node, NodeID, Nodes } from '../shared/cnodes';
import { findParent } from './flatenate';
import { selectStart } from './handleNav';
import { SelStart } from './handleShiftNav';
import { handleTextText } from './handleTextText';
import { KeyAction, moveA } from './keyActionToUpdate';
import { replaceAt } from './replaceAt';
import { flatten, flatToUpdateNew } from './rough';
import { getCurrent } from './selections';
import { TestState } from './test-utils';
import { Cursor, lastChild, parentPath, Path, pathWithChildren, selStart, Top, Update } from './utils';

export const wrapKind = (key: string): ListKind<any> | void => {
    switch (key) {
        case '(':
            return 'round';
        case '{':
            return 'curly';
        case '[':
            return 'square';
        // case '<':
        //     return 'angle';
    }
};

export const closerKind = (key: string): ListKind<NodeID> | void => {
    switch (key) {
        case ')':
            return 'round';
        case '}':
            return 'curly';
        case ']':
            return 'square';
        // case '<':
        //     return 'angle';
    }
};

export const handleInsertList = (top: Top, path: Path, pos: 'before' | 'after' | number, kind: ListKind<any>): Update | void => {
    const node = top.nodes[lastChild(path)];
    if (typeof pos === 'number') {
        if (node.type === 'id') {
            return handleIdWrap(top, path, pos, pos, kind);
        }
        // 'inside'
        if (node.type === 'list' || node.type === 'table') {
            return {
                nodes: {
                    [top.nextLoc + '']: { type: 'list', kind, children: [], loc: top.nextLoc + '' },
                    [node.loc]: node.type === 'list' ? { ...node, children: [top.nextLoc + ''] } : { ...node, rows: [[top.nextLoc + '']] },
                },
                selection: { start: selStart(pathWithChildren(path, top.nextLoc + ''), { type: 'list', where: 'inside' }) },
                nextLoc: top.nextLoc + 1,
            };
        }
    }

    let nextLoc = top.nextLoc;
    const loc = nextLoc++ + '';
    const parent = findParent(0, parentPath(path), top);
    const flat = parent ? flatten(parent.node, top) : [node];
    const nlist: List<NodeID> = { type: 'list', children: [], kind, loc };
    const nodes: Nodes = { [loc]: nlist };
    let sel: Node = nlist;
    let ncursor: Cursor = { type: 'list', where: 'inside' };

    let at = flat.indexOf(node);

    flat.splice(pos === 'after' ? at + 1 : at, 0, nlist);

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
        nodes,
        { ...top, nextLoc },
    );
};

export const handleIdWrap = (top: Top, path: Path, left: number, right: number, kind: ListKind<NodeID>): Update | void => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'id') return;
    const text = splitGraphemes(node.text);
    // Wrap the whole thing
    if (left === 0 && right === text.length) {
        return wrapNode(top, path, node, kind);
    }

    const first = text.slice(0, left);
    const mid = text.slice(left, right);
    const end = text.slice(right);

    // in the middle or the end
    let nextLoc = top.nextLoc;
    const loc = nextLoc++ + '';
    const parent = findParent(0, parentPath(path), top);
    const flat = parent ? flatten(parent.node, top) : [node];
    const nlist: List<NodeID> = { type: 'list', children: [], kind, loc };
    const nodes: Nodes = { [loc]: nlist };
    let sel: Node = nlist;
    let ncursor: Cursor = { type: 'list', where: 'inside' };
    if (mid.length) {
        if (left > 0) {
            const rid = nextLoc++ + '';
            nodes[rid] = { type: 'id', text: mid.join(''), loc: rid, ccls: node.ccls };
            nlist.children.push(rid);
        } else {
            nodes[node.loc] = { ...node, text: mid.join('') };
            nlist.children.push(node.loc);
        }
        // sel = nodes[rid];
        // ncursor = { type: 'id', end: 0 };
        ncursor = { type: 'list', where: 'before' };
    }

    let at = flat.indexOf(node);
    if (left > 0) {
        flat[at] = nodes[node.loc] = { ...node, text: first.join('') };
    }

    flat.splice(at + 1, 0, nlist);

    if (end.length) {
        const eid = nextLoc++ + '';
        nodes[eid] = { type: 'id', text: end.join(''), loc: eid, ccls: node.ccls };
        flat.splice(at + 2, 0, nodes[eid]);
    }

    if (left === 0) {
        flat.splice(at, 1);
    }

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
        nodes,
        {
            ...top,
            nextLoc,
        },
    );
};

const findListParent = (kind: ListKind<NodeID>, path: Path, top: Top) => {
    for (let i = path.children.length - 1; i >= 0; i--) {
        const node = top.nodes[path.children[i]];
        if (node.type === 'list' && node.kind === kind) {
            return { path: { ...path, children: path.children.slice(0, i + 1) }, node };
        }
    }
};

const findCurlyClose = (path: Path, top: Top, notListTop: boolean): SelStart | void => {
    for (let i = path.children.length - 1; i >= 0; i--) {
        const node = top.nodes[path.children[i]];
        // console.log('at', i, node.loc, path);
        if (node.type === 'list' && node.kind === 'curly' && (!notListTop || i < path.children.length - 1)) {
            return selStart({ ...path, children: path.children.slice(0, i + 1) }, { type: 'list', where: 'after' });
        }
        if (node.type === 'text' && i < path.children.length - 1) {
            const inner = path.children[i + 1];
            const at = node.spans.findIndex((s) => s.type === 'embed' && s.item === inner)!;
            return selStart(
                { ...path, children: path.children.slice(0, i + 1) },
                // at < node.spans.length - 1 ? node.spans[at + 1].loc : node.spans[at].loc
                { type: 'text', end: { index: at, cursor: 1 } },
            );
        }
    }
};

export const handleClose = (state: TestState, key: string): KeyAction[] | void => {
    const current = getCurrent(state.sel, state.top);
    if (current.type === 'text' && current.cursor.type === 'text') {
        return handleTextText(current.cursor, undefined, current.node, key, current.path, state.top);
    }
    const kind = closerKind(key);
    if (!kind) return;
    const { path, cursor } = current;
    // soooo there's a special case, for text curly
    if (kind === 'curly') {
        const sel = findCurlyClose(path, state.top, cursor.type === 'list' && cursor.where !== 'inside');
        return moveA(sel);
    }
    const parent = findListParent(kind, cursor.type === 'list' && cursor.where !== 'inside' ? parentPath(path) : path, state.top);
    if (!parent) return;
    return moveA(selStart(parent.path, { type: 'list', where: 'after' }));
};

const wrapParent = (one: SelStart, two: SelStart, top: Top): void | { path: Path; min: number; max: number } => {
    if (one.path.children[0] !== two.path.children[0]) return;

    for (let i = 1; i < one.path.children.length && i < two.path.children.length; i++) {
        if (one.path.children[i] !== two.path.children[i]) {
            const node = top.nodes[one.path.children[i - 1]];
            if (node.type !== 'list') return;
            const a1 = node.children.indexOf(one.path.children[i]);
            const a2 = node.children.indexOf(two.path.children[i]);
            if (a1 === -1 || a2 === -1) return;
            return { path: { ...one.path, children: one.path.children.slice(0, i) }, min: Math.min(a1, a2), max: Math.max(a1, a2) };
        }
    }
    if (one.path.children.length === two.path.children.length) return; // same path??
    const [outer, inner] = one.path.children.length < two.path.children.length ? [one, two] : [two, one];

    const node = top.nodes[lastChild(outer.path)];
    if (node.type !== 'list') return;
    const at = node.children.indexOf(inner.path.children[outer.path.children.length]);
    if (at === -1) return;
    if (outer.cursor.type !== 'list' || outer.cursor.where === 'inside') return;
    const left = outer.cursor.where === 'before' || outer.cursor.where === 'start';
    return { path: outer.path, min: left ? 0 : at, max: left ? at : node.children.length - 1 };
};

export const wrapUpdate = (top: Top, path: Path, min: number, max: number, kind: ListKind<any>): Update | void => {
    let nextLoc = top.nextLoc;
    const nodes: Nodes = {};
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'list') return;
    const children = node.children.slice();
    const loc = nextLoc++ + '';

    const taken = children.splice(min, max - min + 1, loc);
    nodes[node.loc] = { ...node, children };

    let start: SelStart;
    if (node.kind === 'spaced' || node.kind === 'smooshed') {
        const inner = nextLoc++ + '';
        nodes[loc] = { type: 'list', kind, children: [inner], loc };
        nodes[inner] = { type: 'list', kind: node.kind, children: taken, loc: inner };
        const got = selectStart(pathWithChildren(path, loc, inner, taken[0]), top);
        if (!got) return;
        start = got;
    } else {
        nodes[loc] = { type: 'list', kind, children: taken, loc };
        const got = selectStart(pathWithChildren(path, loc, taken[0]), { ...top, nodes: { ...top.nodes, ...nodes } });
        if (!got) return;
        start = got;
    }

    return { nodes, selection: { start }, nextLoc };
};

export const handleWraps = (state: TestState, kind: ListKind<any>): KeyAction[] | void => {
    const found = wrapParent(state.sel.start, state.sel.end!, state.top);
    if (!found) return;

    return [{ type: 'wrap', path: found.path, min: found.min, max: found.max, kind }];
};

// export const handleWrapsTooMuch = (state: TestState, kind: ListKind<any>): Update => {
//     const [left, neighbors, right, _] = collectSelectedNodes(state.sel.start, state.sel.end!, state.top);
//     neighbors.push({ path: left.path, hl: { type: 'full' } });
//     neighbors.push({ path: right.path, hl: { type: 'full' } });
//     const sorted = partitionNeighbors(neighbors, state.top);

//     let nextLoc = state.top.nextLoc;
//     let sel: SelStart | null = null;
//     const nodes: Nodes = {};
//     sorted.forEach(({ path, children: selected }) => {
//         const node = state.top.nodes[lastChild(path)];
//         if (node.type !== 'list') return;
//         const children = node.children.slice();
//         const idxs = selected.map((s) => children.indexOf(s)).sort();
//         if (idxs[0] === -1) return;
//         const min = idxs[0];
//         const max = idxs[idxs.length - 1];
//         const loc = nextLoc++ + '';

//         const taken = children.splice(min, max - min + 1, loc);
//         nodes[node.loc] = { ...node, children };
//         nodes[loc] = { type: 'list', kind, children: taken, loc };
//         const got = selectStart(pathWithChildren(path, loc, taken[0]), state.top);
//         if (got) sel = got;
//     });
//     console.log(sorted);
//     return { nodes, selection: sel ? { start: sel } : undefined, nextLoc };
// };

export const handleWrap = (state: TestState, key: string): KeyAction[] | void => {
    if (state.sel.end) {
        const kind = wrapKind(key);
        if (!kind) return;
        if (state.sel.start.key === state.sel.end.key && state.sel.start.cursor.type === 'id' && state.sel.end.cursor.type === 'id') {
            const node = state.top.nodes[lastChild(state.sel.start.path)];
            if (node.type === 'id') {
                const [start, end] = [state.sel.start.cursor.end, state.sel.end.cursor.end];
                const [left, right] = start < end ? [start, end] : [end, start];
                return [{ type: 'id-wrap', left, right, path: state.sel.start.path, kind }];
            }
        }
        return handleWraps(state, kind);
    }

    const current = getCurrent(state.sel, state.top);
    if (current.type === 'text') {
        if (current.cursor.type === 'text') {
            return handleTextText(current.cursor, undefined, current.node, key, current.path, state.top);
        }
        if (current.cursor.type === 'list' && current.cursor.where === 'inside') {
            return [{ type: 'add-span', path: current.path, index: 0, cursor: 1, span: { type: 'text', text: key, loc: '' } }];
        }
    }
    const kind = wrapKind(key);
    if (!kind) return;
    switch (current.type) {
        case 'id':
            const pos = current.cursor.end;
            return [{ type: 'insert-list', pos, path: current.path, kind }];
        case 'list':
            if (current.cursor.type === 'control') return;
            return [
                {
                    type: 'insert-list',
                    pos: current.cursor.where === 'inside' ? 0 : current.cursor.where === 'after' ? 'after' : 'before',
                    path: current.path,
                    kind,
                },
            ];
    }
};

export function wrapNode(top: Top, path: Path, node: Node, kind: ListKind<NodeID>) {
    let nextLoc = top.nextLoc;
    const loc = nextLoc++ + '';
    const up = replaceAt(path.children.slice(0, -1), top, node.loc, loc);
    up.nextLoc = nextLoc;
    up.nodes[loc] = { type: 'list', kind, children: [node.loc], loc };
    up.selection = { start: selStart(pathWithChildren(parentPath(path), loc, node.loc), { type: 'id', end: 0 }) };
    return up;
}
