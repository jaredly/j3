import { Node } from '../../../src/types/cst';
import { NNode } from '../../../src/state/nestedNodes/NNode';
import { Path } from '../../store';
import { Errors } from '../../ide/ground-up/FullEvalator';
import { AnyEnv } from '../store/getResults';
import { LocedName } from '../store/sortTops';

type RefNode = Extract<NNode, { type: 'ref' }> & { path: Path };
export type LineFixture<Expr> = {
    type: 'line';
    loc: number;
    input: null | {
        node: Node;
        child: RefNode;
        expr?: Expr;
    };
    output: null | {
        node: Node;
        child: RefNode;
        expr?: Expr;
    };
};

export type Data<Expr> = {
    test: null | { node: Node; child: RefNode; expr?: Expr };
    fxid: number;
    fixtures: (
        | LineFixture<Expr>
        | {
              type: 'unknown';
              node: Node;
              child: RefNode;
              loc: number;
              expr?: Expr;
          }
    )[];
};

export type Expr = { _phantom: 'expr' };
const parseTuple = (node: Node) => {
    if (
        node.type === 'list' &&
        node.values.length > 1 &&
        node.values[0].type === 'identifier' &&
        node.values[0].text === ','
    ) {
        return node.values.slice(1);
    }
    return null;
};

export const parseExpr =
    (evaluator: AnyEnv, errors_: Errors, deps: LocedName[]) => (node: Node) => {
        const { expr, errors } = evaluator.parseExpr(node);
        if (expr) {
            deps.push(...(evaluator.analysis?.externalsExpr(expr) ?? []));
        }
        return expr;
    };
const parseFixture = <Expr,>(
    item: Node,
    path: Path,
    ancestors: Path[],
    parseExpr: (node: Node) => Expr | undefined,
): Data<Expr>['fixtures'][0] => {
    const inner = parseTuple(item);
    if (!inner?.length || inner.length != 2) {
        return {
            type: 'unknown',
            loc: item.loc,
            node: item,
            child: { type: 'ref', path, id: item.loc, ancestors },
            expr: parseExpr(item),
        };
    } else {
        return {
            type: 'line',
            loc: item.loc,
            input: {
                node: inner[0],
                expr: parseExpr(inner[0]),
                child: {
                    path: { idx: item.loc, type: 'child', at: 1 },
                    ancestors: [...ancestors, path],
                    type: 'ref',
                    id: inner[0].loc,
                },
            },
            output: inner[1]
                ? {
                      node: inner[1],
                      expr: parseExpr(inner[1]),
                      child: {
                          path: { idx: item.loc, type: 'child', at: 2 },
                          ancestors: [...ancestors, path],
                          type: 'ref',
                          id: inner[1].loc,
                      },
                  }
                : null,
        };
    }
};

export const parse = <Expr,>(
    node: Node,
    parseExpr: (node: Node) => Expr | undefined,
): Data<Expr> | void => {
    if (node.type === 'blank') {
        return;
    }
    if (node.type === 'array') {
        return {
            test: null,
            fxid: node.loc,
            fixtures: node.values.map((item, i) =>
                parseFixture(
                    item,
                    { type: 'child', at: i, idx: node.loc },
                    [],
                    parseExpr,
                ),
            ),
        };
    }
    const top = parseTuple(node);
    if (!top) return;
    if (top.length === 2) {
        const [test, fixtures] = top;
        if (fixtures.type === 'array') {
            return {
                test: {
                    node: test,
                    expr: parseExpr(test),
                    child: {
                        path: { idx: node.loc, type: 'child', at: 1 },
                        id: test.loc,
                        type: 'ref',
                    },
                },
                fxid: fixtures.loc,
                fixtures: fixtures.values.map((item, i) =>
                    parseFixture(
                        item,
                        {
                            type: 'child',
                            at: i,
                            idx: fixtures.loc,
                        },
                        [{ idx: node.loc, type: 'child', at: 2 }],
                        parseExpr,
                    ),
                ),
            };
        }
    }
};
export const findLastIndex = <T,>(arr: T[], f: (t: T) => boolean) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (f(arr[i])) return i;
    }
    return -1;
};
