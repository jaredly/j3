import { keyForLoc, Loc, RecNode, RecNodeT } from '../../shared/nodes';
import { Auto, Evaluator, ParseResult } from '../boot-ex/types';

const place = (text: string, focus = false): RecNodeT<boolean> => ({
    type: 'id',
    loc: focus,
    text: '',
    ref: { type: 'placeholder', text },
});

type Top =
    | { type: 'def'; loc: Loc; value: Expr }
    | { type: 'expr'; expr: Expr }
    | { type: 'multi'; tops: Top[] };

type Expr =
    | { type: 'string'; value: string }
    | { type: 'int'; value: number }
    | { type: 'ref'; loc: Loc; kind: string }
    | { type: 'local'; name: string; loc: Loc }
    | { type: 'list'; items: Expr[]; loc: Loc }
    | { type: 'fn'; args: string[]; body: Expr }
    | { type: 'builtin'; name: string; kind: string }
    | { type: 'apply'; target: Expr; args: Expr[] }
    | { type: 'if'; cond: Expr; yes: Expr; no: Expr };

type TINFO = true;

type IR = Expr;

type CTX = Omit<ParseResult<Top>, 'top'> & { cursor?: number };

const kwds: Auto[] = [
    {
        text: '<',
        templates: [],
        docs: 'less than',
        reference: { type: 'builtin', kind: 'value' },
    },
    {
        text: 'def',
        toplevel: true,
        templates: [
            {
                template: [place('name', true), place('value')],
                docs: 'global definition',
            },
        ],
    },
    {
        text: 'if',
        templates: [
            {
                template: [place('cond'), place('yes'), place('no')],
                docs: '',
            },
        ],
    },
];

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

const parseTop = (ctx: CTX, node: RecNode): Top | null => {
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

export const builtins: Record<string, any> = {
    '=': (a: number, b: number) => a === b,
    '<': (a: number, b: number) => a < b,
    '>': (a: number, b: number) => a > b,
    '-': (a: number, b: number) => a - b,
    '+': (a: number, b: number) => a + b,
    not: (b: boolean) => !b,
    trace: (text: string, v: any) => (console.log(text, v), v),
    false: false,
    true: true,
};

const evaluate = (
    ir: IR,
    irs: Record<string, IR>,
    locals: Record<string, any>,
): any => {
    if (!ir) throw new Error(`evaluate empty`);
    switch (ir.type) {
        case 'string':
            return ir.value;
        case 'int':
            return ir.value;
        case 'apply':
            return evaluate(
                ir.target,
                irs,
                locals,
            )(...ir.args.map((arg) => evaluate(arg, irs, locals)));
        case 'list':
            return ir.items.map((item) => evaluate(item, irs, locals));
        case 'builtin':
            if (ir.name in builtins) {
                return builtins[ir.name];
            }
            throw new Error('unknown builtin: ' + ir.name);
        case 'if':
            return evaluate(ir.cond, irs, locals)
                ? evaluate(ir.yes, irs, locals)
                : evaluate(ir.no, irs, locals);
        case 'ref':
            const key = keyForLoc(ir.loc);
            if (!irs[key]) {
                console.log(irs);
                throw new Error(`cant resolve ref: ${key}`);
            }
            return evaluate(irs[key], irs, locals);
        case 'local':
            if (ir.name in locals) {
                return locals[ir.name];
            }
            throw new Error(`no local ${ir.name}`);
        case 'fn':
            return (...args: any[]) => {
                if (args.length !== ir.args.length) {
                    throw new Error(
                        `wrong number of args expected ${ir.args.length}, found ${args.length}`,
                    );
                }
                const sub = { ...locals };
                args.forEach((arg, i) => {
                    sub[ir.args[i]] = arg;
                });
                return evaluate(ir.body, irs, sub);
            };
    }
    throw new Error(`cant evaluate ${(ir as any).type}`);
};

export const SimplestEvaluator: Evaluator<Top, TINFO, IR> = {
    kwds,
    parse(node, cursor) {
        const ctx: CTX = {
            layouts: {},
            styles: {},
            exports: [],
            errors: [],
            tableHeaders: {},
            autocomplete: undefined,
            references: [],
            cursor,
        };
        const top = parseTop(ctx, node);
        return { ...ctx, top };
    },
    macrosToExpand: () => [],
    combineMutuallyRecursive(tops) {
        return { type: 'multi', tops };
    },
    compile(top, info) {
        const res: { byLoc: Record<string, Expr>; evaluate?: Expr } = {
            byLoc: {},
            evaluate: undefined,
        };
        const add = (top: Top) => {
            switch (top.type) {
                case 'def':
                    res.byLoc[keyForLoc(top.loc)] = top.value;
                    return;
                case 'expr':
                    res.evaluate = top.expr;
                    return;
                case 'multi':
                    return top.tops.forEach(add);
            }
        };
        add(top);
        return res;
    },
    evaluate(ir, irs) {
        return evaluate(ir, irs, {});
    },
    infer(top, infos) {
        return { errors: [], typeForLoc: [], info: true };
    },
    print(ir, irs) {
        return {
            code: 'lol',
            sourceMap: [],
        };
    },
};
