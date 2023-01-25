import { Node } from '../types/cst';
import { Expr } from '../types/ast';
import { Ctx } from './Ctx';
import { compareScores, fuzzyScore } from './fuzzy';
import { Result } from './to-ast';

// TODO cache this?

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
                ctx.display[form.loc.idx].style = {
                    type: 'id',
                    hash: ':' + local.sym,
                };
                return { type: 'local', sym: local.sym, form };
            }
        } else {
            const global = ctx.global.terms[hash];
            if (global) {
                ctx.display[form.loc.idx].style = { type: 'id', hash };
                return { type: 'global', hash, form };
            }
            const builtin = ctx.global.builtins.terms[hash];
            if (builtin) {
                ctx.display[form.loc.idx].style = { type: 'id', hash };
                return { type: 'builtin', hash, form };
            }
        }
    }
    const local = ctx.local.terms.find((t) => t.name === text);
    if (local) {
        ctx.display[form.loc.idx].style = {
            type: 'id',
            hash: ':' + local.sym,
        };
        return { type: 'local', sym: local.sym, form };
    }
    if (ctx.global.names[text]?.length) {
        const hash = ctx.global.names[text][0];
        ctx.display[form.loc.idx].style = { type: 'id', hash };
        return {
            type: 'global',
            hash,
            form,
        };
    }
    if (ctx.global.builtins.names[text]) {
        const hash = ctx.global.builtins.names[text][0];
        ctx.display[form.loc.idx].style = { type: 'id', hash };
        return { type: 'builtin', hash, form };
    }
    return {
        type: 'unresolved',
        form,
        reason: `id "${text}" not resolved`,
    };
};

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
