import { Node } from '../types/cst';
import { Expr } from '../types/ast';
import { Ctx, any } from './Ctx';
import { Result } from './to-ast';
import { populateAutocomplete } from './populateAutocomplete';

// TODO cache this?

export const resolveExpr = (
    text: string,
    hash: string | undefined,
    ctx: Ctx,
    form: Node,
): Expr => {
    if (!text.length && !hash) {
        return { type: 'unresolved', form, reason: 'blank' };
    }
    if (text === 'true' || text === 'false') {
        return { type: 'bool', value: text === 'true', form };
    }
    ctx.display[form.loc.idx] = {};
    if (!hash) {
        populateAutocomplete(ctx, text, form);
        ctx.display[form.loc.idx].style = { type: 'unresolved' };
        return {
            type: 'unresolved',
            form,
            reason: `No hash specified`,
        };
    } else {
        if (hash.startsWith(':')) {
            const sym = +hash.slice(1);
            const local = ctx.local.terms.find((t) => t.sym === sym);
            if (local) {
                ctx.display[form.loc.idx].style = {
                    type: 'id',
                    hash: ':' + local.sym,
                    text: local.name,
                    ann: local.type,
                };
                return { type: 'local', sym: local.sym, form };
            }
            populateAutocomplete(ctx, text, form);
            return { type: 'unresolved', form, reason: 'local missing' };
        } else {
            const global = ctx.global.terms[hash];
            if (global) {
                ctx.display[form.loc.idx].style = {
                    type: 'id',
                    hash,
                    text: ctx.global.reverseNames[hash],
                    ann: global.type,
                };
                return { type: 'global', hash, form };
            }
            const builtin = ctx.global.builtins.terms[hash];
            if (builtin) {
                ctx.display[form.loc.idx].style = {
                    type: 'id',
                    hash,
                    text: ctx.global.reverseNames[hash],
                    ann: builtin,
                };
                return { type: 'builtin', hash, form };
            }
            populateAutocomplete(ctx, text, form);
            return {
                type: 'unresolved',
                form,
                reason: 'global or builtin missing',
            };
        }
    }
};

export const allTerms = (ctx: Ctx): Result[] => {
    const globals = Object.entries(ctx.global.names).flatMap(([name, hashes]) =>
        hashes.map(
            (hash) =>
                ({
                    type: 'global',
                    name,
                    hash,
                    typ: ctx.global.terms[hash].type,
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

export const allTypes = (ctx: Ctx): Result[] => {
    const globals = Object.entries(ctx.global.typeNames).flatMap(
        ([name, hashes]) =>
            hashes.map(
                (hash) =>
                    ({
                        type: 'global',
                        name,
                        hash,
                        typ: ctx.global.types[hash],
                    } satisfies Result),
            ),
    );
    const builtins = Object.entries(ctx.global.builtins.types).map(
        ([name, tvars]) =>
            ({
                type: 'builtin',
                name,
                hash: ':builtin:' + name,
                // TODO
                typ: any,
            } satisfies Result),
    );
    return [
        ...builtins,
        ...ctx.local.types.map(
            ({ name, sym, bound }) =>
                ({
                    type: 'local',
                    name,
                    typ: bound ?? any,
                    hash: `:${sym}`,
                } satisfies Result),
        ),
        ...globals,
    ];
};
