
# PRESERVING Names that get lost

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
- [ ] OK REALLY backspace at start of `(` neeeeeeeds to slop it
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