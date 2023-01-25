// Ok so here we convert from cst to ast

import { Node } from '../types/cst';
import { Expr, Term, Type } from '../types/ast';
import { getType } from '../get-type/get-types-new';
import { Ctx } from './Ctx';
import { compareScores, fuzzyScore } from './fuzzy';

type Result =
    | { type: 'local'; name: string; typ: Type; hash: string }
    | {
          type: 'global' | 'builtin';
          name: string;
          hash: string;
          typ: Type;
      };

// TODO cache this?
export const allTerms = (ctx: Ctx): Result[] => {
    const globals = Object.entries(ctx.global.names).flatMap(([name, hashes]) =>
        hashes.map(
            (hash) =>
                ({
                    type: 'global',
                    name,
                    hash,
                    typ: ctx.global.termTypes[hash],
                } satisfies Result),
        ),
    );
    const builtins = Object.entries(ctx.global.builtins.names).flatMap(
        ([name, hashes]) =>
            hashes.map(
                (hash) =>
                    ({
                        type: 'builtin',
                        name,
                        hash,
                        typ: ctx.global.builtins.terms[hash],
                    } satisfies Result),
            ),
    );
    return [
        ...builtins,
        ...ctx.local.terms.map(
            ({ name, type, sym }) =>
                ({
                    type: 'local',
                    name,
                    typ: type,
                    hash: `:${sym}`,
                } satisfies Result),
        ),
        ...globals,
    ];
};

export const resolveExpr = (
    text: string,
    hash: string | undefined,
    ctx: Ctx,
    form: Node,
    suffix?: string,
): Expr => {
    if (!text.length) {
        return { type: 'unresolved', form, reason: 'blank' };
    }
    if (text === 'true' || text === 'false') {
        return { type: 'bool', value: text === 'true', form };
    }
    ctx.display[form.loc.idx] = {};
    if (!hash) {
        const results = allTerms(ctx);
        const withScores = results
            .map((result) => ({
                result,
                score: fuzzyScore(0, text, result.name),
            }))
            .filter(({ score }) => score.full)
            .sort((a, b) => compareScores(a.score, b.score));
        ctx.display[form.loc.idx].autoComplete = withScores.map(
            ({ result }) => ({
                type: 'replace',
                text: result.name + (suffix || ''),
                hash: result.hash,
                ann: result.typ,
            }),
        );
    } else {
        if (hash.startsWith(':')) {
            const sym = +hash.slice(1);
            const local = ctx.local.terms.find((t) => t.sym === sym);
            if (local) {
                return { type: 'local', sym: local.sym, form };
            }
        } else {
            const global = ctx.global.terms[hash];
            if (global) {
                return { type: 'global', hash, form };
            }
            const builtin = ctx.global.builtins.terms[hash];
            if (builtin) {
                return { type: 'builtin', hash, form };
            }
        }
    }
    ctx.display[form.loc.idx].style = 'inferred';
    const local = ctx.local.terms.find((t) => t.name === text);
    if (local) {
        return { type: 'local', sym: local.sym, form };
    }
    if (ctx.global.names[text]?.length) {
        return {
            type: 'global',
            hash: ctx.global.names[text][0],
            form,
        };
    }
    if (ctx.global.builtins.names[text]) {
        return {
            type: 'builtin',
            hash: ctx.global.builtins.names[text][0],
            form,
        };
    }
    return {
        type: 'unresolved',
        form,
        reason: `id "${text}" not resolved`,
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
        reason: `id ${text} not resolved`,
    };
};

export const nextSym = (ctx: Ctx) => ctx.sym.current++;

export const addDef = (res: Expr, ctx: Ctx): Ctx => {
    if (res.type === 'deftype') {
        return {
            ...ctx,
            global: {
                ...ctx.global,
                types: {
                    ...ctx.global.types,
                    [res.hash]: res.value,
                },
                typeNames: {
                    ...ctx.global.typeNames,
                    [res.name]: [
                        res.hash,
                        ...(ctx.global.typeNames[res.name] || []),
                    ],
                },
            },
        };
    }
    if (res.type === 'def') {
        const type = getType(res.value, ctx);
        if (!type) {
            console.warn(`Trying to add a def that doesnt give a type`);
            return ctx;
        }
        return {
            ...ctx,
            global: {
                ...ctx.global,
                terms: {
                    ...ctx.global.terms,
                    [res.hash]: res,
                },
                termTypes: {
                    ...ctx.global.termTypes,
                    [res.hash]: type,
                },
                names: {
                    ...ctx.global.names,
                    [res.name]: [
                        res.hash,
                        ...(ctx.global.names[res.name] || []),
                    ],
                },
            },
        };
    }
    return ctx;
};
