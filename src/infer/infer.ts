/*

so like, probably a transformNode situation?
I guess I'll be operating on the expr? yeah.


*/

import equal from 'fast-deep-equal';
import { getType, Report } from '../get-type/get-types-new';
import { matchesType } from '../get-type/matchesType';
import { unifyTypes } from '../get-type/unifyTypes';
import { AutoCompleteReplace, Ctx, noloc } from '../to-ast/Ctx';
import { nodeForType } from '../to-cst/nodeForType';
import { Expr, Node, Pattern, Type } from '../types/ast';
import { Map, MNode, toMCST } from '../types/mcst';
import { transformNode } from '../types/transform-cst';
import { transformExpr, Visitor } from '../types/walk-ast';
import { applyAutoUpdateToNode } from '../../web/custom/reduce';

// Question:
// do I only do this for the tree that I'm
// in right now?
// Or do I do it across the board?
// b/c it could be the case that a thing
// I change just now, locks a local variable
// into place, such that I can now lock
// an ambiguous function call that uses
// that variable. ...

// export const resolveAppliedFunctions = (expr: Expr, ctx: Ctx) => {
//     transformExpr(expr, {
//         Expr(node, ctx) {
//             if (node.type === 'apply' && node.target.type === 'unresolved') {
//             }
//         },
//     }, null)
// }

// export const determineConstraints = (expr: Expr, ctx: Ctx) => {
//     const report: Report = { types: {}, errors: {} };
//     getType(expr, ctx, report);

//     const constraints: { [sym: number]: Constraint[] } = {};

//     const ok = (e: Expr) => {
//         switch (e.type) {
//             case 'apply': {
//                 const fnt = report.types[e.target.form.loc.idx];
//                 if (fnt) {
//                     // hm
//                     // at one level a constraint is 'this matches this type'
//                     // but like
//                     // (+ 2 one.two)
//                     // --> one should be constrained to {two int ..}
//                 }
//                 break;
//             }
//         }
//     };
// };

export type InferMod =
    | AutoCompleteReplace
    | {
          type: 'wrap';
          node: Node;
      }
    | {
          type: 'replace-full';
          node: Node;
      };

export const infer = (exprs: Expr[], ctx: Ctx, map: Map) => {
    const report: Report = { types: {}, errors: {} };
    exprs.forEach((expr) => getType(expr, ctx, report));

    const mods: { [idx: number]: InferMod } = {};

    const usages: { [idx: number]: Type[] } = {};
    const syms: {
        [sym: number]: {
            type: 'direct';
            idx: number;
            current?: Type;
        };
    } = {};

    const visit: Visitor<null> = {
        Expr(node, ctx) {
            if (node.type === 'fn') {
                node.args.forEach((arg) => {
                    if (arg.pattern.type === 'local') {
                        if (arg.type.form.loc.idx !== -1) {
                            usages[arg.pattern.sym] = [arg.type];
                            syms[arg.pattern.sym] = {
                                type: 'direct',
                                idx: arg.type.form.loc.idx,
                                current: arg.type,
                            };
                        } else {
                            syms[arg.pattern.sym] = {
                                type: 'direct',
                                idx: arg.pattern.form.loc.idx,
                            };
                        }
                    }
                });
            }
            if (node.type === 'apply') {
                if (node.target.type === 'local') {
                    // hmm I should do something here
                }
                const t = report.types[node.target.form.loc.idx];
                if (t && t.type === 'fn') {
                    t.args.forEach((arg, i) => {
                        if (i < node.args.length) {
                            const narg = node.args[i];
                            if (narg.type === 'local') {
                                if (!usages[narg.sym]) {
                                    usages[narg.sym] = [];
                                }
                                usages[narg.sym].push(arg);
                            }
                        }
                    });
                }
            }
            return null;
        },
        ExprPost(node) {
            // if (node.type === 'local') {
            //     const sym = node.sym;
            //     if (!usages[sym]) {
            //         usages[sym] = [];
            //     }
            //     usages[sym].push(report.types[node.form.loc.idx]);
            // }
            // if (node.type === 'fn') {
            //     node.args.forEach(arg => {
            //         locals[arg.pattern.form.loc.idx]
            //     })
            // }
            if (node.type === 'apply') {
                const auto = ctx.display[
                    node.target.form.loc.idx
                ]?.autoComplete?.filter(
                    (t) => t.type === 'update' && t.exact,
                ) as AutoCompleteReplace[] | undefined;
                if (
                    node.target.type === 'unresolved' &&
                    node.args.length &&
                    auto?.length
                ) {
                    const args = node.args.map(
                        (arg) => report.types[arg.form.loc.idx],
                    );
                    const scored = auto
                        .map((auto) => {
                            if (auto.ann?.type !== 'fn') {
                                return { auto, res: null, score: -1 };
                            }
                            let score = 0;
                            auto.ann.args.forEach((arg, i) => {
                                if (i < args.length) {
                                    if (
                                        args[i] &&
                                        arg &&
                                        matchesType(args[i], arg, ctx, arg.form)
                                    ) {
                                        score += 1;
                                    }
                                }
                            });
                            return { auto, score, res: auto.ann.body };
                        })
                        .sort((a, b) => b.score - a.score);
                    const best = scored[0];
                    // Don't autoselect unless we have at least
                    // one matching arg
                    // But don't select if multiple have equal score
                    if (
                        best.score > 0 &&
                        (scored.length === 1 || scored[1].score < best.score)
                    ) {
                        mods[node.target.form.loc.idx] = best.auto;
                        report.types[node.form.loc.idx] = best.res!;
                    }
                }
            }
            return null;
        },
    };

    exprs.forEach((expr) => transformExpr(expr, visit, null));

    const inferredTypes: { [sym: number]: Type } = {};
    Object.keys(usages).forEach((key) => {
        if (!syms[+key]) return;
        const types = usages[+key];
        if (types.length === 1) {
            if (types[0] === syms[+key].current) {
                return;
            }
            inferredTypes[+key] = types[0];
        } else {
            let res = types[0];
            for (let t of types.slice(1)) {
                const un = unifyTypes(res, t, ctx, t.form);
                if (!un) {
                    return; // if we can't unify, bail
                    // contine;
                }
                res = un;
            }
            inferredTypes[+key] = res;
        }
    });

    Object.keys(syms).forEach((sym) => {
        const definition = syms[+sym];
        if (!inferredTypes[+sym]) {
            // console.log('no inferred for', sym);
            return;
        }
        switch (definition.type) {
            case 'direct': {
                if (!definition.current) {
                    mods[definition.idx] = {
                        type: 'wrap',
                        node: nodeForType(inferredTypes[+sym], ctx),
                    };
                } else {
                    const node = nodeForType(inferredTypes[+sym], ctx);
                    // if (matchesType(inferredTypes[+sym], definition.current, ctx, []))
                    if (
                        !equal(
                            { ...node, loc: noloc },
                            { ...map[definition.idx], loc: noloc },
                        )
                    ) {
                        // console.log('🎉 New Infer');
                        // console.log('-> ', node);
                        // console.log('<- ', map[definition.idx]);
                        mods[definition.idx] = { type: 'replace-full', node };
                    }
                }
            }
        }
    });

    // next up, we find all the usages of a given local,
    // along with the type annotation.
    // We try to reconcile these things.
    return mods;
};

export const reidx = (node: Node, nidx: () => number, preserveTop = false) =>
    transformNode(node, {
        pre(child, path) {
            if (child === node && preserveTop) return child;
            return { ...child, loc: { ...child.loc, idx: nidx() } };
        },
    });

export function applyInferMod(
    mod: InferMod,
    map: Map,
    nidx: () => number,
    id: number,
) {
    if (mod.type === 'update') {
        map[id] = applyAutoUpdateToNode(map[id], mod);
    } else if (mod.type === 'replace-full') {
        mod.node = { ...mod.node, loc: { ...mod.node.loc, idx: id } };
        delete map[id];
        toMCST(reidx(mod.node, nidx, true), map);
    } else if (mod.type === 'wrap') {
        const id1 = nidx();
        const id2 = toMCST(reidx(mod.node, nidx), map);
        Object.keys(map).forEach((k) => {
            const node = map[+k];
            if (node.type === 'hash' && node.hash === id) {
                map[+k] = { ...node, hash: id1 };
            }
        });
        map[id1] = {
            ...map[id],
            loc: { ...map[id].loc, idx: id1 },
        };
        map[id] = {
            type: 'annot',
            target: id1,
            annot: id2,
            loc: { idx: id, start: 0, end: 0 },
        };
    } else {
        throw new Error('bad mod');
    }
}
