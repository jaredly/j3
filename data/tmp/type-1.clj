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

(def prelude "# Prelude")

(defn map [values f]
    (match values
        []           []
        [one ..rest] [(f one) ..(map rest f)]))

(defn mapi [i values f]
    (match values
        []           []
        [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)]))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(deftype scheme (scheme (set string) type))

(defn type-free [type]
    (match type
        (tvar n _)   (set/add set/nil n)
        (tcon _ _)   set/nil
        (tapp a b _) (set/merge (type-types a) (type-types b))))

(defn type-apply [subst type]
    (match type
        (tvar n _)   (match (map/get subst n)
                         (none)   type
                         (some t) t)
        (tapp a b c) (tapp (type-apply subst a) (type-apply subst b) c)
        _            type))

(defn scheme-free [(scheme vbls type)] (set/rm (type-free type) vbls))

(defn scheme-apply [subst (scheme vbls type)]
    (scheme vbls (type-apply (map-without subst vbls) type)))

(defn compose-subst [s1 s2]
    (map/merge (map/map (type-apply s1) s2) s1))

; type-env = (map string scheme)

; subst = (map string type)

(defn remove [tenv var] (map/rm tenv var))

(defn tenv-free [tenv]
    (foldr set/nil (map (map/values tenv) type-free) type-free))

(tenv-free (map/set (map/nil) "lol" (tvar 1 1)))

(map/set (map/nil) "lol" (tvar 1 1))

(map/set (map/nil) 1 2)

(map/get (map/set (map/nil) 1 20) 1)