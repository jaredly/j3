(** ## Our AST
    Pretty normal stuff. One thing to note is that str isn't primitive, because all strings are template strings which support embeddings. **)

(deftype expr
    (eprim prim int)
        (estr first (array (,, expr string int)) int)
        (evar string int)
        (equot expr int)
        (equotquot cst int)
        (elambda string int expr int)
        (eapp expr expr int)
        (ematch expr (array (, pat expr)) int))

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
    (sdeftype
        string
            int
            (array (, string int))
            (array (,,, string int (array type) int))
            int)
        (sdef string int expr int)
        (sexpr expr int))

(defn tts-inner [t (, fmap idx)]
    (match t
        (tvar s _)                          (match (map/get fmap s)
                                                (some s) (, s (, fmap idx))
                                                none     )
        (tcon s _)                          s
        (tapp (tapp (tcon "->" _) a _) b _) "(${(type-to-string a)}) -> ${(type-to-string b)}"
        (tapp a b _)                        "(${(type-to-string a)} ${(type-to-string b)})"))

(defn type-to-string [t]
    (let [(, text _) (tts-inner t (, map/nil 0))] text))

(type-to-string (tapp (tapp (tcon "->" 0) (tcon "a" 0) 0) (tcon "b" 0) 0))

(defn type-with-free [type free]
    (match type
        (tvar _ _)   type
        (tcon s l)   (if (set/has free s)
                         (tvar s l)
                             type)
        (tapp a b l) (tapp (type-with-free a free) (type-with-free b free) l)))

(** ## Prelude
    some handy functions **)

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

(foldr 0 [1 2 3] (fn [a b] b))

(foldl 0 [1 2 3] (fn [a b] b))

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

(** ## Types for inference **)

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

(** ## Finding "free" type variables
    The *-free functions are about finding unbound type variables.
    - type-free: types cannot contain bindings, so every tvar is unbound
    - scheme-free: a scheme contains a list of bound variables and a type, so it returns all tvars in the type that are not listed in the bound variables list
    - tenv-free: a type environment maps a list of variable names to schemes, so it returns all unbound tvars in all of the schemes. **)

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

(** ## Applying type substitutions
    A subst maps type variable names to types
    - type-apply: any tvar that appears in subst gets swapped out
    - scheme-apply: remove any substitutions that apply to its list of bound variables, and then do the substitution
    - tenv-apply: apply a subst to all schemes **)

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

(** ## Composing substitution maps
    Note that compose-subst is not commutative. The later map will get the earlier substitutions applied to it, and then any conflicts go to later. **)

(defn compose-subst [earlier later]
    (map/merge (map/map (type-apply earlier) later) earlier))

(def earlier-subst
    (map/from-list [(, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))]))

(,
    (fn [x] (map/to-list (compose-subst earlier-subst (map/from-list x))))
        [(** x gets the "a" substitution applied to it **)
        (,
        [(, "x" (tvar "a" -1))]
            [(, "x" (tcon "a-mapped" -1))
            (, "a" (tcon "a-mapped" -1))
            (, "b" (tvar "c" -1))])
        (** c does not get applied to b in earlier **)
        (,
        [(, "c" (tcon "int" -1))]
            [(, "c" (tcon "int" -1)) (, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))])
        (** a gets the "b" substitution applied to it, and then overrides the "a" from earlier **)
        (,
        [(, "a" (tvar "b" -1))]
            [(, "a" (tvar "c" -1)) (, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))])])

(** ## Generalizing
    This is where we take a type and turn it into a scheme, so we need to be able to know what variables should be reported as "free" at the level of the type. **)

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

(** ## Instantiate
    This takes a scheme and generates fresh type variables for everything bound within it. **)

(defn instantiate [(scheme vars t) nidx]
    (let [
        (, subst nidx) (make-subst-for-vars (set/to-list vars) (map/nil) nidx)]
        (,, (type-apply subst t) subst nidx)))

(instantiate (scheme (set/from-list ["a"]) (tvar "a" -1)) 10)

(** ## Unification
    Because our type-language is so simple, unification is quite straightforward. If we come across a tvar, we add it to the subst, otherwise we recurse.
    The "occurs check" prevents infinite types (like a subst from a : int -> a). **)

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
        (** For variables, we look it up in the environment, and raise an error if we couldn't find it. **)
        (evar name l)                       (match (tenv/type tenv name)
                                                (none)       (fatal "Unbound variable ${name}")
                                                (some found) (let [(,, t _ nidx) (instantiate found nidx)] (,, map/nil t nidx)))
        (eprim prim)                        (,, map/nil (t-prim prim) nidx)
        (** For lambdas (fn [name] body)
            - create a type variable to represent the type of the argument
            - add the type variable to the typing environment
            - infer the body, using the augmented environment
            - if the body's subst has some binding for our arg variable, use that **)
        (elambda name nl body l)            (let [
                                                (, arg-type nidx)              (new-type-var name nidx)
                                                env-with-name                  (tenv/set-type tenv name (scheme set/nil arg-type))
                                                (,, body-subst body-type nidx) (t-expr env-with-name body nidx)]
                                                (,,
                                                    body-subst
                                                        (tfn (type-apply body-subst arg-type) body-type l)
                                                        nidx))
        (** Function application (target arg)
            - create a type variable to represent the return value of the function application
            - infer the target type
            - infer the arg type, using the subst from the target. (?) Could this be done the other way around?
            - unify the target type with a function (arg type) => return value type variable
            - the subst from the unification is then applied to the return value type variable, giving us the overall type of the expression **)
        (eapp target arg l)                 (let [
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
        (** Let: simple version, where the pattern is just a pvar
            - infer the type of the value being bound
            - generalize the inferred type! This is where we get let polymorphism; the inferred type is allowed to have "free" type variables. If we didn't generalize here, then let would not be polymorphic.
            - apply any subst that we learned from inferring the value to our type environment, producing a new tenv (?) Seems like this ought to be equivalent to doing tenv-apply to tenv and then adding the name. It's impossible for the value-subst to produce ... something that would apply to the value-type, right??? right??
            - infer the type of the body, using the tenv that has both the name bound to the generalized inferred type, as well as any substitutions that resulted from inferring the type of the bound value.
            - compose the substitutions from the body with those from the value **)
        ;(elet (pvar name nl) value body l) ;(let [
                                                (,, value-subst value-type nidx) (t-expr tenv value nidx)
                                                value-scheme                     (generalize (tenv-apply value-subst tenv) value-type)
                                                env-with-name                    (tenv/set-type tenv name value-scheme)
                                                e2                               (tenv-apply value-subst env-with-name)
                                                (,, body-subst body-type nidx)   (t-expr e2 body nidx)]
                                                (,, (compose-subst body-subst value-subst) body-type nidx))
        (** Let: complex version! Now with a whole lot of polymorphism!
            - infer the type of the value
            - infer the type of the pattern, along with a mapping of bindings (from "name" to "tvar")
            - oof ok so our typing environment needs ... to know about type constructors. Would it be like ... **)
        (elet pat init body l)              (pat-and-body tenv pat body (t-expr tenv init nidx))
        (ematch target cases l)             (let [
                                                (, result-var nidx)                (new-type-var "match-res" nidx)
                                                (,, target-subst target-type nidx) (t-expr tenv target nidx)]
                                                (foldr
                                                    (,, target-subst result-var nidx)
                                                        cases
                                                        (fn [(,, subst result nidx) (, pat body)]
                                                        (let [
                                                            (,, subst body nidx)   (pat-and-body tenv pat body (,, subst target-type nidx))
                                                            (, unified-subst nidx) (unify result body nidx)]
                                                            (,,
                                                                (compose-subst subst unified-subst)
                                                                    (type-apply unified-subst result)
                                                                    nidx)))))
        _                                   (fatal "cannot infer type for ${(valueToString expr)}")))

(defn pat-and-body [tenv pat body (,, value-subst value-type nidx)]
    (let [
        (,, pat-type bindings nidx)    (t-pat tenv pat nidx)
        (, unified-subst nidx)         (unify value-type pat-type nidx)
        bindings                       (map/map
                                           (type-apply (compose-subst value-subst unified-subst))
                                               bindings)
        schemes                        (map/map
                                           (generalize
                                               (tenv-apply (compose-subst value-subst unified-subst) tenv))
                                               bindings)
        bound-env                      (foldr
                                           (tenv-apply value-subst tenv)
                                               (map/to-list schemes)
                                               (fn [tenv (, name scheme)] (tenv/set-type tenv name scheme)))
        (,, body-subst body-type nidx) (t-expr
                                           (tenv-apply (compose-subst unified-subst value-subst) bound-env)
                                               body
                                               nidx)]
        (,,
            (compose-subst
                unified-subst
                    (compose-subst value-subst body-subst))
                (type-apply unified-subst body-type)
                nidx)))

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
                                (** We've instantiated the free variables into the result, now we need to apply those substitutions to the arguments. **)
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
                                        (map/map (type-apply subst) bindings)
                                        nidx))))

(def tenv/nil (tenv map/nil map/nil map/nil))

(defn infer [tenv expr]
    (let [(,, s t nidx) (t-expr tenv expr 0)] (type-apply s t)))

(infer tenv/nil (@ ((fn [a] a) 23)))

(infer tenv/nil (@ (let [a 1] a)))

(def tint (tcon "int" -1))

(def tbool (tcon "bool" -1))

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

(infer basic (@ (let [a 1] a)))

(infer
    basic
        (@
        (match 1
            1 1)))

(defn infer-show [tenv x] (type-to-string (infer tenv x)))

(,
    (fn [x] (type-to-string (infer basic x)))
        [(, (@ +) "(int) -> (int) -> int")
        (, (@ (let [a 1] a)) "int")
        (, (@ (let [(, a b) (, 2 true)] (, a b))) "((, int) bool)")
        (, (@ 123) "int")
        (, (@ (fn [a] a)) "(a:0) -> a:0")
        (, (@ (fn [a] (+ 2 a))) "(int) -> int")
        (,
        (@
            (match 1
                1 1))
            "int")
        ; Exploration
        (, (@ (let [mid (, 1 (fn [x] x))] mid)) "((, int) (x:4:7) -> x:4:7)")
        (, (@ (let [(, a b) (, 1 (fn [x] x)) n (b 2)] b)) "(x:4:14) -> x:4:14")
        (,
        (@ (let [m (, 1 (fn [x] x)) (, a b) m z (b 2)] (, m b)))
            "((, ((, int) (x:4:21) -> x:4:21)) (x:4:7:23) -> x:4:7:23)")
        (,
        (@ (fn [n] (let [(, a b) (, 1 (fn [x] n)) m (n 2)] b)))
            "((int) -> m:11) -> (x:5:12) -> (int) -> m:11")
        ; Tests from the paper
        (, (@ (let [id (fn [x] x)] id)) "(x:0:3) -> x:0:3")
        (, (@ (let [id (fn [x] x)] (id id))) "(x:0:6) -> x:0:6")
        (, (@ (let [id (fn [x] (let [y x] y))] (id id))) "(y:1:7) -> y:1:7")
        (, (@ (let [id (fn [x] (let [y x] y))] id)) "(y:1:4) -> y:1:4")
        (, (@ (fn [x] (let [y x] y))) "(y:1) -> y:1")
        (, (@ (fn [x] (let [(, a b) (, 1 x)] b))) "(b:6) -> b:6")
        (, (@ (let [id (fn [x] (let [y x] y))] ((id id) 2))) "int")
        (, (@ (let [id (fn [x] (x x))] id)) )
        (, (@ (fn [m] (let [y m] (let [x (y true)] x)))) "((bool) -> x:3) -> x:3:4")
        (, (@ (2 2)) )])

(defn infer-stmt [tenv' stmt]
    (match stmt
        (sdef name nl expr l)                     (let [
                                                      nidx             0
                                                      (, self nidx)    (new-type-var name nidx)
                                                      self-bound       (tenv/set-type tenv' name (scheme set/nil self))
                                                      (,, s t nidx)    (t-expr self-bound expr 0)
                                                      (, u-subst nidx) (unify self t n)
                                                      s2               (compose-subst s u-subst)
                                                      t                (type-apply s t)]
                                                      (tenv/set-type tenv' name (generalize tenv' t)))
        (sexpr expr l)                            (let [
                                                      (** this "infer" is for side-effects only **)
                                                      _ (infer tenv' expr)]
                                                      tenv')
        (sdeftype tname tnl targs constructors l) (let [
                                                      (tenv values cons types) tenv'
                                                      names                    (map constructors (fn [(,,, name _ _ _)] name))
                                                      final                    (foldl
                                                                                   (tcon tname tnl)
                                                                                       targs
                                                                                       (fn [body (, arg al)] (tapp body (tvar arg al) l)))
                                                      free-set                 (foldl set/nil targs (fn [free (, arg _)] (set/add free arg)))
                                                      (, values cons)          (foldl
                                                                                   (, values cons)
                                                                                       constructors
                                                                                       (fn [(, values cons) (,,, name nl args l)]
                                                                                       (let [
                                                                                           args (map args (fn [arg] (type-with-free arg free-set)))
                                                                                           free (foldl set/nil args (fn [free arg] (set/merge free (type-free arg))))]
                                                                                           (,
                                                                                               (map/set
                                                                                                   values
                                                                                                       name
                                                                                                       (scheme free (foldr final args (fn [body arg] (tfn arg body l)))))
                                                                                                   (map/set cons name (tconstructor free args final))))))]
                                                      (tenv values cons (map/set types tname (set/from-list names))))))

;(infer-stmt basic (sdef "hi" 0 (@ 12) -1))

(infer (infer-stmt basic (sdef "hi" 0 (@ 12) -1)) (@ hi))

(infer-stmt
    tenv/nil
        (sdeftype "array" 10 [(,,, "nil" 0 [] 0) (,,, "cons" 0 [(tvar "a" 1)] 0)] -1))

(infer-show
    (infer-stmt
        tenv/nil
            (sdeftype
            "array"
                10
                [(, "a" 9)]
                [(,,, "nil" 0 [] 0)
                (,,, "cons" 0 [(tvar "a" 1) (tapp (tcon "array" 0) (tvar "a" 0) 0)] 0)]
                -1))
        (@ (cons 12 (cons 2 nil))))

(deftype evaluator (typecheck a b c d))

(@! 12)

1012

;(infer-stmt
    tenv/nil
        (sdeftype
        "array"
            1486
            [(, "a" 1487)]
            [(,,, "nil" 1489 [] 1488)
            (,,, "cons" 1491 [(tapp (tcon "array" 1493) (tcon "a" 1494) 1492)] 1490)]
            1483))

(defn several [stmts expr tenv]
    (let [env (foldl tenv stmts infer-stmt)] (infer env expr)))

(several
    [(@! (deftype (array a) (cons a (array a)) (nil)))]
        (@ (cons 1 nil))
        basic)

(several [(@! (defn fib [x] (+ 1 (fib (+ 2 x)))))] (@ fib) basic)

(@! (deftype (array a) (cons a (array a)) (nil)))

(def builtin-env
    (foldl
        (tenv
            (map/from-list
                [(, "+" (scheme set/nil (tfn tint (tfn tint tint -1) -1)))
                    (, "-" (scheme set/nil (tfn tint (tfn tint tint -1) -1)))
                    (, ">" (scheme set/nil (tfn tint (tfn tint tbool -1) -1)))
                    (, "<" (scheme set/nil (tfn tint (tfn tint tbool -1) -1)))
                    (, "=" (scheme set/nil (tfn tint (tfn tint tbool -1) -1)))
                    (, ">=" (scheme set/nil (tfn tint (tfn tint tbool -1) -1)))
                    (, "<=" (scheme set/nil (tfn tint (tfn tint tbool -1) -1)))])
                map/nil
                map/nil)
            [(@! (deftype (array a) (cons a (array a)) (nil)))
            (@! (deftype (, a b) (, a b)))
            (@! (deftype (,, a b c) (,, a b c)))
            (@! (deftype (,,, a b c d) (,,, a b c d)))
            (@! (deftype (,,,, a b c d e) (,,,, a b c d e)))]
            infer-stmt))

(infer builtin-env (@ (, 1 2)))

(typecheck builtin-env infer-stmt infer type-to-string)