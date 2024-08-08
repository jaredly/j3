import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import {
    Node,
    Nodes,
    parentPath,
    Path,
    PathRoot,
    pathWithChildren,
    serializePath,
} from '../nodes';
import { PersistedState } from '../state';
import { IR, IRCursor, IRSelection, nodeToIR } from './intermediate';
import { IRForLoc, LayoutCtx } from './layout';

export type IRCache = Record<
    string,
    {
        layouts: LayoutCtx['layouts'];
        irs: LayoutCtx['irs'];
        paths: Record<number, number[]>;
        root: PathRoot;
    }
>;

type IRText = Extract<IR, { type: 'text' }>;

export const irTexts = (ir: IR): IRText[] => {
    switch (ir.type) {
        case 'text':
            return [ir];
        case 'horiz':
        case 'vert':
        case 'inline':
            return ir.items.flatMap(irTexts);
        case 'indent':
        case 'squish':
            return irTexts(ir.item);
        case 'switch':
            return irTexts(ir.options[0]);
    }
    return [];
};

type IRNavigable = Extract<
    IR,
    | { type: 'loc' }
    | { type: 'text' }
    | { type: 'cursor' }
    | { type: 'control' }
>;

export const irNavigable = (ir: IR): IRNavigable[] => {
    switch (ir.type) {
        case 'text':
        case 'loc':
        case 'control':
        case 'cursor':
            return [ir];
        case 'horiz':
        case 'vert':
        case 'inline':
            return ir.items.flatMap(irNavigable);
        case 'indent':
        case 'squish':
            return irNavigable(ir.item);
        case 'switch':
            // THIS RELIES on the navigable items being
            // identical between options of the switch.
            return irNavigable(ir.options[0]);
        case 'punct':
            return [];
    }
    return [];
};

export const modTextSel = (
    sel: IRSelection,
    cache: IRCache,
    f: (
        text: IRText,
        sel: Extract<IRCursor, { type: 'text' }>,
    ) => IRSelection | void,
): IRSelection | void => {
    if (sel.start.cursor.type === 'text') {
        const path = sel.start.path;
        const ir =
            cache[path.root.toplevel].irs[
                path.children[path.children.length - 1]
            ];
        const texts = irTexts(ir);
        const text = texts[sel.start.cursor.end.index];
        if (!text) return console.warn('text w/ index does not exit');
        return f(text, sel.start.cursor);
    }
};

export const parentLoc = (path: Path) =>
    path.children[path.children.length - 2];

export const lastChild = (path: Path) =>
    path.children[path.children.length - 1];

export const findType = <T extends string>(
    irs: IR[],
    type: T,
    index: number,
): Extract<IR, { type: T }> | void => {
    let at = 0;
    for (let ir of irs) {
        if (ir.type === type) {
            if (at === index) {
                return ir as Extract<IR, { type: T }>;
            }
            at++;
        }
    }
};

// const focusedIR = (irRoot: IR, cursor: IRCursor): IR | void => {
//     const irs = irNavigable(irRoot);
//     switch (cursor.type) {
//         case 'text':
//             return findType(irs, 'text', cursor.end.index);
//         case 'control':
//             return findType(irs, 'control', cursor.index);
//         case 'side':
//             for (let ir of irs) {
//                 if (ir.type === 'cursor' && ir.side === cursor.side) {
//                     return ir;
//                 }
//             }
//     }
// };

export const goLeftRight = (
    sel: IRSelection,
    cache: IRCache,
    left: boolean,
    shift: boolean,
    state: PersistedState,
): IRSelection | void => {
    const res = goLeftRightInner(sel, cache, left, shift);
    if (res) return res;
    let { path } = sel.start;
    while (path.children.length > 1) {
        const last = lastChild(path);
        const parent = path.children[path.children.length - 2];
        const ir = cache[path.root.toplevel].irs[parent];
        const navs = irNavigable(ir);
        const self = navs.find(
            (r) => r.type === 'loc' && lastChild(r.path) === last,
        );
        if (self) {
            const res = goLRFrom(
                navs,
                self,
                parentPath(path),
                cache[path.root.toplevel].irs,
                left,
            );
            if (res) {
                return res;
            }
        } else {
            return;
        }
        path = parentPath(path);
    }

    return goFromDocNode(state, path, left, cache);
};

export const goFromDocNode = (
    state: PersistedState,
    path: Path,
    left: boolean,
    cache: IRCache,
) => {
    const doc = state.documents[path.root.doc];
    if (!left) {
        const last = path.root.ids[path.root.ids.length - 1];
        const node = doc.nodes[last];
        if (node.children.length) {
            const child = doc.nodes[node.children[0]];
            return selectNode(
                {
                    root: {
                        type: 'doc-node',
                        doc: doc.id,
                        ids: path.root.ids.concat([child.id]),
                        toplevel: child.toplevel,
                    },
                    children: [state.toplevels[child.toplevel].root],
                },
                'start',
                cache[child.toplevel].irs,
            );
        }
    }
    for (let i = path.root.ids.length - 2; i >= 0; i--) {
        const pid = path.root.ids[i];
        const nid = path.root.ids[i + 1];
        const parent = doc.nodes[pid];
        const idx = parent.children.indexOf(nid);
        if (idx === -1) return;
        if (idx === 0 && left) {
            if (i === 0) return;
            return selectNode(
                {
                    root: {
                        type: 'doc-node',
                        doc: doc.id,
                        ids: path.root.ids.slice(0, i + 1),
                        toplevel: parent.toplevel,
                    },
                    children: [state.toplevels[parent.toplevel].root],
                },
                'end',
                cache[parent.toplevel].irs,
            );
        }
        if (!left && idx === parent.children.length - 1) continue;
        const sid = parent.children[idx + (left ? -1 : 1)];
        let ids = path.root.ids.slice(0, i + 1).concat(sid);
        let sib = doc.nodes[sid];
        if (left) {
            while (sib.children.length) {
                sib = doc.nodes[sib.children[sib.children.length - 1]];
                ids.push(sib.id);
            }
        }
        return selectNode(
            {
                root: {
                    type: 'doc-node',
                    doc: doc.id,
                    ids,
                    toplevel: sib.toplevel,
                },
                children: [state.toplevels[sib.toplevel].root],
            },
            left ? 'end' : 'start',
            cache[sib.toplevel].irs,
        );
    }
};

export const goLeftRightInner = (
    sel: IRSelection,
    cache: IRCache,
    left: boolean,
    shift: boolean,
): IRSelection | void => {
    if (sel.end) {
        if (shift) return;
        return selectNode(
            sel.end.path,
            left ? 'start' : 'end',
            cache[sel.end.path.root.toplevel].irs,
        );
        // return { start: sel.start };
    }
    const { path, cursor } = sel.start;
    const irRoot = cache[path.root.toplevel].irs[lastChild(path)];
    const irs = irNavigable(irRoot);
    let selected: IR;

    switch (cursor.type) {
        case 'text': {
            const text = findType(irs, 'text', cursor.end.index);
            if (!text) return;
            selected = text;
            if (
                cursor.start &&
                !shift &&
                (cursor.start.index !== cursor.end.index ||
                    cursor.start.cursor !== cursor.end.cursor)
            ) {
                return {
                    start: {
                        ...sel.start,
                        cursor: { ...cursor, start: undefined },
                    },
                };
            }
            const next = cursor.end.cursor + (left ? -1 : 1);
            if (next >= 0 && next <= splitGraphemes(text.text).length) {
                return {
                    start: {
                        ...sel.start,
                        cursor: {
                            ...cursor,
                            end: { ...cursor.end, cursor: next },
                            start: shift
                                ? cursor.start ?? cursor.end
                                : undefined,
                        },
                    },
                };
            }
            // otherwise, fall through to
            break;
        }
        case 'control':
            const control = findType(irs, 'control', cursor.index);
            if (!control) return;
            selected = control;
            break;
        case 'side':
            const side = findCursor(irs, cursor);
            if (!side) return;
            selected = side;
            break;
    }

    return goLRFrom(irs, selected, path, cache[path.root.toplevel].irs, left);
};

const goLRFrom = (
    irs: IRNavigable[],
    selected: IRNavigable,
    path: Path,
    cache: IRForLoc,
    left: boolean,
): IRSelection | void => {
    const idx = irs.indexOf(selected);
    const nidx = idx + (left ? -1 : 1);
    if (nidx < 0 || nidx >= irs.length) {
        return;
    }
    const { cursor, path: cpath } = cursorSelect(
        irs[nidx],
        path,
        irs,
        cache,
        left,
    );
    return {
        start: {
            path: cpath,
            key: serializePath(cpath),
            cursor,
        },
    };
};

// This won't have the right styling or things, but we're just using it for
// calculating cursor position
const getSimpleIR = (node: Node) => {
    return nodeToIR(
        node,
        {
            root: { type: 'doc-node', doc: '', ids: [], toplevel: '' },
            children: [],
        },
        {},
        {},
        {},
    );
};

export const cursorForNodeNoIR = (
    parents: number[],
    side: 'start' | 'end',
    nodes: Nodes,
) => {
    const node = nodes[parents[parents.length - 1]];
    const irs = irNavigable(getSimpleIR(node));
    return cursorSelect2(
        irs[side === 'start' ? 0 : irs.length - 1],
        parents,
        irs,
        (loc) => getSimpleIR(nodes[loc]),
        side === 'end',
    );
};

export const cursorForNode = (
    parents: number[],
    side: 'start' | 'end',
    cache: IRForLoc,
) => {
    const irs = irNavigable(cache[parents[parents.length - 1]]);
    return cursorSelect2(
        irs[side === 'start' ? 0 : irs.length - 1],
        parents,
        irs,
        (loc) => cache[loc],
        side === 'end',
    );
};

export const selectNode = (
    // loc: number,
    path: Path,
    side: 'start' | 'end',
    cache: IRForLoc,
) => {
    const irs = irNavigable(cache[lastChild(path)]);
    return toSelection(
        cursorSelect(
            irs[side === 'start' ? 0 : irs.length - 1],
            path,
            irs,
            cache,
            side === 'end',
        ),
    );
};

export const toSelection = ({
    cursor,
    path,
}: {
    cursor: IRCursor;
    path: Path;
}): IRSelection => ({
    start: {
        path,
        key: serializePath(path),
        cursor,
    },
});

export const cursorSelect2 = (
    ir: IRNavigable,
    children: number[],
    siblings: IRNavigable[],
    getIR: (loc: number) => IR,
    // cache: IRForLoc,
    end: boolean,
): { cursor: IRCursor; children: number[] } => {
    switch (ir.type) {
        case 'text':
            return {
                cursor: {
                    type: 'text',
                    end: {
                        index: siblings
                            .filter((r) => r.type === 'text')
                            .indexOf(ir),
                        cursor: end ? splitGraphemes(ir.text).length : 0,
                    },
                },
                children,
            };
        case 'control':
            return {
                cursor: {
                    type: 'control',
                    index: siblings
                        .filter((r) => r.type === 'control')
                        .indexOf(ir),
                },
                children,
            };
        case 'cursor':
            return { cursor: { type: 'side', side: ir.side }, children };
        case 'loc':
            const items = irNavigable(getIR(lastChild(ir.path)));
            return cursorSelect2(
                items[end ? items.length - 1 : 0],
                children.concat([lastChild(ir.path)]),
                items,
                getIR,
                end,
            );
    }
};

export const cursorSelect = (
    ir: IRNavigable,
    path: Path,
    siblings: IRNavigable[],
    cache: IRForLoc,
    end: boolean,
): { cursor: IRCursor; path: Path } => {
    const { cursor, children } = cursorSelect2(
        ir,
        [],
        siblings,
        (loc) => cache[loc],
        end,
    );
    return { cursor, path: pathWithChildren(path, ...children) };
};

function findCursor(
    irs: IR[],
    cursor: { type: 'side'; side: 'start' | 'inside' | 'end' },
) {
    for (let ir of irs) {
        if (ir.type === 'cursor' && ir.side === cursor.side) {
            return ir;
        }
    }
}
