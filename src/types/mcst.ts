import { NUIState } from '../../web/custom/UIState';
import { UpdateMap } from '../state/getKeyUpdate';
import {
    accessText,
    Attachment,
    Identifier,
    Loc,
    RichText,
    Node,
    NodeContents,
    NodeExtra,
    stringText,
} from './cst';

export type MNode = MNodeContents & MNodeExtra;
export type MNodeExtra = {
    loc: Loc;
};

export type Atom =
    // identifier-like
    | {
          type: 'identifier'; // likeThis
          text: string;
      }
    | { type: 'unparsed'; raw: string };

export type MNodeList = {
    type: 'list';
    values: number[];
};

// `LikeThis
// | { type: 'tag'; text: string }
// | { type: 'number'; raw: string };

export type ListLikeContents =
    | MNodeList
    | { type: 'record'; values: number[] }
    | { type: 'array'; values: number[]; hash?: string };

export type MNodeContents =
    | Atom
    | ListLikeContents
    | stringText
    | RichText
    | Attachment
    | { type: 'hash'; hash: string | number }

    // list-like
    | { type: 'comment'; text: string }
    | { type: 'comment-node'; contents: number }
    | MCSpread
    | MCAnnot
    | MCRecordAccess
    | { type: 'accessText'; text: string }
    | { type: 'tapply'; target: number; values: number[] }

    // random stuff
    // | { type: 'spread'; contents: number }
    | MCString
    | { type: 'blank' };
export type MCString = {
    type: 'string';
    first: number;
    templates: { expr: number; suffix: number }[];
};
export type MCAnnot = { type: 'annot'; target: number; annot: number };
export type MCRecordAccess = {
    type: 'recordAccess';
    target: number;
    items: number[];
};
export type MCSpread = {
    type: 'spread';
    contents: number;
};
export type WithLoc<T> = T & { loc: Loc };

export type Map = {
    [key: number]: MNode;
};
export type NsMap = NUIState['nsMap'];
export type Layout =
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
          cw: number | false;
          // umm I can't remember. do we need something here?
      };

export const fromMNode = (
    node: MNodeContents,
    map: Map,
    used?: number[],
): NodeContents => {
    switch (node.type) {
        case 'list':
        case 'record':
        case 'array':
            return {
                ...node,
                values: node.values.map((child) => fromMCST(child, map, used)),
            };
        case 'string':
            return {
                ...node,
                first: fromMCST(node.first, map, used) as stringText &
                    NodeExtra,
                templates: node.templates.map(({ expr, suffix }) => ({
                    expr: fromMCST(expr, map, used),
                    suffix: fromMCST(suffix, map, used) as stringText &
                        NodeExtra,
                })),
            };
        case 'recordAccess':
            return {
                ...node,
                target: fromMCST(node.target, map, used) as Identifier &
                    NodeExtra,
                items: node.items.map(
                    (idx) => fromMCST(idx, map, used) as accessText & NodeExtra,
                ),
            };
        case 'annot':
            return {
                ...node,
                target: fromMCST(node.target, map, used),
                annot: fromMCST(node.annot, map, used),
            };
        case 'tapply':
            return {
                ...node,
                target: fromMCST(node.target, map, used),
                values: node.values.map((arg) => fromMCST(arg, map, used)),
            };
        case 'spread':
        case 'comment-node':
            return { ...node, contents: fromMCST(node.contents, map, used) };
        default:
            return node;
    }
};

export const fromMCST = (idx: number, map: Map, used?: number[]): Node => {
    const node = map[idx];
    if (!node) {
        return { type: 'blank', loc: -1 };
    }
    used?.push(idx);
    return {
        loc: node.loc,
        ...fromMNode(node, map, used),
    };
};

export const toMNode = (node: NodeContents, map: UpdateMap): MNodeContents => {
    switch (node.type) {
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                values: node.values.map((child) => toMCST(child, map)),
            };
        case 'string':
            return {
                ...node,
                first: toMCST(node.first, map),
                templates: node.templates.map(({ expr, suffix }) => ({
                    expr: toMCST(expr, map),
                    suffix: toMCST(suffix, map),
                })),
            };
        case 'accessText':
            return node;
        case 'recordAccess':
            return {
                ...node,
                target: toMCST(node.target, map),
                items: node.items.map((item) => toMCST(item, map)),
            };
        case 'annot':
            return {
                ...node,
                target: toMCST(node.target, map),
                annot: toMCST(node.annot, map),
            };
        case 'tapply':
            return {
                ...node,
                target: toMCST(node.target, map),
                values: node.values.map((arg) => toMCST(arg, map)),
            };
        case 'spread':
        case 'comment-node':
            return { ...node, contents: toMCST(node.contents, map) };
        default:
            return node;
    }
};

export const toMCST = (node: Node, map: UpdateMap): number => {
    if (map[node.loc]) {
        console.error(`Duplicate node in map??`, node.loc, map[node.loc], node);
    }
    map[node.loc] = {
        ...toMNode(node, map),
        loc: node.loc,
    };
    return node.loc;
};
