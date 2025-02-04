import { js, TestParser } from '../keyboard/test-utils';
import { Id, Loc, TextSpan } from '../shared/cnodes';
import { Ctx, list, match, or, Rule, ref, tx, seq, kwd, group, id, star, Src, number, text, table, opt } from './dsl3';
import { binops, Expr, kwds, Stmt } from './js--types';
import { mergeSrc, nodesSrc } from './ts-types';

const stmts: Record<string, Rule<Stmt>> = {
    for: tx(
        seq(kwd('for'), list('round', seq(ref('stmt', 'init'), ref('expr', 'cond'), ref('expr', 'update'))), ref('block', 'body')),
        (ctx, src) => ({
            type: 'for',
            init: ctx.ref<Stmt>('init'),
            cond: ctx.ref<Expr>('cond'),
            update: ctx.ref<Expr>('update'),
            body: ctx.ref<Stmt[]>('body'),
            src,
        }),
    ),
    return: tx(seq(kwd('return'), group('value', opt(ref('expr ')))), (ctx, src) => ({ type: 'return', value: ctx.ref<Expr | null>('value'), src })),
    let: tx(seq(kwd('let'), group('name', id(null)), kwd('=', 'punct'), ref('expr ', 'value')), (ctx, src) => ({
        type: 'let',
        name: ctx.ref<Id<Loc>>('name'),
        value: ctx.ref<Expr>('value'),
        src,
    })),
    if: tx(seq(kwd('if'), ref('expr', 'cond'), ref('block', 'yes'), opt(seq(kwd('else'), ref('block', 'no')))), (ctx, src) => ({
        type: 'if',
        cond: ctx.ref<Expr>('cond'),
        yes: ctx.ref<Stmt[]>('yes'),
        no: ctx.ref<null | Stmt[]>('no'),
        src,
    })),
    throw: tx<Stmt>(seq(kwd('throw'), ref('expr ', 'value')), (ctx, src) => ({
        type: 'throw',
        value: ctx.ref<Expr>('value'),
        src,
    })),
};

export type Suffix =
    | { type: 'index'; index: Expr; src: Src }
    | { type: 'call'; items: Expr[]; src: Src }
    | { type: 'attribute'; attribute: Id<Loc>; src: Src };

const parseSmoosh = (base: Expr, suffixes: Suffix[], src: Src): Expr => {
    if (!suffixes.length) return base;
    suffixes.forEach((suffix) => {
        switch (suffix.type) {
            case 'attribute':
                base = { type: 'attribute', target: base, attribute: suffix.attribute, src: mergeSrc(base.src, nodesSrc(suffix.attribute)) };
                return;
            case 'call':
                base = { type: 'call', target: base, args: suffix.items, src: mergeSrc(base.src, suffix.src) };
                return;
            case 'index':
                base = { type: 'index', target: base, index: suffix.index, src: mergeSrc(base.src, suffix.src) };
                return;
                return;
        }
    });
    return { ...base, src };
};

const exprs: Record<string, Rule<Expr>> = {
    'expr num': tx(group('value', number), (ctx, src) => ({ type: 'number', value: ctx.ref<number>('value'), src })),
    'expr var': tx(group('id', id(null)), (ctx, src) => ({ type: 'var', name: ctx.ref<Id<Loc>>('id').text, src })),
    'expr text': tx(group('spans', text(ref('expr'))), (ctx, src) => ({ type: 'text', spans: ctx.ref<TextSpan<Expr>[]>('spans'), src })),
    'expr array': tx(list('square', group('items', star(ref('expr')))), (ctx, src) => ({
        type: 'array',
        items: ctx.ref<Expr[]>('items'),
        src,
    })),
    'expr table': tx(
        group(
            'rows',
            table(
                'curly',
                tx(seq(group('key', id(null)), ref('expr', 'value')), (ctx, src) => ({
                    name: ctx.ref<Id<Loc>>('key').text,
                    value: ctx.ref<Expr>('value'),
                })),
            ),
        ),
        (ctx, src) => ({ type: 'object', items: ctx.ref<{ name: Id<Loc>; value: Expr }[]>('rows'), src }),
    ),
    'expr!': list('smooshed', ref('expr..')),
    'expr wrap': tx(list('round', ref('expr', 'inner')), (ctx, _) => ctx.ref<Expr>('inner')),
};

const rules = {
    stmt: or(
        list('spaced', or(...Object.keys(stmts).map((name) => ref(name)))),
        tx(kwd('return'), (_, src) => ({ type: 'return', value: null, src })),
        tx(ref('expr', 'expr'), (ctx, src) => ({
            type: 'expr',
            expr: ctx.ref<Expr>('expr'),
            src,
        })),
    ),
    comment: list('smooshed', seq(kwd('//', 'comment'), { type: 'any' })),
    block: list('curly', star(ref('stmt'))),
    ...stmts,
    'expr..': tx<Expr>(
        seq(
            ref('expr', 'base'),
            group(
                'suffixes',
                star(
                    or<Suffix>(
                        tx(seq(kwd('.'), group('attribute', id('attribute'))), (ctx, src) => ({
                            type: 'attribute',
                            attribute: ctx.ref<Id<Loc>>('attribute'),
                            src,
                        })),
                        tx(list('square', ref('expr', 'index')), (ctx, src) => ({
                            type: 'index',
                            index: ctx.ref<Expr>('index'),
                            src,
                        })),
                        tx(list('round', group('items', star(ref('expr')))), (ctx, src) => ({
                            type: 'call',
                            items: ctx.ref<Expr[]>('items'),
                            src,
                        })),
                    ),
                ),
            ),
        ),
        (ctx, src) => parseSmoosh(ctx.ref<Expr>('base'), ctx.ref<Suffix[]>('suffixes'), src),
    ),
    expr: or(...Object.keys(exprs).map((name) => ref(name)), list('spaced', ref('expr '))),
    ...exprs,
    bop: or(...binops.map((m) => kwd(m, 'bop'))),
    'expr ': or(
        tx<Expr>(seq(list('round', group('args', star(id(null)))), kwd('=>'), group('body', or(ref('block'), ref('expr ')))), (ctx, src) => ({
            type: 'arrow',
            args: ctx.ref<Id<Loc>[]>('args'),
            body: ctx.ref<Expr | Stmt[]>('body'),
            src,
        })),
        tx<Expr>(seq(kwd('new'), ref('expr', 'inner')), (ctx, src) => ({
            type: 'new',
            inner: ctx.ref<Expr>('inner'),
            src,
        })),
        tx<Expr>(seq(ref('expr', 'left'), ref('bop', 'op'), ref('expr', 'right')), (ctx, src) => ({
            type: 'bop',
            left: ctx.ref<Expr>('left'),
            op: ctx.ref<Id<Loc>>('op').text,
            right: ctx.ref<Expr>('right'),
            src,
        })),
        ref('expr'),
    ),
};

export const ctx: Ctx = {
    rules,
    ref(name) {
        if (!this.scope) throw new Error(`no  scope`);
        return this.scope[name];
    },
    kwds: kwds,
    meta: {},
};

export const parser: TestParser = {
    config: {
        // punct: [],
        // so js's default is just 'everything for itself'
        // tight: [...'~`!@#$%^&*_+-=\\./?:'],
        // punct: '~`!@#$%^&*_+-=\\./?:',
        punct: ['.', '/', '~`!@#$%^&*+-=\\/?:><'],
        space: ' ',
        sep: ',;\n',
        tableCol: ',:',
        tableRow: ';\n',
        tableNew: ':',
        xml: true,
    },
    spans: () => [],
    parse(node, cursor) {
        const c = {
            ...ctx,
            meta: {},
            autocomplete: cursor != null ? { loc: cursor, concrete: [], kinds: [] } : undefined,
        };
        const res = match({ type: 'ref', name: 'stmt' }, c, { nodes: [node], loc: [] }, 0);

        return {
            result: res?.value,
            ctx: { meta: c.meta },
            bads: [],
            goods: [],
        };
    },
};
