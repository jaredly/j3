
So, thinking about how the editor can respond to your typing.
By changing the inferred types of things.

So, something that doesn't have an inferred type has a type hole, right?
maybe idk

anyway

(fn [a b])

we know nothing, and maybe the type of this fn is just unresolved idk

(fn [a b] (+))

we also don't know what the + is, it's unresolved

(fn [a b] (+ 1))

ok we can resolve the plus to the [int int] version? or alternatively we can specialize a generic plus that has a :numeric constraint, so that it has int as the type argument. whatever works

(fn [a b] (+ 1 a))

ok now we know that a is `int` and we can add that to the tree.


