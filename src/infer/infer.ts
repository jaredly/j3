/*

so like, probably a transformNode situation?
I guess I'll be operating on the expr? yeah.


*/

import { getType, Report } from '../get-type/get-types-new';
import { matchesType } from '../get-type/matchesType';
import { AutoCompleteReplace, Ctx } from '../to-ast/Ctx';
import { Expr, Type } from '../types/ast';
import { transformExpr, Visitor } from '../types/walk-ast';

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

export const infer = (exprs: Expr[], ctx: Ctx) => {
    const report: Report = { types: {}, errors: {} };
    exprs.forEach((expr) => getType(expr, ctx, report));

    const mods: { [idx: number]: AutoCompleteReplace } = {};

    const locals: { [idx: number]: Expr[] } = {};

    const visit: Visitor<null> = {
        Expr(node) {
            if (node.type === 'local') {
                const sym = node.sym;
                if (!locals[sym]) {
                    locals[sym] = [];
                }
                // locals[sym].push(report.types[node.]])
                // OK START HERE
                // so what I actually want is like a system
                // that builds up the constraints on a given thing
                // ... yeah, and then I can do a compare ...
                // fortunately, I'm not trying to do it all at once.
                // right?
            }
            // if (node.type === 'fn') {
            //     node.args.forEach(arg => {
            //         locals[arg.pattern.form.loc.idx]
            //     })
            // }
            if (node.type === 'apply') {
                console.log('apply', node);
                const auto = ctx.display[
                    node.form.loc.idx
                ]?.autoComplete?.filter((t) => t.type === 'replace') as
                    | AutoCompleteReplace[]
                    | undefined;
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
                            if (auto.ann.type !== 'fn') {
                                return { auto, score: -1 };
                            }
                            let score = 0;
                            auto.ann.args.forEach((arg, i) => {
                                if (i < args.length) {
                                    if (
                                        matchesType(args[i], arg, ctx, arg.form)
                                    ) {
                                        score += 1;
                                    }
                                }
                            });
                            return { auto, score };
                        })
                        .sort((a, b) => b.score - a.score);
                    const best = scored[0];
                    // Don't autoselect unless we have at least
                    // one matching arg
                    if (best.score > 0) {
                        mods[node.form.loc.idx] = best.auto;
                    }
                }
            }
            return null;
        },
    };

    exprs.forEach((expr) => transformExpr(expr, visit, null));

    // next up, we find all the usages of a given local,
    // along with the type annotation.
    // We try to reconcile these things.
    return mods;
};
