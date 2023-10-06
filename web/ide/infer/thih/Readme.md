# Typing Haskell in Haskell

Following the paper

I didn't realize there was a code tarball I could have used, but I think it was better to read through the paper.

- [x] lots of things working
- [x] superclass recognition doesn't seem to be?
  not to mention the ClassEnv data structure is kinda bonkers

# YAY Records!!!

So, here's the thing
the "lacks" approach is working nicely BUT
doesn't allow spreading multiple records
I'm pretty sure.
which like, I might need? In order for my fancy merging of goodnesses to happen?
we'll have to see.

ANYWAY there's this whole "Pred" dealio,
which actually maybe I can take advantage of to...
do more fancy things with the type variables?
Like encode a "noninteresecting" predicate or something.
Also I could encode like my fancy dependent types stuff as predicates?


Fancy things that I want:

- [ ] default values on records
  - unification rules for default values:
    - (missing) + (l w/ default) => (l w/ default)
    - (l) + (l w/ default) => (l) -- drop the default
    - (l w/ default) + (l w/ default') => failure if the defaults differ

- [ ] recursive variants!
  - will they need to be type annotated directly?
