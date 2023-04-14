import { Node } from '../types/cst';
import { Expr } from '../types/ast';
import { Ctx, any } from './Ctx';
import { Result } from './to-ast';
import { populateAutocomplete } from './populateAutocomplete';

// TODO cache this?

export const resolveExpr = (
    text: string,
    hash: string | number | undefined,
    ctx: Ctx,
    form: Node,
): Expr => {
    if (!text.length && !hash) {
        return { type: 'unresolved', form, reason: 'blank' };
    }
    if (text === 'true' || text === 'false') {
        return { type: 'bool', value: text === 'true', form };
    }
    if (text.startsWith("'")) {
        return { type: 'tag', name: text, form };
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
        if (typeof hash === 'number') {
            const sym = hash;
            const local = ctx.local.terms.find((t) => t.sym === sym);
            if (local) {
                ctx.display[form.loc.idx].style = {
                    type: 'id',
                    hash: local.sym,
                    text: local.name,
                    ann: local.type,
                };
                ctx.hashNames[form.loc.idx] = local.name;
                return { type: 'local', sym: local.sym, form };
            }
            populateAutocomplete(ctx, text, form);
            return { type: 'unresolved', form, reason: 'local missing' };
        } else {
            if (hash.startsWith(':builtin:')) {
                text = hash.slice(':builtin:'.length);
                const builtin = ctx.global.builtins.terms[text];
                if (builtin) {
                    const last = text.split('/').slice(-1)[0];
                    ctx.display[form.loc.idx].style = {
                        type: 'id',
                        hash,
                        text: last,
                        ann: builtin,
                    };
                    ctx.hashNames[form.loc.idx] = last;
                    return { type: 'builtin', name: text, form };
                }
            }
            const global = ctx.global.terms[hash];
            if (global) {
                ctx.display[form.loc.idx].style = {
                    type: 'id',
                    hash,
                    text: ctx.global.reverseNames[hash],
                    ann: global.type,
                };
                ctx.hashNames[form.loc.idx] = ctx.global.reverseNames[hash];
                return { type: 'global', hash, form };
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
    const builtins = Object.entries(ctx.global.builtins.terms).map(
        ([name, value]) =>
            ({
                type: 'builtin',
                name,
                hash: ':builtin:' + name,
                typ: value,
            } satisfies Result),
    );
    return [
        ...builtins,
        ...ctx.local.terms.map(
            ({ name, type, sym }) =>
                ({
                    type: 'local',
                    name,
                    typ: type,
                    hash: sym,
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
                    hash: sym,
                } satisfies Result),
        ),
        ...globals,
    ];
};
