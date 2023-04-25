import { Map, toMCST } from '../src/types/mcst';
import { Identifier, Node } from '../src/types/cst';
import { parse } from '../src/grammar';
// import { preprocess } from './preprocess';
import { Expr, Type } from '../src/types/ast';

export type AutoCompleteChoices = {
    [key: string]: AutoDisambiguation;
};
export type AutoDisambiguation =
    | {
          type: 'local';
          ann?: Type;
      }
    | {
          type: 'global';
          ann?: Type;
      };

export const emptyHistoryItem = () => ({
    post: {},
    postSelection: null,
    pre: {},
    preSelection: null,
    ts: Date.now(),
});

// export const getRoot = (text: string) => {
//     const tree = parse(text).map(preprocess);
//     const root = { type: 'list', values: tree, loc: -1 } satisfies Node;
//     const omap: Map = {};
//     toMCST(root, omap);
//     return { root, omap };
// };

export type PosItem = {
    idx: number;
    // If `child` is -1, that means .tannot
    child: number;
    path: { idx: number; child: number }[];
};
