import { CTX, Top, Expr } from '.';
import { Loc, RecNode } from '../../shared/nodes';

const topForms: Record<
    string,
    (ctx: CTX, loc: Loc, ...args: RecNode[]) => Top | void
> = {
    def(ctx, loc, name, value) {
        if (!name || !value || name.type !== 'id') {
            ctx.errors.push({ loc, text: 'bad form' });
            return;
        }
        const expr = parseExpr(ctx, value);
        ctx.exports?.push({ kind: 'value', loc: name.loc });
        return expr ? { type: 'def', loc: name.loc, value: expr } : undefined;
    },
    defn(ctx, loc, name, args, value) {
        if (!name || !args || !value || name.type !== 'id') {
            ctx.errors.push({ loc, text: 'bad form' });
            return;
        }

        ctx.exports?.push({ kind: 'value', loc: name.loc });
        const fn = forms.fn(ctx, loc, args, value);
        return fn ? { type: 'def', loc: name.loc, value: fn } : undefined;
    },
};
const getLoc = (l: Loc) => l[l.length - 1][1];
const forms: Record<
    string,
    (ctx: CTX, loc: Loc, ...args: RecNode[]) => Expr | void
> = {
    if(ctx, loc, cond, yes, no) {
        if (!cond || !yes || !no) return;
        ctx.layouts[getLoc(loc)] = {
            type: 'vert',
            layout: { tightFirst: 2, indent: 4 },
        };
        const econd = parseExpr(ctx, cond);
        const eyes = parseExpr(ctx, yes);
        const eno = parseExpr(ctx, no);
        return econd && eyes && eno
            ? { type: 'if', cond: econd, yes: eyes, no: eno }
            : undefined;
    },
    fn(ctx, loc, args, body) {
        if (
            !args ||
            !body ||
            args.type !== 'array' ||
            !args.items.every((arg) => arg.type === 'id')
        ) {
            ctx.errors.push({ loc, text: 'bad form' });
            return;
        }
        const expr = parseExpr(ctx, body);
        return expr
            ? {
                  type: 'fn',
                  args: args.items.map((arg) => arg.text),
                  body: expr,
              }
            : undefined;
    },
};
const parseExpr = (ctx: CTX, value: RecNode): Expr | void => {
    switch (value.type) {
        case 'string':
            return { type: 'string', value: value.first };
        case 'array': {
            const items: Expr[] = [];
            for (let item of value.items) {
                const parsed = parseExpr(ctx, item);
                if (!parsed) return;
                items.push(parsed);
            }
            return { type: 'list', items, loc: value.loc };
        }
        case 'id':
            if (value.ref?.type === 'toplevel') {
                ctx.references.push({ loc: value.loc, ref: value.ref });
                return {
                    type: 'ref',
                    loc: value.ref.loc,
                    kind: value.ref.kind,
                };
            }
            if (value.ref?.type === 'builtin') {
                ctx.references.push({ loc: value.loc, ref: value.ref });
                return {
                    type: 'builtin',
                    name: value.text,
                    kind: value.ref.kind,
                };
            }
            const num = Number(value.text);
            if (Number.isInteger(num)) {
                return { type: 'int', value: num };
            }
            return { type: 'local', loc: value.loc, name: value.text };

        case 'list':
            if (
                value.type === 'list' &&
                value.items.length > 0 &&
                value.items[0].type === 'id'
            ) {
                const id = value.items[0].text;
                if (forms[id]) {
                    return forms[id](ctx, value.loc, ...value.items.slice(1));
                }
            }
            if (value.items.length > 1) {
                const target = parseExpr(ctx, value.items[0]);
                const args = value.items
                    .slice(1)
                    .map((arg) => parseExpr(ctx, arg));
                return target && args.every((arg) => !!arg)
                    ? { type: 'apply', target, args: args as Expr[] }
                    : undefined;
            }
    }
    throw new Error(`invalid expr`);
};
export const parseTop = (ctx: CTX, node: RecNode): Top | null => {
    try {
        if (
            node.type === 'list' &&
            node.items.length > 0 &&
            node.items[0].type === 'id'
        ) {
            const id = node.items[0].text;
            if (topForms[id]) {
                return (
                    topForms[id](ctx, node.loc, ...node.items.slice(1)) ?? null
                );
            }
        }
        const expr = parseExpr(ctx, node);
        return expr ? { type: 'expr', expr } : null;
    } catch (err) {
        ctx.errors.push({ loc: node.loc, text: (err as Error).message });
        return null;
    }
};
