(** ## Let's talk about Type Classes! **)

(** ## What are type classes? **)

(** The name "Type Class" comes from mathematical theory which, honestly, I don't care a whole ton about. However, it's [probably](https://twitter.com/jaredforsyth/status/1790772089579876757) the most recognized term for [the ability to associate a bundle of methods with a given type in a fully-inferred manner], so I'll be using it here. Other terms from other languages include "Traits" in Rust and Scala and "Abilities" in Roc. "Interfaces" from Java and Go are a similar concept but have some fundamental differences that I'll discuss in a bit.
    So far, we've been able to have functions that have the same implementation for different types through the use of "parametric polymorphism". A classic example is map: **)

(defn map [f lst]
    (match lst
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(** The type of map is forall a, b : (fn [(fn [a] b) (list a)] (list b)).
    Another thing that we end up wanting is the ability to have different implementations for different types. A classic example for this is the "equality" operator (often == or === or, in lisps, =). So far we've been able to kindof wave this off by having the runtime provide a fully-generic = function, which does a structural comparison behind the scenes. Unfortunately, this doesn't allow us to provide a custom implementation for types where some of the structure is irrelevant to equality (for example, in our AST, we shouldn't care about the loc IDs when comparing types for equality). We'd like to be able to "define = for expr" and "define = for scheme" and then have the = method "just know" which implementation to use based on what we pass to it. This would also be handy in our foo->s (turn this into a string), foo/subst and foo/free classes of functions.
    That is what Type Classes enable. In essence, you have the ability to "place a constraint" on a type (variable or concrete), asserting the existence of a given function (like =) implemented for whatever concrete type it ends up resolving to. If, at compile time, there hasn't been an "instance" defined for that type, then it will error. Otherwise, the compiler will "resolve" the call from = into foo=.
    Type Classes will also be essential in allowing us to have different kinds of numbers (both ints and floats, for example) without resorting to different operators for each kind of number, as OCaml does with + for int and +. for float.
    In practice, it's very handy for the constraint to indicate that a whole suite of functions is defined for the given type, instead of just one. For example, the number type class would have all of your normal arithmetic operations defined, such as +, -, *, and so on.
    In the case of polymorphic functions, it's only slightly more complicated. If we have a function that takes a variable that has a type class constraint, then we need to pass the "bundle of functions defined for that type" in as an extra parameter to the function. This ends up being pretty straightforward with a little bit of bookkeeping.
    ## A note about heterogenous lists
    Note that Type Classes do not give you the ability to treat values of different types as interchangeable in the context of data types, only in the context of function calls. This means that you can't, for example, have a heterogenous list of different things that all have defined instances for the same type class (this is a thing that interfaces do provide, by contrast). This is because the "behavior" (the bundle of functions) is provided alongside the runtime value, as opposed to being combined with it. You can have a (list a) where you know that a as in the type class show, but the items of the list will all be the same underlying type, instead of a bunch of different types that all have show.
    One reason for this is that interfaces in go and java use dynamic dispatch (where the compiler doesn't know ahead of time what function to call), and Type Classes (and Traits) use static dispatch. In Rust, you can opt-in to dynamic dispatch, at a cost to performance but a benefit to code size, with [the dyn keyword](https://doc.rust-lang.org/std/keyword.dyn.html). I might try adding something similar to this language later on :)
    In our implementation, we will actually be using dynamic dispatch to simplify compilation, as the alternative involves monomorphization at the whole-program level, and our structured editor relies pretty heavily on incremental compilation. It wouldn't be too hard to make a "release mode" for the compiler that does all of that, however. **)

(** ## How are they different from interfaces? **)

(** If you're coming from a mainstream language like Java, Go, or C++, you may be familiar with "interfaces", which are designed to solve a similar problem. Interfaces differ in a couple of key ways:
    - interfaces bundle the methods along with the value, effectively hiding the underlying type. This means that you can have an Array with elements of all different underlying types that implement the same interface, but it also means that, if you want to get at the underlying type, you need to do some kind of runtime type assertion or unpacking. With Type Classes, the value's type is unmasked, and the functionality is available alongside the value.
    - interfaces rely on dynamic dispatch (the compiler can't statically resolve the location of the function that will be called), whereas type classes allow static dispatch (in our implementation, we'll still be using dynamic dispatch because it makes for simpler code generation). In Rust, you can essentially convert a trait into an interface with [the dyn keyword](https://doc.rust-lang.org/std/keyword.dyn.html), giving you both dynamic dispatch and the ability to pack heterogenous types into the same Array.
    - type classes allow for ad-hoc composition: a variable can have any number of type class constraints on it, all fully inferred from the ways that it is used. By contrast, composing two or more interfaces requires making a new interface definition for the composition (I'm personally not sure if this is a fundamental limitation of interfaces, or just a design choice made by all of the languages that use interfaces). **)

(** ## How does it impact Type Inference? **)

(** Crucially, Type Classes have no impact on type inference; they are only relevant for type checking. Put another way, a type class constraint will never influence the inferred type of a variable, instead their only role is to produce a type error if, after inference has completed, there is a type with a constraint that cannot be satisfied by available instances.
    This is fantastic, because it means that adding type classes requires very little change to our type inference algorithm -- basically, whenever we encounter a variable reference for a function with type class constraints, we hang on to those constraints, and at the end of doing type inference for a toplevel value, we tally up the constraints and attach them to the resulting type (this is glossing over some details, which we'll get into in the implementation). **)

(** ## The weird little case of numeric literals **)

(** Ok I lied just a little bit -- there is one case where a type class constraint can influence the inferred type for a value, and it is: when there is a type variable that doesn't appear in the final resolved type of a toplevel, that has a type class constraint. In that case, the constraint can result in the variable being resolved into a concrete type.
    How is it possible for there to be a type variable that isn't related to the final type? Numeric literals.
    Turns out it's really convenient to be able to write 10 and have it be inferred from context whether it should be interpreted as an int, int23, float, etc. In order to make this work, numeric literals need to be handled a little differently. In the inference algorithm, a numeric literal is assigned a fresh type variable with a type class constraint (either floating if it has a decimal point in it, or num otherwise), instead of being given a concrete type like booleans and strings.
    This works out great much of the time, where there's either enough context to lock it down to something specific, or it ends up being a polymorphic variable of the definition where it shows up. It is however possible to produce a case where it's neither constrained by context nor generic in the definition, and these cases are almost exclusively limited to simple examples you might type into a repl 😅. Consider, for example, the toplevel expression (+ 2 2). Type inference will ensure that both numeric literals unify to the same type variable, and that it's unified with the generic type of +, but that still leaves us with the return type of the expression being a type variable that simply has the constraint of being in the class num.
    For these edge cases, we cheat a little bit. For any type variables in this situation, we go through the following types, picking the first one that satisfies all of the type class constraints: int, double, float, and unit. Fortunately, it's impossible by definition for those type variables to impact any other part of the inference, so doing this doesn't break anything. **)

(** Ok there's one more thing we have to talk about with type inference, and it has to do with ordering, dependencies, and user-defined type class instances.
    Previously, we've been able to determine dependencies between toplevel terms purely on the basis of syntax (see the externals method in the bootstrap or self-hosted parser documents). With type classes, this is no longer the case. If we see a function call to +, we need to know that the types are of the arguments in order to know which instance of the class num that this usage is dependent on. One way to deal with this is just to require that all instances be defined before they are used, and to process all toplevels in order from the top of the document to the bottom. Unfortunately, it's very nice to be able to arrange toplevels in any order we choose, and have the editor work out dependencies after the fact.
    My solution to this is a two-pass type inference procedure. In the first pass, we do inference and add any user-defined instances we find to the type environment. In in the second pass, we resolve type class constraints against that fully-populated type environment. **)

(** ## How does that impact compilation? **)

(** Until now, we've been able to do the code generation step independent of type inference -- in fact, this is what allowed us to completely skip type inference in the bootstrapping compiler. This was because the runtime semantics of our language mapped directly onto our compilation target (JavaScript). If we were trying to compile to a language with more strict type behavior, or especially with manual memory management, this wouldn't have been possible.
    With Type Classes, however, the Code Generation step needs to know things that the Type Inference step has determined, in two cases:
    cannot convert {"id":"c6970f01-d189-463e-a56a-8d0d86ab7d9a","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"at the callsite of a function with type class constraints","styles":{}}],"children":[]}
    cannot convert {"id":"0c3513f3-9e61-4a33-9676-ed5e9ea90a61","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"at the definition site of a function with type class constraints","styles":{}}],"children":[]}
    In both cases, we need to "insert extra parameters", either into the function definition, or the function call. **)

(def are-we-good (= 1.1 2.2))

(** needs to become something like:
    const are_we_good = $eq($resolved_eq_for_floats)(1.1)(2.2)
    And the following function: **)

(defn filter-neq [to-remove lst]
    (match lst
        []           []
        [one ..rest] (if (= to-remove one)
                         (filter-neq to-remove rest)
                             [one ..(filter-neq to-remove rest)])))

(** will need to have an extra parameter passed to it: the = function (or in practice the "bundle of functions for the Eq type class") the corresponds to the type of to-remove (which is also the type of the element of lst).
    So the definition would look something like:
    const filter_neq = ($resolved_eq_for_a) => (to_remove) => (lst) => {
    ...
    if ($eq($resolved_eq_for_a)(to_remove)(one)) { 
    And that should be enough to implement type classes! **)

(** ## What does it look like to use? **)

(** We could have Type Classes without allowing user-defined classes or instances (and in fact, that is what we will do to start), but to unlock the full goodness of Type Classes we'll definitely want to allow users to create their own. This will consist of (1) defining a class, and (2) defining "instances" of the class, e.g. an implementation of the functions of that class for a given type. **)

(defclass (has-variables t)
    {apply (fn [subst t] t) free (fn [t] (set string))})

(** This class encompasses two pieces of functionality that we've needed in our type inference algorithm: applying a type substitution map (mapping type variables to replacement types) and getting the set of free (unbound) type variables in a given thing. This is what it would look like to make an instance of that class for our type type. **)

(definstance (has-variables type)
    {
        apply (fn [subst type]
                  (match type
                      (tvar id _)      (match (map/get subst id)
                                           (some v) v
                                           _        type)
                      (tapp one two l) (tapp (apply subst one) (apply subst two) l)
                      (tcon _ _)       type))
        free  (fn [t]
                  (match t
                      (tvar id _)      (set/add set/nil id)
                      (tapp one two _) (set/merge (free one) (free two))
                      _                set/nil))})

(** Using functions from a Type Class is exactly the same as using any other function; in fact, they are defined in the type environment as normal values that happen to have a type class constraint. **)