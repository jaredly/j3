
So, similar to the way I'm planning to have "migrateable data" be ~opt-in (where the default is to need to write the conversion yourself), what would it look like to have CRDTs supported at a language level?

like you could say
```
(deftype person (@sync {
	name string
	age int
}))
```
And that would expand to ... something ... that woud ... hmmm
would it make it so that your DATA has a color?
That would be kindof annoying?
hmm.

like, can't use sync'd and non-sync'd types together.
hmm.

coulddddd it be just an attribute of the runtime???
that would be quiteee interesting?

hmmmmmmm would you then ... just turn on sync for the whole dealio?
🤔
yeah tbh that might be the best.
🤔 well are there custom things we'd need to specify?

Hmmm yeah ok, so modifications have to happen in a special way, right?

soooo
sometimes you want to make an ~atomic change. Like, tie two things
together, such that if one gets overridden, it invalidates the other thing?
although maybe there are ways to prevent that kind of issue.

eh, but why not, amirite? like we can deal with that never.

Ok, so what's to stop us from doing auto-CRDT at the effect level?
like, you can't modify anything, you fool.
you just send me a new version of whatsit, and I do with it what I will.

...

does this mean...

that I would like ... have a 'db layer' or whatever that is running my program?
like a platform?
seems kinda like that, right?

sooo you could install 'native modules' for your platform, which would be in charge
of providing handlers for various task types, right?
and then you would just like interact with the "database", which happens to be synchronized and all that jazz.

I'd love to do like a "auth + todomvc" story.
ooh maybe with durable objects as the synchro? hmmmm

# Conclusion

This will be handled by the database platform-level code. I'll just write code using effects to get & update data. Whether that goes into like mysql or a crdt dealio isn't visible to me.

Noww one question becomes, if we're doing migration, do all the crdts break?
and the answer is, probably? idk

Will have to invent new art around that, probably?
Now, I think the backend will probably need to know ... what .... the .... types are of things?
I don't super love the idea that I can't just do everything in my language though. Why can't I implement a whole rigamarole in jerd?
And just back out to the platform for like sockets and nonsense.

