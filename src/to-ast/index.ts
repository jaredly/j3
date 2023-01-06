// Ok so here we convert from cst to ast

import { Node } from '../types/cst';
import { Expr, Pattern, Term, TVar, Type } from '../types/ast';

export type Global = {
    builtins: {
        terms: { [hash: string]: Type };
        types: { [hash: string]: TVar[] };
    };
    terms: { [hash: string]: Term };
    names: { [name: string]: string[] };
    types: { [hash: string]: Type };
    typeNames: { [name: string]: string[] };
};

export type Local = {
    terms: { sym: number; name: string; type: Type }[];
    types: { sym: number; name: string; bound?: Type }[];
};

export type Ctx = { sym: { current: number }; global: Global; local: Local };

export const nil: Expr = {
    type: 'record',
    entries: [],
    form: {
        contents: { type: 'list', values: [] },
        decorators: {},
        loc: { start: -1, end: -1, idx: -1 },
    },
};
export const blank: Node = {
    contents: { type: 'blank' },
    decorators: {},
    loc: { start: -1, end: -1, idx: -1 },
};

export const nodeToType = (form: Node, ctx: Ctx): Type => {
    switch (form.contents.type) {
        case 'identifier': {
            const { hash, text } = form.contents;
            if (hash) {
                if (hash === '#builtin') {
                    return {
                        type: 'builtin',
                        name: text,
                        form,
                    };
                }
            }
            const local = ctx.local.types.find((t) => t.name === text);
            if (local) {
                return { type: 'local', sym: local.sym, form };
            }
            if (ctx.global.typeNames[text]) {
                return {
                    type: 'global',
                    hash: ctx.global.typeNames[text][0],
                    form,
                };
            }
            if (ctx.global.builtins.types[text]) {
                return { type: 'builtin', name: text, form };
            }
            return { type: 'unresolved', form };
        }
    }
    return { type: 'unresolved', form };
};

export const nextSym = (ctx: Ctx) => ctx.sym.current++;

export const nodeToPattern = (
    form: Node,
    t: Type,
    ctx: Ctx,
    bindings: Local['terms'],
): Pattern => {
    switch (form.contents.type) {
        case 'identifier': {
            const sym = nextSym(ctx);
            bindings.push({
                name: form.contents.text,
                sym,
                type: t,
            });
            return {
                type: 'local',
                form,
                sym,
            };
        }
    }
    return { type: 'unresolved', form: form };
};

export const specials: {
    [key: string]: (form: Node, args: Node[], ctx: Ctx) => Expr;
} = {
    fn: (form, contents, ctx): Expr => {
        if (contents.length < 1) {
            return {
                type: 'fn',
                args: [],
                body: [],
                form,
            };
        }
        if (contents[0].contents.type === 'array') {
            let args: { pattern: Pattern; type?: Type }[] = [];
            let bindings: Local['terms'] = [];
            contents[0].contents.values.forEach((arg) => {
                const t: Type = arg.decorators.type
                    ? nodeToType(arg.decorators.type, ctx)
                    : { type: 'unresolved', form: nil.form };
                args.push({
                    pattern: nodeToPattern(arg, t, ctx, bindings),
                    type: t,
                });
            });
            // parse fn args
            return {
                type: 'fn',
                args,
                body: contents.slice(1).map((child) => nodeToExpr(child, ctx)),
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
    def: (form, contents, ctx): Expr => {
        if (!contents.length) {
            return { type: 'unresolved', form };
        }
        const first = contents[0].contents;
        if (first.type !== 'identifier') {
            return {
                type: 'unresolved',
                form,
                reason: 'first arg must be an identifier',
            };
        }
        return {
            type: 'def',
            name: first.text,
            value: contents.length > 1 ? nodeToExpr(contents[1], ctx) : nil,
            form,
        };
    },
    let: (form, contents, ctx): Expr => {
        const first = contents[0];
        if (!first || first.contents.type !== 'array') {
            return { type: 'unresolved', form };
        }
        const locals: Local['terms'] = [];
        const bindings: { pattern: Pattern; value: Expr; type?: Type }[] = [];
        for (let i = 0; i < first.contents.values.length; i += 2) {
            const value = nodeToExpr(first.contents.values[i + 1], ctx);
            const inferred = typeForExpr(value, ctx);
            bindings.push({
                pattern: nodeToPattern(
                    first.contents.values[i],
                    inferred,
                    ctx,
                    locals,
                ),
                value,
                type: inferred,
            });
        }
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
};

export const unifyTypes = (
    one: Type,
    two: Type,
    ctx: Ctx,
    form: Node,
): Type => {
    if (one.type === 'builtin' && two.type === 'builtin') {
        return one.name === two.name
            ? { ...one, form }
            : {
                  type: 'unresolved',
                  reason: 'incompatible builtins',
                  form,
              };
    }
    return {
        type: 'unresolved',
        reason: 'incompatible builtins',
        form,
    };
};

export const typeForExpr = (value: Expr, ctx: Ctx): Type => {
    switch (value.type) {
        case 'if': {
            return unifyTypes(
                typeForExpr(value.yes, ctx),
                typeForExpr(value.no, ctx),
                ctx,
                value.form,
            );
        }
        case 'constant': {
            if (value.form.contents.type === 'number') {
                return { type: 'builtin', name: 'int', form: blank };
            }
            break;
        }
        case 'builtin':
            return (
                ctx.global.builtins.terms[value.name] ?? {
                    type: 'unresolved',
                    form: value.form,
                    reason: 'unknown builtin ' + value.name,
                }
            );
        case 'apply': {
            const inner = typeForExpr(value.target, ctx);
            if (inner.type === 'fn') {
                return inner.body;
            }
            return {
                type: 'unresolved',
                form: value.form,
                reason: 'apply a non-function',
            };
        }
    }
    return { type: 'unresolved', form: value.form, reason: 'not impl' };
};

export const nodeToExpr = (node: Node, ctx: Ctx): Expr => {
    const { contents, decorators, loc } = node;
    // todo decorators
    switch (contents.type) {
        case 'tag':
            return { type: 'tag', name: contents.text, form: node };
        case 'number':
            return { type: 'constant', form: node };
        case 'list': {
            if (!contents.values.length) {
                return { type: 'record', entries: [], form: node };
            }
            const first = contents.values[0];
            if (first.contents.type === 'identifier') {
                switch (first.contents.text) {
                    case 'fn':
                    case 'def':
                    case 'defn':
                    case 'let':
                }
            }
            const [target, ...args] = contents.values.map((child) =>
                nodeToExpr(child, ctx),
            );
            return {
                type: 'apply',
                target,
                args,
                form: node,
            };
        }
    }
    return { type: 'unresolved', form: node };
};
