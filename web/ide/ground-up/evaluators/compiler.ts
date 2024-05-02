import { MetaData, MetaDataMap } from '../../../custom/UIState';
import { Expr, Stmt } from './analyze';
import { Compiler } from './interface';

export type MetaList = [number, MetaData['trace']][];

export const compiler = (fns: {
    prelude?: Record<string, string>;
    compile: (e: Expr) => (meta: MetaList) => string;
    compile_stmt: (s: Stmt) => (meta: MetaList) => string;
}): Compiler<Stmt, Expr> => ({
    compileExpr(expr, meta) {
        const mm = prepareMeta(meta);
        return fns.compile(expr)(mm);
    },
    compileStmt(stmt, meta) {
        const mm = prepareMeta(meta);
        return fns.compile_stmt(stmt)(mm);
    },
});

function prepareMeta(meta: MetaDataMap): MetaList {
    return Object.entries(meta)
        .map(([k, v]): MetaList[0] => [+k, v.trace])
        .filter((k) => k[1]);
}
