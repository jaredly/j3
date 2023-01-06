
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
- [ ] '(' should make a list, '[' array, '{' record
- [x] backspace should deleteeeee
- [ ] backspace should joiiiin
- [x] invalid syntax should be allowwwwwed (made a new kind of node, a "badsyntax" or sth)
