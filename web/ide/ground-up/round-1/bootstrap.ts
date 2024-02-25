//

import { expr, printExpr, unwrapArray } from './parse';

export const evalExpr = (expr: expr, scope: { [key: string]: any }): any => {
    switch (expr.type) {
        case 'eprim':
            if (expr[0].type === 'pstr') {
                // console.log('GOT A THING', JSON.stringify(expr[0][0]));
                return expr[0][0].replaceAll(/\\./g, (m) => {
                    if (m[1] === 'n') {
                        return '\n';
                    }
                    return m[1];
                });
                // return JSON.parse(
                //     '"' + expr[0][0].replaceAll('"', '\\"') + '"',
                // );
            }
            return expr[0][0];
        case 'equot':
            return expr[0];
        case 'evar':
            if (scope[expr[0]] === undefined) {
                // console.log(scope);
                throw new Error(`Unbound variable "${expr[0]}"`);
            }
            return scope[expr[0]];
        case 'elambda':
            return (arg: any) =>
                evalExpr(expr[1], { ...scope, [expr[0]]: arg });
        case 'eapp': {
            const target = evalExpr(expr[0], scope);
            if (typeof target !== 'function') {
                console.warn(target);
            }
            return target(evalExpr(expr[1], scope));
        }
        case 'elet':
            return evalExpr(expr[2], {
                ...scope,
                [expr[0]]: evalExpr(expr[1], scope),
            });
        case 'ematch': {
            const target = evalExpr(expr[0], scope);
            // console.log(target);
            for (let kase of unwrapArray(expr[1])) {
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
                            const items = unwrapArray(kase[0][1]);
                            for (let i = 0; i < items.length; i++) {
                                iscope[items[i]] = target[i];
                            }
                            return evalExpr(kase[1], iscope);
                        } else {
                            // console.log('nope', target.type, kase[0][0]);
                        }
                }
                // console.log(kase[0].type);
            }
            // console.log('targ', target);
            throw new Error(
                `failed to match ${JSON.stringify(target)} ${printExpr(
                    expr[0],
                )}`,
            );
        }
    }
    throw new Error(`nope ${(expr as any).type}`);
};
