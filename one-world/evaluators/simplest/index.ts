import { Loc, RecNode, RecNodeT } from '../../shared/nodes';
import { Auto, Evaluator, ParseResult } from '../boot-ex/types';

const place = (text: string, focus = false): RecNodeT<boolean> => ({
    type: 'id',
    loc: focus,
    text: '',
    ref: { type: 'placeholder', text },
});

type Top =
    | { type: 'def'; name: string; value: Expr }
    | { type: 'expr'; expr: Expr };

type Expr =
    | { type: 'string'; value: string }
    | { type: 'int'; value: number }
    | { type: 'ref'; loc: Loc; kind: string }
    | { type: 'builtin'; name: string; kind: string }
    | { type: 'apply'; target: Expr; args: Expr[] }
    | { type: 'if'; cond: Expr; yes: Expr; no: Expr };

type TINFO = void;

type IR = string;

type CTX = Omit<ParseResult<Top>, 'top'> & { cursor?: number };

const kwds: Auto[] = [
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
        return expr ? { type: 'def', name: name.text, value: expr } : undefined;
    },
};

const getLoc = (l: Loc) => l[l.length - 1][1];

const forms: Record<
    string,
    (ctx: CTX, loc: Loc, ...args: RecNode[]) => Expr | void
> = {
    if(ctx, loc, cond, yes, no) {
        if (!cond || !yes || !no) return;
        const econd = parseExpr(ctx, cond);
        const eyes = parseExpr(ctx, yes);
        const eno = parseExpr(ctx, no);
        ctx.layouts[getLoc(loc)] = {
            type: 'vert',
            layout: { tightFirst: 2, indent: 4 },
        };
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
    }
    throw new Error(`invalid expr`);
};

const parseTop = (ctx: CTX, node: RecNode): Top | null => {
    if (
        node.type === 'list' &&
        node.items.length > 0 &&
        node.items[0].type === 'id'
    ) {
        const id = node.items[0].text;
        if (topForms[id]) {
            return topForms[id](ctx, node.loc, ...node.items.slice(1)) ?? null;
        }
    }
    const expr = parseExpr(ctx, node);
    return expr ? { type: 'expr', expr } : null;
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
        return 'lol';
    },
    evaluate(ir, irs) {
        return 'ok';
    },
    infer(top, infos) {},
    print(ir, irs) {
        return {
            code: 'lol',
            sourceMap: [],
        };
    },
};
