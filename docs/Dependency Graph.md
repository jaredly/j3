
# Macros, Type Classes, and the challenge of constructing a dependency graph

I'm building a language (engine), and I want everything. This includes:

- agressive caching and what others would call tree-shaking; I want to do the minimum amount of work to produce the requested artifacts.
- macros, where you can write code that modifies and generates other code
- something something type classes or something.
- inter-term references are done by unique identifier, not by human-readable name

One kind of think you might want a macro system to be able to do is something akin to haskell's `deriving eq`. Produce the code necessary to compare two values of a given declared type.

For a given person type, for example:
```ts
type Person = {name: string, address: Address}
```
it would generate something like
```ts
const personEq = (one: Person, two: Person) => one.name === two.name && addressEq(one.address, two.address)
```

There's some messiness that I don't like in turning the type name `Address` into the function name `addressEq`. Another aspect of my language engine is that all non-local references are fully resolved in the concrete syntax tree; e.g. the `Address` in the type definition would be represented by a node that looks something like `{type: 'ref', loc: some-unique-identifier}`. In this way, the compiler doesn't have to do name-based resolution for these references, renaming a term is an O(1) change, and producing a dependency graph is much simplified.

One option here would be to pass a function to all macros, something like `resolve(name: string): null | uuid`. This has the massive downside that macros would have to be recalculated much more often that would otherwise be necessary, as they could potentially be impacted by creating, removing, or renaming a term.

What I've settled on is something I'm calling `associated terms`, and I haven't come across it in the literature (please let me know if I've missed it!). I'm thinking the reason for this is that it doesn't really make sense outside of a structured editor context, but that might not be the case.



