import { RecNode } from '../shared/nodes';
import { RenderInfo } from '../shared/renderables';

type Fmt = { loc: number; info: RenderInfo };
type Usage = { decl: number; usage?: number };
type ParseError = { loc: number; msg: string };
type Autocomplete = {
    kind: string;
    options: string[];
};

// ALTERNATIVE:
// format takes a "parsed form" and returns the list of formats about it.
// which we could also do with the normal one, to be fair

type Ctx = {
    cursor?: { loc: number; autocomplete: [] };
    errors: ParseError[];
    fmt: Fmt[];
    usages: Usage[];
    exports: { loc: number; kind: string }[];
};

const parse = (node: RecNode, ctx: Ctx) => {
    // do the thing
    //
    // parse gives us
    // - the node
    // - any accumilated juices .. .I mean errors
    // - formatting infos
    // - usages (for "rename symbol" and highlight-under-cursor)
    // - exports (locs of identifiers that are "exports", along with a "kind" (e.g. value, type, effect))
    // - autocomplete infos if we have a cursor here
};

// DO I NEED
// to have a "parse expression" form?
// like, idk I probably don't? As in, anywhere I might
// want to parse an expression (cough, plugins)
// I could ... hrm
// ok so the thing I could do is:
// -> have a `asExpr(toplevel) : Option(expr)`
// which, honestly, might not be that bad.
// like, better to only have one entrypoint for the parsing, I think?

// Do I actually need this?
// hmmm maybe? or is it just a crutch?
// idk. Might be good to think on this more.
const fromNode = (a: RecNode) => a;
const toNode = (a: RecNode) => a;

const asExpr = (t: any) => {
    if (t.type === 'texpr') return { type: 'some', 0: t[0] };
    return { type: 'none' };
};

// ------------------ Compiler -------------------
// ok do we need compileExpr?
// kinda seems like we do.
const compileTop = (
    abc: any,
    typeInfo: any,
    trace: { top: boolean; nodes: Record<number, { fmt?: string }> },
): string => {
    return 'lol';
};

// -------------------- Runtime -------------------
// the stuff that when evaled returns a map of things.
// these get plopped onto `$env`.
const builtins = '';

// -------------------- Type Inference ---------------

/*
init(): tenv with builtins
^ NOTE: should ... the init ... include builtins? seems like it.
// or I could have a separate thing that is "builtins". I mean,
// why bother with that. Yeah let's wait on that until/if I need it.
infer-top(toplevel, tenv):
    - tenv
    - (option type)  ; the type to display over this toplevel
    - map[loc, type] ; for displaying type information for globals when autocompleting and such. and inthe naemspce listing
        ^ Q:Q:Q: should the type here already be a `cst`?
        ^ should that CST also include formatting infos?
        ^ one formatting info might be "links to [toplevel/loc]"
    - code gen data
    - inference errors maybe
    - types for locs
add-tenv(old, new): tenv
type-to-cst(type): cst, fmts






*/
