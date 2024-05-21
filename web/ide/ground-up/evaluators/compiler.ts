import { MetaData, MetaDataMap } from '../../../custom/UIState';
import { Expr, Stmt, TypeInfo } from './analyze';
import { Compiler } from './interface';

export type MetaList = [number, MetaData['trace']][];

export const compiler = (fns: {
    prelude?: Record<string, string>;
    builtins?: string;
    compile: (e: Expr) => (meta: MetaList) => string;
    compile2: (e: Expr) => (info: TypeInfo) => (meta: MetaList) => string;
    compile_stmt: (s: Stmt) => (meta: MetaList) => string;
    compile_stmt2: (s: Stmt) => (info: TypeInfo) => (meta: MetaList) => string;
}): Compiler<Stmt, Expr> => ({
    prelude: fns.prelude,
    builtins: fns.builtins,
    compileExpr(expr, typeInfo, meta) {
        const mm = prepareMeta(meta);
        if (fns.compile2) {
            return fns.compile2(expr)(typeInfo)(mm);
        }
        return fns.compile(expr)(mm);
    },
    compileStmt(stmt, typeInfo, meta) {
        const mm = prepareMeta(meta);
        if (fns.compile_stmt2) {
            return fns.compile_stmt2(stmt)(typeInfo)(mm);
        }
        return fns.compile_stmt(stmt)(mm);
    },
});

function prepareMeta(meta: MetaDataMap): MetaList {
    return Object.entries(meta)
        .map(([k, v]): MetaList[0] => [+k, v.trace])
        .filter((k) => k[1]);
}
