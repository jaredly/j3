import { Id, ListKind, Nodes } from '../shared/cnodes';
import {
    IdCursor,
    Path,
    Top,
    Update,
    splitOnCursor,
    replaceAt,
    withPartial,
    parentPath,
} from './lisp';
import { replaceWithSmooshed } from './replaceWithSmooshed';

export const wrapId = (
    id: Id<number>,
    kind: ListKind<number>,
    cursor: IdCursor,
    // includes the ID of the current node btw
    path: Path,
    top: Top,
): Update => {
    let [left, mid, right] = splitOnCursor(id, cursor);
    // If selecting to end, pretend it's just a cursor in the middle
    if (mid.length && !right.length) {
        right = mid;
        mid = [];
    }

    if (mid.length) {
        let nextLoc = top.nextLoc;
        const listLoc = nextLoc++;

        if (!right.length)
            throw new Error(
                `this should be treated as a normal split by splitOnCursor`,
            );

        if (left.length) {
            const midLoc = nextLoc++;
            const rightLoc = nextLoc++;
            const nodes: Nodes = {
                [listLoc]: {
                    type: 'list',
                    kind,
                    children: [midLoc],
                    loc: listLoc,
                },
                [id.loc]: { ...id, text: left.join('') },
                [midLoc]: { type: 'id', loc: midLoc, text: mid.join('') },
                [rightLoc]: { type: 'id', loc: rightLoc, text: right.join('') },
            };
            const update = replaceWithSmooshed(
                path,
                { ...top, nextLoc },
                id.loc,
                [id.loc, listLoc, rightLoc],
                { children: [listLoc, midLoc], cursor: { type: 'id', end: 0 } },
            );
            Object.assign(update.nodes, nodes);
            return update;
        }

        const rightLoc = nextLoc++;
        const nodes: Nodes = {
            [listLoc]: {
                type: 'list',
                kind,
                children: [id.loc],
                loc: listLoc,
            },
            [id.loc]: { ...id, text: mid.join('') },
            [rightLoc]: { type: 'id', loc: rightLoc, text: right.join('') },
        };
        const update = replaceWithSmooshed(
            path,
            { ...top, nextLoc },
            id.loc,
            [listLoc, rightLoc],
            { children: [listLoc, id.loc], cursor: { type: 'id', end: 0 } },
        );
        Object.assign(update.nodes, nodes);
        return update;
    }

    if (left.length) {
        let nextLoc = top.nextLoc;
        const listLoc = nextLoc++;
        const rightLoc = nextLoc++;
        const nodes: Nodes = {
            [listLoc]: {
                type: 'list',
                kind,
                children: [rightLoc],
                loc: listLoc,
            },
            [id.loc]: { ...id, text: left.join('') },
            [rightLoc]: {
                type: 'id',
                loc: rightLoc,
                text: right.join(''),
            },
        };

        const update = replaceWithSmooshed(
            path,
            { ...top, nextLoc },
            id.loc,
            [id.loc, listLoc],
            { children: [listLoc, rightLoc], cursor: { type: 'id', end: 0 } },
        );
        Object.assign(update.nodes, nodes);

        return update;
    }

    let nextLoc = top.nextLoc;
    const newLoc = nextLoc++;
    const update = replaceAt(path.children.slice(0, -1), top, id.loc, newLoc);
    update.nodes[newLoc] = {
        type: 'list',
        kind,
        children: [id.loc],
        loc: newLoc,
    };
    update.nextLoc = nextLoc;
    update.selection = withPartial(parentPath(path), {
        children: [newLoc, id.loc],
        cursor: { type: 'id', end: 0 },
    });
    return update;
};
