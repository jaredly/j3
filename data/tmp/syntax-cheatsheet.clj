(** ## Syntax Cheatsheet **)

(** Here's an overview of all of the syntax of version 1 of our language, which will be sufficient to fully self-host the parser, code generator, and type checker.
    The next few documents will go into detail about the language design, so you don't need to internalize everything immediately, but you can use this as a reference as you go forward. **)

(** ## Primitives **)

1

12

;  note that we don't support floats

true

false

(** ## Strings **)

"Hello"

"Hello ${"judy"}"

(def name "May")

"Hello ${name}"

(** Note that, unlike javascript, the expressions you put inside a string must themselves be of type string, otherwise you'll get a type error. **)

"Hello ${(int-to-string 10)}"

(** ## Tuples **)

(** Tuples are a special-cased syntax for a normal userland data type. Any time you see (, a b c d), it will be translated into "nested pairs", so in this case (, a (, b (, c d))). This applies to expressions, patterns, and types. They are handy for when you want to group some things together, but you don't want to define a whole new data type for it (such as "returning multiple values from a function"). **)

(, 1 2 3 4)

(** ## Functions & function calls **)

(** Anonymous functions (sometimes called lambdas) use the special fn form, and can take one or more arguments. **)

(fn [x] x)

(fn [x y] x)

(** At the top level, you can define a function with defn, to make it be globally available. **)

(defn add20 [x] (+ x 20))

(add20 10)

+

(** Functions can be "partially applied", by providing only some of the expected arguments. The result will be another function, that's expecting the remaining arguments. **)

(+ 21)

((+ 21) 10)

(** ## Local variable binding with let **)

(let [x 10] x)

(let [
    x 10
    y 20]
    (+ x y))

(let [x 10] (let [x 20] x))

(let [
    x 10
    y (+ x 20)
    (** You redefine a variable in the same let, using the previous value. **)
    y (+ y 2)]
    y)

(** ## Global bindings with def **)

(def age 10)

(+ age 2)

(** Feel free to define things "out of order"; they will be evaluated in the correct dependency order. **)

(plus21 2)

(def plus21 (+ 21))

(** ## Custom types with deftype **)

(** deftype is the way to define new custom types, similar to type X = in TypeScript, the data X declaration in Haskell, or enum X { } in Rust and Swift.
    A type consists of a name, optionally some type variables, and a list of constructors, which themselves may have arguments, or may not. **)

(deftype field
    (text string)
        (checkbox bool)
        (count int)
        (blank))

(text "hi")

(blank)

(checkbox true)

(** This tuple type is a type we'll be using throughout the tutorial **)

(deftype (, a b)
    (, a b))

(** A very common type is the "optional" (called "Maybe" in haskell). It has a type variable and two constructors, and is used in places where in JavaScript or other places you might have a "nullable" value. **)

(deftype (option a)
    (some a)
        (none))

(** ## Aliases with typealias **)

(** Type aliases are helpful when you have a complex type that you'll be referring to a lot. They will get substituted in to the bodies of deftypes and other typealiases, and have no impact on the type inference algorithm, and no runtime representation. **)

(typealias maybe-int (option int))

(deftype something
    (bears maybe-int)
        (bees int))

bears

(** ## Pattern matching with match **)

(** You can match primitives: **)

(match true
    true  1
    false 0)

(match "hi"
    "ho" 2
    "hi" 10
    _    15)

(match 10
    0 "is zero"
    1 "is one"
    _ "something else")

(** And custom datatypes: **)

(match (text "hi")
    (blank)     "blank"
    (count _)   "a count"
    (text name) "Text: ${name}"
    _           "something else")

(defn report-age [age]
    (match age
        (some value) "Age is ${(int-to-string value)}"
        (none)       "Age is not reported"))

(report-age (some 10))

(report-age (none))

(** ## Quoting **)

(** "Quoting" allows us to get at the AST (or CST) at "runtime", so that we can test out our own parser and compiler :) **)

(** @ is for parsing expressions **)

(@ 1)

(@ (, 1 "2 ${a}"))

(** @! is for toplevels **)

(@! (def x 10))

(@!
    (deftype (option a)
        (some a)
            (none)))

(** @t is for types **)

(@t int)

(@t (list bool))

(** @p is for patterns **)

(@p _)

(@p a)

(@p [a 2 ..rest])

(** @@ is for the CST (Concrete Syntax Tree), which is what the parser consumes to produce expressions, types, patterns, and toplevels. **)

(@@ abc)

(@@ [a "b" {a b} ..cd])

(** ## "Do notation" with let->
    Making purity & immutability a little less cumbersome **)

(** Because our language is fully immutable, some things can require a lot of plumbing that can really get in the way of readability. For example, in our type inference algorithm we'll need to keep track of an incrementing integer so we can produce unique ids for type variables. Without a specialized syntax, this would require passing the next-id variable into -- and out of -- almost every function, which would get really annoying. Fortunately, our friends in haskell-land have come up with a nice way of abstracting this out, called "do notation". We'll be taking inspiration from this for our let-> syntax sugar.
    The simplest usage of let-> would be something akin to swift's try or rust's ? suffix, allowing us to have nice error handling without resorting to throwing exceptions.
    Here's a simple parsing example, without any sugar: **)

(deftype (result good bad)
    (ok good)
        (err bad))

(defn parse-person [data]
    (match (parse-name data)
        (err reason) (err reason)
        (ok name)    (let [greeting "Hello ${name}"]
                         (match (parse-address data)
                             (err reason) (err reason)
                             (ok address) (ok "${greeting}, you live at ${address}")))))

(** Because both parse-name and parse-address might fail, we have to match the results, which gets pretty messy. In contrast, here's what it looks like with let->: **)

(defn parse-person2 [data]
    (let-> [
        name     (parse-name data)
        greeting (<- "Hello ${name}")
        address  (parse-address data)]
        (<- "${greeting}, you live at ${address}")))

(** This is much nicer! And you can imagine how the match version would get even more annoying the more things you want to parse. Now let's look at what this desugars into: **)

(defn parse-person3 [data]
    (>>=
        (parse-name data)
            (fn [name]
            (>>=
                (<- "Hello ${name}")
                    (fn [greeting]
                    (>>=
                        (parse-address data)
                            (fn [address] (<- "${greeting}, you live at ${address}"))))))))

(** Arguably even more obtuse than the match version 😅 but that's fine because it's not the version we have to look at. The >>= operator ( > > = without ligature-smooshing) is called "bind", and roughly translates to "take this wrapped value, and run this function on the contents", and <- is my name for return (sometimes called pure), which translates to "wrap this value".
    The reason greeting's value has to be wrapped with <- is that everything in a let-> needs to be a "wrapped value" (in this case, a result), in order for the types to make sense.
    Here are the definitions of >>= and <- for result: **)

(defn >>= [result next]
    (match result
        (err e)    (err e)
        (ok value) (next value)))

(def <- ok)

(** So this was an example using the do-notation with the result type for handling errors, but in the "Self-Hosted Type Inference" document we'll be using a somewhat more complicated version, which will allow us the to have the illusion of mutable state :). **)



(defn parse-address [data] ;  some parsing (ok "earth"))

(defn parse-name [data] ;  do something (ok "olive"))

(, parse-person parse-person2 parse-person3)