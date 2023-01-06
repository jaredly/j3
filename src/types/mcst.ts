import { Loc, Node, NodeContents } from './cst';

export type MNode = {
    contents: MNodeContents;
    decorators: { [key: string]: number[] };
    loc: Loc;
};

export type Atom =
    // identifier-like
    | {
          type: 'identifier'; // likeThis
          text: string;
          hash?: string;
      }
    | { type: 'unparsed'; raw: string }
    // `LikeThis
    | { type: 'tag'; text: string }
    | { type: 'number'; raw: string };

export type MNodeContents =
    | Atom

    // list-like
    | { type: 'list'; values: number[] }
    | { type: 'record'; items: number[] }
    | { type: 'array'; values: number[] }
    | { type: 'comment'; text: string }

    // random stuff
    | { type: 'spread'; contents: number }
    | {
          type: 'string';
          first: string;
          templates: { expr: number; suffix: string }[];
      }
    | { type: 'blank' };

export type Map = {
    [key: number]: MNode;
};

export const toMNode = (node: NodeContents, map: Map): MNodeContents => {
    switch (node.type) {
        case 'list':
        case 'array':
            return {
                ...node,
                values: node.values.map((child) => toMCST(child, map)),
            };
        case 'record':
            return {
                ...node,
                items: node.items.map((child) => toMCST(child, map)),
            };
        case 'string':
            return {
                ...node,
                templates: node.templates.map(({ expr, suffix }) => ({
                    expr: toMCST(expr, map),
                    suffix,
                })),
            };
        case 'spread':
            return { ...node, contents: toMCST(node.contents, map) };
        default:
            return node;
    }
};

export const toMCST = (node: Node, map: Map): number => {
    const decorators: MNode['decorators'] = {};
    Object.entries(node.decorators).forEach(([key, value]) => {
        decorators[key] = value.map((node) => toMCST(node, map));
    });
    if (map[node.loc.idx]) {
        console.error(`Duplicate node in map??`, node.loc.idx, map);
    }
    map[node.loc.idx] = {
        ...node,
        contents: toMNode(node.contents, map),
        decorators,
    };
    return node.loc.idx;
};
