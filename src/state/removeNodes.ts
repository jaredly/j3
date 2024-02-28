import { UpdateMap } from './getKeyUpdate';
import { fromMCST, Map, NsMap } from '../types/mcst';
import { goLeft, selectStart } from './navigate';
import { StateChange } from './getKeyUpdate';
import { Node, NodeExtra, stringText } from '../types/cst';
import { commonAncestor, validatePath } from './clipboard';
import { transformNode } from '../types/transform-cst';
import { Path } from './path';
import { Ctx } from '../to-ast/Ctx';
import { Card } from '../../web/custom/UIState';

export const removeNodes = (
    start: Path[],
    end: Path[],
    nodes: Node[],
    map: Map,
    nsMap: NsMap,
    cards: Card[],
    hashNames: { [idx: number]: string },
): StateChange | void => {
    const ancestor = commonAncestor(start, end);
    if (!ancestor) {
        console.warn('no common ancestor', start, end);
        return;
    }
    const toRemove: { [idx: number]: boolean } = {};
    // nodes.forEach((node) => (toRemove[node.loc] = true));
    nodes.forEach((node) =>
        transformNode(node, {
            pre(node, path) {
                if (node.loc !== -2) {
                    toRemove[node.loc] = true;
                } else {
                    console.warn('Aaaaa');
                }
            },
        }),
    );

    // hmmm changed?
    let update: UpdateMap = {};

    transformNode(fromMCST(ancestor, map), {
        pre(node, path) {
            if ('values' in node) {
                let values = node.values.filter((node) => !toRemove[node.loc]);
                if (values.length < node.values.length) {
                    update[node.loc] = {
                        ...(node as any),
                        values: values.map((v) => v.loc),
                    };
                }
                return;
            }
            // if (node.type === 'recordAccess') {
            //     if (toRemove[node.target.loc]) {
            //         update[node.target.loc] = {
            //             type: 'blank',
            //             loc: node.target.loc,
            //         };
            //     }
            // }
            // HM
            if (node.type === 'spread') {
                if (toRemove[node.contents.loc]) {
                    console.log('remove node contents', node);
                    update[node.contents.loc] = {
                        type: 'blank',
                        loc: node.contents.loc,
                    };
                }
            }
            if (node.type === 'annot') {
                //
            }
            if (node.type === 'string') {
                let first = node.first;
                if (toRemove[first.loc]) {
                    first = { ...first, text: '' };
                }
                let templates: {
                    expr: Node;
                    suffix: stringText & NodeExtra;
                }[] = [];
                node.templates.forEach(({ expr, suffix }) => {
                    if (toRemove[expr.loc]) {
                        if (!toRemove[suffix.loc]) {
                            if (templates.length) {
                                templates[templates.length - 1].suffix.text +=
                                    suffix.text;
                            } else {
                                first = {
                                    ...first,
                                    text: first.text + suffix.text,
                                };
                            }
                        }
                    } else if (toRemove[suffix.loc]) {
                        templates.push({
                            expr,
                            suffix: { ...suffix, text: '' },
                        });
                    } else {
                        templates.push({ expr, suffix });
                    }
                });
                if (first !== node.first) {
                    update[first.loc] = first;
                }
                if (templates.length !== node.templates.length) {
                    update[node.loc] = {
                        ...node,
                        first: first.loc,
                        templates: templates.map(({ expr, suffix }) => {
                            update[suffix.loc] = suffix;
                            return {
                                expr: expr.loc,
                                suffix: suffix.loc,
                            };
                        }),
                    };
                }
            }
        },
    });

    if (update[-2] !== undefined) {
        console.log('got some');
        delete update[-2];
    }
    console.log('removing', update);

    const updated = { ...map, ...update } as Map;

    let left = start;

    let parent = start[start.length - 2];
    if (parent.type === 'child' && parent.at === 0) {
        const node = updated[parent.idx];
        if ('values' in node) {
            if (!node.values.length) {
                left = start.slice(0, -2).concat({
                    idx: parent.idx,
                    type: 'inside',
                });
            } else {
                left = selectStart(
                    node.values[0],
                    start.slice(0, -2).concat({
                        idx: parent.idx,
                        type: 'child',
                        at: 0,
                    }),
                    updated,
                )!;
            }
        }
    }

    // const left = getKeyUpdate('ArrowLeft', map, { start }, () => -100);
    // let left = goLeft(start, map)?.selection;
    // if (!left) {
    //     console.log('cannot left');
    //     return;
    // }
    while (!validatePath(updated, left!, hashNames)) {
        left = goLeft(left!, map, nsMap, cards)?.selection!;
        if (!left) {
            console.log('cannot left');
            return;
        }
    }

    return {
        type: 'update',
        map: update,
        selection: left,
    };
};
