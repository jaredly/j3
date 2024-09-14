import objectHash from 'object-hash';
import { reader } from '../evaluators/boot-ex/reader';
import { Evaluator, ParseResult } from '../evaluators/boot-ex/types';
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
    caches: Caches<Top>,
    ev: Evaluator<Top, Tinfo, IR>,
) => {
    if (!ctx.tops[top]) throw new Error(`unknown top ${top}`);

    const { hash, node } = ctx.tops[top];

    const macros = ev.macrosToExpand(node);
    if (macros.length === 0) {
        if (caches.parse[top]?.hash === hash) return caches.parse[top];
    } else {
        const toFind: Record<string, Loc> = {};
        macros.forEach(({ ref: { loc } }) => {
            toFind[keyForLoc(loc)] = loc;
        });
        const loaded: Record<string, (...cst: RecNode[]) => RecNode> = {};
        const module = ctx.moduleForTop[top];
        Object.values(toFind).forEach((loc) => {
            const mtop = loc[0][0];
            const omod = ctx.moduleForTop[mtop];
            if (omod === module) {
                // const got = compile(mtop, ctx, ev, caches);
            }
        });
    }
    // TODO: figure out caching if we have macros in play

    // ok, with macros, we can't just rely on the hash, now can we.

    const result = ev.parse(node);
    caches.parse[top] = { hash, result, top };
    return caches.parse[top];
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
    console.log('please compile', top);
    const getRefs = (top: string) =>
        parse(top, ctx, caches, ev).result.references.map((r) => r.ref);
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

    try {
        return {
            type: 'success',
            value: ev.evaluate(result.value, result.irs),
        };
    } catch (err) {
        return { type: 'error', text: (err as Error).message };
    }
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

export const full = (raw: Record<string, string[]>) => {
    const ev = SimplestEvaluator;
    const exports = (node: RecNode) => ev.parse(node).exports;
    const { ctx, caches } = init();
    const names: Record<string, IDRef> = {};
    Object.keys(builtins).forEach((name) => {
        names[name] = { type: 'builtin', kind: 'value' };
    });

    const ids: string[] = [];
    for (let [mod, terms] of Object.entries(raw)) {
        ids.push(...terms.map((text) => add(text, mod, ctx)));
    }
    ids.forEach((id) => addExports(id, ctx, names, exports));
    ids.forEach((id) => updateRefs(id, ctx, names));

    const last = ids[ids.length - 1];
    const result = evaluate(last, ctx, ev, caches);
    if (result.type === 'error') {
        throw new Error(result.text);
    }
    return result.value;
};
