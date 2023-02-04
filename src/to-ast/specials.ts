import { Node } from '../types/cst';
import { Expr, Pattern, Type } from '../types/ast';
import objectHash from 'object-hash';
import { any, Ctx, Local, nil, nilt, noForm, none } from './Ctx';
import { nodeToType } from './nodeToType';
import { nodeToExpr } from './nodeToExpr';
import { err, nodeToPattern } from './nodeToPattern';
import { getType } from '../get-type/get-types-new';
import { patternType } from '../get-type/patternType';
import { subtractType } from '../get-type/subtractType';

export const specials: {
    [key: string]: (form: Node, args: Node[], ctx: Ctx) => Expr;
} = {
    '<>': (form, contents, ctx) => {
        if (contents.length < 2) {
            err(ctx.errors, form, {
                type: 'misc',
                message: `<> requires at least 2 arguments`,
            });
            return nil;
        }
        const [target, ...args] = contents;
        const t = nodeToExpr(target, ctx);
        const targs = args.map((arg) => nodeToType(arg, ctx));
        return {
            type: 'type-apply',
            form,
            target: t,
            args: targs,
        };
    },
    fn: (form, contents, ctx): Expr => {
        if (contents.length < 1) {
            return {
                type: 'fn',
                args: [],
                body: [],
                form,
            };
        }
        if (contents[0].type === 'array') {
            let args: { pattern: Pattern; type: Type }[] = [];
            let locals: Local['terms'] = [];

            let pairs: { pat: Node; type?: Node }[] = [];

            contents[0].values.forEach((arg) => {
                if (arg.type === 'identifier' && arg.text.startsWith(':')) {
                    if (pairs.length) {
                        pairs[pairs.length - 1].type = {
                            ...arg,
                            text: arg.text.slice(1),
                        };
                    }
                } else if (
                    arg.type === 'list' &&
                    arg.values.length > 1 &&
                    arg.values[0].type === 'identifier' &&
                    arg.values[0].text === ':'
                ) {
                    if (pairs.length) {
                        pairs[pairs.length - 1].type =
                            arg.values.length > 2
                                ? {
                                      ...arg,
                                      values: arg.values.slice(1),
                                  }
                                : arg.values[1];
                    }
                } else {
                    pairs.push({ pat: arg });
                }
            });

            pairs.forEach(({ pat, type }) => {
                const t: Type = type
                    ? nodeToType(type, ctx)
                    : { ...any, form: pat };
                if (t.type === 'unresolved') {
                    err(ctx.errors, pat, {
                        type: 'misc',
                        message: `no type given`,
                    });
                }
                args.push({
                    pattern: nodeToPattern(pat, t, ctx, locals),
                    type: t,
                });
            });
            // console.log(pairs);
            locals.forEach(
                (loc) =>
                    (ctx.localMap.terms[loc.sym] = {
                        name: loc.name,
                        type: loc.type,
                    }),
            );
            const ct2: Ctx = {
                ...ctx,
                local: {
                    ...ctx.local,
                    terms: [...locals, ...ctx.local.terms],
                },
            };
            const body = contents.slice(1);
            let ret: Type | undefined;
            if (
                body.length > 0 &&
                body[0].type === 'identifier' &&
                body[0].text.startsWith(':')
            ) {
                ret = nodeToType(
                    {
                        ...body[0],
                        text: body[0].text.slice(1),
                    },
                    ctx,
                );
                body.shift();
            }
            // parse fn args
            return {
                type: 'fn',
                args,
                body: body.map((child) => nodeToExpr(child, ct2)),
                ret,
                form,
            };
        }
        return {
            type: 'fn',
            args: [],
            body: contents.map((child) => nodeToExpr(child, ctx)),
            form,
        };
    },
    deftype: (form, contents, ctx): Expr => {
        if (contents.length !== 2) {
            return { type: 'unresolved', form, reason: 'need just 2 args' };
        }
        const [name, value] = contents;
        if (name.type !== 'identifier') {
            return {
                type: 'unresolved',
                reason: 'cant defn not id ' + name.type,
                form,
            };
        }
        return {
            type: 'deftype',
            name: name.text,
            hash: objectHash(noForm(value)),
            value: nodeToType(value, ctx),
            form,
        };
    },
    defn: (form, contents, ctx): Expr => {
        if (contents.length < 2) {
            err(ctx.errors, form, {
                type: 'misc',
                message: 'defn needs a name and args and a body',
            });
            return { type: 'def', name: '', hash: '', value: nil, form };
            // return { type: 'unresolved', form, reason: 'no engouh args' };
        }
        const [name, ...rest] = contents;
        if (name.type !== 'identifier') {
            return {
                type: 'unresolved',
                reason: 'cant defn not id ' + name.type,
                form,
            };
        }
        const value = specials.fn(form, rest, ctx);
        const hash = objectHash(noForm(value));
        // console.log('hash', hash);
        ctx.display[name.loc.idx] = {
            style: { type: 'id', hash },
        };
        return {
            type: 'def',
            name: name.text,
            hash,
            value,
            form,
        };
    },
    def: (form, contents, ctx): Expr => {
        if (!contents.length) {
            return { type: 'unresolved', form, reason: 'no contents' };
        }
        const first = contents[0];
        if (first.type !== 'identifier') {
            return {
                type: 'unresolved',
                form,
                reason: 'first arg must be an identifier',
            };
        }
        const value = contents.length > 1 ? nodeToExpr(contents[1], ctx) : nil;
        const hash = objectHash(noForm(value));
        // console.log('def hash', first.text, hash);
        ctx.display[first.loc.idx] = { style: { type: 'id', hash } };
        return {
            type: 'def',
            name: first.text,
            hash,
            value,
            form,
        };
    },
    switch: (form, contents, ctx): Expr => {
        if (contents.length < 2) {
            return { type: 'unresolved', form, reason: 'no enough args' };
        }
        const [valueNode, ...cases] = contents;
        const pairs = [];
        const value = nodeToExpr(valueNode, ctx);
        let typ = getType(value, ctx) ?? none;
        for (let i = 0; i < cases.length; i += 2) {
            const bindings: Local['terms'] = [];
            const pattern = nodeToPattern(cases[i], typ, ctx, bindings);
            const pt = patternType(pattern);
            pairs.push({
                pattern: pattern,
                body: cases[i + 1]
                    ? nodeToExpr(cases[i + 1], {
                          ...ctx,
                          local: {
                              ...ctx.local,
                              terms: [...bindings, ...ctx.local.terms],
                          },
                      })
                    : nil,
            });
            const subtracted = subtractType(typ, pt, ctx);
            if (!subtracted) {
                err(ctx.errors, cases[i], {
                    type: 'misc',
                    message: `unreachable case or something`,
                });
            } else {
                typ = subtracted;
            }

            bindings.forEach(
                (loc) =>
                    (ctx.localMap.terms[loc.sym] = {
                        name: loc.name,
                        type: loc.type,
                    }),
            );
        }
        return { type: 'switch', target: value, cases: pairs, form };
    },
    let: (form, contents, ctx): Expr => {
        const first = contents[0];
        if (!first || first.type !== 'array') {
            return { type: 'unresolved', form, reason: 'first not array' };
        }
        ctx.display[first.loc.idx] = { style: 'pairs' };
        const locals: Local['terms'] = [];
        const bindings: { pattern: Pattern; value: Expr; type?: Type }[] = [];
        for (let i = 0; i < first.values.length - 1; i += 2) {
            const value = nodeToExpr(first.values[i + 1], ctx);
            const inferred = getType(value, ctx) ?? nilt;
            bindings.push({
                pattern: nodeToPattern(first.values[i], inferred, ctx, locals),
                value,
                type: inferred,
            });
        }
        locals.forEach(
            (loc) =>
                (ctx.localMap.terms[loc.sym] = {
                    name: loc.name,
                    type: loc.type,
                }),
        );
        const ct2: Ctx = {
            ...ctx,
            local: {
                ...ctx.local,
                terms: [...locals, ...ctx.local.terms],
            },
        };
        return {
            type: 'let',
            bindings,
            form,
            body: contents.slice(1).map((child) => nodeToExpr(child, ct2)),
        };
    },
    if: (form, contents, ctx): Expr => {
        const [cond, yes, no] = contents;
        return {
            type: 'if',
            cond: cond ? nodeToExpr(cond, ctx) : nil,
            yes: yes ? nodeToExpr(yes, ctx) : nil,
            no: no ? nodeToExpr(no, ctx) : nil,
            form,
        };
    },
    ',': (form, contents, ctx): Expr => {
        return {
            type: 'record',
            form,
            entries: contents.map((item, i) => ({
                name: i.toString(),
                value: nodeToExpr(item, ctx),
            })),
        };
    },
};

/*

so, maybe we need a type that's "anything"
.. 'top'

patternIsExhaustive

patternType ...
subtractType ...

*/
