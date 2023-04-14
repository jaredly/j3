# The Sandbox and the Library

Inspired in part by unison's `scatch` files, the jerd editor has a sandbox,
which is distinct from the library.

The library contains:
- hash-addressed, type-checked, ASTs.

The sandbox contains:
- idx-addressed CSTs, with real-time CST->AST, type-checking, and evaluation.

IF you pull something into the sandbox from the library to edit, that is
used by other things in the sandbox, those sandbox items start pointing to the sandbox idx, instead of the library hash.

> 🤔 does that mean I'll want `global` | `local` | `sandbox`? Or just `global:hash` as `number|string`?
> It does mean that `Ctx` will need ... some changes idk


LIRBRARY:
I doin't think I want the sha thing, it doesn't really seem necessary? idk
anyway, the library is a tree
```ts
// type LibraryNode = {type: 'leaf', name: string, hash: string}
// | {type: 'branch', name: string, children: LibraryNode[]}

type LibraryNode =
string // a hash
| {[name: string]: LibraryNode} // a namespace

type LibraryNode = {children: {[name: string]: LibraryNode}, top?: string}
type LibraryNodeUpdate = {children: {[name: string]: LibraryNode | null}, top?: string}

```

anddd we'll maintain a library history, of changes to the library.
```ts
type LibraryHistoryItem = {
  path: string[],
  node: LibraryNodeUpdate // .children[name] = null to delete sth
  prev: LibraryNodeUpdate
}
```

So, I guess I kindof want an immutable data structure?
idk if it's worth the trouble

```ts
type Library = {
  root: string,
  // Do I want like commit messages or something? hmmm
  history: {root: string, date: number}[],
  namespaces: {
    [hash: string]: {
      [name: string]: string, // hashessss. '': hash is the toplevel for that ns
    }
  },
  definitions: {
    [hash: string]: {
      type: 'term',
      value: Expr,
      ann: Type,
      originalName: string,
    } | {
      type: 'type',
      value: Type,
      originalName: string,
    } | {
      type: 'builtin-type',
      args: TVar[],
      originalName: string,
      originalProvider: string, // the platform it was added by
      // providedBy: string, // identifier of the platform?
      // hmmm but we should allow multiple platforms to implement
      // each others builtins.
      // so, when 'loading' a provider into the ... editor ...
      // we modify the library?
      // Yeah I guess, it's like loading any third-party package.
      //
      // How do I enable ... multiple platforms ... to match each
      // others builtin types?
    } | {
      type: 'builtin-term',
      ann: Type,
    }
  }
}

type Sandbox = {
  map: {[idx: number]: MNode},
  hashNames: {[idx: number]: string},
}

```


TODO can I ditch localMap? Now that I'm using idxs, which are globally unique?



## NameSpaces and such


(side note, would `(texture/[coord] tx)` be valid syntax? like to prefix the `[]`? seems a little dicey, syntactically).
OH Also, if `hi` is really `ho/hi` ... how do I choose what to show?
Do I always only show the last segment?
oh or maybe it's a sandbox-level setting. Default is probably hide all prefixes, but you could say "show prefixes from outside of this namespace" or something.

(def /one/two 10) ; absolute namespace
(def one/two) ; relative namespace
// should I have '..'? That conflicts with spread syntax.

How editable do I want namespace prefixes to be?
eh seems like it would be good to have them fully editable, and
rendered as separate elements. Which is maybe a little annoying,
because I don't want that persisted in the CST.
buttt tbh it should be doable, right?
`getNestedNodes` can do any number of things. And navigation and such
relies on getNestedNodes.


# Tangent

Do I want to represent the toplevel nodes / definitions differently?
like, have the name be separated somehow
or something like that
as opposed to having it look just like scheme `(defn hello [] 10)`

looks like observable goes for the `a = y`, not separating out the names in any special way.

it is interesting that "output" is shown *above* the code. And you can "collapse" the code to just have the output visible.

sooo
yeah maybe I'll stick with what I have for the moment.
yeah it is nice that selection across terms just works.


# So

does that mean I disallow `/` in identifiers?
seems a little bit likely.

hmmmmm

how do I go from
`some/thing/that/is/in/the/cst`
to
`hash`, which might render as `in/the/cst`?


Ok I think I want a `dwell` effect, where hovers are initially insubstantial,
but if you keep hovered for like 200ms, it loses the `pointer-events: none`, and will persist for like 200ms after moving the mouse away.
That way you can interact with hovers if you want, but they shouldn't get too annoying.

ok but anyway, I can punt on making a/b/c work super nice.

