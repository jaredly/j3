import generate from '@babel/generator';
import * as t from '@babel/types';
import { Expr, Pattern, Record } from '../types/ast';
import { Ctx } from './to-ast';
import { nodeToExpr } from './nodeToExpr';

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
        case 'unresolved':
            return t.identifier('pat_un_' + pattern.reason);
        case 'record':
            const items = tupleRecord(pattern.entries);
            if (items) {
                return t.arrayPattern(
                    items.map((item) => patternToTs(item, ctx)),
                );
            }
            return t.objectPattern(
                pattern.entries.map((entry) =>
                    t.objectProperty(
                        t.identifier(entry.name),
                        patternToTs(entry.value, ctx),
                    ),
                ),
            );
    }
};

export const stmtToTs = (
    expr: Expr,
    ctx: Ctx,
    shouldReturn: boolean | 'top',
): t.Statement => {
    switch (expr.type) {
        case 'def':
            if (shouldReturn === 'top') {
                return t.blockStatement([
                    t.expressionStatement(
                        t.assignmentExpression(
                            '=',
                            t.memberExpression(
                                t.identifier('$terms'),
                                t.stringLiteral(expr.hash),
                                true,
                            ),
                            exprToTs(expr.value, ctx),
                        ),
                    ),
                    t.returnStatement(
                        t.memberExpression(
                            t.identifier('$terms'),
                            t.stringLiteral(expr.hash),
                            true,
                        ),
                    ),
                ]);
            }
            return t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.identifier('h' + expr.hash),
                    exprToTs(expr.value, ctx),
                ),
            ]);
        case 'let':
            const last = expr.body.length - 1;
            return t.blockStatement([
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
            ]);
        case 'if':
            return t.ifStatement(
                exprToTs(expr.cond, ctx),
                stmtToTs(expr.yes, ctx, shouldReturn),
                stmtToTs(expr.no, ctx, shouldReturn),
            );
        default:
            const bex = exprToTs(expr, ctx);
            return shouldReturn
                ? t.returnStatement(bex)
                : t.expressionStatement(bex);
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
    const last = res[res.length - 1];
    if (last.type === 'BlockStatement') {
        res.pop();
        res.push(...last.body);
    }
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
            if (expr.target.type === 'tag') {
                if (expr.args.length === 0) {
                    return t.stringLiteral(expr.target.name);
                }
                return t.objectExpression([
                    t.objectProperty(
                        t.identifier('type'),
                        t.stringLiteral(expr.target.name),
                    ),
                    t.objectProperty(
                        t.identifier('payload'),
                        expr.args.length === 1
                            ? exprToTs(expr.args[0], ctx)
                            : t.arrayExpression(
                                  expr.args.map((arg) => exprToTs(arg, ctx)),
                              ),
                    ),
                ]);
            }
            return t.callExpression(
                exprToTs(expr.target, ctx),
                expr.args.map((arg) => exprToTs(arg, ctx)),
            );
        }
        case 'tag':
            return t.stringLiteral(expr.name);
        case 'local': {
            return t.identifier('s' + expr.sym);
        }
        case 'global': {
            // return t.identifier('h' + expr.hash);
            return t.memberExpression(
                t.identifier('$terms'),
                t.stringLiteral(expr.hash),
                true,
            );
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
            const items = tupleRecord(expr.entries);
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

export const tupleRecord = <T>(entries: { name: string; value: T }[]) => {
    const items: T[] = [];
    const map: { [key: string]: T } = {};
    entries.forEach(({ name, value }) => (map[name] = value));
    for (let i = 0; i < entries.length; i++) {
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
