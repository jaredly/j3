(** ## Syntax Cheatsheet **)

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

(** A very common type is the "optional" (called "Maybe" in haskell). It has a type variable and two constructors, and is used in places where in JavaScript or other places you might have a "nullable" value. **)

(deftype (option a)
    (some a)
        (none))

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

(** @@ is for the CST **)

(@@ abc)

(@@ [a "b" {a b} ..cd])