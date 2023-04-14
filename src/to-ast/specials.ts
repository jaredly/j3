import { Node } from '../types/cst';
import { Expr, Pattern, Type } from '../types/ast';
import objectHash from 'object-hash';
import { any, Ctx, Local, Mod, nil, nilt, noForm, none } from './Ctx';
import { nodeToType } from './nodeToType';
import { filterComments, nodeToExpr } from './nodeToExpr';
import { err, nodeToPattern } from './nodeToPattern';
import { getType } from '../get-type/get-types-new';
import { patternType } from '../get-type/patternType';
import { subtractType } from '../get-type/subtractType';
import { CstCtx } from './library';

export const addMod = (ctx: Ctx, idx: number, mod: Mod) => {
    if (!ctx.mods[idx]) {
        ctx.mods[idx] = [mod];
    } else {
        ctx.mods[idx].push(mod);
    }
};

const doHash = (x: Expr | Type) => JSON.stringify(noForm(x)); // objectHash

export const specials: {
    [key: string]: (form: Node, args: Node[], ctx: CstCtx) => Expr;
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
    fn: (form, contents, ctx): Expr => {
        if (contents.length < 1) {
            return {
                type: 'fn',
                args: [],
                body: [],
                ret: none,
                form,
            };
        }
        let argNode = contents[0];
        if (argNode.type === 'annot') {
            argNode = argNode.target;
        }
        if (argNode.type === 'array') {
            let locals: Local['terms'] = [];
            let args: { pattern: Pattern; type: Type }[] = filterComments(
                argNode.values,
            ).map((arg) => {
                if (arg.type === 'annot') {
                    let type = nodeToType(arg.annot, ctx);
                    const pattern = nodeToPattern(
                        arg.target,
                        type,
                        ctx,
                        locals,
                    );
                    return { pattern, type };
                } else {
                    let type = any;
                    const pattern = nodeToPattern(arg, type, ctx, locals);
                    return { pattern, type };
                }
            });

            locals.forEach(
                (loc) =>
                    (ctx.results.localMap.terms[loc.sym] = {
                        name: loc.name,
                        type: loc.type,
                    }),
            );
            const ct2: CstCtx = {
                ...ctx,
                local: {
                    ...ctx.local,
                    terms: [...locals, ...ctx.local.terms],
                },
            };
            const body = contents.slice(1);
            let ret: Type = none;

            // Hmmmmmm
            // do I need to lock down the `ret`?
            // 🤔
            // how would that work.
            // it starts with ... "nothing", right?
            // which unifies with anything
            // but is also illegal to actually return
            // yeah sure, let's lock it down? I mean
            // what would that mean.

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
            const bodies = body.map((child) => nodeToExpr(child, ct2));
            if (bodies.length) {
                const last = bodies[bodies.length - 1];
                const t = getType(last, ctx);
                if (t) {
                    ret = t;
                }
            }
            // parse fn args
            return {
                type: 'fn',
                args,
                body: bodies,
                ret,
                form,
            };
        }
        return {
            type: 'fn',
            args: [],
            body: contents.map((child) => nodeToExpr(child, ctx)),
            ret: none,
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
        const vt = nodeToType(value, ctx);
        return {
            type: 'deftype',
            name: name.text,
            hash: doHash(vt),
            value: vt,
            form,
        };
    },
    defn: (form, contents, ctx): Expr => {
        if (contents.length < 2) {
            err(ctx.results.errors, form, {
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
        const hash = doHash(value);
        // console.log('hash', hash);
        ctx.results.display[name.loc.idx] = {
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
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'def needs a name and a body',
            });
            return { type: 'def', name: '', hash: '', value: nil, form };
        }
        const first = contents[0];
        const value = contents.length > 1 ? nodeToExpr(contents[1], ctx) : nil;
        const hash = doHash(value);
        if (first.type !== 'identifier') {
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'def name must be an identifier',
            });
            return { type: 'def', name: '', hash: '', value, form };
        }
        // console.log('def hash', first.text, hash);
        ctx.results.display[first.loc.idx] = { style: { type: 'id', hash } };
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
                err(ctx.results.errors, cases[i], {
                    type: 'misc',
                    message: `unreachable case or something`,
                });
            } else {
                typ = subtracted;
            }

            bindings.forEach(
                (loc) =>
                    (ctx.results.localMap.terms[loc.sym] = {
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
        ctx.results.display[first.loc.idx] = { style: { type: 'let-pairs' } };
        const bindings: { pattern: Pattern; value: Expr; type?: Type }[] = [];
        const values = filterComments(first.values);
        const allLocals: Local['terms'] = [];
        for (let i = 0; i < values.length - 1; i += 2) {
            const value = nodeToExpr(values[i + 1], ctx);
            const inferred = getType(value, ctx) ?? nilt;
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
            // allLocals.push(...locals);
            ctx = {
                ...ctx,
                local: {
                    ...ctx.local,
                    terms: [...locals, ...ctx.local.terms],
                },
            };
        }
        // const ct2: Ctx = {
        //     ...ctx,
        //     local: {
        //         ...ctx.local,
        //         terms: [...allLocals, ...ctx.local.terms],
        //     },
        // };
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

/*

so, maybe we need a type that's "anything"
.. 'top'

patternIsExhaustive

patternType ...
subtractType ...

*/
