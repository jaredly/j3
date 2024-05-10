(** ## Prelude
    some handy functions **)

(deftype (option a) (some a) (none))

(defn at [arr i default_]
    (match arr
        []           default_
        [one ..rest] (if (= i 0)
                         one
                             (at rest (- i 1) default_))))

(defn rev [arr col]
    (match arr
        []           col
        [one]        [one ..col]
        [one ..rest] (rev rest [one ..col])))

(defn len [arr]
    (match arr
        []           0
        [one ..rest] (+ 1 (len rest))))

(defn join [sep arr]
    (match arr
        []           ""
        [one]        one
        [one ..rest] "${one}${sep}${(join sep rest)}"))

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

(defn filter [fn list]
    (match list
        []           []
        [one ..rest] (if (fn one)
                         [one ..(filter fn rest)]
                             (filter fn rest))))

(foldr 0 [1 2 3] (fn [a b] b))

(foldl 0 [1 2 3] (fn [a b] b))

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

(** ## Our AST
    Pretty normal stuff. One thing to note is that str isn't primitive, because all strings are template strings which support embeddings. **)

(deftype expr
    (eprim prim int)
        (estr first (array (,, expr string int)) int)
        (evar string int)
        (equot expr int)
        (equot/stmt stmt int)
        (equot/pat pat int)
        (equot/type type int)
        (equotquot cst int)
        (elambda string int expr int)
        (eapp expr expr int)
        (elet pat expr expr int)
        (ematch expr (array (, pat expr)) int))

(defn expr-loc [expr]
    (match expr
        (eprim prim l)            l
        (estr first _ l)          l
        (evar string l)           l
        (equot expr l)            l
        (equot/stmt stmt l)       l
        (equot/pat pat l)         l
        (equot/type type l)       l
        (equotquot cst l)         l
        (elambda string l expr l) l
        (eapp expr expr l)        l
        (elet pat expr expr l)    l
        (ematch expr _ l)         l))

(deftype prim (pint int int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string (array pat) int)
        (pstr string int)
        (pprim prim int))

(defn pat-loc [pat]
    (match pat
        (pany l)          l
        (pvar string l)   l
        (pcon string _ l) l
        (pstr string l)   l
        (pprim prim l)    l))

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

(defn type-with-free [type free]
    (match type
        (tvar _ _)   type
        (tcon s l)   (if (set/has free s)
                         (tvar s l)
                             type)
        (tapp a b l) (tapp (type-with-free a free) (type-with-free b free) l)))

(defn type-loc [type]
    (match type
        (tvar _ l)   l
        (tapp _ _ l) l
        (tcon _ l)   l))

(** ## to-string functions for debugging **)

(def letters ["a" "b" "c" "d" "e" "f" "g" "h" "i" "j" "k" "l" "m" "n" "o"])

(defn unwrap-fn [t]
    (match t
        (tapp (tapp (tcon "->" _) a _) b _) (let [(, args res) (unwrap-fn b)] (, [a ..args] res))
        _                                   (, [] t)))

(defn unwrap-app [t]
    (match t
        (tapp a b _) (let [(, target args) (unwrap-app a)] (, target [b ..args]))
        _            (, t [])))

(defn tts-list [args free]
    (foldl
        (, [] free)
            args
            (fn [(, args free) a]
            (let [(, a free) (tts-inner a free)] (, [a ..args] free)))))

(defn tts-inner [t free]
    (match t
        (tvar s _)                          (let [(, fmap idx) free]
                                                (match fmap
                                                    (some fmap) (match (map/get fmap s)
                                                                    (some s) (, s free)
                                                                    none     (let [name (at letters idx "_too_many_vbls_")]
                                                                                 (, name (, (some (map/set fmap s name)) (+ 1 idx)))))
                                                    _           (, s free)))
        (tcon s _)                          (, s free)
        (tapp (tapp (tcon "->" _) a _) b _) (let [
                                                (, args r)    (unwrap-fn b)
                                                args          [a ..args]
                                                (, args free) (tts-list args free)
                                                (, two free)  (tts-inner r free)]
                                                (, "(fn [${(join " " (rev args []))}] ${two})" free))
        (tapp a b _)                        (let [
                                                (, target args) (unwrap-app a)
                                                args            [b ..args]
                                                args            (rev args [])
                                                (, args free)   (tts-list args free)
                                                (, one free)    (tts-inner target free)]
                                                (, "(${one} ${(join " " (rev args []))})" free))))

(defn type-to-string [t]
    (let [(, text _) (tts-inner t (, (some map/nil) 0))] text))

(,
    type-to-string
        [(, (@t (-> a (-> b c))) "(fn [a b] c)")
        (, (@t (-> a b)) "(fn [a] b)")
        (, (@t (cons a b)) "(cons a b)")])

(defn type-to-string-raw [t]
    (let [(, text _) (tts-inner t (, none 0))] text))

(** ## Types needed for inference **)

(deftype scheme (scheme (set string) type))

(defn scheme/type [(scheme _ type)] type)

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
            (map string (, int (set string)))
            (fn [int type] type)))

(defn noop-trace [_ t] t)

(defn tenv/type [(tenv types _ _ _) key] (map/get types key))

(defn tenv/con [(tenv _ cons _ _) key] (map/get cons key))

(defn tenv/names [(tenv _ _ names _) key] (map/get names key))

(defn tenv/set-trace [(tenv a b c _) trace] (tenv a b c trace))

(defn tenv/trace [(tenv _ _ _ trace)] trace)

(defn tenv/rm [(tenv types cons names trace) var]
    (tenv (map/rm types var) cons names trace))

(defn tenv/set-type [(tenv types cons names trace) k v]
    (tenv (map/set types k v) cons names trace))

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

(defn tenv-free [(tenv types _ _ _)]
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

(defn tenv-apply [subst (tenv types cons names trace)]
    (tenv (map/map (scheme-apply subst) types) cons names trace))

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
        (, [(, "a" (tvar "b" -1))] [(, "a" (tvar "c" -1)) (, "b" (tvar "c" -1))])])

(** ## Generalizing
    This is where we take a type and turn it into a scheme, so we need to be able to know what variables should be reported as "free" at the level of the type. **)

(defn generalize [tenv t]
    (scheme (set/diff (type-free t) (tenv-free tenv)) t))

(** ## Instantiate
    This takes a scheme and generates fresh type variables for everything bound within it. **)

(def its int-to-string)

(defn new-type-var [prefix nidx]
    (, (tvar "${prefix}:${(its nidx)}" -1) (+ 1 nidx)))

(defn make-subst-for-vars [vars coll nidx]
    (match vars
        []         (, coll nidx)
        [v ..rest] (let [(, vn nidx) (new-type-var v nidx)]
                       (make-subst-for-vars rest (map/set coll v vn) nidx))))

(make-subst-for-vars ["a" "b" "c"] (map/nil) 0)

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
        (, (tapp target-1 arg-1 _) (tapp target-2 arg-2 _)) (let [
                                                                (, target-subst nidx) (unify target-1 target-2 nidx)
                                                                (, arg-subst nidx)    (unify
                                                                                          (type-apply target-subst arg-1)
                                                                                              (type-apply target-subst arg-2)
                                                                                              nidx)]
                                                                (, (compose-subst target-subst arg-subst) nidx))
        (, (tvar var _) t)                                  (, (var-bind var t) nidx)
        (, t (tvar var _))                                  (, (var-bind var t) nidx)
        (, (tcon a la) (tcon b lb))                         (if (= a b)
                                                                (, map/nil nidx)
                                                                    (fatal "cant unify ${a} (${(its la)}) and ${b} (${(its lb)})"))
        _                                                   (fatal
                                                                "cant unify ${
                                                                    (type-to-string t1)
                                                                    } (${
                                                                    (its (type-loc t1))
                                                                    }) and ${
                                                                    (type-to-string t2)
                                                                    } (${
                                                                    (its (type-loc t2))
                                                                    })")))

(defn var-bind [var type]
    (match type
        (tvar v _) (if (= var v)
                       map/nil
                           (map/set map/nil var type))
        _          (if (set/has (type-free type) var)
                       (fatal "occurs check")
                           (map/set map/nil var type))))

(** ## Type Inference!
    Extensions to the HM algorithm:
    - patterns & the match form
    - type constructors (sum types)
    - self-recursion
    - mutual recursion (infer-defns) **)

(defn t-prim [prim]
    (match prim
        (pint _ l)  (tcon "int" l)
        (pbool _ l) (tcon "bool" l)))

(defn tfn [a b l] (tapp (tapp (tcon "->" l) a l) b l))

(def tint (tcon "int" -1))

(def tbool (tcon "bool" -1))

(def tstring (tcon "string" -1))

(defn t-expr [tenv expr nidx]
    (let 
        [(,, subst type nidx)
            (match expr
            (** For variables, we look it up in the environment, and raise an error if we couldn't find it. **)
            (evar name l)                       (match (tenv/type tenv name)
                                                    (none)       (fatal "Unbound variable ${name} (${(its l)})")
                                                    (some found) (let [(,, t _ nidx) (instantiate found nidx)] (,, map/nil t nidx)))
            (equot _ l)                         (,, map/nil (tcon "expr" l) nidx)
            (equot/stmt _ l)                    (,, map/nil (tcon "stmt" l) nidx)
            (equot/pat _ l)                     (,, map/nil (tcon "pat" l) nidx)
            (equot/type _ l)                    (,, map/nil (tcon "type" l) nidx)
            (equotquot _ l)                     (,, map/nil (tcon "cst" l) nidx)
            (eprim prim _)                      (,, map/nil (t-prim prim) nidx)
            (estr first templates l)            (let [
                                                    string-type    (tcon "string" l)
                                                    (, subst nidx) (foldr
                                                                       (, map/nil nidx)
                                                                           templates
                                                                           (fn [(, subst nidx) (,, expr suffix sl)]
                                                                           (let [
                                                                               (,, s2 t nidx) (t-expr tenv expr nidx)
                                                                               (, s3 nidx)    (unify t string-type nidx)]
                                                                               (, (compose-subst s3 (compose-subst s2 subst)) nidx))))]
                                                    (,, subst string-type nidx))
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
                                                    (, result-var nidx)                (new-type-var "res" nidx)
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
                                                    (, result-var nidx)                   (new-type-var "match-res" nidx)
                                                    (,, target-subst target-type nidx)    (t-expr tenv target nidx)
                                                    (,,, _ target-subst result-type nidx) (foldr
                                                                                              (,,, target-type target-subst result-var nidx)
                                                                                                  cases
                                                                                                  (fn [(,,, target-type subst result nidx) (, pat body)]
                                                                                                  (let [
                                                                                                                                                               (,, subst body nidx)
                                                                                                      (pat-and-body tenv pat body (,, subst target-type nidx)) (, unified-subst nidx)
                                                                                                      (unify result body nidx)]
                                                                                                      (,,,
                                                                                                          (type-apply (compose-subst subst unified-subst) target-type)
                                                                                                              (compose-subst subst unified-subst)
                                                                                                              (type-apply unified-subst result)
                                                                                                              nidx))))]
                                                    (,, target-subst result-type nidx))
            _                                   (fatal "cannot infer type for ${(valueToString expr)}"))]
            (,, subst (tenv/trace tenv (expr-loc expr) type) nidx)))

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
    (let [
        (,, t bound nidx) (match pat
                              (pany nl)             (let [(, var nidx) (new-type-var "any" nidx)] (,, var map/nil nidx))
                              (pvar name nl)        (let [(, var nidx) (new-type-var name nidx)]
                                                        (,, var (map/set map/nil name var) nidx))
                              (pstr _ nl)           (,, (tcon "string" nl) map/nil nidx)
                              (pprim (pbool _ _) l) (,, (tcon "bool" l) map/nil nidx)
                              (pprim (pint _ _) l)  (,, (tcon "int" l) map/nil nidx)
                              (pcon name args l)    (let [
                                                        (tconstructor free cargs cres) (match (tenv/con tenv name)
                                                                                           (none)   (fatal "Unknown constructor: ${name}")
                                                                                           (some v) v)
                                                        (,, tres tsubst nidx)          (instantiate (scheme free cres) nidx)
                                                        (** We've instantiated the free variables into the result, now we need to apply those substitutions to the arguments. **)
                                                        cargs                          (map cargs (type-apply tsubst))
                                                        zipped                         (zip args cargs)
                                                        _                              (if (!= (len args) (len cargs))
                                                                                           (fatal
                                                                                               "Wrong number of arguments to constructor ${
                                                                                                   name
                                                                                                   } (${
                                                                                                   (its l)
                                                                                                   }): given ${
                                                                                                   (its (len args))
                                                                                                   }, but the type constructor has ${
                                                                                                   (its (len cargs))
                                                                                                   }")
                                                                                               0)
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
                                                                nidx)))]
        (,, (tenv/trace tenv (pat-loc pat) t) bound nidx)))

(defn infer [tenv expr]
    (let [(,, s t nidx) (t-expr tenv expr 0)] (type-apply s t)))

(def tenv/nil (tenv map/nil map/nil map/nil noop-trace))

(infer tenv/nil (@ ((fn [a] a) 23)))

(infer tenv/nil (@ (let [a 1] a)))

(def basic
    (tenv
        (map/from-list
            [(, "+" (scheme set/nil (tfn tint (tfn tint tint -1) -1)))
                (, "-" (scheme set/nil (tfn tint (tfn tint tint -1) -1)))
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
            map/nil
            noop-trace))

(infer basic (@ (+ 2 3)))

3633

(infer basic (@ (let [a 1] a)))

(infer
    basic
        (@
        (match 1
            1 1)))

(defn infer-show [tenv x] (type-to-string (infer tenv x)))

(infer-show basic (@ (let [(, a b) (, 2 true)] (, a b))))

(,
    (infer-show basic)
        [(, (@ +) "(fn [int int] int)")
        (, (@ "") "string")
        (, (@ "hi ${"ho"}") "string")
        (, (@ (fn [x] "hi ${x}")) "(fn [string] string)")
        (, (@ (let [a 1] a)) "int")
        (, (@ (let [(, a b) (, 2 true)] (, a b))) "(, int bool)")
        (,
        (@
            (fn [a]
                (match a
                    (, a b) a
                    _       1)))
            "(fn [(, a b)] int)")
        (, (@ 123) "int")
        (, (@ (fn [a] a)) "(fn [a] a)")
        (, (@ (fn [a] (+ 2 a))) "(fn [int] int)")
        (,
        (@
            (match 1
                1 1))
            "int")
        ; Exploration
        (, (@ (let [mid (, 1 (fn [x] x))] mid)) "(, int (fn [a] a))")
        (, (@ (let [(, a b) (, 1 (fn [x] x)) n (b 2)] b)) "(fn [a] a)")
        (,
        (@ (let [m (, 1 (fn [x] x)) (, a b) m z (b 2)] (, m b)))
            "(, (, int (fn [a] a)) (fn [b] b))")
        (,
        (@ (fn [n] (let [(, a b) (, 1 (fn [x] n)) m (n 2)] b)))
            "(fn [(fn [int] a) b int] a)")
        ; Tests from the paper
        (, (@ (let [id (fn [x] x)] id)) "(fn [a] a)")
        (, (@ (let [id (fn [x] x)] (id id))) "(fn [a] a)")
        (, (@ (let [id (fn [x] (let [y x] y))] (id id))) "(fn [a] a)")
        (, (@ (let [id (fn [x] (let [y x] y))] id)) "(fn [a] a)")
        (, (@ (fn [x] (let [y x] y))) "(fn [a] a)")
        (, (@ (fn [x] (let [(, a b) (, 1 x)] b))) "(fn [a] a)")
        (, (@ (let [id (fn [x] (let [y x] y))] ((id id) 2))) "int")
        (, (@ (let [id (fn [x] (x x))] id)) )
        (, (@ (fn [m] (let [y m] (let [x (y true)] x)))) "(fn [(fn [bool] a)] b)")
        (, (@ (2 2)) )])

(defn infer-stmt [tenv' stmt]
    (match stmt
        (sdef name nl expr l)                     (let [
                                                      nidx             0
                                                      (, self nidx)    (new-type-var name nidx)
                                                      self-bound       (tenv/set-type tenv' name (scheme set/nil self))
                                                      (,, s t nidx)    (t-expr self-bound expr nidx)
                                                      selfed           (type-apply s self)
                                                      (, u-subst nidx) (unify selfed t nidx)
                                                      (** We have to compose these substitutions in both directions. 🤔
                                                          yeah that definitely shouldn't be happening **)
                                                      s2               (compose-subst u-subst (compose-subst u-subst s))
                                                      t                (type-apply s2 t)]
                                                      (tenv/set-type tenv' name (generalize tenv' t)))
        (sexpr expr l)                            (let [
                                                      (** this "infer" is for side-effects only **)
                                                      _ (infer tenv' expr)]
                                                      tenv')
        (sdeftype tname tnl targs constructors l) (let [
                                                      (tenv values cons types trace) tenv'
                                                      names                          (map constructors (fn [(,,, name _ _ _)] name))
                                                      final                          (foldl
                                                                                         (tcon tname tnl)
                                                                                             targs
                                                                                             (fn [body (, arg al)] (tapp body (tvar arg al) l)))
                                                      free-set                       (foldl set/nil targs (fn [free (, arg _)] (set/add free arg)))
                                                      (, values cons)                (foldl
                                                                                         (, values cons)
                                                                                             constructors
                                                                                             (fn [(, values cons) (,,, name nl args l)]
                                                                                             (let [args (map args (fn [arg] (type-with-free arg free-set)))]
                                                                                                 (,
                                                                                                     (map/set
                                                                                                         values
                                                                                                             name
                                                                                                             (scheme free-set (foldr final args (fn [body arg] (tfn arg body l)))))
                                                                                                         (map/set cons name (tconstructor free-set args final))))))]
                                                      (tenv
                                                          values
                                                              cons
                                                              (map/set types tname (, (len targs) (set/from-list names)))
                                                              trace))))

(defn several [tenv stmts]
    (match stmts
        []               (fatal "Final stmt should be an expr")
        [(sexpr expr _)] (infer tenv expr)
        [one ..rest]     (several (infer-stmt tenv one) rest)))

2105

3336

(,
    (fn [x] (type-to-string (several basic x)))
        [(,
        [(@! (deftype (array a) (cons a (array a)) (nil)))
            (@!
            (defn foldr [init items f]
                (match items
                    []           init
                    [one ..rest] (f (foldr init rest f) one))))
            (@! foldr)]
            "(fn [a (array b) (fn [a b] a)] a)")
        (,
        [(@!
            (defn what [f a]
                (if true
                    (f (what f a))
                        (f a))))
            (@! what)]
            "(fn [(fn [a] a) a] a)")
        (,
        [(@! (deftype (array2 a) (cons2 a (array2 a)) (nil2))) (@! (cons2 1 nil2))]
            "(array2 int)")
        (, [(@! (defn fib [x] (+ 1 (fib (+ 2 x))))) (@! fib)] "(fn [int] int)")
        (, [(@! (, 1 2))] "(, int int)")
        (,
        [(@! (defn rev [a b] a)) (@! (let [a (rev 1 1) b (rev "a" 1)] (, a b)))]
            "(, int string)")
        (,
        [(@! (deftype (what-t a) (what a (what-t a)) (one a) (no)))
            (@! (let [a (what 1 (no)) b (what "a" (no))] (, a b)))]
            "(, (what-t int) (what-t string))")])

(defn show-types [names (tenv types _ _ _)]
    (let [names (set/from-list names)]
        (map
            (filter (fn [(, k v)] (set/has names k)) (map/to-list types))
                (fn [(, name (scheme free type))]
                (match (set/to-list free)
                    []   "${name} = ${(type-to-string type)}"
                    free "${name} = ${(join "," free)} : ${(type-to-string-raw type)}")))))

(defn show-types-list [types]
    (join "\n" (map types type-to-string-raw)))

(defn show-subst [subst]
    (join
        "\n"
            (map
            (map/to-list subst)
                (fn [(, name type)] "${name} -> ${(type-to-string-raw type)}"))))

(defn show-substs [substs] (join "\n::\n" (map substs show-subst)))

(defn infer-several [tenv stmts]
    (let [
        nidx                  0
        names                 (map stmts (fn [(sdef name _ _ _)] name))
        (,, bound vars nidx)  (foldr
                                  (,, tenv [] nidx)
                                      stmts
                                      (fn [(,, tenv' vars nidx) (sdef name _ body _)]
                                      (let [(, self nidx) (new-type-var name nidx)]
                                          (,,
                                              (tenv/set-type tenv' name (scheme set/nil self))
                                                  [self ..vars]
                                                  nidx))))
        (,, subst types nidx) (foldr
                                  (,, map/nil [] nidx)
                                      (zip vars stmts)
                                      (fn [(,, subst types nidx) (, var (sdef name _ body _))]
                                      (let [
                                          (,, body-subst body-type nidx) (t-expr ;(bound) (tenv-apply subst bound) body nidx)
                                          selfed                         (type-apply (compose-subst body-subst subst) var)
                                          (, u-subst nidx)               (unify selfed body-type nidx)
                                          subst                          (compose-subst (compose-subst u-subst body-subst) subst)]
                                          (,, subst [(type-apply subst body-type) ..types] nidx))))]
        (zip names (map types (type-apply subst)))))

(,
    (fn [x]
        (map
            (infer-several basic x)
                (fn [(, _ type)] (type-to-string-raw type))))
        [(,
        [(@! (defn even [x] (odd (- x 1) x)))
            (@! (defn odd [x y] "${(even x)}"))
            (@! (defn what [a b c] (, (even a) (odd b c))))]
            ["(fn [int] string)"
            "(fn [int int] string)"
            "(fn [int int int] (, string string))"])
        (,
        [(@! (defn even [x] (odd (- x 1) x)))
            (@! (defn odd [x y] (even x)))
            (@! (defn what [a b c] (+ (even a) (odd b c))))]
            ["(fn [int] int)" "(fn [int int] int)" "(fn [int int int] int)"])])

8743

(defn infer-defns [tenv stmts]
    (foldl
        tenv
            (infer-several tenv stmts)
            (fn [tenv (, name type)]
            (tenv/set-type tenv name (generalize tenv type)))))

(infer-show basic (@ (fn [a b c] (+ (a b) (a c)))))



(** ## Dependency analysis
    Needed so we can know when to do mutual recursion. **)

(deftype (bag a) (one a) (many (array (bag a))) (empty))

(defn bag/and [first second]
    (match (, first second)
        (, (empty) a)           a
        (, a (empty))           a
        (, (many [a]) (many b)) (many [a ..b])
        (, (many a) (many [b])) (many [b ..a])
        _                       (many [first second])))

(defn concat [one two]
    (match one
        []           two
        [one]        [one ..two]
        [one ..rest] [one ..(concat rest two)]))

(defn bag/to-list [bag]
    (match bag
        (empty)     []
        (one a)     [a]
        (many bags) (foldl
                        []
                            bags
                            (fn [res bag]
                            (match bag
                                (empty) res
                                (one a) [a ..res]
                                _       (concat (bag/to-list bag) res))))))

(,
    bag/to-list
        [(, (many [empty (one 1) (many [(one 2) empty]) (one 10)]) [10 2 1])])

(defn pat-names [pat]
    (match pat
        (pany _)               set/nil
        (pvar name l)          (set/add set/nil name)
        (pcon string args int) (foldl
                                   set/nil
                                       args
                                       (fn [bound arg] (set/merge bound (pat-names arg))))
        (pstr string int)      set/nil
        (pprim prim int)       set/nil))

(defn externals [bound expr]
    (match expr
        (evar name l)               (if (set/has bound name)
                                        empty
                                            (one (, name l)))
        (eprim prim l)              empty
        (estr first templates int)  (many (map templates (fn [(,, expr _ _)] (externals bound expr))))
        (equot expr int)            empty
        (equot/type _ _)            empty
        (equot/pat _ _)             empty
        (equot/stmt _ _)            empty
        (equotquot cst int)         empty
        (elambda name int body int) (externals (set/add bound name) body)
        (elet pat init body l)      (bag/and
                                        (externals bound init)
                                            (externals (set/merge bound (pat-names pat)) body))
        (eapp target arg int)       (bag/and (externals bound target) (externals bound arg))
        (ematch expr cases int)     (bag/and
                                        (externals bound expr)
                                            (foldl
                                            empty
                                                cases
                                                (fn [bag (, pat body)]
                                                (bag/and bag (externals (set/merge bound (pat-names pat)) body)))))))

(defn externals-type [bound type] (set/diff (type-free type) bound))

(defn names [stmt]
    (match stmt
        (sdef name l _ _)               [(, name l)]
        (sexpr _ _)                     []
        (sdeftype _ _ _ constructors _) (map constructors (fn [(,,, name l _ _)] (, name l)))))

(defn externals-stmt [stmt]
    (bag/to-list
        (match stmt
            (sdeftype string int free constructors int) empty
            (sdef name int body int)                    (externals (set/add set/nil name) body)
            (sexpr expr int)                            (externals set/nil expr))))

(bag/to-list
    (externals
        set/nil
            (@
            (fn [x]
                (+
                    x
                        23
                        (match hello
                        (one a) a
                        (two b) (+ b c)
                        _       mx))))))

(** ## Type Environment populated with Builtins **)

(defn tmap [k v] (tapp (tapp (tcon "map" -1) k -1) v -1))

(defn tfns [args result]
    (foldr result args (fn [result arg] (tfn arg result -1))))

(type-to-string (tfns [tint tbool] tstring))

(defn toption [arg] (tapp (tcon "option" -1) arg -1))

(defn tarray [arg] (tapp (tcon "array" -1) arg -1))

(defn tset [arg] (tapp (tcon "set" -1) arg -1))

(defn concrete [t] (scheme set/nil t))

(defn generic [vbls t] (scheme (set/from-list vbls) t))

(defn vbl [k] (tvar k -1))

(defn t, [a b] (tapp (tapp (tcon "," -1) a -1) b -1))

(def builtin-env
    (let [k (vbl "k") v (vbl "v") v2 (vbl "v2") kv (generic ["k" "v"]) kk (generic ["k"])]
        (foldl
            (tenv
                (map/from-list
                    [(, "+" (concrete (tfns [tint tint] tint)))
                        (, "-" (concrete (tfns [tint tint] tint)))
                        (, ">" (concrete (tfns [tint tint] tbool)))
                        (, "<" (concrete (tfns [tint tint] tbool)))
                        (, "=" (generic ["k"] (tfns [k k] tbool)))
                        (, "!=" (generic ["k"] (tfns [k k] tbool)))
                        (, ">=" (concrete (tfns [tint tint] tbool)))
                        (, "<=" (concrete (tfns [tint tint] tbool)))
                        (, "unescapeString" (concrete (tfns [tstring] tstring)))
                        (, "int-to-string" (concrete (tfns [tint] tstring)))
                        (, "string-to-int" (concrete (tfns [tstring] (toption tint))))
                        (, "++" (concrete (tfns [(tarray tstring)] tstring)))
                        (, "map/nil" (kv (tmap k v)))
                        (, "map/set" (kv (tfns [(tmap k v) k v] (tmap k v))))
                        (, "map/rm" (kv (tfns [(tmap k v) k] (tmap k v))))
                        (, "map/get" (kv (tfns [(tmap k v) k] (toption v))))
                        (,
                        "map/map"
                            (generic ["k" "v" "v2"] (tfns [(tfns [v] v2) (tmap k v)] (tmap k v2))))
                        (, "map/merge" (kv (tfns [(tmap k v) (tmap k v)] (tmap k v))))
                        (, "map/values" (kv (tfns [(tmap k v)] (tarray v))))
                        (, "set/nil" (kk (tset k)))
                        (, "set/add" (kk (tfns [(tset k) k] (tset k))))
                        (, "set/has" (kk (tfns [(tset k) k] tbool)))
                        (, "set/rm" (kk (tfns [(tset k) k] (tset k))))
                        (, "set/diff" (kk (tfns [(tset k) (tset k)] (tset k))))
                        (, "set/merge" (kk (tfns [(tset k) (tset k)] (tset k))))
                        (, "set/to-list" (kk (tfns [(tset k)] (tarray k))))
                        (, "set/from-list" (kk (tfns [(tarray k)] (tset k))))
                        (, "map/from-list" (kv (tfns [(tarray (t, k v))] (tmap k v))))
                        (, "map/to-list" (kv (tfns [(tmap k v)] (tarray (t, k v)))))
                        (, "jsonify" (generic ["v"] (tfns [(tvar "v" -1)] tstring)))
                        (, "valueToString" (generic ["v"] (tfns [(vbl "v")] tstring)))
                        (, "eval" (generic ["v"] (tfns [(tcon "string" -1)] (vbl "v"))))
                        (, "sanitize" (concrete (tfns [tstring] tstring)))
                        (, "replace-all" (concrete (tfns [tstring tstring tstring] tstring)))
                        (, "fatal" (generic ["v"] (tfns [tstring] (vbl "v"))))])
                    map/nil
                    map/nil
                    noop-trace)
                [(@! (deftype (array a) (cons a (array a)) (nil)))
                (@! (deftype (option a) (some a) (none)))
                (@! (deftype (, a b) (, a b)))
                (@! (deftype (,, a b c) (,, a b c)))
                (@! (deftype (,,, a b c d) (,,, a b c d)))
                (@! (deftype (,,,, a b c d e) (,,,, a b c d e)))]
                infer-stmt)))

(infer-show builtin-env (@ ,))

(defn subst-to-string [subst]
    (join
        "\n"
            (map
            (map/to-list subst)
                (fn [(, k v)] "${k} : ${(type-to-string-raw v)}"))))

(deftype evaluator
    (typecheck
        tenv
            (fn [tenv stmt] tenv)
            (fn [tenv expr] type)
            (fn [tenv (array stmt)] tenv)
            (fn [type] string)
            (fn [stmt] (array (, string int)))
            (fn [stmt] (array (, string int)))
            (fn [tenv string] (option type))
            (fn [tenv (fn [int type] type)] tenv))
        )

(typecheck
    builtin-env
        infer-stmt
        infer
        infer-defns
        type-to-string
        externals-stmt
        names
        (fn [tenv name]
        (match (tenv/type tenv name)
            (some v) (some (scheme/type v))
            _        (none)))
        tenv/set-trace)