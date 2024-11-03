import { sql } from 'drizzle-orm';
import {
    blob,
    int,
    primaryKey,
    SQLiteColumn,
    sqliteTable,
    text,
} from 'drizzle-orm/sqlite-core';

const ts = {
    created: int('created')
        .notNull()
        .default(sql`(unixepoch(current_timestamp))`),
    updated: int('updated')
        .notNull()
        .default(sql`(unixepoch(current_timestamp))`),
} as const;

const topShared = {
    recursives: text('recursives', { mode: 'json' }).notNull(), // a list of IDs that are mutually recursive. sorted lexigraphically.
    // a list of backlinks to siblings (in the same module) that accessorize some export of this toplevel
    // I guess I probably want it to be {topid: string, loc: number, myloc: number}[]
    // for the sake of completeness.
    accessories: text('accessories', { mode: 'json' }).notNull(),
    // jsonified nodes, root, nextLoc, auxiliaries, testConfig(??)
    body: text('body', { mode: 'json' }).notNull(),
    ...ts,
} as const;

// MARK: ByHash

export const toplevelsTable = sqliteTable(
    'toplevels',
    {
        id: text('id').notNull(),
        hash: text('hash').notNull(),
        // the 'previous hash' of this toplevel. used for ordering revisions of a toplevel, for finding "least common ancestor"
        // this is /not/ included in the 'hash' calculation, but is only used for local record-keeping
        prevHash: text('hash'),
        ...topShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id, table.hash] }),
    }),
);

const docShared = {
    title: text('title').notNull(),
    published: int('published'), // datetime of publishment, if present
    evaluator: text('evaluator', { mode: 'json' }).notNull(),
    body: text('body', { mode: 'json' }).notNull(), // jsonified nodes, nextLoc, nsAliases
    ...ts,
} as const;

export const documentsTable = sqliteTable(
    'documents',
    {
        id: text('id').notNull(),
        hash: text('hash').notNull(),
        archived: int('archived'), // datetime of archival, if present
        ...docShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id, table.hash] }),
    }),
);

const modulesShared = {
    assets: text('assets', { mode: 'json' }).notNull().default('{}'), // {[name]: {id, hash}}
    submodules: text('submodules', { mode: 'json' }).notNull().default('{}'), // {[name]: {id, hash}}
    toplevels: text('toplevels', { mode: 'json' }).notNull().default('{}'), // {[name]: {id, hash, idx?}}
    documents: text('documents', { mode: 'json' }).notNull().default('{}'), // {[title]: {id, hash}}
    evaluators: text('evaluators', { mode: 'json' }).notNull().default('[]'), // EvPath[]

    // does that seem like a reasonable place to put them?
    // kinda seems like it to me tbh.
    // {[name]: {id, hash, evaluator: EvPath[], kind: 'evaluator' | 'ffi' | 'backend' | 'visual'}}
    artifacts: text('artifacts', { mode: 'json' }).notNull().default('{}'),

    ...ts,
} as const;

export const modules = sqliteTable(
    'modules',
    {
        // Q: do we need an `id` that's separate from the ... `hash`?
        // hm it would be for tracking ~identity over time. which I do
        // think is something I'm interested in. Yeah.
        // and for like, in-memory representation, I think I'll be passing
        // around module ids, not hashes. And then we compute the hashes.
        id: text('id').notNull(),
        hash: text('hash').notNull(),

        ...modulesShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id, table.hash] }),
    }),
);

export const assets = sqliteTable(
    'assets',
    {
        id: text('id').notNull(),
        hash: text('hash').notNull(),
        data: blob('data').notNull(),
        mime: text('mime').notNull(),
        meta: text('meta', { mode: 'json' }), // like width/height for images
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id, table.hash] }),
    }),
);

// MARK: Versioning

export const commits = sqliteTable('commits', {
    hash: text('hash').primaryKey(), // a hash of the commit
    root: text('root').notNull(), // hash of the root module? yeah. root module has id "root"
    sourceDoc: text('sourceDoc'), // If this commit originated from a document, the id of the document. Can look up the hash in the /parent/
    message: text('message').notNull(),
    parent: text('parent'), // root commit has no parent
    author: text('author'),
    created: ts.created,
});

export const branches = sqliteTable('branches', {
    name: text('name').primaryKey(), // `main` branch will be our only one to start
    head: text('head').notNull(), // commit hash,
});

/*
lol am I literally reinventing git here?
like I might as well just use git, right?

naw, or at least not at first. I'll use my own thing,
and maybe decide there's a way to have git be the backend at some point,
but not just yet.




Ok folks, so if we actually hash the modules,
that means that we'll want to refer to modules by their hashes
from documents and toplevels, right?
otherwise what would be the point.

so, and also, what you would want is to not just
refer to the individual module, but probably also
the ... path? hrmmm. yeah ok path has to be unique
in order for this to mean anything.
BUT we could get away with just the root, if we
really wanted.

on the other hand, we could have modules actually be the source of truth
and like, a persistent dealio. like a merkle trie ya know.
would that be nice?

That would remove the need for specifying /module/ on stuff.

so like

module:
    id
    hash
    submodules: {[name]: {id, hash}}
    // So IDX here is /withihn the toplevel/, not, as
    // might be assumed, the index into a mutually recursive collection of toplevels
    // that all share the same hash. right?
    // Yeah I think that's right.
    toplevels: {[name]: {id, hash, idx?}}
    documents: {[title]: {id, hash}}
    evaluators: EvPath[]

so that's kinda cool, right?
it feels like it locks things down better

and it gives you, a way to know "the state of the world at X time"
which my other thing ... doesn't.

Does it make ... merges harder? or worse in some way?

Ok so answering the question "is this [hash] the latest hash for [this toplevel]"
becomes a bit less straightforward...

it does open up the possiblity of branches, which ... I'm not sure if I'm sold on?

yeahh it has a better handle on rewinding history, which is definitely a thing that I want.

and I like that we've got structural sharing.

Ok I think I'm sold on it.

ALSO a nice thing is that it enforces name-uniqueness for toplevels in a given module.
which I think is something I want.

*/

// MARK: Editeds

export const editedDocuments = sqliteTable(
    'edited_documents',
    {
        id: text('id').notNull(),
        branch: text('branch').notNull(),
        root: text('root').notNull(), // the 'root' hash of the whole module tree that we're based on.
        ...docShared,
    },
    (table) => ({ pk: primaryKey({ columns: [table.id, table.branch] }) }),
);

export const editedDocumentsToplevels = sqliteTable(
    'edited_documents_toplevels',
    {
        topid: text('topid').notNull(),
        docid: text('docid').notNull(),
        branch: text('branch').notNull(),
        hash: text('hash'), // might be null if this is a new toplevel
        ...topShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.docid, table.branch, table.topid] }),
    }),
);

export const editedDocumentsModules = sqliteTable(
    'modules',
    {
        id: text('id').notNull(),
        docid: text('docid').notNull(),
        branch: text('branch').notNull(),
        hash: text('hash'), // might be null if this is a new module
        ...modulesShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.docid, table.branch, table.id] }),
    }),
);

export const editedDocumentsHistory = sqliteTable(
    'edited_documents_history',
    {
        doc: text('doc').notNull(),
        branch: text('branch').notNull(),
        idx: int('idx').notNull(),
        reverts: int('reverts'),
        changes: text('changes', { mode: 'json' }).notNull(), // json blob
        created: ts.created,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.doc, table.branch, table.idx] }),
    }),
);

// MARK: Latest

// export const latestToplevels = sqliteTable('latest_toplevels', {
//     id: text('id').primaryKey(),
//     hash: text('hash').notNull(),
//     module: text('module').notNull(),
//     ...ts,
// });

// export const latestDocuments = sqliteTable('latest_documents', {
//     id: text('id').primaryKey(),
//     hash: text('hash').notNull(),
//     module: text('module').notNull(),
//     ...ts,
// });

// export const latestModules = sqliteTable('latest_modules', {
//     id: text('id').primaryKey(),
//     hash: text('hash').notNull(),
//     ...ts,
// });

// MARK: Caches

export const parseCache = sqliteTable(
    'parse_cache',
    {
        topHash: text('topHash').notNull(),
        topId: text('topId').notNull(),
        evaluator: text('evaluator', { mode: 'json' }).notNull(),

        exports: text('exports', { mode: 'json' }).notNull(), // string[]
        references: text('references', { mode: 'json' }).notNull(), // string[], the topids of referenced things
        accessories: text('accessories', { mode: 'json' }).notNull(), // string[], the topids of the "targets" of the association

        body: text('body', { mode: 'json' }).notNull(), // the jsonified full parseResult
        ...ts,
    },
    (table) => ({
        pk: primaryKey({
            columns: [table.topHash, table.topId, table.evaluator],
        }),
    }),
);

// GOTTA BE
export const typeCache = sqliteTable('type_cache', {
    topHash: text('topHash').notNull(),
    // So, here we only do one type per hash, meaning that
    // mutually recursive things get lumped together. That makes sense, right?
    // topId: text('topId').notNull(),
    evaluator: text('evaluator', { mode: 'json' }).notNull(),
    tinfo: text('tinfo', { mode: 'json' }).notNull(), // json blob
});

/*

hrm ok so
how is caching going to work,
if accessories can impact the outcome of type inference?
hmmm.
so like, the cache key, would have to be something like:
"a hash of all toplevels in the same module as this one" or something like that?
yeah tbh that might be it.

So, change something, well, hmm...
there ought to be a way, to, ...
AH ok so how about: it's a hash... of all toplevels that ... define accessories?




So, it's getting ... pretty annoying, that the /hash/ of a toplevel doesn't
necessarily work as a cache invalidation key for the produce of that toplevel.
like
thats no fun, right?

Big Q: CAN WE have it be so, that we still have like accessories-and-stuff, BUT
adding an accessory to a thing /actually changes the hash/ of the thing we're
accessorizing?
could that be real?
because, honestly, that would solve a bunch of issues.

obvs we'd need to enforce no circular references between an accessory and the accessorized.

SO THE PROBLEM, of course, is that: in order to know what accessories a given thing defines,
we'll have to run macros.

BUT NOW ACTUALLY are we sure this is a problem? Does this, in fact, all pale in the face of
the fact that we have a staging ground?

like, when you go to /commit/, are we not calcifying absolutely everything? Such that we
could use the results of e.g. macro expansion and nonsense?




Ok I'll have to think this through.
I think this means that:

- the /toplevels/ table would have columns for:
    - accessories
    - macroExpansions
    ???
    is that right?

WAIT
ok so here we come to the crux of the issue, which is this:
- parsing at the least, but also macroexpansion, CAN DEPEND on the evaluator.

Whiccchhhh would mean
hmm
yeah ok but the thing is, we lock down references to the hash of the toplevel,
so we would really need to account for accessories (and ideally macroexpansions)
in that hash.
And we're not going to have /different hashes/ of a toplevel for each evaluator.


OHHHHHHHHHH wait we alreayd have a problem.
because it's possible for a macro to define new exports for a toplevel,
and it's theoretically possible for different evaluators to evaluate the
same macro differently, you could run into the situation where:
- under one evaluator, you made a `Id(ref=some-macro-export)`, but then you
  switch to another evaluator and that export doesn't exist, or it's under
  a different `Loc`.

hrmmmmmmm
what does this mean for me.

Things it could mean:
- additional exports need to be ... like ... "pre-defined" or something?
  I'm thinking "slots"?
  ok and a slot has a name, obvs, and like an index probably
  so the `Id(ref)`s would refernce the slot by index.
  AND if we do macro expansion, and it doesn't fill up the slots,
  we know something has gone sideways? and we can error.


QUESTION: accessories aside, with this system, can we say with certainty
that the hash of a toplevel encompasses everything that might impact it?
honestly it might even be possible that the /slots/ thing is overkill.
because as long as /macros/ are pure, and we're tying ourselves to the
hash of the macro, we should be all good, right?

well OK so I do think that slots are a useful abstraction

WAAIIIIT how about this: forget slots, what if any export needs to be
tied to a unique /id/ in the original source?
hmmm honestly I kinda like that. It means that jump-to-definition gets simpler.

So you could have like a

(gen eq)
(deftype lol (Lol string int))

or something, and the `eq` is the ID that becomes the "slot" for the definition?
yeah idk seems legit.

This /does/ mean that, if you suddenly want your macro to generate one more thing,
you'll need to update all call sites.

[side note, it would be super cool to have a really slick way to write code transforms,
 using code. and then running them over the codebase. Such that "add a parameter to all
 invocations to this macro, taking into account the thing it is attached to" would be
 a reasonable thing to do.]

AND a very nice thing is that: ref's no longer have to be [string, int][], they can just be [string,int].
which I like quite a lot.

>> So final decision, we're not doing some magical 'slot' thing, we are instead enforcing that,
   if a macro wants to produce extra /exports/, the relevant /id/s need to be in the original source.
   you could, for example, have (gen (|eq|my-eq|)) or something like that.



ALRIGHTY FOLKS, now let's talk about accessories. I'd love to address this in an at least analogous
fashion.


Thinking about typeclasses, we have, for example: "instance Monad on List"
which would be 'attached to' the /List/ type declaration, using the "key" of /Monad/.
[it migggght be possible to define it the other way around? idk]

ANYWAY the basic story is this: making that definition, needs to change the Hash of the toplevel
which is the /List/ type declaration.

I think what I mean to say is this: when resolving an accessory, we expect and require that
the target of the accessory also include a backlink to the item in question.

(btw how are we hashing mutually recursive toplevels?? I think we ... sort them by
id, and then hash the bunch, right? and then they all have the same hash, and the recursive
references are like, instead of the hash, the index into the list of ids. do we record anywhere
what the list of ids is? or do we just backwards infer it from 'these are the toplevels with the
same hash'? Like, we /could/ include the list with the "first" one, I guess. AH actually for completeness,
let's include it with each of them. yeah I like that better.)

yeahhh ok, so what we have is:
- toplevels have a column that is "accessoryBacklinks" essentially, so we have a wee bit of denormalization.
  allllternatively, we could, not, right? but still treat them as mutually recursive? nah I think the
  backlinks make sense.



Question: with this change, does that mean that I don't have to care so much about module
boundaries? hmmmmm. Not sure.


ohhh so here's another thing:
- a module definition keeps track of what evaluators it is "enabled for".

*/
