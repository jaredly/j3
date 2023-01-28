
# Type Inference

Type inference algorithms are given the daunting task of intuiting user intent from a file of plain text. This being essentially insurmountable, they instead use a deterministic algorithm for inferring a set of types for a file of plain text, and users are then required to mold their intent to fit this algorithm.

They perform just as well (and just as poorly) on code entered & modified over time in an IDE as they do on a text file read from a disk. Or, for that matter, code written with pen & paper and then fed to a compiler character by character via teletype.
That is to say, they have no knowledge of, or interest in, the process by which the code was written. They only feedback loop they recognize is receiving all of the code at once, and responding with the first error they come across, or if you're lucky, several independent errors. Fixing a given error, instead of being a context-sensitive conversation "here's the resolution to that error, please continue", is back to a clean-slate data dump of all the code (modulo some caching for performance, but caching does not -- must not -- change the semantics of type inference).

Sometimes in conversations about programming language development, people bring up a "sufficiently smart compiler" as the solution to verbose syntax or excessive boilerplate. A "sufficiently smart compiler" compiler would be able to figure out the right thing to do without the user having to specify it. The trouble of course comes when the compiler has an algorithm for "figuring it out" which doesn't match your internal algorithm for "the right thing to do". This is especially fraught in an inference situation, when the results that the compiler came up with are only made obvious to you if there's a type error in that general location, or if you happen to inspect the inferred type. (a recent example from roc development, the function being number-polymorphic)

And so there's this difficult tradeoff between brevity and verbosity of the language syntax -- the more information included in the source code, the less guess-work the compiler / type checker has to do, and the less chance there is for a mismatch between the programmer's mental model and the computer's. But more verbosity results in not only more typing, but it can also disrupt the flow of writing code. In an exploratory mode, the user doesn't necessarily know the types of function arguments before they have written the body of the function. And then there's readability tradeoffs on both sides of the spectrum: for experienced programmers, having types written explicitly all over the place can be very noisy and actually inhibit code comprehension, while those same annotations are a boon for someone unfamiliar with the codebase.

There are also times when algorithmic limitations have negative impacts on other aspects of the language. Flow, facebook's type checker for javascript, originally had global type inference, but in the interest of speed (especially on large codebases such as facebook has) recent versions require you to annotate all functions exported from a file, even when those functions have trivially inferrable types. Ocaml's type inference covers most of the language, but type-abstracted modules (which are confusingly called Functors) often cannot be inferred, and need explicitly type annotations.

Roc, on the other hand, follows Elm's admirable commitment to having all type annotations be optional, such that any correct program can have all of the annotations removed and still have the same semantics. The trade-off there is that Roc doesn't support Rank-2 polymorphism (you can't pass a generic function as a function argument), because it wouldn't be able to be fully inferred. Haskell on the other hand, never one to compromise on power, allows you to turn on "Rank-N" types, under which type inference is [undecideable in the general case](https://en.wikipedia.org/wiki/Parametric_polymorphism#Higher-rank_polymorphism).

Jerd takes a different approach, which I call a "sufficiently interactive compiler". Instead of trying to reconstruct the programmer's intentions from a text-dump of source code, the compiler is involved in the entire process of development, responding to programmer feedback, and giving context-aware feedback in return.

- source code is enriched with the compiler's inferences along the way, which the programmer can inspect & correct (but can also be elided from display for a more compact presentation)
- inference is *incremental* and *reified in the program source*, such that, once a function has been written, the compiler need make no guesses about types or the identities of referenced terms.

Example: autocomplete. Isn't it funny that autocomplete can allow you to choose exactly what function you want to call, or what local variable you want to reference, but then when the compiler comes along, all it has to go on is the name, and it has to construct local scopes, or do name resolution, and if the term has been renamed it just fails?
When typing an identifier in Jerd, if you select something from autocomplete, the ID of that term is stuck onto the identifier node, and then the compilation pass doesn't need to do any name resolution. And of course, if you change the name of a variable, it won't break any links to it.

## So what does this look like?

Say you're writing a function
```clj
(defn movieFromLine [line idx]
	; so far we've no indication what the types are
	; so they are inferred as the empty type,
	; which is uninstantiable, but will unify with anything.
	)

(defn movieFromLine [line idx]
	(switch (split line "!")
		; split was nailed down to (fn [string string] (array string))
		; so at this point we lock down "line" as "string".
		;
		; As a variable encounters a use, we change the inferred type
		; to be the "union" of the new type and the previous type.
		; if they cannot be unified, this new use of the variable
		; is in error.
		))

(defn movieFromLine [line idx]
	(switch (split line "!")
		[title year starring]
			(switch (parseInt year)
				('Ok year) {title $ year $ starring (split starring ",")}
				('Err err) (! fail ('LineError idx line err)))
		_ (! fail ('LineError idx line 'InvalidLine))))
; now the function is complete, and we don't know the type of idx.
; should it be generic? or should it be locked down to something?
; there's a squiggle underneath it, and when you hover you can choose.
```

<!-- With Jerd, I have decided to drop the requirement that text be a fully-supported representation of the source code. What does this mean? Practically, that you won't be able to just copy & paste code from stackoverflow or a listserv email and have it work without any questions. The Jerd IDE will certainly parse the code for you, but it may have questions for you to answer about types, or resolved identifiers. -->



## Prior Art

Lamdu's pretty-printing feature (that can show or hide inferred types) is related to this idea, although I don't know whether the inferred types are reified in the source tree, or whether they are re-computed on every edit.

So I'm not interested in a sufficiently smart compiler. I want a sufficiently *interactive* compiler. When the type inference algorithm finds somethign that could go one of two ways, I don't want it to fail with an "AmbiguityError"; I want it to ask me which I had in mind, so I can tell it and we can move on.

In jerd, all types, type arguments, etc. are explicitly reified in the concrete syntax tree (which is our equivalent of source code).

What this is leading up to is that, for jerd, there's some information that is necessary

Lamdu has this cool thing where the type checker knows what the previous "good" state of the code was, so when you add a new term that conflicts with a "previously successful" token, the one you just entered is flagged as the error.


