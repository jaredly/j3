//

type Simple =
    | { type: 'id' | 'stringText' | 'accessText'; text: string; loc: number }
    | { type: 'ref'; toplevel: string; node: number; loc: number }
    | { type: 'rich-text'; contents: any; loc: number }
    | { type: 'raw-code'; lang: string; raw: string; loc: number };

export type Node =
    | Simple
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
    | Simple
    | { type: 'list' | 'array' | 'record'; items: RecNode[]; loc: number }
    | {
          type: 'string';
          first: RecNode;
          templates: { expr: RecNode; suffix: RecNode }[];
          loc: number;
      }
    | { type: 'comment-node' | 'spread'; contents: RecNode; loc: number }
    | { type: 'annot'; contents: RecNode; annot: RecNode; loc: number }
    | { type: 'record-access'; target: RecNode; items: RecNode[]; loc: number };

export type Nodes = Record<number, Node>;

export const fromMap = (id: number, nodes: Nodes): RecNode => {
    const node = nodes[id];
    switch (node.type) {
        case 'id':
        case 'stringText':
        case 'accessText':
        case 'rich-text':
        case 'raw-code':
        case 'ref':
            return node;
        case 'list':
        case 'array':
        case 'record':
            return { ...node, items: node.items.map((n) => fromMap(n, nodes)) };
        case 'comment-node':
        case 'spread':
            return { ...node, contents: fromMap(node.contents, nodes) };
        case 'annot':
            return {
                ...node,
                contents: fromMap(node.contents, nodes),
                annot: fromMap(node.annot, nodes),
            };
        case 'record-access':
            return {
                ...node,
                target: fromMap(node.target, nodes),
                items: node.items.map((n) => fromMap(n, nodes)),
            };
        case 'string':
            return {
                ...node,
                first: fromMap(node.first, nodes),
                templates: node.templates.map((t) => ({
                    expr: fromMap(t.expr, nodes),
                    suffix: fromMap(t.suffix, nodes),
                })),
            };
    }
};

export const toMap = (node: RecNode, nodes: Nodes): number => {
    nodes[node.loc] = fromRec(node, nodes);
    return node.loc;
};

const fromRec = (node: RecNode, nodes: Nodes): Node => {
    switch (node.type) {
        case 'id':
        case 'stringText':
        case 'accessText':
        case 'rich-text':
        case 'raw-code':
        case 'ref':
            return node;
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                items: node.items.map((n) => toMap(n, nodes)),
            };
        case 'comment-node':
        case 'spread':
            return {
                ...node,
                contents: toMap(node.contents, nodes),
            };
        case 'annot':
            return {
                ...node,
                contents: toMap(node.contents, nodes),
                annot: toMap(node.annot, nodes),
            };
        case 'record-access':
            return {
                ...node,
                target: toMap(node.target, nodes),
                items: node.items.map((n) => toMap(n, nodes)),
            };
        case 'string':
            return {
                ...node,
                first: toMap(node.first, nodes),
                templates: node.templates.map((t) => ({
                    expr: toMap(t.expr, nodes),
                    suffix: toMap(t.suffix, nodes),
                })),
            };
    }
};
