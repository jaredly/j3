import { RecNode } from '../shared/nodes';
import { RenderInfo } from '../shared/renderables';
import { parse } from './parse-js';

type Fmt = { loc: number; info: RenderInfo };
type Usage = { decl: number; usage?: number };
type ParseError = { loc: number; msg: string };
type Autocomplete = {
    kind: string;
    options: string[];
};

type Ctx = {
    cursor?: { loc: number; autocomplete?: Autocomplete };
    exports: { loc: number; kind: string }[];
};

export type Evaluator<Top, Expr> = {
    parse(node: RecNode): {
        top: Top;
        fmt: Fmt[];
        usages: Usage[];
        errors: ParseError[];
        exports: { loc: number; kind: string }[];
        // is that right? orrrrr likeeeeee do weeeee want ...
        // to do something really fancy.
        extraGlobalUsages: string[];
    };
    asExpr(top: Top): Expr | null;
};
