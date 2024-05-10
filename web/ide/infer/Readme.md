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

# Different Algorithms

HM-J
HM-W

both can be expanded to handle row types, right? do we even need to add the 'kind'?
but they can't do TypeClasses/abilities or more general subtyping.

hmm might be interesting to try to strip down
algw-cr

anyway, I sure would like to be able to ..spread without caring whether I'm adding or overriding.
.. but is that quite necessary? idk. maybe it's fine to have to specify.
I feel like my default would be to overwrite.
orr I could cue off of the position. {a b ..c} is extension, {..c a b} is overwrite? maybe a little gimmicky. but maybe it's fine actually.

ANYWAY can I also get HM to deal with recursive types without doing too much malarky?

OH ALSO lets make sure we can get array types, and probably map types, working before we
get too far. Also pattern matching lets.

I feel like what I'm building up to is a "Let's build a type inference"
where I start with very bare HM (prolly W, not J)
and then I add in
- arrays
- recursion
- pattern
- row types
- recursive row types
- ooh can we do row types with default values? plsssss
- alg effects maybeee
- can I get default values in type args? mayubeeee maybe not if we're currying all the way tbh
- but then let's talk about my little dependent types, array lengths and such.
  - are we also inferring the need for recursion, partial fns, and a heap?
  - could be fun

I'd want to talk about the remarkable simplicity if boiling everything down to fn application.

# OK BUT ALSO

cannn we get the inference algorithm to be self-hosting? that would be rad.
(requires recursive row types at minimum)


#
