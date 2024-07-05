
Can we think about rebases for a second?

like, you have two stagings, and we're making changes to both.


[side note, do I want to be able to "commit" and include active stagings in that snapshot?]
[it kinda seems like I do. like I would be able to "revert" if I wanted to.]

OK SO
commits do impact the full everything
and branches as well

releases are just from a single namespace/root thing.

andddddd commit also save the state of staging. I think.
because I sure do want to be able to preserve it.


So like
how do we deal with library dependencies.
a library is a commit with the hashes all bundled
-> downloading the library, involves getting the whole bundle of stuff
  -> to start with, I'd skip any deduplication and just drab the tarball I should think
  -> but we can dedup at some point I imagine.
-> the downloading of it is a caching action. The library artifacts don't need to be committed anywhere.
-> can/should we use github releases for releases? sounds kinda fun
  - anywayyy releases are . like . tagged with a sha probably

-> whereeee do we specify that a library exists?
-> would it be like a ... toplevel mapping of "library name" to "source url" or something?

so, I guess ... a namespace/name could map to a `hash + index` or a `library hash + index`. Right?
Dooo I really need to build that in just yet? Seems like I could get pretty far without it.
so yeah, it should be forwards compatible.

Alllrighty.
Back to the question of "to git or not to git"










##

Let's talk about "staging".
This is related to the "WIP" state that I described earlier.

The idea is:
When you make a change
- if the change results in the toplevel failing to type check, you enter staging
  - if you make further changes that restore type checking, you exit staging
- if the change results in a downstream type error, you enter staging
  - if you resolve that, you exit staging
- if the change results in a downstream test failure, you enter staging

WHILE IN STAGING:
- your changes don't get *committed* to the namespace
  - does that mean that namespaces actually map to a `hash`, and references are to a `hash` instead of an `id`?? MAYybe.
- we display somehow that the affected toplevels are "in staging"
- IF YOU WANT TO, you can choose to "stash" your staging into a fresh namespace. cool, right?
  - does that clone everything downstream as well? mmmmm maybe it does? Or maybe you can choose not to.
- There's probably got to be a way to "merge back" the stashed changes, right?


ANOTHER WAY to exit staging is to say
"the downstream things that are broken should refer to the previous version".
This is like ... the opposite of stash? like, "I don't need to move, you need to move."

I see two options here:
- (1) the "previous working versions" of the things get put in a new namespace
- (2) the "previous working versions" of the things get renamed, with like a suffix, and are left in the same namespace.
- (3) welll I guess I could maybe have a special "stashes" notion, where things get tossed, and have the same "name", but they're "in a named stash" and can't really be referred to (or not as well idk). And then you can choose to take them out of the stash?
  - sounds kinda reasonable.


IT WOULD SEEM that you could have multiple, independent "stagings" happening at once.

IT WOULD ALSO BE INTERESTING if you could have multiple *versions of the same set of functions* being ... edited ... at once ... and then the "test" fixture matrices would display the results for each set, so you can compare them.

Ok, so ... there would be a "switcher" at the top of a toplevel that exists in one or more "stagings", so you can swap between them.
-> I think undo history would have to ... take that into account? like you can switch to another version, and undo a thing that was done in that version. Right? Although maybe that doesn't make it weird, you just "search farther back" for the thing to undo/redo.

ANDDD probably if you switch to one thing one place, it gets switched in the whole document.

ANOTHER THING are "stagings" scoped to a single document? or do they live elsewhere? hmmmm kinda seems like it would be scoped. right?
althougghghhh actually no, there could be weird clobbering things if you edit a toplevel in one document without realizing that there's a staging in another document. Right? A "staging" should be trackable with "# tests passing".
Ok but I think they would be at least /tagged/ with the namespace of the document where they originated.





# How does this interact with version control?
A "commit" is saying "i'm going to give a name to this 'current state of the world'".
> BUT it's not actually about the *whole* world, it makes sense for it to be focused on a particular toplevel (or namespace I guess) and then snapshot the deep dependency tree from there.


# OK SO ANOTHER THING
what about ~module-level~ polymorphism? Roc has this I think.
And it would seem useful to be able to say "I depend on being provided ~these functions~ with ~these signatures~".

it's a little like ... algebraic effects ... but

Does it make sense for this dependency to /need/ to be provided all at once?
I guess it makes sense for it to need to be provided, in general.
And as long as we can do `spread` or something to get things in place, it's probably fine. We'll want to allow multi-spread in this case.

THE QUESTION IS
- should we require that you provide a default implementation?
  -> probably.
- is this ... different ... from *earmuffs*?
  -> I mean I kinda is, and kinda isnt.

so like, why not just use earmuffs for this kind of thing?
they should be statically compileable. And if you use it in different ways then it'll multimorphise for it.







## Should algebraic effects be declared? Prolly.
> side note, having algebraic effects be 100% inferred is maybe a little off? like there's part of me that's like "oh so cool"... but another part of me thinks it's just asking for trouble.
... I do ... still think it makes sense to set them apart visually.

ok yeah I do think makes sense to have them be declared. but they can be very polymorphic.
andd this means we can take advantage of namespaces and such, which seems nice. `<-hello//folks` could be abbreviated as `<-folks`, `*one/two/three*` could show up as `*two/three*`.
[[ NOTE ]] This does cut off the potential for ... first-class manipulation of effect names. like `<-hello/*` or whatever. But, that should probably just be handled by passing an argument in.
yeah that's fine.






Ok so if you start staging with one thing
because it breaks a downstream thing
and then you edit the downstream thing











- if the toplevel that you're editing has no tests or usages, then we do no staging. Normal, quick, editing.
- if it has usages, and the changes make any usage fail to type check, then we enter staging. If you make more changes that restore type checking, then we exit staging.
- if it *does* have tests, and you make an edit,
  - if the















==============

OK so we'll have a special CST node type that is ... 'code'. Right?
and it'll be {type: 'code', raw: string, lang: string}

SO the "level-0" runtime doesn't know how to parse, doesn't know how to execute,
it only takes a raw code and eval's it.
hrm ok I guess I'll want it to be able to do basic analysis on the code toooo
so like "externals" and stuff. gotta bring babel in there I guesssss
ohhh wait am I gonna typescript? 🤔 hrm.
ugh like do I really ... want to take on that kind of dependency?
but I mean this IDE is really cool, even without the structured editor goodness...

then level-1 is implemented in `code` nodes.

do I need to one-world it up just yet? like I probably don't tbh






===========

"WIP" state.
So, what if ...
the editor has .. like first -class understanding of when you're only halfway through a refactor?

- [ ] for example, maybe you can only "commit" if all tests are passing? ok that's not really a good idea. How about, commits know whether all tests are passing / all types are checking. It's like a "dirty" flag. Maybe "# of type errors, # of failing tests"?

Ok but the main idea is: IF you edit something *that is depended on* by other things, and you introduce a type error ... then we ... keep around the old version of the term (?) and use that for everything downstream, until you fix the type error. Similar story with ... tests? Maybe? hmm idk about that. How would I determine which tests are "associated with" a given term?
yeah maybe I won't mess with that. But the types thing, for sure.
ALSO: if the type *doesn't* change, that means we don't have to re-type things downstream.

ALSO I should definitely make compilation such that locals and globals are treated differently; so I can late-bind globals. It'd be great not to need to recompile all the things.




===========

So, kinda leaning into the "build the langauge in itself", why not go all the way and say
that the whole system is set up for you to be hacking on the language?
This means that: Compilation artifacts need to be keyed to a certain "runtime".

IF you're working on your own custom runtime, and you download a library, there won't be any cached
artifacts for it, so you'll have to compile it from scratch.
On the other hand, if you're using a common runtime (identified by its SHA), then the library
will have compilation artifacts provided along with it, saving you some time probably.


SO:

- [ ] there's a database.
- [ ] We're doing some version control stuff, where we hang on to DIFFs of toplevels.
- [ ] references between toplevels need to be ... prefixed by the namespace-id
- [ ] history.... is still maybe just a sandbox-level concept, not part of the database.
- [ ] AUTOCOMPLETE can't be providede by the type checker, because the type checker doesn't have access to the whole database.
- [ ] a "SANDBOX" is loaded up with ... cards ... idk
  - QUESTION can sandboxes see each other? Or is each its own "working tree"? 🤔 🤔 that's actually kinda interesting to think about.
  - ehe I mean if that happened, how would you "rebase" onto checkpoints from another sandbox? or, I guess each sandbox would function as its own branch? idk I don't hate the idea
  - ok so a sandbox knows what "commit sha" it's working off of.
  - and the DATABASE
    - doesn't need to keep reified all past versions of everything; it canonically only needs to maintain... the HEADs of all active branches? right? Is that a lot of duplication? eh I guess it's probably not really. OK I guess that's fine.
    - checking out a SHA at some point in history requires creating a branch at the point.
    - we'll want a pretty nice merge algorithm to merge changes from different branches.
- [ ] you can "checkpoint".
- [ ] if you want to "produce a compiler" it has to be tied to a checkpoint
- [ ] compilers get saved as compiled files so you don't have to daisy-chain. But also, they include metadata about what namespace item they came from, and the checkpoint SHA
- [ ]

One nice thing here, is that when working in a sandbox, we don't have to care about SHAs at all, right?
We *do* need to lock down inter-toplevel references, which is fine.

But then, when producing a sha, it's sha's all the way down.
wait. does it need to be "all the way down"?
🤔

ok I think I've decided that, when editing in a sandbox, I want to be impacting the whole world all at once. I don't want to think about change propagation. This would mean that no, I can't e.g. call two different "versions" of the same function, from a given function, to A|B test new functionality. Although admittedly that would be pretty cool. BUT it's gotta be the way outside unusual case. And for cases like that, shouldn't it be possible to e.g. "bring in a branch/sha

