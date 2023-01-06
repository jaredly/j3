import generate from '@babel/generator';
import * as t from '@babel/types';
import { Expr, Pattern } from '../types/ast';
import { Ctx } from './to-ast';

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

export const stmtToTs = (expr: Expr, ctx: Ctx): t.Statement[] => {
    switch (expr.type) {
        case 'def':
            return [
                t.variableDeclaration('const', [
                    t.variableDeclarator(
                        t.identifier(expr.name),
                        exprToTs(expr.value, ctx),
                    ),
                ]),
            ];
        case 'let':
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
                ...expr.body.flatMap((expr) => stmtToTs(expr, ctx)),
            ];
        default:
            return [t.expressionStatement(exprToTs(expr, ctx))];
    }
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
                t.arrowFunctionExpression(
                    [],
                    t.blockStatement(stmtToTs(expr, ctx)),
                ),
                [],
            );
        }
    }
    return t.stringLiteral('Not impl expr ' + expr.type);
};

export const toTs = (exprs: Expr[], ctx: Ctx): string => {
    const nodes = exprs.flatMap((expr) => stmtToTs(expr, ctx));
    return generate(t.file(t.program(nodes))).code;
};
