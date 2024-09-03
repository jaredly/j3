import { childNodes, Loc, RecNode } from '../shared/nodes';

const findMacros_ = (node: RecNode, found: Loc[]) => {
    if (
        node.type === 'id' &&
        node.ref?.type === 'toplevel' &&
        node.ref.kind === 'macro'
    ) {
        found.push(node.loc);
    }
    if (
        node.type === 'list' &&
        node.items[0].type === 'id' &&
        node.items[0].text === '`'
    ) {
        return; // quoting, abort
    }
    childNodes(node).forEach((child) => findMacros_(child, found));
};

export const findMacros = (node: RecNode) => {
    const found: Loc[] = [];
    findMacros_(node, found);
    return found;
};

type Pattern =
    | { type: 'id'; text: string; loc: Loc }
    | { type: 'constructor'; name: string; args: string[]; loc: Loc }
    | Prim;

type Prim =
    | { type: 'bool'; value: boolean; loc: Loc }
    | { type: 'int'; value: number; loc: Loc };

type Expr =
    | Prim
    | { type: 'var'; text: string; loc: Loc }
    | { type: 'ref'; ref: Loc; loc: Loc }
    | { type: 'function'; args: { name: string; loc: Loc }[]; loc: Loc }
    | { type: 'apply'; target: Expr; args: Expr[]; loc: Loc }
    | {
          type: 'string';
          tag: Expr | null;
          first: string;
          interps: { expr: Expr; suffix: string }[];
          loc: Loc;
      }
    | {
          type: 'if-let';
          table: { pattern: Pattern; value: Expr }[];
          yes: Expr;
          no: Expr;
      }
    | { type: 'quote'; node: RecNode };

/*
match -> if-let
let -> function/apply
if -> if-let
fn -> function

*/

const parseExpr = (node: RecNode): Expr | void => {
    // ok
};

export const parse = (node: RecNode, cursor?: number) => {
    // hrm
};
