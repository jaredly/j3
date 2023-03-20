import equal from 'fast-deep-equal';
import { splitGraphemes } from '../../src/parse/parse';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { Node } from '../../src/types/cst';
import { fromMCST, Map, toMCST } from '../../src/types/mcst';
import { transformNode } from '../../src/types/transform-cst';
import { cmpFullPath } from '../custom/isCoveredBySelection';
import { getNodes } from '../overheat/getNodes';
import { Path, PathChild, UpdateMap } from '../store';
import {
    applyUpdate,
    getKeyUpdate,
    insertText,
    newNodeAfter,
    State,
} from './getKeyUpdate';

export type CoverageLevel =
    | { type: 'inner'; start: PathChild; end: PathChild }
    | { type: 'partial' }
    | { type: 'full' };

export const selectionStatus = (
    path: Path[],
    start: Path[],
    end: Path[],
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
    | { type: 'untrusted'; text: string }
    | { type: 'subtext'; text: string }
    | { type: 'nodes'; nodes: Node[] };

export const paste = (state: State, items: ClipboardItem[]): State => {
    if (state.at.length === 1 && !state.at[0].end && items.length === 1) {
        const item = items[0];
        switch (item.type) {
            case 'subtext': {
                const path = state.at[0].start;
                const update = insertText(
                    item.text,
                    state.map,
                    path,
                    state.nidx,
                );
                return applyUpdate(state, 0, update);
            }
            case 'untrusted': {
                const chars = splitGraphemes(item.text);
                for (let char of chars) {
                    const path = state.at[0].start;
                    const update = getKeyUpdate(
                        char,
                        state.map,
                        path,
                        state.nidx,
                    );
                    state = applyUpdate(state, 0, update);
                }
                return state;
            }
            case 'nodes': {
                const map: UpdateMap = {};
                const idxes = item.nodes.map((node) =>
                    toMCST(reLoc(node, state.nidx), map),
                );

                newNodeAfter;
            }
        }
    }
    return state;
};

export const clipboardText = (items: ClipboardItem[]) => {
    return items
        .map((item) =>
            item.type === 'subtext' || item.type === 'untrusted'
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
                    type: node.type === 'stringText' ? 'untrusted' : 'subtext',
                    text: text.slice(sloc, eloc).join(''),
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
            const status = selectionStatus(path, start, end);
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
            if (status.type === 'partial' && 'values' in node) {
                waiting.push({ node, children: [] });
            }
        },
        post(node) {
            if (waiting.length && waiting[waiting.length - 1].node === node) {
                const children = waiting.pop()!.children;
                node = { ...(node as any), values: children };
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
