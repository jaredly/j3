import { Node, NodeArray, NodeExtra } from '../types/cst';
import { Expr, FnType, Pattern, Type } from '../types/ast';
import objectHash from 'object-hash';
import { any, Ctx, Local, Mod, nil, nilt, noForm, none } from './Ctx';
import { nodeToType, parseTypeArgs } from './nodeToType';
import { ensure, filterComments, nodeToExpr } from './nodeToExpr';
import { err, nodeToPattern } from './nodeToPattern';
import { TaskType, getType, maybeEffectsType } from '../get-type/get-types-new';
import { patternType } from '../get-type/patternType';
import { subtractType } from '../get-type/subtractType';
import { CstCtx } from './library';
import { _matchOrExpand, matchesType } from '../get-type/matchesType';
import { nodeToString } from '../to-cst/nodeToString';
import { nodeForType } from '../to-cst/nodeForType';

export const addMod = (ctx: Ctx, idx: number, mod: Mod) => {
    if (!ctx.mods[idx]) {
        ctx.mods[idx] = [mod];
    } else {
        ctx.mods[idx].push(mod);
    }
};

const doHash = (x: Expr | Type) => JSON.stringify(noForm(x)); // objectHash

export const specials: {
    [key: string]: (
        form: Node,
        args: Node[],
        ctx: CstCtx,
        firstLoc: number,
    ) => Expr;
} = {
    '<>': (form, contents, ctx) => {
        if (contents.length < 2) {
            err(ctx.results.errors, form, {
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
    '->': (form, contents, ctx) => {
        if (!contents.length) {
            return nil;
        }
        let v = nodeToExpr(contents[0], ctx);
        for (let i = 1; i < contents.length; i++) {
            const exp = nodeToExpr(contents[i], ctx);
            if (exp.type === 'apply') {
                exp.args.unshift(v);
                v = exp;
            } else {
                v = { type: 'apply', target: exp, args: [v], form: exp.form };
            }
        }
        return v;
    },
    '!': (form, contents, ctx): Expr => {
        // do a thing
        // what thing?
        // probably produce a 'effect'
        // expr?
        const inner: Node | null =
            contents.length > 1
                ? {
                      type: 'list',
                      loc: -1,
                      values: contents,
                  }
                : contents.length
                ? contents[0]
                : null;
        return {
            type: 'task',
            form,
            inner: inner ? nodeToExpr(inner, ctx) : nil,
            maybe: false,
        };
    },
    '!?': (form, contents, ctx): Expr => {
        // do a thing
        // what thing?
        // probably produce a 'effect'
        // expr?
        return {
            type: 'task',
            form,
            inner: contents.length ? nodeToExpr(contents[0], ctx) : nil,
            maybe: true,
        };
    },
    tfn: (form, contents, ctx): Expr => {
        const targs = contents.shift()!;
        if (!targs || targs.type !== 'array') {
            return {
                type: 'unresolved',
                form,
                reason: `tfn needs array as second item`,
            };
        }
        const tvalues = filterComments(targs.values);
        const { args, inner } = processTypeArgs(tvalues, ctx);

        if (contents.length > 1) {
            for (let i = 1; i < contents.length; i++) {
                err(ctx.results.errors, contents[i], {
                    type: 'misc',
                    message: 'only one expr allowed in the body of a tfn',
                });
            }
        }

        return {
            type: 'tfn',
            args,
            body: contents.length ? nodeToExpr(contents[0], inner) : nilt,
            form,
        };
    },
    fnrec: (form, contents, ctx): Expr => {
        const fail = (message: string): Expr => {
            err(ctx.results.errors, form, { type: 'misc', message });
            return { type: 'unresolved', form };
        };
        if (contents.length < 1) {
            return fail('requires two arguments');
        }
        let argNode = contents[0];
        if (argNode.type === 'array') {
            processArgs(argNode, ctx);
            return fail('fnrec requires return type annotation');
        }
        if (argNode.type !== 'annot' || argNode.target.type !== 'array') {
            return fail('fnrec first item must be annotated array');
        }
        const ret = nodeToType(argNode.annot, ctx);
        const { inner, args } = processArgs(argNode.target, ctx);
        const ann: Type = {
            type: 'fn',
            args: args.map((arg) => ({
                name:
                    arg.pattern.type === 'local' ? arg.pattern.name : undefined,
                type: arg.type,
                form: arg.form,
            })),
            body: ret,
            form,
        };
        const inner2 = {
            ...inner,
            local: { ...inner.local, loop: { sym: form.loc, type: ann } },
        };
        return {
            type: 'loop',
            ann: ann,
            form,
            inner: finishFn(contents, inner2, ret, form, args),
        };
    },
    fn: (form, contents, ctx): Expr => {
        if (contents.length < 1) {
            return { type: 'fn', args: [], body: [], ret: none, form };
        }
        let argNode = contents[0];
        let ret: Type | null = null;
        if (argNode.type === 'annot') {
            ret = nodeToType(argNode.annot, ctx);
            argNode = argNode.target;
        }
        if (argNode.type !== 'array' || contents.length < 1) {
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'fn first item must be array',
            });
            return { type: 'fn', args: [], body: [nil], ret: none, form };
        }
        const { inner, args } = processArgs(argNode, ctx);
        if (contents.length < 2) {
            return { type: 'fn', args, body: [nil], ret: ret ?? none, form };
        }
        return finishFn(contents, inner, ret, form, args);
    },
    '@loop': (form, contents, ctx, firstLoc): Expr => {
        const [item, ...rest] = contents;
        let ann: Type = nilt;
        if (item) {
            ann = inferLoopType(item, ctx);
        }
        rest.forEach((node) => {
            err(ctx.results.errors, node, {
                type: 'misc',
                message: 'extra args to @loop',
            });
        });
        ensure(ctx.results.display, firstLoc, {}).style = {
            type: 'tag',
            ann,
        };
        return {
            type: 'loop',
            form,
            ann,
            inner: item
                ? nodeToExpr(item, {
                      ...ctx,
                      local: {
                          ...ctx.local,
                          loop: { sym: form.loc, type: ann },
                      },
                  })
                : nil,
        };
    },
    deftype: (form, contents, ctx): Expr => {
        if (contents.length !== 2) {
            return { type: 'unresolved', form, reason: 'need just 2 args' };
        }
        const [name, value] = contents;
        if (name.type === 'tapply' && name.target.type === 'identifier') {
            const { args, inner } = processTypeArgs(
                filterComments(name.values),
                ctx,
            );
            const res: Type = {
                type: 'tfn',
                args,
                form,
                body: nodeToType(value, inner),
            };
            // const ann = getType(res, ctx) ?? undefined;
            // ctx.results.display[name.loc] = {
            //     style: { type: 'id', hash: form.loc, ann },
            // };
            return {
                type: 'deftype',
                name: name.target.text,
                value: res,
                form,
            };
        } else if (name.type !== 'identifier') {
            return {
                type: 'unresolved',
                reason: 'cant deftype not id ' + name.type,
                form,
            };
        }
        const vt = nodeToType(value, ctx);
        return {
            type: 'deftype',
            name: name.text,
            // hash: doHash(vt),
            value: vt,
            form,
        };
    },
    defnrec: (form, contents, ctx, firstLoc): Expr => {
        const f = (msg: string) => fail(ctx, form, msg);
        if (contents.length < 2) {
            return f('defn needs a name and args and a body');
        }
        const [name, ...rest] = contents;
        if (name.type === 'tapply' && name.target.type === 'identifier') {
            const { args: targs, inner } = processTypeArgs(
                filterComments(name.values),
                ctx,
            );
            const [argNode, ...body] = rest;
            if (argNode.type === 'array') {
                processArgs(argNode, inner);
                return f('defnrec must have annotated return type');
            }
            if (argNode.type !== 'annot' || argNode.target.type !== 'array') {
                return f('invalid form. must be annotated args');
            }
            const ret = nodeToType(argNode.annot, inner);
            const { inner: inner2, args } = processArgs(argNode.target, inner);
            const ann: Type = {
                type: 'tfn',
                args: targs,
                form,
                body: {
                    type: 'fn',
                    form,
                    args: args.map((arg) => ({
                        type: arg.type,
                        form: arg.form,
                        name:
                            arg.pattern.type === 'local'
                                ? arg.pattern.name
                                : void 0,
                    })),
                    body: ret,
                },
            };
            const bodies = body.map((node) =>
                nodeToExpr(node, {
                    ...inner2,
                    local: {
                        ...inner2.local,
                        loop: { sym: form.loc, type: ann },
                    },
                }),
            );
            const matched = bodyMatch(bodies, ctx, ret, ret.form);
            const value: Expr = {
                type: 'loop',
                ann,
                inner: {
                    type: 'tfn',
                    args: targs,
                    form,
                    body: {
                        type: 'fn',
                        args,
                        form,
                        ret: matched ?? nilt,
                        body: bodies,
                    },
                },
                form,
            };
            return { type: 'def', name: name.target.text, value, form, ann };
        } else if (name.type !== 'identifier') {
            return {
                type: 'unresolved',
                reason: 'cant defn not id ' + name.type,
                form,
            };
        }
        const value = specials.fnrec(form, rest, ctx, firstLoc);
        const ann = getType(value, ctx) ?? undefined;
        ctx.results.display[name.loc] = {
            style: { type: 'id', hash: form.loc, ann },
        };
        return { type: 'def', name: name.text, value, form, ann };
    },
    defn: (form, contents, ctx, firstLoc): Expr => {
        if (contents.length < 2) {
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'defn needs a name and args and a body',
            });
            return { type: 'def', name: '', value: nil, form, ann: void 0 };
        }
        const [name, ...rest] = contents;
        if (name.type === 'tapply' && name.target.type === 'identifier') {
            const { args, inner } = processTypeArgs(
                filterComments(name.values),
                ctx,
            );
            const body = specials.fn(form, rest, inner, firstLoc);
            const value: Expr = { type: 'tfn', args, form, body };
            const ann = getType(value, ctx) ?? undefined;
            ctx.results.display[name.loc] = {
                style: { type: 'id', hash: form.loc, ann },
            };
            return { type: 'def', name: name.target.text, value, form, ann };
        } else if (name.type !== 'identifier') {
            return {
                type: 'unresolved',
                reason: 'cant defn not id ' + name.type,
                form,
            };
        }
        const value = specials.fn(form, rest, ctx, firstLoc);
        const ann = getType(value, ctx) ?? undefined;
        ctx.results.display[name.loc] = {
            style: { type: 'id', hash: form.loc, ann },
        };
        return { type: 'def', name: name.text, value, form, ann };
    },
    def: (form, contents, ctx): Expr => {
        if (!contents.length) {
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'def needs a name and a body',
            });
            return {
                type: 'def',
                name: '',
                // hash: '',
                value: nil,
                form,
                ann: void 0,
            };
        }
        const first = contents[0];
        const value = contents.length > 1 ? nodeToExpr(contents[1], ctx) : nil;
        // const hash = doHash(value);
        if (first.type !== 'identifier') {
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'def name must be an identifier',
            });
            return {
                type: 'def',
                name: '',
                // hash: '',
                value,
                form,
                ann: void 0,
            };
        }
        // console.log('def hash', first.text, hash);
        const ann = getType(value, ctx) ?? undefined;
        ctx.results.display[first.loc] = {
            style: { type: 'id', hash: form.loc, ann },
        };
        return {
            type: 'def',
            name: first.text,
            // hash,
            value,
            form,
            ann,
        };
    },
    switch: (form, contents, ctx): Expr => {
        if (contents.length < 1) {
            return { type: 'unresolved', form, reason: 'no enough args' };
        }
        const [valueNode, ...cases] = contents;
        const pairs = [];
        const value = nodeToExpr(valueNode, ctx);
        let typ = getType(value, ctx) ?? none;
        for (let i = 0; i < cases.length; i += 2) {
            const bindings: Local['terms'] = [];
            const pattern = nodeToPattern(cases[i], typ, ctx, bindings);

            bindings.forEach(
                (loc) =>
                    (ctx.results.localMap.terms[loc.sym] = {
                        name: loc.name,
                        type: loc.type,
                    }),
            );

            const pt = patternType(pattern, ctx);
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
            if (subtracted.type === 'error') {
                err(ctx.results.errors, cases[i], subtracted.error);
            } else {
                typ = subtracted;
            }
        }
        return { type: 'switch', target: value, cases: pairs, form };
    },
    let: (form, contents, ctx): Expr => {
        const first = contents[0];
        if (!first || first.type !== 'array') {
            return { type: 'unresolved', form, reason: 'first not array' };
        }
        ctx.results.display[first.loc] = { style: { type: 'let-pairs' } };
        const bindings: { pattern: Pattern; value: Expr; type?: Type }[] = [];
        const values = filterComments(first.values);
        for (let i = 0; i < values.length - 1; i += 2) {
            const value = nodeToExpr(values[i + 1], ctx);
            const inf = getType(value, ctx, {
                errors: ctx.results.errors,
                types: {},
            });
            const inferred = inf ?? nilt;
            // console.log('inferred', inf);
            const locals: Local['terms'] = [];
            bindings.push({
                pattern: nodeToPattern(values[i], inferred, ctx, locals),
                value,
                type: inferred,
            });
            locals.forEach(
                (loc) =>
                    (ctx.results.localMap.terms[loc.sym] = {
                        name: loc.name,
                        type: loc.type,
                    }),
            );
            ctx = {
                ...ctx,
                local: {
                    ...ctx.local,
                    terms: [...locals, ...ctx.local.terms],
                },
            };
        }
        return {
            type: 'let',
            bindings,
            form,
            body: contents.slice(1).map((child) => nodeToExpr(child, ctx)),
        };
    },
    if: (form, contents, ctx): Expr => {
        const nodes = contents.map((node) => nodeToExpr(node, ctx));
        const [cond, yes, no] = nodes;
        if (nodes.length > 3) {
            nodes.slice(3).forEach((node) => {
                err(ctx.results.errors, node.form, {
                    type: 'misc',
                    message: 'too many items in `if` form',
                });
            });
        }
        if (nodes.length < 3) {
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'if requires 3 elements',
            });
        }
        return {
            type: 'if',
            cond: cond ?? nil,
            yes: yes ?? nil,
            no: no ?? nil,
            form,
        };
    },
    ',': (form, contents, ctx): Expr => {
        return {
            type: 'record',
            form,
            spreads: [],
            entries: contents.map((item, i) => ({
                name: i.toString(),
                value: nodeToExpr(item, ctx),
            })),
        };
    },
};

function processArgs(
    argNode: NodeArray & NodeExtra,
    ctx: CstCtx,
): {
    inner: CstCtx;
    args: { pattern: Pattern; type: Type; form: Node }[];
} {
    let locals: Local['terms'] = [];
    let args = parseArgs(argNode, ctx, locals);
    locals.forEach(
        (loc) =>
            (ctx.results.localMap.terms[loc.sym] = {
                name: loc.name,
                type: loc.type,
            }),
    );
    const inner: CstCtx = {
        ...ctx,
        local: {
            ...ctx.local,
            terms: [...locals, ...ctx.local.terms],
        },
    };
    return { inner, args };
}

function parseArgs(
    argNode: NodeArray & NodeExtra,
    ctx: CstCtx,
    locals: { sym: number; name: string; type: Type }[],
): { pattern: Pattern; type: Type; form: Node }[] {
    return filterComments(argNode.values).map((arg) => {
        if (arg.type === 'annot') {
            let type = nodeToType(arg.annot, ctx);
            const pattern = nodeToPattern(arg.target, type, ctx, locals);
            return { pattern, type, form: arg };
        } else {
            let type = any;
            const pattern = nodeToPattern(arg, type, ctx, locals);
            return { pattern, type, form: arg };
        }
    });
}

export function processTypeArgs(tvalues: Node[], ctx: CstCtx) {
    const parsed = parseTypeArgs(tvalues, ctx);
    parsed.forEach((targ) => (ctx.results.localMap.types[targ.sym] = targ));
    return {
        args: parsed,
        inner: {
            ...ctx,
            local: {
                ...ctx.local,
                types: [...parsed, ...ctx.local.types],
            },
        },
    };
}
/*

so, maybe we need a type that's "anything"
.. 'top'

patternIsExhaustive

patternType ...
subtractType ...

*/

export const inferLoopType = (form: Node, ctx: CstCtx): Type => {
    if (
        form.type === 'list' &&
        form.values.length >= 2 &&
        form.values[0].type === 'identifier' &&
        form.values[0].text === 'fn'
    ) {
        const args = form.values[1];
        if (args.type === 'annot' && args.target.type === 'array') {
            const argt = parseArgs(args.target, ctx, []);
            return {
                type: 'fn',
                args: argt.map((arg) => ({
                    name:
                        arg.pattern.type === 'local'
                            ? arg.pattern.name
                            : undefined,
                    form: arg.form,
                    type: arg.type,
                })),
                body: nodeToType(args.annot, ctx),
                form,
            };
        }
    }
    err(ctx.results.errors, form, {
        type: 'misc',
        message: 'unable to infer loop type.',
    });
    return any;
};

export const fail = (ctx: CstCtx, form: Node, message: string): Expr => {
    err(ctx.results.errors, form, {
        type: 'misc',
        message: 'defn needs a name and args and a body',
    });
    return { type: 'unresolved', form };
};

export function finishFn(
    contents: Node[],
    inner: CstCtx,
    ret: Type | null,
    form: Node,
    args: { pattern: Pattern; type: Type; form: Node }[],
): Expr {
    const bodies = contents.slice(1).map((child) => nodeToExpr(child, inner));
    ret = bodyMatch(bodies, inner, ret, form);
    return {
        type: 'fn',
        args,
        body: bodies.length ? bodies : [nil],
        ret: ret ?? none,
        form,
    };
}

function bodyMatch(body: Expr[], ctx: CstCtx, ret: Type | null, form: Node) {
    if (body.length) {
        const effects: TaskType = {
            effects: {},
            locals: [],
            result: nilt,
            type: 'task',
        };
        let bodyRes = getType(body[body.length - 1], ctx, undefined, effects);
        if (bodyRes) {
            bodyRes = maybeEffectsType(effects, bodyRes);
            if (ret) {
                const match = _matchOrExpand(bodyRes, ret, ctx, []);
                if (match !== true) {
                    err(ctx.results.errors, form, match);
                }
            } else {
                ret = bodyRes;
            }
        }
    }
    return ret;
}
