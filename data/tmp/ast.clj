(** ## Abstract Syntax Tree **)

(** Once we have our runtime encoding (primitives, functions, and algebraic data types), we need to decide on an Abstract Syntax Tree. Once again we'll keep the list relatively short, with the goal of "the simplest language that's still nice to use".
    Note: If any of this feels confusing, jump over to the [Syntax Cheatsheet](/syntax-cheatsheet) to see concrete examples. **)

(** Utility Types **)

(** These are two types we'll be using all over the place, including in the AST. They're defined here for reference. **)

((** A basic linked list **)
    deftype (list a)
    (nil)
        (cons a (list a)))

((** Our handy tuple type. Remember that n-ary tuples get desugared into pairs, so (, a b c) is really (, a (, b c)). **)
    deftype (, a b)
    (, a b))

(** ## Type Definitions **)

(** Some notes:
    - the final integer on each form represents the unique "location" ID of CST node that it came from. This allows us to do accurate error reporting and "hover for type" and such.
    - We're prefixing constructor names (e.g. p for prim, e for expr) to prevent name conflicts between the types, as they all share the same namespace. **)

(** ## Primitives
    We break out primitives into their own type, because they apply both to patterns and expressions. **)

(deftype prim
    (pint int int)
        (pbool bool int))

(** ## Expressions
    Expressions make up the bulk of the code you'll be writing: variable references, function definitions, function calls, etc. -- even if and let (in contrast to imperative languages such as JavaScript, where those would be statements). **)

(deftype expr
    (** Primitives, not much to see here. **)
        (eprim prim int)
        (** estr is a string literal. It doesn't get lumped in with the primitives, because it might have embedded expressions. This is inspired by JavaScript's template strings and swift's string interpolations. The first string is the "prefix", and if the string contains no interpolations, then the second list will be empty. Otherwise, it will contain a list of pairs, first the expression, and then the string suffix.
        So "Hello ${world}!" would parse into (estr "Hello" [(, (evar "world") "!")]) **)
        (estr string (list (, expr string int)) int)
        (** a variable reference! might be local or global. **)
        (evar string int)
        (** A lambda is a function expression (or "arrow function" in JavaScript). It consists of a list of arguments and a body. As our language has automatic currying, the arguments will be "unrolled", such that (fn [a b] c) is sugar for (fn [a] (fn [b] c)). **)
        (elambda (list pat) expr int)
        (** Function application (or "function call") consists of a target (the function) and a list of arguments. At runtime, these arguments are applied one-by-one. **)
        (eapp expr (list expr) int)
        (** let expressions have a list of bindings and a body where those bindings will be in scope. It values to the value of that body. **)
        (elet (list (, pat expr)) expr int)
        (** The "match" expression is analogous to a switch statement from JavaScript, Swift, or Rust. It has a target expression, and a list of cases. The first pattern that matches gets evaluated. **)
        (ematch expr (list (, pat expr)))
        (** The "quote" expression is mostly helpful for macros or if you're building a compiler. Our language doesn't have macros (yet? 😉) but we sure are building a compiler, so having full quoting support will be invaluable. In traditional lisps, the quote form is ' (such as '(a b)), but we'll be using @ for quoted expressions, @! for toplevels, @p for patterns, @t for types, and @@ for accessing the CST directly.
        Basically, if we want to test out type inference, we can do (infer/expr (@ [1 2 3])), and if we want to test parsing, we can do (parse/expr (@@ [1 2 3])). **)
        (equot quot int))

(deftype quot
    (quot/expr expr)
        (quot/top top)
        (quot/type type)
        (quot/pat pat)
        (quot/quot cst))

(deftype cst
    (cst/list (list cst) int)
        (cst/array (list cst) int)
        (cst/spread cst int)
        (cst/id string int)
        (cst/string string (list (, cst string int)) int))

(** ## Patterns
    Sometimes referred to as l-values (things that can go on the "left hand of an assignment"), patterns show up as function arguments, the left side of a let binding, or in match cases.  **)

(deftype pat
    (** the "any" pattern is an underscore _ **)
        (pany int)
        (** this is for binding a value to a name **)
        (pvar string int)
        (** matching a primitive literal **)
        (pprim prim int)
        (** strings in pattern-matching don't support templates ${} at the moment, but it could be cool to support that at some point. "Hello ${name}" would then match any string with the prefix "Hello ", and bind the rest to the name name. **)
        (pstr string int)
        (** this is how we match algebraic data types.
        for example, (pcon "," [(pvar "a") (pvar "b")]) for the pattern (, a b) **)
        (pcon string (list pat) int))

(** ## Types
    Given that our language is fully inferred (and we don't actually support putting manual type annotations on things yet), the only place you'll see types is when defining custom types with deftype or typealias. **)

(deftype type
    (** Type Variable
        tvar represents a type variable, with a name that's autogenerated to be unique. **)
        (tvar string int)
        (** Type Application
        target, arg, like the type (list int) **)
        (tapp type type int)
        (** "Concrete" type
        int or list, etc. **)
        (tcon string int))

(** You'll notice there's no "function type" here. This follows the shortcut that lots of type inference papers make, skipping out on a dedicated "function" type, and instead representing it with a constructor, often called ->.
    So the type (fn [int] string) would be represented as (tapp (tapp (tcon "->") (tcon "int")) (tcon "string")). **)

(** ## Toplevels
    These are our toplevel forms; value & type definitions, and toplevel expressions. **)

(deftype top
    (** Defining custom types! We have the name of the type, and then a list of constructors, each with a name and a list of arguments. **)
        (tdeftype string int (list (, string (list type) int)) int)
        (** e.g. (def x 2).
        (defn x [a] b) gets parsed as (def x (fn [x] b)) **)
        (tdef string expr int)
        (** A toplevel expression **)
        (texpr expr int)
        (** A type alias e.g. (typealias names (list string)) **)
        (ttypealias string int (list string) type int))

