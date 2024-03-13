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

(deftype scheme (scheme (set string) type))

(defn type-free [type]
    (match type
        (tvar n _)   (set/add set/nil n)
        (tcon _ _)   set/nil
        (tapp a b _) (set/merge (type-free a) (type-free b))
        ))

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

; 

; 

(defn remove [tenv var] (map/rm tenv var))

(defn tenv-free [tenv]
    (foldr set/nil (map (map/values tenv) scheme-free) set/merge))

(defn tenv-apply [subst tenv] (map/map (type-apply subst) tenv))

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
        (, (tapp l r) (tapp l' r')) (let [(, s1 nidx)
                                        (mgu l l' nidx)
                                        (, s2 nidx)
                                        (mgu (type-apply s1 r) (type-apply s1 r') nidx)]
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
        (evar n l)                        (match (map/get tenv n)
                                              (none)       (fatal "Unbound variable ${n}")
                                              (some found) (let [(, t nidx) (instantiate found nidx)]
                                                               (,, (map/nil) t nidx)))
        (eprim prim)                      (,, map/nil (t-prim prim) nidx)
        (elambda name nl body l)          (let [(, tv nidx)
                                              (new-type-var name nidx)
                                              env'
                                              (map/rm tenv name)
                                              env''
                                              (map/merge env' (map/set map/nil name (scheme set/nil tv)))
                                              (,, s1 t1 nidx)
                                              (t-expr env'' body nidx)]
                                              (,, s1 (tfn (type-apply s1 tv) t1 l) nidx))
        (eapp target arg l)               (let [(, tv nidx)
                                              (new-type-var "a" nidx)
                                              (,, s1 t1 nidx)
                                              (t-expr tenv target nidx)
                                              (,, s2 t2 nidx)
                                              (t-expr (tenv-apply s1 tenv) arg nidx)
                                              (, s3 nidx)
                                              (mgu (type-apply s2 t1) (tfn t2 tv l) nidx)]
                                              (,,
                                                  (compose-subst s3 (compose-subst s2 s1))
                                                      (type-apply s3 tv)
                                                      nidx))
        (elet (pvar name nl) init body l) (let [(,, s1 t1 nidx)
                                              (t-expr tenv init nidx)
                                              env'
                                              (map/rm tenv name)
                                              t'
                                              (generalize (tenv-apply s1 tenv) t1)
                                              env''
                                              (map/set env' name t')
                                              (,, s2 t2 nidx)
                                              (t-expr (tenv-apply s1 env'') body nidx)]
                                              (,, (compose-subst s1 s2) t2 nidx))
        (elet pat init body l)            (let ([,, ]))
        (ematch target cases l)           (let [(,, s1 t1 nidx)
                                              (t-expr tenv target nidx)
                                              t'
                                              (generalize (tenv-apply s1 tenv) t1)]
                                              (fatal "nope"))
        _                                 (fatal "cannot infer type for ${(valueToString expr)}")))

761

(defn infer [tenv expr]
    (let [(,, s t nidx) (t-expr tenv expr 0)]
        (type-to-string (type-apply s t))))

1476

(infer map/nil (@ ((fn [a] a) 23)))

(infer
    map/nil
        (@
        (let [a 1]
            a)))

(def tint (tcon "int" -1))

(def basic
    (map/set
        map/nil
            "+"
            (scheme set/nil (tfn tint (tfn tint tint -1) -1))))

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

