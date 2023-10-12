# Grounded Type Inference from the Ground Up

Lots of type inference tutorials teach you the fundamentals of type inference, but on a much-restricted pseudo-language, leaving a lot of the work of "making this function in a real context" as an exercise to the reader. A rare exception to this is "Typing Haskell in Haskell", which really does give you inference for just about all of Haskell98.

To ground this tutorial, we'll be doing *self-hosted* type inference; that is the inference engine we produce will be sufficient to type-infer all of the code that we write.

Starting things off, we'll build a basic Hindley Milner impl with a couple of additions beyond the traditional "lambda calculus + let"; we'll need unions & tuples to represent the AST, a fairly limited `match` function to do pattern matching, and a handful of builtin functions.

## Papers

- Algorithm M
  - https://dl.acm.org/doi/10.1145/291891.291892

- Type Inference with Constrainted Types
  - the HM(X) paper
  - https://www.cs.tufts.edu/~nr/cs257/archive/martin-odersky/hmx.pdf

- Typing Haskell in Haskell (uses HM(X))
  - https://web.cecs.pdx.edu/~mpj/thih/thih.pdf

- The Essence of ML Type Inference (uses HM(X))
  - (or, Typing OCaml in OCaml)
  - https://www.cs.tufts.edu/comp/150FP/archive/francois-pottier/hmx.pdf
  - http://cristal.inria.fr/attapl/

- Modular Type Inference with Local Assumptions
  - the OutsideIn(X) paper
  - https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/jfp-outsidein.pdf

- Set Theoretic Types for Polymorphic Variants
  - /\, \/, and `not` on constraints
  - https://arxiv.org/pdf/1606.01106.pdf

- A Polymorphic Type System for Extensible Records and Variants
  - uses a "lacks" meta-variable
  - https://web.cecs.pdx.edu/~mpj/pubs/96-3.pdf


## Things to highlight

Talking through the "what's the smallest surface area that can self-host its inference?"
Start with basic lambda calculus
ok but now we need to be able to represent the data structure as an AST
we could do something terrible like use magic numbers in a single massive array
but we're not doing this to punish ourselves.

Do we need generic type constructors?
Yes, in order to have tuples and lists.
You could mayybe do without lists,
but skipping tuples would be maybe impossible? Or at least really hacky.


## Watchlist

- https://www.youtube.com/watch?v=_S3X2QgQoYY
- https://www.youtube.com/watch?v=8OlHJ6KVjgg
- https://www.youtube.com/watch?v=OHMqbSpjhzc
- https://www.youtube.com/watch?v=Sn5X2UkNKVs
- https://www.youtube.com/watch?v=BPNxvRCnOBA
- https://www.youtube.com/watch?v=XaJ905voxGw
- https://danel.ahman.ee/talks/chocola19.pdf
- https://gist.github.com/CodaFi/ca35a0c22fbd96eca505b5df45f2509e
- https://arxiv.org/abs/1910.11629
- https://github.com/andrejbauer/coop
