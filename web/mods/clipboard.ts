import equal from 'fast-deep-equal';
import { splitGraphemes } from '../../src/parse/parse';
import { Ctx } from '../../src/to-ast/Ctx';
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
import {
    applyUpdate,
    getKeyUpdate,
    insertText,
    State,
    StateUpdate,
} from './getKeyUpdate';
import { selectEnd } from './navigate';
import { newNodeAfter } from './newNodeBefore';
import { Path } from './path';

export type CoverageLevel =
    | { type: 'inner'; start: Path; end: Path }
    | { type: 'partial' }
    | { type: 'full' };

const isAtStart = (map: Map, path: Path[]): boolean => {
    if (!path.length) {
        return true;
    }
    const next = path[0];
    if (next.type === 'annot-target') {
        return isAtStart(map, path.slice(1));
    }
    if (next.type === 'subtext') {
        return next.at === 0 && path.length === 1;
    }
    return false;
};

export const commonAncestor = (one: Path[], two: Path[]) => {
    let i = 0;
    for (
        ;
        i < one.length && i < two.length && one[i].idx === two[i].idx;
        i++
    ) {}
    return i >= 0 ? one[i - 1].idx : null;
};

export const validatePath = (map: Map, path: Path[]) => {
    for (let i = 0; i < path.length - 1; i++) {
        const next = path[i + 1].idx;
        const { idx, ...child } = path[i];
        const node = map[idx];
        switch (child.type) {
            case 'annot-annot':
                if (node.type !== 'annot' || node.annot !== next) {
                    return false;
                }
                break;
            case 'annot-target':
                if (node.type !== 'annot' || node.target !== next) {
                    return false;
                }
                break;
            case 'attribute':
                if (
                    node.type !== 'recordAccess' ||
                    child.at > node.items.length ||
                    node.items[child.at - 1] !== next
                ) {
                    return false;
                }
                break;
            case 'child':
                if (
                    !('values' in node) ||
                    child.at >= node.values.length ||
                    node.values[child.at] !== next
                ) {
                    return false;
                }
                break;
            case 'end':
            case 'start':
            case 'inside':
                return false;
            case 'expr':
                if (
                    node.type !== 'string' ||
                    child.at > node.templates.length ||
                    node.templates[child.at - 1].expr !== next
                ) {
                    return false;
                }
                break;
            case 'text':
                if (
                    node.type !== 'string' ||
                    child.at > node.templates.length ||
                    (child.at === 0
                        ? node.first !== next
                        : node.templates[child.at - 1].suffix !== next)
                ) {
                    return false;
                }
                break;
            case 'record-target':
                if (node.type !== 'recordAccess' || node.target !== next) {
                    return false;
                }
                break;
            case 'spread-contents':
                if (node.type !== 'spread' || node.contents !== next) {
                    return false;
                }
                break;
            case 'subtext':
                if (!('text' in node)) {
                    return false;
                }
                const text = splitGraphemes(node.text);
                if (child.at < 0 || child.at > text.length) {
                    return false;
                }
                break;
        }
    }
    return true;
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
        start[start.length - 1].type === 'start'
    ) {
        s = -1;
    }
    if (
        start.length === path.length + 2 &&
        start[start.length - 2].type === 'annot-target'
    ) {
        s = -1;
    }
    if (
        start.length === path.length + 2 &&
        start[start.length - 2].type === 'record-target'
    ) {
        s = -1;
    }

    let e = cmpFullPath(path, end);
    if (e > 0) {
        return null;
    }

    if (end.length === path.length + 1 && end[end.length - 1].type === 'end') {
        e = -1;
    }
    if (end.length === path.length + 2) {
        const slast = end[end.length - 2];

        if (slast.type === 'annot-annot') {
            e = -1;
        }
        const node = map[slast.idx];
        if (slast.type === 'attribute' && node.type === 'recordAccess') {
            if (node.items.length === slast.at) {
                e = -1;
            }
        }
    }

    // if (start[start.length - 2].type === 'spread-contents') {
    //     e = -1;
    // }

    if (s < 0 && e < 0) {
        return { type: 'full' };
    }
    if (s === 0 && e === 0) {
        return {
            type: 'inner',
            start: start[start.length - 1],
            end: end[end.length - 1],
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

export const paste = (
    state: State,
    ctx: Ctx,
    items: ClipboardItem[],
): State => {
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
                        ctx.display,
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
                            ctx.display,
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
                    parent.type === 'child'
                ) {
                    const pnode = state.map[parent.idx] as ListLikeContents &
                        MNodeExtra;
                    const values = pnode.values.slice();
                    values.splice(parent.at, 1, ...idxes);
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
                                type: 'child',
                                at: parent.at + idxes.length - 1,
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
                    slast.type === 'subtext'
                        ? slast.at
                        : slast.type === 'end'
                        ? text.length
                        : 0;
                const eloc =
                    elast.type === 'subtext'
                        ? elast.at
                        : elast.type === 'start'
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
                        let first = children.length
                            ? children[0]
                            : {
                                  type: 'blank' as const,
                                  loc: { idx: -2, start: 0, end: 0 },
                              };
                        const kids = children.slice(1) as (accessText &
                            NodeExtra)[];
                        if (first.type !== 'identifier') {
                            first = {
                                type: 'identifier',
                                text: (first as accessText).text,
                                loc: first.loc,
                            };
                        }
                        if (!kids.length) {
                            node = first;
                        } else {
                            node = {
                                ...node,
                                target: first,
                                items: kids,
                            };
                        }
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
                        if (
                            !children.length ||
                            children[0].type !== 'stringText'
                        ) {
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
                node = { ...node, loc: { idx: -2, start: 0, end: 0 } };
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
