import { Node } from '../types/cst';
import { Type } from '../types/ast';
import { Ctx, resolveType, nilt } from './to-ast';

export const nodeToType = (form: Node, ctx: Ctx): Type => {
    switch (form.type) {
        case 'identifier': {
            return resolveType(form.text, form.hash, ctx, form);
        }
        case 'number':
            return {
                type: 'number',
                form,
                kind: form.raw.includes('.') ? 'float' : 'int',
                value: +form.raw,
            };
        case 'array':
            return {
                type: 'union',
                form,
                open: false,
                items: form.values.map((value) => nodeToType(value, ctx)),
            };
        case 'tag':
            return {
                type: 'tag',
                form,
                name: form.text,
                args: [],
            };
        case 'list': {
            if (!form.values.length) {
                return { ...nilt, form };
            }
            const first = form.values[0];
            const args = form.values.slice(1);
            if (first.type === 'tag') {
                return {
                    type: 'tag',
                    form,
                    name: first.text,
                    args: args.map((arg) => nodeToType(arg, ctx)),
                };
            }
            return {
                type: 'apply',
                target: nodeToType(first, ctx),
                args: args.map((arg) => nodeToType(arg, ctx)),
                form,
            };
        }
    }
    return {
        type: 'unresolved',
        form,
        reason: 'nodeToType not impl type ' + form.type,
    };
};
