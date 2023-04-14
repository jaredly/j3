import { Node } from '../types/cst';
import { Type } from '../types/ast';
import { any, Ctx, none } from './Ctx';
import { populateAutocompleteType } from './populateAutocomplete';
import { ensure } from './nodeToExpr';
import { CstCtx } from './library';

export const resolveType = (
    text: string,
    hash: string | number | undefined,
    ctx: CstCtx,
    form: Node,
): Type => {
    if (text === 'true' || text === 'false') {
        return { type: 'bool', value: text === 'true', form };
    }
    if (text.startsWith("'")) {
        return { type: 'tag', name: text, args: [], form };
    }
    // console.log('resolve typpe', text);
    if (hash == null && text === any.form.text) {
        return { ...any, form };
    }
    if (hash == null && text === none.form.text) {
        return { ...none, form };
    }
    if (hash == null) {
        // console.log('res type no hash', text);
        populateAutocompleteType(ctx, text, form);
        ctx.results.display[form.loc.idx].style = { type: 'unresolved' };
        return {
            type: 'unresolved',
            form,
            reason: 'no hash specified',
        };
    }

    if (typeof hash === 'string') {
        if (hash.startsWith(':builtin:')) {
            text = hash.slice(':builtin:'.length);
            const builtin = ctx.global.builtins[text];
            if (builtin?.type === 'type') {
                ensure(ctx.results.display, form.loc.idx, {}).style = {
                    type: 'id',
                    hash: text,
                    text,
                };
                ctx.results.hashNames[form.loc.idx] = text;
                return { type: 'builtin', name: text, form };
            }
        }

        const global = ctx.global.library.definitions[hash];
        if (global?.type === 'type') {
            ensure(ctx.results.display, form.loc.idx, {}).style = {
                type: 'id',
                hash,
                text: 'STOPSHIP', // ctx.global.reverseNames[hash],
                ann: global.value,
            };
            ctx.results.hashNames[form.loc.idx] = 'STOPSHIP'; //ctx.global.reverseNames[hash];
            return { type: 'global', hash, form };
        }
    }

    if (typeof hash === 'number') {
        const sym = hash;
        const local = ctx.local.types.find((t) => t.sym === sym);
        if (local) {
            ensure(ctx.results.display, form.loc.idx, {}).style = {
                type: 'id',
                hash: local.sym,
                text: local.name,
                // ann: local.type,
            };
            ctx.results.hashNames[form.loc.idx] = local.name;
            return { type: 'local', sym: local.sym, form };
        }
    }

    populateAutocompleteType(ctx, text, form);
    return {
        type: 'unresolved',
        form,
        reason: 'global or builtin missing',
    };
};
