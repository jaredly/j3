import { Id, Loc, TextSpan } from '../shared/cnodes';
import { Src } from './dsl3';

export type Spread<Inner> = { type: 'spread'; inner: Inner; src: Src };
export type Expr =
    | { type: 'number'; value: number; src: Src }
    | { type: 'var'; name: string; src: Src }
    | { type: 'text'; spans: TextSpan<Expr>[]; src: Src }
    | { type: 'array'; items: (Expr | Spread<Expr>)[]; src: Src }
    | { type: 'object'; items: { name: Id<Loc>; value: Expr }[]; src: Src }
    | { type: 'call'; target: Expr; args: Expr[]; src: Src }
    | { type: 'attribute'; target: Expr; attribute: Id<Loc>; src: Src }
    | { type: 'index'; target: Expr; index: Expr; src: Src }
    | { type: 'arrow'; args: Id<Loc>[]; body: Expr | Block; src: Src }
    | { type: 'new'; inner: Expr; src: Src }
    | { type: 'bop'; left: Expr; op: string; right: Expr; src: Src };

export type Block = { type: 'block'; contents: Stmt[]; src: Src };
export type Stmt =
    | Block
    | { type: 'if'; cond: Expr; yes: Block; no: null | Block; src: Src }
    | { type: 'return'; value: Expr | null; src: Src }
    | { type: 'throw'; value: Expr; src: Src }
    | { type: 'let'; name: Id<Loc>; value: Expr; src: Src }
    | { type: 'for'; init: Stmt; cond: Expr; update: Expr; src: Src; body: Block }
    | { type: 'expr'; expr: Expr; src: Src }
    // just fow show
    | { type: 'show' };

export const stmtToString = (s: Stmt): string => {
    switch (s.type) {
        case 'block':
            return `{ ${s.contents.map(stmtToString).join(' ')} }`;
        case 'if':
            return `if (${exprToString(s.cond)}) ${stmtToString(s.yes)}${s.no ? ` else ${stmtToString(s.no)}` : ''}`;
        case 'return':
            return `return ${s.value ? exprToString(s.value) : ''};`;
        case 'throw':
            return `throw ${exprToString(s.value)};`;
        case 'let':
            return `let ${s.name.text} = ${exprToString(s.value)};`;
        case 'for':
            return `for (${stmtToString(s.init)} ${exprToString(s.cond)}; ${exprToString(s.update)}) ${stmtToString(s.body)}`;
        case 'expr':
            return `${exprToString(s.expr)};`;
        case 'show':
            return 'show;';
        default:
            throw new Error(`Unknown statement type: ${(s as any).type}`);
    }
};

export function exprToString(e: Expr): string {
    switch (e.type) {
        case 'number':
            return e.value.toString();
        case 'var':
            return e.name;
        case 'text':
            return `"${e.spans
                .map((span) => (span.type === 'text' ? span.text : span.type === 'embed' ? '${' + exprToString(span.item) + '}' : ''))
                .join('')}"`;
        case 'array':
            return `[${e.items.map((item) => (item.type === 'spread' ? '...' + exprToString(item.inner) : exprToString(item))).join(', ')}]`;
        case 'object':
            return `{ ${e.items.map((item) => `${item.name}: ${exprToString(item.value)}`).join(', ')} }`;
        case 'call':
            return `${exprToString(e.target)}(${e.args.map(exprToString).join(', ')})`;
        case 'attribute':
            return `${exprToString(e.target)}.${e.attribute}`;
        case 'index':
            return `${exprToString(e.target)}[${exprToString(e.index)}]`;
        case 'arrow':
            return `(${e.args.map((a) => a.text).join(', ')}) => ${e.body.type === 'block' ? stmtToString(e.body) : exprToString(e.body)}`;
        case 'new':
            return `new ${exprToString(e.inner)}`;
        case 'bop':
            return `${exprToString(e.left)} ${e.op} ${exprToString(e.right)}`;
        default:
            throw new Error(`Unknown expression type: ${(e as any).type}`);
    }
}

export const kwds = ['for', 'return', 'new', 'await', 'throw', 'if', 'case', 'else', 'let', 'const', '=', '..', '.', 'fn'];
export const binops = ['<', '>', '<=', '>=', '!=', '==', '+', '-', '*', '/', '^', '%', '=', '+=', '-=', '|=', '/=', '*='];
