
Ok, so I'm loving this thread about natto https://twitter.com/_paulshen/status/1610407861687037953

and i'm wondering, how it would be, to always have all of your code open.

like

we can render quite a few dots.
anyway, and the workspace will be a directed acyclic graph (I mean it will have mini-cycles, but not large scale)

So that should be ~doable to autolayout, right?

but
so natto is like a flow-based programming thing
which is not what I have been considering

so the real use case, where I'm like "I want hash addressing"
is for having a snapshot of the whole tree.
so that I can keep track of an output.

it's also, like "renaming is free", but that doesn't
actually require us to hash the contents. It just means
we're using IDs behind the scenes. Which is fine.

another story to tell, is that we just don't do global references.
every function takes as arguments anything it wants.
that's kindof an FBP way to do it.

so the use case I'm imagining.
is "I want to clone the world that depends on this function.
so I can try two different variations."

which, I mean, should be doable with a feature flag.
or a ... widgety thing, I guess, which I have also built.

So maybe I don't need a clone-the-world?
I mean it would be cool to do like a "checkpoint" and then
make some changes, and then do "do a diff between this and that,
and give me a toplevel toggle between the two"? hmmm.

globallllll config vbls
I think

maybe, idk. I might like want a way to say "this whole blob, it's now a function that you can pass initial variables to" or something.
