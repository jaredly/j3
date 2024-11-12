import {
    Path,
    Top,
    Update,
    parentLoc,
    gparentLoc,
    parentPath,
    selStart,
    pathWithChildren,
} from './lisp';
import { replaceWithListItems } from './replaceWithListItems';

export const addBlankAfter = (
    loc: number,
    path: Path,
    top: Top,
): Update | void => {
    const ploc = parentLoc(path);
    const pnode = top.nodes[ploc];
    if (!pnode) return;
    if (pnode.type === 'list' && pnode.kind === 'smooshed') {
        if (path.children.length < 3) throw new Error('neet to split top');
        const gloc = gparentLoc(path);
        const gnode = top.nodes[gloc];
        if (gnode.type === 'list' && gnode.kind === 'smooshed') {
            throw new Error('double smoosked');
        }
        const pat = pnode.children.indexOf(loc);
        if (pat === -1) throw new Error('not in parent');
        if (pat === pnode.children.length - 1) {
            return addBlankAfter(ploc, parentPath(path), top);
        }
        const left = pnode.children.slice(0, pat + 1);
        const right = pnode.children.slice(pat);
        let nextLoc = top.nextLoc;
        const nodes: Update['nodes'] = {};
        const replace: number[] = [];

        if (left.length === 1) {
            if (right.length === 1) {
                nodes[ploc] = null;
                replace.push(left[0], right[0]);
            } else {
                nodes[ploc] = { ...pnode, children: right };
                replace.push(left[0], ploc);
            }
        } else {
            if (right.length === 1) {
                replace.push(ploc, right[0]);
            } else {
                const rloc = nextLoc++;
                nodes[rloc] = {
                    type: 'list',
                    kind: 'smooshed',
                    children: right,
                    loc: rloc,
                };
                replace.push(ploc, rloc);
            }
        }

        return {
            nodes: {
                ...nodes,
                ...replaceWithListItems(
                    parentPath(path).children,
                    top,
                    ploc,
                    replace,
                ),
            },
            nextLoc,
        };
    }

    let nextLoc = top.nextLoc;
    const nloc = nextLoc++;
    return {
        nodes: {
            [nloc]: { type: 'id', text: '', loc: nloc },
            ...replaceWithListItems(path.children, top, loc, [loc, nloc]),
        },
        nextLoc,
        selection: {
            start: selStart(pathWithChildren(parentPath(path), nloc), {
                type: 'id',
                end: 0,
            }),
        },
    };
};
