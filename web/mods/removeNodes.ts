import { UpdateMap } from '../store';
import { fromMCST, Map } from '../../src/types/mcst';
import { goLeft, selectStart } from './navigate';
import { StateChange } from './getKeyUpdate';
import { Node, NodeExtra, stringText } from '../../src/types/cst';
import { commonAncestor, validatePath } from './clipboard';
import { transformNode } from '../../src/types/transform-cst';
import { Path } from './path';
import { Ctx } from '../../src/to-ast/Ctx';

export const removeNodes = (
    start: Path[],
    end: Path[],
    nodes: Node[],
    map: Map,
    display: Ctx['display'],
): StateChange | void => {
    const ancestor = commonAncestor(start, end);
    if (!ancestor) {
        console.warn('no common ancestor', start, end);
        return;
    }
    const toRemove: { [idx: number]: boolean } = {};
    // nodes.forEach((node) => (toRemove[node.loc.idx] = true));
    nodes.forEach((node) =>
        transformNode(node, {
            pre(node, path) {
                if (node.loc.idx !== -2) {
                    toRemove[node.loc.idx] = true;
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
                let values = node.values.filter(
                    (node) => !toRemove[node.loc.idx],
                );
                if (values.length < node.values.length) {
                    update[node.loc.idx] = {
                        ...node,
                        values: values.map((v) => v.loc.idx),
                    };
                }
                return;
            }
            // if (node.type === 'recordAccess') {
            //     if (toRemove[node.target.loc.idx]) {
            //         update[node.target.loc.idx] = {
            //             type: 'blank',
            //             loc: node.target.loc,
            //         };
            //     }
            // }
            // HM
            if (node.type === 'spread') {
                if (toRemove[node.contents.loc.idx]) {
                    console.log('remove node contents', node);
                    update[node.contents.loc.idx] = {
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
                if (toRemove[first.loc.idx]) {
                    first = { ...first, text: '' };
                }
                let templates: {
                    expr: Node;
                    suffix: stringText & NodeExtra;
                }[] = [];
                node.templates.forEach(({ expr, suffix }) => {
                    if (toRemove[expr.loc.idx]) {
                        if (!toRemove[suffix.loc.idx]) {
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
                    } else if (toRemove[suffix.loc.idx]) {
                        templates.push({
                            expr,
                            suffix: { ...suffix, text: '' },
                        });
                    } else {
                        templates.push({ expr, suffix });
                    }
                });
                if (first !== node.first) {
                    update[first.loc.idx] = first;
                }
                if (templates.length !== node.templates.length) {
                    update[node.loc.idx] = {
                        ...node,
                        first: first.loc.idx,
                        templates: templates.map(({ expr, suffix }) => {
                            update[suffix.loc.idx] = suffix;
                            return {
                                expr: expr.loc.idx,
                                suffix: suffix.loc.idx,
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
    while (!validatePath(updated, left!, display)) {
        left = goLeft(left!, map)?.selection!;
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
