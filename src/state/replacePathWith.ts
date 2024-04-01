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
import { Path } from './path';

export function replacePathWith(
    path: Path[],
    map: Map,
    oldNsMap: NUIState['nsMap'],
    newThing: NewThing,
): StateUpdate | void {
    if (!path.length) {
        return;
    }
    const { update, nsMap } = replacePath(path, newThing.idx, map, oldNsMap);
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
            const parentNs = nsMap[parent.idx];
            if (parentNs.type === 'placeholder') {
                throw new Error('sandbox placeholder');
            }
            const nsid = parentNs.children[parent.at];
            const ns = nsMap[nsid];
            if (ns.type === 'placeholder') {
                throw new Error('sandbox placeholder');
            }
            return {
                update: {},
                nsMap: { [nsid]: { ...ns, top: newIdx } },
            };
        }
        case 'ns-top':
            const parentNs = nsMap[parent.idx];
            if (parentNs.type === 'placeholder') {
                throw new Error('sandbox placeholder');
            }
            return {
                update: {},
                nsMap: { [parent.idx]: { ...parentNs, top: newIdx } },
            };
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
