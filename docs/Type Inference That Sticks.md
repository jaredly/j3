
# Type Inference that sticks

Type inference algorithms are given the daunting task of intuiting the types a user intended to use, but was too lazy to write out, from a blob of unadorned text. This being essentially insurmountable, they instead settle on a deterministic algorithm for inferring a set of types for a file of plain text, and users are then required to mold their intent to fit this algorithm.

These algorithms perform just as well (and just as poorly) on code entered & modified over time in an IDE as they do on a text file read from a disk. Or, for that matter, on code written with pen & paper and then fed to a compiler character by character via teletype.

That is to say, they have no knowledge of, or interest in, the process by which the code was written. The only feedback loop they recognize is receiving all of the code at once, and responding with the first error they come across, or if you're lucky, several independent errors. Fixing a given error, instead of being a context-sensitive conversation ("here's the resolution to that error, please continue"), is back to a clean-slate data dump of all the code (modulo some caching for performance, but caching does not -- must not -- change the semantics of type inference).

Sometimes in conversations about programming language development, people bring up a "sufficiently smart compiler" as the solution to verbose syntax or excessive boilerplate. A "sufficiently smart compiler" compiler would be able to figure out the right thing to do without the user having to specify it. The trouble of course comes when the compiler has an algorithm for "figuring it out" which doesn't match the user's internal model of "the right thing to do". This is especially fraught in an inference situation, when the results that the compiler came up with are only made obvious to you if there's a type error in that general location, or if you happen to inspect the inferred type.

And so there's this tradeoff between brevity and verbosity of the language syntax -- the more information included in the source code, the less guess-work the compiler / type checker has to do, and the less chance there is for a mismatch between the programmer's mental model and the computer's. But more verbosity results in not only more typing, but it can also disrupt the flow of writing code. In an exploratory mode, the user doesn't necessarily know the types of function arguments before they have written the body of the function. And then there's readability tradeoffs on both sides of the spectrum: for experienced programmers, having types written explicitly all over the place can be very noisy and actually inhibit code comprehension, while those same annotations are a boon for someone unfamiliar with the codebase.

There are also times when inference algorithm limitations have negative impacts on other aspects of the language. Flow, facebook's type checker for javascript, originally had global type inference, but in the interest of speed (especially on large codebases such as facebook has) recent versions require you to annotate all functions exported from a file, even when those functions have trivially inferrable types. Ocaml's type inference covers most of the language, but type-abstracted modules (known as Functors) generally cannot be inferred, and need explicitly type annotations.

Roc, on the other hand, follows Elm's admirable commitment to having all type annotations be optional, such that any correct program can have all of the annotations removed and still have the same semantics. The trade-off there is that Roc doesn't support Rank-2 polymorphism (you can't pass a generic function as a function argument), because it wouldn't be able to be fully inferred. Haskell on the other hand, never one to compromise on power, allows you to turn on "Rank-N" types, under which type inference is [undecideable in the general case](https://en.wikipedia.org/wiki/Parametric_polymorphism#Higher-rank_polymorphism).

With Jerd, I'm building a compiler that's "sufficiently interactive", not sufficiently smart. Instead of trying to reconstruct the programmer's intentions from a text-dump of source code, the compiler is involved in the entire process of development, responding to programmer feedback, and giving context-aware feedback in return. In this model, the source code is enriched with the compiler's inferences along the way, which the programmer can inspect & correct (but can also be elided from display for a more compact presentation). Type inference therefore is *incremental* and *reified in the program source*, such that, once a function has been written, the compiler need make no guesses about types or the identities of referenced terms.

As a simple example, consider autocomplete. Isn't it funny that autocomplete can allow you to choose exactly what function you want to call, and what local variable you want to reference, but then when the compiler comes along all it has to go on is the autocompleted text. It has to construct local scopes and do name resolution, and if the term has since been renamed then it just falls over.

When typing an identifier in Jerd, if you select something from autocomplete, the ID of that term is stuck onto the identifier node, and then the compilation pass doesn't need to do any name resolution. And of course, if you change the name of a variable, none of the references are broken.

## So what does sticky type inference look like?

Say you're writing a function with two arguments. Before the body is defined,
the arguments have the universal type "𝕌".

```clj
(defn movieFromLine [line idx]
	)
```

Then, when you use one of the arguments, the type annotation for that
argument gets updated, if possible, to the intersection of the current
annotation and the type required by the new usage.

```clj
(defn movieFromLine [line idx]
	(switch (split line "!")
		; split has type (fn [string string] (array string))
		; so at this point line's type annotation is `string`
		))
```

If there is no intersection, then the new usage is marked as an error,
but you're also given the option to switch the annotation to align with
your new usage, and marking any other usages as erroneous. See how it's
a conversation?

```clj
(defn movieFromLine [line idx]
	(switch (split line "!")
		[title year starring]
			(switch (parseInt year)
				('Ok year) {title $ year $ starring (split starring ",")}
				('Err err) (! fail ('LineError idx line err)))
		_ (! fail ('LineError idx line 'InvalidLine))))
```

If we get to the end of the function, and there's an unconstrained argument,
you either have the option to make it a type variable, or specify a concrete
type for it.

## Prior Art

Lamdu's editor has a similar interaction to this, where if you add a new use of a variable that's incompatible with current uses, then the new usage is marked as the error. I don't know if they store the inferred types in the syntax tree, or if they re-compute them on every edit.

## Further reading

- [jerd's types](https://github.com/jaredly/j3/blob/main/docs/Types.md)
- [jerd's algebraic effects](https://github.com/jaredly/j3/blob/main/docs/Algebraic%20Effects.md)


