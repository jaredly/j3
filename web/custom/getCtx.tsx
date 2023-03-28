import { getType } from '../../src/get-type/get-types-new';
import { Ctx, newCtx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { Node } from '../../src/types/cst';
import { fromMCST, ListLikeContents, Map } from '../../src/types/mcst';
import { layout } from '../layout';
import { maxSym } from './ByHand';

export const getCtx = (map: Map, root: number) => {
    const tops = (map[root] as ListLikeContents).values;
    const ctx = newCtx();
    ctx.sym.current = maxSym(map) + 1;
    try {
        const rootNode = fromMCST(root, map) as { values: Node[] };
        rootNode.values.forEach((node) => {
            const expr = nodeToExpr(node, ctx);
            getType(expr, ctx, { errors: ctx.errors, types: {} });
        });
        tops.forEach((top) => {
            layout(top, 0, map, ctx.display, true);
        });
        const mods = Object.keys(ctx.mods);
        if (mods.length) {
            map = { ...map };
            applyMods(ctx, map);
        }
        return { ctx, map };
    } catch (err) {
        return { ctx, map };
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
