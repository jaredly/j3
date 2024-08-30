//

import { Evaluator } from '../boot-ex/types';
import { Layout } from '../shared/IR/intermediate';
import {
    foldNode,
    keyForLoc,
    Loc,
    mapNode,
    RecNode,
    Style,
} from '../shared/nodes';

/*
So, things we want this to do:

i kindof want to asseble a dependency graph of sortssss


*/
type ExecutionHarness = {
    getWhatsit(): void;
};

type ExecutionCache<AST, TINFO, IR> = {
    ast: Record<string, AST>;
    irs: Record<string, IR>;
    info: Record<string, TINFO>;
    values: Record<string, Record<string, any>>;
};

type GraphNode = {
    type: 'parse' | 'infer' | 'eval' | 'compile' | 'print' | 'macroex';
    top: string;
    // TODO: move to `id`s? So it's possible to break and re-forge?
    // yeah we can use the `nodes` key
    deps: GraphNode[];
};

// 'value' 'type' 'macro' ... other things maybe?
type Dep = { loc: Loc; kind: string };

export const assembleGraph = (
    getTop: (id: string) => RecNode,
    getAccessories?: (id: string) => Loc[],
) => {
    const nodes: Record<string, GraphNode> = {};

    const get = (top: string, type: GraphNode['type']) =>
        nodes[top + ':' + type];
    const add = (node: GraphNode) => (nodes[node.top + ':' + node.type] = node);

    // const macroex = (top: string, deps?: Dep[]) => {
    //     const current = get(top, 'macroex');
    //     if (current) return current;
    //     const node = add({ type: 'macroex', top, deps: [] });
    //     deps = deps ?? dependencies(getTop(top));
    //     deps.forEach((dep) => {
    //         if (dep.kind === 'macro') {
    //             node.deps.push(eval_(dep.loc[0][0]));
    //         }
    //     });
    //     return node;
    // };

    const parse = (top: string, deps?: Dep[]) => {
        const current = get(top, 'parse');
        if (current) return current;
        const node = add({ type: 'parse', top, deps: [] });
        return node;
    };

    const infer = (top: string, deps?: Dep[]) => {
        const current = get(top, 'infer');
        if (current) return current;
        const node = add({ type: 'infer', top, deps: [] });
        deps = deps ?? dependencies(getTop(top));
        deps.forEach((dep) => {
            node.deps.push(infer(dep.loc[0][0]));
        });
        if (getAccessories) {
            getAccessories(top).forEach((acc) => {
                node.deps.push(infer(acc[0][0]));
            });
        }
        node.deps.push(parse(top, deps));

        return node;
    };

    const compile = (top: string, deps?: Dep[]) => {
        const current = get(top, 'compile');
        if (current) return current;
        const node = add({ type: 'compile', top, deps: [] });
        node.deps.push(infer(top, deps));
        return node;
    };

    const eval_ = (top: string) => {
        const current = get(top, 'eval');
        if (current) return current;
        const node = add({ type: 'eval', top, deps: [] });
        const deps = dependencies(getTop(top));
        node.deps.push(compile(top, deps));
        deps.forEach((dep) => node.deps.push(compile(dep.loc[0][0])));
        if (getAccessories) {
            getAccessories(top).forEach((acc) => {
                node.deps.push(compile(acc[0][0]));
            });
        }

        return node;
    };
};

const dependencies = (cst: RecNode) => {
    const deps: Dep[] = [];
    foldNode(null, cst, (_, node) => {
        if (node.type === 'id' && node.ref && node.ref.type === 'toplevel') {
            deps.push(node.ref);
        }
        return null;
    });
    return deps;
};

// export const createHarness = <AST, TINFO, IR>(
//     ev: Evaluator<AST, TINFO, IR>,
//     cache: ExecutionCache<AST, TINFO, IR>,
// ) => {
//     return {
//         assembleCompileGraph(
//             top: string,
//             getTop: (id: string) => RecNode,
//             deps?: Dep[],
//         ): GraphNode {
//             const cst = getTop(top);
//             deps = deps ?? this.dependencies(cst);

//             const node: GraphNode = { type: 'compile', top, deps: [] };
//             node.deps.push(this.assembleTypeGraph(top, getTop, deps));
//         },

//         assembleEvalGraph(
//             top: string,
//             getTop: (id: string) => RecNode,
//             deps?: Dep[],
//         ): GraphNode {
//             const cst = getTop(top);
//             deps = deps ?? this.dependencies(cst);

//             const node: GraphNode = { type: 'eval', top, deps: [] };
//             node.deps.push(this.assembleCompileGraph(top, getTop, deps));
//         },

//         assembleParseGraph(
//             top: string,
//             getTop: (id: string) => RecNode,
//             deps?: Dep[],
//         ): GraphNode {
//             const cst = getTop(top);
//             deps = deps ?? this.dependencies(cst);

//             const node: GraphNode = { type: 'parse', top, deps: [] };

//             dependencies.forEach((dep) => {
//                 if (dep.kind === 'macro') {
//                     node.deps.push(
//                         this.assembleEvalGraph(dep.loc[0][0], getTop),
//                     );
//                 }
//             });
//         },

//         resolveMacro(loc: Loc): Function | null {
//             const key = keyForLoc(loc);
//             if (!cache.values[key]) return null;
//             if (typeof cache.values[key] !== 'function') return null;
//             return cache.values[key];
//         },

//         getAst() {},

//         dependencies(cst: RecNode) {
//             const deps: Dep[] = [];
//             foldNode(null, cst, (_, node) => {
//                 if (
//                     node.type === 'id' &&
//                     node.ref &&
//                     node.ref.type === 'toplevel'
//                 ) {
//                     deps.push(node.ref);
//                 }
//                 return null;
//             });
//             return deps;
//         },

//         parse(cst: RecNode, cursor?: number) {
//             const macroResults: {
//                 layouts: Record<number, Layout>;
//                 styles: Record<number, Style>;
//                 errors: Record<string, string>;
//             } = { layouts: {}, styles: {}, errors: {} };
//             cst = mapNode(cst, (node) => {
//                 if (node.type === 'list' && node.items.length > 0) {
//                     const first = node.items[0];
//                     if (
//                         first.type === 'id' &&
//                         first.ref?.type === 'toplevel' &&
//                         first.ref.kind === 'macro'
//                     ) {
//                         const macro = this.resolveMacro(first.ref.loc);
//                         if (!macro) {
//                             macroResults.errors[
//                                 keyForLoc(node.loc)
//                             ] = `Cant resolve macro`;
//                             return node;
//                         }
//                         const results = macro(node.items.slice(1));
//                         Object.assign(macroResults.layouts, results.layouts);
//                         Object.assign(macroResults.styles, results.styles);

//                         return results.node;
//                     }
//                 }
//                 return node;
//             });
//             const results = ev.parse(cst, cursor);
//             Object.assign(results.layouts, macroResults.layouts);
//             Object.assign(results.styles, macroResults.styles);
//             return results;
//         },

//         evaluate(top: string, cst: RecNode, cursor?: number) {
//             const results = this.parse(cst, cursor);
//             if (!results.top) {
//                 return;
//             }
//             cache.ast[top] = results.top;
//             // soooo here we get into a thing.
//             // I'd planned to have 'infos' be a map of 'keyForLoc' to tinfo.
//             // BUT recursion dictates
//             // that some tinfos will be group tinfos.
//             //
//             // One idea: some of the tinfos will be `type: group, main: otherid`
//             // just pointers to the ~main one. which will be chosen arbitrarily.
//             // also happens if multiple toplevel nodes come from the same toplevel.
//             const infos = {};
//             const info = ev.infer(results.top, infos);
//         },
//     };
// };
