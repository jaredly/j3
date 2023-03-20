import {
    ListLikeContents,
    Map,
    MCString,
    MNodeExtra,
} from '../../src/types/mcst';
import { Path, UpdateMap } from '../store';
import { NewThing, StateUpdate } from './getKeyUpdate';

export function replacePathWith(
    path: Path[],
    map: Map,
    newThing: NewThing,
    extra: number[] = [],
): StateUpdate | void {
    if (!path.length) {
        return;
    }
    const update = replacePath(path[path.length - 1], newThing.idx, map, extra);
    return {
        type: 'update',
        map: { ...newThing.map, ...update },
        selection: path.concat(newThing.selection),
    };
}

export const replacePath = (
    parent: Path,
    newIdx: number,
    map: Map,
): UpdateMap => {
    const update: UpdateMap = {};
    const pnode = map[parent.idx];
    switch (parent.child.type) {
        case 'child': {
            const values = (pnode as ListLikeContents).values.slice();
            values[parent.child.at] = newIdx;
            update[parent.idx] = {
                ...(pnode as ListLikeContents & MNodeExtra),
                values,
            };
            break;
        }
        case 'expr': {
            const templates = (pnode as MCString).templates.slice();
            templates[parent.child.at - 1] = {
                ...templates[parent.child.at - 1],
                expr: newIdx,
            };
            update[parent.idx] = {
                ...(pnode as MCString & MNodeExtra),
                templates,
            };
            break;
        }
        case 'spread-contents': {
            update[parent.idx] = {
                ...(pnode as MCSpread & MNodeExtra),
                contents: newIdx,
            };
            break;
        }
        default:
            throw new Error(
                `Can't replace parent. ${parent.child.type}. is this a valid place for an expr?`,
            );
    }
    return update;
};
