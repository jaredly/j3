import { Layout } from '../shared/IR/intermediate';
import { Loc, RecNode, RecNodeT, Style } from '../shared/nodes';

export type Auto = {
    text: string;
    toplevel?: boolean;
    // TODO: Better than string. maybe cst or something
    docs?: string;
    // Sooo I kinda want there to be able to be multiple templates to choose from?
    // idk like (fn x) and (fn [a] x) right?
    // idk if it's too niche.
    // like macros can totally admit muiltiple forms.
    // ok I'll do it now.
    templates: { template: RecNodeT<boolean>[]; docs?: string }[];
};

// For internal references, not global ones.
export type Usage = {
    uses: number[];
    source: number;
    kind: string;
};

export type ParseResult<Top> = {
    top: Top | null;
    // ok so like, could be macro right?
    // or could be a ... toplevel kwd
    // or could be a type, or something.
    // also could be a resource. so like.
    // toplevel = value + kwd + macro
    // value = ref(value) + macro(value)
    // type = ref(type) + macro(type)
    // defmacro, deftypemacro
    autocomplete?: { kinds: string[]; local: any[] };
    errors?: any[];
    layouts?: Record<number, Layout>;
    styles?: Record<number, Style>;
    usages?: Usage[];
    exports?: { loc: Loc; kind: string }[];
};

export type Evaluator<AST, TINFO, IR> = {
    kwds: Auto[];
    parse(node: RecNode, cursor?: number): ParseResult<AST>;
    infer(top: AST, infos: Record<string, TINFO>): TINFO;
    compile(top: AST, info: TINFO): IR;
    print(
        ir: IR,
        irs: Record<string, IR>,
    ): { code: string; sourceMap: { loc: Loc; start: number; end: number }[] };
    // trace
    // anddd coverage tracking
    evaluate(ir: IR, irs: Record<string, IR>): any;
};

/**
        CST
         |
         v
      [parse]
         |
         v
        AST / format / layout / accessories
         |\________
INFOS    v         \
   \->[type-check]  \
         |           |
         v          /
        INFO    __ /
         |    /
         v   v
      [compile]
         |
         v
  IRS   IR
    \  /
     \/
   [print]

*/
