import equal from 'fast-deep-equal';
import { splitGraphemes } from '../../src/parse/parse';
import { Node } from '../../src/types/cst';
import { fromMCST, Map } from '../../src/types/mcst';
import { transformNode } from '../../src/types/transform-cst';
import { cmpFullPath } from '../custom/isCoveredBySelection';
import { getNodes } from '../overheat/getNodes';
import { Path, PathChild } from '../store';

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

export const collectNodes = (
    map: Map,
    start: Path[],
    end: Path[],
): { type: 'subtext'; text: string } | { type: 'nodes'; nodes: Node[] } => {
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
                    type: 'subtext',
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
