import { Ctx, newCtx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { fromMCST, ListLikeContents, Map } from '../../src/types/mcst';
import { layout } from '../layout';
import { maxSym } from './ByHand';

export const getCtx = (map: Map, root: number) => {
    const tops = (map[root] as ListLikeContents).values;
    const ctx = newCtx();
    ctx.sym.current = maxSym(map) + 1;
    try {
        nodeToExpr(fromMCST(root, map), ctx);
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
