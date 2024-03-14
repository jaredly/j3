<dom node>

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

<dom node>

(defn map [values f]
    (match values
        []           []
        [one ..rest] [(f one) ..(map rest f)]))

(defn mapi [i values f]
    (match values
        []           []
        [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)]))

(defn zip [one two]
    (match (, one two)
        (, [] [])               []
        (, [a ..one] [b ..two]) [(, a b) ..(zip one two)]
        _                       []))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

<dom node>

(deftype scheme (scheme (set string) type))

(deftype tconstructor
    (tconstructor
        ; free variables
            (set string)
            ; arguments
            (array type)
            ; the resulting type
            type))

(deftype tenv
    (tenv
        (map string scheme)
            (map string tconstructor)
            (map string (set string))))

(defn tenv/type [(tenv types _ _) key] (map/get types key))

(defn tenv/con [(tenv _ cons _) key] (map/get cons key))

(defn tenv/names [(tenv _ _ names) key] (map/get names key))

(defn tenv/rm [(tenv types cons names) var]
    (tenv (map/rm types var) cons names))

(defn tenv/set-type [(tenv types cons names) k v]
    (tenv (map/set types k v) cons names))

<dom node>

(defn type-free [type]
    (match type
        (tvar n _)   (set/add set/nil n)
        (tcon _ _)   set/nil
        (tapp a b _) (set/merge (type-free a) (type-free b))
        ))

(defn scheme-free [(scheme vbls type)]
    (set/diff (type-free type) vbls))

(defn tenv-free [(tenv types _ _)]
    (foldr set/nil (map (map/values types) scheme-free) set/merge))

(,
    (fn [a] (set/to-list (scheme-free a)))
        [(, (scheme (set/from-list ["a"]) (tvar "a" -1)) [])
        (, (scheme (set/from-list []) (tvar "a" -1)) ["a"])])

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

(defn tenv-apply [subst (tenv types cons names)]
    (tenv (map/map (scheme-apply subst) types) cons names))

<dom node>

(defn compose-subst [earlier later]
    (map/merge (map/map (type-apply earlier) later) earlier))

(def earlier-subst
    (map/from-list [(, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))]))

(,
    (fn [x] (map/to-list (compose-subst earlier-subst (map/from-list x))))
        [<dom node>
        (,
        [(, "x" (tvar "a" -1))]
            [(, "x" (tcon "a-mapped" -1))
            (, "a" (tcon "a-mapped" -1))
            (, "b" (tvar "c" -1))])
        <dom node>
        (,
        [(, "c" (tcon "int" -1))]
            [(, "c" (tcon "int" -1)) (, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))])
        <dom node>
        (,
        [(, "a" (tvar "b" -1))]
            [(, "a" (tvar "c" -1)) (, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))])])

<dom node>

(defn generalize [tenv t]
    (scheme (set/diff (type-free t) (tenv-free tenv)) t))

(defn new-type-var [prefix nidx]
    (, (tvar "${prefix}:${nidx}" -1) (+ 1 nidx)))

(defn make-subst-for-vars [vars coll nidx]
    (match vars
        []         (, coll nidx)
        [v ..rest] (let [(, vn nidx) (new-type-var v nidx)]
                       (make-subst-for-vars rest (map/set coll v vn) nidx))))

(make-subst-for-vars ["a" "b" "c"] (map/nil) 0)

<dom node>

(defn instantiate [(scheme vars t) nidx]
    (let [
        (, subst nidx) (make-subst-for-vars (set/to-list vars) (map/nil) nidx)]
        (,, (type-apply subst t) subst nidx)))

(instantiate (scheme (set/from-list ["a"]) (tvar "a" -1)) 10)

<dom node>

(defn unify [t1 t2 nidx]
    (match (, t1 t2)
        (, (tapp target-1 arg-1) (tapp target-2 arg-2)) (let [
                                                            (, target-subst nidx) (unify target-1 target-2 nidx)
                                                            (, arg-subst nidx)    (unify
                                                                                      (type-apply target-subst arg-1)
                                                                                          (type-apply target-subst arg-2)
                                                                                          nidx)]
                                                            (, (compose-subst target-subst arg-subst) nidx))
        (, (tvar var _) t)                              (, (var-bind var t) nidx)
        (, t (tvar var _))                              (, (var-bind var t) nidx)
        (, (tcon a la) (tcon b lb))                     (if (= a b)
                                                            (, map/nil nidx)
                                                                (fatal "cant unify ${a} (${la}) and ${b} (${lb})"))
        _                                               (fatal
                                                            "cant unify ${(type-to-string t1)} and ${(type-to-string t2)}")))

(defn var-bind [var type]
    (match type
        (tvar v _) (if (= var v)
                       map/nil
                           (map/set map/nil var type))
        _          (if (set/has (type-free type) var)
                       (fatal "occurs check")
                           (map/set map/nil var type))))

(defn t-prim [prim]
    (match prim
        (pint _ l)  (tcon "int" l)
        (pbool _ l) (tcon "bool" l)))

(defn tfn [a b l] (tapp (tapp (tcon "->" l) a l) b l))

(defn t-expr [tenv expr nidx]
    (match expr
        <dom node>
        (evar name l)                      (match (tenv/type tenv name)
                                               (none)       (fatal "Unbound variable ${name}")
                                               (some found) (let [(,, t _ nidx) (instantiate found nidx)]
                                                                (,, map/nil t nidx)))
        (eprim prim)                       (,, map/nil (t-prim prim) nidx)
        <dom node>
        (elambda name nl body l)           (let [
                                               (, arg-type nidx)              (new-type-var name nidx)
                                               env-with-name                  (tenv/set-type tenv name (scheme set/nil arg-type))
                                               (,, body-subst body-type nidx) (t-expr env-with-name body nidx)]
                                               (,,
                                                   body-subst
                                                       (tfn (type-apply body-subst arg-type) body-type l)
                                                       nidx))
        <dom node>
        (eapp target arg l)                (let [
                                               (, result-var nidx)                (new-type-var "a" nidx)
                                               (,, target-subst target-type nidx) (t-expr tenv target nidx)
                                               (,, arg-subst arg-type nidx)       (t-expr (tenv-apply target-subst tenv) arg nidx)
                                               (, unified-subst nidx)             (unify
                                                                                      (type-apply arg-subst target-type)
                                                                                          (tfn arg-type result-var l)
                                                                                          nidx)]
                                               (,,
                                                   (compose-subst
                                                       unified-subst
                                                           (compose-subst arg-subst target-subst))
                                                       (type-apply unified-subst result-var)
                                                       nidx))
        <dom node>
        (elet (pvar name nl) value body 1) (let [
                                               (,, value-subst value-type nidx) (t-expr tenv value nidx)
                                               ; DISABLED for fun and profit?
                                               value-scheme                     (generalize (tenv-apply value-subst tenv) value-type)
                                               env-with-name                    (tenv/set-type tenv name value-scheme)
                                               e2                               (tenv-apply value-subst env-with-name)
                                               (,, body-subst body-type nidx)   (t-expr e2 body nidx)]
                                               (,, (compose-subst body-subst value-subst) body-type nidx))
        <dom node>
        (elet pat init body l)             (let [
                                               (,, value-subst value-type nidx) (t-expr tenv init nidx)
                                               (,, pat-type bindings nidx)      (t-pat tenv pat nidx)
                                               (, unified-subst nidx)           (unify value-type pat-type nidx)
                                               bound-env                        (foldl
                                                                                    tenv
                                                                                        (map/to-list bindings)
                                                                                        (fn [tenv (, name type)]
                                                                                        (tenv/set-type
                                                                                            tenv
                                                                                                name
                                                                                                (generalize tenv (type-apply unified-subst type)))))
                                               (,, body-subst body-type nidx)   (t-expr
                                                                                    (tenv-apply (compose-subst unified-subst value-subst) bound-env)
                                                                                        body
                                                                                        nidx)]
                                               (,,
                                                   (compose-subst
                                                       unified-subst
                                                           (compose-subst value-subst body-subst))
                                                       (type-apply unified-subst body-type)
                                                       nidx))
        (ematch target cases l)            (let [
                                               (,, s1 t1 nidx) (t-expr tenv target nidx)
                                               t'              (generalize (tenv-apply s1 tenv) t1)]
                                               (fatal "nope"))
        _                                  (fatal "cannot infer type for ${(valueToString expr)}")))

(defn t-pat [tenv pat nidx]
    (match pat
        (pvar name nl)      (let [(, var nidx) (new-type-var name nidx)]
                                (,, var (map/set map/nil name var) nidx))
        (pstr _ nl)         (,, (tcon "string" nl) map/nil nidx)
        (pprim (pbool _) l) (,, (tcon "bool" l) map/nil nidx)
        (pprim (pint _) l)  (,, (tcon "int" l) map/nil nidx)
        (pcon name args l)  (let [
                                (tconstructor free cargs cres) (match (tenv/con tenv name)
                                                                   (none)   (fatal "Unknown constructor: ${name}")
                                                                   (some v) v)
                                (,, tres tsubst nidx)          (instantiate (scheme free cres) nidx)
                                <dom node>
                                cargs                          (map cargs (type-apply tsubst))
                                zipped                         (zip args cargs)
                                (,, subst bindings nidx)       (foldl
                                                                   (,, map/nil map/nil nidx)
                                                                       zipped
                                                                       (fn [(,, subst bindings nidx) (, arg carg)]
                                                                       (let [
                                                                           (,, pat-type pat-bind nidx) (t-pat tenv arg nidx)
                                                                           (, unified-subst nidx)      (unify pat-type carg nidx)]
                                                                           (,,
                                                                               (compose-subst unified-subst subst)
                                                                                   (map/merge bindings pat-bind)
                                                                                   nidx))))]
                                (,,
                                    (type-apply subst tres)
                                        (map/map bindings (type-apply subst))
                                        nidx))))

(def tenv/nil (tenv map/nil map/nil map/nil))

(defn infer [tenv expr]
    (let [(,, s t nidx) (t-expr tenv expr 0)]
        (type-apply s t)))

(infer tenv/nil (@ ((fn [a] a) 23)))

(infer
    tenv/nil
        (@
        (let [a 1]
            a)))

(def tint (tcon "int" -1))

(def basic
    (tenv
        (map/from-list
            [(, "+" (scheme set/nil (tfn tint (tfn tint tint -1) -1)))
                (,
                ","
                    (scheme
                    (set/from-list ["a" "b"])
                        (tfn (tvar "a" -1)
                        (tfn (tvar "b" -1)
                            (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "b" -1) -1)
                                -1)
                            -1)))])
            (map/from-list
            [(,
                ","
                    (tconstructor
                    (set/from-list ["a" "b"])
                        [(tvar "a" -1) (tvar "b" -1)]
                        (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "b" -1) -1)))])
            map/nil))

(infer basic (@ (+ 2 3)))

3633

(infer
    basic
        (@
        (let [a 1]
            a)))

(,
    (fn [x] (type-to-string (infer basic x)))
        [(, (@ +) "(int) -> (int) -> int")
        (,
        (@
            (let [a 1]
                a))
            "int")
        (,
        (@
            (let [(, a b) (, 2 3)]
                (, a b)))
            )
        (, (@ 123) "int")
        (, (@ (fn [a] a)) "(a:0) -> a:0")
        (, (@ (fn [a] (+ 2 a))) "(int) -> int")
        (,
        (@
            (match 1
                1 1))
            )
        ; Exploration
        (,
        (@
            (let [mid (, 1 (fn [x] x))]
                mid))
            "((, int) (x:4:6) -> x:4:6)")
        ; Tests from the paper
        (,
        (@
            (let [id (fn [x] x)]
                id))
            "(x:0:2) -> x:0:2")
        (,
        (@
            (let [id (fn [x] x)]
                (id id)))
            "(x:0:5) -> x:0:5")
        (,
        (@
            (let [
                id (fn [x]
                       (let [y x]
                           y))]
                (id id)))
            "(x:0:5) -> x:0:5")
        (,
        (@
            (let [
                id (fn [x]
                       (let [y x]
                           y))]
                ((id id) 2)))
            "int")
        (,
        (@
            (let [id (fn [x] (x x))]
                id))
            )
        (,
        (@
            (fn [m]
                (let [y m]
                    (let [x (y true)]
                        x))))
            "((bool) -> a:1) -> a:1")
        (, (@ (2 2)) )])

1987