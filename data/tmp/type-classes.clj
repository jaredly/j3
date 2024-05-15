(** ## Let's talk about Type Classes! **)

(** ## What are type classes? **)

(** The name "Type Class" comes from mathematical theory which, honestly, I don't care a whole ton about. However, it's [probably](https://twitter.com/jaredforsyth/status/1790772089579876757) the most recognized term for [the ability to associate a bundle of methods with a given type in a fully-inferred manner], so I'll be using it here. Other terms from other languages include "Traits" in Rust and Scala and "Abilities" in Roc and "interfaces" in Go or Java or C++.
    So far, we've been able to have functions that have the same implementation for different types through the use of "parametric polymorphism". A classic example is map: **)

(defn map [f lst]
    (match lst
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(** The type of map is forall a, b : (fn [(fn [a] b) (list a)] (list b)).
    Another thing that we end up wanting is the ability to have different implementations for different types. A classic example for this is the "equality" operator (often == or === or, in lisps, =). So far we've been able to kindof wave this off by having the runtime provide a fully-generic = function, which does a structural comparison behind the scenes. Unfortunately, this doesn't allow us to provide a custom implementation for types where some of the structure is irrelevant to equality (for example, in our AST, we shouldn't care about the loc IDs when comparing types for equality). We'd like to be able to "define = for expr" and "define = for scheme" and then have the = method "just know" which implementation to use based on what we pass to it. This would also be handy in our foo->s (turn this into a string), foo/subst and foo/free classes of functions.
    That is what Type Classes enable. In essence, you have the ability to "place a constraint" on a type variable, asserting the existence of a given function (like =) implemented for whatever concrete type it ends up resolving to. If, at compile time, there hasn't been an "instance" defined for that type, then it will error. Otherwise, the compiler will "resolve" the call from = into foo=.
    In practice, it's very handy for the constraint to indicate that a whole suite of functions is defined for the given type, instead of just one. For example, the Number type class would have all of your normal arithamtic operations defined, such as +, -, *, and so on.
    In the case of polymorphic functions, it's only slightly more complicated. If we have a function that takes a variable that has a type class constraint, then we need to pass the "bundle of functions defined for that type" in as an extra parameter to the function. This ends up being pretty straightforward with a little bit of bookkeeping.
    ## A note about heterogenous lists
    Note that Type Classes do not give you the ability to treat values of different types as interchangeable in the context of data types, only in the context of function calls. This means that you can't, for example, have a heterogenous list of different things that all have defined instances for the same type class (this is a thing that interfaces do provide, by contrast). This is because the "behavior" (the bundle of functions) is provided alongside the runtime value, as opposed to being combined with it. You can have a (list a) where you know that a as in the type class show, but the items of the list will all be the same underlying type, instead of a bunch of different types that all have show.
    One underlying reason for this is that interfaces in go and java use dynamic dispatch (where the compiler doesn't know ahead of time what function to call), and Type Classes (and Traits) use static dispatch. In Rust, you can opt-in to dynamic dispatch, at a cost to performance but a benefit to code size, with [the dyn keyword](https://doc.rust-lang.org/std/keyword.dyn.html). I might try adding something similar to this language later on :) **)

(** ## How does that impact compilation? **)

(** Until now, we've been able to do the code generation step independent of type inference -- in fact, this is what allowed us to completely skip type inference in the bootstrapping compiler. This was because the runtime semantics of our language mapped directly onto our compilation target (JavaScript). If we were trying to compile to a language with more strict type behavior, or especially with manual memory management, this wouldn't have been possible.
    With Type Classes, however, the Code Generation step needs to know things that the Type Inference step has determined, in two cases:
    cannot convert {"id":"c6970f01-d189-463e-a56a-8d0d86ab7d9a","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"at the callsite of a function with type class constraints","styles":{}}],"children":[]}
    cannot convert {"id":"0c3513f3-9e61-4a33-9676-ed5e9ea90a61","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"at the definition site of a function with type class constraints","styles":{}}],"children":[]}
    In both cases, we need to "insert extra parameters", either into the function definition, or the function call. **)

(def are-we-good (= 1.1 2.2))

(** needs to become something like:
    const are_we_good = $resolved_eq_for_floats(1.1)(2.2)
    And the following function: **)

(defn filter-neq [to-remove lst]
    (match lst
        []           []
        [one ..rest] (if (= to-remove one)
                         (filter-neq to-remove rest)
                             [one ..(filter-neq to-remove rest)])))

(** will need to have an extra parameter passed to it: the = function (or in practice the "bundle of functions for the Eq type class") the corresponds to the type of to-remove (which is also the type of the element of lst). **)