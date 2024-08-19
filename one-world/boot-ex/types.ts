import { Layout } from '../shared/IR/intermediate';
import { RecNode, RecNodeT, Style } from '../shared/nodes';

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
    result: Top;
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
    exports?: { loc: number; kind: string }[];
};

export type Evaluator<Top> = {
    kwds: Auto[];
    parse(node: RecNode, cursor?: number): ParseResult<Top>;
};
