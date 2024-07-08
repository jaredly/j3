//

export type Loc = Array<[string, number]>;

export type PathRoot = {
    type: 'doc-node';
    ids: string[];
}; // another option would be like, "search-result" or "pin" or something

export type Path = {
    root: PathRoot;
    children: number[];
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
    | { type: 'id' | 'stringText' | 'accessText'; text: string; loc: Loc }
    | { type: 'ref'; toplevel: string; kind: string; loc: Loc }
    | { type: 'rich-text'; contents: any; loc: Loc }
    | { type: 'raw-code'; lang: string; raw: string; loc: Loc };

export type Node =
    | Simple<number>
    | { type: 'list' | 'array' | 'record'; items: number[]; loc: number }
    | {
          type: 'string';
          first: number;
          templates: { expr: number; suffix: number }[];
          loc: number;
      }
    | { type: 'comment-node' | 'spread'; contents: number; loc: number }
    | { type: 'annot'; contents: number; annot: number; loc: number }
    | { type: 'record-access'; target: number; items: number[]; loc: number };

export type RecNode =
    | Simple<Loc>
    | { type: 'list' | 'array' | 'record'; items: RecNode[]; loc: Loc }
    | {
          type: 'string';
          first: RecNode;
          templates: { expr: RecNode; suffix: RecNode }[];
          loc: Loc;
      }
    | { type: 'comment-node' | 'spread'; contents: RecNode; loc: Loc }
    | { type: 'annot'; contents: RecNode; annot: RecNode; loc: Loc }
    | { type: 'record-access'; target: RecNode; items: RecNode[]; loc: Loc };

export type Nodes = Record<number, Node>;

export const fromMap = (top: string, id: number, nodes: Nodes): RecNode => {
    const node = nodes[id];
    const loc: [string, number][] = [[top, node.loc]];
    switch (node.type) {
        case 'id':
        case 'stringText':
        case 'accessText':
        case 'rich-text':
        case 'raw-code':
        case 'ref':
            return { ...node, loc };
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                loc,
                items: node.items.map((n) => fromMap(top, n, nodes)),
            };
        case 'comment-node':
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
                first: fromMap(top, node.first, nodes),
                templates: node.templates.map((t) => ({
                    expr: fromMap(top, t.expr, nodes),
                    suffix: fromMap(top, t.suffix, nodes),
                })),
            };
    }
};

const foldNode = <V>(v: V, node: RecNode, f: (v: V, node: RecNode) => V): V => {
    switch (node.type) {
        case 'id':
        case 'stringText':
        case 'accessText':
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
        case 'comment-node':
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
                (v, { expr, suffix }) =>
                    foldNode(foldNode(v, expr, f), suffix, f),
                foldNode(f(v, node), node.first, f),
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
    return _toMap(node, nodes, idx);
};

const _toMap = (node: RecNode, nodes: Nodes, idx: { next: number }): number => {
    const loc = getLoc(node, nodes, idx);
    nodes[loc] = fromRec(node, loc, nodes, idx);
    return loc;
};

const fromRec = (
    node: RecNode,
    loc: number,
    nodes: Nodes,
    idx: { next: number },
): Node => {
    switch (node.type) {
        case 'id':
        case 'stringText':
        case 'accessText':
        case 'rich-text':
        case 'raw-code':
        case 'ref':
            return { ...node, loc };
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                loc,
                items: node.items.map((n) => _toMap(n, nodes, idx)),
            };
        case 'comment-node':
        case 'spread':
            return {
                ...node,
                loc,
                contents: _toMap(node.contents, nodes, idx),
            };
        case 'annot':
            return {
                ...node,
                loc,
                contents: _toMap(node.contents, nodes, idx),
                annot: _toMap(node.annot, nodes, idx),
            };
        case 'record-access':
            return {
                ...node,
                loc,
                target: _toMap(node.target, nodes, idx),
                items: node.items.map((n) => _toMap(n, nodes, idx)),
            };
        case 'string':
            return {
                ...node,
                loc,
                first: _toMap(node.first, nodes, idx),
                templates: node.templates.map((t) => ({
                    expr: _toMap(t.expr, nodes, idx),
                    suffix: _toMap(t.suffix, nodes, idx),
                })),
            };
    }
};
