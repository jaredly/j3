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
    layouts: Record<number, Layout>;
    styles: Record<number, Style>;
    usages?: Usage[];

    exports?: { loc: Loc; kind: string }[];
    associations?: {
        // should be something exported from this dealio, but I guess it doesn't have to be
        loc: Loc;
        // the "thing we're associating with"
        target: Loc;
        key: Loc;
    }[];
};

// kind is probably 'value' 'type' 'macro' 'formatter' 'association' 'association:multi'?
// hrm should we have a kind for `evaluator`? hmmmm
// export type Export =
//     | { type: 'simple'; loc: Loc; kind: string }
//     | { type: 'associated'; loc: Loc; target: Loc; key: Loc; kind: string };

export type AnyEvaluator = Evaluator<any, any, any>;

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

/*

Ok, so associated terms
for simplicities sake, we could just
say that if a term is pulled in, then
any associated terms are also pulled in.
we could get fancier by only pulling in the
associations that are possible to reference
given the definitions of the macros in question,
but let's not get fancy for now.

ok ... so....
um the graph
what I'm saying is, that macros are *not allowed*
to produce new dependencies that aren't represented
in either the macro or the inputs to the macro
(or /associated terms/ of the same).

This makes is so that we /do/ have the capacity to
statically generate the dependency graph without
actually evaluating the macros.

ooh ok SO what iffff we allow some associated terms to be
/sets/ not unique, anddd then we could use `defassoc` to
represent type class instances??? would that work?

like technically it would, but we would want a way to
prune the dependencies, otherwise *any* change to an
instance of a typeclass would invalidate all references
to the type class. which is overeager.


        CST    /-----[eval]--(macros cst)
         |   macros
         v  /
     [macroex]
         |
         v

        CST <-> with macro cache substituted in
         |
         v
      [parse]
         |
         v
 [tc]    AST / format / layout / accessories
  |      |\_________
INFOS    v  /-ASTs  \
   \->[type-check]   \
         |           |
         v           /
        INFO    ____/
         |    /
         v   v
      [compile]
         |
         v
  IRS   IR
    \  /__\_
     \/     \
   [print]  [eval]

*/
