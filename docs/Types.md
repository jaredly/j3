
# Types in jerd

## "literal" types
- `1` (the type that's just the integer 1), `1.5` float, `2u` uint
- `true`, `false`
- `"hello"` etc.

## builtin atomic types
- int, float, uint
- bool
- string

## type arithmetic
- `(+ 1u uint)` -- all uints >= 1
- `(- 5u uint)` -- 0, 1, 2, 3, 4 or 5
- `(+ 2u (- 5u uint))` - 2 through 5
- `"hello ${string}!"` - strings with the prefix "hello " and suffix "!"

## product types (records & tuples)

- `{name string age int}`
- `(, string int)` (sugar for `{0 string 1 int}`)
- `{...otherRecord height float}` spreading. If otherRecord has a `height` attribute, it will be ignored.
- `{name string age int (= 45)}` - a default value for an attribute. Providing `{name "Ela"}` where that type is expected will automatically fill in the `age` as `45`.
- `()` known as unit, is the record with no attributes.
- `{name string ...}` an "open record" with at least the attribute `name` of type `string`

### SubItem access

- `(.name {name string})` => `string`
- `(.0 (, int string))` => `int`

## union (sum) types

- `['One ('Two int)]` => either `'One` or `('Two 5)` etc.
- `[['One 'Two] ('Three 5)]` equivalent to `['One 'Two ('Three 5)]`, e.g. spreading is automatic
- `[['One ('Two 5)] ('Two 6)]` if there are multiple items with the same tag, the bodies must unify. In this case the type is equivalent to `['One ('Two int)]` because two constant numeric types with the same kind and different values unify to the type of the kind. If the bodies are unable to unify, the type is invalid (e.g. if it were `5` and `6.2`)
- `['One ('Two ['Three]) ('Two ['Four])]` => `['One ('Two ['Three 'Four])]` another example of body unification
- `['One ...]` an "open union" with at least `'One` as an option. When `switch`ing on an open union you must supply a default case.

### Subitem access

- `(.One [('One int) 'Two])` => `[('One int)]`

## function types

`(fn [int string] float)`

notably, no default / rest args (at the moment?). also no auto-currying.

## type variables & application

```clj
(deftype node (tfn [T] {name string data T})
(deftype intNode (node int))
```

Note that `tfn` is also the way to type-abstract an expression, but you need to do `(<> someFn int float)` to type-apply an expression.

## recursive types

```clj
(@loop [
	('Leaf int)
	('Tree (array @recur))
])
```

For non-enum recursive types, you can use a record w/ subitem access:

```clj

(deftype asAndBs (@loop {
	a (, int (array (.b @recur)))
	b (, float (array (.a @recur)))
}))
; a valid instance of asAndBs.a would be
(, 1 [(, 1.1 []) (, 1.2 [(, 3 [])])]))
```

For a more complex example:

```clj
(deftype AST
  (@loop {
    Expr [
      ('Fn (array @recur.Type) @recur.Expr)
      ('Apply @recur.Expr (array @recur.Expr))
      ('String string)
      ('Bool bool)
    ]
    Type [
      ('Builtin string)
      ('TypeApply @recur.Type (array @recur.Type))
      ('Record (array {
        key string
        value @recur.Type
        default ['NoDefault ('Default @recur.Expr)]
      }))
    ]
  })
)
```

## task types

The algebraic effects system makes use of a type macro for convenience.

```clj
(@task [('Read () string) ('Write string ()) 'Notify ('Failure string)] int)
; expands to
(@loop [
	('Return int)
  ('Read () (fn [string] @recur))
  ('Write string (fn [()] @recur))
  ('Notify () (fn [()] @recur))
  ; Note no continuation here; this failure
  ; is unresumable.
  ('Failure string ())
])
```

## type aliases

```clj
(deftype name type)
```


