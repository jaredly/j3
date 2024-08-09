//

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { filterNulls } from '../../web/custom/old-stuff/filterNulls';
import { selectNode } from '../client/selectNode';
import { isCollection } from '../client/TextEdit/actions';
import { RenderInfo } from './renderables';
import { NodeSelection } from './state';

export type Loc = Array<[string, number]>;

export type PathRoot = {
    type: 'doc-node';
    doc: string;
    ids: number[];
    toplevel: string;
}; // another option would be like, "search-result" or "pin" or something

export type Path = {
    root: PathRoot;
    children: number[];
};

export const pathWithChildren = (path: Path, ...children: number[]) => ({
    ...path,
    children: path.children.concat(children),
});

export const parentPath = (path: Path) => ({
    ...path,
    children: path.children.slice(0, -1),
});

export const serializePath = (path: Path) => {
    return `${path.root.doc}#${path.root.ids.join('.')}#${path.children.join(
        '.',
    )}`;
};

export type Selection =
    | { type: 'start' | 'end' | 'inside' }
    | { type: 'subtext'; at: number }
    | { type: 'rich-text'; sel: any };

export type Cursor = {
    path: Path;
    selection: Selection;
};

/*
-------- Rich Text ----------
*/

export type Style = {
    fontWeight?: number | string;
    fontFamily?: string;
    fontStyle?: string;
    textDecoration?: string;
    background?: { r: number; g: number; b: number } | false;
    border?: string;
    outline?: string;
    color?: { r: number; g: number; b: number } | false;
};

type StyleSpan = {
    style: Style;
    start: number;
    end: number;
};

// export type RichBlock =
//     | { type: 'r:h'; level: number; contents: RichInline[] }
//     | { type: 'r:p'; contents: RichInline[] }
//     | { type: 'r:l'; ordered: boolean; contents: RichBlock[] }
//     | { type: 'r:checks'; contents: { check: boolean; block: RichBlock[] }[] }
//     | { type: 'r:opts'; which: number; contents: RichBlock[] }
//     | { type: 'r:indent'; quote: boolean; contents: RichBlock[] }
//     | { type: 'r:table'; rows: RichBlock[][] }
//     | { type: 'r:hr' };

// export type RichInline =
//     | { type: 'text'; style: Style; text: string }
//     | { type: 'link'; style: Style; text: string; url: string }
//     | { type: 'image'; url: string; style: Style }
//     | { type: 'embed'; node: Node; format?: FormatMap };

// export type FormatMap = Record<string, RenderInfo>;

//////// ALTERNATIVE TWO

/*

So the neat thing about this, is that rich-text nodes and sub-nodes
are ~no different from other syntax nodes.

ooh so the ... I mean ...
Yeah I like the unity of it.


*/

export type InlineSpan =
    | {
          type: 'text';
          text: string;
          style: Style;
      }
    | { type: 'link'; text: string; link: string; style: Style }
    | { type: 'embed'; item: number };

// Rich Paragraph(?)
export type RichInline = {
    type: 'rich-inline';
    spans: InlineSpan[];
    kind?: InlineKind;
    loc: number;
};

export type RichBlock = {
    type: 'rich-block';
    items: number[];
    loc: number;
    kind?: BlockKind;
    style: Style;
};

// Do we want footnotes? Or "hover for more info"s?
export type InlineSpanT<Loc> =
    | {
          type: 'text';
          text: string;
          style: Style;
      }
    | { type: 'link'; text: string; link: string; style: Style }
    | { type: 'embed'; item: RecNodeT<Loc> };

// So, when editing, default is to start with a rich-inline,
// but if you start needing extra formatting, we wrap in a
// rich-block.
export type RichInlineT<Loc> = {
    type: 'rich-inline';
    spans: InlineSpanT<Loc>[];
    kind?: InlineKind;
    loc: Loc;
};

export type RichBlockT<Loc> = {
    type: 'rich-block';
    items: RecNodeT<Loc>[];
    loc: Loc;
    kind?: BlockKind;
    style: Style;
};

type InlineKind = { type: 'header'; level: number };

type BlockKind =
    | { type: 'list'; ordered: boolean }
    | { type: 'checks'; checked: Record<number, boolean> }
    | { type: 'opts'; which: number }
    | { type: 'indent'; quote: boolean }
    | { type: 'callout'; vibe: 'info' | 'warning' | 'error' };

/*
-------- Sexp Syntax Nodes ----------
*/

type Id<Loc> =
    // id for identifier. "blank" === empty id
    {
        type: 'id';
        text: string;
        loc: Loc;
        ref?: { toplevel: string; loc: number };
    };

export type Node =
    | Id<number>
    | RichInline
    | RichBlock
    | { type: 'list' | 'array' | 'record'; items: number[]; loc: number }
    | {
          type: 'string';
          tag: number;
          first: string;
          templates: { expr: number; suffix: string }[];
          loc: number;
      }
    | { type: 'comment' | 'spread'; contents: number; loc: number }
    | { type: 'annot'; contents: number; annot: number; loc: number }
    | { type: 'record-access'; target: number; items: number[]; loc: number };
// doooo I want to be embedding some embeds? I kinda want to leave open the option.
// | { type: 'rich-text'; contents: any; loc: number; embeds: number[] };
// | {
//       type: 'raw-code';
//       lang: string;
//       raw: string;
//       loc: number;
//       embeds: number[];
//   };

export type RecNode = RecNodeT<Loc>;

export type RecNodeT<Loc> =
    | Id<Loc>
    | RichInlineT<Loc>
    | RichBlockT<Loc>
    | { type: 'list' | 'array' | 'record'; items: RecNodeT<Loc>[]; loc: Loc }
    | {
          type: 'string';
          tag: RecNodeT<Loc>;
          first: string;
          templates: { expr: RecNodeT<Loc>; suffix: string }[];
          loc: Loc;
      }
    | { type: 'comment' | 'spread'; contents: RecNodeT<Loc>; loc: Loc }
    | { type: 'annot'; contents: RecNodeT<Loc>; annot: RecNodeT<Loc>; loc: Loc }
    | {
          type: 'record-access';
          target: RecNodeT<Loc>;
          items: RecNodeT<Loc>[];
          loc: Loc;
      };

export type Nodes = Record<number, Node>;

export const inFromEnd = (
    node: Node,
    path: Path,
    nodes: Nodes,
): void | NodeSelection => {
    if (node.type === 'string') {
        return {
            type: 'string',
            path,
            pathKey: serializePath(path),
            cursor: {
                part: node.templates.length,
                char: splitGraphemes(
                    node.templates.length === 0
                        ? node.first
                        : node.templates[node.templates.length - 1].suffix,
                ).length,
            },
        };
    }
    const children = childLocs(node);
    if (!children.length) {
        return;
    }
    const loc = children[children.length - 1];
    return selectNode(nodes[loc], pathWithChildren(path, loc), 'end', nodes);
};

export const inFromStart = (
    node: Node,
    path: Path,
    nodes: Nodes,
): void | NodeSelection => {
    if (node.type === 'string') {
        return {
            type: 'string',
            cursor: { part: 0, char: 0 },
            path,
            pathKey: serializePath(path),
        };
    }
    const children = childLocs(node);
    if (children.length === 0) {
        return;
    }
    const loc = children[0];
    return selectNode(nodes[loc], pathWithChildren(path, loc), 'start', nodes);
};

export const firstAtom = (path: Path, nodes: Nodes): Path => {
    const loc = path.children[path.children.length - 1];
    const node = nodes[loc];
    if (node.type === 'string') return path;
    const children = childLocs(node);
    if (!children.length) {
        return path;
    }
    return firstAtom(
        { ...path, children: path.children.concat([children[0]]) },
        nodes,
    );
};

export const lastAtom = (path: Path, nodes: Nodes): Path => {
    const loc = path.children[path.children.length - 1];
    const node = nodes[loc];
    if (node.type === 'string') return path;
    const children = childLocs(node);
    if (!children.length) {
        return path;
    }
    return lastAtom(
        {
            ...path,
            children: path.children.concat([children[children.length - 1]]),
        },
        nodes,
    );
};

export const nextAtom = (path: Path, nodes: Nodes): Path | void => {
    if (path.children.length < 2) return; // ok um
    const loc = path.children[path.children.length - 1];
    const ploc = path.children[path.children.length - 2];
    const parent = nodes[ploc];
    if (parent.type === 'string') return;
    const children = childLocs(parent);
    if (!children.length) {
        return;
    }

    const idx = children.indexOf(loc);
    if (idx === children.length - 1) {
        return nextAtom(parentPath(path), nodes);
    }
    return firstAtom(
        pathWithChildren(parentPath(path), children[idx + 1]),
        nodes,
    );
};

export const prevAtom = (path: Path, nodes: Nodes): Path | void => {
    if (path.children.length < 2) return; // ok um
    const loc = path.children[path.children.length - 1];
    const ploc = path.children[path.children.length - 2];
    const parent = nodes[ploc];
    if (parent.type === 'string') return;
    const children = childLocs(parent);
    if (!children.length) {
        return;
    }

    const idx = children.indexOf(loc);
    if (idx === 0) {
        return prevAtom(parentPath(path), nodes);
    }
    return lastAtom(
        pathWithChildren(parentPath(path), children[idx - 1]),
        nodes,
    );
};

export const toTheRight = (
    parent: Node,
    cloc: number,
    path: Path,
    nodes: Nodes,
): void | NodeSelection => {
    if (parent.type === 'string') {
        const ppath = path; //parentPath(path);
        const pathKey = serializePath(ppath);
        if (cloc === parent.tag) {
            return {
                type: 'string',
                path: ppath,
                pathKey,
                cursor: { part: 0, char: 0 },
            };
        }
        const at = parent.templates.findIndex((t) => t.expr === cloc);
        if (at === -1) return;
        return {
            type: 'string',
            path: ppath,
            pathKey,
            cursor: { part: at + 1, char: 0 },
        };
    }
    const children = childLocs(parent);
    const idx = children.indexOf(cloc);
    if (idx === children.length - 1) {
        return selectNode(parent, path, 'end', nodes);
    }
    const loc = children[idx + 1];
    return selectNode(nodes[loc], pathWithChildren(path, loc), 'start', nodes);
};

export const toTheLeft = (
    parent: Node,
    cloc: number,
    path: Path,
    nodes: Nodes,
): void | NodeSelection => {
    if (parent.type === 'string') {
        if (cloc === parent.tag) {
            const gparent = path.children[path.children.length - 2];
            return toTheLeft(
                nodes[gparent],
                parent.loc,
                parentPath(path),
                nodes,
            );
        }
        const ppath = path; // parentPath(path);
        const pathKey = serializePath(ppath);
        const at = parent.templates.findIndex((t) => t.expr === cloc);
        if (at === -1) return;
        return {
            type: 'string',
            path: ppath,
            pathKey,
            cursor: {
                part: at,
                char: splitGraphemes(
                    at === 0 ? parent.first : parent.templates[at - 1].suffix,
                ).length,
            },
        };
    }
    const children = childLocs(parent);
    const idx = children.indexOf(cloc);
    if (idx === 0) {
        return selectNode(parent, path, 'start', nodes);
    }
    const loc = children[idx - 1];
    return selectNode(nodes[loc], pathWithChildren(path, loc), 'end', nodes);
};

export const childLocs = (node: Node) => {
    switch (node.type) {
        case 'id':
            return [];
        case 'rich-inline':
            return node.spans
                .map((s) => (s.type === 'embed' ? s.item : null))
                .filter(filterNulls);
        case 'rich-block':
            return node.items;
        case 'list':
        case 'array':
        case 'record':
            return node.items;
        case 'comment':
        case 'spread':
            return [node.contents];
        case 'annot':
            return [node.contents, node.annot];
        case 'record-access':
            return [node.target, ...node.items];
        case 'string':
            return [node.tag, ...node.templates.flatMap((t) => t.expr)];
    }
};

export const fromMap = <Loc>(
    getLoc: (loc: number) => Loc,
    id: number,
    nodes: Nodes,
    paths?: { children: number[]; map: Record<number, number[]> },
): RecNodeT<Loc> => {
    if (paths) {
        paths.map[id] = paths.children;
    }
    const sub = paths
        ? { ...paths, children: paths.children.concat([id]) }
        : undefined;
    const node = nodes[id];
    const loc = getLoc(node.loc); // : [string, number][] = [[top, node.loc]];
    switch (node.type) {
        case 'id':
            return { ...node, loc };
        case 'rich-block':
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                loc,
                items: node.items.map((n) => fromMap(getLoc, n, nodes, sub)),
            };
        case 'comment':
        case 'spread':
            return {
                ...node,
                loc,
                contents: fromMap(getLoc, node.contents, nodes, sub),
            };
        case 'annot':
            return {
                ...node,
                loc,
                contents: fromMap(getLoc, node.contents, nodes, sub),
                annot: fromMap(getLoc, node.annot, nodes, sub),
            };
        case 'record-access':
            return {
                ...node,
                loc,
                target: fromMap(getLoc, node.target, nodes, sub),
                items: node.items.map((n) => fromMap(getLoc, n, nodes, sub)),
            };
        case 'rich-inline':
            return {
                ...node,
                loc,
                spans: node.spans.map((t) =>
                    t.type === 'embed'
                        ? {
                              type: 'embed',
                              item: fromMap(getLoc, t.item, nodes, sub),
                          }
                        : t,
                ),
            };
        case 'string':
            return {
                ...node,
                loc,
                tag: fromMap(getLoc, node.tag, nodes, sub),
                templates: node.templates.map((t) => ({
                    expr: fromMap(getLoc, t.expr, nodes, sub),
                    suffix: t.suffix,
                })),
            };
    }
};

const foldNode = <V>(v: V, node: RecNode, f: (v: V, node: RecNode) => V): V => {
    switch (node.type) {
        case 'id':
        case 'rich-inline':
            return f(v, node);
        case 'list':
        case 'array':
        case 'record':
        case 'rich-block':
            return node.items.reduce(
                (v, node) => foldNode(v, node, f),
                f(v, node),
            );
        case 'comment':
        case 'spread':
            return foldNode(f(v, node), node.contents, f);
        case 'annot':
            return foldNode(
                foldNode(f(v, node), node.contents, f),
                node.annot,
                f,
            );
        case 'record-access':
            return node.items.reduce(
                (v, node) => foldNode(v, node, f),
                foldNode(f(v, node), node.target, f),
            );
        case 'string':
            return node.templates.reduce(
                (v, { expr }) => foldNode(v, expr, f),
                f(v, node),
            );
    }
};

const maxLoc = (node: RecNode) => {
    return foldNode(0, node, (max, node) =>
        node.loc.length ? Math.max(max, node.loc[node.loc.length - 1][1]) : max,
    );
};

// Gotta have a way to determine

const getLoc = (node: RecNode, nodes: Nodes, idx: { next: number }) => {
    if (!node.loc.length) return idx.next++;
    const loc = node.loc[node.loc.length - 1][1];
    if (loc in nodes) {
        return idx.next++;
    }
    // @ts-ignore this will get overwritten in a sec
    nodes[loc] = null;
    return loc;
};

export const toMap = (node: RecNode, nodes: Nodes): number => {
    const idx = { next: maxLoc(node) + 1 };
    return toMapInner(node, [], nodes, (node, nodes) =>
        getLoc(node, nodes, idx),
    );
};

export const toMapInner = <T>(
    node: RecNodeT<T>,
    path: number[],
    nodes: Nodes,
    getLoc: (node: RecNodeT<T>, nodes: Nodes, path: number[]) => number,
    // idx: { next: number },
): number => {
    const loc = getLoc(node, nodes, path);
    nodes[loc] = fromRec(node, path.concat([loc]), loc, nodes, getLoc);
    return loc;
};

const fromRec = <T>(
    node: RecNodeT<T>,
    path: number[],
    loc: number,
    nodes: Nodes,
    getLoc: (node: RecNodeT<T>, nodes: Nodes, path: number[]) => number,
): Node => {
    switch (node.type) {
        case 'id':
            return { ...node, loc };
        case 'list':
        case 'array':
        case 'record':
        case 'rich-block':
            return {
                ...node,
                loc,
                items: node.items.map((n) =>
                    toMapInner(n, path, nodes, getLoc),
                ),
            };
        case 'comment':
        case 'spread':
            return {
                ...node,
                loc,
                contents: toMapInner(node.contents, path, nodes, getLoc),
            };
        case 'annot':
            return {
                ...node,
                loc,
                contents: toMapInner(node.contents, path, nodes, getLoc),
                annot: toMapInner(node.annot, path, nodes, getLoc),
            };
        case 'record-access':
            return {
                ...node,
                loc,
                target: toMapInner(node.target, path, nodes, getLoc),
                items: node.items.map((n) =>
                    toMapInner(n, path, nodes, getLoc),
                ),
            };
        case 'rich-inline':
            return {
                ...node,
                loc,
                spans: node.spans.map((t) =>
                    t.type === 'embed'
                        ? {
                              item: toMapInner(t.item, path, nodes, getLoc),
                              type: 'embed',
                          }
                        : t,
                ),
            };
        case 'string':
            return {
                ...node,
                loc,
                tag: toMapInner(node.tag, path, nodes, getLoc),
                templates: node.templates.map((t) => ({
                    expr: toMapInner(t.expr, path, nodes, getLoc),
                    suffix: t.suffix,
                })),
            };
    }
};
