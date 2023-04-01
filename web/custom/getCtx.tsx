import { getType } from '../../src/get-type/get-types-new';
import { validateExpr } from '../../src/get-type/validate';
import { Ctx, newCtx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { addDef } from '../../src/to-ast/to-ast';
import { Expr } from '../../src/types/ast';
import { Node } from '../../src/types/cst';
import { fromMCST, ListLikeContents, Map } from '../../src/types/mcst';
import { layout } from '../layout';
import { maxSym } from './ByHand';

export const getCtx = (map: Map, root: number) => {
    const tops = (map[root] as ListLikeContents).values;
    let ctx = newCtx();
    ctx.sym.current = maxSym(map) + 1;
    try {
        const rootNode = fromMCST(root, map) as { values: Node[] };
        const exprs: Expr[] = [];
        rootNode.values.forEach((node) => {
            if (node.type === 'blank' || node.type === 'comment') {
                return;
            }
            console.log('processing a node', node.loc.idx);
            const expr = nodeToExpr(node, ctx);
            exprs.push(expr);
            getType(expr, ctx, { errors: ctx.errors, types: {} });
            validateExpr(expr, ctx, ctx.errors);
            ctx = addDef(expr, ctx);
        });
        console.log('done with it U guess');
        tops.forEach((top) => {
            layout(top, 0, map, ctx.display, true);
        });
        const mods = Object.keys(ctx.mods);
        if (mods.length) {
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

export function applyMods(ctx: Ctx, map: Map) {
    Object.keys(ctx.mods).forEach((key) => {
        ctx.mods[+key].forEach((mod) => {
            if (mod.type === 'hash') {
                const node = map[+key];
                if (node.type === 'identifier') {
                    map[+key] = { ...node, hash: mod.hash };
                }
            }
        });
    });
}
