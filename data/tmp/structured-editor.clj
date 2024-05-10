(** ## A bit about this editor environment **)

(** This tutorial takes place in a structured editor, which has some important differences from a standard text editor. The "structured" part refers to the fact that the editor's "source of truth" representation of your source code is not a long sequence of utf-8 characters, but rather "structured data". For many structured editors, the structure of the data is the Abstract Syntax Tree (AST) of the given programming language. Typical programming languages have node types for expressions (variables, numbers, strings, function application, lambdas, array & object literals, infix boolean and prefix unary operators), statements (control structures such as if, for, and while, function and class declaration), and, types (type variables, type application).
    This has the downside of being quite complicated; both on the implementation side (ensuring that rendering, formatting, and editing each node type works as intended is a huge job) but more importantly: there's a lot of mental overhead for the user, because key strokes might do different things depending on what kind of Node your cursor is in, so you have to be aware of what kind of node (out of dozens of types) you are currently editing.
    In an attempt to avoid these downsides, this editor works on what I call the "Concrete Syntax Tree"; essentially lisp s-expressions (identifiers, strings, lists, and arrays). In my opinion, this strikes a nice balance between the benefits you get from moving beyond "a jumble of text characters in a file" while still keeping the representation simple enough that it doesn't get in the way of the editing experience.
    Some notable features of this structured editor:
    - it's impossible to have "unbalanced parenthesis" or a "missing close-quote". Deleting a close-paren deletes the whole group.
    - code formatting is automatic (a la prettier)
    - AST locations are much more precise than "line & column". Adding code before or after a given identifier doesn't cause the editor to "lose track of it"; e.g. error underlines & hover information are trivially preserved.
    - we can attach meta-data to individual AST nodes; for example marking a node that we would like to be "traced" during the next execution.
    - rendering gets more interesting! This rich text block you're reading is technically a comment (as far as the compiler is concerned). Later on you'll see the "fixture test render plugin", which takes a toplevel expression of a certain form and renders a nice table of inputs & outputs, highlighting any tests that are failing.
    - navigation has lots of nice affordances; e.g. typing ) will take you to the end of whatever s-expression your cursor is currently inside of.
    - crucially, I've put a lot of effort into making the typing experience as un-surprising as possible. If you're looking at some code, typing in each of the characters of the plain-text representation in order results in that code getting reproduced in the CST. (If you're tried any other structured editors before, you'll know that this is rarely the case!)
    Let's familiarize ourselves with the kinds of syntax we'll be working with: the "Concrete Syntax Tree". The "evaluator" for this page is set to REPR, which simply outputs the JSON representation of the CST for a given toplevel term.
    Here's the TypeScript type of a CST node (abbreviated to include only the variants that our parser will be concerned with). **)

(** type Node =
| {type: 'identifier', text: string, loc: number} // abc, 123, a-b%c@, >=, >>=
| {type: 'list', values: Node[], loc: number}
| {type: 'array', values: Node[], loc: number}
| {type: 'string', first: {type: 'stringText', text: string, loc: number},
    templates: {expr: Node, suffix: {type: 'stringText', text: string, loc: number}},
    loc: number}
// I've made the probably-controversial decision of using only a two-dot ellipsis for
// spreads. This allows for a more fluid editing experience in my opinion (otherwise,
// two dots would just be invalid syntax, and who wants that). The single dot is
// reserved for bare-attribute syntax, once our language supports records of some sort.
| {type: 'spread', contents: Node, loc: number}

// this here is a "raw code" type node, which is, sadly, just a big ol' text string,
// no structured editor goodness here. Fortunately we'll move off of them quickly
// as we get into self-hosting land. **)

(** And here's some code! Feel free to play around with it; everything on this page is editable. **)

(hello "world ${abc}!" 12 [..b])