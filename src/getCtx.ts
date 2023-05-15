import { getType } from './get-type/get-types-new';
import { validateExpr } from './get-type/validate';
import { Ctx, newCtx, newEnv } from './to-ast/Ctx';
import { CstCtx, Env } from './to-ast/library';
import { nodeToExpr } from './to-ast/nodeToExpr';
import { addDef } from './to-ast/to-ast';
import { Expr } from './types/ast';
import { Node } from './types/cst';
import { fromMCST, ListLikeContents, Map } from './types/mcst';
import { layout } from './layout';
import { applyInferMod } from './infer/infer';

export const getCtx = (
    map: Map,
    root: number,
    nidx: () => number,
    global: Env = newEnv(),
) => {
    const tops = (map[root] as ListLikeContents).values;
    let ctx = newCtx(global);
    try {
        const rootNode = fromMCST(root, map) as { values: Node[] };
        const exprs: Expr[] = [];
        rootNode.values.forEach((node) => {
            if (node.type === 'blank' || node.type === 'comment') {
                return;
            }
            const expr = nodeToExpr(node, ctx);
            exprs.push(expr);
            getType(expr, ctx, { errors: ctx.results.errors, types: {} });
            validateExpr(expr, ctx, ctx.results.errors);
            ctx = addDef(expr, ctx) as CstCtx;
        });
        tops.forEach((top) => {
            layout(
                top,
                0,
                map,
                ctx.results.display,
                ctx.results.hashNames,
                true,
            );
        });
        const mods = Object.keys(ctx.results.mods);
        if (mods.length) {
            console.log('2️⃣ mods', ctx.results.mods, map);
            map = { ...map };
            applyMods(ctx, map, nidx);
        }

        Object.entries(map).forEach(([k, node]) => {
            if (node.type === 'identifier') {
                ctx.results.hashNames[+k] = node.text;
            }
        });

        return { ctx, map };
    } catch (err) {
        console.log('trying to get ctx', map);
        console.error(err);
        return { ctx, map };
    }
};

export function applyMods(ctx: CstCtx, map: Map, nidx: () => number) {
    Object.keys(ctx.results.mods).forEach((key) => {
        applyInferMod(ctx.results.mods[+key], map, nidx, +key);
    });
}
