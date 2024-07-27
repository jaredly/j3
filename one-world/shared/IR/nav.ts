import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import {
    parentPath,
    Path,
    PathRoot,
    pathWithChildren,
    serializePath,
} from '../nodes';
import { IR, IRCursor, IRSelection } from './intermediate';
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
): IRSelection | void => {
    const res = goLeftRightInner(sel, cache, left);
    if (res) return res;
    let { path } = sel.start;
    while (path.children.length > 1) {
        const last = lastChild(path);
        const parent = path.children[path.children.length - 2];
        const ir = cache[path.root.toplevel].irs[parent];
        const navs = irNavigable(ir);
        const self = navs.find((r) => r.type === 'loc' && r.loc === last);
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
};

export const goLeftRightInner = (
    sel: IRSelection,
    cache: IRCache,
    left: boolean,
): IRSelection | void => {
    if (sel.end) {
        return { start: sel.start };
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
            if (cursor.start) {
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

export const selectNode = (
    loc: number,
    path: Path,
    side: 'start' | 'end',
    cache: IRForLoc,
) => {
    const irs = irNavigable(cache[loc]);
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

const toSelection = ({
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

export const cursorSelect = (
    ir: IRNavigable,
    path: Path,
    siblings: IRNavigable[],
    cache: IRForLoc,
    end: boolean,
): { cursor: IRCursor; path: Path } => {
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
                path,
            };
        case 'control':
            return {
                cursor: {
                    type: 'control',
                    index: siblings
                        .filter((r) => r.type === 'control')
                        .indexOf(ir),
                },
                path,
            };
        case 'cursor':
            return { cursor: { type: 'side', side: ir.side }, path };
        case 'loc':
            const items = irNavigable(cache[ir.loc]);
            return cursorSelect(
                items[end ? items.length - 1 : 0],
                pathWithChildren(path, ir.loc),
                items,
                cache,
                end,
            );
    }
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
