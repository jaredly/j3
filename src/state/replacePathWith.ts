import { NUIState } from '../../web/custom/UIState';
import {
    ListLikeContents,
    Map,
    MCAnnot,
    MCRecordAccess,
    MCSpread,
    MCString,
    MNodeExtra,
} from '../types/mcst';
import { NsUpdateMap, UpdateMap } from './getKeyUpdate';
import { clearAllChildren, NewThing, StateUpdate } from './getKeyUpdate';
import { nsPath } from './newNodeBefore';
import { Path } from './path';

export function replacePathWith(
    path: Path[],
    map: Map,
    onsMap: NUIState['nsMap'],
    newThing: NewThing,
): StateUpdate | void {
    if (!path.length) {
        return;
    }
    const { update, nsMap } = replacePath(path, newThing.idx, map, onsMap);
    return {
        type: 'update',
        map: {
            ...newThing.map,
            ...update,
        },
        selection: path.concat(newThing.selection),
        nsMap,
    };
}

export const replacePath = (
    path: Path[],
    newIdx: number,
    map: Map,
    nsMap: NUIState['nsMap'],
): { update: UpdateMap; nsMap?: NsUpdateMap } => {
    const parent = path[path.length - 1];
    const update: UpdateMap = {};
    const pnode = map[parent.idx];
    switch (parent.type) {
        case 'ns': {
            const nsp = nsPath(path);
            if (!nsp) return { update: {} };
            const last = nsp[nsp.length - 1];
            const sb = nsMap[last];
            if (sb.type === 'placeholder') {
                throw new Error('sandbox placeholder');
            }
            return {
                update: {},
                nsMap: { [last]: { ...sb, top: newIdx } },
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
