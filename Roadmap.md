
# Selection!

- [ ] ok folks I've gotta come clean, and just unify Path and Selection.
  there's no getting away from it. it's a weight around my neck.

- [x] add start/end to sel type
- [x] render end cursor (prelim)
- [x] populate sel/end on drag
- [ ] actually do a meaningful render of the selection.
  - [ ] should I like do a fake overlay as well? Or let the individual thing render?
    hmmm. Rich text isn't going to like that.
    Unlesssssss I kinda ditch lexical, and do my very own rich text?
    
  - [ ] 
- [ ] ok now selections need boundariessss

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
- [ ] TODO blink needs to be a thing!
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