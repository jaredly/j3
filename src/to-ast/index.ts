// Ok so here we convert from cst to ast

import { Node } from '../types/cst';
import { Expr, Pattern, Term, TVar, Type } from '../types/ast';
import objectHash from 'object-hash';

export type Global = {
    builtins: {
        terms: { [name: string]: Type };
        types: { [name: string]: TVar[] };
    };
    terms: { [hash: string]: Expr };
    names: { [name: string]: string[] };
    types: { [hash: string]: Type };
    typeNames: { [name: string]: string[] };
};

export type Local = {
    terms: { sym: number; name: string; type: Type }[];
    types: { sym: number; name: string; bound?: Type }[];
};

export type Ctx = { sym: { current: number }; global: Global; local: Local };

export const blank: Node = {
    contents: { type: 'blank' },
    decorators: {},
    loc: { start: -1, end: -1, idx: -1 },
};

export const btype = (v: string): Type => ({
    type: 'builtin',
    form: blank,
    name: v,
});

export const basicBuiltins: Global['builtins'] = {
    types: {
        uint: [],
        int: [],
        float: [],
        bool: [],
        string: [],
        Array: [
            { sym: 0, form: blank },
            {
                sym: 1,
                form: blank,
                default_: {
                    type: 'builtin',
                    name: 'uint',
                    form: blank,
                },
            },
        ],
    },
    terms: {
        // ooops ok with multiple dispatch on builtins,
        // we'll need to identify by hash as welllllll
        '+': {
            type: 'fn',
            args: [btype('int'), btype('int')],
            form: blank,
            body: btype('int'),
        },
        '==': {
            type: 'fn',
            args: [btype('int'), btype('int')],
            form: blank,
            body: btype('int'),
        },
    },
};

export const emptyLocal: Local = { terms: [], types: [] };
export const initialGlobal: Global = {
    builtins: basicBuiltins,
    terms: {},
    names: {},
    types: {},
    typeNames: {},
};

export const newCtx = () => {
    return {
        sym: { current: 0 },
        global: initialGlobal,
        local: emptyLocal,
    };
};

export const nil: Expr = {
    type: 'record',
    entries: [],
    form: {
        contents: { type: 'list', values: [] },
        decorators: {},
        loc: { start: -1, end: -1, idx: -1 },
    },
};

export const nilt: Type = {
    type: 'record',
    entries: [],
    open: false,
    form: {
        contents: { type: 'list', values: [] },
        decorators: {},
        loc: { start: -1, end: -1, idx: -1 },
    },
};

export const resolveExpr = (
    text: string,
    hash: string | undefined,
    ctx: Ctx,
    form: Node,
): Expr => {
    if (hash) {
        if (hash === '#builtin') {
            return {
                type: 'builtin',
                name: text,
                form,
            };
        }
    }
    const local = ctx.local.terms.find((t) => t.name === text);
    if (local) {
        return { type: 'local', sym: local.sym, form };
    }
    if (ctx.global.names[text]) {
        return {
            type: 'global',
            hash: ctx.global.names[text][0],
            form,
        };
    }
    if (ctx.global.builtins.terms[text]) {
        return { type: 'builtin', name: text, form };
    }
    return {
        type: 'unresolved',
        form,
        reason: 'id not resolved ' + text,
    };
};

export const resolveType = (
    text: string,
    hash: string | undefined,
    ctx: Ctx,
    form: Node,
): Type => {
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
    return {
        type: 'unresolved',
        form,
        reason: 'id not resolved ' + text,
    };
};

export const nodeToType = (form: Node, ctx: Ctx): Type => {
    switch (form.contents.type) {
        case 'identifier': {
            return resolveType(
                form.contents.text,
                form.contents.hash,
                ctx,
                form,
            );
        }
    }
    return { type: 'unresolved', form, reason: 'not impl type' };
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
    return { type: 'unresolved', form: form, reason: 'not impl pat' };
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
        console.log('A FB', contents);
        if (contents[0].contents.type === 'array') {
            let args: { pattern: Pattern; type?: Type }[] = [];
            let locals: Local['terms'] = [];
            contents[0].contents.values.forEach((arg) => {
                const t: Type =
                    arg.decorators.type && arg.decorators.type.length
                        ? nodeToType(arg.decorators.type[0], ctx)
                        : {
                              type: 'unresolved',
                              form: nil.form,
                              reason: 'not provided type',
                          };
                args.push({
                    pattern: nodeToPattern(arg, t, ctx, locals),
                    type: t,
                });
            });
            const ct2: Ctx = {
                ...ctx,
                local: {
                    ...ctx.local,
                    terms: [...locals, ...ctx.local.terms],
                },
            };
            // parse fn args
            return {
                type: 'fn',
                args,
                body: contents.slice(1).map((child) => nodeToExpr(child, ct2)),
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
            return { type: 'unresolved', form, reason: 'no contents' };
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
            return { type: 'unresolved', form, reason: 'first not array' };
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
        case 'number': {
            return { type: 'builtin', name: value.kind, form: blank };
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
        case 'def': {
            return nilt;
        }
        case 'fn': {
            return {
                type: 'fn',
                args: value.args.map((arg) => arg.type ?? nilt),
                body: value.body.length
                    ? typeForExpr(value.body[value.body.length - 1], ctx)
                    : nilt,
                form: value.form,
            };
        }
    }
    return {
        type: 'unresolved',
        form: value.form,
        reason: 'not impl ' + value.type,
    };
};

export const nodeToExpr = (node: Node, ctx: Ctx): Expr => {
    const { contents, decorators, loc } = node;
    // todo decorators
    switch (contents.type) {
        case 'identifier': {
            return resolveExpr(contents.text, contents.hash, ctx, node);
        }
        case 'tag':
            return { type: 'tag', name: contents.text, form: node };
        case 'number':
            return {
                type: 'number',
                form: node,
                value: +contents.raw,
                kind: contents.raw.includes('.') ? 'float' : 'int',
            };
        case 'list': {
            if (!contents.values.length) {
                return { type: 'record', entries: [], form: node };
            }
            const first = contents.values[0];
            if (first.contents.type === 'identifier') {
                if (specials[first.contents.text]) {
                    return specials[first.contents.text](
                        node,
                        contents.values.slice(1),
                        ctx,
                    );
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
    return {
        type: 'unresolved',
        form: node,
        reason: 'not impl ' + contents.type,
    };
};

export const noForm = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(noForm);
    }
    if (typeof obj === 'object') {
        const res: any = {};
        Object.keys(obj).forEach((k) => {
            if (k !== 'form') {
                res[k] = noForm(obj[k]);
            }
        });
        return res;
    }
    return obj;
};

export const addDef = (res: Expr, ctx: Ctx) => {
    if (res.type === 'def') {
        const hash = objectHash(noForm(res.value));
        return {
            ...ctx,
            global: {
                ...ctx.global,
                terms: {
                    ...ctx.global.terms,
                    [hash]: res,
                },
                names: {
                    ...ctx.global.names,
                    [res.name]: [hash, ...(ctx.global.names[res.name] || [])],
                },
            },
        };
    }
    return ctx;
};
