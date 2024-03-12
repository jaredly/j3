(def ast "# AST")

(deftype (array a) (nil) (cons a (array a)))

(deftype expr
    (eprim prim int)
        (estr first (array (, expr string int)) int)
        (evar string int)
        (equot expr int)
        (equotquot cst int)
        (elambda string int expr int)
        (eapp expr expr int)
        (ematch expr (array (, pat expr int)) int))

(deftype prim (pint int int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string (array pat) int)
        (pstr string int)
        (pprim prim int))

(deftype type (tvar int int) (tapp type type int) (tcon string int))

(deftype stmt
    (sdeftype string (array (, string (array type int))) int)
        (sdef string expr int)
        (sexpr expr int))

(defn concat [a b]
    (match a
        []         b
        [a]        [a ..b]
        [a ..rest] [a ..(concat rest b)]))

(deftype scheme (scheme (array string) type))

(defn type-free [type]
    (match type
        (tvar n _)   [n]
        (tcon _ _)   []
        (tapp a b _) (concat (type-types a) (type-types b))))

(defn type-apply [subst type]
    (match type
        (tvar n _)   (match (map/get subst n)
                         (none)   type
                         (some t) t)
        (tapp a b c) (tapp (type-apply subst a) (type-apply subst b) c)
        _            type))

(defn scheme-free [(scheme vbls type)]
    (set-without (type-free type) vbls))

(defn scheme-apply [subst (scheme vbls type)]
    (scheme vbls (type-apply (map-without subst vbls) type)))

(map/nil)

(map/set (map/nil) 1 2)

(map/get (map/set (map/nil) 1 20) 1)