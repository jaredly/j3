import { Node } from '../types/cst';
import { Expr } from '../types/ast';
import { any, nilt } from './Ctx';
import { Result } from './to-ast';
import { populateAutocomplete } from './populateAutocomplete';
import { CstCtx, Ctx, Library } from './library';
import { lastName } from '../db/hash-tree';
import { ensure } from './nodeToExpr';

// TODO cache this?

export const resolveExprText = (
    text: string,
    ctx: CstCtx,
    form: Node,
): Expr => {
    if (text === 'true' || text === 'false') {
        return { type: 'bool', value: text === 'true', form };
    }
    if (text === '@recur' && ctx.local.loop) {
        ctx.results.localMap.terms[ctx.local.loop.sym] = {
            name: 'loop',
            type: ctx.local.loop.type,
        };
        ensure(ctx.results.display, form.loc, {}).style = {
            type: 'tag',
            ann: ctx.local.loop.type,
        };
        return { type: 'recur', form, sym: ctx.local.loop.sym };
    }
    if (text.startsWith("'")) {
        return { type: 'tag', name: text.slice(1), form };
    }
    ctx.results.display[form.loc] = {};
    // if (hash == null) {
    populateAutocomplete(ctx, text, form);
    ctx.results.display[form.loc].style = { type: 'unresolved' };
    return {
        type: 'unresolved',
        form,
        reason: `No hash specified:` + text,
    };
};

export const resolveExprHash = (
    hash: string | number,
    ctx: CstCtx,
    form: Node,
): Expr => {
    ctx.results.display[form.loc] = {};
    if (typeof hash === 'number') {
        const top = ctx.results.toplevel[hash];
        if (top?.type === 'def') {
            ctx.results.display[form.loc].style = {
                type: 'id',
                hash,
                ann: top.ann ?? undefined,
            };
            // TODO: I want to ditch this too.
            ctx.results.hashNames[form.loc] = lastName(top.name);
            return { type: 'toplevel', hash, form };
        }
        const sym = hash;
        const local = ctx.local.terms.find((t) => t.sym === sym);
        if (local) {
            ctx.results.display[form.loc].style = {
                type: 'id',
                hash: local.sym,
                ann: local.type,
            };
            return { type: 'local', sym: local.sym, form };
        }
        ctx.results.display[form.loc].style = { type: 'unresolved' };
        return { type: 'unresolved', form, reason: 'local missing' };
    } else {
        if (hash.startsWith(':builtin:')) {
            const text = hash.slice(':builtin:'.length);
            const builtin = ctx.global.builtins[text];
            if (builtin?.type === 'term') {
                const last = lastName(text);
                ctx.results.display[form.loc].style = {
                    type: 'id',
                    hash,
                    ann: builtin.ann,
                };
                ctx.results.hashNames[form.loc] = last;
                return { type: 'builtin', name: text, form };
            }
        }
        const global = ctx.global.library.definitions[hash];
        if (global?.type === 'term') {
            ctx.results.display[form.loc].style = {
                type: 'id',
                hash,
                ann: global.ann,
            };
            ctx.results.hashNames[form.loc] = lastName(
                ctx.results.globalNames[hash]?.[0],
            ); // ctx.global.reverseNames[hash];
            return { type: 'global', hash, form };
        }
        ctx.results.display[form.loc].style = { type: 'unresolved' };
        return {
            type: 'unresolved',
            form,
            reason: 'global or builtin missing',
        };
    }
};

export const libraryMap = (lib: Library) => {
    const map: { [key: string]: string } = {};
    const nsMap = (hash: string, path: string) => {
        Object.entries(lib.namespaces[hash]).forEach(([name, hash]) => {
            if (name === '') {
                map[path] = hash;
            } else {
                nsMap(hash, path + '/' + name);
            }
        });
    };
    nsMap(lib.root, '');
    return map;
};

export const allTerms = (ctx: CstCtx): Result[] => {
    const sandboxes = Object.entries(ctx.results.toplevel).flatMap(
        ([idx, expr]) =>
            expr.type === 'def'
                ? [
                      {
                          type: 'toplevel',
                          name: expr.name,
                          hash: +idx,
                          typ: expr.ann ?? nilt,
                      } satisfies Result,
                  ]
                : [],
    );

    const globals = Object.entries(libraryMap(ctx.global.library)).flatMap(
        ([name, hash]): Result[] => {
            if (hash.startsWith(':builtin:')) {
                const name = hash.slice(':builtin:'.length);
                const value = ctx.global.builtins[name];
                return value.type === 'term'
                    ? [
                          {
                              type: 'builtin',
                              name,
                              hash: ':builtin:' + name,
                              typ: value.ann,
                          },
                      ]
                    : [];
            }
            const term = ctx.global.library.definitions[hash];
            if (term.type !== 'term') {
                return [];
            }
            return [
                {
                    type: 'global',
                    name,
                    hash,
                    typ: term.ann,
                },
            ];
        },
    );
    return [
        ...ctx.local.terms.map(
            ({ name, type, sym }) =>
                ({
                    type: 'local',
                    name,
                    typ: type,
                    hash: sym,
                } satisfies Result),
        ),
        ...sandboxes,
        ...globals,
    ];
};

export const allTypes = (ctx: CstCtx): Result[] => {
    const sandboxes = Object.entries(ctx.results.toplevel).flatMap(
        ([idx, expr]) =>
            expr.type === 'deftype'
                ? [
                      {
                          type: 'toplevel',
                          name: expr.name,
                          hash: +idx,
                          typ: expr.value,
                      } satisfies Result,
                  ]
                : [],
    );

    const globals = Object.entries(libraryMap(ctx.global.library)).flatMap(
        ([name, hash]): Result[] => {
            if (hash.startsWith(':builtin:')) {
                const term =
                    ctx.global.builtins[hash.slice(':builtin:'.length)];
                if (term.type !== 'type') {
                    return [];
                }
                return [
                    {
                        type: 'builtin',
                        name: hash.slice(':builtin:'.length),
                        hash,
                        // TODO
                        typ: any,
                    },
                ];
            }
            const term = ctx.global.library.definitions[hash];
            if (term.type !== 'type') {
                return [];
            }
            return [
                {
                    type: 'global',
                    name,
                    hash,
                    typ: term.value,
                },
            ];
        },
    );

    return [
        ...ctx.local.types.map(
            ({ name, sym, bound }) =>
                ({
                    type: 'local',
                    name,
                    typ: bound ?? any,
                    hash: sym,
                } satisfies Result),
        ),
        ...sandboxes,
        ...globals,
    ];
};
