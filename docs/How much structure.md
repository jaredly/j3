
See also Syntaxes.md

Hrm

- What kinds of invalid syntax are allowed?
  - binary editor: literally anything
  - text editor: can't generally produce malformed utf-8
  - mid-structure: can't have unbalanced delimiters (parens, quotes)
- What aren't you allowed to /select/ & arbitrarily manipulate
  - binary editor: nothing
  - text editor: sub-bits of a byte, or sub-bytes of a multi-byte UTF-8 character (though you can in VSCode select sub-characters of a multi-char grapheme)
  - mid-structure: whitespace, can't touch it
    - collection delimiters can be selected, but can only be /removed/ or /changed to a different kind/
  - full-ast: like probably a lot of things
- What is viewed as /interchangeable/
  - binary editor: anything
  - text editor: any utf-8 character or sequence of characters
  - mid-structure: [toplevels] [nodes]
  - full-ast: only things that are the same AST Node type probably
- What things are [easy to do] [hard to do]

in a text editor, it is /just as easy/ to select half of two adjacent words
and edit them as it is to select two whole words.
Q: How often do you want to do that?

In fact, in MS Word it's actually hard to select half a word these days -- they'll auto-select the whole word. TBF I actually find that annoying, and I don't think they're providing me with enough value to make up for that weirdness, and it [feels like something I should be able to do]. Like, they're violating my expectations of what is possible.



what if I did, like, a famous algorithm (merge sort idk) in a bunch of different languages,
and detailed out what the CST would be? to see if I can represent everything I want to.



ALSO: what about like math notation, or music notation? is that something I could support?
how about like SVGs?
Or mermaid flow diagrams? control flow. graphs and such.
whatttabout like ... a stata graph. Vega-lite. wuuuu would that be just too much power? what would that even mean.
direct manipulation y'all.

So I mean ... like ... music notation would only make sense as a programmingy syntax, if we could like
do macros, right? otherwise it's a little boring. like, falling short of potential.

And graphs are the same way. I think? hrmm.


OOORRRRR whatabout:
- flow-based-programming (noflow)
- spreadsheet programming???? YESp l esase
- XState / state machines goodness


what about like the ol' whiteboard view?
and the ginko view?

So, maybe documents can be doing the whiteboard-style? Like a document node
can be toggled into 'whiteboard mode', and then the child document-nodes have x/y coords.
ALSO there can be a thing that's like "show dependencies between toplevels w/ pipes"
and "rearrange things to reflect the DAG of dependencies". That would be rad.







# How much structure is the right amount of structure?

The two questions I think will be useful for considering structure in editors is:
- What is the structure
-


Most code editors treat code as a sequence of UTF-8 encoded characters, and the manipulation of code centralizes around that fundamental paradigm.  One way to think about this is to ask the question "what is /addressable/ in the editor, and what are the features of such an address space?" These editors either use an integer index into the sequence of characters, or a line/column pair (which can be trivially converted back to an index).

Before we explore a more-structured approach, let's consider for a moment what it would look like to have even /less/ structure: a binary editor, which operates on the level of bits.

In a binary editor, you're not constrained to only ever editing whole bytes at a time, neither do you have to restrict yourself to sequences that map to syntactically valid utf-8 characters while you're in the middle of a complex refactor. Such freedom! /s

The answer to "what is addressable" in a binary editor is: any bit!

Now there's an obvious counter to this framing, which is: we're using (for the most part) physical keyboards which excel at operating at the level of unicode characters, and reducing the input space to bits of 1 and 0 is an obvious step backward.

## Too much structure

Ok now that we've had our fun, let's take a look at what I believe is "too much structure": the Abstract Syntax Tree.

Why is it too much structure? imo, because too much on the screen is not selectable.
`let x = 10`, the `let` isn't addressable.

## Just Right (goldilocks lol)

What aren't you allowed to arbitrarily manipulate?
- spaces (can't even select them)
- collection delimiters (you can select, but only to remove or change into a different kind of collection)

Hhmmmmmm ok what if the paradigm is: "what things are seen as /interchangeable/ by the editor"?
What things are you allowed to swap?
How many /kinds of things/ are there to edit? (that require different "modes of editing")
And alsooooo like the addressability question I think is interesting.



