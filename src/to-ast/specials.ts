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
import { _matchOrExpand, matchesType } from '../get-type/matchesType';

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
    '!': (form, contents, ctx): Expr => {
        // do a thing
        // what thing?
        // probably produce a 'effect'
        // expr?
        return {
            type: 'task',
            form,
            inner: contents.length ? nodeToExpr(contents[0], ctx) : nil,
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
    // tfn: (form, contents, ctx): Expr => {
    //     const targs = contents.shift()!;
    //     if (!targs || targs.type !== 'array') {
    //         return {
    //             type: 'unresolved',
    //             form,
    //             reason: `tfn needs array as second item`,
    //         };
    //     }
    //     const tvalues = filterComments(targs.values);
    //     const parsed = tvalues.map((arg) => {
    //         // const type = nodeToType(arg, ctx)
    //         return {
    //             name: arg.type === 'identifier' ? arg.text : 'NOPE',
    //             sym: arg.loc, // nextSym(ctx),
    //             form: arg,
    //         };
    //     });
    //     parsed.forEach(
    //         (targ) => (ctx.results.localMap.types[targ.sym] = targ),
    //     );
    //     return {
    //         type: 'tfn',
    //         args: parsed,
    //         body: contents.length
    //             ? nodeToExpr(contents[0], {
    //                     ...ctx,
    //                     local: {
    //                         ...ctx.local,
    //                         types: [...parsed, ...ctx.local.types],
    //                     },
    //                 })
    //             : nilt,
    //         form,
    //     };
    // },
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
        let ret: Type | null = null;
        if (argNode.type === 'annot') {
            ret = nodeToType(argNode.annot, ctx);
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
            // let ret: Type = none;

            // Hmmmmmm
            // do I need to lock down the `ret`?
            // 🤔
            // how would that work.
            // it starts with ... "nothing", right?
            // which unifies with anything
            // but is also illegal to actually return
            // yeah sure, let's lock it down? I mean
            // what would that mean.

            // if (
            //     body.length > 0 &&
            //     body[0].type === 'identifier' &&
            //     body[0].text.startsWith(':')
            // ) {
            //     ret = nodeToType(
            //         {
            //             ...body[0],
            //             text: body[0].text.slice(1),
            //         },
            //         ctx,
            //     );
            //     body.shift();
            // }
            const bodies = body.map((child) => nodeToExpr(child, ct2));
            if (bodies.length) {
                const last = bodies[bodies.length - 1];
                const t = getType(last, ctx);
                if (t) {
                    if (ret) {
                        const match = _matchOrExpand(t, ret, ctx, []);
                        if (match !== true) {
                            err(ctx.results.errors, form, match);
                        }
                    } else {
                        ret = t;
                    }
                }
            }
            // parse fn args
            return {
                type: 'fn',
                args,
                body: bodies,
                ret: ret ?? none,
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
            // hash: doHash(vt),
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
            return {
                type: 'def',
                name: '',
                // hash: '',
                value: nil,
                form,
                ann: void 0,
            };
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
        // const hash = doHash(value);
        // console.log('hash', hash);
        ctx.results.display[name.loc] = {
            style: { type: 'id', hash: form.loc },
        };
        return {
            type: 'def',
            name: name.text,
            // hash,
            value,
            form,
            ann: getType(value, ctx),
        };
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
        ctx.results.display[first.loc] = {
            style: { type: 'id', hash: form.loc },
        };
        return {
            type: 'def',
            name: first.text,
            // hash,
            value,
            form,
            ann: getType(value, ctx),
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
        ctx.results.display[first.loc] = { style: { type: 'let-pairs' } };
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
