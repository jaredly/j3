import {
    ListLikeContents,
    Map,
    MCAnnot,
    MCRecordAccess,
    MCSpread,
    MCString,
    MNodeExtra,
} from '../types/mcst';
import { UpdateMap } from './getKeyUpdate';
import { clearAllChildren, NewThing, StateUpdate } from './getKeyUpdate';
import { nsPath } from './newNodeBefore';
import { Path } from './path';

export function replacePathWith(
    path: Path[],
    map: Map,
    newThing: NewThing,
): StateUpdate | void {
    if (!path.length) {
        return;
    }
    const { update, nsUpdate } = replacePath(path, newThing.idx, map);
    return {
        type: 'update',
        map: {
            ...newThing.map,
            ...update,
        },
        selection: path.concat(newThing.selection),
        nsUpdate,
    };
}

export const replacePath = (
    path: Path[],
    newIdx: number,
    map: Map,
): { update: UpdateMap; nsUpdate?: StateUpdate['nsUpdate'] } => {
    const parent = path[path.length - 1];
    const update: UpdateMap = {};
    const pnode = map[parent.idx];
    switch (parent.type) {
        case 'ns': {
            const nsp = nsPath(path);
            if (!nsp) return { update: {} };
            return {
                update: {},
                nsUpdate: [
                    {
                        type: 'replace',
                        path: nsp,
                        top: newIdx,
                    },
                ],
            };
        }
        case 'child': {
            const values = (pnode as ListLikeContents).values.slice();
            values[parent.at] = newIdx;
            update[parent.idx] = {
                ...(pnode as ListLikeContents & MNodeExtra),
                values,
            };
            break;
        }
        case 'expr': {
            const templates = (pnode as MCString).templates.slice();
            templates[parent.at - 1] = {
                ...templates[parent.at - 1],
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
        case 'annot-annot': {
            update[parent.idx] = {
                ...(pnode as MCAnnot & MNodeExtra),
                annot: newIdx,
            };
            break;
        }
        default:
            throw new Error(
                `Can't replace parent. ${parent.type}. is this a valid place for an expr?`,
            );
    }
    return { update };
};
