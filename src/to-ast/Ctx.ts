import { Loc, Node } from '../types/cst';
import { Expr, NumberKind, TVar, Type } from '../types/ast';
import { Report } from '../get-type/get-types-new';
import { Layout, MNodeContents } from '../types/mcst';
import { basicBuiltins } from './builtins';
import { Builtins, CstCtx, Env, Library } from './library';
import objectHash from 'object-hash';
import {
    addToTree,
    hashedToFlats,
    hashedToTree,
    splitNamespaces,
} from '../db/hash-tree';
export { none, nil, nilt, noloc, blank, any, noForm } from './builtins';

export type AutoCompleteReplace = {
    type: 'update';
    update:
        | {
              type: 'hash';
              hash: string | number;
          }
        | {
              type: 'accessText';
              text: string;
          }
        | {
              type: 'array-hash';
              hash: string;
          };
    exact: boolean;
    text: string;
    ann?: Type;
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
    global: Global;
    local: Local;
    localMap: {
        terms: { [sym: number]: { name: string; type: Type } };
        types: { [sym: number]: { name: string; bound?: Type } };
    };
};

export type Global = {
    builtins: {
        bidx: number;
        terms: { [hash: string]: Type };
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
    | { type: 'record-attr' }
    | { type: 'let-pairs' }
    | { type: 'unresolved' }
    | { type: 'number'; kind: NumberKind }
    | { type: 'id-decl'; hash: string | number; ann?: Type }
    | { type: 'tag'; ann?: Type }
    | { type: 'id'; hash: string | number; ann?: Type };

export const emptyLocal: Local = { terms: [], types: [] };

type Tree = {
    top?: string;
    children: {
        [key: string]: Tree;
    };
};

export const makeBuiltinTree = () => {
    const tree: Tree = { children: {} };

    Object.keys(basicBuiltins.terms).forEach((name) => {
        addToTree(tree, name, ':builtin:' + name);
    });
    Object.keys(basicBuiltins.types).forEach((name) => {
        addToTree(tree, name, ':builtin:' + name);
    });

    return tree;
};

const makeHash = (value: any) => objectHash(value);

export const builtinTree = () => {
    const tree: Tree = { children: {} };

    Object.keys(basicBuiltins.terms)
        .concat(Object.keys(basicBuiltins.types))
        .forEach((name) => {
            addToTree(tree, name, ':builtin:' + name);
        });

    return tree;
};

export const builtinMap = (): Builtins => {
    const builtins: Builtins = {};

    Object.keys(basicBuiltins.terms).forEach((name) => {
        builtins[name] = { type: 'term', ann: basicBuiltins.terms[name] };
    });
    Object.keys(basicBuiltins.types).forEach((name) => {
        builtins[name] = { type: 'type', args: basicBuiltins.types[name] };
    });

    return builtins;
};

export const newEnv = (): Env => {
    const builtins: Builtins = {};
    const ns: Library['namespaces'] = { '': {} };
    let aaa = 0;

    const add = (name: string) => {
        let cn = ns[''];
        const parts = splitNamespaces(name);
        parts.forEach((n, i) => {
            if (!Object.hasOwn(cn, n)) {
                const hash = aaa++ + '';
                cn[n] = hash;
            }
            if (!ns[cn[n]]) {
                ns[cn[n]] = {};
            }
            cn = ns[cn[n]];
            if (i >= parts.length - 1) {
                cn[''] = ':builtin:' + name;
            }
        });
    };

    Object.keys(basicBuiltins.terms).forEach((name) => {
        builtins[name] = { type: 'term', ann: basicBuiltins.terms[name] };
        add(name);
    });
    Object.keys(basicBuiltins.types).forEach((name) => {
        builtins[name] = { type: 'type', args: basicBuiltins.types[name] };
        add(name);
    });

    return {
        builtins,
        library: { definitions: {}, history: [], namespaces: ns, root: '' },
    };
};

const getGlobalNames = (env: Env) => {
    env.library.namespaces;
};

export const newCtx = (global: Env = newEnv()): CstCtx => {
    return {
        global,
        local: emptyLocal,
        results: {
            localMap: { terms: {}, types: {} },
            hashNames: {},
            globalNames: hashedToFlats(
                global.library.root,
                global.library.namespaces,
            ),
            errors: {},
            display: {},
            mods: {},
            toplevel: {},
        },
    };
};
