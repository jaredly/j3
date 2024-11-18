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

// Used to track "the place some code was copied from", to aid in
// more intelligent merges
type Src = { top: string; loc: number; moved: boolean };

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

// ccls = "char class" i.e. what kind of punctuation. 0 = normal text
export type Id<Loc> = { type: 'id'; text: string; ref?: IdRef; loc: Loc; ccls?: number; src?: Src };

export type Link = { type: 'www'; href: string } | { type: 'term'; id: string; hash?: string } | { type: 'doc'; id: string; hash?: string };

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

export const isRich = (kind: ListKind<any>) => typeof kind !== 'string' && kind.type !== 'tag';

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

export type Text<Loc> = { type: 'text'; spans: TextSpan<Loc>[]; loc: Loc; src?: Src };
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
    src?: Src;
};
export type TableKind = 'round' | 'square' | 'curly';
export type Collection<Loc> =
    | List<Loc>
    | {
          type: 'table';
          kind: TableKind;
          rows: number[][];
          loc: Loc;
          src?: Src;
      };

export type NodeT<Loc> = Id<Loc> | Text<Loc> | Collection<Loc>;
export type Node = NodeT<number>;

export type RecList<Loc> = {
    type: 'list';
    kind: ListKind<RecNodeT<Loc>>;
    // Whether the user has specified that it should be multiline.
    // If absent, multiline is calculated based on pretty-printing logic
    forceMultiline?: boolean;
    // For JSX, this will be a /table/, and 'kind' will be {type: 'tag'}
    attributes?: RecNodeT<Loc>;
    children: RecNodeT<Loc>[];
    loc: Loc;
    src?: Src;
};

export type RecText<Loc> = {
    type: 'text';
    spans: TextSpan<RecNodeT<Loc>>[];
    loc: Loc;
    src?: Src;
};
export type RecCollection<Loc> =
    | RecList<Loc>
    | {
          type: 'table';
          kind: TableKind;
          rows: RecNodeT<Loc>[][];
          loc: Loc;
          src?: Src;
      };

export type RecNodeT<Loc> = Id<Loc> | RecText<Loc> | RecCollection<Loc>;
export type RecNode = RecNodeT<{ id: string; idx: number }[]>;
export type Nodes = Record<number, Node>;

const refsEqual = (one: IdRef, two: IdRef): boolean => {
    switch (one.type) {
        case 'builtin':
            return two.type === 'builtin' && two.kind === one.kind;
        case 'keyword':
            return two.type === 'keyword';
        case 'placeholder':
            return two.type === 'placeholder' && two.text === one.text;
        case 'resource':
            return two.type === 'resource' && two.id === one.id && two.hash === one.hash;
        case 'toplevel':
            return two.type === 'toplevel' && two.kind === one.kind && two.lock?.hash === one.lock?.hash && two.lock?.manual === one.lock?.manual;
    }
};

export const equal = <One, Two>(one: RecNodeT<One>, two: RecNodeT<Two>, loc: (one: One, two: Two) => boolean): boolean => {
    if (one.type === 'id') {
        if (two.type !== 'id') return false;
        if (one.ref) {
            if (!two.ref) return false;
            if (!refsEqual(one.ref, two.ref)) return false;
        }
        return one.text === two.text && loc(one.loc, two.loc);
    }
    if (one.type === 'list') {
        if (two.type !== 'list') return false;
        return (
            one.kind === two.kind &&
            one.attributes === two.attributes &&
            one.forceMultiline === two.forceMultiline &&
            one.children.length === two.children.length &&
            one.children.every((one, i) => equal(one, two.children[i], loc))
        );
    }
    if (one.type === 'text') {
        // STOPSHIP
        return false;
    }
    return (
        two.type === 'table' &&
        one.kind === two.kind &&
        one.rows.length === two.rows.length &&
        one.rows.every((row, r) => row.length === two.rows[r].length && row.every((cell, c) => equal(cell, two.rows[r][c], loc)))
    );
};

export const childNodes = <Loc>(node: RecNodeT<Loc>): RecNodeT<Loc>[] => {
    switch (node.type) {
        case 'id':
            return [];
        case 'list':
            let children: RecNodeT<Loc>[] = [];
            if (typeof node.kind !== 'string' && node.kind.type === 'tag') {
                children.push(node.kind.node);
            }
            if (node.attributes) {
                children.push(node.attributes);
            }
            return children.length ? [...children, ...node.children] : node.children;
        case 'table':
            return node.rows.flat();
        case 'text':
            return node.spans.map((s) => (s.type === 'embed' ? s.item : undefined)).filter((x) => x != null) as RecNodeT<Loc>[];
    }
};

export const childLocs = (node: Node): number[] => {
    switch (node.type) {
        case 'id':
            return [];
        case 'list':
            let children: number[] = [];
            if (typeof node.kind !== 'string' && node.kind.type === 'tag') {
                children.push(node.kind.node);
            }
            if (node.attributes) {
                children.push(node.attributes);
            }
            return children.length ? [...children, ...node.children] : node.children;
        case 'table':
            return node.rows.flat();
        case 'text':
            return node.spans.map((s) => (s.type === 'embed' ? s.item : undefined)).filter((x) => x != null) as number[];
    }
};

export const fromMap = <Loc>(id: number, nodes: Nodes, toLoc: (l: number) => Loc): RecNodeT<Loc> => {
    const node = nodes[id];
    const loc = toLoc(node.loc);
    switch (node.type) {
        case 'id':
            return { ...node, loc };
        case 'text':
            return {
                ...node,
                loc,
                spans: node.spans.map((span) => (span.type === 'embed' ? { ...span, item: fromMap(span.item, nodes, toLoc) } : span)),
            };
        case 'list':
            return {
                ...node,
                loc,
                attributes: node.attributes != null ? fromMap(node.attributes, nodes, toLoc) : undefined,
                kind:
                    typeof node.kind !== 'string' && node.kind.type === 'tag'
                        ? {
                              ...node.kind,
                              node: fromMap(node.kind.node, nodes, toLoc),
                          }
                        : node.kind,
                children: node.children.map((id) => fromMap(id, nodes, toLoc)),
            };
        case 'table':
            return {
                ...node,
                loc,
                rows: node.rows.map((row) => row.map((id) => fromMap(id, nodes, toLoc))),
            };
    }
};

export const fromRec = <Loc>(
    node: RecNodeT<Loc>,
    map: Nodes,
    get: (l: Loc, node: RecNodeT<Loc>, path: number[]) => number,
    path: number[] = [],
): number => {
    const loc = get(node.loc, node, path);
    const inner = path.concat([loc]);
    switch (node.type) {
        case 'id':
            map[loc] = { ...node, loc };
            return loc;
        case 'text':
            map[loc] = {
                ...node,
                loc,
                spans: node.spans.map((span) => (span.type === 'embed' ? { ...span, item: fromRec(span.item, map, get, inner) } : span)),
            };
            return loc;
        case 'list':
            map[loc] = {
                ...node,
                loc,
                attributes: node.attributes != null ? fromRec(node.attributes, map, get, inner) : undefined,
                kind:
                    typeof node.kind !== 'string' && node.kind.type === 'tag'
                        ? {
                              ...node.kind,
                              node: fromRec(node.kind.node, map, get, inner),
                          }
                        : node.kind,
                children: node.children.map((id) => fromRec(id, map, get, inner)),
            };
            return loc;
        case 'table':
            map[loc] = {
                ...node,
                loc,
                rows: node.rows.map((row) => row.map((id) => fromRec(id, map, get, inner))),
            };
            return loc;
    }
};
