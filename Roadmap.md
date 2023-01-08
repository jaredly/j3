
- [x] come up with a syntax that can handle things
- [x] make a tight grammar (text -> CST)
- [x] see if it can handle glsl? hmm yeah I think so
- [x] see if I can speedrun simple parsing and evaluation (CST -> AST -> TS)
	because, lets have something we can play with ya know
	- we'll gloss over type inference for now
	- and also maybe type checking? like idk. can we just ... check types, and see if they check out?
	- [ ] so like I dont have generics yet, and such. but I think it's pretty good.
- [-] thennn we're on to a structured editor! All day. (UI <-> CST)

# Structure Editor

- [x] render basic.clj
- [x] click to select
- [x] basic atom edit
- [x] basic space to next atom add tx
- [ ] space in middle should split ty
- [x] '(' should make a list, '[' array, '{' record
- [x] backspace should deleteeeee
- [ ] backspace should joiiiin
- [x] invalid syntax should be allowwwwwed (made a new kind of node, a "badsyntax" or sth)
- [x] basic left & rightttt

## Ok but let's do prettier.
so updateStore should include a list of paths, so we know who to recalculate.

- [x] figure out a little multiline
- [x] actually compute the whatsits
- [x] try out better hugging
- [x] oh lets get rainbow parens prolly

so good

## More nav and stuff

- [x] left & right outside of a list
  - [x] this means we need the concept of focusing the start / end of a listylisty (and a non-idx IdentifierLike)

- [x] backspace inside/start/end of listlike works!
- [x] backspace from start w/ empty before, deletes it
- [x] typing normal things in a blank creates a new thing

((

SO
gotta do some tests, right?
to verify that things work.
and such.

(@error "text" the-form)

Hmmmm maybe I want the 'unresolved' node to have an optional "caused by". That would be nice.
Then we can highlight the causer too. Which would be cool.

store will need a `highlight` prop? Prolly?

))


### HISTORY

Let's hang on to it.






- [x] re-evaluate, got to
- [x] highlight errors inline, unresolved stuff
	- yeah I really need to come up with some type errors
	- currently I don't really have type checking at all.
- [ ] and like, hover w/ a key pressed to see types of things?
- [ ] figure out comments in things

- [ ] ohhhh I need ast->cst, so I can nail down	hashes
	- I guess I can kick that can a litte, because the most recently defined dealio wins.
	- but once I start multiple dispatch, that'll be a whole thing.


- [x] HOVER for types please
- [ ] WHY aren't patterns working ? prolly because they're very hacked together

CAN I get away with not resolving any types in the first pass? like syms are typeless monsters.
and then we do our check-types pass, ....

now does that also mean that resolution of things is iffy? I guess if we're assuming that the editor locks down
most hashes, we're not actually doing full type-directed resolution.

START HERE ^^^^^


# Getting Full Input, because that would be nice

I want to be able to write an actual program

- [x] so, I'm thinking the grammar shouldn't care about type annotations and decorators and whatnot?
	- yeah, that's a good choice, because it aligns with the way we're treating comments as just another atom.

OH soooo what if there's this thing we're doing.
and it is, that lists can have a prefix?
like `@` or `:`. or even `;` if we really want.

Now, on the other hand, strings? How do we even think about that.
I think, to simplify things, we say that inside *every* template literal is just a list.
and if it's a single-element list, then it's not treated as a list. but otherwise it is.
and an empty list is fine, it's just empty.

# OK I think I can input everything at this point,
it's annoying that I can't do up/down arrows, but not prohibitive.

well, ok so decorators aren't really there yet. or complex type annotations.

but now let's try a little compile.?


## SELECTION

- [x] clicking the deadspace should do something reasonably my goodness
	- [x] inline deadspace fixed!
	- [x] and all of it, i guess it's ok

### Mouse Selection

### Keyboard Selection???