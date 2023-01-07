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
    [key: number]: {
        node: MNode;
        layout?:
            | {
                  type: 'flat';
                  width: number;
                  pos: number;
              }
            | {
                  type: 'multiline';
                  pairs?: boolean;
                  tightFirst: number;
                  pos: number;
                  // umm I can't remember. do we need something here?
              };
    };
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
        node: {
            ...node,
            contents: toMNode(node.contents, map),
            decorators,
        },
        // layout: {
        //     type: 'multiline',
        //     pos: 0,
        //     pairs:
        //         node.contents.type === 'record' &&
        //         node.contents.items.length > 1,
        //     tightFirst:
        //         node.contents.type === 'list'
        //             ? node.contents.values[0].contents.type === 'identifier'
        //                 ? tightFirsts[node.contents.values[0].contents.text] ??
        //                   1
        //                 : 1
        //             : 0,
        // },
    };
    return node.loc.idx;
};

const tightFirsts: { [key: string]: number } = { fn: 2, def: 2, defn: 3 };
