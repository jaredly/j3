# Based on `mini`

- [source](http://cristal.inria.fr/attapl/)
- [docs](https://yrg.gitlab.io/homepage/static/public/mini/)
- [paper](https://pauillac.inria.fr/~fpottier/publis/emlti-final.pdf)
- [another paper idk](https://www.cs.tufts.edu/comp/150FP/archive/francois-pottier/hmx.pdf)



- solver
- constraint
- unifier
- miniInfer

# Progress

ok!!!
We have a bunch of things!!!!!
including records
which appear to work just as I would like

oh lol I don't have let I don't think

- [x] fn
- [x] var
- [x] int
- [x] char
- [x] record (create, access)
- [x] let
- [x] if would be nice

and thennnn oh maybe try out their switch logic?
yeah
and then try to make type constructors purely structural

- [ ] see if I can do like literal number types? That would be so cool
- [ ] sooooo the whole ... data constructor thing.
  - it seems like what we do is, we make some
  - wait the paper says I can use rows for variants as well.
    how to try?


# Ideas

Sooo I'd kinda like
{x 1 y 2} and {x 10 z 3} to ~unify to {x int}
ya know?
ergh that might involve doing illegal things.
like, I dunno how that would shake out with the unification algebra.
I could probably make a `intersection` constraint that makes some vbl be
the intersection of two other types.
butttt
I dunno if it would have the same, like, associativity properties or whatever.
