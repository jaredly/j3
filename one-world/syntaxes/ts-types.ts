import { Src } from '../keyboard/handleShiftNav';
import { TextSpan, Id, Loc } from '../shared/cnodes';
import { nodesSrc, mergeSrc } from './ts';

export type Pat =
    | { type: 'var'; name: string; src: Src }
    | { type: 'array'; values: SPat[]; src: Src }
    | { type: 'default'; inner: Pat; value: Expr; src: Src }
    | { type: 'record'; values: PRecordRow[]; src: Src }
    | { type: 'typed'; inner: Pat; ann: Type; src: Src }
    | PCon
    | { type: 'text'; spans: TextSpan<Pat>[]; src: Src };
export type SPat = Pat | { type: 'spread'; inner: Pat; src: Src };
export type Type =
    | { type: 'ref'; name: string; src: Src }
    | { type: 'app'; target: Type; args: Type[]; src: Src }
    | { type: 'fn'; args: { name: string; type: Type }[]; body: Type; src: Src };
type PRecordRow =
    | { type: 'spread'; inner: Pat; src: Src }
    | {
          type: 'row';
          name?: string; // if name is undef, then value should be var or default(var)
          nsrc: Src;
          value: Pat;
          src: Src;
      };
export type PCon = { type: 'constr'; constr: Id<Loc>; args: Pat[]; src: Src };

export type SExpr = Expr | { type: 'spread'; inner: Expr; src: Src };
export type Expr =
    | { type: 'var'; name: string; src: Src }
    | { type: 'text'; spans: TextSpan<SExpr>[]; src: Src }
    | { type: 'array'; items: SExpr[]; src: Src }
    | { type: 'tuple'; items: SExpr[]; src: Src }
    // Is this how I want to do it?
    // OR do I make associativity more explicit?
    | { type: 'bops'; op: Id<Loc>; items: Expr[]; src: Src }
    // | ESmoosh
    | { type: 'record'; rows: RecordRow[]; src: Src }
    | { type: 'call'; target: Expr; args: SExpr[]; src: Src }
    | { type: 'uop'; op: Id<Loc>; target: Expr; src: Src }
    | { type: 'attribute'; target: Expr; attribute: Id<Loc>; src: Src }
    | { type: 'index'; target: Expr; items: SExpr[]; src: Src }
    | Fancy;

// Stmtssss
// Ok, so Exprs, Pats, and Stmts...
type Visitor<T> = {
    expr(expr: SExpr, v: T): T;
    stmt(stmt: Stmt, v: T): T;
    pat(pat: SPat, v: T): T;
    typ(typ: Type, v: T): T;
};

export const stmtSpans = (stmt: Stmt) => {
    const spans: Src[] = [];
    foldStmt<void>(stmt, undefined, {
        expr(expr, v) {
            spans.push(expr.src);
        },
        pat(pat, v) {
            spans.push(pat.src);
        },
        stmt(stmt, v) {
            spans.push(stmt.src);
        },
        typ(typ, v) {
            spans.push(typ.src);
        },
    });
    return spans;
};

export const foldType = <T>(typ: Type, i: T, v: Visitor<T>): T => {
    i = v.typ(typ, i);
    switch (typ.type) {
        case 'fn':
            typ.args.forEach((arg) => {
                i = foldType(arg.type, i, v);
            });
            i = foldType(typ.body, i, v);
            return i;
        case 'app':
            i = foldType(typ.target, i, v);
            typ.args.forEach((arg) => {
                i = foldType(arg, i, v);
            });
            return i;
    }
    return i;
};

export const foldPat = <T>(pat: SPat, i: T, v: Visitor<T>): T => {
    i = v.pat(pat, i);
    switch (pat.type) {
        case 'array':
            pat.values.forEach((item) => {
                i = foldPat(item, i, v);
            });
            return i;
        case 'typed':
            i = foldPat(pat.inner, i, v);
            i = foldType(pat.ann, i, v);
            return i;
        case 'default':
            i = foldPat(pat.inner, i, v);
            i = foldExpr(pat.value, i, v);
            return i;
        case 'record':
            pat.values.forEach((row) => {
                if (row.type === 'spread') {
                    i = foldPat(row.inner, i, v);
                } else {
                    i = foldPat(row.value, i, v);
                }
            });
            return i;
        case 'var':
            return i;
        case 'constr':
            pat.args.forEach((arg) => {
                i = foldPat(arg, i, v);
            });
            return i;
        case 'text':
            pat.spans.forEach((span) => {
                if (span.type === 'embed') {
                    i = foldPat(span.item, i, v);
                }
            });
            return i;
        case 'spread':
            return foldPat(pat.inner, i, v);
    }
};

export const foldStmt = <T>(stmt: Stmt, i: T, v: Visitor<T>): T => {
    i = v.stmt(stmt, i);

    switch (stmt.type) {
        case 'expr':
            return foldExpr(stmt.expr, i, v);
        case 'return':
            return stmt.value ? foldExpr(stmt.value, i, v) : i;
        case 'throw':
            return foldExpr(stmt.target, i, v);
        case 'let':
            i = foldPat(stmt.pat, i, v);
            return foldExpr(stmt.value, i, v);
        case 'for':
            i = foldExpr(stmt.init, i, v);
            i = foldExpr(stmt.cond, i, v);
            i = foldExpr(stmt.cond, i, v);
            if (Array.isArray(stmt.body)) {
                stmt.body.forEach((s) => {
                    i = foldStmt(s, i, v);
                });
            } else {
                i = foldStmt(stmt.body, i, v);
            }
            return i;
    }
};

export const foldExpr = <T>(expr: SExpr | Blank, i: T, v: Visitor<T>): T => {
    if (expr.type === 'blank') return i;
    i = v.expr(expr, i);

    switch (expr.type) {
        case 'spread':
            foldExpr(expr.inner, i, v);
            return i;
        case 'text':
            expr.spans.forEach((span) => {
                if (span.type === 'embed') {
                    i = foldExpr(span.item, i, v);
                }
            });
            return i;
        case 'array':
        case 'tuple':
        case 'bops':
            expr.items.forEach((item) => {
                i = foldExpr(item, i, v);
            });
            return i;
        case 'call':
            i = foldExpr(expr.target, i, v);
            expr.args.forEach((arg) => {
                i = foldExpr(arg, i, v);
            });
            return i;
        case 'uop':
        case 'attribute':
            i = foldExpr(expr.target, i, v);
            return i;
        case 'index':
            i = foldExpr(expr.target, i, v);
            expr.items.forEach((item) => {
                i = foldExpr(item, i, v);
            });
            return i;
        case 'fn':
            expr.args.forEach((pat) => {
                i = foldPat(pat, i, v);
            });
            if (Array.isArray(expr.body)) {
                expr.body.forEach((stmt) => {
                    i = foldStmt(stmt, i, v);
                });
            } else {
                i = foldExpr(expr.body, i, v);
            }
            return i;
        case 'if':
            i = foldExpr(expr.cond, i, v);
            expr.yes.forEach((stmt) => {
                i = foldStmt(stmt, i, v);
            });
            expr.no?.forEach((stmt) => {
                i = foldStmt(stmt, i, v);
            });
            return i;
        case 'case':
            i = foldExpr(expr.target, i, v);
            expr.cases.forEach((kase) => {
                i = foldPat(kase.pat, i, v);
                if (Array.isArray(kase.body)) {
                    kase.body.forEach((stmt) => {
                        i = foldStmt(stmt, i, v);
                    });
                } else {
                    i = foldExpr(kase.body, i, v);
                }
            });
            return i;
        case 'record':
            expr.rows.forEach((row) => {
                if (row.type === 'single') {
                    i = foldExpr(row.inner, i, v);
                } else {
                    i = foldExpr(row.value, i, v);
                }
            });
        default:
            return i;
    }
};
export type Fn = { type: 'fn'; args: Pat[]; body: Stmt[] | Expr; src: Src };
export type Fancy =
    | Fn
    | { type: 'new'; target: Expr; src: Src }
    | { type: 'await'; target: Expr; src: Src }
    | { type: 'if'; cond: Expr; yes: Stmt[]; no?: Stmt[] | null; src: Src }
    | { type: 'case'; target: Expr; cases: { pat: Pat; body: Stmt[] | Expr }[]; src: Src };
export type ESmoosh = { type: 'smooshed'; prefixes: Id<Loc>[]; base: Expr; suffixes: Suffix[]; src: Src };
export type Suffix =
    | { type: 'index'; items: SExpr[]; src: Src }
    | { type: 'call'; items: SExpr[]; src: Src }
    | { type: 'suffix'; op: Id<Loc>; src: Src }
    | { type: 'attribute'; attribute: Id<Loc>; src: Src };
export type RecordRow = { type: 'single'; inner: SExpr } | { type: 'row'; key: Id<Loc>; value: Expr };
export type Stmt =
    | { type: 'expr'; expr: Expr; src: Src }
    | { type: 'throw'; target: Expr; src: Src }
    | { type: 'return'; value?: Expr; src: Src }
    | { type: 'for'; init: Expr | Blank; cond: Expr | Blank; update: Expr | Blank; src: Src; body: Stmt[] | Stmt }
    | { type: 'let'; pat: Pat; value: Expr; src: Src };
type Blank = { type: 'blank'; src: Src };
export const unops = ['+', '-', '!', '~'];
export const suffixops = ['++', '--'];
export const kwds = ['for', 'return', 'new', 'await', 'throw', 'if', 'case', 'else', 'let', 'const', '=', '..', '.', 'fn'];
export const binops = ['<', '>', '<=', '>=', '!=', '==', '+', '-', '*', '/', '^', '%', '=', '+=', '-=', '|=', '/=', '*='];
export const precedence = [
    //
    ['=', '+=', '-=', '|=', '/=', '*='],
    ['!=', '=='],
    ['>', '<', '>=', '<='],
    ['%'],
    ['+', '-'],
    ['*', '/'],
    ['^'],
];
const opprec: Record<string, number> = {};
precedence.forEach((row, i) => {
    row.forEach((n) => (opprec[n] = i));
});
type Data = { type: 'tmp'; left: Expr | Data; op: Id<Loc>; prec: number; right: Expr | Data };
const add = (data: Data | Expr, op: Id<Loc>, right: Expr): Data => {
    const prec = opprec[op.text];
    if (data.type !== 'tmp' || prec <= data.prec) {
        return { type: 'tmp', left: data, op, prec, right };
    } else {
        return { ...data, right: add(data.right, op, right) };
    }
};
const dataToExpr = (data: Data | Expr): Expr => {
    if (data.type !== 'tmp') return data;
    const left = dataToExpr(data.left);
    const right = dataToExpr(data.right);
    return {
        type: 'call',
        target: { type: 'var', name: data.op.text, src: nodesSrc(data.op) },
        args: [left, right],
        src: mergeSrc(left.src, right.src),
    };
};
// This is probably the same algorithm as the simple precedence parser
// https://en.wikipedia.org/wiki/Simple_precedence_parser
export const partition = (left: Expr, rights: { op: Id<Loc>; right: Expr }[]) => {
    let data: Data | Expr = left;
    rights.forEach(({ op, right }) => {
        data = add(data, op, right);
    });
    return dataToExpr(data);
};
