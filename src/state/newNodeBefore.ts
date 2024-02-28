import { MNode, Map } from '../types/mcst';
import { modChildren } from './modChildren';
import { newBlank } from './newNodes';
import { NewThing, StateUpdate } from './getKeyUpdate';
import { Path } from './path';
import { NUIState, RealizedNamespace } from '../../web/custom/UIState';

// export const nsPath = (path: Path[]): number[] | void => {
//     if (path[0].type !== 'card') {
//         console.log('first not a card', path);
//         return;
//     }
//     const res = [path[0].card];
//     for (let i = 1; i < path.length; i++) {
//         const p = path[i];
//         if (p.type !== 'ns') {
//             console.log(`not an ns`, p);
//             return;
//         }
//         res.push(p.at);
//     }
//     return res;
// };

export const newNodeAfter = (
    path: Path[],
    map: Map,
    nsMap: NUIState['nsMap'],
    newThing: NewThing,
    nidx: () => number,
    extra: number[] = [],
): StateUpdate | void => {
    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];

        if (parent.type === 'ns') {
            const ns = nsMap[parent.idx] as RealizedNamespace;
            const children = ns.children.slice();
            children.splice(parent.at + 1, 0, newThing.idx);
            return {
                type: 'update',
                map: newThing.map,
                selection: path
                    .slice(0, i)
                    .concat([
                        { ...parent, at: parent.at + 1 },
                        ...newThing.selection,
                    ]),
                nsMap: { [parent.idx]: { ...ns, children } },
            };

            // const np = nsPath(path.slice(0, i + 1));
            // if (!np) {
            //     console.error('unable to parse an nspath');
            //     return;
            // }
            // return {
            //     type: 'update',
            //     map: newThing.map,
            //     selection: path.slice(0, i).concat([
            //         {
            //             type: 'ns',
            //             at: parent.at + 1,
            //             idx: parent.idx,
            //         },
            //         ...newThing.selection,
            //     ]),
            //     // nsUpdate: [
            //     //     {
            //     //         type: 'add',
            //     //         path: np,
            //     //         ns: {
            //     //             type: 'normal',
            //     //             top: newThing.idx,
            //     //             children: [],
            //     //         },
            //     //         after: true,
            //     //     },
            //     // ],
            // };
        }

        if (parent.type !== 'child' && parent.type !== 'inside') {
            continue;
        }
        const child = parent;

        const pnode = map[parent.idx];

        let firstBlank =
            child.type === 'inside' &&
            newThing.map[newThing.idx]!.type === 'blank'
                ? newBlank(nidx())
                : null;
        if (firstBlank) {
            Object.assign(newThing.map, firstBlank.map);
        }

        newThing.map[parent.idx] = {
            ...pnode,
            ...modChildren(pnode, (items) => {
                items.splice(
                    child.type === 'child' ? child.at + 1 : 0,
                    0,
                    ...extra,
                    newThing.idx,
                );
                if (firstBlank) {
                    items.unshift(firstBlank.idx);
                }
                return items;
            }),
        } as MNode;
        return {
            type: 'update',
            ...newThing,
            selection: path
                .slice(0, i)
                .concat({
                    idx: parent.idx,
                    type: 'child',
                    at:
                        child.type === 'child'
                            ? child.at + 1 + extra.length
                            : firstBlank
                            ? 1
                            : extra.length,
                })
                .concat(newThing.selection),
            autoComplete: true,
        };
    }
};

export const newNodeBefore = (
    path: Path[],
    map: Map,
    nsMap: NUIState['nsMap'],
    newThing: NewThing,
): StateUpdate | void => {
    for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i];

        if (parent.type === 'ns') {
            const ns = nsMap[parent.idx] as RealizedNamespace;
            const children = ns.children.slice();
            children.splice(parent.at, 0, newThing.idx);
            return {
                type: 'update',
                map: newThing.map,
                selection: path
                    .slice(0, i)
                    .concat([
                        { ...parent, at: parent.at },
                        ...newThing.selection,
                    ]),
                nsMap: { [parent.idx]: { ...ns, children } },
            };
        }

        if (parent.type !== 'child') {
            continue;
        }
        const child = parent;

        const pnode = map[parent.idx];

        const at = child.type === 'child' ? child.at : 0;

        newThing.map[parent.idx] = {
            ...pnode,
            ...modChildren(pnode, (items) => {
                items.splice(at, 0, newThing.idx);
                return items;
            }),
        } as MNode;
        return {
            type: 'update',
            ...newThing,
            selection: path
                .slice(0, i)
                .concat({ idx: parent.idx, type: 'child', at: at })
                .concat(newThing.selection),
        };
    }
};
