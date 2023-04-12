import { Loc, Node } from '../types/cst';
import { Expr, NumberKind, TVar, Type } from '../types/ast';
import { Report } from '../get-type/get-types-new';
import { Layout, MNodeContents } from '../types/mcst';
import { basicBuiltins, basicReverse } from './builtins';
export { none, nil, nilt, noloc, blank, any } from './builtins';

export type AutoCompleteReplace = {
    type: 'replace';
    text: string;
    node: MNodeContents;
    exact: boolean;
    ann: Type;
};

export type AutoCompleteResult =
    | AutoCompleteReplace
    | { type: 'info'; text: string }; // TODO also autofixers probably?

export type Mod = {
    type: 'tannot';
    node: Node;
};

export type Ctx = {
    errors: Report['errors'];
    mods: {
        [idx: number]: Mod[];
    };
    hashNames: { [idx: number]: string };
    display: {
        [idx: number]: {
            style?: NodeStyle;
            layout?: Layout;
            autoComplete?: AutoCompleteResult[];
        };
    };
    // sym: { current: number };
    global: Global;
    local: Local;
    localMap: {
        terms: { [sym: number]: { name: string; type: Type } };
        types: { [sym: number]: { name: string; bound?: Type } };
    };
};

export type Global = {
    builtins: {
        terms: { [hash: string]: Type };
        names: { [name: string]: string[] };
        types: { [name: string]: TVar[] };
    };
    terms: { [hash: string]: { expr: Expr; type: Type } };
    names: { [name: string]: string[] };
    types: { [hash: string]: Type };
    typeNames: { [name: string]: string[] };
    reverseNames: { [hash: string]: string };
};

export type Local = {
    terms: { sym: number; name: string; type: Type }[];
    types: { sym: number; name: string; bound?: Type }[];
};

export type NodeStyle =
    | { type: 'tag' }
    | { type: 'record-attr' }
    | { type: 'let-pairs' }
    | { type: 'unresolved' }
    | { type: 'number'; kind: NumberKind }
    | { type: 'id-decl'; hash: string | number }
    | {
          type: 'id';
          hash: string | number;
          ann?: Type;
          text?: string;
      };

export const noForm = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(noForm);
    }
    if (obj && typeof obj === 'object') {
        const res: any = {};
        Object.keys(obj).forEach((k) => {
            if (k !== 'form') {
                res[k] = noForm(obj[k]);
            }
        });
        return res;
    }
    return obj;
};

export const emptyLocal: Local = { terms: [], types: [] };
export const initialGlobal: Global = {
    builtins: basicBuiltins,
    terms: {},
    names: {},
    types: {},
    typeNames: {},
    reverseNames: { ...basicReverse },
};

export const newCtx = (): Ctx => {
    // console.log('newCtx');
    return {
        // sym: { current: 0 },
        global: initialGlobal,
        local: emptyLocal,
        localMap: { terms: {}, types: {} },
        hashNames: {},
        errors: {},
        display: {},
        mods: {},
    };
};
