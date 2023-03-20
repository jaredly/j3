import equal from 'fast-deep-equal';
import { splitGraphemes } from '../../src/parse/parse';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { accessText, Node, NodeExtra, stringText } from '../../src/types/cst';
import {
    fromMCST,
    ListLikeContents,
    Map,
    MNodeExtra,
    toMCST,
} from '../../src/types/mcst';
import { transformNode } from '../../src/types/transform-cst';
import { cmpFullPath } from '../custom/isCoveredBySelection';
import { getNodes } from '../overheat/getNodes';
import { Path, PathChild, StoreUpdate, UpdateMap } from '../store';
import {
    applyUpdate,
    getKeyUpdate,
    insertText,
    State,
    StateUpdate,
} from './getKeyUpdate';
import { selectEnd } from './navigate';
import { newNodeAfter } from './newNodeBefore';

export type CoverageLevel =
    | { type: 'inner'; start: PathChild; end: PathChild }
    | { type: 'partial' }
    | { type: 'full' };

const isAtStart = (map: Map, path: Path[]): boolean => {
    if (!path.length) {
        return true;
    }
    const next = path[0];
    if (next.child.type === 'annot-target') {
        return isAtStart(map, path.slice(1));
    }
    if (next.child.type === 'subtext') {
        return next.child.at === 0 && path.length === 1;
    }
    return false;
};

export const selectionStatus = (
    path: Path[],
    start: Path[],
    end: Path[],
    map: Map,
): CoverageLevel | null => {
    let s = cmpFullPath(start, path);
    if (s > 0) {
        return null;
    }
    if (
        start.length === path.length + 1 &&
        start[start.length - 1].child.type === 'start'
    ) {
        s = -1;
    }
    if (
        start.length === path.length + 2 &&
        start[start.length - 2].child.type === 'annot-target'
    ) {
        s = -1;
    }
    if (
        start.length === path.length + 2 &&
        start[start.length - 2].child.type === 'record-target'
    ) {
        s = -1;
    }

    let e = cmpFullPath(path, end);
    if (e > 0) {
        return null;
    }

    if (
        end.length === path.length + 1 &&
        end[end.length - 1].child.type === 'end'
    ) {
        e = -1;
    }
    if (end.length === path.length + 2) {
        const slast = end[end.length - 2];

        if (slast.child.type === 'annot-annot') {
            e = -1;
        }
        const node = map[slast.idx];
        if (slast.child.type === 'attribute' && node.type === 'recordAccess') {
            if (node.items.length === slast.child.at) {
                e = -1;
            }
        }
    }
    if (s < 0 && e < 0) {
        return { type: 'full' };
    }
    if (s === 0 && e === 0) {
        return {
            type: 'inner',
            start: start[start.length - 1].child,
            end: end[end.length - 1].child,
        };
    }
    return { type: 'partial' };
};

export type ClipboardItem =
    | {
          type: 'text';
          text: string;
          trusted: boolean;
          source?: { idx: number; start: number; end: number };
      }
    | { type: 'nodes'; nodes: Node[] };

export const paste = (state: State, items: ClipboardItem[]): State => {
    if (state.at.length === 1 && !state.at[0].end && items.length === 1) {
        const item = items[0];
        switch (item.type) {
            case 'text': {
                if (item.trusted) {
                    const path = state.at[0].start;
                    const update = insertText(
                        item.text,
                        state.map,
                        path,
                        state.nidx,
                    );
                    return applyUpdate(state, 0, update);
                } else {
                    const chars = splitGraphemes(item.text);
                    for (let char of chars) {
                        const path = state.at[0].start;
                        const update = getKeyUpdate(
                            char,
                            state.map,
                            state.at[0],
                            state.nidx,
                        );
                        state = applyUpdate(state, 0, update);
                    }
                    return state;
                }
            }
            case 'nodes': {
                const map: Map = {};
                const idxes = item.nodes.map((node) =>
                    toMCST(reLoc(node, state.nidx), map),
                );
                const start = state.at[0].start;
                const lidx = idxes[idxes.length - 1];
                const selection = selectEnd(lidx, [], map)!;

                const last = start[start.length - 1];
                const parent = start[start.length - 2];
                if (
                    state.map[last.idx].type === 'blank' &&
                    parent.child.type === 'child'
                ) {
                    const pnode = state.map[parent.idx] as ListLikeContents &
                        MNodeExtra;
                    const values = pnode.values.slice();
                    values.splice(parent.child.at, 1, ...idxes);
                    map[parent.idx] = {
                        ...pnode,
                        values,
                    };
                    const update: StateUpdate = {
                        type: 'update',
                        map,
                        selection: start
                            .slice(0, -2)
                            .concat({
                                idx: parent.idx,
                                child: {
                                    type: 'child',
                                    at: parent.child.at + idxes.length - 1,
                                },
                            })
                            .concat(selection),
                    };
                    return applyUpdate(state, 0, update);
                }

                const update = newNodeAfter(
                    start,
                    state.map,
                    { map, idx: lidx, selection },
                    state.nidx,
                    idxes.slice(0, -1),
                );
                return applyUpdate(state, 0, update);
            }
        }
    }
    return state;
};

export const clipboardText = (items: ClipboardItem[]) => {
    return items
        .map((item) =>
            item.type === 'text'
                ? item.text
                : item.nodes.map((node) => nodeToString(node)).join(' '),
        )
        .join('\n');
};

export const collectClipboard = (map: Map, selections: State['at']) => {
    const items: ClipboardItem[] = [];
    selections.forEach(({ start, end }) => {
        if (end) {
            items.push(collectNodes(map, start, end));
        }
    });
    return items;
};

export const collectNodes = (
    map: Map,
    start: Path[],
    end: Path[],
): ClipboardItem => {
    if (start.length === end.length) {
        const slast = start[start.length - 1];
        const elast = end[end.length - 1];
        if (slast.idx === elast.idx) {
            const node = fromMCST(slast.idx, map);
            if ('text' in node) {
                const text = splitGraphemes(node.text);
                const sloc =
                    slast.child.type === 'subtext'
                        ? slast.child.at
                        : slast.child.type === 'end'
                        ? text.length
                        : 0;
                const eloc =
                    elast.child.type === 'subtext'
                        ? elast.child.at
                        : elast.child.type === 'start'
                        ? 0
                        : text.length;
                return {
                    type: 'text',
                    trusted: node.type !== 'stringText',
                    text: text.slice(sloc, eloc).join(''),
                    source: {
                        idx: slast.idx,
                        start: sloc,
                        end: eloc,
                    },
                };
            }
        }
    }

    // hrmm I want a transformNode, but that keeps track of your Path[]
    // transformNode()
    const collected: Node[] = [];
    let waiting: { node: Node; children: Node[] }[] = [];

    transformNode(fromMCST(-1, map), {
        pre(node, path) {
            const isatom = 'text' in node;
            const status = selectionStatus(path, start, end, map);
            if (!status) {
                return false;
            }
            let collect = waiting.length
                ? waiting[waiting.length - 1].children
                : collected;
            if (
                status.type === 'full' ||
                (status.type === 'partial' && isatom)
            ) {
                collect.push(node);
                return false;
            }
            if (
                node.type === 'recordAccess' ||
                node.type === 'string' ||
                node.type === 'annot'
            ) {
                waiting.push({ node, children: [] });
            }
            if (status.type === 'partial' && 'values' in node) {
                waiting.push({ node, children: [] });
            }
        },
        post(node) {
            if (waiting.length && waiting[waiting.length - 1].node === node) {
                const children = waiting.pop()!.children;
                switch (node.type) {
                    case 'annot': {
                        if (children.length === 1) {
                            node = children[0];
                        }
                        // Otherwise, we keep both. it's fine
                        break;
                    }
                    case 'recordAccess': {
                        let first = children[0];
                        const kids = children.slice(1) as (accessText &
                            NodeExtra)[];
                        if (first.type !== 'identifier') {
                            first = {
                                type: 'identifier',
                                text: (first as accessText).text,
                                loc: first.loc,
                            };
                        }
                        node = {
                            ...node,
                            target: first,
                            items: kids,
                        };
                        break;
                    }
                    case 'string': {
                        if (
                            children.length === 1 &&
                            children[0].type !== 'stringText'
                        ) {
                            node = children[0];
                            break;
                        }
                        if (children[0].type !== 'stringText') {
                            children.unshift({
                                type: 'stringText',
                                text: '',
                                loc: { idx: -2, start: 0, end: 0 },
                            });
                        }
                        const templates: {
                            expr: Node;
                            suffix: stringText & NodeExtra;
                        }[] = [];
                        for (let i = 1; i < children.length; i += 2) {
                            templates.push({
                                expr: children[i],
                                suffix:
                                    children[i + 1]?.type === 'stringText'
                                        ? (children[i + 1] as stringText &
                                              NodeExtra)
                                        : {
                                              type: 'stringText',
                                              text: '',
                                              loc: {
                                                  idx: -2,
                                                  start: 0,
                                                  end: 0,
                                              },
                                          },
                            });
                        }
                        node = {
                            ...node,
                            first: children[0] as stringText & NodeExtra,
                            templates,
                        };
                        break;
                    }
                    default:
                        node = { ...(node as any), values: children };
                        break;
                }
                if (waiting.length) {
                    waiting[waiting.length - 1].children.push(node);
                } else {
                    collected.push(node);
                }
            }
        },
    });

    while (waiting.length) {
        let { node, children } = waiting.pop()!;
        node = { ...(node as any), values: children };
        let collect = waiting.length
            ? waiting[waiting.length - 1].children
            : collected;
        collect.push(node);
    }

    return { type: 'nodes', nodes: collected };
};

export const reLoc = (node: Node, nidx: () => number): Node => {
    return transformNode(node, {
        pre(node) {
            return { ...node, loc: { ...node.loc, idx: nidx() } };
        },
    });
};
