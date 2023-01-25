

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


## Things needed for my react stuff to happen

- [ ] spreading!
- [ ] $ for record patterns
- [ ] ERROR underline patterns that have no type


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