# Locally Representable Recursion

One thing I'm doing with my type system and language syntax is what I call "locally representable recursion".

```clj
(deftype ab (@loop {
  a (, float (array @recur.b))
  b (, int (array @recur.a))}))
```
