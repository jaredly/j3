# Grounded Type Inference from the Ground Up

Lots of type inference tutorials teach you the fundamentals of type inference, but on a much-restricted pseudo-language, leaving a lot of the work of "making this function in a real context" as an exercise to the reader. A rare exception to this is "Typing Haskell in Haskell", which really does give you inference for just about all of Haskell98.

To ground this tutorial, we'll be doing *self-hosted* type inference; that is the inference engine we produce will be sufficient to type-infer all of the code that we write.

Starting things off, we'll build a basic Hindley Milner impl with a couple of additions beyond the traditional "lambda calculus + let"; we'll need unions & tuples to represent the AST, a fairly limited `match` function to do pattern matching, and a handful of builtin functions.

## Papers

"Algorithm M" maybe?
https://dl.acm.org/doi/10.1145/291891.291892


## Things to highlight

Talking through the "what's the smallest surface area that can self-host its inference?"
Start with basic lambda calculus
ok but now we need to be able to represent the data structure as an AST
we could do something terrible like use magic numbers in a single massive array
but we're not doing this to punish ourselves.

Do we need generic type constructors?
Yes, in order to have tuples and arrays.
You could concievably do without arrays,
but skipping tuples would be maybe impossible? Or at least really hacky.


##

multiple syntaxes??
but then: lambda-calcuilus wasm
"getting started guide is write your own interpreter"

but then effect types!

.one .two

> Effect types!
Color lines based on what effects they do

