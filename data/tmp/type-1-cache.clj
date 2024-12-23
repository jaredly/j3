(** ## Prelude
    some handy functions **)

(deftype (option a) (some a) (none))

(deftype (array a) (cons a (array a)) (nil))

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

(defn any [values f]
    (match values
        []           false
        [one ..rest] (if (f one)
                         true
                             (any rest f))))

(defn zip [one two]
    (match (, one two)
        (, [] [])               []
        (, [a ..one] [b ..two]) [(, a b) ..(zip one two)]
        _                       []))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(foldl 0 [1 2 3] (fn [a b] b))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(foldr 0 [1 2 3] (fn [a b] b))

(defn filter [f list]
    (match list
        []           []
        [one ..rest] (if (f one)
                         [one ..(filter f rest)]
                             (filter f rest))))

(defn apply-tuple [f (, a b)] (f a b))

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

(def its int-to-string)

(** ## Our AST
    Pretty normal stuff. One thing to note is that str isn't primitive, because all strings are template strings which support embeddings. **)

(deftype cst
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/spread cst int)
        (cst/identifier string int)
        (cst/string string (array (,, cst string int)) int))

(deftype expr
    (eprim prim int)
        (estr string (array (,, expr string int)) int)
        (evar string int)
        (equot expr int)
        (equot/stmt stmt int)
        (equot/pat pat int)
        (equot/type type int)
        (equotquot cst int)
        (elambda pat expr int)
        (eapp expr expr int)
        (elet pat expr expr int)
        (ematch expr (array (, pat expr)) int))

(defn expr-to-string [expr]
    (match expr
        (evar n _)           n
        (elambda n b _)      "(fn [${(pat-to-string n)}] ${(expr-to-string b)})"
        (eapp a b _)         "(${(expr-to-string a)} ${(expr-to-string b)})"
        (eprim (pint n _) _) (int-to-string n)
        (ematch t cases _)   "(match ${
                                 (expr-to-string t)
                                 } ${
                                 (join
                                     "\n"
                                         (map cases (fn [(, a b)] "${(pat-to-string a)} ${(expr-to-string b)}")))
                                 }"
        _                    "??"))

(defn pat-to-string [pat]
    (match pat
        (pany _)        "_"
        (pvar n _)      n
        (pcon c pats _) "(${c} ${(join " " (map pats pat-to-string))})"
        (pstr s _)      "\"${s}\""
        (pprim _ _)     "prim"))

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

(defn pat-loc [pat]
    (match pat
        (pany l)     l
        (pprim _ l)  l
        (pstr _ l)   l
        (pvar _ l)   l
        (pcon _ _ l) l))

(defn expr-loc [expr]
    (match expr
        (estr _ _ l)     l
        (eprim _ l)      l
        (evar _ l)       l
        (equotquot _ l)  l
        (equot _ l)      l
        (equot/stmt _ l) l
        (equot/pat _ l)  l
        (equot/type _ l) l
        (elambda _ _ l)  l
        (elet _ _ _ l)   l
        (eapp _ _ l)     l
        (ematch _ _ l)   l))

(defn type/set-loc [loc type]
    (match type
        (tvar name _) (tvar name loc)
        (tapp a b _)  (tapp (type/set-loc loc a) (type/set-loc loc b) loc)
        (tcon name _) (tcon name loc)))

(deftype stmt
    (sdeftype
        string
            int
            (array (, string int))
            (array (,,, string int (array type) int))
            int)
        (stypealias string int (array (, string int)) type int)
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

(** More debugging stuff **)

(deftype (trace-fmt a)
    (tcolor string)
        (tbold bool)
        (titalic bool)
        (tflash bool)
        (ttext string)
        (tval a)
        (tloc int)
        (tnamed string (trace-fmt a))
        (tfmted a string)
        (tfmt a (fn [a] string)))

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

(defn tts-list [args free locs]
    (foldl
        (, [] free)
            args
            (fn [(, args free) a]
            (let [(, a free) (tts-inner a free locs)] (, [a ..args] free)))))

(defn and-loc [locs l s]
    (if locs
        "${
            s
            }:${
            (if (= l -1)
                "🚨"
                    (its l))
            }"
            s))

(defn tts-inner [t free locs]
    (match t
        (tvar s l)                           (let [(, fmap idx) free]
                                                 (match fmap
                                                     (some fmap) (match (map/get fmap s)
                                                                     (some s) (, (and-loc locs l s) free)
                                                                     none     (let [name (at letters idx "_too_many_vbls_")]
                                                                                  (, (and-loc locs l name) (, (some (map/set fmap s name)) (+ 1 idx)))))
                                                     _           (, (and-loc locs l s) free)))
        (tcon s l)                           (, (and-loc locs l s) free)
        (tapp (tapp (tcon "->" _) a la) b l) (let [
                                                 (, args r)    (unwrap-fn b)
                                                 args          [a ..args]
                                                 (, args free) (tts-list args free locs)
                                                 (, two free)  (tts-inner r free locs)]
                                                 (, (and-loc locs l "(fn [${(join " " (rev args []))}] ${two})") free))
        (tapp a b l)                         (let [
                                                 (, target args) (unwrap-app a)
                                                 args            [b ..args]
                                                 args            (rev args [])
                                                 (, args free)   (tts-list args free locs)
                                                 (, one free)    (tts-inner target free locs)]
                                                 (, (and-loc locs l "(${one} ${(join " " (rev args []))})") free))))

(defn type-to-string [t]
    (let [(, text _) (tts-inner t (, (some map/nil) 0) false)] text))

(,
    type-to-string
        [(, (@t (-> a (-> b c))) "(fn [a b] c)")
        (, (@t (-> a b)) "(fn [a] b)")
        (, (@t (cons a b)) "(cons a b)")])

(defn type-to-string-raw [t]
    (let [(, text _) (tts-inner t (, none 0) false)] text))

(** ## Types needed for inference
    type environment
    type scheme **)

(defn tenv/add-builtin-type [(tenv a b names d) (, name args)]
    (tenv a b (map/set names name (, args set/nil)) d))

(defn tenv/merge [(tenv values constructors types alias)
    (tenv nvalues ncons ntypes nalias)]
    (tenv
        (map/merge values nvalues)
            (map/merge constructors ncons)
            (map/merge types ntypes)
            (map/merge alias nalias)))

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
            (map string (, (array string) type))))

(defn tenv/type [(tenv types _ _ _) key] (map/get types key))

(defn tenv/con [(tenv _ cons _ _) key] (map/get cons key))

(defn tenv/names [(tenv _ _ names _) key] (map/get names key))

(defn tenv/rm [(tenv types cons names alias) var]
    (tenv (map/rm types var) cons names alias))

(defn tenv/set-type [(tenv types cons names alias) k v]
    (tenv (map/set types k v) cons names alias))

(defn tenv/set-constructors [(tenv types cons names alias) name vbls ncons]
    (tenv
        types
            (map/merge cons ncons)
            (map/set names name (, vbls (set/from-list (map/keys ncons))))
            alias))

(defn tenv/add-alias [(tenv a b c aliases) name (, args body)]
    (tenv a b c (map/set aliases name (, args body))))

(** ## Finding "free" type variables
    The *-free functions are about finding unbound type variables.
    - type-free: types cannot contain bindings, so every tvar is unbound
    - scheme-free: a scheme contains a list of generic variables and a type, so it returns all tvars in the type that are not listed in the generic variables list
    - tenv-free: a type environment maps a list of variable names to schemes, so it returns all unbound tvars in all of the schemes. **)

(defn type-free [type]
    (match type
        (tvar n _)   (set/add set/nil n)
        (tcon _ _)   set/nil
        (tapp a b _) (set/merge (type-free a) (type-free b))
        ))

(defn has-free [type name]
    (match type
        (tvar n _)   (= n name)
        (tcon _ _)   false
        (tapp a b _) (if (has-free a name)
                         true
                             (has-free b name))))

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
    - type-apply: any tvar that appears in subst gets swapped out for the substitution
    - scheme-apply: ignoring any substitutions that apply to its list of generic variables, perform the substitution on the contained type
    - tenv-apply: apply a subst to all schemes **)

(defn type-apply [subst type]
    (match type
        (tvar n _)   (match (map/get subst n)
                         (none)   type
                         (some t) t)
        (tapp a b c) (tapp (type-apply subst a) (type-apply subst b) c)
        _            type))

(,
    (type-apply (map/from-list [(, "a" (tcon "int" -1))]))
        [(, (tvar "a" -1) (tcon "int" -1))
        (, (tvar "b" -1) (tvar "b" -1))
        (,
        (tapp (tcon "array" -1) (tvar "a" -1) -1)
            (tapp (tcon "array" -1) (tcon "int" -1) -1))])

(defn scheme-apply [subst (scheme vbls type)]
    (scheme vbls (type-apply (map-without subst vbls) type)))

(defn tenv-apply [subst (tenv types cons names alias)]
    (tenv (map/map (scheme-apply subst) types) cons names alias))

(** ## Composing substitution maps
    Note that compose-subst is not commutative. The old-subst map will get the new-subst substitutions applied to it, and then any conflicting keys go with new-subst.
    ⚠️ If compose-subst is called with arguments in the wrong order, it will break the algorithm. The magic of hindley-milner's Algorithm W relies on the invariant being maintained that all substitutions get "passed forward"; that when adding in substitutions, they first get applied to all existing substitutions. Another way to break the algorithm is to not apply substs to the relevant types before attempting unification.  **)

(defn check-invariant [place new-subst old-subst]
    (foldl
        (none)
            (map/keys old-subst)
            (fn [current key]
            (match current
                (some v) current
                (none)   (foldl
                             (none)
                                 (map/to-list new-subst)
                                 (fn [current (, nkey type)]
                                 (match current
                                     (some v) current
                                     (none)   (if (has-free type key)
                                                  (some
                                                      "compose-subst[${
                                                          place
                                                          }]: old-subst has key ${
                                                          key
                                                          }, which is used in new-subst for ${
                                                          nkey
                                                          } => ${
                                                          (type-to-string-raw type)
                                                          }")
                                                      current))))))))

(defn compose-subst [place new-subst old-subst]
    (match (check-invariant place new-subst old-subst)
        (some message) (fatal message)
        _              (map/merge (map/map (type-apply new-subst) old-subst) new-subst)))

(def demo-new-subst
    (map/from-list [(, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))]))

(,
    (fn [x]
        (map/to-list
            (compose-subst "test" demo-new-subst (map/from-list x))))
        [(** x gets the "a" substitution applied to it **)
        (,
        [(, "x" (tvar "a" -1))]
            [(, "x" (tcon "a-mapped" -1))
            (, "a" (tcon "a-mapped" -1))
            (, "b" (tvar "c" -1))])
        (** c does not get applied to the b in new-subst **)
        (,
        [(, "c" (tcon "int" -1))]
            [(, "c" (tcon "int" -1)) (, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))])
        (** "a" gets the "b" substitution applied to it, and then overrides the "a" from new-subst **)
        (, [(, "a" (tvar "b" -1))] [(, "a" (tvar "c" -1)) (, "b" (tvar "c" -1))])])

(** ## Generalizing
    This is where we take a type and turn it into a scheme, so we need to be able to know what variables should be reported as "generic" at the level of the type. Basically, any variables that already exist in the type environment should not be generalized over here.
    (fn [x] (let [y (fn [z] x)] t))
    In this case, y should not be generic over its return type, only its argument type. **)

(defn generalize [tenv t]
    (scheme (set/diff (type-free t) (tenv-free tenv)) t))

(** ## Instantiate
    This takes a scheme and generates fresh type variables for everything in the "generics" set.
    This allows us to have different instantiations of a given type variable when we e.g. use the same function twice in two different ways. Without this, the following wouldn't work:
    (let [a (cons 1) b (cons "hi")] 1)
    Because the type variable in the type for cons would be the same in both cases. With instantiate, the type for cons gets a fresh type variable at each usage. **)

(defn instantiate [(scheme vars t) nidx l]
    (let [
        (, subst nidx) (make-subst-for-vars (set/to-list vars) (map/nil) nidx l)]
        (,, (type-apply subst t) subst nidx)))

(instantiate (scheme (set/from-list ["a"]) (tvar "a" -1)) 10 0)

(defn new-type-var [prefix nidx l]
    (, (tvar "${prefix}:${(its nidx)}" l) (+ 1 nidx)))

(defn make-subst-for-vars [vars coll nidx l]
    (match vars
        []         (, coll nidx)
        [v ..rest] (let [(, vn nidx) (new-type-var v nidx l)]
                       (make-subst-for-vars rest (map/set coll v vn) nidx l))))

(make-subst-for-vars ["a" "b" "c"] (map/nil) 0 -1)

(** ## Unification
    Because our type-language is so simple, unification is quite straightforward. If we come across a tvar, we treat whatever's on the other side as its substitution; otherwise we recurse.
    Importantly, unify doesn't produce a "unified type"; instead it produces a substitution which, when applied to both types, will yield the same unified type.
    If two types are irreconcilable, it throws an exception.
    The "occurs check" prevents infinite types (like a subst from a : int -> a). **)

(defn unify [t1 t2 nidx l]
    (unify-inner t1 t2 nidx l)
        ;(let [
        l1             (type-loc t1)
        l2             (type-loc t2)
        _              (trace
                           [(tloc l)
                               (tloc l1)
                               (tloc l2)
                               (ttext "unify")
                               (tfmt t1 type-to-string-raw)
                               (tfmt t2 type-to-string-raw)])
        (, subst nidx) (unify-inner t1 t2 nidx l)
        _              (trace
                           [(tloc l) (tloc l1) (tloc l2) (ttext "unified") (tfmt subst show-subst)])]
        (, subst nidx)))

(defn unify-inner [t1 t2 nidx l]
    (match (, t1 t2)
        (, (tapp target-1 arg-1 _) (tapp target-2 arg-2 _)) (let [
                                                                (, target-subst nidx) (unify target-1 target-2 nidx l)
                                                                (, arg-subst nidx)    (unify
                                                                                          (type-apply target-subst arg-1)
                                                                                              (type-apply target-subst arg-2)
                                                                                              nidx
                                                                                              l)]
                                                                (, (compose-subst "unify-tapp" arg-subst target-subst) nidx))
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

(** ## Expressions **)

(defn t-prim [prim]
    (match prim
        (pint _ l)  (tcon "int" l)
        (pbool _ l) (tcon "bool" l)))

(defn t-expr [tenv expr nidx]
    (t-expr-inner tenv expr nidx)
        ;(let [
        l                    (expr-loc expr)
        _                    (trace [(tloc l) (tcolor "blue") (ttext "enter")])
        (,, subst type nidx) (t-expr-inner tenv expr nidx)
        _                    (trace
                                 [(tloc l)
                                     (tcolor "white")
                                     (ttext "exir")
                                     (tfmt type type-to-string-raw)])]
        (,, subst type nidx)))

(defn t-expr-inner [tenv expr nidx]
    (match expr
        (** For variables, we look it up in the environment, and raise an error if we couldn't find it. **)
        (evar "()" l)            (,, map/nil (tcon "()" l) nidx)
        (evar name l)            (match (tenv/type tenv name)
                                     (none)       (fatal "Unbound variable ${name} (${(its l)})")
                                     (some found) (let [(,, t _ nidx) (instantiate found nidx l)]
                                                      (,, map/nil (type/set-loc l t) nidx)))
        (equot _ l)              (,, map/nil (tcon "expr" l) nidx)
        (equot/stmt _ l)         (,, map/nil (tcon "stmt" l) nidx)
        (equot/pat _ l)          (,, map/nil (tcon "pat" l) nidx)
        (equot/type _ l)         (,, map/nil (tcon "type" l) nidx)
        (equotquot _ l)          (,, map/nil (tcon "cst" l) nidx)
        (eprim prim _)           (,, map/nil (t-prim prim) nidx)
        (estr first templates l) (let [
                                     string-type    (tcon "string" l)
                                     (, subst nidx) (foldr
                                                        (, map/nil nidx)
                                                            templates
                                                            (fn [(, subst nidx) (,, expr suffix sl)]
                                                            (let [
                                                                (,, s2 t nidx) (t-expr tenv expr nidx)
                                                                (, s3 nidx)    (unify t string-type nidx l)]
                                                                (, (compose-subst "estr" s3 (compose-subst "estr2" s2 subst)) nidx))))]
                                     (,, subst string-type nidx))
        (** For lambdas (fn [name] body)
            - create a type variable to represent the type of the argument
            - add the type variable to the typing environment
            - infer the body, using the augmented environment
            - if the body's subst has some binding for our arg variable, use that **)
        ;(elambda name nl body l)
        ;(let [
            (, arg-type nidx)              (new-type-var name nidx l)
            env-with-name                  (tenv/set-type tenv name (scheme set/nil arg-type))
            (,, body-subst body-type nidx) (t-expr env-with-name body nidx)]
            (,,
                body-subst
                    (tfn (type-apply body-subst arg-type) body-type l)
                    nidx))
        (** Lambdas, now with pats **)
        (elambda pat body l)     (let [
                                     (, arg-type nidx)    (new-type-var
                                                              (match pat
                                                                  (pvar name _) name
                                                                  _             "$arg")
                                                                  nidx
                                                                  l)
                                     (,, subst body nidx) (pat-and-body tenv pat body (,, map/nil arg-type nidx) true)
                                     arg-type             (type-apply subst arg-type)]
                                     (,, subst (tfn arg-type body l) nidx))
        (** Function application (target arg)
            - create a type variable to represent the return value of the function application
            - infer the target type
            - infer the arg type, using the subst from the target. (?) Could this be done the other way around?
            - unify the target type with a function (arg type) => return value type variable
            - the subst from the unification is then applied to the return value type variable, giving us the overall type of the expression **)
        (eapp target arg l)      (let [
                                     (, result-var nidx)                (new-type-var "res" nidx l)
                                     (,, target-subst target-type nidx) (t-expr tenv target nidx)
                                     (,, arg-subst arg-type nidx)       (t-expr (tenv-apply target-subst tenv) arg nidx)
                                     (, unified-subst nidx)             (unify
                                                                            (type-apply arg-subst target-type)
                                                                                (tfn arg-type result-var l)
                                                                                nidx
                                                                                l)]
                                     (,,
                                         (compose-subst
                                             "eapp"
                                                 unified-subst
                                                 (compose-subst "eapp2" arg-subst target-subst))
                                             (type-apply unified-subst result-var)
                                             nidx))
        (** Let: simple version, where the pattern is just a pvar
            - infer the type of the value being bound
            - generalize the inferred type! This is where we get let polymorphism; the inferred type is allowed to have "free" type variables. If we didn't generalize here, then let would not be polymorphic.
            - apply any subst that we learned from inferring the value to our type environment, producing a new tenv (?) Seems like this ought to be equivalent to doing tenv-apply to tenv and then adding the name. It's impossible for the value-subst to produce ... something that would apply to the value-type, right??? right??
            - infer the type of the body, using the tenv that has both the name bound to the generalized inferred type, as well as any substitutions that resulted from inferring the type of the bound value.
            - compose the substitutions from the body with those from the value **)
        ;(elet (pvar name nl) value body l)
        ;(let [
            (,, value-subst value-type nidx) (t-expr tenv value nidx)
            value-scheme                     (generalize (tenv-apply value-subst tenv) value-type)
            env-with-name                    (tenv/set-type tenv name value-scheme)
            e2                               (tenv-apply value-subst env-with-name)
            (,, body-subst body-type nidx)   (t-expr e2 body nidx)]
            (,, (compose-subst "elet" body-subst value-subst) body-type nidx))
        (** Let: complex version! Now with a whole lot of polymorphism!
            - infer the type of the value
            - infer the type of the pattern, along with a mapping of bindings (from "name" to "tvar")
            - oof ok so our typing environment needs ... to know about type constructors. Would it be like ... **)
        (elet pat init body l)   (pat-and-body tenv pat body (t-expr tenv init nidx) false)
        (ematch target cases l)  (let [
                                     (, result-var nidx)                   (new-type-var "match-res" nidx l)
                                     (,, target-subst target-type nidx)    (t-expr tenv target nidx)
                                     (,,, _ target-subst result-type nidx) (foldr
                                                                               (,,, target-type target-subst result-var nidx)
                                                                                   cases
                                                                                   (fn [(,,, target-type subst result nidx) (, pat body)]
                                                                                   (let [
                                                                                       (,, subst body nidx)   (pat-and-body tenv pat body (,, subst target-type nidx) false)
                                                                                       (, unified-subst nidx) (unify (type-apply subst result) body nidx l)
                                                                                       composed               (compose-subst "ematch" unified-subst subst)]
                                                                                       (,,,
                                                                                           (type-apply composed target-type)
                                                                                               composed
                                                                                               (type-apply composed result)
                                                                                               nidx))))]
                                     (,, target-subst result-type nidx))
        _                        (fatal "cannot infer type for ${(valueToString expr)}")))

(** ## Patterns **)

(defn pat-and-body [tenv pat body (,, value-subst value-type nidx) monomorphic]
    (** Yay!! Now we have verification. **)
        (let [
        (,, pat-type bindings nidx)    (t-pat tenv pat nidx)
        (, unified-subst nidx)         (unify value-type pat-type nidx (pat-loc pat))
        composed                       (compose-subst "pat-and-body" unified-subst value-subst)
        bindings                       (map/map (type-apply composed) bindings)
        schemes                        (map/map
                                           (if monomorphic
                                               (scheme set/nil)
                                                   (generalize (tenv-apply composed tenv)))
                                               bindings)
        bound-env                      (foldr
                                           (tenv-apply value-subst tenv)
                                               (map/to-list schemes)
                                               (fn [tenv (, name scheme)] (tenv/set-type tenv name scheme)))
        (,, body-subst body-type nidx) (t-expr (tenv-apply composed bound-env) body nidx)]
        (,,
            (compose-subst "pat-and-body-2" body-subst composed)
                (type-apply composed body-type)
                nidx)))

(defn t-pat [tenv pat nidx]
    (t-pat-inner tenv pat nidx)
        ;(let [
        l                    (pat-loc pat)
        _                    (trace [(tloc l) (tcolor "blue") (ttext "enter")])
        (,, type subst nidx) (t-pat-inner tenv pat nidx)
        _                    (trace
                                 [(tloc l)
                                     (tcolor "white")
                                     (ttext "exit")
                                     (tfmt type type-to-string-raw)])]
        (,, type subst nidx)))

(defn t-pat-inner [tenv pat nidx]
    (match pat
        (pany nl)             (let [(, var nidx) (new-type-var "any" nidx nl)] (,, var map/nil nidx))
        (pvar name nl)        (let [(, var nidx) (new-type-var name nidx nl)]
                                  (,, var (map/set map/nil name var) nidx))
        (pstr _ nl)           (,, (tcon "string" nl) map/nil nidx)
        (pprim (pbool _ _) l) (,, (tcon "bool" l) map/nil nidx)
        (pprim (pint _ _) l)  (,, (tcon "int" l) map/nil nidx)
        (pcon name args l)    (let [
                                  (tconstructor free cargs cres) (match (tenv/con tenv name)
                                                                     (none)   (fatal "Unknown constructor: ${name}")
                                                                     (some v) v)
                                  (,, tres tsubst nidx)          (instantiate (scheme free cres) nidx l)
                                  tres                           (type/set-loc l tres)
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
                                                                             (, unified-subst nidx)      (unify
                                                                                                             (type-apply subst pat-type)
                                                                                                                 (type-apply subst (type/set-loc l carg))
                                                                                                                 nidx
                                                                                                                 l)]
                                                                             (,,
                                                                                 (compose-subst "t-pat" unified-subst subst)
                                                                                     (map/merge bindings pat-bind)
                                                                                     nidx))))]
                                  (,,
                                      (type-apply subst tres)
                                          (map/map (type-apply subst) bindings)
                                          nidx))))

(** ## Top-level "infer expression" **)

(defn infer [tenv expr]
    (let [
        (,, tenv missing nidx) (find-missing tenv 0 (externals set/nil expr))
        (,, subst type nidx)   (t-expr tenv expr nidx)
        _                      (report-missing subst missing)]
        (type-apply subst type)))

(def tenv/nil (tenv map/nil map/nil map/nil map/nil))

(infer tenv/nil (@ ((fn [a] a) 231)))

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
            (map/from-list
            [(, "int" (, 0 set/nil)) (, "string" (, 0 set/nil)) (, "bool" (, 0 set/nil))])
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

(infer-show basic (@ (let [(, a b) (, 2 true)] (, a b))))

(,
    (errorToString (infer-show basic))
        [(, (@ +) "(fn [int int] int)")
        (, (@ "") "string")
        (, (@ "hi ${"ho"}") "string")
        (, (@ (fn [x] "hi ${x}")) "(fn [string] string)")
        (, (@ (let [a 1] a)) "int")
        (, (@ (let [(, a b) (, 21 true)] (, a b))) "(, int bool)")
        (,
        (@
            (fn [a]
                (match a
                    (, a b) a
                    _       1)))
            "(fn [(, int a)] int)")
        (, (@ 123) "int")
        (, (@ (fn [a] a)) "(fn [a] a)")
        (, (@ (fn [a] (+ 2 a))) "(fn [int] int)")
        (,
        (@ ((fn [(, a _)] (a 2)) (, 1 2)))
            "Fatal runtime: cant unify (fn [int] a) (11080) and int (11085)")
        (, (@ (fn [(, a _)] (a 2))) "(fn [(, (fn [int] a) b)] a)")
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
        (,
        (@ (fn [x] (, (x 1) (x "1" ))))
            "Fatal runtime: cant unify int (12195) and string (12197)")
        (, (@ (let [id (fn [x] (let [y x] y))] ((id id) 2))) "int")
        (, (@ (let [id (fn [x] (x x))] id)) "Fatal runtime: occurs check")
        (, (@ (fn [m] (let [y m] (let [x (y true)] x)))) "(fn [(fn [bool] a)] a)")
        (,
        (@ (2 2))
            "Fatal runtime: cant unify int (3170) and (fn [int] a) (3169)")
        (,  )])

(** ## Statements (simple, no mutual dependencies) **)

(defn infer-stmt [tenv' stmt]
    (match stmt
        (sdef name nl expr l)                     (let [
                                                      nidx                         0
                                                      (** Make a type variable to represent the type of the value, for recursive calls, and add it to the tenv. **)
                                                      (, self nidx)                (new-type-var name nidx l)
                                                      self-bound                   (tenv/set-type tenv' name (scheme set/nil self))
                                                      (** Here we find all "unbound variables" in the expression, and create new type variables for them.
                                                          This makes for a much better experience, because instead of "unbound variable xyz", you can report
                                                          e.g. "unbound variable xyz, expected type: (fn [int] string)". **)
                                                      (,, self-bound missing nidx) (find-missing self-bound nidx (externals set/nil expr))
                                                      (** Here we actually do the inference. **)
                                                      (,, subst t nidx)            (t-expr self-bound expr nidx)
                                                      _                            (report-missing subst missing)
                                                      (** Now we resolve the self type. **)
                                                      selfed                       (type-apply subst self)
                                                      (, unified-subst nidx)       (unify selfed t nidx l)
                                                      composed                     (compose-subst "infer-stmt" unified-subst subst)
                                                      t                            (type-apply composed t)]
                                                      (tenv/set-type tenv/nil name (generalize tenv' t)))
        (stypealias name nl args body l)          (tenv
                                                      map/nil
                                                          map/nil
                                                          map/nil
                                                          (map/set map/nil name (, (map args (fn [(, name _)] name)) body)))
        (sexpr expr l)                            (let [
                                                      (** this "infer" is for side-effects only **)
                                                      _ (infer tenv' expr)]
                                                      tenv/nil)
        (sdeftype tname tnl targs constructors l) (infer-deftype tenv' set/nil tname tnl targs constructors l)))

(infer-stmt
    (infer-stmt tenv/nil (@! (typealias (hello a) (, int a))))
        (@! (typealias what (hello string))))

;(infer-stmt
    (infer-stmt tenv/nil (@! (typealias hello int)))
        (@! (deftype what (array hello))))

(defn map/has [map k]
    (match (map/get map k)
        (some _) true
        _        false))

(defn tenv/alias [(tenv _ _ _ alias)] alias)

(defn fst [(, a _)] a)

(defn extract-type-call [type args]
    (match type
        (tapp one arg l) (extract-type-call one [(, arg l) ..args])
        _                (, type args)))

(defn replace-in-type [subst type]
    (match type
        (tvar _ _)       type
        (tcon name l)    (match (map/get subst name)
                             (some v) (type/set-loc l v)
                             _        type)
        (tapp one two l) (tapp (replace-in-type subst one) (replace-in-type subst two) l)))

(type-to-string
    (replace-in-type
        (map/from-list [(, "a" (@t int)) (, "b" (@t (array string)))])
            (@t (,, string a b))))

(defn subst-aliases [alias type]
    (let [
        (, base args) (extract-type-call type [])
        args          (map args (fn [(, arg l)] (, (subst-aliases alias arg) l)))]
        (match base
            (tcon name _) (match (map/get alias name)
                              (some (, names subst)) (if (!= (len names) (len args))
                                                         (fatal
                                                             "Wrong number of args given to alias ${
                                                                 name
                                                                 }: expected ${
                                                                 (its (len names))
                                                                 }, given ${
                                                                 (its (len args))
                                                                 }.")
                                                             (let [
                                                             subst (if (= (len names) 0)
                                                                       subst
                                                                           (replace-in-type (map/from-list (zip names (map args fst))) subst))]
                                                             (subst-aliases alias subst)))
                              _                      (foldl base args (fn [target (, arg l)] (tapp target arg l))))
            _             (foldl base args (fn [target (, arg l)] (tapp target arg l))))))

(type-to-string
    (subst-aliases
        (map/from-list [(, "hello" (, ["a"] (@t (, int a))))])
            (@t (hello string))))

(defn check-type-names [tenv' type]
    (match type
        (tvar _ _)       true
        (tcon name _)    (let [(tenv _ _ types alias) tenv']
                             (if (map/has types name)
                                 true
                                     (if (map/has alias name)
                                     true
                                         (fatal "Unknown type ${name}"))))
        (tapp one two _) (if (check-type-names tenv' one)
                             (check-type-names tenv' two)
                                 false)))

(defn several [tenv stmts]
    (match stmts
        []               (fatal "Final stmt should be an expr")
        [(sexpr expr _)] (infer tenv expr)
        [one ..rest]     (several (tenv/merge tenv (infer-stmtss tenv [one])) rest)))

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
            "(, (what-t int) (what-t string))")
        (,
        [(@! (deftype (array a) (cons a (array a)) (nil)))
            (@!
            (fn [zip one two]
                (match (, one two)
                    (, [] [])               []
                    (, [a ..one] [b ..two]) [(, a b) ..(zip one two)]
                    _                       [])))]
            "(fn [(fn [(array a) (array b)] (array (, a b))) (array a) (array b)] (array (, a b)))")
        (,
        [(@! (typealias hello int))
            (@! (deftype what (whatok hello)))
            (@! whatok)]
            "(fn [int] what)")
        (,
        [(@! (deftype (, a b) (, a b)))
            (@! (typealias (hello a) (, int a)))
            (@! (deftype what (name (hello string))))
            (@! (name))]
            "(fn [(, int string)] what)")
        (,
        [(@! (deftype (,, a b c) (,, a b c)))
            (@! (typealias id string))
            (@! (typealias (hello a) (,, int id a)))
            (@! (deftype what (name (hello bool))))
            (@! name)]
            "(fn [(,, int string bool)] what)")
        (,
        [(@! (deftype kind (star) (kfun kind kind))) (@! (let [(kfun m n) (star)] 1))]
            "int")])

;(several
    (** This was a test case I needed to figure out. **)
        (foldl
        (tenv/set-constructors
            builtin-env
                "stmt"
                0
                (map/from-list
                [(,
                    "sexpr"
                        (tconstructor set/nil [(tcon "expr" -1) (tint)] (tcon "stmt" -1)))]))
            [(,
            "tenv/merge"
                (concrete (tfns [(tcon "tenv" -1) (tcon "tenv" -1)] (tcon "tenv" -1))))
            (,
            "infer-stmt"
                (concrete (tfns [(tcon "tenv" -1) (tcon "stmt" -1)] (tcon "tenv" -1))))
            (,
            "infer"
                (concrete (tfns [(tcon "tenv" -1) (tcon "expr" -1)] (tcon "tenv" -1))))]
            (fn [c (, a b)] (tenv/set-type c a b)))
        [(@!
        (defn several [tenv stmts]
            (match stmts
                []               (fatal "Fainal stmt should be an expr")
                [(sexpr expr _)] (infer tenv expr)
                [one ..rest]     (several (tenv/merge tenv (infer-stmt tenv one)) rest))))
        (@! several)])

(** ## Some debugging fns **)

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

(** ## Mutually Recursive Values **)

(defn vars-for-names [names nidx tenv]
    (foldr
        (,, tenv [] nidx)
            names
            (fn [(,, tenv vars nidx) (, name loc)]
            (let [(, self nidx) (new-type-var name nidx loc)]
                (,,
                    (tenv/set-type tenv name (scheme set/nil self))
                        [self ..vars]
                        nidx)))))

(defn report-missing [subst (, missing missing-vars)]
    (match missing-vars
        []   0
        vars (let [
                 (, text _) (foldl
                                (, [] (, (some map/nil) 0))
                                    (map missing-vars (type-apply subst))
                                    (fn [(, result maps) t]
                                    (let [(, text maps) (tts-inner t maps false)] (, [text ..result] maps))))]
                 (fatal
                     "Missing variables\n - ${
                         (join
                             "\n - "
                                 (map
                                 (zip missing (rev text []))
                                     (fn [(, (, name loc) type)]
                                     "${name} (${(int-to-string loc)}) : inferred as ${type}")))
                         }"))))

(defn tenv/values [(tenv values _ _ _)] values)

(defn externals-defs [stmts]
    (foldr
        empty
            (map stmts (fn [(sdef _ _ body _)] (externals set/nil body)))
            bag/and))

(defn find-missing [tenv nidx externals]
    (let [
        missing-names               (find-missing-names (tenv/values tenv) externals)
        (,, tenv missing-vars nidx) (vars-for-names missing-names nidx tenv)]
        (,, tenv (, missing-names missing-vars) nidx)))

(defn find-missing-names [values ex]
    (let [
        externals (bag/fold (fn [ext (,, name _ l)] (map/set ext name l)) map/nil ex)]
        (filter
            (fn [(, name loc)]
                (match (map/get values name)
                    (some _) false
                    _        true))
                (map/to-list externals))))

(defn infer-several-inner [bound (,, subst types nidx) (, var (sdef name _ body l))]
    (let [
        (,, body-subst body-type nidx) (t-expr (tenv-apply subst bound) body nidx)
        both                           (compose-subst "infer-several" body-subst subst)
        selfed                         (type-apply both var)
        (, u-subst nidx)               (unify selfed body-type nidx l)
        subst                          (compose-subst "infer-several-2" u-subst both)]
        (,, subst [(type-apply subst body-type) ..types] nidx)))

(defn infer-several [tenv stmts]
    (let [
        nidx                    0
        names                   (map
                                    stmts
                                        (fn [stmt]
                                        (match stmt
                                            (sdef name _ _ _) name
                                            _                 (fatal "Cant infer-several with sdefs? idk maybe you can ..."))))
        (,, bound vars nidx)    (vars-for-names
                                    (map stmts (fn [(sdef name _ _ l)] (, name l)))
                                        nidx
                                        tenv)
        (,, bound missing nidx) (find-missing bound nidx (externals-defs stmts))
        (,, subst types nidx)   (foldr
                                    (,, map/nil [] nidx)
                                        (zip vars stmts)
                                        (infer-several-inner bound))
        _                       (report-missing subst missing)]
        (zip names (map types (type-apply subst)))))

(,
    (errorToString
        (fn [x]
            (map (infer-several basic x) (fn [(, _ type)] (type-to-string type)))))
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
            ["(fn [int] int)" "(fn [int int] int)" "(fn [int int int] int)"])
        (,
        [(@! (defn what [a] (+ 2 ho)))]
            "Fatal runtime: Missing variables\n - ho (15537) : inferred as int")])

(** ## Testing Errors **)

(defn infer-stmts [tenv stmts]
    (foldl
        tenv
            stmts
            (fn [tenv stmt] (tenv/merge tenv (infer-stmtss tenv [stmt])))))

(,
    (errorToString (infer-stmts builtin-env))
        [(,
        [(@! (defn hello [a] (+ 1 a))) (@! (hello "a"))]
            "Fatal runtime: cant unify int (10720) and string (10738)")
        (,
        [(@! (deftype one (two) (three int))) (@! (two 1))]
            "Fatal runtime: cant unify one (10756) and (fn [int] a) (10753)")])

(** ## deftype and typealias **)

(defn infer-deftype [tenv' bound tname tnl targs constructors l]
    (let [
        names           (map constructors (fn [(,,, name _ _ _)] name))
        final           (foldl
                            (tcon tname tnl)
                                targs
                                (fn [body (, arg al)] (tapp body (tvar arg al) l)))
        free-set        (foldl set/nil targs (fn [free (, arg _)] (set/add free arg)))
        (, values cons) (foldl
                            (, map/nil map/nil)
                                constructors
                                (fn [(, values cons) (,,, name nl args l)]
                                (let [
                                    args (map args (fn [arg] (type-with-free arg free-set)))
                                    args (map args (subst-aliases (tenv/alias tenv')))
                                    _    (map
                                             args
                                                 (fn [arg]
                                                 (match (bag/to-list (externals-type (set/add bound tname) arg))
                                                     []    true
                                                     names (fatal
                                                               "Unbound types (in deftype ${
                                                                   tname
                                                                   }) ${
                                                                   (join ", " (map names (fn [(,, name _ _)] name)))
                                                                   }"))))]
                                    (,
                                        (map/set
                                            values
                                                name
                                                (scheme free-set (foldr final args (fn [body arg] (tfn arg body l)))))
                                            (map/set cons name (tconstructor free-set args final))))))]
        (tenv
            values
                cons
                (map/set map/nil tname (, (len targs) (set/from-list names)))
                map/nil)))

(defn infer-stypes [tenv' stypes salias]
    (let [
        names                    (foldl
                                     (map salias (fn [(,, name _ _)] name))
                                         stypes
                                         (fn [names (sdeftype name _ _ _ _)] [name ..names]))
        (tenv _ _ types aliases) tenv'
        bound                    (set/merge
                                     (set/from-list (map/keys types))
                                         (set/merge (set/from-list names) (set/from-list (map/keys aliases))))
        tenv                     (foldl
                                     tenv/nil
                                         salias
                                         (fn [tenv (,, name args body)]
                                         (match (bag/to-list
                                             (externals-type
                                                 (set/merge bound (set/from-list (map args fst)))
                                                     body))
                                             []    (tenv/add-alias tenv name (, (map args fst) body))
                                             names (fatal
                                                       "Unbound types ${(join ", " (map names (fn [(,, name _ _)] name)))}"))))
        merged                   (tenv/merge tenv tenv')
        tenv                     (foldl
                                     tenv
                                         stypes
                                         (fn [tenv (sdeftype name tnl args constructors l)]
                                         (tenv/merge
                                             (infer-deftype merged bound name tnl args constructors l)
                                                 tenv)))
        tenv'                    (tenv/merge tenv tenv')]
        tenv))

(** ## Statements (w/ circular dependencies) **)

(infer-show basic (@ (fn [a b c] (+ (a b) (a c)))))

(defn split-stmts [stmts sdefs stypes salias sexps]
    (match stmts
        []           (,,, sdefs stypes salias sexps)
        [one ..rest] (match one
                         (sdef _ _ _ _)                  (split-stmts rest [one ..sdefs] stypes salias sexps)
                         (sdeftype _ _ _ _ _)            (split-stmts rest sdefs [one ..stypes] salias sexps)
                         (stypealias name _ args body _) (split-stmts
                                                             rest
                                                                 sdefs
                                                                 stypes
                                                                 [(,, name args body) ..salias]
                                                                 sexps)
                         (sexpr expr _)                  (split-stmts rest sdefs stypes salias [expr ..sexps]))))

(defn infer-defns [tenv stmts]
    (match stmts
        [one] (infer-stmt tenv one)
        _     (foldl
                  tenv/nil
                      (infer-several tenv stmts)
                      (fn [tenv (, name type)]
                      (tenv/set-type tenv name (generalize tenv type))))))

(defn infer-stmtss [tenv' stmts]
    (let [
        (,,, sdefs stypes salias sexps) (split-stmts stmts [] [] [] [])
        type-tenv                       (infer-stypes tenv' stypes salias)
        tenv'                           (tenv/merge type-tenv tenv')
        val-tenv                        (infer-defns tenv' sdefs)
        _                               (map sexps (infer (tenv/merge val-tenv tenv')))]
        (tenv/merge type-tenv val-tenv)))

(infer-stmtss
    (foldl tenv/nil [(, "int" 0) (, "string" 0)] tenv/add-builtin-type)
        [(@! (typealias one (, int string)))
        (@! (deftype (, a b) (, a b)))
        (@! (deftype one (two int)))
        (@! (deftype kind (star) (kfun kind kind)))
        (@! (let [(kfun m n) (star)] 1))])

(** ## Dependency analysis
    Needed so we can know when to do mutual recursion, as well as for sorting definitions by dependency order. **)

(deftype (bag a) (one a) (many (array (bag a))) (empty))

(defn bag/and [first second]
    (match (, first second)
        (, (empty) a)           a
        (, a (empty))           a
        (, (many [a]) (many b)) (many [a ..b])
        (, a (many b))          (many [a ..b])
        _                       (many [first second])))

(defn bag/fold [f init bag]
    (match bag
        (empty)      init
        (one v)      (f init v)
        (many items) (foldr init items (bag/fold f))))

(defn concat [one two]
    (match one
        []           two
        [one]        [one ..two]
        [one ..rest] [one ..(concat rest two)]))

(defn bag/to-list [bag]
    (match bag
        (empty)     []
        (one a)     [a]
        (many bags) (foldr
                        []
                            bags
                            (fn [res bag]
                            (match bag
                                (empty) res
                                (one a) [a ..res]
                                _       (concat (bag/to-list bag) res))))))

(,
    bag/to-list
        [(, (many [empty (one 1) (many [(one 2) empty]) (one 10)]) [1 2 10])])

(defn pat-names [pat]
    (match pat
        (pany _)           set/nil
        (pvar name l)      (set/add set/nil name)
        (pcon name args l) (foldl
                               set/nil
                                   args
                                   (fn [bound arg] (set/merge bound (pat-names arg))))
        (pstr string int)  set/nil
        (pprim prim int)   set/nil))

(defn pat-externals [pat]
    (match pat
        (** Soo this should be probably a (type)? **)
        (pcon name args l) (bag/and (one (,, name (value) l)) (many (map args pat-externals)))
        _                  empty))

(defn externals [bound expr]
    (match expr
        (evar name l)              (if (set/has bound name)
                                       empty
                                           (one (,, name (value) l)))
        (eprim prim l)             empty
        (estr first templates int) (many (map templates (fn [(,, expr _ _)] (externals bound expr))))
        (equot expr int)           empty
        (equot/type _ _)           empty
        (equot/pat _ _)            empty
        (equot/stmt _ _)           empty
        (equotquot cst int)        empty
        (elambda pat body int)     (bag/and
                                       (pat-externals pat)
                                           (externals (set/merge bound (pat-names pat)) body))
        (elet pat init body l)     (bag/and
                                       (bag/and (pat-externals pat) (externals bound init))
                                           (externals (set/merge bound (pat-names pat)) body))
        (eapp target arg int)      (bag/and (externals bound target) (externals bound arg))
        (ematch expr cases int)    (bag/and
                                       (externals bound expr)
                                           (foldl
                                           empty
                                               cases
                                               (fn [bag (, pat body)]
                                               (bag/and
                                                   (bag/and bag (pat-externals pat))
                                                       (externals (set/merge bound (pat-names pat)) body)))))))

(,
    (dot bag/to-list (externals (set/from-list ["+" "-" "cons" "nil"])))
        [(, (@ hi) [(,, "hi" (value) 16110)])
        (, (@ [1 2 c]) [(,, "c" (value) 16144)])
        (,
        (@ (one two three))
            [(,, "one" (value) 16158)
            (,, "two" (value) 16159)
            (,, "three" (value) 16160)])])

(defn dot [a b c] (a (b c)))

(defn externals-type [bound t]
    (match t
        (tvar _ _)       empty
        (tcon name l)    (if (set/has bound name)
                             empty
                                 (one (,, name (type) l)))
        (tapp one two _) (bag/and (externals-type bound one) (externals-type bound two))))

(defn names [stmt]
    (match stmt
        (sdef name l _ _)                  [(,, name (value) l)]
        (sexpr _ _)                        []
        (stypealias name l _ _ _)          [(,, name (type) l)]
        (sdeftype name l _ constructors _) [(,, name (type) l)
                                               ..(map constructors (fn [(,,, name l _ _)] (,, name (value) l)))]))

(defn externals-stmt [stmt]
    (bag/to-list
        (match stmt
            (sdeftype string int free constructors int) (let [frees (set/from-list (map free fst))]
                                                            (many
                                                                (map
                                                                    constructors
                                                                        (fn [(,,, name l args _)]
                                                                        (match args
                                                                            [] empty
                                                                            _  (many (map args (externals-type frees))))))))
            (stypealias name _ args body _)             (let [frees (set/from-list (map args fst))]
                                                            (externals-type frees body))
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
                        _       [mx]))))))

(** ## Type Environment populated with Builtins **)

(defn tfn [a b l] (tapp (tapp (tcon "->" l) a l) b l))

(def tbool (tcon "bool" -1))

(def tint (tcon "int" -1))

(defn tmap [k v] (tapp (tapp (tcon "map" -1) k -1) v -1))

(defn tfns [args result]
    (foldr result args (fn [result arg] (tfn arg result -1))))

(type-to-string (tfns [tint tbool] tstring))

(defn toption [arg] (tapp (tcon "option" -1) arg -1))

;(typealias what l)

(defn tarray [arg] (tapp (tcon "array" -1) arg -1))

(defn tset [arg] (tapp (tcon "set" -1) arg -1))

(defn concrete [t] (scheme set/nil t))

(defn generic [vbls t] (scheme (set/from-list vbls) t))

(defn vbl [k] (tvar k -1))

(defn t, [a b] (tapp (tapp (tcon "," -1) a -1) b -1))

(def tstring (tcon "string" -1))

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
                        (, "()" (concrete (tcon "()" -1)))
                        (,
                        "trace"
                            (kk
                            (tfns
                                [(tapp (tcon "array" -1) (tapp (tcon "trace-fmt" -1) k -1) -1)]
                                    (tcon "()" -1))))
                        (, "unescapeString" (concrete (tfns [tstring] tstring)))
                        (, "int-to-string" (concrete (tfns [tint] tstring)))
                        (, "string-to-int" (concrete (tfns [tstring] (toption tint))))
                        (,
                        "string-to-float"
                            (concrete (tfns [tstring] (toption (tcon "float" -1)))))
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
                        (, "map/keys" (kv (tfns [(tmap k v)] (tarray k))))
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
                        (,
                        "errorToString"
                            (generic ["v"] (tfns [(tfns [(vbl "v")] tstring) (vbl "v")] tstring)))
                        (, "sanitize" (concrete (tfns [tstring] tstring)))
                        (, "replace-all" (concrete (tfns [tstring tstring tstring] tstring)))
                        (, "fatal" (generic ["v"] (tfns [tstring] (vbl "v"))))])
                    (map/from-list [(, "()" (tconstructor set/nil [] (tcon "()" -1)))])
                    (map/from-list
                    [(, "int" (, 0 set/nil))
                        (, "float" (, 0 set/nil))
                        (, "string" (, 0 set/nil))
                        (, "bool" (, 0 set/nil))
                        (, "map" (, 2 set/nil))
                        (, "set" (, 1 set/nil))
                        (, "->" (, 2 set/nil))])
                    map/nil)
                [;(@! (deftype (array a) (cons a (array a)) (nil)))
                ;(@! (deftype (option a) (some a) (none)))
                (@! (deftype (, a b) (, a b)))
                (@! (deftype (,, a b c) (,, a b c)))
                (@! (deftype (,,, a b c d) (,,, a b c d)))
                (@! (deftype (,,,, a b c d e) (,,,, a b c d e)))
                (@!
                (deftype (trace-fmt a)
                    (tcolor string)
                        (tbold bool)
                        (titalic bool)
                        (tflash bool)
                        (ttext string)
                        (tval a)
                        (tloc int)
                        (tnamed (trace-fmt a))
                        (tfmted a string)
                        (tfmt a (fn [a] string))))]
                (fn [tenv stmt] (tenv/merge tenv (infer-stmtss tenv [stmt]))))))

(infer-show builtin-env (@ ,))

(defn subst-to-string [subst]
    (join
        "\n"
            (map
            (map/to-list subst)
                (fn [(, k v)] "${k} : ${(type-to-string-raw v)}"))))

(** ## Exporting as an "evaluator" **)

(deftype inference
    (** initial
        check-stmt
        add-stmt
        check-stmts **)
        (inference
        tenv
            (fn [tenv (array stmt)] tenv)
            (fn [tenv tenv] tenv)
            (fn [tenv expr] type)))

(deftype name-kind (value) (type))

(deftype analysis
    (** externals
        declared-names **)
        (analysis
        (fn [stmt] (array (,, string name-kind int)))
            (fn [expr] (array (,, string name-kind int)))
            (fn [stmt] (array (,, string name-kind int)))))

(deftype evaluator
    (typecheck
        inference
            analysis
            (fn [type] string)
            (fn [tenv string] (option type))))

(def externals-list (fn [x] (bag/to-list (externals set/nil x))))

((eval
    "({0: {0: env_nil, 1: infer_stmts,  2: add_stmt,  3: infer},\n  1: {0: externals_stmt, 1: externals_expr, 2: names},\n  2: type_to_string, 3: get_type\n }) => ({type: 'fns',\n   env_nil, infer_stmts, add_stmt, infer, externals_stmt, externals_expr, names, type_to_string, get_type \n }) ")
    (typecheck
        (inference builtin-env infer-stmtss tenv/merge infer)
            (analysis externals-stmt externals-list names)
            type-to-string
            (fn [tenv name]
            (match (tenv/type tenv name)
                (some v) (some (scheme/type v))
                _        (none)))))