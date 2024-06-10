
# recursive types

- [x] add a `trec name inner l`
- [x] swap it in, if occurs check fails
- [x] basic simpification! very nice
- [ ] handle trow in simplification plsss
- [ ] it would be super nice if I could simplify multiple times. but it might require more bookkeeping? Like "srep" combined with stype? And then if we end up with
  stype at the end, we'd need to ... back it off? ORRR actually I guess I could /subst/ it back in, right? maybe a little weird. but should work? maybe?
    ->> erkkkk ok so ... I broke it, and it's not really quote fixed.
    I want .. to be able to, like "unwrap" the dealio, as I'm coming back.
    - [x] unbreak it a little
    - [ ] ok maybe this can actually work?


# Opaque types!! we'll probably want them in some form.

a. we could have them be a "private type alias"; that is, we
  - delay resolution of type aliases (have them show up as `tcon`)
  - and have some aliases /not/ be introspectable outside of the namespace in which it was defined.
    Seems reasonable, right?
b. we could have them be normal userland types, but with no constructors, and just a `wrap` and `unwrap` no-op function that would be restricted in use to the namespace where it was created.

I'm leaning toward the first, because it requires less magic at compile-time (eliminating the no-op wrappers) and is also less cumbersome at time of writing (wouldn't be able to destructure an arg until you unwrap it)

# IDEA : show usages -> show /polymorphic instantiations/

It would be sooo much less "mentally costly" to abstract types to the umpteenth level if it was trivial to see what, in /practice/ the type variables get instantiated as.
(this could also be cool for functions!) iff there are more than like 5 different instantiations, probably collapse into just showing the number of distinct instantiations.

Alsooo I want the "number of usages" to be shown above everything.
althoughhhh that's the kind of thing that only really gets useful in the "read / maintain" case, less so in the "write" case.
I should think about how to make navigating two different cases make sense.gg

# RECORDA ND ENUMS

- oh my. lovin it.
- match/let/fn will lock down an open enum, which I love.
- noww I just need to lock things down at the toplevel, so if there's a spread in the output that's not in the input, we lock it down.

# OK BUt a simple thing I can do is a "zoom" which doesn't even have to persist at themoment.

trying to do zoom and cards are in the way.

# Next Gen Storage Formatttt

What do we want? the ability to have
- more flexibility with "documents"
  - so I can just include a small part of e.g. the type checker in a document (do an in depth of the exhaustiveness algo, for example)
- not have to duplicate definitions all over the place
- and such

Namespaces ... let's do them!
ok, so this will require some moderate level of monkeying with ... the CST? maybe? no se.
like, if we want to "show the full" vs "show just the tail" of a namespaced name, in like `(defn hello [x] ...)` ...
OR I guess we could have the namespace only be shown like above the thing, and actually be an attribute of the ... `RealizedNamespace`? could work. So, the name would be derived from the toplevel (via `analyze` yay) and the namespace that
its in would be defined on the `RealziedNamespace`.
nice.
This *does* mean that simply moving things around would not change their namespaces. Which, I'm pretty OK with? Like you could use
the namespace organizer on the sidebar to move things around, right?
And documents are for ... (1) sandboxy things, and (2) literate programming documents
**OK**, so a (document) would have (a) a "default namespace" that new (named) things are automatically a part of, and (b) you could have nodes that have a custom namespace specified. which is fine.

Which begs the question: What about non-named things? Like expressions. It kinda seems like they wouldn't be part of a namespace by default, right? No need for them to be. BUT some things (like fixture tests) kindof want to be part of the namespace, right?
ok yeah I kindof like this. So, When viewing some ... code, there would be at the top "documents w/ this namespace as their namespace", and then like a normal listing of everything in it, if that's what you want to see.
Ok so expressions, and as a part of that (rich text) blocks, would not automatically be part of the namespace. They would be ~anonymous toplevels, living in the database and included in a document, but not referrable as part of the tree.

OK LETS TALK resolution and such. BECAUSE, how do I know what I'm referring to, if there are like things to import? Does this mean we have to get serious about locking down references? I do think it does, my dear sir.
UNLESSSS we decide that imports impact a /whole namespace/, as opposed to a /document/. IFF a namespace has imports defined as part of it, then ... things might be OK? welll so what if you're working on a definition but don't have the whole namespace pulled up, and you edit the imports, and it breaks something that you don't have pulled up? That sound rotten in the state of denmark.

ehhhh ok but on the other hand, that means resolutions have to be baked in, amirite? rite? welllll ok not necessarily, because it would also be /cached/... nah if we need to recompile we're back to square 1. What iff we locked things down ... in the RealizedNamespace? naw that's nasty.
Like why am I afraid of just bringing back the `cst/hash` type? Ok yes so it does make some things a little more complicated. andd ok so maybe I think we want to only use it for globals. ALTHOUGH hm yeah ok nvm. WAIT ok so we could ... have our fromNode dealio turn all the cst/hashes into cst/id w/ fully expanded namespace, right? tbh that would totally work. It could even happen at the `fromMCST` stage. tbh I like that.
okkkk so, when ... do I lock it down? um like, it would involve taking autocomplete more seriously.
which is fine tbh. like, if you have a reference that's not locked down, it'll be a problem right? I mean, it won't even compile.
Sooo well ok so if I just had like a `cst/global` type, that might be even better than a `cst/id`, because then the error messages could be even more helpful.

OK SO the /document/ defines the /evaluator/ right? Are we going to mess around with mutiple evaluators for the same document?
I mean we could, like allow you to customize it per-card. Do cards even exist anymore tho? given that namespace parentage is no longer load-bearing. OK so the story is: You could customize it per ... toplevel? eh that sounds a bit too much.
hrmmm maybe it would be ... a plugin? like, the use case is "here's some code, switch the evaluator to see what happens". idk.

ANYway, I'd want some "system level configuration" that allows you to assemble ... umm ... hrm ... ok I was going to say "different things to be your evaulator", but ... actually can't I just have it be a single ... hrm ... like an expression, but should they live in the namespace-age somewhere? I guess I could have a .well-known location in the namespace, like `/evaluators` or something. hrm what if it was like `/.editor/evaluators`, and I might at some point have `/.editor/plugins`? That would be rad.
OK so .editor/evaluators could have a set of ... huh I guess they would have to be /defined/. somewhere. buuut how would we know what evaluator to use to produce that evaluator? would it just be ... the "documents" in the .editor/evaluators namespace? that doesn't sound great.
eh maybe I'm trying too hard, and it shouldn't be part of the namespacery after all. it was fun to think about though.
SO:
`[id]: {toplevel: tid, evaluator: id | null (js), title: string}`
andd when pulling up an evaluator, we would have recorded when it was compiled ... and ideally we would know if it was stale. although that might have to wait until I have hashes nailed down.

OK SO I've got a database, and it has a table `evaluator-config`
and a table `evaluators` which maps an ID to the `source code` and maybe the `hash`, and definitely the timestamp.
and a table `toplevels` that has each toplevel with its own little map, and also undo history.
and a table `documents` that has the title, and the default namespace, and the import map, and the `evaluator` id.
and a table `document-nodes` which has RealizedNamespace dealios
and a table `names`? i meeean I want to be able to do a reverse lookup of toplevels to find a thing by name, right? but that should be an index on something else, I should think.
and a table `parse-cache` which caches the analysis and parsing phase of each toplevel, keyed by `toplevelid:evaluatorid`. You can query the parse-cache to "find a thing by name". because it will have `export` and `usage` info.
and a table `type-cache` which caches the type analysis phase, also keyed by `topevelid:evaluatorid`
and a table `code-cache` which caches ... the compiled code phase ... right? seems like a thing. So you can just pull stuff up.
anyway, and you might want to ... like export a toplevel expression as an executable? at some point in life.

# OK NEW IDEA

- we modify check-exhaustiveness to *tell* us what `spreads` would need to be nipped in order for things to be OK
  and then we nip them.
- ALSO I want something at like the expression top level that says "if ... there's a thing"
  (def x 'hi) -> should just be 'hi, nothign more
  BUT
  (fn [x] (if true x 'ho)) -> should be ['ho ...x]
  so ... basically if a function is /returning/ a spread that doesn't appear as a tvar in the args, nip it.


# Sooo here we've got the enums n stuff
buttt the problem is, enums are always inferred as open. and I dont want them to be.
like
(match x
'a 1
'b 2)
x should be inferred as closed.
(match x
'a 1
_ 2)
x should be inferred as open.

(some-fn-that-is-open 'a)
-> the argument 'a should be inferred as open.

ok so it's kindof like, /patterns/ should be inferred as closed, but should be able to unify with other patterns?
ugh I mean unifying meeeeans wait.
the type of a pattern could be closed, but that doesn't mean that the whatsit needs to be, right?

if the pattern is inferred as closed, that makes a lot of things wierd.
ANOTHER OPTION: After grabbing all the target whatsits, if there's a spread variable, I torch it! give it an empty row.
you know that might work.

# IDEA IDEA IDEA

Ok so what if
algebraic effects are trying to do too many things at once?
So I got here by thinking:
- having the ability to bypass plumbing would be so cool.
  like, oh here's a value I need in this one place. And, I'll want to
  provide it in some other random place.
  What iff I just had the type inference know how to plumb everything together?
  OBVS you would want a really nicely explorable call graph so you can visualize what goes where.
  ANDd when tracing, you'd want to .. keep track of things somehow idk.
  ANYWAY what it turns into is just a bunch of "implicit arguments" that get `provide`d somewhere, and `request`ed somewhere else.
  I guess we're doing dependency injection? hrmmmm anywayyy
  it could also be interesting to do monomorphising on booleans, so you can like have `(if debug something-expensive)` and actually just get it compiled out.
- BUT THEN i was like "oh hey that's one of the things algebraic effects does"
  BUT actually full algebraic effects is way overpowered for that, like don't make me call up the stack
  or some nonsense just to get that one value. how about you just pass in that value.

SO basically I was like, what if functions were just a whole lot richer? like

A function has
- input arguments (maybe labeled idk)
- a return value

- implicit arguments (dependency injection)
- effects (full on stop the world and come back)
- exceptions (stop the world and dont come back)

and all these things ... are like techincally in the realm of effects ...
hrm could they all get bundled into one .. "effects" .. "implicit record" that gets passed around? I mean maybe

```
type Implicits = {
  someConfigValue: a-value,
  someEffectyThing: (takes-a-value, continuation: (returns-a-value) => um what goes here) => ... ok that's tricky type-wise,
  someExceptyThing: hrm so really this would unroll all the way back up? right? hrm...
}
```

what would it mean ... to have a "state effect" ... that was ... actually going to do mutation.
would it break things?



  AnDD another thing it does is "the state monad". but /both/ of those thing



#

- `nodeName` for fixture tests --> would be great to show failing/succeeding

"Designing Record Systems" paper
- uses HM(x) to do records with "extension", "concatenation", and "removal of fields"
I don't really care about removal of fields.
Extension & concatenation sounds great.
But really the best would be enabling recursive types!
Do I care about "field labels as first class values"?
hrmm


Soooo
# Recursive types!

https://sci-hub.st/10.3233/fi-1998-33401 looks good
https://web.cs.ucla.edu/~palsberg/draft/jim-palsberg99.pdf might be helpful too
roc's deal https://github.com/roc-lang/roc/blob/25f230fda81ef57387dc73cc315a15b5e383752b/crates/compiler/unify/src/unify.rs#L3701
https://ieeexplore.ieee.org/document/782600
https://www.semanticscholar.org/paper/TYPE-INFERENCE-WITH-RECURSIVE-TYPES-AT-DIFFERENT-Peric%C3%A1s-Geertsen/0749e4999aa588b3ff1a85f788e0c93d29306eb9
https://dl.acm.org/doi/10.5555/864348

This is a cool comparison of AlgW and HM(X) https://github.com/gowthamk/notes/blob/5eab166fafaa222310e1038cd86e212bfd8be815/_posts/2014-07-15-Type-Inference.markdown

Looks like I need to add a `mu` type case, which is a `mu vbl . (some type that contains vbl)`.
so ... unifying things ... seems like it should be doable, right?


# Tutorial ideas

- [ ] it would be great for the `playground` document to have a dropdown letting you switch between evaluators,
  with presets:
  - bootstrap
  - bootstrap + self-1
  - self-1 + parse-self
  - algw-s2 + self-1 + parse-self
  - algw-s3 + self-1 + parse-self
  - algw-fast + parse-1-args
  - ...
- [ ] and then a l2- test, with type classessss
  - .. just algw-s4 + self-tc ... right?



ehhhh I do think I want a toplevel to be able to have a `docstring` thing ... maybe a "prefix"?
would I also want a "suffix"? idkkkk maybe tho who knows.
These wouldn't be ... visible to the parser, righttt
--> OK so a cool thing is, we can show the inferred type /above/ the term, but /below/ the docstring

## THIH noww

self-tc
parse-self

The road to full type classes
- [x] start plumbing typeInfo
- [x] get some tests working
- [x] get plugins passing typeInfo
- [ ] get toFile passing typeInfo
  -> hrm lower priority

🤔 sooo ok, soo what we have here ... is .....
ugh ok so I definitely want ... and we're definitely gonna need the ability
to infer recursive types.

- gotta be a parse error to overwrite `cons` or `nil` folks. dont do it
  orrrr maybe I should use a special thing. Yeah that'd be better. `[a]` is cons maybe? and `[]` is nil? sure.


Type Classesssss

- So, we've got "very basic type class info" passing in just fine.
HOWEVER. With type variables, we're definitely not making it happen.

`$type_class_insts["(, int int) < eq"]`
-> probably needs to be something like:
`$type_class_insts["(, a b) < eq"]($type_class_insts["int < eq"], $type_class_insts["int < eq"])`


ok so I think I'm on the right track here with things I need to be resolving ...
like
there are ones in head normal form
and ones that arent
and
we need both.


right?

# For debugging more stuffs

-> the Save Evaluator plugin type
  -> have an option to include fixture tests, for nicer debugginggg
  -> alsoo have an option to like "produce a cli" ya know. instead of "return {}"

##

OK so long-term plan, it would be great for the host environment not to need to know about `sanitize`...right?


- [ ] ENXT UP: record-if-generic should include predicates! thnxxxx
  - which means we need to recording (qual type) instead of (type), which sounds fine
    -> should we also be recording the full (scheme)? MMAYBeb

- [ ] setPointerCapture and elementFromPoint

# Builtins self-hosted

.. something's not working?
.. I mean, I think my `toFile` needs a litte more of something ...


# Thinking about row types and tagged unions.

... so, I didn't realize it, but Roc doesn't have record extension. Just record update. I imagine this makes the type system much simpler to implement.
such records would *not* be able to represent Effect handlers, at least in the way I've envisioned it.
... so maybe the scoped labels approach is fine? hmmm.
hmmmmmm ok so disallowing record spread does make memory representation a ton simpler. well .... hmm idk maybe not. I mean, if you have an open record, you don't know. But they probably monomorphize that all away.
but then, if you're already there, then extending records shouldn't be a problem either.


# Pre Alg W

I should prooobably do a "pre algw" document that is *without generics*. Right? ... would we still have type variables?
Yeah I guess we would...
Anyway, might be helpful as a stepping stone.


# GADT thoughts

https://blog.polybdenum.com/2024/03/03/what-are-gadts-and-why-do-they-make-type-inference-sad.html
https://blog.janestreet.com/why-gadts-matter-for-performance/
https://wiki.haskell.org/GADTs_for_dummies

# THIH Type Classes

type
classes

-> we're reporting the predicates
-> for non-function types, we need to resolve things so it can actually compile
-> for function types ... we're not really going to execute it anyway right? i mean ... what would be the point.

- [x] predicates now default. cant say I totally grok the algorithm, but it seems to be doing it right
- [x] I probably shouldn't allow toplevel consts to have numeric nonsense in them ... because how do you actually specialize that?
  and does it just mean that ... the reference ... yeah ok I'm gonna say we drop it.
- [ ] codegen now needs to use that infos for good news!
  which will be great. I assume `compile2` will take ... whatever the type checker came up with.


hrmmmm sooo I think I need `builtins` to not be just in a file. it needs to come out into the world.
-> defined in javascript
-> special thing, where we parse it specially. Yeah, it's just a string, it's got `consts`, and we figure it out. Good dealio.
-> NOTE that I'll still have `equal` be fast-deep-equal probably.







Things to think about:
https://terbium.io/2021/02/traits-typeclasses/

ok, so thinking about how we end up passing around the "instance maps" for things ... what if the predicate (isin type string) had a third argument, that is ... like a `(option int)`, that would get filled in with a reference to the ... location of the instance definition? hrmmm.

Ok so the thing that will happen, is we'll get "the type of this function call is XYZ", with some type variables, that may have constriaints on them that exist in the "global predicates list".
-> andddd so it's not really that the function call has predicates, it's that the variables in the function type have predicates.
Anyways.
Those predicates, they need resolvin.

I'll need to sit down with this once I have the inference actually happening. And do a concrete example.

OK SO yeah, I'm pretty sure: when we introduce a predicate, it *exists* because it was attached to some global value.
SO, when we bring it into the world, we need to /tag/ it with the /loc/ of that variable reference, so that at runtime,
we can replace `show` with `show($int$show)` or something like that. prefill in the relevant instance.


OOOHK, so:
- (defn x [a] (show a))
  -> has predicate (isin a:12 "show") <- a:12 is the `tvar` name
  -> gets generated as:
    `const x = ($a_12_show) => (a) => show($a_12_show)(a)`
  lovin it

- [ ] STOPSHIP: only attach predicates that have type variables that are free in the declaration!!!
  this makes sense now.

# Track Changes

ok this is cool

- if this node didn't exist before, but does now, set its trackChanges to "new"
- if it was modified but did exist, set it to "changed"
  - hm but probably only if the `type` didn't chagne. if It did change, treat it as `new`
- THEN:
  - for containers, if you /changed/ do a light background highlight
  - for containers, if you're /new/ and your parent is /not/, then do an outline
  - // for atoms, if you /changed/, do a sub-highlight thing on your changes probably?
  - for atoms, if you are changed or new, and your parent is /not new/, then do an outline or underline or something.

- [x] hover lookin fresh
- [x] got to indicate in the "collapse" dealio that there are changed children
- [x] add a command balette thing to allow clearing of 'trackChanges' prev.
- [ ] deleting a top shoudl delete the stuff
  - and it should invalidate things that depended on it
  - changing a name should do that tooooo
- [ ] it's weird to report "change" info at a higher level than the "type" info that's coming up ...
- [ ]


#

- [x] use all_names on the editor-end
- [ ] use the `usages` from all_names on the editor end of things
- [ ] ditch the usage tracking from algw-fast
- [ ] figure out what I want to do with algw-s2 now that it has been ... fancied up.

OOOOOH OK
SO
WHAT IF
you could *switch between versions*. Yes let's do that.
so we can really get a feel for the difference.
maybe most relevant on the "playground" page?

# Sprucing algw-s2 up to be the thing we always wanted

- [x] <-err basic
- [x] <-err with all the types
- [ ] Infer the missing items ... ahead of time?
  ok yeas I guess this is instrumental in enabling autocomplete. So I should definitely do it.
  eye meanss it's not 100% the thing. like it's definitely a neat trick walking stick.
- [x] OK but the more important thing
  is hover for type.
- [ ] and also usages, lets not forget that.
  Soooo do these really need to be ... ... tracked in the type inference dealio?
  Can't it be done a lot ... cheaper ... by a different analysis thing?
  🤔
  and the kicker is, we'd really like usage tracking to still work, even when there's a type error.
  NOW in some future moment, when we have type classes, the "resolved instance" might be something a little more involved. but that's definitely future.
  ok, so usage is gonna be a separate thing.

  yeah suffice it to say, it'll be its own thing. Maybe even in the same breath as `externals`?
  Might as well. Ok, so instead of `names` and `externals`, we have one thing to rule them all, and it's
  `usages`
  - (usage/local decl l)
  - (usage/global name (kind) l)
  - (decl/local l)
  - (decl/global name (kind) l)



# Feedback and such

- [ ] make a glossary!
- [ ] I want to be able to put definition tooltips everywhere. in the rich-text
- [x] ugh the jumping around is so bad. I need a better thing for that.
  - maybe just with rich text dealios? Yeah, like if it's rich-text, just don't.

- [ ] bottom status bar - to show the # of errors and let you tab between them
- [ ] also bottom status bar: "track changes!" you can probably turn it on or off, but if it's on, then it will have a map on `state` that is like `changesMap` and it will contain the previous version of each MNode that gets modified while track changes is on.
  THIS WAY I can be like "I'll make a new version of (our type inference algorithm), but with [nicer error behavior]", and have it be reasonable to look through.
  .. ALSO: do I want .. to be able to like ... show a "PR" view, of just the changes, somehow? In a little bit of context?
- [ ] hrm search results need to ... simplify again. Maybe harder now that we're doing ReadOnlyRender instead of StaticRender
- [ ] fixture tests - clicking the new output shouldn't "paste" it hsould just replace the stuff.

# For Export

for the series of artcicle
- [x] collapsed things should show what's hiding
  - I love it so much
- [x] hrmm `stmt` is really a misnomer, and I should remove it.
  These are "toplevels".
  - definitions
  - expressions
  ... I mean that's it, so thye could be called "definitions", but idk

- [x] the FONT is TOO SMALL
  andd maybe just too skinny? idk, I should play around with
  different fonts.
- [ ] Nowwww let's do some static rendering my good folks
  and when I say static
  I mean static.
  - [ ] THIS MEANS no javascript
    IT ALSO MEANS hm I can use the `detail` whatsit to get expand/collapse, right? <details><summary>thing</summary>more things</details>
  - [ ] it would be nice to have a sticky header too
  - [ ] and a collapsible table of contents at the top...

# Static Rednder

- [x] basic setup
- [ ] show namespaces nested, with `<details>`
- [ ] show productitems
- [ ] do a "table of contents" at the top
- [ ] get the right font


#

- gotta toplevel 'em all
  - [x] Structured Editor
  - [x] Encoding
  - [x] AST
  - [x] Bootstrap
  - [x] self-1
  - [x] parse-self
  - [x] type inference
  - [x] parse-1-args
  - [x] algw-fast

# The Blorg Porst

- [x] intro.json
- [x] structured-editor.json
- [x] encoding.json
- [x] ast.json
- [x] bootstrap.json
- [x] self-1.json
- [x] jcst.json
- [x] parse-self.json
  - [x] executing
  - [x] trimmed & refactored the implementation
  - [x] annotated; eh, I feel like there's not a whole ton to talk about?
- [ ] algw-s2.json
  - [x] split stmts
  - [x] basic deftype idk
  - [x] typealias why nottt
  - [x] quot n stuff
  - [x] get it running on everything, verify that its allgood
  - [x] hrm maybe scope should be to "forall" schemes?
- [ ] algw-fast.json
  - [x] executing
  - I think I probably want to do a stripped-down version first?
    Just like with the parsing & code generation.

# Ok I think all the files are in decent shape

now to render them! or something.

We need:
- a left sidebar, definitely
- how to order? probably use numbers or something
- andddd we also need to get caching working (would be nice)
Also:
- make a pre-rendered version without any fluff, for mobile users or whatnot

And then release it? probably?


# PLAN Higher up...


- [ ] HRM "instantiate" ... doesn't need to return the subst? I think I might be doing unnecessary work...
  - because the whole point of instantiate is that those vbls get replaced...
  - LOL ok so for the "pattern" whatsit, we do actually need to hang on to those instantiations.
- [ ] I do need plugins to clue in to the `usage` dealio, so I don't think things aren't used.
- [ ] I ... kinda want ... the inferred `type` to be displayed directly *above* the toplevel.
  to avoid jumping, should we reserve space for everything there? Or just for toplevels with a single named export?

Innn the interest of scrappiness; once we have a bare-bones `parse + compile` for self-hosting,
let's get right to type inference.
(Q) Should we labor through the manual tracking of the `subst` list???
  - maybe? yeah let's go with "no" on that one. I don't really see a plus side to it.
    but we can mention what's going on.
(Q) Do I dare try to remove `map`, and just use a `(list (, k v))`?? not sure really.
  - I mean, I could see what the perf implications are.

- [x] get bootstrap.json AST in alignment with parse-self.json
- [x] hrmmm let's get rid of all these `,,` and `,,,` nonsense.
  Just do tuples like they ought to be done. `(, a b c)` is `(, a (, b c))`

- [x] Rich Text spell check only enabled when the node is focused
- [x] bootstrap should really parse into `pat`s for `let` and `fn`, it's weird to bail.

- [x] right now, clip history that I save to ~500 items?
  - bootstrap.json down to 1.2mb
- [x] Do nice readmeeeees
- [x] jsEvaluator, maybe don't evaluate (abc def); only if `abc` is a raw-code
  - [x] raw-code, rendered inline, should look nice
- [ ] I should allow a plain `:` as an identifier...
- [ ] backspace `( abc)` with cursor after the open paren; should delete the blank. Actually all blanks.
  - [ ] ANDDD backspace to break a list *should* create multiple namespaces if needed. PLEASE
- [ ] drag & drop should be a lot smarter.
  Let's have it be separate from the normal cursor drag.
- [ ] what if a collapsed toplevel... listed the names of things declared in it?

# For the Boots

- [ ] I need to ... make the bootstrap parse types be the same as what self-1 is expecting. right now I'm making it worse.
- [ ] alsooo should I be smarter about externals detections in raw js? idk

COMPROMISE
- [x] what if bootstrap.js sanitized everything??? Like that would work, right?
- [ ] OK So nowwwww what about them builtins?
  - self-1 has a thing with all those builtins
    but what if it were differenttt
    - maybe like exporting a "builtins" or something? like a prelude? I mean ... right?

# QUerstion

do I want ... the bootstrap, to do tree-walking evaluation, or compilation?
compilation definitely results in faster code
and so maybe I want to jump right to that?
That removes some amount of bumping around, because then I can go right to a fnsEvaluator. ... right?

yeahhh. but I can also include a tree-walker dealio as an example if I want?

OH so fun story, it looks like maybe I'll be able to do it after all? like ...
so I have this "prelude" that allows me to define `evaluate`.
And then my `compile(ast)` just looks like `ast => "evaluate(${JSON.stringify(ast)})`.
pretty slick.

SO I will also need to pass in an `$env` vlb when evaluating, because I won't be taking globals
off of the normal js scope.

Q: so ... prelude. ... can it just be a raw string? If so, how would I know what values it has?
and then ... how would I turn it into a ... "file"?

`compile_stmt` .. probably wants to .. have more control?
like, right now fnsEvaluator is doing a bunch
like adding `return {a, b, c}` to it.
wellllll but not having the return is helpful when we `toFile` it...

hrmhrmhrm. what if I have like `compile2` and `compileStmt2` that rely on a passed-in $env instead of
... js scope?

# js in your jerd

- [x] find an editor (CodeJar)
  - [x] make a very basic bootstrap
- [ ] find a parser for analysis (typescript?)
- [ ] make it pretty (prism?)
- [ ] do a type check maybee (typescript?)
- [ ] ARH cmd-enter needs to make a new raw-codeeee

- [ ] ooooh BUG, if there's a `name` that's `constructor` or `toString`, it will totally bork
  things.
  OH so I need to switch to `hasOwnProperty` right?

soooo how would it be ... to .... allow me to ... evaluate js a little bit... yeah ok I will do that.
so like
'we can do a very little bit'
-> maybeeee only toplevel (raw-code ....args)
so that I can get the fixture test running

#

- [x] DEFAULT COLLAPSE MODE should be 1-line
  with "hover to see the whole thing in a popover"
  and then you can "pin" the output to make it take up more space.
  That will help tremendously with the jank of moving everything around.
  - [ ] ok there's a little shift when errors are introduced, but much much less.

# I ... had a thought
what if ... I not only make this env multi-compiler
but also ... multi syntax?
Like, I love my structured editor
but how cool would it be to be able to self-host all the way down?
That is to say, to have the javascript host be in "toplevels" (edited by codemirror probably)?
Wouldn't that be cool?
It would allow me to do my literate programming dealio, all the way down. Which I would definitely like.
So I could tell the whole story in the same medium.

# Can I figure out Rose?

- [ ] 'labeled type' is an element of `type`
- [ ] and would probably have a `kind` of `row`?
- [ ] needs predicates
  - "containment" (iscontainedby v1 v2)
    -> expands v2 to include everything in v1? right?
  - "combination" (combine fields1 fields2 fields3)
    -> if all are defined, we just do checks (and unify subitems I guess)
    -> if f3 is a variable, can just iterate fields1 and fields2
    -> if f1 or f2 are variables, we find the different btw f1 and f3
    -> if we have multiple variables ... then we're probably not constrained enough?

QUESTION
can I use predicates to get the `lacks` thing going?

sooo there's the other way to do it
which is with a special type constructor ... right?

OK so the story is
let's deal with type classes first, as I have a concrete implementation
THEN once I have constraints that make sense
AND kinds added to the lang
I can mess with rows, using the kinds and probably also the constraints


# Thinking more about thih

- [ ] I should take a look at OutsideIn(X)
  - oohhh so interesteing constraint: local let's can't be polymorphic anymore!! honestly I'm not super mad about it, you can always lift, bruh
- [ ] can I change thih to put the (preds) in the state monad? Would that have any adverse effects? It seems like we're doing a lot of collecting...
  - probably stick them in a `bag` so we're not doing endless `concat`s

- [x] collapse should just hide children
- [x] BUG changing the "output" format doesn't immediately jog the things; I need it to
- [x] add a 'show type env' debug button. and a type_env_to_string fn

OK FOLKS
at this point, I'm ~confident that I can just slap predicates on


#

- [x] render readonly for sseearch results
- [x] better menuuu
- [x] "pin" a toplevel, render readonly
- [x] okayyyy so, my traces are .. not really up to snufff. Is it that, I need to distinguish between locals and globals?
- [x] gotta be able to delete an empty ns that's before you
- [x] let's do hover on timeout, not on alt
- [x] fix the longstanding issue with newlines in stringText
- [ ] usage in plugins too pleeeease

I worry ... that I've gotten algw-fast so nice
... and then ... thih is so ... much less polished ...

How .. hard will it be to add "predicates" to algw-fast?
like, it should be doable, right? I'd much rather do that,
than try to massage thih into shape ...

Oh that's right:
- Kinds
and
- Type Classes

and ... I think I remember it being:
- you can have type classes w/o HKT, but HKT doesn't make sense without type classes

# So, Adding TYPE CLASSES to algw-fast

- we need to keep track of `preds`, on the StateT. (it can be a `bag`)
- type-env needs to have info on what's available.
- StateT will also want to hang onto "... selected ... instance ... at fn call"
- and ... schemes need to be wrapped in quals. Right?

# THIH

definstance, what do I need to do...
- hook up the instance declaration
- .. ok I need a function that will take my parsed type nonsense, and ... attach the right kinds to tcons

- [ ] class-declarations need to know the types of their associated functions. that need to be implemented
  - we could get fancy with "default implementations" but ... not at the moment.



# Getting back into thih

- [x] algw-err is now checking type aliases, and we need to support recursive type aliases
- [ ] So I thikn that last thing that happened was I needed to figure out when/how
  to deal with a definstance ... and I determined that I need to switch to a multi-pass
  thing ... where the `kind` of a given `name` would determine which "pass" it would get
  processed in.
  ...
  So, how does that play with the `tenv` that I'm producing, and caching? Is that gonna be
  a problem?
  mensch this is kinda involved.

  wait but can I decide that `definstance`s can be late-binding?
  I think I need to check to see if I can ditch `simplify` withouth suffering too much.
  Can I simplify late in the game, like during compilation?

- [x] clear errors for tops that stop needing processing

# [x] DOCSTRINGS PLEEASE

OK I've decided:
- ~~toplevels will have a separate "slot" for docstrings~~ nope not that, see below.
- for things that are defined inline, it'll look like
```clj
(deftype hello
  ''some docstring
  (one thing)
  ''other docstring
  (two otherthing))
```

oooooooooooooooooooh or what about
like
I could just do
```clj
('' some docstring
 defn something [abc]
  efgh)
```
right?
I make the rules? Yeah honestly I don't hate it. and it allows me to not
do a bunch of specialty stuff.
all it'll take is a little tweak to the layout algorithm, and we're golden.



#### Brainstorming
- [ ] Noww that I've got autocomplete, and hover-for-type ... I'd really like some docstrings.
  I feel like ... they /ought/ to go "right above" the definition ... but that's a little annoying to do,
  from a technical perspective.... right?
  WELLL I could just ... make it so that `nsTops` have an extra slot for documentation. Right?
  That would ... mean that /other/ things, like ... idk type constructors ... which are defined in the middle
  of a toplevel, wouldn't be able to go through the same channels. Is that so bad?
  hmmm I mean ... I guess I could snoop on the result of `names`, and make a ... "slot" for each name that
  is given.
  So that .. the "docstring" header for a toplevel might have several "cells" in it, one for each named thing.
  would want to make sure it's not ... too fragile though.
  Might also be a little weird?
  Like, the docstrings wouldn't be colocated.

```clj
(deftype hello
  (one thing)
  (two otherthing))
```
in one incarnation would look like
```clj
'' hello docstring
(deftype hello
  ''some docstring
  (one thing)
  ''other docstring
  (two otherthing))
```
but in the "toplevels have a magic pouch" it would be
```clj
'' hello docstring
'' some docstring
'' other docstring
(deftype hello
  (one thing)
  (two otherthing))
```
which yeah not the most ideal.
althouuuuugh for those things, I could just have the rule be "for the loc of the name, find
an first-child ancestor that has a prev-sibling that is a rich-text node, and use that".
Honestly that's not too bad.
and (ding ding ding) it allows my parser to continue to ignore rich-text and comments.

# [x] Autocomplete

- So, if you have a ?
  or you ... are editing something

- [ ] autocomplete with JUST globals
  - so this would be ... living on `state`? maybe? or maybe not idk
    could be like a `Cursor`

- [x] make inference errors much more specific
- [x] do an autocomplete, when the cursor is on a `missing` type error.
- [ ] maybe like shift-space to trigger the autocompleter on a non-missing?

# [ ] Autocomplete with locals pls?

# [x] Cache the most recent successful "type" response for a given top, and use that if we're failing. That'll make things much nicer.

# [x] Parse but better

parse_stmt2
parse_expr2
comin atcha

# Things I'm doin

- [x] search restultsss
  - [x] simplify results
  - [x] Show the name of the definition that a result comes from
- [x] search for a string (within STRINGs y'all. yes please.)
  - hmm
- [x] cmd+p should bring up the jump to
- [x] cmd+p should show types
- [ ] autocompleeeete
  - my errors should get more specific
    - (type error)
    - (missing error; (, loc expected-type autocomplete-options))
    - (depends on something that has an error)
  - ... I also want a way to indicate to the type checker...
    "this term exists, but has a type error so you can't rely on it...
    ... this is what it's type used to be, so use that"
- [x] alsoooo parse errors shouldn't tank the whole thing.
  - which meeeeeans I want the parser to have a monad, which meeeeans
    that either I need the bootstrap parser to understand let-> (I don't)
    or I really should set up an intermediate parser that's much simpler in
    needs.


# [x] Highlight Usages n stuff

So what's the big idea.
Probably ... something on state?
on a timeout...

ayyyyyy
maybe a timeout at some point, idk? it's pretty cool.

- [x] CommandPalette -> showww the usages, in a little bit of context!

# Effects

(arg1, arg2) => {
  !doSomething()
  somethingElse
}

/// does that work???
(arg1, arg2) => handlers => {
  handlers.doSomething(() => {
    somethingElse
  })
}


- [x] valueToString / typeToString...
  - [x] typeToCst let's goooo
  very nice.


I WOUUULD really like ... to have the notion of "commits".
And then ... the ability to show "these things have changed".
probably an "autocommit if everything's green"? And then
manual commits to "name" what has changed.




## a tweet?


Jerd is a result of asking the question: What if instead of first writing a language and then
a structured editor, I first write the editor, and then the language?

# Unused, let's make it really great!

- [x] types! also get in on the unused action.


# Tests I need to write

- [x] something about making sure `unused` highlighting actually propagates correctly. What is up with that.
- [ ] something around "introducing errors" into a term, and then ... propagating things ... idk
  - [ ] deleting a term (or making it so a term no longer exports a name) should be reflected in downstream
    tops

# NightTime Thoughts

- [ ] find-in-page - should have a right sidebar overlay thihng that shows the results in-context
  (2 lines above & below?)
- [ ] ALSO multi-select, if there are selections that are off-screen, show them in a little toast? that would be rad
- [ ] to enable this, have a *cache* of `pathsForIdx`, which ought to be pretty simple to update?
- [ ] search results will have the top path be `type:search-result` instead of `type:card`, and hovery deals will
  have `type:hover` ... although hm the hovery deal is a little weird because we *do* want the selection to
  show up ... hm ok, maybe the hovers are readonly? and pretend to have the same ~path as where the selection is?
  yeah let's do that.
- ALSO multiselect, theselection highlight should be orange instead of blue
- [x] ALSO let's really do "highlight all usages of the current identifier" pleeease and thank you.
- [x] ALSO have a command palette thing that's "rename", and what it does is multiselect all usages, which is great
- [ ] type checker exports a "phases" thing, (array (, int (array string))) - indicating the phase numbers ... and the "kinds" that get processed during that phase.
- [ ] LocedName `kind` shouldn't be hardcoded in js anywhere. Just cue off of what the evaluator gives you.
  - cmd-p = jump to, pleease. Also indicate the `kind` of the thing you're jumping to.
- [ ] maintain a "jump history", that you can pull up just like search results (it'll show a +/- 2 lines context)
- [ ] maybe prune all but the last hour of changes? That oughta be enough, for nowwwww

# Noww that

now that parse-1-args can do better javascript output...
... and ... well the thing is, I was hoping it would speed things up. it hasn't really.
So what's my new plan of action?


## THIH Type Classes Type Checking

in order for thih type classes to type check, I need

- parse can return multiple statements. This shouldn't be hard,,, because I'm mostly abstracted
  over the return value of parse. instead of `stmt` it returns `[stmt]` and js is none the wiser.
  is that real?

> [x] we're doing `compile` instead of `compile_stmt` for sexpr's currently.
> [x] we're checking the meta of the expr's loc, don't introspect that
  - [ ] when really `traceTop` should probably be a property of the NS
- [x] compile_stmt ... should it ... like ok, if there are no 'names', do we just assume 'this is an expr'?
  seems like we probably could. lets try it.

Ok, so with `parse` returning multiple statements,
do we...

do a multi-pass thing?
How do we determine which pass ... we're on?

just because parse can return mutliple things
doesn't mean the deps are different for each .. at least at tthe moment.


So thinking of the super-group story,
when you call `externals`
orrr rather `parse`?
it returns a list of stmts, along with ... their ... hmm.
wait.

ok no, it returns `(, stmt (array number))`.
and the `array number` indicates *which passes* this stmt should be
... involved in ...

so for a given pass, you ... need a separate dependency sort. ...
which is fine.

and then you go through and call `infer_stmts3` with .. the
stmt, and the pass #, and ... then ...

it'll be like
```
(match pass
  0 (infer-classes-and-types stmts)
  1 (infer-definstances stmts)
  2 (infer-defns stmts)
  3 (infer-exprs stmts))
```

And that should be enough, right?
then we'll get around to needing to do cache invalidation
based on type-informed dependencies. which we'll need to resolve
in order to know how to compile type classes in the first place.

SIDE NOTE should I just get rid of `infer_stmt` altogether? We don't really need it, right?

# Hm

OK ALSO so the current thing ... let's bring the `parsing` into the web worker, that's gonna be important.

....

also...

maybe I should get `record`s going in the algw language ... it would definitely make interacting with
javascript easier. And, also arrays? like that shouldn't be super hard, right?
then I can do `list->array` and stuff.
anddddd it would be really cool to autogen `to-json` and `from-json` for all deftypes.

Anyway, the more I self-host, the more importand performance will be...
and so we get to (jst), which can be much better optimized!

- [x] ok so the way I layout strings is really quite silly.



- [ ] Random idea: if there's a type error,
  what about highlighting (or displaying somehow) all usages
  of the function that has a problem?




I can't rememebr when it was, but I was also thinking about unquoting.
like `(@@ (one @(two)))`, where "two" would be unquoted. has some symmetry with `${}`.


# Thinking about type classes

the "what order to I process these in" question is ... not simple.

a `definstance` might depend on other `definstance`s.
We don't know what it might depend on until we do the type checking of the instance functions.

BUT

we need to be able to sort out dependency order without doing type checking.
...
SO

we might need to do ... things ... in 2 passes.
first pass, collect all the `definstance` declarations, *assume* the functions type check,
and add them to the class-env.

Then go through, type check everything.

I can think of 2 ways to do this.

(1) allow `top`s to export *multiple things* that have *different dependency details*.
  conceptually, we could call it (top) => [stmt] instead of (top) => stmt.
  this has several things going for it.

  (definstance (pretty c) {a b c d})
  would turn insto
  (sdefinstance (pretty c) loc)
  and
  (sdefinstance-methods loc {a b c d})

  ALL usages of `pretty` would ... rely on ... the .. hrm.
  ok would have like a pseudo-dep ... that encompasses ...
  all of the `sdefinstance`s of `pretty`?
  that seems complicated.

  and then...
  how do we ensure that we're compiling `sdefinstance-methods` ... before any
  `evaluations` that need to happen?

(2) ok any way you slice it I think we'll need to support mult-stmt outputs.
  but another thing to think about is having "multiple super-groups" that we can sort
  things into, both for the purpose of type checking and possibly also compilation.

  If we just say
  "first super-group => all (defclass)es and (deftype)s and (defalias)es"
  "second super-group => all (definstance)s"
  "third super-group => all (definstance-methods) and (def)s" - because they can depend on each other
  "fourth super-group => all (expr)s and (plugin)s"

(3) ALTERNATIVELY
  we could add *more passes* than just "parse -> typecheck -> compile"
  like, there could be a "classcheck" pass, that ignores everything but the (defclass) and (definstance)s.
  and then (typecheck)ing the (definstance)s just checks the instance methods.
  would that ... allow the current dependency determinations to remain unchanged?
  That would be quite nice.

oooh recompilation ... also needs to ... be aware of things.
that is to say: If the implementation of a typeclass instance changes,
we need to ... re-run anything that used that implementation.

Actually this touches on something that has been bothering me.
IF I can modify `compilation` so I know whether a variable reference is a `global` or a `local`,
then I can get away with recompiling much less, because references to globals will be dynamic.
This would be nice.

ANYWAYS, what I mean to say is this:
- we can have a rough first-pass dependency analysis that works for type checking
- but then we need the type-checking pass to produce extra dependency information, needed for
  evaluation.

(4) And most mostestly:

So, what if ... I self-host even harder?
That is to say, what if I bring more of the ... `updateState`
into the lang.

This would allow me to ... do macros! In a way that wouldn't require the js side to know about macros.

because macros require ... interleaving of parsing and execution.

like
(parse everything), and macros become `(emacro string cst)` and `(tmacro string cst)`
and then
(dependency analysis) partitioning into "macros and things needed by macros"
and then
(type check & compile the macros)
and then
(run the macros on the things that needed expansion)
and then
(type check & compile everything else)



# The Next Things (thih)

Ok, now that 4 day sidetrack is done (web workers + algw-fast + unused)
we can get back to thih!
Namely, we need to be able to define instances and type classes.
So that I can actually verify that things are working.

OH AUTOCOMPLETE

ALSO WHAT ABOUT SEARCH
gotta be able to do document search
not just relying on the browser.

IT WOULD BE NICE
to simplify types for display, by subbing out type aliases.
What are the changes ... of that being at all fast?
I guess ... I could do it on-demand?
might not be the worst
could prolly do it for a single type <20ms, but doing it for all
hovers would be way too much.


BUT ALSO
wouldn't it be nice
to be able to PIN a toplevel to the bottom of the screen
as reference.
probably in readonly mode?

BUT ALSO
it would be cool to be able to...
"copy this `(typedef` as a `match` ..."

- [x] BUT ALSO type hover on a tcon should show me the types of the arguments pleeeease

I REEEALY want a "jump back"liness

# Another thing (serialize to CST pls)

Let's have our parsers be able to serialize as well! Why not?!?
Thennn I could actually do normal sourcemaps, which would be very interesting.
BUT the more ~important reason is so that I can display types and such much nicer,
which highlighting.

# AND another thing (template strings with functions)

Doooo I think it would be interesting to do real template strings... like html`abc`?
In a typeclasses world it actually becomes very interesting.
it would have the signature `a b . (first: string, rest: (array (, a string))) => b`
and if it wanted to, it could have a type class constraint on `a` waiiiit no that's not real.
that would be heterogenous. unless you had like gadts or something.
hrmhrmhrm ok so maybe what I would want is for it to have the type
`{ show: TCLS a => a -> b, tpl: (string (array (, b string))) -> c }`
and then
html`abc ${def} g`
would turn into `html.tpl("abc", [(, html.show(def) " g")])`

Ok, so I first need records, right?

BECAUSE wouldn't it be cool to be able to:

errmsg`the node ${somenode} at ${loc} has a problem`
and it would first type-class-coerce `somenode` into the serialized(cst) version?
So that I could display it all pretty in the UI? Seems like it would be fun.

# AW_FAST

ok so I'll try to ... do less composing.
even less.

- [x] get the bun tests to check the embedded fixture tests tooo
- [x] type-args.json, get the errors to be type-error
- [x] What a ride!! Now algw is fast :)

# SLowwwwwwww

wow is it like, a lot slower now that I'm tracking usages?
nope. algw-subst is just that slow.

my guess: It's because of all the unnecessary (compose-subst)ing that I'm doing.
b/c like 2s to 8s is huuuge

- ok dropping the (compose-subst) invariant helpeddd took off .75s
  from algw-subst -> algw-subst
- [ ] BUG the NSDragger doesn't update when errors are no longer there

WOWWWWWWW that's crazy, just making the inner-loop of `unify-inner` opt out of the `subst`ing makes
it soooo much faster, even faster than type-args??? what is happening.
LOL ok, it got a lot faster because it was broken 😂

ok, so the unify trick was one bit, now we need to maybe try some more?

Verification = type-args `defn externals` -- does `(, bag bound)` have usable types, or no?

# BUGGY - rm top node

- need to report that a node isn't there anymore...

# Bootstrap chain

parse-1-args
type-args

# ERROR

TOP BUGS
- [x] WHY the double-eval right off?
  might be a `debug` or something? or `evaluator` loding somehow
- [x] AGH why is my name deduping not working??
- [x] why parse errors keep stacking? so annoyinggg
- [x] the 'sorround' stuff not working
- [x] duplicate names - where am I tracking that?
- [x] duplicate tracing isn't working on the very first time? Wieerrrd
- [x] duplicate tracing needs to check cached tops!! (adding a (def y) *before* another (def y) doesn't indicate error)
- [x] OK SO I actually, let's just clear out the "parsed" duplicates thing.
- [x] Can I get `hover the defined name` to work???? please???
  - yeah I think what I want is, in addition to the `(array (, loc type))` report, we also
    report `usage`s. which would be ... `(array (, client provider))`, but idx's.

- missing should autocomplete
-


- [x] JUMP TO next error... should be doable right?


NEXT STEPS for reporting usages & uses
- [x] tenv/type needs to report the `idx` as well.
- [x] and then ... we can get down to business.


- [x] ohhhhhh traces aren't going to be working yet, right?
  - yeah Sendable has to inclue `TraceMap`


- [ ] 💡 might be cool to be able to "save/restore" the `meta` map of traces ... so that I can e.g. have a set of traces
  that I use to debug a certain thing... idk if that's necessary tho 🤷


### [ ] THIH Hover

- [x] 'destroy is not a function" wen 'jump to lolz' in simple.json ...
- [x] first render, errors arent showing up? (oh its because I'm not rerendering on worker message receipt)
- [x] first run, values arent being propagated or something?
- [x] type & error hovers
- [x] show a spinner when the worker is ... working.
- [x] show types of defns n stuff pleassee
- [ ] it would be ... quite nice ... to ... incrementally send back updates.
- [x] ok why the heck is it taking 1.5 seconds to save? lol it was 30mb
- [x] UHM Let's do some indication of `unused` variables!
- [x] and "highlight usages of the currently selected ident" would be super nice

- [ ] tbh now that inference & stuff is async, the caching issue is somehwat less. Would still be
  great to nail down ofc.
    anddd we should move parsing to the worker, so that I only have to cache one thing.

- [ ] THIH gotta report hoverssss

- [x] lol skip intermediate requests, for reals

ok lol thih is sooo big. let's maybe compress it?


#

Future papers to port:
https://twitter.com/jaredforsyth/status/1709041488032645395
https://twitter.com/welltypedwitch/status/1709129585613328657
https://twitter.com/TimWhiting14/status/1780046115662135350

# More Perf

whyyy is it taking 30ms to just change a single thing.

# Web in the Workers

- [x] `calculateInitialState` and `updateState` have a ton in common.
  We should be able to merge them quite easily.
- [x] THEENNNN we can get down to business, to hook up type inference.
- [x] anddd plugins! Gotta get our fixture tests back up
- [ ] and then, please, yes lets do CACHING of the type infos.
- [ ] oH and our immediateResults arent being cached either at the moment,
  gotta fix that too. Don't need to re-parse everything all the time.
- [ ] CACHEs should include the ID of the evaluator,
  and evaluator IDs should include like a `timestamp` (file save) time.
  AND cache should have a timestamp that needs to match the `state` in order
  for it to be valid.
- [ ] let's punt parsing over the bridge into the worker. we don't actually use
  it, and it will be nice to not need an evaluator in the main thread.


- [x] why is it saying that namespaces need updating

# ImmediateResults

- [x] ok, we do gotta treat `immediateResults` as immutable, I think... right?
  ORR I need to do a much more fine-grained approach to "changed" tracking, of individual nodes.
  So that I can know "did the error state update for this node" etc.
  - [x] OK yeah, in getImmediateResults track all the nodes that need to be re-rendered. Should be fine
    - layout
    - parse errors or not


- [x] why are we relayouting these other nodes that aren't really needing a rerender?
  - maybe I need a `layoutEqual` function
- [x] don't rerender NSTops if I don't need to.
- [x] next up: drop `NUIResults`
- [x] then, let's do some Web Workers!



## Ergh

I gotta put stuff into a WebWorker...

What does that mean?
What am I putting into the web worker?
- type inference (infer_stmts2)
- compilation probably
- and evaluation? I guess?
- yeah that's probably wise.

hrm ok this seems like it might be a little bit ... involved.
is it weird that I want two webworkers?
One for "changes to this whatsit"
and one for "doing all the changes across the board"



So ...
on change,
we find `tops` that changed,
send the new infos to the web worker(s)

ugh ok this is going to be ... a big change.

Can i really deal with all that asynchrony?



>>>>
>>>>>>>>
>>>>>>>>>>>
>>>>>>>>>
>>>>>>
>>>
>

Alrighty.

`getResults ...











## Implementing type classes

- [ ] CAN I assume, that type class predicates will always have a simple variable as the left-hand thing?
  `toHnf` implies that I might have `(a b) E ord` where `a` is a type variable of kind `* -> *`.
  But I'm not sure how to make...
  AHA
  `(defn nested-pred [x] (< (return "")))` produces a `(b string) E ord` constraint.
  ... not sure how to provide that proof, but here we are.

  so ... yeah that identifier I use for a given predicate should probably be `idx` or something,
  not the gen number, or the name of the type variable. It could be the `index into the preds list`, I guess?
  hmmmm.

SO WHen I'm collapsing predicates, I need to remember "how to get there from here".
So I know how to transform the simplified predicate into the complex version.


BUT FIRST

I do need to get "hover for type" working.


## TYPE CLASSES - they type check, its great

- [x] INSTANTIATE THE TYPECLASSES IN ADD_INST







Thinking my way through type class instances...

When choosing an instance ...
BTW strings should just turn into `show-pretty`, instead of doing
the custom "pretty" dealio.
  - ... eh, maybe I don't want to mess.
  - anyway... I need ... to be able to know ... what ... instances are being used.
    not to mention, what instances are wanted by a function call.

    hello: num a => (fn [a] int)

    hello(numCls)(a) => int
    ...
    .....
    .......

    SO
    I need ... to be able to know:
    - at function definitino (lambda) time,
      what are the type classes in play
    - at function call (eapp) time,
      what did we get resolved to
    <- these should get plopped on the state monad.
    right next to the assumps that we're accumulating.
    We'll call that critical info.



## CACHING the type information:

results without `env` is 1.7mb for THIH.
hrm actually what I probably want
is to persist `ResultsCache`, sans `.results`.
That would be super nice.
That does mean that the `lastEvaluator` would need to
use a `serializable key` instead of the evaluator itself.
But thats easy to do.


- [x] lastEvaluator should be a `key` instead of the real thing
- [x] when saving, save the cache
- [x] when loading, load the cache
- [x] How to bust? Do "disableEvaluation". Nice.


## Next steps for thih:

- [x] return schemes not types
  - `type-to-string` needs to ... know about quals. and preds.
  - so like ... ok yeah the thing we retunr should be the ... scheme, not the type.
- [x] why do I keep getting "kinds dont match" for toplevel exprs? (oh it was caching, and my EQ was === not structure)
- [x] ok we really need to better convert toplevel defns.
  - [x] WHICH MEANS its args type, people. lambda (array pat) expr, yes please and thank you.
  - [x] WHICH we can now do, because we're colocating the parser. Love to see it.
- [x] lambda args ... finished? What's the other thing?
- [x] oh, eapp. Let's do that too.
- [ ] definstance...probably
- [ ] and then I can do `defclass` and `definstance`





## Lookin in to perf stuff

- [x] WHY does "type"ing have a 100ms constant overhead?
  WOWZZ for parse-1-args, its an 800ms constant overhead
  Ahah, I was always re-typing all Plugins. lol bad move.

- [x] ok, now that the "constant overhead for re-typing everything" is in much better shape,
  I can probably let go of perf for a minute?

- [ ] so, algw-subst vs type-args ... it's like 3x slower :( sad day. I guess its doing a lot more?
  alsoo ... it's like fundamentally a less efficient algorithm. because its
  using a bunch of subst stuff that it doesn't actually need, right?
  like, things that it cant possibly use.
  should I try to make it more efficient?
  - [ ] nah, I mean maybe I can work on that for THIH? Because that's the one that's more ... pressing?
  - Yeah, because: now that the Plugins issue is out of the way,
    update after editing is down to <100ms.
    Even though initial load takes 8s 😬.
    OH HERE's a Q:
    Can I also cache ... the type infos?
    Like I really should be able to, right?
    the type env is just jsonnnn I think.
    That would be super nice actually.
    - RES without

...

So ... thikning about THIH.
It's bascially:
algw + kinds + type classes.

Now, type classes probably don't make a ton of sense without kinds
BUT
you can just add kinds first, right? What would that look like.

```clj
(deftype (mywhat a:(* -> *))
  (lol (a int))
  (who (a float)))
```


## Hover for Type please and thank you

- [x] ONLY SHOW HOVER IF ALT KEY IS PRESSED

- [x] basic hover for type, boring text
- [x] gotta cache those
- [ ] I want ... probably a way to indicate 'here are expressions that *should* have types',
  so that I can highlight them not having types if there was a type error.
  .. yeah. So like, in the case of a type error, we call `data['expression_locs']`
  so we can know all of the things that ought to have a type. love it.
- [ ] Alsoooo let's get a lot more fancy with our type rendering.
  What I want... is
- [ ] render type errors more inline, pleeeease

## algw-subst?

it ... seems to be mega slow

this is the part where I want to do some actual
CLI tests, making sure the bootstrap process is locked down,
and also for performance comparisons.


- [x] get a test file running, doing the ... bootstrap chain
- [x] indicate how long it takes
- [ ] have them ... run their plugins too? Yeah.
  - so that tests run. and then ...
- [ ] and ... it looks like algw-subst isn't actually really slow??

## [x] Drag and Drop!!!
not perfect, but passable??

let's drag and drop baby. gotta have it.

- [x] HOVER Should highlight the parens
  - it's ... not perfect, for sure ... but it's pretty ok? I guess?

- [ ] TODO, `normalizeSelections` is a huge pain, I should just calculate once whether we're "reversed",
  and store that as an attribute on the cursor. `start, end, reversed`


- [x] cmd+click should select the whole thing
  - oh nice
- [x] cmd+drag should drag
  - [x] show the drag dest, lets abuse multicursor :D :D :D
  - [x] now make it drop... like its a spot

# What are things even cslled

LOLok

  (parse-1-args.json)
- parse-1-args.js for the parser (includes (, 1 2 3) -> (, 1 (, 2 3)) and (fn [a b c] d))
  (type-args.json)
- type-args.js ^ is type-1-do + the args

and algw-subst is type-1-do + the args + we're changing a whole bunch of stuff.

# Type Inference n stuff plans:

so what we want to report, from `infer-stmts2`
- hover: (map int (array type))
- annotate: (map int type)
  -> this is how we get "inferred annotations" for things like
    - let values...
    - function parameters...
    - def whatsits
  - so, these could get suuuper chatty, especially if I don't do a good
    job of ..shrinking them? like reverse-typealiasing.
    which shouldn't be too onerous, ... but
    anyway.

ALSO
ERRORS
should be of the form
(, string (array (, string int)))
that is to say, an informative message, and then
a list of "some text" and "loc" pairs.
I think that's the best strategy.

- [x] STEP 1 - make the change in algw-subst
- [ ] STEP 2 - get the typescript backend on board!!! with the goodness
  - [x] OH ok so I do want (lambdas) and (apps) to have array arguments. lets stop messing around.


ALSO
types should have not just one loc, but ideally multiple? ... so we can track herkunft.
but maybe I'll find even better things.

#

- [x] let-> should drop >>= (mapped to ti-then) in everywhere. thanks
- [x] thih working!
- [ ] gotta get deftype n stuff for thih going, so I can actually try it out.

- [x] Algorithm W, this time with a state monad
- [ ] DO I want to put non-(values) stuff into the monad? Or keep them on tenv...
- [ ] ok let's have the state monad keep track of all ... inferred types... by loc.


- [ ] WAAAAIT why am I tracking the "at" of ns paths????? STOOPPPPP ITTTTT


UGH the caching logic for getResults is so convoluted. :(


# type-1-cache =>


// Here's what we got folks

infer_stmts = [tenv stmts] tenv
add_stmt = [tenv tenv] tenv
infer = [tenv expr] type
externals_stmt = [stmt] (list locedname)
externals_expr [expr] (list locedname)
names = [stmt] (list locedname)
type_to_string [type] string
get_type [tenv string] (option type)






THIH

I really need ... type aliases. pleeease.
- [x] ok ... it's almost working? but not quite
- [x] ALSO lets get mutually recursive types to be
  evaluated at the same time.
  Which means externals needs to start returning `types depended on`.
  and ...

- [x] I want a "display" attribute on nstop

- [x] gotta be able to ...spread in front of a thing

- [x] allow you to "turn off" the output... probably by setting 'display' to 'none'...

- [ ] get a test going to actually verify that my "self-hosting" chain is contiguous.
  I've been playing fast and loose.

I REALLLY want to be able to drag things around

- [ ] I kindof want "collapse" to be ternary.
  - first level (just hide ns children)
  - second level (hide ns children & only render an uneditable summary)

- [x] type checking, let's infer the types of missing externals
  so we can make it much nicer to work with.


- [x] ok my good folks, its time for "extract this chunk"
  - which means, our little power-bar is going to get an upgrade, because woof it needs it

  - hrm
  - so ...
    yeah, let's try to get fancy, why not?
    we'll need some ... (include)liness.


## THIH

- [ ] potential issue: when I type multiple things together in the same bindgroup,
  I lose typeclasses somehow?


## Wish List

- [x] "jump to named thing" from the cmd palette
- [ ] "show type of thing at loc"


## What's the next step here?

Looks like cached evaluation is working, from what I can tell.
type-1-cache is winning.

- [ ] CLIPBOARD copy namespacesssss pleassee





## Doing a check on all the nodes

- wrapping doesn't work
  - annot (:)
  - tapply (<>)
  - ; comment
- a:b and a<b> doesn't work on an NS




##

Backspace vs cmd backspace
- so... cmd-backspace would be the new backspace


- [x] getResults
  - recalc compilation when self changes
  - recalc type when self or dep types change
    - soo ... do I need a closer handle on `type env`?
    - like, two different functions for "calculate type" and "add type to env"? probably.
  - recalc value when self or deps change

- [ ] I need to ensure that going from 'error' to 'not error' works
- [x] changing the name of the thing doesn't update the type somehow
  - so, if "names" changes, redo stuff
- [x] disallow multiple names with the same name

- [x] PLUGINS should still render even if there are type errors.
  maybe just don't do type inference on plugins?
  at least for nowwwww

- [x] ok, so now we're just doing addStatements ... all the time.
- [x] now that we have dependency information, and such:
  - the `fnsEvaluator` env should actually be the values, instead of
    a list of strings to be compiled.
    We can now know what things to inject, and we know we're doing it in the right order.
- [x] gotta have FullEvaluator expose a 'inferTypes' thing
- [x] so we can start caching the type inference of stuff
  - [x] anddddd if a dependency has a TYPE ERROR .. then we definitely can
    bail on doing evaluations.
    SHOULD WE in that case just keep using the cached values? Might as well, right?
- [x] THE FIRST run, isn't working quite

Ok, so how bout the `Evaluator` plugin config
be responsible for providing the javascript
involved in bridging the gap?
like, translating the names and such.
That would be quite nice.


# How to be demo-ready

- [x] need better perf on large documents (I think it's that I'm not memoizing toplevels)
  - [x] dont recalc on hovers
  - [x] ns Keyed on just ID (not path) so I can reuse much more
  - [x] make sure cover selection is owkring
- [x] need a `trace` function that can be accessed in-line

- [ ] includeee

# Getting tupled-builtins

OK so
so far I've been slurging the envs of the compiler and the runtime
which is bad mojo
now that they have different calling conventions.
SO

- [ ] give the runtime a different set of builtins from the compiler
- [ ] make tuply builtins ... it would be nice, to have the builtins be written normally, and then converted for the calling
  convention at issue.


- [ ] ergh, ok so in the tuplified version, we can't just have ...
  (deftype (, a b) (, a b))
  because it gets weird.
  SO this means, that `,` has to be EITHER:
  - special cased where it's a no-op, and a call to a builtin, OR
  - it gets its own AST node??? naw. can't be.




Conceptually
is it a little weird
that, as far as types go
most constructors get one thing
but tuples get too?

hrm yeah I think to really make it make sense,
I'll want a `ttuple a b l` and then constructors
need only to have a single argument.
[SPOIILERS: NOPE]


- etup a b
- ptup a b
- pcon a

But the big news for compilation is: If I want to do flattening
(where (lol a b c) is {type: 'lol', 0: a, 1: b, 2: c}) THEN
I need type information at compile time.
Which is not something I've needed so far.

Q: Should I produce a whole 'typed-ast'?

```
(deftype expr
    (eprim prim int)
    (estr string (array (,, expr string int)) int)
    (evar string int)
    (elambda string int expr int)
    (eapp expr expr int)
    (elet pat expr expr int)
    (ematch expr (array (, pat expr)) int))
```

but, like for each of these things, with the way
type resolution goes, I won't know what the fully
resolved type of a given thing is, until I've done all of the
substitutions.

would it be as simple as

```
(deftype (expr child)
    (eprim prim int)
    (estr string (array (,, child string int)) int)
    (evar string int)
    (elambda string int child int)
    (eapp child child int)
    (elet pat child child int)
    (ematch child (array (, pat child)) int))

(deftype plain (plain (expr plain)))
(deftype typed (typed type (expr typed)))
```

Yeah ok, so that's how to make the AST be able to carry types.
BUT that still leaves us with the problem of: "at what point
is a given type fully realized"?


but ... I guess I can ... hang on to the `subst` that I finally get,
and then do a `apply that subst to the whole tree`?
Yeah I guess.


OK FOLKS
I'm really going to make `(include "somefile")` a thing, I mean let's just do it.

Alsoooo how about macros? yay or nay?

like, the thread macros might be fun?











# WRITE A BLOG POST ABOUT CURRYING

Let's talk about auto-currying

(a, b) => c === (a) => (b) => c

Nice things:
If you have a function like (map fn list)
and a function like (defn do-something [a b item] ...)
where the final argument to do-something is the items of a list, you can do
`(map (do-something a b) my-list)`. Isn't that nice!
Much nicer than `(map (fn [x] (do-something a b x) my-list))`
Of course, it requires that the item in question is in fact the final argument of `do-something`.
Oh it's not? Well now we get to the wonderful world of "making programs really hard to read"!
Also known as point-free?
So you have a generic function that can take `(f a b c)` and turn it into `(f b c a)` or whatnot
so that `a` can be the last argument.
Really, I hate it.


- [ ] need a way to ... tell ... the whatsit that our builtins should use a different calling convention.

"parse-and-compile-2" = "can tell you to turn off the incessent loc sourcemapping numbers"
but ... also ... might as well have it be "builtins should use tuples" right?

ugh ok I'm just tired. Will sleep now.

BUT

next step is:


# TWO TRACING THINGS

- one, we want to report types of all expressions (oh but we'll need the final subst? probably? so maybe collecting a map is really the way to go... yeah it is, let's try to be immutable)
- then have a `trace` function that will alow you to change the bgcolor of an ID, or show a bubble, or attach a piece
  of text, or just show a general message. (console/log essentially)
- THEN when "top trace" is set, it'll record those, and like update the UI n stuff.
  ALSO you can like "scrub through" the trace ... seeing it animated. Yeah that would be very cool.

# OK

- So NSTOPs should indicate if we've got errors anywhere
- ALSO ... test failures?? hrmm 🤔
  - yeah I need a way to

OH
- [ ] NEED exhaustiveness checking, thanks

- [ ] I should really add a gut-check in the `compose-subst` to verify that I'm combining them in the
  correct order. e.g. that nothing in (earlier) needs to be applied to (later)

# Currying

IS IT a problem, for
(, a b ..())
to be different from
(, a b)
?

Ok, so I think the more ... theoretically pure version ...
is to always have a `()` at the end, and I think I have a better shot of
making that work. Once it's figured out, I can try to get fancy.


ARGH I changed too many things at once.

Turning off sourcemaps is nice, but annoying that it requires editor-side changes.

AND

making lambdas take patterns, also nice, but too mcuh I dare say.




# Ideas about currying

WHAT IF
fn args are always tuples
(, a b c) has type (, a (, b (, c ())))

andd

(, 1 2 ..) has type (, int (, int 'a))

So

(f a b c)

is the same as

(f ..(, a b c))

is the same as

(f a ..(, b c))

and

(f a ..) infers f as having type (fn (, a ?) r) and returns (fn ? r)

ooh it's so ... clean!

it also ... seems like ... it could open us up to a world where you
could pass in a record instead?


SOOOO WHAT ABOUT
passing in a single argument.
and receiving a single argument.
is it just like "it's a one-tuple, deal with it"? Is that ... necessary?

(f (, 1 ()))

(fn [x] y) -> (fn (, x ()) y)
(fn [a b] c) -> (fn (, a b) c) -> (fn (, a (, b ())) c)

(fn [a b] c) ... I do really like this better. and it's not being used?? right??
(fn (, a b) c)

OH Querstion. What about (fn (, a ..b) c) ? That has type ... (fn (, a b) c), where be could be anything?
which, idk good luck matching on that...
yeah I don't think varargs is really gonna be a thing.

(, a) -> (, a ())
(, a ..b) -> (, a b)
(, a b) -> (, a (, b ()))

(any way)

ooooh hrmmmmmm ok so... here's the sticky point:

(f a ..) -> (fn [x] (f a ..x)) -> (fn [x] (f (, a x)))

IF f is defined as (fn [a b] (+ a b)) for example
then it's (fn [(, a (, b ()))]) ... right?
in which case

(let [g (f a ..)] (g 2))
-> (g 2) would need to turn into (g (, 2 ())) NOT just being plain ol' (g 2)
🤔
HOWEVER, who says I need to end it with a `nil`? ... like ... no-one?

CAN I

(fn [a b] c) -> (fn (, a b) c)
(fn [a b c] d) -> (fn (, a (, b c)) d)
...
somehow I suspect it ... wont actually work, or something?
like
idk I would imagine that the inference doesn't mesh that way.

BUT
whos to say I can't try? Might as well I guess, because it would be nice for
single-arg functions to just behave normally.





...

OH OH also, for the "I want to pass arguments on to my child" you could do
(fn [a b ..c] (some-other ..c)) .. right?

...



ok back to the single-argument function.

(myfun x) -> ??? -> (myfun x). Right?
so like ... single argument invocation is the default
and multi-arg (invocation & matching) is syntax sugar.

(myfun x y) -> (myfun (, x (, y ())))
(myfun x y ..z) -> (myfun (, x (, y z)))


Now, potentially, the cool (?) thing will be
that I think we can get away with this not touching the type-checker at all?
which would be rad.


# GRAND MASTER PLAN

- [x] comment-out an ID
- [x] cmd-click already my goodness
- [ ] FIX SCROLLING so we don't hide behind the top bar ... how to do it. Probably have the bottom thing scroll
  instead of making the top thing sticky.
- [ ] TRACE TYPES THANKS
  - game plan: keep the tracer on `tenv'`
  - then do the tracing
  - add `type` info to the `result` of a node
  - IF an identifier node *DOES NOT* have a type, ... maybe like underline it?
    That can be a way to track down when typing failed, right? Seems legit.
    Alsooo this will allow me to track the progress of type checking, reporting how the types changed over time ...
- [ ] then ... hm ... oh that's right, ONWARD with my plan to change the parser to TUPLE_RUN_FUNCTIONS. Yes please.


## USABILITY STUFF

 The current type checker is functional, but (1) only reports a single error
 and (2) can't tell me where it came from.

 STEP 1 is to track a bunch more loc's so we can tell where things came from.
 STEP 2 would be to stop using exceptions, but that might mean I need to add like ...
 ... monads? or applicatives? something.


So, things I definitely want in a language, which are lacking from this particular one:

- let's not auto-curry.

# ???????????

WHAT IFFF

ok so what would it be like
if I did type inference on a given term
and just "held all externals as variable"?
Would that be super weird?
Like, then the ... re-type-checking would be ... more cacheable, right?
b/c I could just unify the externals with the inferred types of the externals.
...
OK so I'm guessing that type errors would be worse? hrm.

# UX Things

- [x] select multiple adjacent, and do a wrap. pleeeeeease

# Tracing, with style

- [x] I want to be able to attach a ... formatter ... to a trace.
- [x] and this formatter should be in-world.
- [ ] so right now I just have a fn name, but it would be better to do
  an arbitrary node. Which would mean ... allowing a ... root path .... that's
  not a `card`. That should be just fine, right? I mean navigation would have to
  fall back to dom-position-based (BTW why am I not doing that as a fallback in other places? ...)

# Planning the Blog Posts / tutorials

1) js parser + compiler
2) j3 compiler
3) j3 parser
4) improvements to AST for nicer DX
5) j3 type checker (HM)
6) add "match" support, and type constructors
7) support single-definition toplevel recursion
8) support multi-definition recursion, this will require doing dependency analysis.
  - YAYYYY love it
9) type-definition (multiple) recursion
  - will require dependency analysis to flag whether a name is a type or a value
  - ummm is there anything more complicated than that?
  - well ok this will enable verification of type definitions, which I'm not really doing just yet

ONCE WE HAVE THAT
...
What's the next step?
profit???

Like, I could write up a whole blog post about it.


# Back to inference for a sec

STEP 1
- bring back the `file to js` stuff
- have the server report a listing of available `.js` files

So `nil` should have type `array a`, right?
sounds legit

Ok, it ~looks like we have generic type constructors working?

# Plansies

sooooo
The source of the problem is multitudinous:
- having separate files is definitely not the endgame
- so everything needs to be in a single database
- BUT I want to be able to load only part of the database, because it'll be big.
  so: not loading the full history, not loading all definitions.
- AND undo/redo needs to make sense in a world where I'm loading up some definitions,
  editing them (possibly moving nodes between definitions), and then in another session
  loading up one of the definitions but not the other ones, and wanting to do "UNDO"s on it,
  or at least time travel.

SO THE PLAN
- each "toplevel" is ... its own .... database, roughly speaking.
  has its own map, with its own IDs (nidx, etc). Because keeping IDs unique when only partially
  loading the state sounds terrible.
- ALSO they have their own history list. so every toplevel, has a unique history stack.
  doing "undo" in an editor session, we look for the "most recent change" among all the loaded toplevels.
BUT ALSO
- there's an "editor state history stack", which records the pulling up & closing out of ... namespace roots(?)
  and like the creation of namespaces, the moving of namespaces.
  ugh I should probably be calling these things toplevels instead of namespaces.

each toplevel is like its own git branch, conceptually.

um anyway, to prepare for this, I would want to:
- refactor the getKeyUpdate logic to be less ... fragmented? idk
-


# OK FOlks now it's time to do ...
TYPE CHECKING OK


# TRACES
once again, I am at the mercy

So

(1) have a `traces` list(?) that indicates a list of LOCs that are my tracy boys
herm I mean I guess I could just use the meta. because, I can have multiple.
it ... feels more ephemeral than that though? idk, maybe it's fine.
(like I wouldn't want it in the undo stack? Is that weird? I'll leave it in, it's fine.)
because I can have multiple things I'm tracing, ya know.

OK
Also, relatedly, probably, it would be very nice to be able to say
"trace this /function call/" by which I mean trace all the args for me.
And so I could, if I wanted to, and the args were all serializable, I could
say "pop this trace out into the editor, so I can .. play with it" yes indeed.
You could even like make fixture tests out of it.


OOOH META CAN BE USED TO MANUALLY MULTILINE.

ALSO meta can be used to say "hey this ~array of lists, let's do table view my dawg"
I mean, tables could even have ... hrm ... like ... ok so it could have, "view functions" applied to them. hrm.

# BUGS
- [x] let's select a rich-text, ya know
- [x] ok at least we can delete rich texts
- [ ] OOH OOH, cmd-backspace to delete the whole word? maybe? idk
  and then normal backspace won't delete a whole list or things
- [x] NEWNODEAFTER from the Fixture plugin isn't working now

# NExt step:
- [x] history collapsing, really now
- [x] fix the history regression, probably by checking timestamps on the most recent history item.
  - OK I think a size check is sufficient. It looks like it's just a weird interaction between
    my state loading/saving, and HMR. So it won't impact a production build.


# RICH TEXT NODES

we already have a rich-text, for what it might be worth.
'' ya know
- [x] so rich, such text

- [x] oof I really need to trim down my stored files. Like, maybe do aggressive history item collapsing?
  - [x] FIRST Basic history collapsing, where all changes to the same node that have fewer than 200ms between them just get collapsed.
    - ALSO ~all adjacent changes to a rich-text just get collapsed ... because I don't have a more memory-performant way of storing changes to them. Although it's definitely possible.
  - [ ] SECOND Aggressive collapsing that maybe only triggers once the state gets larger than (idk) 3mb or something
    - Could be "by namespace". Like, going back (1000 changes) or (1 day) or (3mb), whichever is ... more ...
      we collapse all changes that happen within a given namespace together into one historyitem.
    - Yeah I like that quite a lot.

Ok, so type constructors.
Could I just do
```
evar - [string int] - expr
cons - [a] - (array a)
; OK so
tconfig = (tconfig (set string) (array type) type)
tenv = (tenv (map string scheme) (map string tconfig) (map string (set string)))
```
I'll ... need to ... hang on to ... the free variables.

# Literate literating. Pretty please.

This will require:
- ordering things by dependencies, so we don't get out of order issues.
  This will also allow us to do ~minimal compilations, and only update "results" that need updating.

### STEP 1
Make a Node type that is "rich text". It can be flagged as either a comment, or something that should be ... ... ... represented as actually a thing.
I might want to Store as [blocknote_json] or whatever, and then have it represented as either (a) a comment (b) markdown or (c) some in-universe rich representation like unison has. And that would be selectable on the node, I should think.

RELATED a little bit, I want to be able to `;` comment out any arbitrary node.
Like, would that mean that `;` comments become obsolete? Or ...
Maybe `;;` two semis means "old and boring comment", whereas `;` is just a "this can comment something out".

anddd

how do I trigger a rich text node? maybe ''? idk sounds fine to me.


- [ ] DRAG and DROP any arbitrary node pleeeeease and thank you.
  Would it be just like 'press a key'? Hm yeah I like that. alt+click? sure

##

- [x] I want let to be recursible
- [ ] meta changes appear to not be triggering a save?
- [ ] errors change not triggering a rerender
- [x] BUG backspace on empty comment not working
- [x] FEAT please let me split an identifier, I need it desperately.
- [x] FEAT ok backspace to join identifier

- [x] cmd-D to multicursor, you love to see it
- [ ] subtle highlight things that are the same?
- [x] select & type, replaces the selected. FINALLY
- [x] MULTI EDIT YALL

letsss do a little multicursor?

##

DID I ... do it wrong?
Is `ns` like ... the wrong ... thing
oh wait no. It is important that it be different. I'm pretty sure.



# Source Mappppppp

- add comments
- then we can do whatsit
- [x] ok also, I want to be able to /comment out/ a node, like clojure.

- [ ] Fixtures, let's be able to reorder them by dragging
- [ ] HOVER PAIRS pleeeeease


So now that i'm tracking the info, and even compiling it in ...
I want to ... be able to mark ... a certain NSTop as the "trace focus". Right?
and so, when executing this one, we'll turn traces on, and collect the stuff, and even like

anddd probably allow you to hover a tracer, and have it render out everything it saw.
Yes that sounds great.

# TRACE
I'm done not having insight
when I could have it so *easy

PLAN:
- the ... compiler ... gets a map ...
  and any expr might want to be wrapped.

(@@' abc) -> gives you (, (@@ abc) (map of any traces))

META:
- trace?
- (also) we can do a `coverage` dealio

# Typeings!

I think perf is in a reasonable spot.
Now let's do Algo-W step-by-step!
For that it looks like I'll want:
- maps! I mean I don't *neeed* them strictly, but it would be nice.
anddd sets? like why not, right?

```
(set/nil)
(set/add s k)
(set/rm s k)
(set/merge a b)
(set/diff a b)

(map/nil)
(map/add m k v)
(map/get m k)
(map/merge a b)
```

# N4xt up

- [x] perff ok so I'm still doing ... too much stuff
  - [x] ah ok, so I'm doing getResults on everything.
    OK folks. Here's the story.
    - [x] First off, gotta not do new results for selection changes.
    - [x] for betters, we'll need to ... debounce ... the getResults. ok y'all.

- [ ]

- [x] perfff only render what changes, for crying out loud
  - So, have a `Context` to access a `store`, that keeps track of the current `state`
    and has listeners for nodes and stuff
- [x] BUG WHY does edit not work
  - AHHH hrmm.
  - So, I think it's the fact that we're doing useEffect, and it's happening too late.
  - Yeah, we're delayed.
  - Soooo options:
    - have the Cursors do a jitter if it can't be in the place at one time,
      wait a sec to try again.
      - that might make my auto-find-a-valid-pos code be weird. Will have to tie it in.

  - [x] ah hah hah hah
    yes folks. here we are.
    instead of React.useReducer
    NAILED IT. So good.

- [x] INNER SEL we needs it
- [ ] TRACE ok so I think what I want is for it to be *separate* from the AST
  because having e.g. the capacity to drop a trace on literally anything (e.g. a pattern)
  would complicate things a ton.
  So, a compiler would just have access to a `map` (ok so we need `map`s) that would tell you
  whether a given `loc` had a `trace` on it.
  which means my parser needs to be preserving locs? yes that's what it means. Should be quick.
- [x] Let's get self-2 (or parse-1) working as an Evaluator, that can then save the .js to disk.

- [ ] attt some point, I'd like to represent the JS AST so I can do some optimizing passes? idk could be fun

# Grand Plan

1. [x] basic bootstrap, bare bones AST
2. [x] (self-1) basic self-compile, same AST
3. [x] (self-2) self-compile the self-compile (no code change prolly)
4. [x] (parse-1) self-parse, no real error handling or source mapping
  - [x] Need to do a `generate CST -> jCST` person
  - yassss now we have destructuring of fn arguments baked into the parser! which is nice.

- [ ] add basic fallthrough cases everywhere.
- [x] use parse-1 as an evaluator
- [ ] start ... into typing? yeah that sounds about right.
  pleease give us some type checking. we needs it badly.
  also autocomplete, right?


PROBLEM render memo, looks like.


(equot ...)
... do I have the capacity to do a ...


WHAT IF
I ... do some imports?

...
?. Once we have effects, orr maybe just basic monads,


- [ ] BUG paste with strings with `${}` doesn't work right! Need to fix the lexer
- [ ] BUG paste "\\\\" doesn't close correctly. Need to check the number of '\\' and only
  block closure if it's odd.

ok so what if, you could like "tag" a toplevel definition.
with an arbitrary tag like ":parser".
And then there was .. a macro or something, to say
"grab me the array of definitions that match this tag".
That would be pretty dope actually? I think?
it would want to be namespaced
and probably ...




OK so I would love to have fancy automatic (type-checked)
magic for a `(@matcher (@ (if :cond :yes :no)))` kind of thing,
that produces a function
`(fn [node] [None (Some {cond Node yes Node no Node})])`

anyway
that'll have to come later
I mean
maybe I'll
...
hrm
ok so I do need type checking at some point
anddd gotta be nominal types until I get structural
so that's a little vexing.

ohwait
I could do

`(@matcher (@ (if :cond :yes :no)) (fn [cond yes no] (tif cond yes no)))`
That won't require custom types n stuff.
Ok so it's somewhat approachable.

but yeah, first I need to move the parser to jerd
yeah.







Ok, so I want to be able to use `if`s.

Which means.
I need to be able to change the AST
which means
I need to do the parsing in - universe
which means
I need to autogen translation code, and syntax, for the CST

right?

`export type tapply = {type: 'tapply', target: Node, values: Node[]}`
becomes
`(cst/tapply node (array node))`
->
`{type: 'cst/apply', 0: node.target, 1: wrapArray(nodes.values)}`
right?

also, string|number => is just string.










------------


- [x] BUG backspace on the output of a fixture puts us in a BAD path, where deleting the (, )
  tuple deletes more than it should.
- [x] FEAT space after an output should add a fixture, thanks.


Thinking about translating sum types into GLSL
as long as it's non-recursive, and doesn't have
arrays, we're good? I think?
oh so I should think more about fixed-length arrays.
because they can be quite useful.
So, functionally they can be similar to a tuple-type,
right? Like a little bit?
Except that you can't really `map` over a tuple type...





- [x] backspace at start deletes the NS

- [x] goLeft should accept a `regs` map to determine valid positions
- [x] Ok folks, navigation (left/right) is looking quite nice. We can give accurate
  paths, and we keep going left/right until we get somewhere good.
  Now, there is the little matter of being able to get to selections that don't go anywhere.
  - [x] I still need to put something in for that.
  BUT
  - [x] the bigger UX thing is: I want to press "enter" after an "output", and produce a new
    line of fixtures. How hard can that be?





- save the compiled result of a thing to disk as well,
  so that we don't have to do the full bootstrap chain
  when wanting to use something as an evaluator
- we'll probably need to do a CST conversion to make it
  legible in the runtime, however we slice it, because I don't
  want to be prevented from using the attribute `type` ...
  right? well, I guess once we go full structural, that won't be
  a problem anymore? Except, we'll need to do a conversion then as well.


# Pluginss

- [ ] editing all the places needs to work, including:
  - [ ] delete the test case
  - delete any thing
  - goLeft
  - goRight
  - if navigating gets us to a place that doesn't have a rendered node,
    switch the selection up the chain until we find something that works.
- [ ]

# Fixture plugin

- [ ] Full experience:
  - [ ] case with no expected should have a button to adopt the output

- [x] BUG space at the start of a node results in the WRONG PATH

# Switching Evaluatorss

So, it seems like I might want
to be able to switch between "evaluators" for a given sandbox document.
Yeah, I might want that very much.
So, I can develop a dealio in one tab
and then use it in another.

yess that sounds good.


- init () -> Env
-


Ok, now that I have an evaluator ... I can
do my plugin dealio?







- [x] hover to show errors pls
- [ ] can't delete a spread???
- [ ]

Test
Cases
let's talk about it.

So basic normal idea is: have expressions that are children of a definition or whatnot.
and you can choose to display them in a certain way

Buuuut then I was thinking
what iff
especially for a function with lots of exit points
what if I had like
a "trace test"
which had

(def compile [expr]
  (match expr
    abc def
    (evar name)
      (@trace-test
        (sanitize name) ; the real impl
        [
          (, (compile (@ lol)) "lol")
          (, (compile (@ a-b-c)) "a_b_c")
        ]
      )
    ghi jkl
  )
)

So, I kinda
want to be able to put named tracers
on things
and then have like a "compile with tracing"
which would give you access to like this trace context
and things would put info on the trace context
with the names
and you could specify whether it's a "last write wins"
trace, or a "append to array" trace, or a "keyed" trace
(with lrw or array for contents)

anyway then `(@trace-type some-fn)` would give you the
struct type of the trace. And the struct would be
keyed by the hash of the function that produced the trace,
probably.
`{(hash some-fn): {name-1: value, name-2: [v1, v2]}}`

Anyway, then you could also do `(@trace (some-invocation))`
and it would give you the trace for that invocation.
Probably the trace object would also have the `result`
on it?? That's what I think.

So you could make a little visualizer dealio. That takes the trace
and visualizes it. That would be the bomb.

OK but let's think about the test case table
would be super nice.
Is there something special going on here?
It would just be like
[(, a b) (, c d) (, e f)] under the hood, right? `(array (, input output))`?
OR `(array (, input (matcher output)))`? Not sure how that would look.

oh, a `(matcher T)` is `(T) -> bool`, right? or rather `(T) -> [(Ok) (Error string)]`.
So that's fine.

OK, but then, how do we decide to render it as a table?
Do we just inspect it, notice that it's a literal list of tuples, and allow that to
be a renderer?

So then, actually, any list of tuples could be rendered as a table, right?
Ok but the catch here, is we're *executing* it in a special way. No longer
just passing the whole thing to `compile`, but instead
walking through it, running the one side ...
OH
but
yeah ok, in this case I do want to pass the values to the thing, right?
so
```js
(, (fn [input] output) (array (, input output)))
```
Which would be rendered with like
[ the thing to run ]
[ input | output ]
[ input | output ]
[ input | output ]
[ input | output ]
[ input | output ]

Yeah, that makes sense, right?

So, we've got a `slash` item called `test cases`
And that toplevel then gets a whatsit
where we know it's going to be rendered by the certain plugin dealio.

And the plugin gets to decide how to render it.
And also defer to normal rendering for child cells.

Would it fit within NNode structure? Or work outside of it?

OK yeah it would probably be best to work within NNodes. Maybe extend the
type a little to allow for fancier drawing n such.
And have a "black hole" nnode type, for e.g. a wisywig markdown editor?
But yeah, having a `box` NNode type that allows you to do some styling...
seems like that ought to work just fine.

###

- [x] left hover
- [x] oh gotta get undo under control
- [x] arghhhhh okkk okk I'll cave, we can do id-based cards and namespaces. I agree that indexes are the worst. alright already.
- [x] redo nested drag
- [x] do a thing to verify that we're not missing any nodes
- [ ] figure out how to mark the tests in the NSssssliness
  - maybe a "render" attribute of a RealizedNamespace?
- [ ] goLeft and goRight need to know more about namespaces
- [ ] backspace at the start of a namespace currently deletes that namespace. which is bad.
- [x] teach serializeFile a little about namespaces
- [ ] ok we still have a huge perf issue though
- [x] make it so when you type `(def)` it doesn't torch everything


# Night thoughts

- [x] cards
- [x] make it so you can make more namespace dealios
- [x] space/enter to create new NS entry
- [x] backspace to delete one
- [ ] hmm selecting... across ... namespaces ... probably shouldn't do itemwise selection.
  but tbh it's fine for the moment? maybe?

- [ ] drag anddd whatsitttt with a handle on the left

- [x] ahhhh waittttt
  I forgot that I was adding two layers, not just one.
  we have cards, and then we have namespaces
  anddd I actually wanted all of this nonsense to be inside of a namespace.
  not in all separate cards
  this is madness.
  - [x] ok, fixed that at least

So
I want a little tree
with expressions as children of definitions
and, sure, definitions as children of ... Headings / text blocks
do I have a reason to say that Headings / text blocks should be anything other than ... expressions?
yeah, I think I do. Anything that's a parent should be named. So that the names can form an addressable namespace.
Ok next question. How is this ... naming ... represented?
Sorry, I mean .. .this treeliness. And do we have a way of preventing duplicate names?
I think name duplication can be tracked & resolved separately.

Andddd maybe it's ok to have a ... set of "toplevel ids"
and then a separate structure ... indicating where toplevel ids live.
with nodes
and such.






Ok do the editor, I want it to be a tree
And expressions also live in that tree
Like you can make some repl evals the children of a defn. And then your can mark them as "test cases".
Anyway so your like editing UI can have just one root and children, or your can pull something out to be it's own root
Also when expanding a thing that has children, it first just shows things collapsed. So names of defns, status of test cases. Probably test cases status would be shown recursive too.
Test cases have "matchers". The simplest is just "equal to this expected"
But there could be more complex, e.g. fuzzy equals on floats, or ignoring certain fields.
You can also have a ... "Showcase". Which isn't a test case, necessarily. And might display in interesting ways.


Space in the middle of a token needs to split it.
Also I need vim normal mode. And git commits maybe.
Paste isn't totally working, need to check on that.
Also the renderNodeToString needs to escape a little more.



- [ ] the perf is currently terrible. Who's fault is that?
  - RenderNNode...
    - I want a RenderRoot that
    - takes the map
    - and makes listeners n stuff

- [ ] what abouttt having `..` as the final argument to function application mean "this is partial"??? hmmmmm??
- [ ] verify that pasting in the whole contents of a file parses like I expect
  - so like, a test.

# Next up:
- [ ] save to a ~literate format
- [ ] hmm do I want to get tests going already?


# So, pasting...
I think I want to do a little bit of pre lexing
yeah that's nice.

OK so a weird issue, is that


ok so now I have all of these things, and frankly I want them
to collapse

oh hey I could just do that.

> Pasting into a string, should just be flat

# SELF_HOSTING

We're hosting some kind of self, that's for sure.
So the bootstrap runner is running the code, and we are successfully
executing the bootstrap!
Annd now we've got the full wrap, it looks like.


Checkpoint 1: we can self-host compile, with some external builtins
(We might want to have some pre-steps to this, where we start with a truly basic AST? idk)
like just the lambda calculus. But then we need to add in algebraic data types & pattern matching to actually represent the current code that we have.
Yeah so it's like, we're executing this on some test files, fibbonacci function and such.
And then we beef it up to handle matches. Love it.

Ok, so next step is:
let's get going on the web interface, why am I slumming it with the cli

andddd let's make a little web server to persist these because we can't rely on localstorage.

AND THEN:
make type inference a thing

AND THEN FINALLY:
let's get labels into these typedefs

```clj
(deftype expr
  (eprim :prim prim)
  (evar :id string)
  (elambda :id string :body expr)
  (eapp :fn expr :arg expr)
  (elet :id string :init expr :body expr)
  (ematch :target expr :cases (, pat expr))
)

(deftype prim
  (pstr string)
  (pint int)
  (pbool bool)
)

(deftype (, a b) (, a b)) ; equivalent to (, :0 a :1 b)

(deftype stmt
  (sdeftype
    :name string
    :constructors
      (array (, string (array
        ; if this string is "", then it's anonymous
        ; ohh wait nvm we'll say if string is a number
        ; like "1" or "0" then it can be used in anonymous
        ; mode.
        (, string type)))))
  (sdefn :name string :value expr)
  (sexpr expr)
)
```



# Ok, so one idea: making a massive tutorial dealio
"Type inference from the ground up" or some such
where we're making a succession of type inference algorithms
using only the features made available by the algorithm of the current section.
Such that we are self-hosting, if you will.

Sooo it looks like I would probably want, the ability to do anonymous
a little bit if I want.




# Thoughts from eyg conversation

- do I want to lean into "code is ship-aroundable"?
- Effect types! Color lines of code based on what effects they do

multiple syntaxes??
but then: lambda-calcuilus wasm
"getting started guide is write your own interpreter"




# Reading through this slide deck
https://www.irif.fr/~gc/slides/sigpl19-slides.pdf
on polymorphism and such.

CAN we represent EXTENSIBLE RECORDS as TYPECLASSES?
I mean probably not rite

{x 1} has type x_int w/ an instance of getX that returns int??
{x 1 y 2} has type x_int_y_int
lol yeah this is probably no good.

oh hey, this is nice: an algorithm for determining whether two types have a subtype
relation, in the presence of recursive types: http://lucacardelli.name/Papers/SRT.pdf


oooh types for elixir? https://arxiv.org/abs/2306.06391
and an example: https://typex.fly.dev/
hm maybe not all that useful.




Set Theoretic Types for Polymorphic Variants
https://www.cduce.org/ocaml/bi







# Visualize and compare!!!!

- [ ] ok so I need to normalize the Expr representation at least, so that I can visualize them
  - or just make another mapper, that's fine

ok um so instead of all that

what if I just have things be totally linear
and then
render stuff above where they are.




# Howww do I do recursive polymorphic variants?
def something I need.
prolly should check out roc's type inference, see if I can grab it

# This slide deck sounds interesting, maybe?
https://www.cs.ox.ac.uk/ralf.hinze/WG2.8/27/slides/jacques.pdf


# So
we have polymorphic variants
and records


given that mini actually supports
a bunch more stuff
and like probably recursive types? I hope?




# More things

https://dl.acm.org/doi/10.1145/3009837.3009882 - Polymorphism, subtyping, and type inference in MLsub
because subtyping! I'm very interested.


Polymorphic Type Inference for Dynamic Languages
- https://www.irif.fr/~gc/papers/dynlang.pdf
- online: https://poly-dl.github.io/poly-dl/
- so they present the recursive definition for `flatten` as taking *300ms* to type check, which, like
  that seems like a very long time.
```ml
let rec flatten x = match x with
| [] -> []
| h :: t -> concat ( flatten h ) ( flatten t )
| _ -> [ x ]
```
this is not a large function.

[Luau](https://github.com/Roblox/luau/tree/master) structural types, and subtyping, and inference.
might be interesting to look into.

# Ooh this looks like it has both record & variant extensibility

https://github.com/willtim/Expresso



# Projects to look through and maybe copy

- https://github.com/Steell/DynamicStatic
  - type inference prototype. Supports subtypes, type unions, function overloads, and recursive types.
    -> ehhh this looks really suspect. I feel like function overloads would obscure a ton of type errors
- https://github.com/ameerwasi001/CzariScript
  - type system that supports subtype inference with parametric polymorphism, classes, objects, and single inheritance
- https://github.com/Storyyeller/cubiml-demo
  - tagged unions, records, mutual recursion
    -> hrmmm the fact that it doesn't permit type classes is maybe a dealbreaker for me.
- https://bitbucket.org/structural-types/polyte/src/master/
  - "parametric polymorphic subtyping"?
- https://www.normalesup.org/~simonet/soft/dalton/index.html
  - type inference with structural subtyping
- https://github.com/CrowdHailer/eyg-lang/tree/main
  - lots of good things, including algebraic effects
- https://kyagrd.github.io/mininax/
- https://kyagrd.github.io/tiper/
  - type inference via prolog rules!
- https://github.com/Ekdohibs/joujou
  - algebraic effects and handlers with multishot continuations, and a static type system with inference of types and effects, with subtyping.
- https://web.cecs.pdx.edu/~mpj/thih/thih.pdf
  - typeclasssessssss





# Practical type inference for arbitrary-rank types

https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/putting.pdf

this was recommended as a very accessible paper about type inference.
and here's a great description of how to read type inference rules:
https://cohost.org/prophet/post/2248211-how-to-read-inferenc

# "Essence of ML Type Inference"

https://pauillac.inria.fr/~fpottier/publis/emlti-final.pdf
http://cristal.inria.fr/attapl/ - download here
docs https://yrg.gitlab.io/homepage/static/public/mini/

https://www.cs.tufts.edu/comp/150FP/archive/francois-pottier/hmx.pdf



.......


soooo how to trace the solving step stuff? hrm.



# Applicative something?
https://gallium.inria.fr/~fpottier/slides/fpottier-2014-09-icfp.pdf

https://gitlab.inria.fr/fpottier/inferno/-/tree/master/
https://dl.acm.org/doi/10.1145/2628136.2628145


# Check out the PL Zoo
https://plzoo.andrej.com/


# Ki Yung Ahn

https://github.com/kyagrd/mininax/tree/master

hmmmm what about prolog as the inference engine?
https://kyagrd.github.io/tiper/



# Parametric subtyping

https://bitbucket.org/structural-types/polyte/src/master/src/
https://arxiv.org/pdf/2307.13661.pdf

# HM(X)
https://www.cs.tufts.edu/~nr/cs257/archive/martin-odersky/hmx.pdf

ok I kinda want to try hm(x).
update, did try it, at least porting https://github.com/naominitel/hmx/tree/master
which is great
nowwww I want to try to add subtyping, but that will require
me understanding the actual paper I think.
b/c the paper proposes SHM(X) which should support
subtyping. Right?

# Structural Subtyping - Simonet
https://people.csail.mit.edu/kostas/papers/subtyping6.pdf
https://www.normalesup.org/~simonet/research/index.html
https://www.normalesup.org/~simonet/publis/simonet-aplas03.pdf
https://www.normalesup.org/~simonet/soft/dalton/index.html


# Let's try this
https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0956796800000113

# Wand? With polymorphic let?
<!-- eh, if it cant do subtypes I'm not really interested -->
https://www.cs.uwyo.edu/~jlc/papers/CIE_2008.pdf
https://github.com/Javyre/wand-plus/blob/master/src/wand-plus.lisp
https://github.com/mrandri19/Wand87-A-Simple-Algorithm-and-Proof-for-Type-Inference/blob/master/inference.ml

# cubiml
https://github.com/Storyyeller/cubiml-demo
https://www.cs.tufts.edu/~nr/cs257/archive/stephen-dolan/thesis.pdf

# Other things
https://www.cl.cam.ac.uk/teaching/1415/L28/type-inference.pdf

# Coercive structural subtyping??
https://www21.in.tum.de/~traytel/papers/aplas11-coercions/coercions.pdf
hmm this is interesting. adding coersions so you can then use normal HM.

# Algorithm J : The Explanation

So I should go through algorithm j
and ... make a description for it?
lol or like an interactive explanation?
that would catch on like anything. ppl would love it.

--> Ok, so algo j is super nice and sweet, buuuut it doesn't do subtyping.
Q: Can I coerce it into making subtyping work?
A: I should probably understand it better before I try that.

b/c I want records, and enums, and both of those want structural subtyping.

# Branch: infer-more
So, we want a test dealio,
where we don't actually have `Ctx` at all, right?
This'll need a new UIState, I think.


- [x] get us the hovers pls
- [x] make some tests for alg-j
  - [x] catching errors
  - [x] testing features
- [ ] then see how many of the features that I want I can add
  - [ ] array literals
  - [ ] record types & literals
  - [ ] enumsssss is there anything fancy there? unification is a little more interesting maybe?
  - [ ] how do all of these things interact with non-explicit type variables?
    - maybe it would be like a linter thing, once you've written the stuff, and it's like
      "this vbl is free, do you want to make an explicit dealio for it?"
  - [ ] can I haz type variable bounds?
- [ ] like, for looping n stuff it'd have to have explicit types I think
  - so, would need @loop:t? maybe? would be nice to not need it...







---

Random naming ideas:
- choux
  - ooh it's actually free on npm? wow
- flora (although floralang is like some film director?)
- mala (bad in latin, spanish)
- mori (memento mori)






------------------------------------



I'm back to the conundrum
of
how to make my task thing
work better
idk
like
can it be less of a magic
e.g. representable through macros
or something.

```clj
(hi 10)
(#hi 10)
; what

(@task ('log string ()) ())
->
(@loop [('Return ()) ('log string (fn [()] @recur))])

(@task [('is-available string (Result bool ['UnableToCheck]))
        ('log string ())
        ('Failure [('InvalidLine string)
                  ('NameIsTaken string)
                  ('NotAnInt string)
                  ('NotABool string)])]
  Person)

(@loop [('is-available string (fn [(Result bool ['UnableToCheck])] @recur))
        ('log string (fn [()] @recur))
        ('Failure [('InvalidLine string)
                  ('NameIsTaken string)
                  ('NotAnInt string)
                  ('NotABool string)] ())
        ('Return Person)])

; BUT once expanded into @loop/@recor, merging is more complicated,
; or rather merging doesn't merge the @recur's.

(@loop [('Return ()) ('log string (fn [()] @recur))])

(@loop ((tfn [t] [('Return ()) ('log string (fn [()] t))]) @recur))
(@loop [('Return ()) ('log string (fn [()] @recur))])

(@loop [
  ((tfn [t] [('is-available string (fn [(Result bool ['UnableToCheck])] t))]) @recur)
  ((tfn [t] [('log string (fn [()] t))]) @recur)
])

; SOOO WHAT does this do for us?
; I think it allows us to treat things as more opaque, right?
; Like I don't have to reach in there and fiddle with a @recur
; I'm just adding things.
; SOOOO is there a function (or macro I guess tbh)
; that would take

[
  (tfn [t] [('is-available string (fn [(Result bool ['UnableToCheck])] t))])
  (tfn [t] [('log string (fn [()] t))])
]

; and produce

(@loop [
  ((tfn [t] [('is-available string (fn [(Result bool ['UnableToCheck])] t))]) @recur)
  ((tfn [t] [('log string (fn [()] t))]) @recur)
])

; ?
; Importantly, I hope,
; one of the items could be a type variable,
; and it like would be fine.
; that is to say
; (Effects @recur)
; assssslongggg as I have `kinds` though.
; because Effects would need to be of kindd * -> [..] amiright.
; although honestly could I do a bound that is a tfunction type?
; ???
; seems like a possibility, right?

(defn task/to-result<Effects:[..] Errors:[..] Value> [
    task-top:(@task [Effects ('Failure Errors)] Value)
]:(@task Effects (Result Value Errors))

  ((fnrec [task:(@task [Effects ('Failure Errors)] Value)]:(@task Effects (Result Value Errors))
    (switch task
      ('Failure error) ('Return ('Err error))
      ('Return value) ('Return ('Ok value))
      otherwise (withHandler<Effects Value
                    ('Failure Errors) (Result Value Errors)> otherwise @recur)))
task-top))

; ok so under the new system:

(defn task/to-result<Effects:(tfn [t:[..]] [..])
                     Errors:(tfn [t:[..]] [..]) Value> [
    task-top:(@task [Effects ('Failure Errors)] Value)
]:(@task Effects (Result Value Errors)))

; honestly I'd probably define a type like

(deftype taskArg (tfn [t:[..]] [..]))

; adnddd is there a way to make the other thing easier as well?

(deftype task-single
  (tfn [??? input output]
    (tfn [t:[..]] [(??? input (fn [output] t))])))

; lol ok this is where we just want a macro, right?
; although do we really need it? Perhaps. When we're
; specifying an arg for to-result maybe?
; although, bear in mind that the argument
; for to-result is currently (and ideally)
; inferred. From the type of the first argument.
; soooo we still need a way of un-wrapping the effect,
; right?
;
; Anyway, the unwrapping ... would need to handle the loop/recur, right?
;
;
; So, one issue with that...
; is that I would be allowing a tfn as an item of a union
; which isn't a tag or union. hmm.


(task-single 'log string ())

(defmacro task [arg1 arg2]
  `(@loop )
)

(@loop ((tfn [t] [('Return ()) ('log string (fn [()] t))]) @recur))

```



------------------

So, how were things broken up again?

I had this editor dealio, that is working
with a mostly-lisp representation.
Anddddd then I have a ... parser? From the lispy
into a TAST or somethign?

CST = lispydeal
AST = typed, real talk

and I have functions to convert a given dealio
from CST to AST and back

honestly I wonder if I could simplify the CST
to be like
- parened left='[' right=']'

and it's like
how hard is this anyway
anyways
um



---------------

1u +1 1.1
"ø ${10}" #x01abcd

int/uint/float
bool/string/bytes

(array Value L=uint)
(map Key Value)

texture (? maybe just in glsl world? idk)



uint is the type
0...
int is the type
...
float is the type
...f

(range [Inf (Int int)] [Inf (Int int)])
(urange uint [Inf (UInt uint)])
(frange [Inf (Float float)] [Inf (Float float)])

--> you know, having these `range` `frange` and `urange` types
could work out ok. I'd just need to set up
rules for how they are subtypes of int / uint / float
b/c it would be far weirder for a random record type
to be a subtype of int.

anyway, so type syntax of
0..1 would be kinda nice
lol also runtime syntax letsbehonest

[q: do we mess with having unions of ints and ranges and stuff? hrmmm. no. not at the moment at least]



Literal Types
- identifier
- number
- bool
- string

- builtin "name"
  - int/uint/float/bool/string/bytes/any/none

- (t t t)           // apply
- (T t t)           // tag
- [t t t t ...]     // union
- (@loop @recur)    // recursion
- (@task t t)       // task...
- (fn [a:t b:t] t)  // fn
- (tfn [a b:t] t)   // tfn
- {name t nother t} // record

~math types~
- a + b
- a - b


(so, I want a system where I know, as well as I can,
the type of the thing expected under the cursor)













- apply T ...T
- tag "name" ...T
- union ...T ?open
- task T T
- fn ...name:T Body
- tfn ...name:?T Body






## Things I could cut out

- bool could be [True False]












# Ok so a roadmap

- [ ] so, in the sandbox ... you can skip the prefix, right?
- [ ] oooh ok, so when you're editiing something, I want everything from the same
  namespace to be in a box together. That's a great solution.
- [ ] a sandbox can have namespace shortcuts (aliases)
  -> and those aliases can be taken into account

So, my architecture at the moment is really geared toward maybe too much caching.
Would I build it differently if I knew from the start that I didn't really need (or want)
to cache within a given sandbox...


Things I think about:

- algebraic types are cool
- is there a way to desugar
  and resugar
in such a way?
that type inference is simpler?
easier?
idk.

Also, my effects system requires a cheat.
it requires a type macro that can't be expressed
in the type system itself
even accounting for loop/recur types.

isss there a way to ... expand ... everything out ...
such that type inference is trivial?








---

Hmm what am I doing with this?



# Macros and such

So, unison just released a feature, "structured find & replace"

```
incrementAndEtaReduce x f =
  @rewrite
    term x + 1 ==> Nat.increment x
    term (arg -> f arg) ==> f

eitherToOptional e a =
  @rewrite
    term Left e ==> None
    term Right a ==> Some a
    case Left e ==> None
    case Right a ==> Some a
    signature e a . Either e a ==> Optional a
```

So that's kinda cool, but I'd rather have
a little less magic

```clj
(defn incRule [sym]
  (let [x (sym "x") y (sym "y")]
    {find `(+ `x 1)
    replace `(Nat.increment `x)}))
; ok, so how to stay pure
; right
; like ... maybe I just use .. a special syntax idk
; ok so passing in a `sym` function is maybe the way?
```

hrmm
so, the "we need a way to bind stuff" is definitely
a question.
I guess I could use an effect as well.

```clj
(defn incRule []
  (let [x (! sym "x")
        y (! sym "y")]
    {find `(+ `x 1)
    replace `(Nat.increment `x)}))
```

And then ... we just need a "sym" AST node.
and then we're good? I think?

I can have a `rewrite` function that takes
a `AST` and an `array (fn [] (@task [('Sym string AST)] {find AST replace AST})` and then rewrites??

So, I'll want to import the AST whatsits ...
... and like think about libraries and sandboxes some more

What can I think of as a good little macro example?






# WebGL Stuff
https://github.com/oframe/ogl

# TESTS FOR YANKING

- because my dealio obvs isn't working all the time
- [x] in complete.test, maybe just yank everything? and verify that everything still works?
  - so, start with a fresh library each time
- [ ] now fix the yanks that don't work

hrmmmmmmmmm so
expandEnumItems ; I've got a `local type`, but ...
it's from a ~global item, so the local type isn't mapped.
I would ... want to ... like poison "local" types from global
items, because I shouldn't be able to reference them, right?

What's a simple test for it?




Ok, so `tryToInferTypeArgs` is trying to access localMap
but this map isn't local.
so
how do we deal with that.







# Context-sensitive refactors

- [ ] `(tfn [...] (fn` -> `(fn<...>` and back
- [ ] `(def x (fn` -> `(defn x` and back
- [ ] `(def x (@loop (fn` -> `(defnrec x`

# Some stuff

- [ ] trying to get `yank` to cover all the bases.
  I should probably write some tests??
- [x] deleting the whole of a node should delete it
- [x] rename a sandboxy
- [ ] [library] on hover of a thing, show the thing in like a popover
- [ ] on click of a thing, drop it on in to the dealio
- [ ] `/` should I have `/` prefix be the way to get at root stuff?
  as opposed to relative stuff?
  or ... idk really
  would need to disambiguate from the division operator. But that should be fine, right?
  I already disambiguate the final division.

- [ ] autocomplete
  one/two/three
  Need to autocomplete namespaces, and not show them as red underlined

- [ ] ok, so I want to render out ... namespace ... items

- [ ] Below the normal namespaces, we should have a listing of the "sandbox's namespace"
  - yeah that's a good way to do it.
- [x] allow changing the sandbox's meta namespace
- [ ] allow renaming / moving of a namespace

Should I ... keep track ... of the library root ... for a given namespace?
So like, if names get removed that you were counting on, there's a way to know what they were?
Seems like that might be nice.

# [x] Allow exporting a sandbox, as a little json file
- [x] tabs should have a little dropdown dealio, where you can edit, or like export thanks
- [ ] OH when downloading a sandbox, also download any depended-upon library definitions.
- [x] delete a sandbox, you can do it; hm to be much safer, let's have a "deleted" flag on a sandbox. And actually do cleanup later.
- [x] show deleted sandboxes on the dashboard if you want

# [x] FIRST PRIORITY: Sanboxes have namespaces

This has gotta go first, to make this really usable.

# [ ] '(' to surround selection )

Gotta have it, pleeease

# [ ] Start thinking about autofixers?

Would this be like an autocomplete deal?
And so maybe, with the error highlight, I can indicate whether
there's autocomplete available?
That could be quite nice.

- [ ] autofix the 'not exaustive' by:
  - option one, adding a `_` wildcard clause
  - option two, enumerating all of the options, if there are unions at play
  - hmm it could also be nice to allow you to select a `_`, and say "break this apart for me", ya know

- [ ] I want to highlight matching braces again


# UM OK things

- so certainly for one thing, I can
  ... see if the whatsits are like
  ... gone. and if they are, then that
  is sad right

- [x] MAKE IT SO
  that "names" for locals & toplevel references
  are produced directly from the map, and not
  dependent on `getCtx` nonsense.
  BUT the question remains...
  `hashNames`, does it make so that I need to like
  make a hash of `{[loc: number]: string}`

- [ ] ok so now, I want to ..
  - hermmmm so `toplevel` hashes reference the `(define` instead of the ... id
- [ ] toplevel hash should reference the `name`?
  Maybe the `map` should come with a mapping between toplevel id to name id?
- [ ] also, I want the sandbox to have a namespace that's its base

ALSO
Ok yeah if you /delete/ a thing that used to be referenced, we need to update everything
to be identifiers again.

ALTERNATIVE

I could say, that if you botch something so bad
that its not in hashnames anymore
for any reason,
we revert all the whatsits.
UNFORTUNATELY that's, annoying to do? Right?
Like I guess I'd need to hang on to the previous ... hashNames ... which is fine right.

Question: where do I make the switcheroo.

- [x] Success! Now anything that used to have a hashName, but doesn't anymore, where the nodes
  are still around, gets swapped for an `identifier` with the previous hashname. Very good.

# [x] PRESERVING Names that get lost

For example:

(let [x] x)
and you unwrap the outer ()
the final thing should still be called `x`, but it'll be an unbound identifier, instead of a hash.

How to do that?
- method 1: do post-hoc analysis, find things that are now unbound, and figure out what the names used to be,
  and then update the map to change them to identifiers, instead of hashes.
- method 2: keep around a map of things as they were .. and ... persist it somewhere I guess?


# UNDO REDO

So, I've got a db table of `sandbox nodes`
and a db table of `history items`

q: how do I maintain a "history tip"?
a: historyItems could have a `didUndo`
  - if you add a new history item, and there are `undone` items, we need to delete those
  - right? seems fine
  - altho, maybe do that locally, it's fine

oprtions

A B C D
(undo)
A B C D(undid)
(undo)
A B C(undid) D(undid)
(E)
A B E
(undo)
A B E(undid)
(undo)
A B(undid) E(undid)
(redo)
A B E(undid)

Comparing previous & next history becomes quite a chore, I think.
And determining what to undo and stuff.


ALTERNATIVE, we do REVERT commits

A B C D
(undo)
A B C D D'
(undo)
A B C D D' C'
E
A B C D D' C' E
(undo)
A B C D D' C' E E'
(undo)
A B C D D' C' E E' B'
(redo)
A B C D D' C' E E' B' B

Advantage:
- purely addative,
- figuring out what's "new" in the next state's history list only requires checking the most recent item for updates. No possibility of previous items getting modified or being compeltely different.
- item's index === its ID, which is nice
Disadvantage:
is maybe hard to work out?
Advantage:
you can unit test this into the ground



# MOVIES is type checking?
wow cool!
so now
what next
do you know it

erm
it would be nice
to get it executing, right?

What are the major usability hiccups?
- sandboxes need a namespace. I think maybe, their own default namespace?
  - and you could like copy that namespace over to somewhere official if you want, idk

- [ ] let's highlight unused stuff in the sandbox, that would be nice right?

EDITOR NEEDS HELP
- [x] OK REALLY backspace at start of `(` neeeeeeeds to slop it
- [ ] highlight a bunch and `(` neeedds to surround it if at all possible.
- [x] UNDO and REDO these are imperative.

- do .. I ... want to ... make it so that the contents of a string template can be lists without parens? honestly I think it would be less weird.
  I guess a ~simpler stopgap would be to have "space" do an auto-wrap.




# Thinking about type bounds
like

`fn<T:[('Hi int) ..]>(x:T)`

so, you could instantiate `T` with a `Hi` that would need to be a subset of `('Hi int)`.
OR you could instantiate it without a `Hi`.

So if we're like, I wonder if T has a `Hi`, we kindof don't know if it does?





soooo the inferred type for `(to-result (task))` is sooo much. and lots of duplciation.

- [x] SO we need to have `expandEnumItems` also give me task declarations.
- [x] now use it
- [ ] hrm it's still not quite working, but idk

- [ ] SO I think my `tfn` type might need .. a little more ... constraints to it?
  like indicate if/how different type variables might interact and/or conflict

# I feel like matchesType is a little flimsy
and obviously we're getting an infinite loop in the task dealio
so what if we redo it?

I want a map.

- [x] nailed it
- [x] all tests passing
- [x] figure out the wrong deailio

- [ ] make like a bunch more tests, and maybe do it ... in a UI?
  idk maybe code is fine
- [ ] unifyTypes should be also using a map, I dare say


# yasss

- [x] give @task a third type argument, "ExtraReturn"
- [x] make it work I think?
- [ ] make a `(handle x ...)`, that does `((fnrec [x:(typeof x)] (switch x ... otherwise (withHandler<{the effects not handled in ...} {x's return type} {the effects handled in ...} {x's return type}> otherwise @recur))) x)`
  - seems doable?

```clj

(defn alwaysRead2<Inner:[..] R> [readResponse:string task:(@task [('Read () string) Inner] R)]:(@task Inner R)
  ((fnrec [x:(@task [('Read () string) Inner] R)]:(@task Inner R)
    (switch x
      ('Return result) ('Return result)
      ('Read _ k) (@recur (k readResponse))
      otherwise (withHandler<Inner R Read R> otherwise @recur))
   ) task))
```

# movies things

Ok, so I want a way to take `(@task [T ('Failure X)] Y)`
and turn it into `(@task T (Result Y X))`

```clj
(defn task/to-result<Effects:[..] Errors:[..] Value> [task:(@task [Effects ('Failure Errors)] Value)]:(
  @task Effects (Result Value Errors))
  ((fnrec [task:(@task [Effects ('Failure Errors)] Value)]:(@task Effects (Result Value Errors))
    (switch task
      ('Failure error) ('Return ('Err error))
      ('Return value) ('Return ('Ok value))
      otherwise (withHandler<Effects Value Errors (Result Value Errors)> otherwise @recur))
   ) task))
```

- [ ] BUG urmmmm so I need a third argument to @task I think
  - oh yeah, definitely

  (@task
    SharedEffects
    Result
    ReturnEffects)

  [
    ...SharedEffects
    ('Tag input (fn [output] (@task [SharedEffects ReturnEffects] Result)))
  ]

  [... internal]
  [without ...]

  [Toplevel]
  [ReturnLevel]
  [Shared]?

  `(@task Shared Return ReturnEffects)`

  `(@task Local Return [] SharedEffects)`

TODO do I need to be able to represent "extra top effects" as well?
Like effects at the top level, that won't be in the return?
I don't think so....




##

- [ ] I should make it so that, even if the switch type is empty,
  I still supply locals
- [ ] I want auto-applied tfns to hover with types
- [ ] '!' and '!?' should be hoverable

... my indication of type errors needs to be much better

- NEXT UP:
  - [-] expandEnumItems needs to hang on to locals.
    - ok I no longer understand?? maybe it's not needed?
- [x] (.a {a 10})
  - noww that we have autogenerics, this should be super good

- [ ] copy & paste looses local `loc`s and stuff

## Things .. that are brokened

- [ ] asTaskType is being used ... both for
  `(! ('Some thing))`
  and
  `(@task [('Some thing)] else)`
  but these are very different things.


## Buncha tests for nodeToExpr stuff

- [ ] (.a {a 10}) should be easy
- [ ] auto type specialization if we can hack it

- [ ] um I want um some tests for subtractType?
- [ ] also though, the `local-bound` thing needs some work
- [x] switch array [and array]

- [x] BUG BUG When I'm ~unifying(?) task items, it's not working right.
- [x] ok folks but I would like a `->` form please???
- [ ] and `->>` why not

- [x] '[..]'
- [ ] OK NEXT UP Let's really infer fn type args.
- [ ] and might as well make it so you can `(defn x<T>)` while we're at it, right?
- [x] (fn<x> [y:x] y) please
- [x] (defn<x> [y:x] y) please
- [x] ((fn<x> [y:x] y) 10)

- [ ] do I ever getType without `report`? Seems like I always want it.

- [x] (def fib (@loop (fn [x:int] (if (< x 1) 0 (+ (@recur (- 1 x)) (@recur (- 2 x)))))))
- [x] defnrec, fnrec
- [ ] expr array spread
- [ ] type bounds need to inherit

## Task

- [x] getType for ! and !?
- [x] getType for fns should collect all tasks dontchaknow
  - hm so, I think I'll blindly glom everything together that's in the body of the fn?
    are there any downsides to that?? I think it's the desired behavior.
- [x] oh tfn for expr's, gotta have it
  - [ ] switchhhhh really needs work
  - [ ] honestly, I need to start doing comprehensive testing of the semantics and such
- [ ] andddd let's do `@task` types for real

- [ ] validatee @loop, the @recur has to be inside of a (fn).

- [x] hashNamesNonLoc
  - I want my `hashNames` to not be "this .loc has X name"
    - toplevel[hash] name
    - local[sym] name
    - builtin[name] name
    - globalNames[hash] / last

.. > so currently `hashNames[form.loc] = name`
.. > are there things that will need differential rendering?
.. > perhaps the /relative/path stuff? but let's not mess with that too much

nodeToString -> globalNames maybe?
that might be betterr
yeah ok I won't mess with non-loc for the moment.


## More better test testing

What are the ...sections of stuff?

- "parsing"
- 'getCtx' and 'update'

ok but also, my tests shouldn't be touching web stuff.
also, delete all of the ctx stuff? I mean maybe not quite,
I might still want to reference some of it for the js evaluation stuff.


# erhmm hm

"hashName not recorded", why is
ohhhhh wait
it's that ...
oh lol I fixed that at least


# Ok, so the road to GLSL happiness
goes through every human heart.
wait.

## @loop and @recur
at least at the type level, gotta have it.

so, I probably need like some tests n stuff


- [-] I .. prolly ... need a special ... cst type? For @loop and @recur?
  honestly
  the cst doesn't really need to do much different, right?
  ok yeah, so `@loop` and `@recur` get to be 'special's.
  un le s s I want `@` to do macro things, and ...
  eh I'll deal with that later.
  - [x] ok no, so @loop and @recur don't need representation in the cst

- [ ] BUT the AST needs it right?
  yeah.

Ok so anyway, let's do the `Type` side first.
but

- [ ] type .attribute gotta do it
  then ... so we do some ~basic validation on the type

FOR the expr dealo, inferring the type seeems like it could be
very hard?
I could just enforece that you have to annotate it manually.
(@loop:ann something)

so, this is a ~locals thing.
at the moment, we're not allowing ... multipl-y different
levels of recursion.
although actuall you could do
```clj
(@loop (let [top @recur]
  (@loop (top @recur))))
```
So that's totally fine. No need to complicate things.


## [x] a `map` type

Does it need to be arbitrarily keyed?
I do want to be able to have `int` and `string` as keys.
So sure, let's do arbitrary.

anything fancy I should be doing?
Also, can I cheat for string maps? and just use objects?
on the other hand, do I care so much?
let's not cheat for now.

Ok, but anyways, I need a `map/[]`, right?
```clj
(defn map/[]
  (tfn [T V]
    (fn [target:(map T V) key:T] V)))
```
whichhh meannssss
that `[]` needs to be able to ... be generic ...

ok so how about, if a fn is trivially generic,
I can just infer it.

gotta do it for map/[] right? yeah ok that sounds good.

ok yeah so, I did map/get and thats fine.

- [x] map type
- [x] map/from-pairs
- [x] map/get

I, kinda want, to be able to double up, type vs term
`map` type and `map` constrcutor, ya know
`vec2` type and `vec2` constructor.
but
eh I feel like the mental overhead is too much.


# More Solid Thinking
about names, and reuse, and such.

- if you have multiple terms with the same name in the sandbox,
  it should be an error
- if you have a sandbox that shadows the name of something in the library
  and you have usages of the library thing elsewhere in the sandbox,
  I should really flag that somehow.
- drag & drop toplevels would be quite nice

- I should really hurry up and get glsl output going
  so I can make pretty things
- also a dom output n stuff ...

ok wait so
like what do we do about platforms.
I'm guessing a platform will have just like a library

- [ ] click on a thing, bring it up to the deal

# Left-Hand Whatsit

- [ ] v|> collapse a thing!
- [ ] maybe ... a three dots? that makes a contextmenu
  - well so I do need a button to move something out to the library

- [x] make a '<-' for def/deftype
- [x] on click, add it to definitions, add a name to namespace, and
  also replace all of the usages of it with the new hash.
- [ ] make an "x" to delete things from namespace

- [ ] BUG: select all of a text, delete, and you
  have an identifier thats empty.

- [ ] I really want fancy node select dealios

# AutoComplete

- [ ] it's not, great?
  - [ ] distinguish between local & sandbox & global results

# OK Vision for the nextliness

- [x] UIState should have a history[]
- [x] then the IDE useEffect can just check for new history items
  and apply their changes.
  That sounds great.


Alright, we're almost doing it?

- [x] the names for things ending in / isn't it
- [x] oh scroll within, for cursors, its broked


- [ ] sandboxes should have a "my namespace" idea
  the namespace where it ~lives
  - [ ] the sidebar is split in two -- top is the sandbox's
    local namespace, bottom is the global namespace

- [x] whyyy can't I switch sandboxes?
  ah gotta key the sandbox



wa-sqlite in the house
There's a Library behind everything
and multiple Sandboxes can be called up
we can even do like an ephemeral sandbox if we want
or those ~constant sandboxes, ya know.

ok, so I've decided .. that I cannn just determine post-hoc
what things got updated?
eh
I don't really love that though. so much waste.
but
cycles are cheap  Iguess.

ANYWAY.
So we do a [prevState -> nextState] delta
and persist that.
Yeah I guess I can live with that.

History items, I can do some clever merging, if it's a simple change.


# LOCS can just be IDXs
- [x] no need for start/end, really.
  nice


# DataBasery

How about the 'file' node type?
- while in a sandbox, it lives in the sandbox.
  also not hash-addressed. you can change things
  as you please
  - also, it's in a sandbox_[id]_files table or sth,
  - so when you delete the sandbox, trailing files
    get deleted as well.
    - OR maybe it's just a normal node living its normal life?
- once out of the sandbox, it does be hash-addressed and stuff

Q: DOES the database contain ... the 'selection' state of the sandbox?

Like, when /loading up/ the sandbox, does that include
... the status of selections?
I guess .. we could just load up the most recent history item, and see what it says, right?


- [ ] so, I don't yet have a way to turn a hash back into a name.
  for that, I think I'll probably want to know what the sandbox's
  namespace is, and any namespace aliases I have active.
  and then select the name that's closest to this namespace
  - but for that to be important, I need a way to add stuff
    to the library.




- [x] function types have argument names now!

# Sandbox and stuff?

ummmm namespacely
so clojure allows `/`, or `one/two`, or `one//`, but not `one///` or `one////`.
So `/` can't be a namespace name, but it can be a terminal name.
andddd honestly it's probably fine.
https://twitter.com/jaredforsyth/status/1538179622004834307

## Ok can we sandbox?

- So the `state` ... needs a library, that's been prepopulated with builtins, and also it needs builtins, and a sandbox.

WAAIT
ok
so
my ctx
needs to .. know about the sandbox
a little bit
like it needs a place to stick sandboxy defiintions

- toplevel: [idx => Expr]
  sounds good to me

### Get tests running with new library / sandbox story

So... what do I do about `Local`.

WHILE COMPILING (cst->ast)
I need `Local`
AFTER COMPILING
I need `ComplationResults`
for display, and interactivity, and such

OH so thoughts on shadowing, eh let's just not have it.
ALSO local (`let`s) can't do namespaces. off-limits folks.


## Tests
- selection, syntax, nodeToString -- don't use ctx
- type-match does, but incidentally
- complete does the full deal

> nodeForType remove ctx


## Road to the sandbox

- [x] So, builtins ...
  - builtin types, will be just defined by jerd, no-one else.
  - and they have unique (namespaced) names.
  - builtin terms, same story. unique namespaced names.
  -- this means builtins don't need to live in the library.
  -- they just exist.
  - [x] builtin terms, Expr has a name, not a hash.
  - hmm what if all builtins lived in the `builtin/` namespace?
    - does that mean they'd live in the library though?
      like. idk about that.
      I don't want to invalidate everyone's ... libraries ...
      well, honestly maybe that's fine. like if they want the
      new builtin they can pull it?
    - ok so it wouldn't be like a fixed namespace or anything.
      people could put them anywhere they wanted.
    - BUT they wouldn't live in `definitions`. the "hash" would
      be a `:builtin:/int/+` or whatever.

- [x] Decide what data structure is holding my builtins
- [ ] make a code to prepopulate the library with builtins
- [ ]

ok so the library keeps good track of namespaces, which I like.

Ok, so the hashNames idea is really just being lazy. When I delete a sandbox term, I should go through and find all things that reference it and turn them into {identifier}s.

Ok but is there anything else that the sandbox needs?
I guess it needs to know its current namespace, right?
oh history for sure

hrmrmmmmmmm yeah ok so this is where having a little more sophisticated toplevel representation would be good, because ... I'd like to .. keep track of the library definition that I brought in to edit, you know?
although ... I guess if the defn has the proper namespaced name,
then you'll know what you're editing. So that's fine I guess.
OK BUT also, I should make mutually recursive terms, so I make sure
the new sandbox & library shtick will support them.
Right?
Or I guess I'd need to make a bunch of changes to things as they are, so might as well migrate to the new thing first anyway.

Anyway, so the way I've decided to handle mutually recursive things, is that they need to live within a big ol' `(@loop (@recur))`.

ONE way to make it so I can do things like
`(def {$ one two} {one 10 two 5})`
is to split it into
```clj
(def onetwo {one 10 two 5})
(def one onetwo.one)
(def two onetwo.two)
```

BUT I really don't love that.
also, what about
```clj
(def [a b ..c] [1 2 3 4])
```
Do I really just allow arbitrarily complex patterns?
WAIT
actually all I need is to be able to represent that we're
binding to a sub-name... right?
do I reference it by name though? That doesn't sound awesome.
because what happens when I change the ... name ... wait maybe its fine

OK so
`sub` will refer to the *normalized idx* of the binding pattern.
that way, the hash can be stable, and we can refer to things.
anddd if you move things around such that the normalized idx issss
diffffferentttttt then hrmmmmmm wait that would be a problem too.

yeah actually any fanciness in namespaces is all for nought, because they are just aliases to the hashes that get persisted into the CST/AST.

MEANING
I need a different kind of definition? That is a "something fun"?
naw
I think I'll justtttt
yeah actually.
So the "sugar" part of things
would happen in auto-creating `(def one onetwo.one)` if you want.
BUT you *do* need to give the toplevel thing a name.
Not getting away from that.
Nice. Ok so no cheating on naming things, they're important folks.

OK NOW THAT I've decided I'm not doing anything magical with mutual recursion / multiple bindings ...
that means I can start in on namespaces and such, right?

# Inference and such

- [ ] if the current type annotation is ... allowably more specific
  than the inferred type, we should let it go, right?
- [x] make inference stop the infinite loopings

# Type Checking Bonanza

So, I think I want a war of all against all
like, I define a bunch of different types
and then I indicate, which ones should match which

OH I should make it so `(fn hi<T> [a:T] a)` works

- [x] TVars ... let's ditch the `sym`s there too
  use locs. Howbout builtins use idx's that are all negative?
  sounds cool to me
- [ ] backspace at the end of a tapply should just remove the tapply bit
- [x] TVars toString aren't hangingin on to local names

```clj
Cannn I ... inferrrr? ....
(@typeof reduce) ->
(tfn [Input Output ArrayLen:uint]
  (fn [(array Input ArrayLen) Output (fn [Input Output] Output)] Output))
```

# Indexing! Let's do it please

- [x] arrays don't layout
- [x] hovers don't work with scrolling
- [x] Arrayssss should have hashhh
- [x] um more scrolling
- [x] performance ... trying to make it better
  - hrm ok so a production build is plenty fast
- [x] shift-click not working?

## Critical things for getting conway to work
- [x] let should behaving like let* instead
- [-] paste should do the autocomplete business, yes it should
  - [ ] So parsing a thing char by char should preserve the toplevels
    before the current toplevel.
    I Think this goes along with having the toplevels not "just be a list".

## PERF STUFF

- [x] Basic useMemo. At least hover no longer tanks things.
- [ ] Next, I should be clever about only re-rendering things
  where a `selection` intersects with your `path`.
- [ ] pasting!!!! Takes suuuuper long. Looks like a BIG part of it
  is the `objectHash` story. Maybe I can do fake objectHashes while I'm pasting? Or something?
    - [ ] OHHHH IDEA IDEA! How about, in the sandbox, we don't hash at all!
      We *just* use the toplevel name's IDX. That way we don't have to
      deal with changing things in the sandbox breaking references.
      But once we commit something to the library, it's all good.




## A bunch of quality of life things
- [ ] I should hang on to the `hashNames` on state somewhere,
associated with the top level of a thing ...
  OK also, I don't think I should be doing the whole "toplevel items
  are just values[] of the top `list`. I think I want them to be
  explicit.
  Anyway, then `path`'s first item will be the `top`, not -1
  and there won't be any way to "select" the -1 pseudo-thing
- [ ] ALSO when you update a toplevel (addDef) I need to go through
and change anything that depends on it ... right? Yeah seems like it.
- [ ] ALSO let's get undo/redo in here real quick

- [ ] um, so now I want to like ... generate and run code?
  also, it would be nice if ... things worked faster?
  yeah maybe I need the "library / sandbox" differentiation?"

# Type application
What gives?

(some<int> 10 20)

Is that how I want to live my life?
Sure, why not.

Wow, that was ... easy? Strangely so.
I wonder if macros will do a similar thing?



# So, I'll want to actually make a "library" or something

in contrast to the sandbox that you're working in.


# Um

- [ ] can I separate things out, so that I can get a toyish
  language working?

- [x] oh another bieve of fixings, let's
  dooo the `Ctx[display]` everywhere has to go

- [x] also, `sym -> idx` please
  - ... are we sure about that?
  - alsooo I'm not sure about whether I want it to be
    a number or a string

- [ ] hrmmmmm we're fighting inference here.
  - ok yeah, so a usage is out of whack

- [x] ALSO there's this bug that happens ,where I'm changing something
  and all of the sudden these things autocomplete to <
  ok I think I fixed it

- [x] whyyyyyy is it zeroing out identifiers?
  - oh noes, we have map entries that have the wrong locs!

<!-- - [ ] am I  -->

- [ ] do I change node, to not have .hash on ID?
  - nope, because I need it for id-defns

- [x] delet the prefix /suffix stuff
- [ ] types and suchh
  - [x] autocomplete
  - [x] validate I think

- [ ] so I kindof want a .. flag on listlikes, where I can
  say 'I want this to be multiline' or not.
  and like, if you press the `enter` key, it should flip
  that bit.

- [ ] ooooh record item names should not be autocompletable
  - oh wait they're not it's fine.
- [ ] also it's weird that `{x}` is punned, it just shouldn't.
  - maybe I'll disable some punning

- [ ] REFACTOR I'm using `Ctx[display]` a bunch of places
  that should really just be a `{[idx: number]: string}`.
  I want to change `Ctx` to have that nameLookup on it.
  - alsooo when pasting, we need to de-hashify locals
    if they're no longer in scope
  -

- [ ] BUG (backspace on a '.' when the target is a hash, doesn't select correctly, because it doesn't know how "long" the text of the hashed is.)

HOL' UP
what about `sym` being ditched altogether, in favor
of `idx`?

- [ ] COPY/PASTE needs to re-sym locals too.
  - ClipboardItem needs that nameLookup, turns out

# MAKE IT So unlinked references don't just die

- which means, we want a `hashNames`, that is retained
  at the ... top ... of a given toplevel? Yeah that sounds right?
  I guess it could be at the top of the sandbox, right?
  might as well I guess.

# Weird editing

- [ ] color deftype ids
- [x] can't baclspace an empty hashhh?
- [x] still can't delete an annot
- [ ] backspace shouldn't nix whole listlikes. it should go in.
- [ ] changing a toplevel def should update usages of that def
- [ ] IF we have an unlinked reference ...
  - hmmmmm yeah ok this is why we need a toplevel hashNames thing
    so that we can hang onto names that were.
    And now that `sym`s are globally unique, we don't need to use
    the loc of that whatsit, we can just use either the hash
    for a global or the sym for a local. Seems reasonable.

- [x] can't . on a hash
- [ ] '(' at start of hash at start of attr should wrap
- [ ] backspace at '(' should unwrap
- [ ] select and '(' should wrap!
- [ ] let's get a little undo/redo in the house
- [ ] endddd how about undo/redo snapshots? like they
  don't have to persist the whole undo stack, but
  some snapshots would be nice? you know.
- [x] highlight specials (defn deftype etc.) with special color
- [ ] selecting a spread from the left should select the whole thing though

... type inference ... do I really want to reify it?
or do I just want to re-infer it every time?
idk let's try incremental inference for now

# When to update Ctx, and how, and such.

So, I think we can actually run the ctx from scratch on
every edit.
Right?
Like there's nothing ~useful that persists between moments.
We'll have to take care about updating hashes, obvs.


-> action => update

-> autocompleteBefore
-> apply update
-> nodeToExpr (populates mods)
-> apply mods
-> run inference
  -> apply inference updates
  -> nodeToExpr (verify that no more mods)
  -> loop to inference again




sooo I think I want a better approach to multi-select updates













-> action (INCLUDES doing a menu autocomplete, potentially)
(map, selection) -> (map, selection)
-> populate ctx, and optionally reconcile
b/c, if we're in an auto-completing mood, we need to
ctx it up to populate the autocomplete menu.

IF (action) is an "autocomplete*first*", when we
use the previous autocomplete info, and apply what,
before we run the action.
Can we try that?

--> fromMCST
--> nodeToExpr (populates mods and autocomplete)
--> mods it up
      - mods changes don't produce a different Expr
        so we don't need to re-nodeToExpr

--> autoComplete

```

```

oh yeah, when does inference happen.











# Errors / Warnings / Incompletes

I kindof want to change the render of type errors
depending on the location of your cursor. You know?
like, if your cursor is ... within ... a certain range,
you're probably going to be getting to it in a moment.
And so, we can render those errors as like warning things
little gray underlines.
But otherwise, we want them to be somewhat loud.

# Drag & Drop

could be so cool as a refactoring dealio.

multiselect some things, drag them around, and it's
"extract to a function at the top level". Very cool.

# Type-directed function resolution

- [ ] So um, there should be an easy way to remove the hash
  other than, I guess, just deleting a char or adding one
- [ ] Alsoo autocomplete should prioritize instances that match
  argument types if they already exist.
- [x] I hsould definitely have simple type-on-hover dealio

# Arg type inference

- [ ] run `infer` after selecting something from autocomplete

Ok frogs, what's the plan here.
- [one] needs-string -> [one:string]
- [one:string] needs-int needs-string -> [one:string]
- [one:string] needs-int -> [one:int]
- [one:string] needs-"hi" -> [one:string] but like a squigly underline
  indicating that the argument is over-general?

ok so what's the mechanism.
after ... each change ... do an ~inference pass?
to see what we can see.

oh yeah, so
I need to like figure out constraints.
what's why I'm slow on it.



## What kinds of things

- [ ] usage of a variable updates the type annotation for that vbl
- [ ] usage of an arg



# ByHand, the final steps?

- [x] I need to persist .. the ... hashes
  - oh is that just applying the mods?
- [x] replace should move cursor to end
- [x] auto-select a menu item thanks

# the Hash node
- [x] process ctx mods

it's a node that doesn't own its own text
selections could get wonky if the text changes out from under them.

I'll need to update all the `text in` dealios, right?

- [x] make a node
- [x] render it fake
- [x] change idText to get the real text from it thanks
- [x] change left/right to use the real text

# Ok folks, so the basic editor, is looking pretty neat

- [x] ah first, get rid of non-nested get-nodes
- [x] autocomplete pls
  - question. is autocomplete always... calculable
    from the state / loc / ctx
  - answer, I certainly hope so.
    this means that I'd want to useMemo on it, instead of
    plopping it on state. Right?
    BUT state keeps track of the selection index.
    and maybe other things? if the menu gets fancy
    oh and it can indicate whether it's been dismissed, right?
- [x] then the 'hash' dealiwhap


- [x] oof, ok so removal is very broken
  that is to say
  because we're preserving collections ...
  they're getting weird
  I need to zero out the locs of the collections that are modified


# Newlines though

So the thing about newlines
I don't know at the start
whether I need to intervene
right?

# Select & Delete
hm yeah gotta have a bit of that too

- [x] syntax.test. for ^L and ^R to expand selection should work
- [x] delete a subtext or untrusted
- [x] delete a nodes
  - ok actually, what if we do like a "filter the whole tree"?
    tbh that's probably the simplest solution. maybe a little bit overkill, idk.
    - oh we can just do the closest common ancestor, that's nice.
- [x] let's do ^C and ^V for copy & paste folks

# Copyy nad PArstee

- onCopy, onPaste. firefox looks like bad news
but maybe its fine?

should I just do writeText? Or should I also do `write`,
with a json mime type?
Seems like a solid idea.

- [x] LOGJAM ok the `path.child` thing has gotten super old

- [x] LOGJAM the fact that I'm using `nidx()` from `parse` is embarrassing. Mustfix.

- [x] hmm I think I want to ~maintain wraps?
  (let [hello folks and such])
  ^                ^
  should probably copy as `(let [hello folks])`
  but I'm currently getting `let hellow folks`

- [x] and then I need a simple paste-story
  which should go ok
   - [x] basic subtext
   - [x] untrusted, do each character
   - [x] paste mutliple nodes pls
- [ ] cut and drag would be nice...

- [ ] and then ... oh right, I need a `hash` node type, to lock things down,
  and then autocomplete. Then I can go back to playing with the language.

- [x] paste can replace blanks

# LogJams

- [x] tannot must go
- [x] trim the cst/mcst node types (no number)

# Selection!

- [x] ok folks I've gotta come clean, and just unify Path and Selection.
  there's no getting away from it. it's a weight around my neck.
  - YESSSSSSSS ITS DONE

- [x] add start/end to sel type
- [x] render end cursor (prelim)
- [x] populate sel/end on drag
- [x] actually do a meaningful render of the selection.
- [x] strings with newlines render super weird
  - honestly, should I just do something special
    with newlines? Handle them myself, I mean?
    seems like that might make sense.
    ok, so like from a data standpoint I think we can leave them.
    but for rendering, split them up
- [x] support subselecting in an atom
- [ ] getKeyUpdate should replace selected text
- [x] COPYYY and PASTEEE
  - so I'll need to generate new idx's for the pasted things
  - unlessss I'm doing a cut? In which case, we could retain them.
    but it might not be worth it to mess with that.
- [x] tannots are selecting weird...
  honestly now that I have full control over things, maybe tannot shouldn't
  be this weird pseudo node. it could just be a normal node, right?
  I think that would be better.
  - so, changing tannots, will mean that my nodeToExpr will need to be different.
    but I'm fine with that.
- [x] shift-arrow-keys
- [x] ok now selections need boundariessss

- [x] um, I need some tests for selections. How do I do it.

- [ ] and thennn let's bring `hash` node type into the mix, and autocomplete.



Here's what I'm thinking

I want "normal mode"

Ok, but that's ~orthogonal to wanting "higher level selection", right?

{
  mode: 'vim-normal' | 'insert',
  level: 'grapheme' | 'atom'
}


should we do
selection: {start: PathSel, end: PathSel}
and just infer by ~magic how to "select" the contents?
honestly that might be the best option?
but, then, left / right will take into account whether the nodes
have different parents?

so, another thing. If start/end are in stringText's within the same
string, we should keep character-level madness.
But every other case where start/end have different paths, it's block-level.

So actually that's trivial to determine, so I'm fine with it.


# hash-locking, what gives?

I think I actually want a different node type, called like
`hash`. So I'll know to handle it specially.

# MultiSelect

- [x] change state to account
- [x] shift-click for multi
- [ ] dedup the adding
- [x] handleKey should do all at once

# [x] some more backspaces
- [x] inside a ${}
- [x] after a ${}
- [x] after a listlike
- [x] access.text backspace
- [ ] tonnot: backspace

# [ ] extra fancy backspaces
- [ ] at the start of a listlike? (unwrap if possible)

# So, layout algo needs a lot of love
definite revamp.
once something "becomes multiline", we need
to re-compute all the children in light of that fact.

# Formattings

- [ ] adding something to the middle of a record is whacked
  - space should add 2 blanks
  - space when there's a blank after you should just move to the blank
    - I think that can be universal? Sounds good to me

# History thoughts

There are definitely some actions that would be more compact as
commands, than as a "here's the after/before map".
The question is, is it worth the overhead?
I guess, I could set it up, to allow for command pattern later? idk

# [x] UP AND DOWN
So, doing the ups and downs
means that I need positional info.
which means dom nodes
which I don't think want them in the main State
so I'll have them in like an augmented UIState?

But other things, like "autocomplete menu" stuff,
I think I do want to have live in the normal state?

# [x] Much better children rendering!
- [x] oh the last thing, tightFirst pls

# Some fixing of things

I should get rid of the CST types that I don't do anymore

# Some childrens

Simple


```clj
(defn drawToScreen [env:GLSLEnv fragCoord:Vec2 buffer0:sampler2D]
  (let [diff  (- fragCoord env.mouse)
        coord (if (< (length diff) 250.)
                (- env.mouse (/ diff 4.))
                fragCoord                )]
    ([(/ coord env.resolution)] buffer0)   )                     )

(deftype person
  { name string
    age uint
    animals { dogs uint cats uint } })

(deftype person
  {    name string
        age uint
    animals { dogs uint cats uint } })
```

now, if I'm gonna allow custom indexers
which seems like it'd be cool
I would need the `[]` array node to have
a hash on it.
which is a little exciting.
that might also open us up to custom collection constructors.

Ok, but back to the point at hand.
It seems like, for things like `(defn`, I don't actually want children
aligned with the end of defn, I just want it indented by a couple of spaces.
`(if` might be different though? idk. no don't make an exception

(might want a horizontal line between the two cases of the if though? That could be really nice)
(or like a little triangle at the start of where a horiz line would go)


```clj
; FirstLine + Children (might possibly be pairs)
(match arr
  [] []
  ; some single-lined thing
  [one ...rest] [(f one)])

(defn x [y z]
  (y z))
{
  firstLine: ONode[],
  children: {type: 'flat', children: ONode[]} | {type: 'pairs', children: ([ONode] | [ONode, ONode])[]}
}
; Flat
{ x y
  z 2 }

"hello ${
  something
} rest"
```




<aside>
Ok, I also kinda want a first-class table datatype?
hmmm I guess I don't super need that, like I can do
(array {name string age int})
and just render it as a table
right?
and (array (, int int int)) can also be so rendered
</aside>

Anyway, I'm establishing that other than `pairs`, we will
not be supporting more-than-2 columns


























Thoughts about childrens.

ONodes blank list is good I think
but then we want to return display info as well:
- '# at the start to be treated as a "prefix"
- '# at the end to be treated as a "suffix"
- indices in the middle that should be on their own line

- ok but lets ignore pairs for the moment, make sure we have a good experience

hmmm, so for string templates, I kinda do want breaking like

"Hello ${
  some expr
} world"

right?

hmmmmmm so I think I do want some meta-nodes

(defn $start-grid$[what]$break$sit$break$stuff$end-grid$)

"Hello ${$}




So, I do think I wanted nested something
but how do I indicate, that I want to layout some node
as a ... whatsit.

So like, a record
{..a ..b x 10 yes 20}
// should `layout:multiline` indicate which id's are to be in their own 'cell'?
like, I just want
|{ ..a
   ..b
     x 10
   yes 20 }|

ahhh ok, so maybe `layout` (multiline or flat) should be distinct in calculation from
`multiLineConfig` or whatever, which like maybe just lays out clearly what should be what.
you know?
like, gives you control over what's happening.
```ts
type MultilineConfig = {
  type: 'simple', // every child on its own line
} | {
  type: 'pairs',
  fullSpanIndices: [] // indicates which children should span both columns
}
```
seems pretty straightforward? yeah, I think that can go in the `style` attr?

ooh also, I think there should be a mode that's a simple wrap. Like for array literals that are just
too long, there's not a huge reason that thay all need their own line, if they're all under a certain
amount of complexity.


# What's left for the editor to be a real deal?

- [ ] I should square off with the Attachment rendering.
  - I think ... the attachment ... should ... hm. I feel like it wants
    to be some kind of composite thing.
- [ ] and rich-text rendering. So that'll require a whole
  different thing. Maybe call it 'custom'?
  And, well, when the custom is selected, do I have to
  relinquish focus? Maybe.
  - [ ] So, yeah I think I do want to give it full focus control.
    which is maybe tricky? idk.
- [x] TODO blink needs to be a thing!
- [ ] handle tab
- [x] allow other things to have focus, it's ok

... can I join `sel` and `path`? Seems like one ought to be able to.
it's weird that they're duplicating some infos.
maybe have a child that's like `{type: 'offset', at: .}`

anyway, then I want to jump in with multi-cursor. Seems like a neat
trick, and a good idea to bake in now before I've implemented too much.

and then ... selection! So each cursor can have an optional 'end' position.
ALSO let's do normal mode.


# Syntax Tests

- So, I'm doing headless full-dealio. So that the frontend
  will be pretty brainless
- I also want my ~syntax tests to be able to indicate the
  location of the whatsit
  - [x] ok so we have some source(dest)mapping

- [x] get all the things parsing & reprinting
- [x] left-arrow all the way
- [x] right-arrow is working
- [x] backspace is not yet a thing.
- [ ] up & down are not yet a thing
- [ ] my "id is empty, but it's fine us the hash" isn't yet something I support.
- [x] so, wanting this to be a real thing.
  but now I don't ~need all the fancy renderwhatsits and such.
  I can just do like dumb things, right?
- [ ] let's nail selection
  - I guess I can just use ~normal web selection, but muck it up a bit?
    like do boundary-alignment?
    - yeah thinking not just normal web selection. might as well
      take full control.
- [ ] btw I should definitely support multi-select. bc that would be very cool, right?
- [x] BUG: space in an inside should create two blanks
- [x] backspace after two blanks should delete both~ ( ) -> ()
- [ ] QUESTION: Should I think about "unwrapping" a string?
  seems a little more weird. But like, kinda why not?
  yeah, why not.
  Ok, so I'll only unwrap if it's a valid term. Why not.
- [ ] anyway, let's do splatting of listlikes next? it's for fun
  - is there some way to indicate that a listlike is splattable?
    - well, for string-expr's we should just not show the litte dealios
      and not allow selecting the outsideeeee
- [x] so, in exciting news, I kinda want emojis
  but it'll be a little weird getting "text length" and such to work.
  Does it mean that I'll want to store "fat string info"?
  I mean it's probably fine to just do the calculation on the fly?
  - so like, instead of ever indexing the string, or taking it's length,
    I convert it to a list of graphemes. Right? Seems reasonable.
- [ ] Ok, but also I should really suppport composition events.
  so ... yeah that's fun.
  - how to tell that a keydown is going to be a compositionevent?
    🤔
  - hm it'll be a little interesting to try to represent those though.
    like ... do I need to potentially have them anywhere?
    or I guess I could represent them as a 'replace this temp grapheme'. that's probably fine. Don't need to be too fancy.

# ByHand

> What am I not accounting for?
>> oh, it's \Markdown and \Attachment.
>> let's make sure those two make sense, and are nice to use.
>> Also, my little indent jamboree is, not great.

- [x] lots of things
- [x] basic hacky layout
- [x] lets respect tightFirst and pairs and such
- [x] get the cursor to calculate right, taking scroll into account
- [x] BACKSPACE
- [x] click punct
- [x] click text
  - [x] the hacky version, that relies on monospace characters
  - [x] fix click text to not be hacky
- [ ] autocomplete pls? will have to do ~text whatsits
- [ ] ok, so for error display, let's do
  - for a listlike, we could just highlight the brackets? That would be nice.
  - for atoms, we can do underline, that's fine.
- [ ] and then, selection! It will be unstoppable.

# Going down the list of syntactic things

- [ ] using a variable should update its type annotation, that's a thing
- [ ] task throwing
- [ ] generics are a big deal
- [ ] but RECURSION is a big deal too. and maybe the firster deal

- [ ] I kindof want tests
  - [ ]

## SO TESTS

What are the layers that we have?
- parse from text
- "parse" from key strokes
  - yo now that we have overheat, maybe I can do that thing I've always wanted to do
    - it would involve, having two functions, one is `onInput`
      and the other is `onKeyPress`
- type matching, in a war of all against all
  - identify different types by number, and indicate what other types it should match
  - unification, similarly, can draw on X and Y and produce Z
- actual evaluation and such

So that I can get an overview of how "complete" we are. How implemented is this language.

# Overheat
maybe think of a better name idk

- [x] rendering stuff! Very cool
- [ ] setSelection (left/right, is start/end allowed) is still ad-hoc
- [x] backspace on a spread doesn't work anymore
  - can I have `onBackspace` in `events` work reasonably?
- [x] oh backspace on attriutes not working?
- [x] lol you can't decimal anymore now because of attributes

- [x] backspace in string
- [ ] '}' in expr in string
- [ ] closing '"' in string

- [ ] whyyy is my error handling lagging?

# Broad strokes

- [x] attributes are working
  - [ ] anon attributes are not
- [x] decimals are broken
- [x] negative numbers don't work also
- [ ] spreads are needed
  - [x] basic render n stuff
  - [x] parse a spread record type
  - [x] parse a spread record expr
  - [ ] parse a spread array expr
  - [x] .. turns into spread
  - [x] delete in a spread should back out
  - [x] so I kinda think expr should also allow multiple spreads.
  - [x] '{' in spread body isn't working
  - [x] single item with spread isn't showing upt

- [x] BUG if you do `{}` then `.` we infinite loop! Not sure where.

  and then? idk what comes next tbh
  - [ ] so recursion, and especially type recursion, will be pretty important in a minute.
  - [ ] also, I wonder if it's ~time to abstract out my cst editing library? Or something?
- [x] I uh would like to be able to give my files names. pls?


Thinking about a more of a demo,
let's get markdown rendered blocks.
What's the way to do it?
Like a toplevel kind, right? And it can be Named
Or maybe it doesn't even have to be a toplevel type.
It could be ... just an expr type. Yeah.

So how do you trigger it? Would it be `//`?
Nope, let's do `\`.

- [x] so `\` can trigger a markdown node.
  Are there other specialty nodes I might want?
  hmmmm
  oh yeah, an image! or like an audio file.
  - so for an image ... I can imagine there being
    a runtime use for lazy loading them.
    oh, but I could like just indicate that, right? in the UI?
    yeah. Like a checkbox or something. it would change the
    `type` of the thing, which is fine.
    `meta {name string width uint height uint}`
    `{...meta data bytes}` or
    `{...meta id uint}`
    But like, so the actuall CST node would just have the handle.
    which would go into indexeddb right
- [x] so image attachments, I should probably make it so you can change
  the rendered size?
- [x] why aren't the errors on attachments being recomputed :thinking:
- [x] I kindof want to be able to select the "end" of an attachment. So
  that I can do `.`, ya know? Yeah I think that's valuable.
  - [ ] so actually, I can't do `.`, because that only works with identifiers.
    which I think is useful
  - [x] uh the blinker looks silly when the image is expanded
  - [x] so, do I have a really good reason that ... attribute dealios
    should only be doable to identifiers?
    yeah I think that's a fine constraint.
- [ ] 🤔 so, I'm wondering if an attachment should ever be just "there"
  Like is there a reason to have it be embedded, or can I just always
  treat them as lazy, and requiring an Effect to load?
  Kinda makes sense to me idk
  yeah ok, all attachments are lazy
- [ ] but, should I have a "start" blinker?


UMMMM ok so what about like per-node undo stack? stuff?
like what does that look like.
should we go to snapshots at that point?


#### Markdown
- [ ] make a little whatsit
- [ ] ok maybe I actually want to treat it like a template string?
  So that we can have little templaty deals. you know?
  but there's a question, of like different ways to render those
  templates. Like it could be "just show the result"
  or "
- [ ] UMMM ok so I'm getting distracted by looking up lexical's API and stuff
  because I think I do want some rich text editor, not really markdown. So I can
  have rich embeds.
- [x] lexical does seem legit
- [ ] my updateStore should merge with the previous one, but like only if the previous
  one was also a change to this dealiwhap. Right? And within a certain number of miliseconds?


buuuuuut also, can we not agree that I super need tests?
- oh now a little bit of tests


## Record Access
- [x] grammar
- [x] types for non-anon
- [ ] types for anon (v generic)
- [x] display! and such
  - [x] the target, the things
  - [x] make sure selections (start/end) bias appropriately
  - [x] split on dot
  - [x] backspace remove
  - [x] backspace it empty
  - [ ] auto the complete pls
  - [ ] empty ... accessText, with a menu ... does weird things? it's unselectable?



keyboards:
- [x] '(' at the start should wrap
- [ ] dunno about '(' in the middle
- [ ] '(' at the end should do a space first
- [x] space in the middle of a word should split it
  - [x] hang on to prev selection thanks
- [x] wrapWithParens in a string
- [x] click on '${' or '}' isn't selecting right
- [ ] space in a string expr should work
- ([{}])
  - at start
  - at end
  - ...in the midlle?
- left/right arrow keys
- up/down arrow keys
- selectttt

- [ ] let's do spreads! like, seems like I want it.
  - Sooo I feel like 2 dots is enough to express "spread"? Yeah let's just straight up do that. BUT we need attribute dealios firsrt, because `.` starts an anon attribute getter, and then a second `.` gets you into spread-land.
  - ok, so I need ... if the text becomes '...', then we're doing this
    - now, in some contexts (at the _end_ of a record type decl) we allow an empty '...', so gotta be context aware.

- [ ] and, dot.things
  - so for this, you can have .one.two or one.two.three
  -

- [ ] I should autocomplete 'def/defn/deftype'

- [ ] oh btw, I think I do want rest args. like because you really wantt to be able to (+ 1 2 3)


# Very next stuff

- [x] adding an argument (space?) to a function that's not resolved, should resolve it?
  - So, this is like ... "when you space off of a thing, that you have just modified probably(??)", it might
    - like (== 1)
    - is it right when it gets parsed as a 1? And like, if you then change it to a `1.`, does it re-evaluate the whole thing?
    I guess that could be fine.
    Ok, so there's a `reEvaluateFunctionCall` function, that, when parsing an identifierlike, looks at the function it's a part of, and potentially autoselects something **even if** there was something previously selected. Right? Yeah sounds legit.
  - OK yeah so, what we want is the [path] of the thing that was updated, so we can walk it back and do any updates of functions and stuff.
  - IDK if I need to do the whole path, or if just the most
    recent thing suffices? I guess walking the whole thing would be good.

- [x] so, I should walk back up the tree too, I thikn
- [x] Ok but let's get these tests passing now, ok folks?

# Ok, so writing a test

- [x] do I go through the autocomplete menu?
  - I guess I probably do?
  - I think I want ...
    ok, so I'm like, incrementally ... building up ...
    the tree? I think that sounds right.

- [x] have a test, that incrementally builds
- [x] autoclick the first autocomplete item
- [x] but, only if it's unambiguous folks
- [x] OH BTW like why is this happening?
- [x] OH failure is "js eval failed sorry folx"
- [x] LETS provide a way to say "when you get an ambiguous autocomplete for (text), choose (the one with type X)"
- [x] yay we actually have some tests!

# NOW that's what I call music
time for some ... auto- typo- mania

- [ ] using an arg in a place that wants a type
  - [ ] should update the arg to have that type

- [ ] once the body of the function, has a type
  that's real, reify it in the response dealio

ok so how do we do this.
is it like, on every `compile` we check to see if
anything's changed, that can now be locked down?

egh I guess that's a somewhat simpler algorithm,
or something, but it's not actually what I had planned.
Let's try to do the "actions directly impact stuff"
and see how far I can get.

OK SO: fundamental "operations" are:

- adding a locked-down termmm
  - [ ] if a local vbl, and this "hole" has an expected type
    - ok so currently I don't really ahve the concept of
      a hole having an expected type
    - but I'm gonna need it, for autocomplete bonanzas.
      So, a hole could have multiple options, for types,
      right?
      So this ... is a place where I'm like,
      having the AST instead of the CST could be nice.
      maybe?

### Holes, for a function call, maintaining consistency

Ok so the consistency question:
- we have a `()`
- we add in id `(party)`, and on "lockdown", we add holes for the arguments.
- `(party _ _ _)`
- then, we change `party` to something else.
  Do the holes disappear? I think so, yeah. They readjust
  as needed. ok.

- 'space/return/tab' when there's a hole in front of you just takes you to the hole.

### How about ... the function return value stuffs?

```clj
(defn hello [x :int]
  ) ; none
(defn hello [x :int]
  ()) ; empty record
(defn hello [x :int]
  (if)) ; errors, waiting changes
(defn hello [x :int]
  (if true)) ; (none, which unifies into empty record)
(defn hello [x :int]
  (if true 10)) ; now we have a ~conflict between the previous
  ; return value `()`, and the new one `10`. HOw do we know that
  ; the previous one is no longer needed?
  ; we could keep track of the originating IDX, to see if it has
  ; been deleted, but then this one won't have been. 🤔
  ; Yeahhh I kinda think that, for the return value, you'll
  ; want to just re-compute all the times
```

Ok, so like the variable-in-multiple-places thing, though

```clj
(let [arr []]
  ()
)
```

eh, maybe they're right that just having a normal inference algorithm makes more sense 🤔.

Like, if we require that things be locked down ...



- deleting a termmm
- selecting from autocomplete what something should be...


# Thoughts about persistence

I think ... that maybe *only* the sandbox should be persisting the CST
and the "codebase" should persist the AST.
e.g. the codebase needs to be well-formed and stuff.

- [x] map, unnest the 'node'
- [x] add a version to store

^^^^ so the codebase AST, how to tell if a type annotation
was inferred, vs specified by the user?
Well, inferred ones will have the -1 loc idx.

## WHOLE EDITOR SIMLUATION

UMMM maybe not? At least not yet.
Let's instead spend time on making it more usable
and maybe refactoring things just a little bit.
But I can probably use testing-library
well enough.

ok so what I'm considering, is having a whole
editor virtual machine essentially.
Like we have an internal ...
... dom? representation? heh maybe actually
tbh this would make it easier to self-host maybe
idk


because
I would love to be able to
say "headless render this interface"
and then "here's the selection"
and then "process this keystroke, and menu selection" and stuff.


So, I already have "selection" modeled, at least somewhat.
We don't have "within a node" modelered 100% of the time,
but we do actually somewhat. If you're making changes we do.

Ok, so
THIGNS we need to know/think about:
UI nodes of some kind.
and like a function for "idx -> nodes"
and then a simple node -> react whatsit

also, "context menu"
which we kindof have.

hmmmm waht would this look like.

Am I going to embark on this most fraught of activities
the whole editor rewrite?
perhaps.

anyway because then my editor could say, "hey $node for $currently selected idx"
whats happenin, handle this keypress please.

Right?
Ok so we'd build up the whole tree of idx->nodes, because
we need parentage and stuff, as parents pass in `onLeft` and `onRight`
(and should do `onBackspace` and `onTab`)






## INTERACTION BUGS

- [x] if you fully delete the text of a pattern id, then it loses track of who you were. I need a `display` that distinguishes.

## Type Annotation madness

So,
we're parsing a thing
(fn [a])
and then we add a single whatsit
and we're like "holdup, needs an annotation"
so in that compile-step, we up and add a modification. Right?

- [x] args auto-get a .tannot
- [x] args auto-get a :sym too, gotta have it.
- [x] set ctx.sym.current to 1 + the max sym in the nodes atm.

A test of the things
would include
interaction with autocomplete
I should think.
so like

`(fn [one] (+ one one))`

after "+" you do "autocomplete w/ type `(fn [uint uint] uint)`, right?
`(`, `fn`, `[`, `one`, `]`, `(`, `+`, (autocomplete)
yeah I can just tokenize, right?

it would be nice ... to be able ...
... to have the engine abstracted away from the React components?
not sure if that makes sense though.
or if I'd be implementing my own little DLS on top of react
although that doesn't sound terrible 🤔


- [x] refs don't keep texts.
- [ ] ok but now each dealio needs it's own localMap. ish.

- [ ] flag duplicate identifiers?
- [ ] update the annotation to match the pattern
  - [ ]
- [x] auto-add :1 sym hashes to patterny things

- [ ] oooops ok so localMap is only valid for the given toplevel
  - SOO we need .. an rmap ... that works .... as we're rendering these nodes
  - do I really construct it all the time? like again?
  - ok that's a bit of a pain.

## NEXT up

- [ ] type annotations have to live on the CST as something special. a {type} attribute.
  - when parsing from plain grammar, might need to do some magic there
- [ ] pressing ':' takes you into the type attribute.
  - as soon as you type just about anything in a function parameter, we'll generate the annotation for you

- [ ] space/moving on commits a good autocomplete.
- [ ] closing " at the end of a string should close.
- [ ] tab should get you to the end of the string

## BUGS

- [x] changing a name shouldn't break things

- [ ] I want different levels for "errors".
  - Some should only show up when you're ... done? Or at least be less loud.
    maybe all errors should make a little one-liner below the form ... actually I like that.
    nice and inline

- [ ] ok, so "on autocomplete", we need to do our best effort to update relevant types.
      this MIGHT happen across-terms if we're in the sandbox, so look out kids.
- [ ] also, space etc. at the end of an identifier should trigger the on-autocomplete if there's something available.

- [ ] I think hovers can get stale??
- [ ] AUTOCOMPLETE can be stale, which I don't love...
    But only in a global context, oh yeah. So as long as
    I retain enough information to re-do the global check
    THat'll be fine.
    SO:
    - [ ] re-cacalculate the "global" part of autocomplete
          on demand.
- [x] ALSO: caching of results in compile is /wrong/ if
      it's depending on something that has changed, right?
      althought the whole point is that dependencies can't change
      from under you. So maybe that's fine.
- [ ] TBH maybe I just shouldn't cache in the sandbox?

## Things to do

- [x] treat no-hash as just unresolved. no infering!
- [x] when removing a thing, remove the hash from things that hashed it.
- [ ] autocomplete shouldn't know about things /below/ the current sandboxy whatsit.
  I think this means that in the sandbox, I have to make a new sub-ctx each time.
- [ ] write tests that feed some code character-by-character to my editor stack, to make sure things work ok
- [ ] write tests that create a tree node-by-node,

- [x] OK time for layout to not be in .map
- [x] now that we're locking down hashes, need
      to propagate hash changes to dependent dealios
  - [x] ok but for real, let's write a test for this.
    should be a thing one can do.
  - [x] whyy is it invalidating other things??

- [ ] whyyy am I tracking every little change to an identifier
      as its own history item? Doesn't seem like I need to.
      It makes some sense to track changes to literals, because
      that can be re-evaluated down the line.

- [ ] split '.' into CST nodes. Probably like an array of children
  THE HARD THING is that this node *does not have edges*. It is
  unlawful for 'start' or 'end' to be the selection.
  setSelection must enforce this.
- [ ] split '...xyz` as well. Similarly, it is unlawful for 'end'
  to be selected on this node. but 'start' is fine.
- [ ] locked-down identifiers should have their 'text' deleted. that
  is what the autocomplete should do. This isn't something you can
  do at parse time, but then again we don't have hashes at parse time
  either, suckers.
- [ ] the autocomplete menu should respond to the keyboard. enter to
  select, up & down for the whatsit.
- [ ] "completing" an ID should reify inference if possible.
- [ ] I ... definitely need some tests. Do I try to use jsdom? Or should I just try to like emulate contentEditable? That might be better tbh. Oh it looks like maybe contentEditable has some amount of support? https://github.com/testing-library/user-event/issues/442

Then I can try my updateable inference story.

I want to make sure tasks make sense and are usable;
can I do the movies example in-editor? See if it works??

ALSO this would involve "making some platform-plugins".
Ideally we write the type in jerd, and a tool generates
the typescript harness of things we can expect.
And then it's up to the developer to implement the
expected functions. So it'll start with like:
```clj
(deftype http-result (Result string ['Timeout 'Offline ('Other string)]))
(deftype http/get ('http/get-url string http-result))
(deftype http/post ('http/post {url string data string} http-result))
; ooh can we do like ./get in names to mean "relative to this namespace?"
; or something
```
And then generate
```ts
type httpGet = {tag: 'http/get-url', payload: [string, kontinue]};
type httpPost = {tag: 'http/post', payload: [{url: string, data: string}, kontinue]};
export const handleHttpGet = (task: httpGet) => {
  // impl this?
}
export const handlers = {
  'http/get-url': (task: httpGet) => {
    // handle it, and call the continuation or don't?
  },
  'http/post': (task: httpPost) => {
    // handle it, and call the continuation or don't?
  }
}
```
seems like it would be something like that.


We could also, idk, start targeting like go or something?
Have some go glue.


- [ ] hrm renaming variables should update uses.
  hmm should I rethink my "the stored thing is the CST"?
  🤔 so why did I do it that way.
  Well, it means that I can have errors and stuff, and it
  will preserve that. Very flexible.
  It's also just a ton simpler of a data structure, I don't
  have to write nearly as much react code? I mean ...
  ... hmm so like, I could ... regenerate the CST from the
  AST on every keystroke? Seems a bit excessive though,
  and might be prone to breaking things. I could do it on
  "rest", like with reformatting ... but I also don't love that.

  SO one option here, is that in the CST, I just blank out
  the "text" for identifiers that are locked down.
  🤔 this wouldn't apply to ... the place where the name is defined?
  eh well it would though. or it could. (oh but then
  where does the text source of truth live? yeah it should
  be right there. Ok.)
  <!-- The IdLike could look up the name just like everyone else. -->
  The question comes to what do we do when they start editing
  the text on that. If it's the definition-place of that name,
  then we're editing the name all over. Great.
  If it's the usage-site, then we probably discard the hash?
  And it's back to a text-only id?
  Ok but we really do need '.' splits to be a real thing.
  and '...'s? I'm actually not 100% sure how I'm going to handle
  that. It just acts like a prefix, right?
  hrm but do I need delimiters for my navigation calculation to work.
  I mean so far I haven't had to a priori navigate the tree. But
  that'll come w/ select I'm sure.
  Andddd we do have "select the 'end' of this child".
  Would it just complicate things terribly to have some 'end'
  selections collapse into the child?
  Seems like I could handle that in `setSelection` without
  a whole ton of fuss.
  And I do think it'll be necessary for `a.b`, not to mention
  `...a`.
  Ok yeah I think that's agreed.

  ok but renaming *will* have to trigger updates for any nodes
  that are using that dealio. So that's exciting.




-----

- [x] oh lets get rainbow coloring based on sym! And also for globals I guess?
  - .style = {type: 'colored', idx: number} maybe
- [ ] all IdentifierLikes should just have a .text
  - yeahhh but I don't love having to change the CST

- [x] switch, we need to specializeeeee
  - do we do this in get-types-new?

- [ ] autocomplete menu needs to know about ..., so spreads can be a thing
- [ ] also, on 'space' or whatnot out of a term, "commit" inferred hashes for a thing.

do .. I .. ....

what would it look like to have a tree-based evaluator like hazel?
like ... holes ... what do we do with them.
I could just say "a hole is a (! get-something)", but that would
have impacts on the types of everything down the line ...

I could just have it throw an exception, and hang the outcome...

so, what about just tracing ~everything?
like
I could flip a switch, and trace everything.
or just trace a single ~term (show me scope and valuesss)

Would that be enough to make the quicksort demo make sense?
seems like it ought to be at least mostly sufficient?
The idea of hole-full programming is super appealing though.

hmmmm I wonder if I could have a dual-evaluation model.
Like if your term has holes, we evaluate with custom semantics,
that can handle holes .. but otherwise, we can compile to
something more performant.


## AUTOCOMPLETE

Gotta have it.
And so, also hash knowledge. But autocomplete first.

Sooooo thinking about how to populate autocomplete
I thiiink it makes most sense to do it in the moment, in nodeToExpr.
Because that's where we have info about what locals are in scope.
And we don't want to recommend out of scope variables.

Soooo where should that stuff get dumped?
- same place as laytout ought to go. W/ style I thikng.

- [x] basic autocomplete!
- [ ] instead of just erroring the arguments of a call, if the function
      could be different, maybe underline it too?
      Like, if all arguments are wrong, assume it's the wrong function? idk.
- [x] autocomplete for `a.b.c` things .. what do you do?
- [ ] if there's only one exact match when you space, select it, why not


## Things needed for my react stuff to happen

- [ ] spreading!
- [ ] $ for record patterns
- [x] ERROR underline patterns that have no type


## UP AND DOWN arrows

- [ ] up and down should move you up and down!
  - I think this will be, everything registers themselves into a big ol
    table, by idx, and then on up/down we like just traverse left or right
    along the tree and getBoundingClientRect all the things until we find
    a match. Then we can be fancy about selecting within it if we want.



##
I think I want to be able to define visualization plugins ... in jerd. with react(?)

Examples:
show a list of simple shapes as svg?
```clj
(deftype pos {x float y float})
(deftype shape [('Circle {pos pos radius float}) ('Rect {pos pos size pos})])
```

```clj
;; Here's the to-svg raw example
(defn shape-to-svg [shape :shape]
  (switch shape
    ('Circle {$ pos radius})
      "<circle cx='${pos.x}' cy='${pos.y}' r='${radius}' />"
    ('Rect {$ pos size})
      "<rect x='${pos.x}' y='${pos.y}' width='${size.x}' height='${size.y}' />"
  )
)
(defn wrap-svg [contents :string] "<svg>${contents}</svg>")
(defn show-shapes [shapes (: array shape)]
  (wrap-svg (join
    (map shapes shape-to-svg)
    "\n")))
```

```clj
(defn diff [a :uint b :uint]
  (if (> a b) (- a b) (- b a)))
(defn abs- [a :float b :float]
  (if (> a b) (- a b) (- b a)))

(defn move-circle [circle (: {pos pos radius float}) which (: ['center 'radius]) pos]
  (switch which
    'center {...circle pos pos}
    'radius {...circle radius (diff pos.x circle.pos.x)}))

(defn corners->rect [{minx miny maxx maxy}]
  {pos {x minx y miny}
   size {x (- maxx minx) y (- maxy miny)}})
(defn rect->corners [{pos size}]
  {minx pos.x miny pos.y maxx (+ pos.x size.x) maxy (+ pos.y size.y)})
(defn normalize [{minx miny maxx maxy}]
  {minx (min minx maxx) miny (min miny maxy) maxx (max minx maxx) maxy (max miny maxy)})

(defn set-corner [rect corner pos]
  (normlize (switch corner
    'tl {...rect minx pos.x miny pos.y}
    'tr {...rect maxx pos.x miny pos.y}
    'bl {...rect minx pos.x maxy pos.y}
    'br {...rect maxx pos.x maxy pos.y})))

(deftype corner ['tl 'tr 'bl 'br])

(defn set-corner [rect :rect corner :corner pos :pos]
  (corners->rect (set-corner (rect->corners rect) corner pos)))

(def set-corner/test1
  (let [rect {pos {x 5 y 5} size {x 20 y 30}}]
    {base ('Rect rect)
     mods (@tests [
       ('Rect (set-corner rect 'tl {x 10 y 10}))
       ('Rect (set-corner rect 'tr {x 10 y 10}))
       ('Rect (set-corner rect 'bl {x 10 y 10}))
       ('Rect (set-corner rect 'br {x 10 y 10}))])}))

(def set-corner/test1
  (let [rect {pos {x 5 y 5} size {x 20 y 30}}]
    {base ('Rect rect)
     mods (map (@tests ['tl 'tr 'bl 'br])
           (fn [corner] ('Rect (set-corner rect corner {x 10 y 10})))) }))

(defn move-rect [rect (: {pos pos size pos}) which (: ['center 'tl 'tr 'bl 'br]) pos]
  (switch which
    'center {...circle pos pos}
    corner (corners->rect (set-corner (rect->corners rect) corner pos))))

(defn with-state [state shape :shape idx :uint]
  (switch (, state shape)
    (, ('Move ('Circle i which) pos) ('Circle circle))
      (if (= i idx)
        ('Circle (move-circle circle which pos))
        shape)
    (, ('Move ('Rect i which) pos) ('Rect rect))
      (if (= i idx)
        ('Rect (move-rect rect which pos))
        shape)
    _ shape))

;; How would we do it react-y?
;; So that we can like move them around?
(defn show-shapes [shapes (: array shape)]
  (let [state (! 'get-state 'Init)]
    (dom/svg [('border "2px solid red") ('width 200.) ('height 200.)
              ('onmousemove (fn [evt :dom/mouse-event]
                (switch (! 'get-state 'Init)
                  'Init ()
                  ('Move point _) (! 'set-state point {x evt.x evt.y}))))
              ('onmouseup (fn [evt :dom/mouse-event]
                (! 'update-state (fn [_] 'Init))))]
      (flat-map shapes (fn [shape :shape idx :uint]
        (switch (with-state state shape idx)
          ('Circle {$ pos radius})
            [(dom/circle [('cx pos.x) ('cy pos.y) ('radius radius) ('fill "red")
              ('onmousedown (fn [evt :dom/mouse-event]
                (! 'set-state ('Circle i 'center) {x evt.x y evt.y})))] [])
             (dom/circle [('cx (+ pos.x radius)) ('cy pos.y) ('radius 3.) ('fill "black")
             ('onmousedown (fn [evt :dom/mouse-event]
                (! 'set-state ('Circle i 'radius) {x evt.x y evt.y})))
             ] [])
            ]
          ('Rect {$ pos size})
            [(dom/rect [('x pos.x) ('y pos.y) ('width size.x) ('height size.y) ('fill "red")] [])]
        ))))))
```

OPEN QUESTIONS from this little exercise
- [ ] how to "preventDefault" on an event? I think probably returning something from the handler?
  - like 'Continue or something? or 'Ok lol idk. Vs 'Stop 'PreventDefault hmm {bubble ['Stop 'Continue] default ['Allow 'Prevent]}. And {} would expand to {bubble 'Continue default 'Allow}



## Larger editor

- [x] lets have tabs, so I can have multiple things going

## Self-execution
Can I write the jerd-to-wasm or jerd-to-chez code in jerd?
What would it take to make that work?

BACKSPACE that clears an identifier should also delete the identifier
if we're the FIRST item in a listlike

### DO THIS FIRST
- [ ] !!!!! LAYOUT SHOULD NOT LIVE ON STORE
#### THis will make it make more sense to format let [ ] bindings correctly
- [x] Sooo do we ... want typeForExpr to populate errors?
  I think we want to?
  - [x] oh lol I already did it with getType. typeForExpr is dead

- [ ] need '(' at the start of a thing to wrap it.
- [ ] I should probably also do slurp and whatever else they've got.
- [x] .x needs a thing

# So, about the editor terms

I'm thinking about a "playground / workspace" distinction
where the playground autoevaluates, but doesn't persist.
And then you can click something to "commit" it, which means
it persists, you can dismiss it, etc.
That will also persist the tree of things it depends on.


ugh why is the multi-doc thing being weird? idk


# Strings!
Want.

- [x] ${ actuall track the $, and split the string
- [x] " should start a new string
- [x] backspace on the right side of a `${}` removes it
- [ ] backspace in an empty ${} should remove it

# GENERICS

tfn, and (<>) for tapply. Let's get it. So we can do
`debugToString` and have it work!

- do the "generics can hide" thing

what other thing can hide? probably macros? or like watchers?

--

- [x] ok validate the stuff
- [x] move the web UI over to the new type checking and valdiation

- [x] ok, so changing a node needs to remove the previous dealio, so it's not hanging around
  -


- [x] hmmmmmm I think this is a listener issue?
  - I need to keep track of what nodes had errors in the previous one, and do a diff
    so we can rerender them if necessary


- [x] reverse names and such ples

- [x] pattern type-hover, yes thanks
- [ ] for fun demos, and art and such, can we get a custom render in here?
- [ ] ok maybe I need floats. Which means multi-dispatch (?) or just some inference?
- [ ] also, let's get arrays in there!
- [ ] '(' in a start Blinker should wrap the thing. Also alt-( should work.
- [x] filter out empty identifiers, they're not helpful
- [ ] AUTOCOMPLETEEEEEE

- [ ] lol strings	?



- [ ] ok, so in order for map & stuff to work, I need recursion. Is it time?



- [ ] also, get we get a force-directed graph in here?

- [x] record matches!!!! Making so much progress.
- [x] why does the error stick around? (weird dom not clearing thing, backgroundColor='none' is invalid css)

- [ ] WELL having let-arrays be formatted as pairs is a little tricky. I think storing layout on the map is maybe not my best idea. idk.

HOVERY things
- [x] filter out keywords

What's a good way to italicize record keys?
hmmm maybe in the report, we can include like style stuff?
like

- [ ] hover types for patterns pls

- [x] switch get it workin


## maybeeee nodeToType should ... potentially not even return an ast node?
hmmmmmmm
I mean we've got our "unrsolved", right?
hmmm so the reason I was hanging on to everything was so that I could retrieve the original syntax when
reconstructing the syntax stuffs.
which I still think is a valuable thing.
hmmmmmmmmmmmm
but like, comments. what do we do.

toplevel `def` and `defn` should probably go unresolved (??).

and then ... we should log an error to the report if we have anything unresolved (???)

Anyway, alsos, we'll want to do a `validateType`, right?
oh maybe have a `validateForm` or soemthing...
yeah, before we'll add anything, it's not just the the type to check


## Thinking a lot about errors

FOR extra CST nodes that don't fit ...
like non-ids as a record key
or some non-array nonsense in a function second position

### Ok, now that we have an error system that I think is good, we

- [x] make a .types.jd that works
- [ ] start just, going through all the forms?
- [ ] I guess let's move the App over to use the new getType & associated error reporting
- [ ] implement support for `def` level destructuring, e.g. multiple `name`s (and associated `type`s from a single toplevel def)
  - addDef should calculate the type of the dealio, along with a report why not, and then cache that type on the global whatsit, for others to use.


## Enumerating the syntax, in Syntax.md

Very helpful for hammering some things out in this brave new lispy world!
And... it's with a heavy heart that I decide that tags probably need something
other than backtick. It just makes interacting with markdown too annoying.





## Ok

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

- [x] Let's hang on to it.
- [x] UNDO
  - would be nice to hang onto exact selection location
  - [x] selecting hanging on! there's a bug or two, but it's pretty good
- [x] redo?

## TEST CASES

So we have good test cases, where nice things happen.
and things evaluate to true.

- [x] make a test for goodness
- [ ] make a test for badness

And then we have bad test cases, where we want type
errors to be found & reported correctly.


- [ ] actually respect function parameters, and report type errors.


hmmmmm my type cache dealio really should be separated out.
and maybe it shouldn't even cache? idk.
well, for syms it's maybe important? 🤔

Ok yeah it was the cache that was getting me.

Yeah I need to rethink the "check-types" story.
Caching by loc.idx is, maybe a little weird? idk.
Well, it's ok to like /report/ it and such.
When you're collecting annotations.
But not keep it around / use it as a source of important info. right?

- [x] let's ditch this `.contents` nonsense. No need for it. we can just inline loc into the definitions.





- [x] re-evaluate, got to
- [x] highlight errors inline, unresolved stuff
  - yeah I really need to come up with some type errors
  - currently I don't really have type checking at all.
- [x] and like, hover w/ a key pressed to see types of things?
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