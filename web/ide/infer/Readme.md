# Trying out Inference Algorithms

What do I want in a type system?

- total inference
- polymorphic records & variants that support recursion
- type classes
- algebraic effects that use polymorphic variants as the base representation

# Different algorithms

How to compare them?

- what is the shape of `Type`
- what is the signature of `infer` (e.g. what does it return, what are you building up, and what is Ctx)
- if `infer` doesn't return a `Type`, how do you turn what it gives you into one?
- at what level does reconciliation happen?
  - is it just-in-time, or only at the end?

## What is the shape of `Type`

Now things can get a little fuzzy here, because some implementations go really
hard on representing absolutely everything as function application, including
like function definition as `((-> argType) bodyType)` instead of, for example,
having a "lambda type". This is surprisingly functional for like a lot of
things, and makes the "traversal" functions etc. very simple, and only gets
a little annoying in a couple of places, like pretty-printing. And if you have
special unification logic for a certain type of thing that you've encoded as
a bunch of `app`s.
