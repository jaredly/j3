import { getType } from '../../src/get-type/get-types-new';
import { validateExpr } from '../../src/get-type/validate';
import { Ctx, newCtx } from '../../src/to-ast/Ctx';
import { CstCtx } from '../../src/to-ast/library';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { addDef } from '../../src/to-ast/to-ast';
import { Expr } from '../../src/types/ast';
import { Node } from '../../src/types/cst';
import { fromMCST, ListLikeContents, Map } from '../../src/types/mcst';
import { layout } from '../layout';

export const getCtx = (map: Map, root: number) => {
    const tops = (map[root] as ListLikeContents).values;
    let ctx = newCtx();
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
            layout(top, 0, map, ctx.results.display, true);
        });
        const mods = Object.keys(ctx.results.mods);
        if (mods.length) {
            console.log('2️⃣ mods', ctx.results.mods, map);
            map = { ...map };
            applyMods(ctx, map);
        }
        return { ctx, map, exprs };
    } catch (err) {
        console.log('trying to get ctx', map);
        console.error(err);
        return { ctx, map, exprs: [] };
    }
};

export function applyMods(ctx: CstCtx, map: Map) {
    Object.keys(ctx.results.mods).forEach((key) => {
        ctx.results.mods[+key].forEach((mod) => {
            // UMMMM MAYBE
        });
    });
}
