import { transformExpr } from '../../src/types/walk-ast';
import { Expr } from '../../src/types/ast';

export function relocify(expr: Expr) {
    let bad = false;

    let lloc = 1;
    let locMap: { [old: number]: number } = {};
    const reloced = transformExpr(
        expr,
        {
            Loc() {
                return 0;
            },
            Type(node, ctx) {
                if (node.type === 'local') {
                    if (!locMap[node.sym]) {
                        console.error(
                            'no locmap for the local sym type',
                            node.sym,
                            node,
                        );
                        bad = true;
                    }
                    return { ...node, sym: locMap[node.sym] };
                }
                return null;
            },
            Expr(node, ctx) {
                if (node.type === 'loop') {
                    locMap[node.form.loc] = lloc++;
                    return {
                        ...node,
                        form: { ...node.form, loc: locMap[node.form.loc] },
                    };
                }
                if (node.type === 'tfn') {
                    const args = node.args.map((arg) => {
                        locMap[arg.form.loc] = lloc++;
                        return {
                            ...arg,
                            form: { ...arg.form, loc: locMap[arg.form.loc] },
                        };
                    });
                    return { ...node, args };
                }
                if (node.type === 'toplevel') {
                    console.error(`depends on a toplevel cant do it`);
                    bad = true;
                }
                if (node.type === 'local' || node.type === 'recur') {
                    if (!locMap[node.sym]) {
                        console.error(
                            'no locmap for the local sym',
                            node.sym,
                            node,
                        );
                        bad = true;
                    }
                    return { ...node, sym: locMap[node.sym] };
                }
                return null;
            },
            Type_tfn(node, ctx) {
                const args = node.args.map((arg) => {
                    locMap[arg.form.loc] = lloc++;
                    return {
                        ...arg,
                        form: { ...arg.form, loc: locMap[arg.form.loc] },
                    };
                });
                return { ...node, args };
            },
            Pattern(node, ctx) {
                if (node.type === 'local') {
                    locMap[node.sym] = lloc++;
                    return { ...node, sym: locMap[node.sym] };
                }
                return null;
            },
        },
        null,
    );

    if (bad) {
        console.error('bad reloc');
        console.log(expr);
        console.log(locMap);
        console.log(reloced);
        return null;
    }

    return reloced;
}
