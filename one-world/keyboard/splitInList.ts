import { Id } from '../shared/cnodes';
import { addBlankAfter } from './addBlankAfter';
import {
    IdCursor,
    Path,
    Top,
    Update,
    splitOnCursor,
    parentLoc,
    gparentLoc,
} from './lisp';
import { replaceWithListItems } from './replaceWithListItems';

export function splitInList(
    id: Id<number>,
    cursor: IdCursor,
    path: Path,
    top: Top,
): Update | void {
    const [left, mid, right] = splitOnCursor(id, cursor);

    if (path.children.length === 1) throw new Error('catn split top yet');

    if (!right.length) {
        return addBlankAfter(id.loc, path, top);
    }
    if (!left.length) {
        // return addBlankBefore(id, path, top);
        throw new Error('blank before');
    }

    const ploc = parentLoc(path);
    const pnode = top.nodes[ploc];
    if (pnode.type === 'list' && pnode.kind === 'smooshed') {
        // need to go up one more level
        // NOTE it should be impossible to get into a double-smooshed situation
        if (path.children.length < 3) throw new Error('neet to split top');
        const gloc = gparentLoc(path);
        const gnode = top.nodes[gloc];
        if (gnode.type === 'list' && gnode.kind === 'smooshed') {
            throw new Error('double smoosked');
        }
        const pat = pnode.children.indexOf(id.loc);
        if (pat === -1) throw new Error('not in parent');
        const cleft = pnode.children.slice(0, pat + 1);
        const cright = pnode.children.slice(pat + 1);
        let nextLoc = top.nextLoc;
        const rloc = nextLoc++;
        cright.unshift(rloc);

        const nodes: Update['nodes'] = {
            [id.loc]: { ...id, text: left.join('') },
            [rloc]: { type: 'id', text: right.join(''), loc: rloc },
        };

        const replace: number[] = [];
        if (cleft.length === 1) {
            replace.push(id.loc);
            nodes[pnode.loc] = null;
        } else {
            replace.push(ploc);
            nodes[pnode.loc] = { ...pnode, children: cleft };
        }

        if (cright.length > 1) {
            if (cleft.length === 1) {
                nodes[pnode.loc] = { ...pnode, children: cright };
                replace.push(ploc);
            } else {
                const rploc = nextLoc++;
                nodes[rploc] = {
                    type: 'list',
                    kind: 'smooshed',
                    children: cright,
                    loc: rploc,
                };
                replace.push(rploc);
            }
        } else {
            replace.push(rloc);
        }

        return {
            nodes: {
                ...nodes,
                ...replaceWithListItems(
                    path.children.slice(0, -1),
                    { ...top, nextLoc: top.nextLoc },
                    ploc,
                    replace,
                ),
            },
            nextLoc,
        };
    }

    // // a|b -> a b
    // // a()|b -> a() b
    // for (let i = path.length - 1; i >= 0; i--) {
    //     const pnode = top.nodes[path[i]];
    //     if (pnode.type === 'text') {
    //         throw new Error('not impl, need to wrap in () prolly?');
    //     }
    //     if (pnode.type === 'list' && pnode.kind !== 'smooshed') {
    //         // bingo
    //     }
    // }
    // throw new Error('um split bad idk');
    let nextLoc = top.nextLoc;
    const rLoc = nextLoc++;
    return {
        nodes: {
            ...replaceWithListItems(path.children, top, id.loc, [id.loc, rLoc]),
            [rLoc]: { type: 'id', text: right.join(''), loc: rLoc },
            [id.loc]: { ...id, text: left.join('') },
        },
        nextLoc,
    };
}
