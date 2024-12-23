import { List } from '../shared/cnodes';
import { replaceWithListItems } from './replaceWithListItems';
import { Path, Top, Update, gparentLoc, parentLoc, parentPath, pathWithChildren, selStart } from './utils';

const splitMooth = (pnode: List<number>, loc: number, top: Top) => {
    const pat = pnode.children.indexOf(loc);
    if (pat === -1) throw new Error('not in parent');

    const left = pnode.children.slice(0, pat + 1);
    const right = pnode.children.slice(pat);
    let nextLoc = top.nextLoc;
    const nodes: Update['nodes'] = {};
    const replace: number[] = [];

    if (left.length === 1) {
        replace.push(left[0]);
        nodes[pnode.loc] = null;
    } else {
        replace.push(pnode.loc);
        nodes[pnode.loc] = { ...pnode, children: left };
    }

    if (right.length === 1) {
        replace.push(right[0]);
    } else {
        if (left.length === 1) {
            nodes[pnode.loc] = { ...pnode, children: right };
            replace.push(pnode.loc);
        } else {
            const rloc = nextLoc++;
            nodes[rloc] = {
                type: 'list',
                kind: 'smooshed',
                children: right,
                loc: rloc,
            };
            replace.push(rloc);
        }
    }

    return { replace, nextLoc, nodes };
};

export const addBlankAfter = (loc: number, path: Path, top: Top): Update | void => {
    const ploc = parentLoc(path);
    const pnode = top.nodes[ploc];
    if (!pnode) return;

    if (pnode.type === 'list' && pnode.kind === 'spaced') {
        if (path.children.length < 3) throw new Error('neet to split top');
        const gloc = gparentLoc(path);
        const gnode = top.nodes[gloc];
        if (gnode.type === 'list' && (gnode.kind === 'smooshed' || gnode.kind === 'spaced')) {
            throw new Error('double smoosked or spaced');
        }

        const pat = pnode.children.indexOf(loc);
        if (pat === -1) throw new Error('not in parent');
        if (pat === pnode.children.length - 1) {
            return addBlankAfter(ploc, parentPath(path), top);
        }

        const { nodes, replace, nextLoc } = splitMooth(pnode, loc, top);

        return {
            nodes: {
                ...nodes,
                ...replaceWithListItems(parentPath(path).children, top, ploc, replace),
            },
            nextLoc,
        };
    }

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

        const { nodes, replace, nextLoc } = splitMooth(pnode, loc, top);

        return {
            nodes: {
                ...nodes,
                ...replaceWithListItems(parentPath(path).children, top, ploc, replace),
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
