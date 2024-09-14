import objectHash from 'object-hash';
import { reader } from '../evaluators/boot-ex/reader';
import {
    AnyEvaluator,
    Evaluator,
    ParseResult,
} from '../evaluators/boot-ex/types';
import { builtins, SimplestEvaluator } from '../evaluators/simplest';
import {
    foldNode,
    IDRef,
    keyForLoc,
    Loc,
    mapNode,
    RecNode,
} from '../shared/nodes';
import {
    collectModuleComponents,
    ComponentsByModule,
} from './collapse-components';

// const ev = SimplestEvaluator;
// type TypeInfo = NonNullable<
//     ReturnType<(typeof SimplestEvaluator)['infer']>['info']
// >;
// type Result = {
//     tinfo: NonNullable<ReturnType<(typeof SimplestEvaluator)['infer']>['info']>;
//     ir: ReturnType<(typeof SimplestEvaluator)['compile']>;
//     value?: any;
// };
// // const cache: Record<string, Result | true> = {};

export type Context = {
    tops: Record<string, { hash: string; node: RecNode }>;
    modules: Record<string, string[]>;
    moduleForTop: Record<string, string>;
    components: ComponentsByModule;
};

type Caches<Top> = {
    parse: ParseCache<Top>;
    evaluate: Record<string, any>;
};

type ParseCache<Top> = Record<
    string,
    { top: string; hash: string; result: ParseResult<Top> }
>;

export const parse = <Top, Tinfo, IR>(
    top: string,
    ctx: Context,
    cache: ParseCache<Top>,
    ev: Evaluator<Top, Tinfo, IR>,
) => {
    if (!ctx.tops[top]) throw new Error(`unknown top ${top}`);
    const { hash, node } = ctx.tops[top];
    if (cache[top]?.hash === hash) return cache[top];
    const result = ev.parse(node);
    cache[top] = { hash, result, top };
    return cache[top];
};

const compile = <Top, Tinfo, IR>(
    top: string,
    ctx: Context,
    ev: Evaluator<Top, Tinfo, IR>,
    caches: Caches<Top>,
):
    | { type: 'error'; text: string }
    | {
          type: 'success';
          tinfo: Tinfo;
          irs: Record<string, IR>;
          value?: IR;
      } => {
    const getRefs = (top: string) =>
        parse(top, ctx, caches.parse, ev).result.references.map((r) => r.ref);
    const getMod = (top: string) => ctx.moduleForTop[top];

    collectModuleComponents(top, ctx.components, [], getRefs, getMod);

    const module = ctx.moduleForTop[top];
    const head = ctx.components[module].pointers[top];
    const mutuals = ctx.components[module].entries[head];
    const asts: Top[] = [];
    for (let id of mutuals) {
        if (!caches.parse[id].result.top) {
            return {
                type: 'error',
                text: `parse error for ${id} (dep of ${top})`,
            };
        }
        asts.push(caches.parse[id].result.top);
    }
    const ast = asts.length > 1 ? ev.combineMutuallyRecursive(asts) : asts[0];
    const deps = assembleDeps(mutuals, getRefs, ctx);

    const tinfos: Record<string, Tinfo> = {};
    const irs: Record<string, IR> = {};
    for (let dep of deps) {
        const result = compile(dep, ctx, ev, caches);
        if (result.type === 'error') return result;
        // TODO: should this be a map of loc or top -> tinfo?
        tinfos[dep] = result.tinfo;
        Object.assign(irs, result.irs);
    }

    const tinfo = ev.infer(ast, tinfos);
    if (!tinfo.info) {
        return { type: 'error', text: `infer error for ${top}` };
    }

    const ir = ev.compile(ast, tinfo.info);
    Object.assign(irs, ir.byLoc);

    return { type: 'success', irs, value: ir.evaluate, tinfo: tinfo.info };
};

const evaluate = <Top, Tinfo, IR>(
    top: string,
    ctx: Context,
    ev: Evaluator<Top, Tinfo, IR>,
    caches: Caches<Top>,
): { type: 'error'; text: string } | { type: 'success'; value: any } => {
    const result = compile(top, ctx, ev, caches);
    if (result.type === 'error') {
        return result;
    }

    if (!result.value) {
        return {
            type: 'error',
            text: `toplevel ${top} has no expression to evaluate`,
        };
    }

    return ev.evaluate(result.value, result.irs);
};

function assembleDeps(
    mutuals: string[],
    getRefs: (top: string) => IDRef[],
    ctx: Context,
) {
    const deps: string[] = [];
    mutuals.forEach((top) => {
        getRefs(top).forEach((ref) => {
            if (ref.type === 'toplevel') {
                const other = ref.loc[0][0];
                if (mutuals.includes(other)) return;
                const mod = ctx.moduleForTop[other];
                // get the "head" of the connected component
                const head = ctx.components[mod].pointers[other];
                if (!deps.includes(head)) {
                    deps.push(head);
                }
            }
        });
    });
    return deps.sort();
}

const init = <Top>(): { ctx: Context; caches: Caches<Top> } => {
    return {
        ctx: {
            components: {},
            moduleForTop: {},
            modules: {},
            tops: {},
        },
        caches: {
            evaluate: {},
            parse: {},
        },
    };
};

const replaceRefs =
    (refs: Record<string, IDRef>) =>
    (node: RecNode): RecNode => {
        if (node.type === 'id') {
            if (refs[node.text]) {
                return { ...node, ref: refs[node.text] };
            }
        }
        return node;
    };

const addExports = (
    top: string,
    ctx: Context,
    names: Record<string, IDRef>,
    exports: (node: RecNode) => { loc: Loc; kind: string }[],
) => {
    const node = ctx.tops[top].node;

    const ids: Record<string, string> = {};
    foldNode(null, node, (_, node) => {
        if (node.type === 'id') {
            ids[keyForLoc(node.loc)] = node.text;
        }
        return null;
    });

    exports(node).forEach((exp) => {
        const name = ids[keyForLoc(exp.loc)];
        if (!name) {
            console.log(ids, node);
            throw new Error(`no name ${keyForLoc(exp.loc)}`);
        }
        if (names[name]) throw new Error(`duplicate declaration: ${name}`);
        names[name] = { type: 'toplevel', loc: exp.loc, kind: exp.kind };
    });
};

const updateRefs = (
    top: string,
    ctx: Context,
    names: Record<string, IDRef>,
) => {
    const node = ctx.tops[top].node;
    const mapped = mapNode(node, replaceRefs(names));
    ctx.tops[top] = { hash: objectHash(mapped), node: mapped };
};

const add = (text: string, module: string, ctx: Context) => {
    const id = `term${Object.keys(ctx.tops).length}`;
    const node = reader(text, id);
    if (!node) throw new Error(`failed to read: ${text}`);

    ctx.tops[id] = { hash: objectHash(node), node };
    ctx.moduleForTop[id] = module;
    if (!ctx.modules[module]) {
        ctx.modules[module] = [id];
    } else {
        ctx.modules[module].push(id);
    }
    return id;
};

// const inferCache: Record<
//     string,
//     | { type: 'mutual'; top: string }
//     | {
//           type: 'infer';
//           infos: TypeInfos;
//       }
// > = {};
// const cachedInfer = (top: string, ctx: Context, infos: Record<string, any>) => {
//     const key =
// }

// type TypeInfos = Record<string, { hash: string; info: TypeInfo }>;

// type InferResult =
//     | { type: 'loop'; loop: string[] }
//     | { type: 'error'; error: string }
//     | { type: 'infer'; infos: TypeInfos };

// const doInfer = (top: string, ctx: Context, loop: string[]): InferResult => {
//     if (loop.includes(top)) {
//         // inferCache[top] = {type: 'loop', loop}
//         return inferCache[top];
//     }
//     const { result, hash } = doParse(top, ctx);
//     if (!result.top) return { type: 'error', error: `parse of ${top} failed` };

//     const cloop = loop.concat([top]);

//     const deps: TypeInfos = {};

//     const mutuals: string[] = [];
//     for (let { ref } of result.references) {
//         if (ref.type === 'toplevel') {
//             const tinfo = doInfer(ref.loc[0][0], ctx, cloop);
//             if (tinfo.type === 'loop') {
//                 // we are the top of the loop
//                 if (tinfo.loop[tinfo.loop.length - 1] === top) {
//                     mutuals.push(
//                         ...tinfo.loop.filter(
//                             (l) => !mutuals.includes(l) && l !== top,
//                         ),
//                     );
//                 } else {
//                     // the top of the loop will handle it
//                     return tinfo;
//                 }
//             } else if (tinfo.type === 'error') {
//                 return tinfo;
//             } else {
//                 Object.assign(deps, tinfo.infos);
//             }
//         }
//     }

//     let myHash = hash;
//     let ast = result.top;

//     if (mutuals.length) {
//         const others = mutuals.sort().map((top) => doParse(top, ctx));

//         myHash = objectHash([hash, ...others.map(({ hash }) => hash)]);

//         for (let { result, top: id } of others) {
//             if (!result.top) {
//                 return {
//                     type: 'error',
//                     error: `parse of ${id} (mutual recursive dep of ${top}) failed`,
//                 };
//             }
//             for (let { ref } of result.references) {
//                 if (ref.type === 'toplevel') {
//                     const top = ref.loc[0][0];
//                     if (mutuals.includes(top)) continue;
//                     const tinfo = doInfer(top, ctx, []);
//                 }
//             }
//         }

//         ast = ev.combineMutuallyRecursive([
//             result.top,
//             ...others.map(({ result }) => result.top),
//         ]);
//     }

//     const depHashes = Object.keys(deps)
//         .sort()
//         .map((k) => deps[k].hash);
//     const fullHash = objectHash([myHash, ...depHashes]);

//     if (inferCache[top]?.hash === fullHash) {
//         return inferCache[top];
//     }

//     const infos: Record<string, TypeInfo> = {};
//     Object.entries(deps).forEach(([key, { info }]) => (infos[key] = info));
//     const tinfo = ev.infer(ast, infos);
//     if (!tinfo.info) {
//         inferCache[top] = {
//             hash,
//             tinfo: { type: 'error', error: `infer failed` },
//         };
//         return { type: 'error', error: `infer failed` };
//     }

//     deps[top] = { hash: fullHash, info: tinfo.info };

//     inferCache[top] = { type: 'infer', infos: deps };
//     mutuals.forEach((other) => {
//         inferCache[other] = { type: 'mutual', top };
//     });
//     return inferCache[top];
// };

// const evaluate = (top: string, module: Record<string, RecNode>): Result => {
//     if (cache[top] === true) throw new Error(`Cycle!`);
//     if (cache[top]) return cache[top];
//     console.log('eval', top);
//     cache[top] = true;
//     const cst = module[top];
//     if (!cst) throw new Error(`unknown top referenced`);
//     const parsed = ev.parse(cst);
//     if (!parsed.top) {
//         console.log(cst, parsed);
//         throw new Error(`could not parse ${top}`);
//     }

//     const tinfos: Record<string, Result['tinfo']> = {};
//     const irs: Result['ir']['byLoc'] = {};
//     parsed.references.forEach(({ ref }) => {
//         if (ref.type === 'toplevel') {
//             const { tinfo, ir } = evaluate(ref.loc[0][0], module);
//             tinfos[ref.loc[0][0]] = tinfo;
//             Object.assign(irs, ir.byLoc);
//         }
//     });

//     const tinfo = ev.infer(parsed.top, tinfos);
//     if (!tinfo.info) throw new Error(`no type info`);

//     const ir = ev.compile(parsed.top, tinfo.info);
//     Object.assign(irs, ir.byLoc);
//     let value = null;
//     if (ir.evaluate) {
//         value = ev.evaluate(ir.evaluate, irs);
//     }
//     cache[top] = { value, tinfo: tinfo.info, ir };
//     return cache[top];
// };

const full = (ev: AnyEvaluator, raw: Record<string, string[]>) => {
    const exports = (node: RecNode) => ev.parse(node).exports;
    const { ctx, caches } = init();
    const names: Record<string, IDRef> = {};
    Object.keys(builtins).forEach((name) => {
        names[name] = { type: 'builtin', kind: 'value' };
    });

    const ids = [];
    for (let [mod, terms] of Object.entries(raw)) {
        ids.push(...terms.map((text) => add(text, mod, ctx)));
    }
    ids.forEach((id) => addExports(id, ctx, names, exports));
    ids.forEach((id) => updateRefs(id, ctx, names));

    const last = ids[ids.length - 1];
    const result = evaluate(last, ctx, ev, caches);
    console.log('result', result);
};

full(SimplestEvaluator, {
    one: [
        // some definitions
        `(def x 3)`,
        `(def y 13)`,
        '(if (< x 5) (+ x y) "World")',
    ],
});

full(SimplestEvaluator, {
    one: [
        // Transitive dependency
        `(def x 3)`,
        `(def y (+ x 2))`,
        '(if (< x 5) (+ x y) "World")',
    ],
});

full(SimplestEvaluator, {
    // Modules
    one: [`(def x 3)`, `(def y (+ x 2))`],
    two: ['(if (< x 5) (+ x y) "World")'],
});

full(SimplestEvaluator, {
    one: [`((fn [x] (+ x 10)) 34)`],
});

full(SimplestEvaluator, {
    one: [`(defn hi [x] (+ x 10))`, `(hi 34)`],
});

full(SimplestEvaluator, {
    one: [
        `(defn even [x] (if (= x 0) true (odd (- x 1))))`,
        `(defn odd [x] (not (even x)))`,
        `[(even 4) (even 3) (even 2)]`,
    ],
});

// Ok now we get serious. gotta support functions I guess

// const ev = SimplestEvaluator;

// const names: Record<string, IDRef> = {};
// Object.keys(builtins).forEach((name) => {
//     names[name] = { type: 'builtin', kind: 'value' };
// });

// const ids = terms.map((text) => add(text, 'module1', ctx, names, exports));
// const last = ids[ids.length - 1];

// const result = evaluate(last, ctx, ev, caches);
// console.log('result', result);
