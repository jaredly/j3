import { keyForLoc, Loc, mapNode, RecNode, RecNodeT } from '../../shared/nodes';
import { Auto, Evaluator, ParseResult } from '../boot-ex/types';
import { builtins, evaluate } from './evaluate';
import { parseTop } from './parseTop';

export { builtins } from './evaluate';

const place = (text: string, focus = false): RecNodeT<boolean> => ({
    type: 'id',
    loc: focus,
    text: '',
    ref: { type: 'placeholder', text },
});

export type Top =
    | { type: 'def'; loc: Loc; value: Expr }
    | { type: 'defmacro'; loc: Loc; args: string[]; body: Expr }
    | { type: 'expr'; expr: Expr }
    | { type: 'empty' }
    | { type: 'multi'; tops: Top[] };

export type Expr =
    | { type: 'quote'; items: RecNode[]; loc: Loc }
    | {
          type: 'string';
          first: string;
          templates: { expr: Expr; suffix: string }[];
      }
    | { type: 'int'; value: number }
    | { type: 'float'; value: number }
    | { type: 'ref'; loc: Loc; kind: string }
    | { type: 'local'; name: string; loc: Loc }
    | { type: 'list'; items: Expr[]; loc: Loc }
    | { type: 'fn'; args: string[]; body: Expr }
    | { type: 'builtin'; name: string; kind: string }
    | { type: 'apply'; target: Expr; args: Expr[] }
    | { type: 'if'; cond: Expr; yes: Expr; no: Expr };

type TINFO = true;

export type IR = Expr;

export type CTX = Omit<ParseResult<Top>, 'top'> & { cursor?: number };

const kwds: Auto[] = [
    // {
    //     text: '<',
    //     templates: [],
    //     docs: 'less than',
    //     reference: { type: 'builtin', kind: 'value' },
    // },
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
        text: 'defn',
        toplevel: true,
        templates: [
            {
                template: [
                    place('name', true),
                    { type: 'array', items: [place('pattern')], loc: false },
                    place('body'),
                ],
                docs: 'global function definition',
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

Object.keys(builtins).forEach((key) => {
    kwds.push({
        text: key,
        templates: [],
        docs: 'a builtin',
        reference: { type: 'builtin', kind: 'value' },
    });
});

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
    macrosToExpand(node) {
        const found: ReturnType<(typeof SimplestEvaluator)['macrosToExpand']> =
            [];
        mapNode(node, (node) => {
            if (
                node.type === 'list' &&
                node.items.length > 0 &&
                node.items[0].type === 'id' &&
                node.items[0].text === '`'
            ) {
                return false;
            }
            if (
                node.type === 'id' &&
                node.ref?.type === 'toplevel' &&
                node.ref.kind === 'macro'
            ) {
                found.push({ loc: node.loc, ref: node.ref });
            }
            return node;
        });
        return found;
    },
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
                case 'defmacro':
                    res.byLoc[keyForLoc(top.loc)] = {
                        type: 'fn',
                        args: top.args,
                        body: top.body,
                    };
                    return;
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
