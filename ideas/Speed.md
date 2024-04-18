
# HOW TO SPEED

I want a compilation pipeline that does optimizations.
like
```
; js expr
(deftype (either l r) (left l) (right r))
(deftype expr
  (eapp expr (array expr) int)
  (ebin string expr expr int)
  (eun string expr int)

  (elambda (array pat) (either block expr) int)
  (eprim prim int)
  (evar string int)

  (eattr expr string int)
  (eindex expr expr int)

  (etern expr expr expr int)
  ; "x" "+=" 2
  (eassign string string expr int)
  (earray (array (either expr (spread expr))) int)
  (eobj (array (either (, string expr) (spread expr))) int))

(typealias block (array stmt))

(deftype (spread a) (spread a))

(deftype stmt
  (sexpr expr int)
  (sblock block int)
  (sif expr block (option block) int)
  (sfor string expr expr expr block)
  (sreturn expr int)
  (slet pat expr int)
  (sthrow expr int))

(deftype pat
  (pvar string int)
  (parray (array pat) (option pat) int)
  (pobj (array (, string expr)) int))
```
So that could be the javascript target.

And then I could do reductions on that.
