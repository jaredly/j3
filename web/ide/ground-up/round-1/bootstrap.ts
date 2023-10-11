//

import { expr } from './parse';

export const evalExpr = (expr: expr, scope: { [key: string]: any }): any => {
    switch (expr.type) {
        case 'eprim':
            return expr[0][0];
        case 'evar':
            return scope[expr[0]];
        case 'elambda':
            return (arg: any) =>
                evalExpr(expr[1], { ...scope, [expr[0]]: arg });
        case 'eapp':
            return evalExpr(expr[0], scope)(evalExpr(expr[1], scope));
        case 'elet':
            return evalExpr(expr[2], {
                ...scope,
                [expr[0]]: evalExpr(expr[1], scope),
            });
        case 'ematch': {
            const target = evalExpr(expr[0], scope);
            for (let kase of expr[1]) {
                switch (kase[0].type) {
                    case 'pany':
                        return evalExpr(kase[1], scope);
                    case 'pvar':
                        return evalExpr(kase[1], {
                            ...scope,
                            [kase[0][0]]: target,
                        });
                    case 'pcon':
                        if (target.type === kase[0][0]) {
                            const iscope = { ...scope };
                            for (let i = 0; i < kase[0][1].length; i++) {
                                iscope[kase[0][1][i]] = target[i];
                            }
                            return evalExpr(kase[1], iscope);
                        }
                }
            }
            throw new Error(`failed to match`);
        }
    }
    throw new Error(`nope ${expr.type}`);
};
