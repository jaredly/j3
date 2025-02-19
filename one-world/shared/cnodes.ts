// Imagining
// extending the nodes definition to allow
// for a js-like syntax.
//
// naturally, it would also necessitate
// rather different keyboard shortcuts.
//

import { isTag } from '../keyboard/handleNav';
import { Update } from '../keyboard/utils';

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

export type NodeID = string;

export type Style = {
    format?: 'code';
    fontWeight?: number | string;
    fontFamily?: string;
    fontStyle?: string;
    textDecoration?: string;
    background?: RGB;
    border?: string;
    outline?: string;
    color?: RGB;
};
export type RGB = { r: number; g: number; b: number };

export const rgbEqual = (one?: RGB, two?: RGB) => (!one || !two ? one === two : one.r === two.r && one.g === two.g && one.b === two.b);

export const stylesEqual = (one?: Style, two?: Style) => {
    if (!one || !two) return (!one || Object.keys(one).length === 0) && (!two || Object.keys(two).length === 0);
    for (let key of ['fontWeight', 'fontFamily', 'fontStyle', 'textDecoration', 'border', 'outline', 'format'] as const) {
        if (one[key] !== two[key]) return false;
    }
    if (!rgbEqual(one.background, two.background)) return false;
    return rgbEqual(one.color, two.color);
};

// type Text = {
//     type: 'text';
//     first: string;
//     templates: { expr: Node; suffix: string }[];
// };

// Used to track "the place some code was copied from", to aid in
// more intelligent merges
type Src = { top: string; loc: NodeID; moved: boolean };

export type Loc = { id: string; idx: NodeID }[];

export type IdRef =
    | {
          type: 'toplevel';
          loc: { id: string; idx: NodeID };
          kind: string;
          lock?: { hash: string; manual: boolean };
      }
    // Soo this will have a look-uppable name too
    | { type: 'resource'; id: string; kind: string; hash?: string }
    | { type: 'builtin'; kind: string }
    | { type: 'keyword' };

// ccls = "char class" i.e. what kind of punctuation. 0 = normal text
export type Id<Loc> = { type: 'id'; text: string; ref?: IdRef; loc: Loc; ccls?: number; src?: Src };

export type Link = { type: 'www'; href: string } | { type: 'term'; id: string; hash?: string } | { type: 'doc'; id: string; hash?: string };

export const linksEqual = (one?: Link, two?: Link) => {
    if (!one || !two) return one === two;
    if (one.type === 'www' && two.type === 'www') return one.href === two.href;
    if (one.type === 'term' && two.type === 'term') return one.id === two.id && one.hash === two.hash;
    if (one.type === 'doc' && two.type === 'doc') return one.id === two.id && one.hash === two.hash;
    return false;
};

export type TextSpan<Embed, Loc = string> =
    | { type: 'text'; text: string; link?: Link; style?: Style; loc: Loc }
    // Jump back to a normal node I guess
    | { type: 'embed'; item: Embed; link?: Link; style?: Style; loc: Loc }
    | { type: 'attachment'; attachment: string; display: 'name' | 'small' | 'large'; loc: Loc }
    // I kinda forget what this was about? Maybe like letting you supply rich-text plugins or something
    | { type: 'custom'; plugin: string; data: any; loc: Loc }
    // How are these different from `embed`? Well these actually yoink the source
    // of the referenced term and plop it in there.
    // Embed would either be a ref to it, or duplicate the code
    | { type: 'include'; id: string; hash: string; loc: Loc }
    | { type: 'diff'; before: { id: string; hash: string }; after: { id: string; hash: string }; loc: Loc };

export type RichKind =
    | { type: 'plain' }
    | { type: 'section'; level?: number } // collapsible, and first item is treated as a header
    | { type: 'list'; ordered: boolean }
    | { type: 'checks'; checked: Record<NodeID, boolean> }
    | { type: 'opts'; which?: NodeID }
    | { type: 'indent'; quote: boolean }
    | { type: 'callout'; vibe: 'info' | 'warning' | 'error' };

export const isRich = (kind: ListKind<any> | TableKind) => typeof kind !== 'string' && kind.type !== 'tag';
export const hasControls = (kind: ListKind<any>) => typeof kind !== 'string' && (kind.type === 'opts' || kind.type === 'checks');

export type ListKind<Tag> =
    | 'round'
    | 'square'
    | 'angle'
    | 'curly'
    // these are for items juxtaposed without spaces in between
    | 'smooshed'
    // these are for binops and such. not used for lisp-mode
    | 'spaced'
    | { type: 'tag'; node: Tag; attributes?: Tag }
    | RichKind;

export type Text<Loc> = { type: 'text'; spans: TextSpan<Loc>[]; loc: Loc; src?: Src };
export type List<Loc> = {
    type: 'list';
    kind: ListKind<NodeID>;
    // Whether the user has specified that it should be multiline.
    // If absent, multiline is calculated based on pretty-printing logic
    forceMultiline?: boolean;
    children: NodeID[];
    loc: Loc;
    src?: Src;
};
export type TableKind = 'round' | 'square' | 'curly' | { type: 'rich'; colWidths?: Record<number, number> };
export type Collection<Loc> = List<Loc> | Table<Loc>;
export type Table<Loc> = {
    type: 'table';
    kind: TableKind;
    forceMultiline?: boolean;
    rows: NodeID[][];
    loc: Loc;
    src?: Src;
};

export type NodeT<Loc> = Id<Loc> | Text<Loc> | Collection<Loc>;
export type Node = NodeT<NodeID>;

export type RecList<Loc> = {
    type: 'list';
    kind: ListKind<RecNodeT<Loc>>;
    // Whether the user has specified that it should be multiline.
    // If absent, multiline is calculated based on pretty-printing logic
    forceMultiline?: boolean;
    children: RecNodeT<Loc>[];
    loc: Loc;
    src?: Src;
};

export type RecText<Loc> = {
    type: 'text';
    spans: TextSpan<RecNodeT<Loc>, Loc>[];
    loc: Loc;
    src?: Src;
};

export type RecCollection<Loc> =
    | RecList<Loc>
    | {
          type: 'table';
          kind: TableKind;
          rows: RecNodeT<Loc>[][];
          forceMultiline?: boolean;
          loc: Loc;
          src?: Src;
      };

export type RecNodeT<Loc> = Id<Loc> | RecText<Loc> | RecCollection<Loc>;
export type RecNode = RecNodeT<Loc>;
export type Nodes = Record<NodeID, Node>;

const refsEqual = (one: IdRef, two: IdRef): boolean => {
    switch (one.type) {
        case 'builtin':
            return two.type === 'builtin' && two.kind === one.kind;
        case 'keyword':
            return two.type === 'keyword';
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
            if (isTag(node.kind)) {
                children.push(node.kind.node);
                if (node.kind.attributes) {
                    children.push(node.kind.attributes);
                }
            }
            return children.length ? [...children, ...node.children] : node.children;
        case 'table':
            return node.rows.flat();
        case 'text':
            return node.spans.map((s) => (s.type === 'embed' ? s.item : undefined)).filter((x) => x != null) as RecNodeT<Loc>[];
    }
};

export const childLocs = (node: Node): NodeID[] => {
    switch (node.type) {
        case 'id':
            return [];
        case 'list':
            let children: NodeID[] = [];
            if (isTag(node.kind)) {
                children.push(node.kind.node);
                if (node.kind.attributes) {
                    children.push(node.kind.attributes);
                }
            }
            return children.length ? [...children, ...node.children] : node.children;
        case 'table':
            return node.rows.flat();
        case 'text':
            return node.spans.map((s) => (s.type === 'embed' ? s.item : undefined)).filter((x) => x != null) as NodeID[];
    }
};

export const fromMap = <Loc>(id: NodeID, nodes: Nodes, toLoc: (l: NodeID) => Loc): RecNodeT<Loc> => {
    const node = nodes[id];
    if (!node) {
        throw new Error(`id ${id} not found in nodes map`);
    }
    const loc = toLoc(node.loc);
    switch (node.type) {
        case 'id':
            return { ...node, loc };
        case 'text':
            return {
                ...node,
                loc,
                spans: node.spans.map((span) =>
                    span.type === 'embed'
                        ? { ...span, item: fromMap(span.item, nodes, toLoc), loc: toLoc(span.loc) }
                        : { ...span, loc: toLoc(span.loc) },
                ),
            };
        case 'list':
            return {
                ...node,
                loc,
                kind:
                    typeof node.kind !== 'string' && node.kind.type === 'tag'
                        ? {
                              ...node.kind,
                              node: fromMap(node.kind.node, nodes, toLoc),
                              attributes: node.kind.attributes != null ? fromMap(node.kind.attributes, nodes, toLoc) : undefined,
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
    map: Nodes | Update['nodes'],
    get: (l: Loc, node: null, path: NodeID[]) => NodeID,
    path: NodeID[] = [],
): NodeID => {
    const loc = get(node.loc, null, path);
    const inner = path.concat([loc]);
    switch (node.type) {
        case 'id':
            map[loc] = { ...node, loc };
            return loc;
        case 'text':
            map[loc] = {
                ...node,
                loc,
                spans: node.spans.map((span) =>
                    span.type === 'embed'
                        ? { ...span, item: fromRec(span.item, map, get, inner), loc: get(span.loc, null, inner) }
                        : { ...span, loc: get(span.loc, null, inner) },
                ),
            };
            return loc;
        case 'list':
            map[loc] = {
                ...node,
                loc,
                kind:
                    typeof node.kind !== 'string' && node.kind.type === 'tag'
                        ? {
                              ...node.kind,
                              node: fromRec(node.kind.node, map, get, inner),
                              attributes: node.kind.attributes != null ? fromRec(node.kind.attributes, map, get, inner) : undefined,
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

export const mapLocs = <From, To>(node: RecNodeT<From>, get: (l: From, path: To[]) => To, path: To[] = []): RecNodeT<To> => {
    const loc = get(node.loc, path);
    const inner = path.concat([loc]);
    switch (node.type) {
        case 'id':
            return { ...node, loc };
        case 'text': {
            const spans = node.spans.map((span) => {
                const loc = get(span.loc, inner);
                if (span.type === 'embed') {
                    return { ...span, item: mapLocs(span.item, get, inner), loc };
                }
                return { ...span, loc };
            });
            return { ...node, loc, spans };
        }
        case 'list':
            return {
                ...node,
                loc,
                kind:
                    typeof node.kind !== 'string' && node.kind.type === 'tag'
                        ? {
                              ...node.kind,
                              node: mapLocs(node.kind.node, get, inner),
                              attributes: node.kind.attributes != null ? mapLocs(node.kind.attributes, get, inner) : undefined,
                          }
                        : node.kind,
                children: node.children.map((id) => mapLocs(id, get, inner)),
            };
        case 'table':
            return {
                ...node,
                loc,
                rows: node.rows.map((row) => row.map((id) => mapLocs(id, get, inner))),
            };
    }
};
