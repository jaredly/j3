import { UpdateMap } from '../../web/store';
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
          hash?: string;
      }
    | { type: 'unparsed'; raw: string };
// `LikeThis
// | { type: 'tag'; text: string }
// | { type: 'number'; raw: string };

export type ListLikeContents =
    | { type: 'list'; values: number[] }
    | { type: 'record'; values: number[] }
    | { type: 'array'; values: number[] };

export type MNodeContents =
    | Atom
    | ListLikeContents
    | stringText
    | RichText
    | Attachment
    | { type: 'hash'; hash: string }

    // list-like
    | { type: 'comment'; text: string }
    | MCSpread
    | { type: 'annot'; target: number; annot: number }
    | MCRecordAccess
    | { type: 'accessText'; text: string }

    // random stuff
    // | { type: 'spread'; contents: number }
    | MCString
    | { type: 'blank' };
export type MCString = {
    type: 'string';
    first: number;
    templates: { expr: number; suffix: number }[];
};
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

export const fromMNode = (node: MNodeContents, map: Map): NodeContents => {
    switch (node.type) {
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                values: node.values.map((child) => fromMCST(child, map)),
            };
        case 'string':
            return {
                ...node,
                first: fromMCST(node.first, map) as stringText & NodeExtra,
                templates: node.templates.map(({ expr, suffix }) => ({
                    expr: fromMCST(expr, map),
                    suffix: fromMCST(suffix, map) as stringText & NodeExtra,
                })),
            };
        case 'recordAccess':
            return {
                ...node,
                target: fromMCST(node.target, map) as Identifier & NodeExtra,
                items: node.items.map(
                    (idx) => fromMCST(idx, map) as accessText & NodeExtra,
                ),
            };
        case 'annot':
            return {
                ...node,
                target: fromMCST(node.target, map),
                annot: fromMCST(node.annot, map),
            };
        case 'spread':
            return { ...node, contents: fromMCST(node.contents, map) };
        default:
            return node;
    }
};

export const fromMCST = (idx: number, map: Map): Node => {
    const node = map[idx];
    if (!node) {
        return { type: 'blank', loc: { idx: -1, start: 0, end: 0 } };
        // throw new Error(`idx not in map ${idx} ${Object.keys(map).join(',')}`);
    }
    return {
        ...node,
        ...fromMNode(node, map),
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
        case 'spread':
            return { ...node, contents: toMCST(node.contents, map) };
        default:
            return node;
    }
};

export const toMCST = (node: Node, map: UpdateMap): number => {
    if (map[node.loc.idx]) {
        console.error(
            `Duplicate node in map??`,
            node.loc.idx,
            map[node.loc.idx],
            node,
        );
    }
    map[node.loc.idx] = {
        ...toMNode(node, map),
        loc: node.loc,
    };
    return node.loc.idx;
};

const tightFirsts: { [key: string]: number } = { fn: 2, def: 2, defn: 3 };
