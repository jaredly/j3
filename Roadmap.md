
- [x] OK time for layout to not be in .map
- [ ] now that we're locking down hashes, need
      to propagate hash changes to dependent dealios
  - [ ] ok but for real, let's write a test for this.
    should be a thing one can do.

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