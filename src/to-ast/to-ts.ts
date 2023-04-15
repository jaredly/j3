import generate from '@babel/generator';
import * as t from '@babel/types';
import { SerializedEditorState } from 'lexical';
import { Expr, Pattern, Record } from '../types/ast';
import { Ctx } from './Ctx';
import { nodeToExpr } from './nodeToExpr';

const isValidIdentifier = (text: string) =>
    !!text.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/);

export const patternToCheck = (
    pattern: Pattern,
    target: t.Expression,
    ctx: Ctx,
): t.Expression | null => {
    switch (pattern.type) {
        case 'local':
            return null;
        case 'number':
            return t.binaryExpression(
                '===',
                target,
                t.numericLiteral(pattern.value),
            );
        case 'bool':
            return t.binaryExpression(
                '===',
                target,
                t.booleanLiteral(pattern.value),
            );
        case 'tag': {
            let checks =
                pattern.args.length > 1
                    ? pattern.args.map((arg, i) =>
                          patternToCheck(
                              arg,
                              t.memberExpression(
                                  t.memberExpression(
                                      target,
                                      t.identifier('payload'),
                                  ),
                                  t.numericLiteral(i),
                                  true,
                              ),
                              ctx,
                          ),
                      )
                    : pattern.args.length === 0
                    ? []
                    : [
                          patternToCheck(
                              pattern.args[0],
                              t.memberExpression(
                                  target,
                                  t.identifier('payload'),
                              ),
                              ctx,
                          ),
                      ];

            const tagCheck = t.binaryExpression(
                '===',
                t.memberExpression(target, t.identifier('type')),
                t.stringLiteral(pattern.name),
            );
            checks.unshift(tagCheck);

            return andMany(checks);
        }
        case 'unresolved':
            return t.identifier('pat_un_' + pattern.reason);
        case 'record':
            const checks = pattern.entries.map((item) =>
                patternToCheck(
                    item.value,
                    t.memberExpression(target, t.identifier(item.name)),
                    ctx,
                ),
            );
            return andMany(checks);
    }
};

const ifs = (
    pairs: { cond: t.Expression | null; body: t.Statement[] }[],
): t.Statement => {
    let res = null;
    for (let i = pairs.length - 1; i >= 0; i--) {
        res = t.ifStatement(
            pairs[i].cond ?? t.booleanLiteral(true),
            t.blockStatement(pairs[i].body),
            res,
        );
    }
    return res!;
};

const andMany = (checks: (t.Expression | null)[]): t.Expression | null => {
    let current: null | t.Expression = null;
    checks.forEach((check) => {
        if (!check) return;
        if (!current) {
            current = check;
        } else {
            current = t.logicalExpression('&&', current, check);
        }
    });
    return current;
};

export const patternToTs = (
    pattern: Pattern,
    ctx: Ctx,
): t.Pattern | t.Identifier | null => {
    switch (pattern.type) {
        case 'local':
            return t.identifier(`s${pattern.sym}`);
        case 'number':
        case 'bool':
            return null;
        case 'tag': {
            const inner =
                pattern.args.length > 1
                    ? t.arrayPattern(
                          pattern.args.map((arg) => patternToTs(arg, ctx)),
                      )
                    : pattern.args.length === 0
                    ? null
                    : patternToTs(pattern.args[0], ctx);
            return inner
                ? t.objectPattern([
                      t.objectProperty(t.identifier('payload'), inner),
                  ])
                : null;
        }
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
                pattern.entries
                    .map((entry) => {
                        const v = patternToTs(entry.value, ctx);

                        return v
                            ? t.objectProperty(t.identifier(entry.name), v)
                            : null;
                    })
                    .filter((x) => !!x) as t.ObjectProperty[],
            );
    }
};

export const stmtToTs = (
    expr: Expr,
    ctx: Ctx,
    shouldReturn: boolean | 'top',
): t.Statement => {
    switch (expr.type) {
        case 'blank':
        case 'deftype':
            return t.emptyStatement();
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
                ...expr.bindings.map((binding) => {
                    const pattern = patternToTs(binding.pattern, ctx);
                    return pattern
                        ? t.variableDeclaration(
                              'const',
                              expr.bindings.map((binding) =>
                                  t.variableDeclarator(
                                      pattern,
                                      exprToTs(binding.value, ctx),
                                  ),
                              ),
                          )
                        : t.expressionStatement(exprToTs(binding.value, ctx));
                }),
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
    if (!res.length) {
        return t.blockStatement([]);
    }
    const last = res[res.length - 1];
    if (last.type === 'BlockStatement') {
        res.pop();
        res.push(...last.body);
    }
    return t.blockStatement(res);
};

const childToMarkdown = (child: any) =>
    child.type === 'text'
        ? child.format === 1
            ? `**${child.text}**`
            : child.format === 2
            ? `*${child.text}*`
            : child.format === 16
            ? '`' + child.text + '`'
            : child.format === 0
            ? child.text
            : '!!!' + child.format + child.text
        : child.type === 'link'
        ? `[${child.children.map(childToMarkdown)}](${child.url})`
        : JSON.stringify(child);

const lexicalStateToMarkdown = (state: any): string => {
    return state.root.children
        .map((child: any) =>
            child.type === 'paragraph'
                ? child.children.map(childToMarkdown).join('')
                : child.type === 'heading'
                ? `${'#'.repeat(+child.tag.slice(1))} ${child.children
                      .map(childToMarkdown)
                      .join('')}`
                : child.type,
        )
        .join('\n');
};

export const exprToTs = (expr: Expr, ctx: Ctx): t.Expression => {
    switch (expr.type) {
        case 'array':
            return t.arrayExpression(
                expr.values.map((item) => exprToTs(item, ctx)),
            );
        case 'attachment':
            const props = [
                t.objectProperty(
                    t.identifier('name'),
                    t.stringLiteral(expr.name),
                ),
                t.objectProperty(
                    t.identifier('mime'),
                    t.stringLiteral(expr.file.meta.mime),
                ),
                t.objectProperty(
                    t.identifier('handle'),
                    t.stringLiteral(expr.file.handle),
                ),
            ];
            if (expr.file.meta.type === 'image') {
                props.push(
                    t.objectProperty(
                        t.identifier('width'),
                        t.numericLiteral(expr.file.meta.width),
                    ),
                    t.objectProperty(
                        t.identifier('height'),
                        t.numericLiteral(expr.file.meta.height),
                    ),
                );
            }
            return t.objectExpression(props);
        case 'rich-text':
            return t.stringLiteral(lexicalStateToMarkdown(expr.lexicalJSON));
        case 'recordAccess':
            if (!expr.target) {
                let res: t.Expression = t.identifier('arg');
                for (let attr of expr.items) {
                    const wrap = !isValidIdentifier(attr);
                    res = t.memberExpression(
                        res,
                        wrap ? t.stringLiteral(attr) : t.identifier(attr),
                        wrap,
                    );
                }
                return t.arrowFunctionExpression([t.identifier('arg')], res);
            }
            let res = exprToTs(expr.target, ctx);
            for (let attr of expr.items) {
                const wrap = !isValidIdentifier(attr);
                res = t.memberExpression(
                    res,
                    wrap ? t.stringLiteral(attr) : t.identifier(attr),
                    wrap,
                );
            }
            return res;
        case 'type-apply':
            return exprToTs(expr.target, ctx);
        // case 'tfn': return exprToTs(expr.body, ctx);
        case 'string':
            if (expr.templates.length) {
                return t.templateLiteral(
                    [
                        t.templateElement({
                            raw: expr.first.text,
                            cooked: expr.first.text,
                        }),
                        ...expr.templates.map((template) =>
                            t.templateElement({
                                raw: template.suffix.text,
                                cooked: template.suffix.text,
                            }),
                        ),
                    ],
                    expr.templates.map((t) => exprToTs(t.expr, ctx)),
                );
            }
            return t.stringLiteral(expr.first.text);
        case 'number':
            return t.numericLiteral(expr.value);
        case 'bool':
            return t.booleanLiteral(expr.value);
        case 'apply': {
            if (expr.target.type === 'builtin') {
                const name = expr.target.name.slice(
                    expr.target.name.lastIndexOf('/') + 1,
                );
                if (binops.includes(name as '+') && expr.args.length === 2) {
                    return t.binaryExpression(
                        name as typeof binops[0],
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
        case 'toplevel': {
            // return t.identifier('h' + expr.hash);
            return t.memberExpression(
                t.identifier('$terms'),
                t.stringLiteral(expr.hash + ''),
                true,
            );
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
                expr.args.map(
                    (arg, i) =>
                        patternToTs(arg.pattern, ctx) ??
                        t.identifier('$ignored_' + i),
                ),
                bodyToTs(expr.body, ctx),
            );
        }
        case 'record': {
            const items =
                expr.spreads.length === 0 ? tupleRecord(expr.entries) : null;
            if (items) {
                return t.arrayExpression(
                    items.map((item) => exprToTs(item, ctx)),
                );
            }
            return t.objectExpression([
                ...expr.spreads.map((spread) =>
                    t.spreadElement(exprToTs(spread, ctx)),
                ),
                ...expr.entries.map((entry) => {
                    const wrap = !isValidIdentifier(entry.name);
                    return t.objectProperty(
                        wrap
                            ? t.stringLiteral(entry.name)
                            : t.identifier(entry.name),
                        exprToTs(entry.value, ctx),
                    );
                }),
            ]);
        }
        case 'if': {
            return t.conditionalExpression(
                exprToTs(expr.cond, ctx),
                exprToTs(expr.yes, ctx),
                exprToTs(expr.no, ctx),
            );
        }
        case 'switch': {
            return t.callExpression(
                t.arrowFunctionExpression(
                    [t.identifier('target')],
                    t.blockStatement([
                        ifs(
                            expr.cases.map((kase) => {
                                const cond = patternToCheck(
                                    kase.pattern,
                                    t.identifier('target'),
                                    ctx,
                                );
                                const pat = patternToTs(kase.pattern, ctx);
                                return {
                                    cond,
                                    body: [
                                        ...(pat
                                            ? [
                                                  t.variableDeclaration(
                                                      'const',
                                                      [
                                                          t.variableDeclarator(
                                                              pat,
                                                              t.identifier(
                                                                  'target',
                                                              ),
                                                          ),
                                                      ],
                                                  ),
                                              ]
                                            : []),
                                        stmtToTs(kase.body, ctx, true),
                                    ],
                                };
                            }),
                        ),
                    ]),
                ),
                [exprToTs(expr.target, ctx)],
            );
        }
        case 'unresolved':
            return t.callExpression(t.identifier('fail'), [
                t.stringLiteral('unresolved ' + expr.reason),
            ]);
        case 'builtin': {
            const name = expr.name.slice(expr.name.lastIndexOf('/') + 1);
            if (binops.includes(name as '+')) {
                return t.arrowFunctionExpression(
                    [t.identifier('x'), t.identifier('y')],
                    t.binaryExpression(
                        name as typeof binops[0],
                        t.identifier('x'),
                        t.identifier('y'),
                    ),
                );
            }
            return t.identifier(name.replace(/[-?']/g, '_'));
        }
    }
    return t.stringLiteral('exprToTs Not impl expr ' + expr.type);
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

export const binops = ['==', '!=', '+', '-', '*', '/', '<', '>'] as const;

export const toTs = (exprs: Expr[], ctx: Ctx): string => {
    const nodes = exprs.flatMap((expr) => stmtToTs(expr, ctx, false));
    return generate(t.file(t.program(nodes))).code;
};
