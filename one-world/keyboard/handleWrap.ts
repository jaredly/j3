import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { change } from '../../web/ide/infer/mini/union_find';
import { Collection, Id, List, ListKind, Node, Nodes } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { findParent } from './flatenate';
import { justSel, selectStart, spanStart } from './handleNav';
import { multiSelChildren, SelStart } from './handleShiftNav';
import { handleTextText } from './handleTextText';
import { replaceAt } from './replaceAt';
import { flatten, flatToUpdateNew } from './rough';
import { TestState } from './test-utils';
import {
    CollectionCursor,
    Current,
    Cursor,
    IdCursor,
    lastChild,
    ListCursor,
    parentPath,
    Path,
    pathWithChildren,
    selStart,
    Top,
    Update,
} from './utils';
import { getCurrent } from './selections';
import { idText } from './cursorSplit';

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

export const closerKind = (key: string): ListKind<number> | void => {
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

export const handleListWrap = (top: Top, path: Path, node: Collection<number>, cursor: CollectionCursor, kind: ListKind<number>): Update | void => {
    if (cursor.type !== 'list') throw new Error('not');
    if (cursor.where === 'inside') {
        return {
            nodes: {
                [top.nextLoc]: { type: 'list', kind, children: [], loc: top.nextLoc },
                [node.loc]: node.type === 'list' ? { ...node, children: [top.nextLoc] } : { ...node, rows: [[top.nextLoc]] },
            },
            selection: { start: selStart(pathWithChildren(path, top.nextLoc), { type: 'list', where: 'inside' }) },
            nextLoc: top.nextLoc + 1,
        };
    }
    if (cursor.where !== 'after') {
        console.log(cursor);
        throw new Error('cant wrap a list from ' + cursor.where);
    }

    let nextLoc = top.nextLoc;
    const loc = nextLoc++;
    const parent = findParent(0, parentPath(path), top);
    const flat = parent ? flatten(parent.node, top) : [node];
    const nlist: List<number> = { type: 'list', children: [], kind, loc };
    const nodes: Nodes = { [loc]: nlist };
    let sel: Node = nlist;
    let ncursor: Cursor = { type: 'list', where: 'inside' };

    let at = flat.indexOf(node);
    // for (; at < flat.length - 1 && flat[at + 1].type === 'smoosh'; at++); // skip smooshes

    flat.splice(at + 1, 0, nlist);

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
        nodes,
        { ...top, nextLoc },
    );
};

export const handleIdWrap = (top: Top, current: Extract<Current, { type: 'id' }>, kind: ListKind<number>): Update | void => {
    const { left, right } = cursorSides(current.cursor, current.start);
    const text = idText(top.tmpText, current.cursor, current.node);
    // Wrap the whole thing
    if (left === 0 && right === text.length) {
        return wrapNode(top, current.path, current.node, kind);
    }
    const { path, node } = current;
    const first = text.slice(0, left);
    const mid = text.slice(left, right);
    const end = text.slice(right);

    // in the middle or the end
    let nextLoc = top.nextLoc;
    const loc = nextLoc++;
    const parent = findParent(0, parentPath(path), top);
    const flat = parent ? flatten(parent.node, top) : [node];
    const nlist: List<number> = { type: 'list', children: [], kind, loc };
    const nodes: Nodes = { [loc]: nlist };
    let sel: Node = nlist;
    let ncursor: Cursor = { type: 'list', where: 'inside' };
    if (mid.length) {
        if (left > 0) {
            const rid = nextLoc++;
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
    // honestly not sure what this was abount
    // for (; at < flat.length - 1 && flat[at + 1].type === 'smoosh'; at++); // skip smooshes

    // If we're at the end of the ID but not the end of the smoosh, we wrap the next thing
    // if (at < flat.length - 1 && left === text.length) {
    //     const next = flat[at + 1];
    //     if (next.type !== 'sep' && next.type !== 'space' && next.type !== 'smoosh') {
    //         return wrapNode(top, pathWithChildren(parentPath(path), next.loc), next, kind);
    //     }
    // }
    flat.splice(at + 1, 0, nlist);

    if (end.length) {
        const eid = nextLoc++;
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

const findListParent = (kind: ListKind<number>, path: Path, top: Top) => {
    for (let i = path.children.length - 1; i >= 0; i--) {
        const node = top.nodes[path.children[i]];
        if (node.type === 'list' && node.kind === kind) {
            return { path: { ...path, children: path.children.slice(0, i + 1) }, node };
        }
    }
};

const findCurlyClose = (path: Path, top: Top): SelStart | void => {
    for (let i = path.children.length - 1; i >= 0; i--) {
        const node = top.nodes[path.children[i]];
        if (node.type === 'list' && node.kind === 'curly') {
            return selStart({ ...path, children: path.children.slice(0, i + 1) }, { type: 'list', where: 'after' });
        }
        if (node.type === 'text' && i < path.children.length - 1) {
            const inner = path.children[i + 1];
            const at = node.spans.findIndex((s) => s.type === 'embed' && s.item === inner);
            return selStart({ ...path, children: path.children.slice(0, i + 1) }, { type: 'text', end: { index: at, cursor: 1 } });
        }
    }
};

export const handleClose = (state: TestState, key: string): Update | void => {
    const current = getCurrent(state.sel, state.top);
    if (current.type === 'text' && current.cursor.type === 'text') {
        return handleTextText(current.cursor, undefined, current.node, key, current.path, state.top);
    }
    const kind = closerKind(key);
    if (!kind) return;
    const { path, cursor } = current;
    // soooo there's a special case, for text curly
    if (kind === 'curly') {
        const sel = findCurlyClose(cursor.type === 'list' && cursor.where !== 'inside' ? parentPath(path) : path, state.top);
        return sel ? { nodes: {}, selection: { start: sel } } : sel;
    }
    const parent = findListParent(kind, cursor.type === 'list' && cursor.where !== 'inside' ? parentPath(path) : path, state.top);
    if (!parent) return;
    return justSel(parent.path, { type: 'list', where: 'after' });
};

// const handleWrapMulti = (state: TestState, key: string): Update | void => {
//     const kind = wrapKind(key);
//     if (!kind) return;
//     const multi = multiSelChildren(state.sel, state.top);
//     if (!multi) return;
//     const parent = state.top.nodes[lastChild(multi.parent)];
//     if (parent.type !== 'list') {
//         return; // sorry not yet
//     }
//     const first = parent.children.indexOf(multi.children[0]);
//     const last = parent.children.indexOf(multi.children[multi.children.length - 1]);
//     if (first === -1 || last === -1) return;

//     // we actually want to wrap the smooshed / spaced
//     if (first === 0 && last === parent.children.length - 1 && (parent.kind === 'smooshed' || parent.kind === 'spaced')) {
//         const gpath = parentPath(multi.parent);
//         let nextLoc = state.top.nextLoc;
//         const loc = nextLoc++;
//         const up = replaceAt(gpath.children, state.top, parent.loc, loc);
//         up.nodes[loc] = { type: 'list', kind, children: [parent.loc], loc };
//         const start = selectStart(pathWithChildren(gpath, loc, parent.loc, multi.children[0]), state.top);
//         if (!start) return;
//         return { ...up, selection: { start }, nextLoc };
//     }

//     const children = parent.children.slice();
//     let nextLoc = state.top.nextLoc;
//     const loc = nextLoc++;
//     children.splice(first, last + 1 - first, loc);

//     let inner = multi.children;

//     const nodes: Nodes = { [parent.loc]: { ...parent, children } };

//     let sel: SelStart;

//     if ((parent.kind === 'smooshed' || parent.kind === 'spaced') && multi.children.length > 1) {
//         const wrap = nextLoc++;
//         nodes[wrap] = { ...parent, children: multi.children, loc: wrap };
//         inner = [wrap];
//         const start = selectStart(pathWithChildren(multi.parent, loc, wrap, multi.children[0]), state.top);
//         if (!start) return;
//         sel = start;
//     } else {
//         const start = selectStart(pathWithChildren(multi.parent, loc, multi.children[0]), state.top);
//         if (!start) return;
//         sel = start;
//     }

//     nodes[loc] = { type: 'list', kind, loc, children: inner };

//     return {
//         nodes,
//         selection: { start: sel },
//         nextLoc,
//     };
//     // we just do the thing
// };

export const handleWrap = (state: TestState, key: string): Update | void => {
    // if (state.sel.multi) {
    //     return handleWrapMulti(state, key);
    // }

    const current = getCurrent(state.sel, state.top);
    if (current.type === 'text') {
        if (current.cursor.type === 'text') {
            return handleTextText(current.cursor, undefined, current.node, key, current.path, state.top);
        }
        if (current.cursor.type === 'list' && current.cursor.where === 'inside') {
            return {
                nodes: { [current.node.loc]: { ...current.node, spans: [{ type: 'text', text: key }] } },
                selection: { start: { ...state.sel.start, cursor: { type: 'text', end: { index: 0, cursor: 1 } } } },
            };
        }
    }
    const kind = wrapKind(key);
    if (!kind) return;
    switch (current.type) {
        case 'id':
            return handleIdWrap(state.top, current, kind);
        case 'list':
            return handleListWrap(state.top, state.sel.start.path, current.node, current.cursor, kind);
        // case 'text':
        //     return handleTextWrap(state.top, state.sel.start.path, current.cursor, kind);
        default:
            throw new Error('not doing');
    }
};

export function wrapNode(top: Top, path: Path, node: Node, kind: ListKind<number>) {
    let nextLoc = top.nextLoc;
    const loc = nextLoc++;
    const up = replaceAt(path.children.slice(0, -1), top, node.loc, loc);
    up.nextLoc = nextLoc;
    up.nodes[loc] = { type: 'list', kind, children: [node.loc], loc };
    up.selection = { start: selStart(pathWithChildren(parentPath(path), loc, node.loc), { type: 'id', end: 0 }) };
    return up;
}
