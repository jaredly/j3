// Imagining
// extending the nodes definition to allow
// for a js-like syntax.
//
// naturally, it would also necessitate
// rather different keyboard shortcuts.
//

/*

ok hot stuff, what would it take to also handle JSX?
andddd like sql? and ok I've already got rich-text here.
can I ... make it pluggable?

I'm alright taking some liberties
like requiring that binops be whitespace-separated

Something I haven't accounted for yet:
a "tagged-collection", which has:
- a name (btw I'm maybe going to let this be an arbitrary node)
- attributes [|x = y, a = b|]
- children(?)

anddd that would get me jsx, right?
it would be rescript-style, to be clear; so
strings would have to be quoted. but honestly I'm find with that.

Soooo one downside to smooshing all binops and flow control into the same
'level' of hierarchy is you cant navigate the hierarchy as nicely, like
2 + 3 * 4 - 5
if you're on 3 and you shift+up, you would want it to select "3 * 4" but
it would select the whole thing.
I could imagine a `parser` API that can report back about sub-structure
within a juxtaposition. solid.

ok but waitasecond.
I should take a look at ReST and see how much of that I can squeeze into
my rich-text nodes.


*/

export type Style = {
    fontWeight?: number | string;
    fontFamily?: string;
    fontStyle?: string;
    textDecoration?: string;
    background?: { r: number; g: number; b: number } | false;
    border?: string;
    outline?: string;
    color?: { r: number; g: number; b: number } | false;
};

// type Text = {
//     type: 'text';
//     first: string;
//     templates: { expr: Node; suffix: string }[];
// };

export type IdRef =
    | {
          type: 'toplevel';
          loc: { id: string; idx: number };
          kind: string;
          lock?: { hash: string; manual: boolean };
      }
    // Soo this will have a look-uppable name too
    | { type: 'resource'; id: string; kind: string; hash?: string }
    | { type: 'builtin'; kind: string }
    | { type: 'keyword' }
    | { type: 'placeholder'; text: string };

export type Id<Loc> = { type: 'id'; text: string; ref?: IdRef; loc: Loc };

export type Link =
    | { type: 'www'; href: string }
    | { type: 'term'; id: string; hash?: string }
    | { type: 'doc'; id: string; hash?: string };

export type TextSpan<Embed> =
    | { type: 'text'; text: string; link?: Link; style?: Style }
    // Jump back to a normal node I guess
    | { type: 'embed'; item: Embed }
    // I kinda forget what this was about? Maybe like letting you supply rich-text plugins or something
    | { type: 'custom'; id: string; data: any }
    // How are these different from `embed`? Well these actually yoink the source
    // of the referenced term and plop it in there.
    // Embed would either be a ref to it, or duplicate the code
    | { type: 'include'; id: string; hash: string }
    | {
          type: 'diff';
          before: { id: string; hash: string };
          after: { id: string; hash: string };
      };

export type RichKind =
    | { type: 'plain' }
    | { type: 'section' } // collapsible, and first item is treated as a header
    | { type: 'list'; ordered: boolean }
    | { type: 'checks'; checked: Record<number, boolean> }
    | { type: 'opts'; which?: number }
    | { type: 'indent'; quote: boolean }
    | { type: 'callout'; vibe: 'info' | 'warning' | 'error' };

export type ListKind<Tag> =
    | 'round'
    | 'square'
    | 'angle'
    | 'curly'
    // these are for items juxtaposed without spaces in between
    | 'smooshed'
    // these are for binops and such. not used for lisp-mode
    | 'spaced'
    | { type: 'tag'; node: Tag }
    | RichKind;

export type Text<Loc> = { type: 'text'; spans: TextSpan<number>[]; loc: Loc };
export type List<Loc> = {
    type: 'list';
    kind: ListKind<number>;
    // Whether the user has specified that it should be multiline.
    // If absent, multiline is calculated based on pretty-printing logic
    forceMultiline?: boolean;
    // For JSX, this will be a /table/, and 'kind' will be {type: 'tag'}
    attributes?: number;
    children: number[];
    loc: Loc;
};
export type Collection<Loc> =
    | List<Loc>
    | {
          type: 'table';
          kind: 'round' | 'square' | 'curly';
          rows: number[][];
          loc: Loc;
      };

export type NodeT<Loc> = Id<Loc> | Text<Loc> | Collection<Loc>;
export type Node = NodeT<number>;

export type RecText<Loc> = {
    type: 'text';
    spans: TextSpan<RecNodeT<Loc>>[];
    loc: Loc;
};
export type RecCollection<Loc> =
    | {
          type: 'list';
          kind: ListKind<RecNodeT<Loc>>;
          // Whether the user has specified that it should be multiline.
          // If absent, multiline is calculated based on pretty-printing logic
          forceMultiline?: boolean;
          // For JSX, this will be a /table/, and 'kind' will be {type: 'tag'}
          attributes?: RecNodeT<Loc>;
          children: RecNodeT<Loc>[];
          loc: Loc;
      }
    | {
          type: 'table';
          kind: 'round' | 'square' | 'curly';
          rows: RecNodeT<Loc>[][];
      };

export type RecNodeT<Loc> = Id<Loc> | RecText<Loc> | RecCollection<Loc>;
export type RecNode = RecNodeT<{ id: number; idx: number }[]>;

export type Nodes = Record<number, Node>;
