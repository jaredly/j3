//

import { selectNode } from '../client/selectNode';
import { isCollection } from '../client/TextEdit/actions';
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

type Simple<Loc> =
    // id for identifier. "blank" === empty id
    | { type: 'id'; text: string; loc: Loc }
    | { type: 'ref'; toplevel: string; kind: string; loc: Loc };

export type Node =
    | Simple<number>
    | { type: 'list' | 'array' | 'record'; items: number[]; loc: number }
    | {
          type: 'string';
          first: string;
          templates: { expr: number; suffix: string }[];
          loc: number;
      }
    | { type: 'comment' | 'spread'; contents: number; loc: number }
    | { type: 'annot'; contents: number; annot: number; loc: number }
    | { type: 'record-access'; target: number; items: number[]; loc: number }
    // doooo I want to be embedding some embeds? I kinda want to leave open the option.
    | { type: 'rich-text'; contents: any; loc: number; embeds: number[] }
    | {
          type: 'raw-code';
          lang: string;
          raw: string;
          loc: number;
          embeds: number[];
      };

export type RecNode = RecNodeT<Loc>;

export type RecNodeT<Loc> =
    | Simple<Loc>
    | { type: 'list' | 'array' | 'record'; items: RecNodeT<Loc>[]; loc: Loc }
    | {
          type: 'string';
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
      }
    | { type: 'rich-text'; contents: any; loc: Loc; embeds: RecNodeT<Loc>[] }
    | {
          type: 'raw-code';
          lang: string;
          raw: string;
          loc: Loc;
          embeds: RecNodeT<Loc>[];
      };

export type Nodes = Record<number, Node>;

export const inFromEnd = (
    node: Node,
    path: Path,
    nodes: Nodes,
): void | NodeSelection => {
    const children = childLocs(node);
    if (!children.length) {
        return;
    }
    const loc = children[children.length - 1];
    return selectNode(nodes[loc], pathWithChildren(path, loc), 'end');
};

export const inFromStart = (
    node: Node,
    path: Path,
    nodes: Nodes,
): void | NodeSelection => {
    const children = childLocs(node);
    if (children.length === 0) {
        return;
    }
    const loc = children[0];
    return selectNode(nodes[loc], pathWithChildren(path, loc), 'start');
};

export const firstAtom = (path: Path, nodes: Nodes): Path => {
    const loc = path.children[path.children.length - 1];
    const node = nodes[loc];
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
    const children = childLocs(parent);
    const idx = children.indexOf(cloc);
    if (idx === children.length - 1) {
        return selectNode(parent, path, 'end');
    }
    const loc = children[idx + 1];
    return selectNode(nodes[loc], pathWithChildren(path, loc), 'start');
};

export const toTheLeft = (
    parent: Node,
    cloc: number,
    path: Path,
    nodes: Nodes,
): void | NodeSelection => {
    const children = childLocs(parent);
    const idx = children.indexOf(cloc);
    if (idx === 0) {
        return selectNode(parent, path, 'start');
    }
    const loc = children[idx - 1];
    return selectNode(nodes[loc], pathWithChildren(path, loc), 'end');
};

export const childLocs = (node: Node) => {
    switch (node.type) {
        case 'id':
        case 'ref':
            return [];
        case 'rich-text':
        case 'raw-code':
            return node.embeds;
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
            return node.templates.flatMap((t) => t.expr);
    }
};

export const fromMap = (top: string, id: number, nodes: Nodes): RecNode => {
    const node = nodes[id];
    const loc: [string, number][] = [[top, node.loc]];
    switch (node.type) {
        case 'id':
        case 'ref':
            return { ...node, loc };
        case 'rich-text':
        case 'raw-code':
            return {
                ...node,
                loc,
                embeds: node.embeds.map((n) => fromMap(top, n, nodes)),
            };
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                loc,
                items: node.items.map((n) => fromMap(top, n, nodes)),
            };
        case 'comment':
        case 'spread':
            return {
                ...node,
                loc,
                contents: fromMap(top, node.contents, nodes),
            };
        case 'annot':
            return {
                ...node,
                loc,
                contents: fromMap(top, node.contents, nodes),
                annot: fromMap(top, node.annot, nodes),
            };
        case 'record-access':
            return {
                ...node,
                loc,
                target: fromMap(top, node.target, nodes),
                items: node.items.map((n) => fromMap(top, n, nodes)),
            };
        case 'string':
            return {
                ...node,
                loc,
                templates: node.templates.map((t) => ({
                    expr: fromMap(top, t.expr, nodes),
                    suffix: t.suffix,
                })),
            };
    }
};

const foldNode = <V>(v: V, node: RecNode, f: (v: V, node: RecNode) => V): V => {
    switch (node.type) {
        case 'id':
        case 'rich-text':
        case 'raw-code':
        case 'ref':
            return f(v, node);
        case 'list':
        case 'array':
        case 'record':
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
        Math.max(max, node.loc[node.loc.length - 1][1]),
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
        case 'ref':
            return { ...node, loc };
        case 'rich-text':
        case 'raw-code':
            return {
                ...node,
                loc,
                embeds: node.embeds.map((n) =>
                    toMapInner(n, path, nodes, getLoc),
                ),
            };
        case 'list':
        case 'array':
        case 'record':
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
        case 'string':
            return {
                ...node,
                loc,
                templates: node.templates.map((t) => ({
                    expr: toMapInner(t.expr, path, nodes, getLoc),
                    suffix: t.suffix,
                })),
            };
    }
};
