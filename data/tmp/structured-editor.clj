(** ## A bit about this editor environment **)

(** This tutorial takes place in a structured editor, which has some important differences from a standard text editor. In contrast to other structured editors, which tend to operate on the Abstract Syntax Tree of the target language, this editor works on what I call the "Concrete Syntax Tree"; essentially lisp s-expressions. In my opinion, this strikes a nice balance between the benefits you get from moving beyond "a jumble of ascii characters in a file" while still keeping the representation simple enough that it doesn't get in the way of the editing experience.
    Some things of note:
    - it's impossible to have "unbalanced parenthesis" or a "missing close-quote"
    - code formatting is automatic (a la prettier)
    - AST locations are much more precise than "line & column"; adding code before or after a given identifier doesn't cause the editor to "lose track of it"; e.g. errors & hover information is preserved, etc.
    - we can attach meta-data to individual AST nodes; for example marking a node that we would like to be "traced" during the next execution.
    - rendering gets more interesting! This rich text block you're reading is technically a comment (as far as the compiler is concerned). Later on you'll see the "fixture test render plugin", which takes a toplevel expression of a certain form and renders a nice table of inputs & outputs, highlighting any tests that are failing.
    - navigation has lots of nice affordances; e.g. typing ) will take you to the end of whatever s-expression your cursor is inside of.
    - crucially, I've put a lot of effort into making the typing experience as un-surprising as possible. If you're looking at some code, typing in each of the characters of the plain-text representation in order results in that code getting reproduced. (If you're tried any other structured editors before, you'll know that this is rarely the case!)
    Let's familiarize ourselves with the kinds of syntax we'll be working with; the "Concrete Syntax Tree". The "evaluator" for this section is set to REPR, which simply outputs the JSON representation of the CST for a given toplevel term. **)

(hello "world" 12)

