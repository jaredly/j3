import generate from '@babel/generator';
import * as t from '@babel/types';
import { Expr, Pattern, Record } from '../types/ast';
import { Ctx, nodeToExpr } from './to-ast';

export const patternToTs = (
    pattern: Pattern,
    ctx: Ctx,
): t.Pattern | t.Identifier => {
    switch (pattern.type) {
        case 'local':
            return t.identifier(`s${pattern.sym}`);
        case 'number':
            return t.identifier('_');
        case 'tag':
            return t.objectPattern([
                t.objectProperty(
                    t.identifier('payload'),
                    pattern.args.length > 1
                        ? t.arrayPattern(
                              pattern.args.map((arg) => patternToTs(arg, ctx)),
                          )
                        : patternToTs(pattern.args[0], ctx),
                ),
            ]);
    }
    return t.identifier('pat_' + pattern.type);
};

export const stmtToTs = (
    expr: Expr,
    ctx: Ctx,
    shouldReturn: boolean,
): t.Statement[] => {
    switch (expr.type) {
        case 'def':
            return [
                t.variableDeclaration('const', [
                    t.variableDeclarator(
                        t.identifier('h' + expr.hash),
                        exprToTs(expr.value, ctx),
                    ),
                ]),
            ];
        case 'let':
            const last = expr.body.length - 1;
            return [
                t.variableDeclaration(
                    'const',
                    expr.bindings.map((binding) =>
                        t.variableDeclarator(
                            patternToTs(binding.pattern, ctx),
                            exprToTs(binding.value, ctx),
                        ),
                    ),
                ),
                ...expr.body.flatMap((expr, i) =>
                    stmtToTs(expr, ctx, shouldReturn && i === last),
                ),
            ];
        case 'if':
            return [
                t.ifStatement(
                    exprToTs(expr.cond, ctx),
                    t.blockStatement(stmtToTs(expr.yes, ctx, shouldReturn)),
                    t.blockStatement(stmtToTs(expr.no, ctx, shouldReturn)),
                ),
            ];
        default:
            const bex = exprToTs(expr, ctx);
            return [
                shouldReturn
                    ? t.returnStatement(bex)
                    : t.expressionStatement(bex),
            ];
    }
};

export const bodyToTs = (
    exprs: Expr[],
    ctx: Ctx,
): t.BlockStatement | t.Expression => {
    const res = exprs.flatMap((expr, i) =>
        stmtToTs(expr, ctx, i === exprs.length - 1),
    );
    if (res.length === 1 && res[0].type === 'ReturnStatement') {
        return res[0].argument!;
    }
    // const idx = res.length - 1;
    // const last = res[idx];
    // if (last.type === 'ExpressionStatement') {
    //     res[idx] = t.returnStatement(last.expression);
    // }
    return t.blockStatement(res);
};

export const exprToTs = (expr: Expr, ctx: Ctx): t.Expression => {
    switch (expr.type) {
        case 'number':
            return t.numericLiteral(expr.value);
        case 'apply': {
            if (expr.target.type === 'builtin') {
                const name = ctx.global.builtins.namesBack[expr.target.hash];
                if (name === '==' || name === '+' || name === '<') {
                    return t.binaryExpression(
                        name,
                        exprToTs(expr.args[0], ctx),
                        exprToTs(expr.args[1], ctx),
                    );
                }
            }
            return t.callExpression(
                exprToTs(expr.target, ctx),
                expr.args.map((arg) => exprToTs(arg, ctx)),
            );
        }
        case 'local': {
            return t.identifier('s' + expr.sym);
        }
        case 'global': {
            return t.identifier('h' + expr.hash);
        }
        case 'let': {
            return t.callExpression(
                t.arrowFunctionExpression([], bodyToTs([expr], ctx)),
                [],
            );
        }
        case 'fn': {
            return t.arrowFunctionExpression(
                expr.args.map((arg) => patternToTs(arg.pattern, ctx)),
                bodyToTs(expr.body, ctx),
            );
        }
        case 'record': {
            const items = tupleRecord(expr);
            if (items) {
                return t.arrayExpression(
                    items.map((item) => exprToTs(item, ctx)),
                );
            }
            return t.objectExpression(
                expr.entries.map((entry) =>
                    t.objectProperty(
                        t.identifier(entry.name),
                        exprToTs(entry.value, ctx),
                    ),
                ),
            );
        }
        case 'if': {
            return t.conditionalExpression(
                exprToTs(expr.cond, ctx),
                exprToTs(expr.yes, ctx),
                exprToTs(expr.no, ctx),
            );
        }
        case 'unresolved':
            return t.callExpression(t.identifier('fail'), [
                t.stringLiteral('unresolved ' + expr.reason),
            ]);
    }
    return t.stringLiteral('Not impl expr ' + expr.type);
};

export const tupleRecord = (t: Record) => {
    const items: Expr[] = [];
    const map: { [key: string]: Expr } = {};
    t.entries.forEach(({ name, value }) => (map[name] = value));
    for (let i = 0; i < t.entries.length; i++) {
        if (map[i] == null) {
            return null;
        }
        items.push(map[i]);
    }
    return items;
};

export const toTs = (exprs: Expr[], ctx: Ctx): string => {
    const nodes = exprs.flatMap((expr) => stmtToTs(expr, ctx, false));
    return generate(t.file(t.program(nodes))).code;
};
