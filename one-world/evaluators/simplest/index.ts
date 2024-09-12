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
    | { type: 'expr'; expr: Expr };

type Expr =
    | { type: 'string'; value: string }
    | { type: 'int'; value: number }
    | { type: 'ref'; loc: Loc; kind: string }
    | { type: 'builtin'; name: string; kind: string }
    | { type: 'apply'; target: Expr; args: Expr[] }
    | { type: 'if'; cond: Expr; yes: Expr; no: Expr };

type TINFO = void;

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
        if (!name || !value || name.type !== 'id') return;
        const expr = parseExpr(ctx, value);
        ctx.exports?.push({ kind: 'value', loc });
        return expr ? { type: 'def', loc: name.loc, value: expr } : undefined;
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
};

const parseExpr = (ctx: CTX, value: RecNode): Expr | void => {
    switch (value.type) {
        case 'string':
            return { type: 'string', value: value.first };
        case 'id':
            if (value.ref?.type === 'toplevel') {
                return {
                    type: 'ref',
                    loc: value.ref.loc,
                    kind: value.ref.kind,
                };
            }
            if (value.ref?.type === 'builtin') {
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
            throw new Error(`locals not supported ${value.text}`);
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
        return null;
    }
};

const evaluate = (ir: IR, irs: Record<string, IR>): any => {
    switch (ir.type) {
        case 'string':
            return ir.value;
        case 'int':
            return ir.value;
        case 'apply':
            return evaluate(
                ir.target,
                irs,
            )(...ir.args.map((arg) => evaluate(arg, irs)));
        case 'builtin':
            switch (ir.name) {
                case '<':
                    return (a: number, b: number) => a < b;
                case '>':
                    return (a: number, b: number) => a > b;
            }
            throw new Error('unknown builtin');
        case 'if':
            return evaluate(ir.cond, irs)
                ? evaluate(ir.yes, irs)
                : evaluate(ir.no, irs);
    }
    throw new Error('cant evaluate');
};

export const SimplestEvaluator: Evaluator<Top, TINFO, IR> = {
    kwds,
    parse(node, cursor) {
        const ctx: CTX = {
            layouts: {},
            styles: {},
            exports: [],
            tableHeaders: {},
            autocomplete: undefined,
            cursor,
        };
        const top = parseTop(ctx, node);
        return { ...ctx, top };
    },
    macrosToExpand: () => [],
    compile(top, info) {
        switch (top.type) {
            case 'def':
                return { byLoc: { [keyForLoc(top.loc)]: top.value } };
            case 'expr':
                return { byLoc: {}, evaluate: top.expr };
        }
    },
    evaluate(ir, irs) {
        return evaluate(ir, irs);
    },
    infer(top, infos) {},
    print(ir, irs) {
        return {
            code: 'lol',
            sourceMap: [],
        };
    },
};
