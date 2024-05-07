import { Node } from '../../../../src/types/cst';
import { fromJCST, jcst, toJCST } from '../round-1/j-cst';
import { arr, tuple, unwrapArray, unwrapTuple } from '../round-1/parse';
import { Parser } from './interface';

type Stmt = { _stmt: 1 };
type Expr = { _expr: 1 };
type Env = { _env: 1 };

export const basicParser = <SimpleNode>(fns: {
    fromNode?: (node: Node) => SimpleNode;
    toNode?: (node: SimpleNode) => Node;
    parse_stmt: (cst: SimpleNode) => Stmt;
    parse_expr: (cst: SimpleNode) => Expr;
}): Parser<Stmt, Expr, SimpleNode> => ({
    fromNode(node) {
        if (fns.fromNode) {
            return fns.fromNode(node);
        }
        // return toJCST(node) as SimpleNode;
        return node as SimpleNode;
    },

    toNode(node) {
        if (fns.toNode) {
            return fns.toNode(node);
        }
        // return fromJCST(node as jcst);
        return node as Node;
    },

    parse(node) {
        const j = this.fromNode(node);
        try {
            return {
                stmt: j ? fns.parse_stmt(j as SimpleNode) : null,
                errors: [],
            };
        } catch (err) {
            return {
                stmt: null,
                errors: [[node.loc, (err as Error).message]],
            };
        }
    },

    parseExpr(node) {
        const j = this.fromNode(node);
        try {
            return {
                expr: j ? fns.parse_expr(j as SimpleNode) : null,
                errors: [],
            };
        } catch (err) {
            return {
                expr: null,
                errors: [[node.loc, (err as Error).message]],
            };
        }
    },
});

export const recoveringParser = <SimpleNode>(fns: {
    fromNode?: (node: Node) => SimpleNode;
    toNode?: (node: SimpleNode) => Node;
    parse_stmt2(cst: SimpleNode): tuple<arr<tuple<number, string>>, Stmt>;
    parse_expr2(cst: SimpleNode): tuple<arr<tuple<number, string>>, Expr>;
}): Parser<Stmt, Expr, SimpleNode> => ({
    fromNode(node) {
        if (fns.fromNode) {
            return fns.fromNode(node);
        }
        return toJCST(node) as SimpleNode;
    },

    toNode(node) {
        if (fns.toNode) {
            return fns.toNode(node);
        }
        return fromJCST(node as jcst);
    },

    parse(node) {
        const j = this.fromNode(node);
        if (!j) return { stmt: null, errors: [] };
        try {
            const [errors, stmt] = unwrapTuple(fns.parse_stmt2(j));
            return { stmt, errors: unwrapArray(errors).map(unwrapTuple) };
        } catch (err) {
            return { stmt: null, errors: [[node.loc, (err as Error).message]] };
        }
    },

    parseExpr(node) {
        const j = this.fromNode(node);
        if (!j) return { expr: null, errors: [] };
        try {
            const [errors, expr] = unwrapTuple(fns.parse_expr2(j));
            return { expr, errors: unwrapArray(errors).map(unwrapTuple) };
        } catch (err) {
            return { expr: null, errors: [[node.loc, (err as Error).message]] };
        }
    },
});
