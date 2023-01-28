
# Unison

## Similar

Hash addressing ✅

Can have multiple terms with the same name.

Algebraic effects

## Different

all types are structural, and internal names are meaningful

In unison, `{name: string, age: int}` is the same type as `{street: string, number: int}`, unless you make them unique types, in which case one `{name: string, age: int}` is different from another `{name: string, age: int}` if it's defined in two different places.

No auto-currying

Algebraic effects are first-class

# Roc

## Similar

Tags
All types are structural

## Different

Rank 2 polymorphism
not sure about Tag unification?

literal tyeps

# TypeScript

## Similar

Structural types

## Different

TS can do arbitrary type unions (e.g. string | int).
We do not.

Pure, functional

# Koka




