
So, inspired by a subtext video, I've been thinking about schema migration again, and how to make it really nice.

## Context : What's the problem to solve?

You have some data, in a format. You persist it somehow.
You change the format, for various reasons, and so your
code now expects the new format.
You want to load the persisted data, but it's in the wrong format!

## Current solutions?

SQL Database migrations : stop the world, do whatever munging needs to be done.
Indexeddb has a similar thing. The whole database has a "version", and when you need a migration, you increment the version, and modify your "update the whole databse" function.

I've done a similar thing in various projects where I have a JSON blob that is persisted somewhere (indexeddb or localstorage or a file etc.), and I just stick a `version` field at the toplevel. I then make a `migrate(store)` function that checks the version, and if it's lower than the latest one, makes whatever changes are necessary.

Somewhat related, in our Khan Academy mobile app, we cache quite a lot of things to reduce network traffic and allow offline functionality, and each piece of cached data has a version on it. When loading something from the cache, if it's an outdated version, we just discard it 🤷.

Another approach is to just declare that all new formats need to be backwards compatible. This severely limits the kinds of changes you can make (all new attributes need to be optional, and if it's missing you fill in the default at the point of use, for example).

## But it's not great

First of all, if you want to do the versioning at anything other than "the whole database", it's a ton of annoying bookkeeping.

Secondly, if you want actual type safety during the migration, you have to keep around all of the old copies of your types (I actually tried this once! it was ... ok? very time laboreous though).

Related(?) if you're using an SQL database, you can write the migration logic as SQL, but why would you do that to yourself.

Sequelize, looks like indexeddb somewhat https://sequelize.org/docs/v6/other-topics/migrations/

NOTE: I'm not talking about API changes in a highly-available distributed system (which needs to be concerned with some amount of backwards & forwards compatability). That's a rather harder problem, but also one I'm less concerned about.

Other things to look at:
- subtext video, give a description
- erlang?

## Experimental solutions

So Jonathan? subtext guy made a video about this problem, and the approach he demos is to track user changes to a schema at such a granularity as to make it possible to automatically handle migration. The system he describes looks very interesting, but [explain some things]

## jerd's appraoch

So I'm building a programming language, jerd (rhymes with bird or herd), and one of it's features is that all toplevel items are hash-addressed, similar to [unison](TODO). Instead of referencing a term or type by name (and hoping the implementation doesn't have a breaking change over time), the reference is locked to the hash of the definition at the time you referenced, so updating a term or type definition won't change clients of that item, unless you decide to update those clients to the new definition.

This has a number of interesting implications, but the relevant one for this post is that *all previous versions of a given type are referenceable*. Hello type safe migrations!

But let's not stop there!
