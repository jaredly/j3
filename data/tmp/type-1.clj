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

(deftype type
    (tvar string int)
        (tapp type type int)
        (tcon string int))

(deftype stmt
    (sdeftype string (array (, string (array type int))) int)
        (sdef string expr int)
        (sexpr expr int))

(defn type-to-string [t]
    (match t
        (tvar s _)                          s
        (tcon s _)                          s
        (tapp (tapp (tcon "->" _) a _) b _) "(${(type-to-string a)}) -> ${(type-to-string b)}"
        (tapp a b _)                        "(${(type-to-string a)} ${(type-to-string b)})"))

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

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

(deftype scheme (scheme (set string) type))

<dom node>

(defn type-free [type]
    (match type
        (tvar n _)   (set/add set/nil n)
        (tcon _ _)   set/nil
        (tapp a b _) (set/merge (type-free a) (type-free b))
        ))

(defn scheme-free [(scheme vbls type)] (set/rm (type-free type) vbls))

(defn tenv-free [tenv]
    (foldr set/nil (map (map/values tenv) scheme-free) set/merge))

<dom node>

(defn type-apply [subst type]
    (match type
        (tvar n _)   (match (map/get subst n)
                         (none)   type
                         (some t) t)
        (tapp a b c) (tapp (type-apply subst a) (type-apply subst b) c)
        _            type))

(defn scheme-apply [subst (scheme vbls type)]
    (scheme vbls (type-apply (map-without subst vbls) type)))

(defn tenv-apply [subst tenv] (map/map (scheme-apply subst) tenv))

<dom node>

(defn compose-subst [earlier later]
    (map/merge (map/map (type-apply earlier) later) earlier))

(def test-subst
    (map/from-list [(, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))]))

(,
    (fn [x] (map/to-list (compose-subst test-subst (map/from-list x))))
        [(,
        [(, "x" (tvar "a" -1))]
            [(, "x" (tcon "a-mapped" -1))
            (, "a" (tcon "a-mapped" -1))
            (, "b" (tvar "c" -1))])
        (,
        [(, "c" (tcon "int" -1))]
            [(, "c" (tcon "int" -1)) (, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))])
        (,
        [(, "a" (tvar "b" -1))]
            [(, "a" (tvar "c" -1)) (, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))])])

(defn remove [tenv var] (map/rm tenv var))

(defn generalize [tenv t]
    (scheme (set/diff (type-free t) (tenv-free tenv)) t))

(defn new-type-var [prefix nidx]
    (, (tvar "${prefix}:${nidx}" -1) (+ 1 nidx)))

(defn free-for-vars [vars coll nidx]
    (match vars
        []         (, coll nidx)
        [v ..rest] (let [(, vn nidx) (new-type-var v nidx)]
                       (free-for-vars rest (map/set coll v vn) nidx))))

(free-for-vars ["a" "b" "c"] (map/nil) 0)

1219

(defn instantiate [(scheme vars t) nidx]
    (let [(, subst nidx) (free-for-vars (set/to-list vars) (map/nil) nidx)]
        (, (type-apply subst t) nidx)))

(defn mgu [t1 t2 nidx]
    (match (, t1 t2)
        (, (tapp l r) (tapp l' r')) (let [
                                        (, s1 nidx) (mgu l l' nidx)
                                        (, s2 nidx) (mgu (type-apply s1 r) (type-apply s1 r') nidx)]
                                        (, (compose-subst s1 s2) nidx))
        (, (tvar u _) t)            (, (var-bind u t) nidx)
        (, t (tvar u _))            (, (var-bind u t) nidx)
        (, (tcon a _) (tcon b _))   (if (= a b)
                                        (, map/nil nidx)
                                            (fatal "cant unify"))
        _                           (fatal "cant unify ${(valueToString t1)} ${(valueToString t2)}")))

(defn var-bind [u t]
    (match t
        (tvar v _) (if (= u v)
                       map/nil
                           (map/set map/nil u t))
        _          (if (set/has (type-free t) u)
                       (fatal "occurs check")
                           (map/set map/nil u t))))

(defn t-prim [prim]
    (match prim
        (pint _ l)  (tcon "int" l)
        (pbool _ l) (tcon "bool" l)))

(defn tfn [a b l] (tapp (tapp (tcon "->" l) a l) b l))

(defn t-expr [tenv expr nidx]
    (match expr
        (evar name l)                     (match (map/get tenv name)
                                              (none)       (fatal "Unbound variable ${name}")
                                              (some found) (let [(, t nidx) (instantiate found nidx)]
                                                               (,, (map/nil) t nidx)))
        (eprim prim)                      (,, map/nil (t-prim prim) nidx)
        (elambda name nl body l)          (let [
                                              (, arg-type nidx)              (new-type-var name nidx)
                                              env-with-name                  (map/merge tenv (map/set map/nil name (scheme set/nil arg-type)))
                                              (,, body-subst body-type nidx) (t-expr env-with-name body nidx)]
                                              (,,
                                                  body-subst
                                                      (tfn (type-apply body-subst arg-type) body-type l)
                                                      nidx))
        (eapp target arg l)               (let [
                                              (, result-var nidx)                (new-type-var "a" nidx)
                                              (,, target-subst target-type nidx) (t-expr tenv target nidx)
                                              (,, arg-subst arg-type nidx)       (t-expr (tenv-apply target-subst tenv) arg nidx)
                                              (, unified-subst nidx)             (mgu
                                                                                     (type-apply arg-subst target-type)
                                                                                         (tfn arg-type result-var l)
                                                                                         nidx)]
                                              (,,
                                                  (compose-subst
                                                      unified-subst
                                                          (compose-subst arg-subst target-subst))
                                                      (type-apply unified-subst result-var)
                                                      nidx))
        (elet (pvar name nl) init body l) (let [
                                              (,, init-subst init-type nidx) (t-expr tenv init nidx)
                                              init-scheme                    (generalize (tenv-apply init-subst tenv) init-type)
                                              env-with-name                  (map/set tenv name init-scheme)
                                              e2                             (tenv-apply init-subst env-with-name)
                                              (,, body-subst body-type nidx) (t-expr e2 body nidx)]
                                              (,, (compose-subst init-subst body-subst) body-type nidx))
        (elet pat init body l)            (let [
                                              (,, init-subst init-type nidx) (t-expr tenv init nidx)
                                              (,, pat-type bound-env nidx)   (t-pat tenv pat nidx)
                                              (,, body-subst body-type nidx) (t-expr (tenv-apply init-subst bound-env) body nidx)
                                              (, unified-subst nidx)         (mgu init-type pat-type nidx)]
                                              (,,
                                                  (compose-subst
                                                      unified-subst
                                                          (compose-subst init-subst body-subst))
                                                      body-type
                                                      nidx))
        (ematch target cases l)           (let [
                                              (,, s1 t1 nidx) (t-expr tenv target nidx)
                                              t'              (generalize (tenv-apply s1 tenv) t1)]
                                              (fatal "nope"))
        _                                 (fatal "cannot infer type for ${(valueToString expr)}")))

(defn t-pat [tenv pat nidx]
    (match pat
        (pvar name nl) (let [])))

(defn infer [tenv expr]
    (let [(,, s t nidx) (t-expr tenv expr 0)]
        (type-to-string (type-apply s t))))

(infer map/nil (@ ((fn [a] a) 23)))

(infer
    map/nil
        (@
        (let [a 1]
            a)))

(def tint (tcon "int" -1))

(def basic
    (map/set
        (map/set
            map/nil
                "+"
                (scheme set/nil (tfn tint (tfn tint tint -1) -1)))
            ","
            (scheme
            (set/add set/nil "a")
                (tfn (tvar "a" -1)
                (tfn (tvar "a" -1)
                    (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "a" -1) -1)
                        -1)
                    -1))))

(infer basic (@ (+ 2 3)))

(infer
    basic
        (@
        (let [a 1]
            a)))

(,
    (infer basic)
        [(, (@ +) "(int) -> (int) -> int")
        (,
        (@
            (let [a 1]
                a))
            "int")
        (,
        (@
            (let [(, a b) (, 2 3)]
                a))
            )
        (, (@ 123) "int")
        (, (@ (fn [a] a)) "(a:0) -> a:0")
        (, (@ (fn [a] (+ 2 a))) "(int) -> int")
        (,
        (@
            (match 1
                1 1))
            )])

1987