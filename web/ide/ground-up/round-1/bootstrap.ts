//

import { expr, pat, printExpr, unwrapArray } from './parse';

export const matchPat = (
    pat: pat,
    target: any,
): { [key: string]: any } | void => {
    switch (pat.type) {
        case 'pany':
            return {};
        case 'pprim':
            switch (pat[0].type) {
                case 'pint':
                    if (target === pat[0][0]) {
                        return {};
                    }
                    return;
                case 'pbool':
                    if (target === pat[0][0]) {
                        return {};
                    }
                    return;
            }
            return;
        case 'pstr':
            if (target === pat[0]) {
                return {};
            }
            return;
        case 'pvar':
            return { [pat[0]]: target };
        case 'pcon':
            if (target.type === pat[0]) {
                const items = unwrapArray(pat[1]);
                const bindings = {};
                for (let i = 0; i < items.length; i++) {
                    const inner = matchPat(items[i], target[i]);
                    if (!inner) return;
                    Object.assign(bindings, inner);
                }
                return bindings;
            }
            return;
    }
};

export const slash = (n: string) =>
    n.replaceAll(/\\./g, (m) => {
        if (m[1] === 'n') {
            return '\n';
        }
        if (m[1] === 't') {
            return '\t';
        }
        if (m[1] === 'r') {
            return '\r';
        }
        return m[1];
    });

export const evalExpr = (expr: expr, scope: { [key: string]: any }): any => {
    switch (expr.type) {
        case 'estr':
            return `${slash(expr[0])}${unwrapArray(expr[1])
                .map((item) => `${evalExpr(item[0], scope)}${slash(item[1])}`)
                .join('')}`;

        case 'eprim':
            // if (expr[0].type === 'pstr') {
            // return expr[0][0].replaceAll(/\\./g, (m) => {
            //     if (m[1] === 'n') {
            //         return '\n';
            //     }
            //     return m[1];
            // });
            // }
            return expr[0][0];
        case 'equot':
            return expr[0];
        case 'evar':
            if (scope[expr[0]] === undefined) {
                console.log(scope);
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
                const bindings = matchPat(kase[0], target);
                if (bindings) {
                    return evalExpr(kase[1], {
                        ...scope,
                        ...bindings,
                    });
                }

                // switch (kase[0].type) {
                //     case 'pany':
                //         return evalExpr(kase[1], scope);
                //     case 'pprim':
                //         switch (kase[0][0].type) {
                //             case 'pint':
                //                 if (target === kase[0][0][0]) {
                //                     return evalExpr(kase[1], scope);
                //                 }
                //                 continue;
                //             case 'pbool':
                //                 if (target === kase[0][0][0]) {
                //                     return evalExpr(kase[1], scope);
                //                 }
                //                 continue;
                //             case 'pstr':
                //                 if (target === kase[0][0][0]) {
                //                     return evalExpr(kase[1], scope);
                //                 }
                //                 continue;
                //         }
                //         continue;
                //     case 'pvar':
                //         return evalExpr(kase[1], {
                //             ...scope,
                //             [kase[0][0]]: target,
                //         });
                //     case 'pcon':
                //         if (target.type === kase[0][0]) {
                //             const iscope = { ...scope };
                //             const items = unwrapArray(kase[0][1]);
                //             for (let i = 0; i < items.length; i++) {
                //                 iscope[items[i]] = target[i];
                //             }
                //             return evalExpr(kase[1], iscope);
                //         } else {
                //             // console.log('nope', target.type, kase[0][0]);
                //         }
                // }
                // console.log(kase[0].type);
            }
            // console.log('targ', target);
            throw new Error(
                `failed to match: target = ${JSON.stringify(
                    target,
                )} : expr = ${printExpr(expr[0])}`,
            );
        }
    }
    throw new Error(`nope ${(expr as any).type}`);
};
