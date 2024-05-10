
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

