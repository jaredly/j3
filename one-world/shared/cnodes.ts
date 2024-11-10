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

type Text = {
    type: 'text';
    first: string;
    templates: { expr: Node; suffix: string }[];
};

type IdRef =
    | {
          type: 'toplevel';
          loc: [string, number];
          kind: string;
          lock?: { hash: string; manual: boolean };
      }
    // Soo this will have a look-uppable name too
    | { type: 'resource'; id: string; kind: string; hash?: string }
    | { type: 'builtin'; kind: string }
    | { type: 'keyword' }
    | { type: 'placeholder'; text: string };

type Unit = { type: 'id'; text: string; ref: IdRef } | Text;

type Style = null;

type InlineSpan =
    | { type: 'text'; text: string; link: string; style: Style }
    | { type: 'custom'; id: string; data: any }
    | { type: 'embed'; item: Node };
//  | { type: 'include'; id: string; hash: string }
//  | {
//        type: 'diff';
//        before: { id: string; hash: string };
//        after: { id: string; hash: string };
//    };

type Rich =
    | { type: 'rich-block'; items: Node[] }
    | { type: 'rich-inline'; spans: InlineSpan[] };

type Collection =
    // or vector/matrix? idk
    | {
          type: 'list';
          // angle is maybe a bit dicey, because
          // how do we know you're not doing a greater-than?
          // I guess that's UI logic
          kind: 'round' | 'square' | 'angle' | 'curly' | 'smooshed' | 'spaced';
      }
    | {
          type: 'tagged';
          tag: Node;
          attributes: { name: string; value: Node }[];
          children: Node[];
      }
    | { type: 'table'; kind: 'round' | 'square' | 'curly'; rows: Node[][] };

type Node = Unit | Rich | Collection;

export {};
