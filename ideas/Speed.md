
# HOW TO SPEED

I want a compilation pipeline that does optimizations.
like
```
; js j/expr
(deftype (either l r) (left l) (right r))
(deftype j/expr
  (j/app j/expr (array j/expr) int)
  (j/bin string j/expr j/expr int)
  (j/un string j/expr int)
  (j/lambda (array j/pat) (either block j/expr) int)
  (j/prim prim int)
  (j/var string int)
  (j/attr j/expr string int)
  (j/index j/expr j/expr int)
  (j/tern j/expr j/expr j/expr int)
  (j/assign string string j/expr int)
  (j/array (array (either j/expr (spread j/expr))) int)
  (j/obj (array (either (, string j/expr) (spread j/expr))) int))

(typealias block (array j/stmt))

(deftype (spread a) (spread a))

(deftype j/stmt
  (j/expr j/expr int)
  (j/block block int)
  (j/if j/expr block (option block) int)
  (j/for string j/expr j/expr j/expr block)
  (j/break int)
  (j/continue int)
  (j/return j/expr int)
  (j/let j/pat j/expr int)
  (j/throw j/expr int))

(deftype j/pat
  (j/pvar string int)
  (j/parray (array j/pat) (option j/pat) int)
  (j/pobj (array (, string j/expr)) int))
```
So that could be the javascript target.

And then I could do reductions on that.
