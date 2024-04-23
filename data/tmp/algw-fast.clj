(** ## Algorithm W Step-By-Step
    Notable additions:
    - putting the subst map into the state monad, making it less likely that substs would be missed, and enabling hover-for-type. Note that, for performance reasons, infer-expr has its subst isolated from the main state monad. This is consistent with the original paper & algorithm.
    - patterns, sum types, match, template strings **)

(** ## Prelude
    some handy functions **)

(deftype (option a) (some a) (none))

5249

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

(deftype quot
    (quot/expr expr)
        (quot/stmt stmt)
        (quot/type type)
        (quot/pat pat)
        (quot/quot cst))

(deftype expr
    (eprim prim int)
        (estr string (array (,, expr string int)) int)
        (evar string int)
        (equot quot int)
        (elambda (array pat) expr int)
        (eapp expr (array expr) int)
        (elet (array (, pat expr)) expr int)
        (ematch expr (array (, pat expr)) int))

(deftype prim (pint int int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string int (array pat) int)
        (pstr string int)
        (pprim prim int))

(defn expr/idents [expr]
    (match expr
        (estr _ exprs _)        (many (map exprs (dot expr/idents ,,0)))
        (evar name l)           (one (, name l))
        (elambda pats expr l)   (many [(expr/idents expr) ..(map pats pat/idents)])
        (eapp target args _)    (many [(expr/idents target) ..(map args expr/idents)])
        (elet bindings body _)  (many
                                    [(expr/idents body)
                                        ..(map
                                        bindings
                                            (fn [(, pat exp)] (bag/and (pat/idents pat) (expr/idents exp))))])
        (ematch target cases _) (bag/and
                                    (expr/idents target)
                                        (many
                                        (map
                                            cases
                                                (fn [(, pat exp)] (bag/and (pat/idents pat) (expr/idents exp))))))
        _                       empty))

(defn pat/idents [pat]
    (match pat
        (pvar name l)         (one (, name l))
        ; TODO add loc for pcon ...
        (pcon name il pats l) (many [(one (, name il)) ..(map pats pat/idents)])
        _                     empty))

(defn stmt/idents [stmt]
    (match stmt
        (sdef name l body _)             (bag/and (one (, name l)) (expr/idents body))
        (sexpr exp _)                    (expr/idents exp)
        (stypealias name l args body _)  (bag/and (type/idents body) (many [(one (, name l)) ..(map args one)]))
        (sdeftype name l args constrs _) (bag/and
                                             (many
                                                 (map
                                                     constrs
                                                         (fn [(,,, name l args _)]
                                                         (bag/and (one (, name l)) (many (map args type/idents))))))
                                                 (bag/and (one (, name l)) (many (map args one))))))

(defn type/idents [type]
    (match type
        (tvar name l)       (one (, name l))
        (tapp target arg _) (bag/and (type/idents target) (type/idents arg))
        (tcon name l)       (one (, name l))))

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
        (stypealias string int (array (, string int)) type int)
        (sdef string int expr int)
        (sexpr expr int))

(defn ,,0 [(,, a _ _)] a)

(defn expr-to-string [expr]
    (match expr
        (evar n _)           n
        (elambda pats b _)   "(fn [${(join " " (map pats pat-to-string ))}] ${(expr-to-string b)})"
        (eapp a args _)      "(${(expr-to-string a)} ${(join " " (map args expr-to-string))})"
        (eprim (pint n _) _) (int-to-string n)
        (ematch t cases _)   "(match ${(expr-to-string t)} ${(join
                                 "\n"
                                     (map cases (fn [(, a b)] "${(pat-to-string a)} ${(expr-to-string b)}")))}"
        _                    "??"))

(defn pat-to-string [pat]
    (match pat
        (pany _)           "_"
        (pvar n _)         n
        (pcon c il pats _) "(${c} ${(join " " (map pats pat-to-string))})"
        (pstr s _)         "\"${s}\""
        (pprim _ _)        "prim"))

(defn type= [one two]
    (match (, one two)
        (, (tvar a _) (tvar b _))     (= a b)
        (, (tapp a b _) (tapp c d _)) (if (type= a c)
                                          (type= b d)
                                              false)
        (, (tcon a _) (tcon b _))     (= a b)
        _                             false))

(defn pat-loc [pat]
    (match pat
        (pany l)       l
        (pprim _ l)    l
        (pstr _ l)     l
        (pvar _ l)     l
        (pcon _ _ _ l) l))

(defn expr-loc [expr]
    (match expr
        (estr _ _ l)    l
        (eprim _ l)     l
        (evar _ l)      l
        (equot _ l)     l
        (elambda _ _ l) l
        (elet _ _ l)    l
        (eapp _ _ l)    l
        (ematch _ _ l)  l))

(defn type/set-loc [loc type]
    (match type
        (tvar name _) (tvar name loc)
        (tapp a b _)  (tapp (type/set-loc loc a) (type/set-loc loc b) loc)
        (tcon name _) (tcon name loc)))

(defn type-with-free [type free]
    (match type
        (tvar _ _)   type
        (tcon s l)   (if (set/has free s)
                         (tvar s l)
                             type)
        (tapp a b l) (tapp (type-with-free a free) (type-with-free b free) l)))

(defn type-with-free-rec [free type]
    (match type
        (tvar _ _)   (<- type)
        (tcon s l)   (match (map/get free s)
                         (some fl) (let-> [() (record-usage-> l fl)] (<- (tvar s l)))
                         _         (<- type))
        (tapp a b l) (let-> [a (type-with-free-rec free a) b (type-with-free-rec free b)]
                         (<- (tapp a b l)))))

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

(** ## Type to string, Type to CST **)

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
            (let [(, arg free) (tts-inner a free locs)] (, [arg ..args] free)))))

(defn and-loc [locs l s]
    (if locs
        "${s}:${(if (= l -1)
            "🚨"
                (its l))}"
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
                                                 (, iargs r)   (unwrap-fn b)
                                                 args          [a ..iargs]
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

(defn ttc-list [args free]
    (foldl
        (, [] free)
            args
            (fn [(, args free) a]
            (let [(, arg free) (ttc-inner a free)] (, [arg ..args] free)))))

(defn ttc-inner [t free]
    (match t
        (tvar vname loc)                     (let [(, fmap idx) free]
                                                 (match fmap
                                                     (some fmap) (match (map/get fmap vname)
                                                                     (some name) (, (cst/identifier name loc) free)
                                                                     none        (let [name (at letters idx "_too_many_vbls_")]
                                                                                     (,
                                                                                         (cst/identifier name loc)
                                                                                             (, (some (map/set fmap vname name)) (+ 1 idx)))))
                                                     _           (, (cst/identifier vname loc) free)))
        (tcon name l)                        (, (cst/identifier name l) free)
        (tapp (tapp (tcon "->" _) a la) b l) (let [
                                                 (, iargs r)   (unwrap-fn b)
                                                 args          [a ..iargs]
                                                 (, args free) (ttc-list args free)
                                                 (, two free)  (ttc-inner r free)]
                                                 (,
                                                     (cst/list [(cst/identifier "fn" la) (cst/array (rev args []) la) two] l)
                                                         free))
        (tapp a b l)                         (let [
                                                 (, target args) (unwrap-app a)
                                                 args            [b ..args]
                                                 args            (rev args [])
                                                 (, args free)   (ttc-list args free)
                                                 (, one free)    (ttc-inner target free)]
                                                 (, (cst/list [one ..(rev args [])] l) free))))

(ttc-inner (@t (fn [x] y)) (, (some map/nil) 0))



(type-to-cst
    (type-with-free (@t (fn [a1 b a1 d] y)) (set/from-list ["a1" "b"])))

(type-with-free (@t (fn [a1 b1 a1 d] y)) (set/from-list ["a1" "b1"]))

(defn type-to-cst [t]
    (let [(, cst _) (ttc-inner t (, (some map/nil) 0))] cst))

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
    (tenv a b (map/set names name (,, args set/nil -1)) d))

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
            type
            ; the loc
            int))

(deftype tenv
    (tenv
        ; types (scheme loc)
            (map string (, scheme int))
            ; type constructors
            (map string tconstructor)
            ; type names (number of arguments) (set of constructor names) loc
            (map string (,, int (set string) int))
            ; type aliases (argument names) (body) (loc)
            (map string (,, (array string) type int))))

(defn tenv/type [(tenv types _ _ _) key] (map/get types key))

(defn tenv/con [(tenv _ cons _ _) key] (map/get cons key))

(defn tenv/names [(tenv _ _ names _) key] (map/get names key))

(defn tenv/rm [(tenv types cons names alias) var]
    (tenv (map/rm types var) cons names alias))

(defn tenv/set-type [(tenv types cons names alias) k v]
    (tenv (map/set types k v) cons names alias))

(defn tenv/set-constructors [(tenv types cons names alias) name vbls ncons loc]
    (tenv
        types
            (map/merge cons ncons)
            (map/set names name (,, vbls (set/from-list (map/keys ncons)) loc))
            alias))

(defn tenv/add-alias [(tenv a b c aliases) name (,, args body l)]
    (tenv a b c (map/set aliases name (,, args body l))))

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
    (foldr
        set/nil
            (map (map/values types) (fn [(, s _)] (scheme-free s)))
            set/merge))

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
    (tenv
        (map/map (fn [(, s l)] (, (scheme-apply subst s) l)) types)
            cons
            names
            alias))

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
                                                      "compose-subst[${place}]: old-subst has key ${key}, which is used in new-subst for ${nkey} => ${(type-to-string-raw type)}")
                                                      current))))))))

(def debug-invariant false)

(defn compose-subst [place new-subst old-subst]
    (match (if debug-invariant
        (check-invariant place new-subst old-subst)
            (none))
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
        (** "a" gets the "b" substitution applied to it, and then overrides the "a" from new-subst **)
        (, [(, "a" (tvar "b" -1))] [(, "a" (tvar "c" -1)) (, "b" (tvar "c" -1))])])

(** ## Generalizing
    This is where we take a type and turn it into a scheme, so we need to be able to know what variables should be reported as "generic" at the level of the type. Basically, any variables that already exist in the type environment should not be generalized over here.
    (fn [x] (let [y (fn [z] x)] t))
    In this case, y should not be generic over its return type, only its argument type. **)

(defn generalize [tenv t]
    (scheme (set/diff (type-free t) (tenv-free tenv)) t))

(** ## A State monad
    Given that we're going 100% immutable, having a State monad is really handy so you're not having to manually pass around a "next unique id" or "here are the current substitutions" everywhere.
    Because we don't have type classes in our language at the moment (more on that later), our "do notation" is limited to a single monad, for the whole file. Because of that, we'll be combining the classic "StateT" monad from haskell with an "Either left right" (which I call Result ok err, because I like the names Rust uses much better).
    Because we want to be able to access the intermediate type inference state even in the case of a unification error, we put the result inside the state monad, instead of the other way around. **)

(deftype (result good bad) (ok good) (err bad))

(deftype (StateT state err value)
    (StateT (fn [state] (, state (result value err)))))

(defn run-> [(StateT f) state] (let [(, _ result) (f state)] result))

(defn state-f [(StateT f)] f)

(defn >>= [(StateT f) next]
    (StateT
        (fn [state]
            (match (f state)
                (, state (err e))    (, state (err e))
                (, state (ok value)) ((state-f (next value)) state)))))

(defn <- [x] (StateT (fn [state] (, state (ok x)))))

(defn <-err [e] (StateT (fn [state] (, state (err e)))))

(def <-state (StateT (fn [state] (, state (ok state)))))

(defn state-> [v] (StateT (fn [old] (, v (ok old)))))

(defn map-> [f arr]
    (match arr
        []           (<- [])
        [one ..rest] (let-> [one (f one) rest (map-> f rest)] (<- [one ..rest]))))

(defn do-> [f arr]
    (match arr
        []           (<- ())
        [one ..rest] (let-> [() (f one) () (do-> f rest)] (<- ()))))

(defn seq-> [arr]
    (match arr
        []           (<- [])
        [one ..rest] (let-> [one one rest (seq-> rest)] (<- [one ..rest]))))

(defn ok-> [result]
    (match result
        (ok v)  (<- v)
        (err e) (<-err e)))

(defn force [e->s result]
    (match result
        (ok v)  v
        (err e) (fatal "Result Error ${(e->s e)}")))

(defn foldl-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [one (f init one)] (foldl-> one rest f))))

(defn foldr-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [init (foldr-> init rest f)] (f init one))))

(** ## Type Inference State
    The original "Algorithm W Step by Step" paper uses a state monad for the first (generating unique identifiers for type variables), but not for the "substitutions" thing. Originally, I copied their code faithfully, but (1) their code had a bug in it where compose-subst was called with arguments in the wrong order at one point, (2) the "Typing Haskell in Haskell" algorithm is similar to alg-w in a lot of ways, and puts their substitutions equivalent in the state monad, and (3) keeping it in the state monad makes it easier for me to figure out the types of every expression after the fact, allowing me to have very nice "hover-for-type" functionality. **)

(typealias
    (State value)
        (StateT
        (,, int (, type-record usage-record) (map string type))
            value))

(typealias usage-record (, (array int) (array (, int int))))

(typealias type-record (array (,, int type bool)))

(def <-idx (let-> [(,, idx _ _) <-state] (<- idx)))

(def <-subst (let-> [(,, _ _ subst) <-state] (<- subst)))

(defn idx-> [idx]
    (let-> [(,, _ b c) <-state _ (state-> (,, idx b c))] (<- ())))

(defn record-> [loc type keep]
    (let-> [
        (,, idx (, types usages) subst) <-state
        _                               (state-> (,, idx (, [(,, loc type keep) ..types] usages) subst))]
        (<- ())))

(defn record-usage-> [loc provider]
    (let-> [
        (,, idx (, types (, defs usages)) subst) <-state
        _                                        (state-> (,, idx (, types (, defs [(, loc provider) ..usages])) subst))]
        (<- ())))

(defn record-def-> [loc]
    (let-> [
        (,, idx (, types (, defs usages)) subst) <-state
        _                                        (state-> (,, idx (, types (, [loc ..defs] usages)) subst))]
        (<- ())))

(def <-types (let-> [(,, _ types _) <-state] (<- types)))

(defn subst-> [new-subst]
    (let-> [
        (,, idx types subst) <-state
        _                    (state-> (,, idx types (compose-subst "" new-subst subst)))]
        (<- ())))

(defn subst-reset-> [new-subst]
    (let-> [(,, idx types subst) <-state _ (state-> (,, idx types new-subst))]
        (<- subst)))

(def state/nil (,, 0 (, [] (, [] [])) map/nil))

(defn run/nil-> [st] (run-> st state/nil))

(defn run/record [st]
    (run->
        (let-> [value st types <-types] (<- (, value types)))
            state/nil))

(** ## Instantiate
    This takes a scheme and generates fresh type variables for everything in the "generics" set.
    This allows us to have different instantiations of a given type variable when we e.g. use the same function twice in two different ways. Without this, the following wouldn't work:
    (let [a (cons 1) b (cons "hi")] 1)
    Because the type variable in the type for cons would be the same in both cases. With instantiate, the type for cons gets a fresh type variable at each usage. **)

(defn instantiate [(scheme vars t) l]
    (let-> [
        names      (<- (set/to-list vars))
        with-types (map-> (fn [name] (new-type-var name l)) names)
        subst      (<- (map/from-list (zip names with-types)))]
        (<- (, (type-apply subst t) subst))))

(force
    type-error->s
        (run/nil-> (instantiate (scheme (set/from-list ["a"]) (tvar "a" -1)) 10)))

(defn scheme/t [(scheme _ t)] t)

(defn new-type-var [prefix l]
    (let-> [nidx <-idx _ (idx-> (+ nidx 1))]
        (<- (tvar "${prefix}:${(its nidx)}" l))))

(** ## Unification
    Because our type-language is so simple, unification is quite straightforward. If we come across a tvar, we treat whatever's on the other side as its substitution; otherwise we recurse.
    Importantly, unify doesn't produce a "unified type"; instead it produces a substitution which, when applied to both types, will yield the same unified type.
    If two types are irreconcilable, it throws an exception.
    The "occurs check" prevents infinite types (like a subst from a : int -> a). **)

(defn unify [t1 t2 nidx l]
    (unify-inner t1 t2 l)
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

(typealias type-error-t (, string (array (, string int))))

(defn type-error [message loced-items] (, message loced-items))

(defn unify-inner [t1 t2 l]
    (match (, t1 t2)
        (, (tapp target-1 arg-1 _) (tapp target-2 arg-2 _)) (let-> [
                                                                _     (unify-inner target-1 target-2 l)
                                                                subst <-subst
                                                                _     (unify-inner (type-apply subst arg-1) (type-apply subst arg-2) l)]
                                                                (<- ()))
        (, (tvar var l) t)                                  (var-bind var t l)
        (, t (tvar var l))                                  (var-bind var t l)
        (, (tcon a la) (tcon b lb))                         (if (= a b)
                                                                (<- ())
                                                                    (<-err
                                                                    (type-error "Incompatible type constructors" [(, a la) (, b lb)])))
        _                                                   (<-err
                                                                (type-error
                                                                    "Incompatible types"
                                                                        [(, (type-to-string t1) (type-loc t1))
                                                                        (, (type-to-string t2) (type-loc t2))]))))



(defn var-bind [var type l]
    (match type
        (tvar v _) (if (= var v)
                       (<- ())
                           (let-> [_ (subst-> (map/set map/nil var type))] (<- ())))
        _          (if (set/has (type-free type) var)
                       (<-err
                           (type-error
                               "Cycle found while unifying type with type variable"
                                   [(, (type-to-string-raw type) (type-loc type)) (, var l)]))
                           (let-> [_ (subst-> (map/set map/nil var type))] (<- ())))))

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

(defn t-expr [tenv expr]
    (let-> [
        old  (subst-reset-> map/nil)
        type (t-expr-inner tenv expr)
        new  (subst-reset-> old)
        ()   (subst-> new)
        _    (record-> (expr-loc expr) type false)]
        (<- type)))

(def tenv/apply-> (apply-> tenv-apply))

(def type/apply-> (apply-> type-apply))

(defn apply-> [f tenv] (let-> [subst <-subst] (<- (f subst tenv))))

(defn pat-name [pat]
    (new-type-var
        (match pat
            (pvar name _) name
            _             "$arg")
            (pat-loc pat)))

(defn t-expr-inner [tenv expr]
    (match expr
        (** For variables, we look it up in the environment, and raise an error if we couldn't find it. **)
        (evar "()" l)            (<- (tcon "()" l))
        (evar name l)            (match (tenv/type tenv name)
                                     (none)              (<-err (type-error "Unbound variable" [(, name l)]))
                                     (some (, found fl)) (let-> [
                                                             (, t _) (instantiate found l)
                                                             ()      (record-> l (scheme/t found) true)
                                                             ()      (record-usage-> l fl)]
                                                             (<- (type/set-loc l t))))
        (equot quot l)           (<-
                                     (tcon
                                         (match quot
                                             (quot/expr _) "expr"
                                             (quot/stmt _) "stmt"
                                             (quot/quot _) "cst"
                                             (quot/type _) "type"
                                             (quot/pat _)  "pat")
                                             l))
        (eprim prim _)           (<- (t-prim prim))
        (estr first templates l) (let-> [
                                     string-type (<- (tcon "string" l))
                                     ()          (do->
                                                     (fn [(,, expr suffix sl)]
                                                         (let-> [t (t-expr tenv expr)] (unify-inner t string-type l)))
                                                         templates)]
                                     (<- string-type))
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
        (elambda pats body l)    (let-> [
                                     arg-types              (map-> pat-name pats)
                                     pts                    (map-> (t-pat tenv) pats)
                                     (, pat-types bindings) (<-
                                                                (foldr
                                                                    (, [] map/nil)
                                                                        pts
                                                                        (fn [(, ptypes bindings) (, pt bs)]
                                                                        (, [pt ..ptypes] (map/merge bindings bs)))))
                                     ()                     (do->
                                                                (fn [(, argt patt)] (unify-inner argt patt l))
                                                                    (zip arg-types pat-types))
                                     composed               <-subst
                                     bindings               (<- (map/map (fn [(, t l)] (, (type-apply composed t) l)) bindings))
                                     schemes                (<- (map/map (fn [(, t l)] (, (scheme set/nil t) l)) bindings))
                                     bound-env              (<-
                                                                (foldr
                                                                    (tenv-apply composed tenv)
                                                                        (map/to-list schemes)
                                                                        (fn [tenv (, name (, scheme l))] (tenv/set-type tenv name (, scheme l)))))
                                     body-type              (t-expr (tenv-apply composed bound-env) body)
                                     body-type              (type/apply-> body-type)
                                     arg-types              (map-> type/apply-> arg-types)]
                                     (<- (foldr body-type arg-types (fn [body arg] (tfn arg body l)))))
        (** Function application (target arg)
            - create a type variable to represent the return value of the function application
            - infer the target type
            - infer the arg type, using the subst from the target. (?) Could this be done the other way around?
            - unify the target type with a function (arg type) => return value type variable
            - the subst from the unification is then applied to the return value type variable, giving us the overall type of the expression **)
        (eapp target args l)     (foldl
                                     (t-expr tenv target)
                                         args
                                         (fn [target-> arg]
                                         (let-> [
                                             result-var  (new-type-var "res" l)
                                             target-type target->
                                             arg-tenv    (tenv/apply-> tenv)
                                             arg-type    (t-expr arg-tenv arg)
                                             target-type (type/apply-> target-type)
                                             _           (unify-inner target-type (tfn arg-type result-var l) l)]
                                             (type/apply-> result-var))))
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
        (elet bindings body l)   (match bindings
                                     [(, pat init)] (let-> [inited (t-expr tenv init)]
                                                        (pat-and-body tenv pat body inited false))
                                     _              (t-expr
                                                        tenv
                                                            (foldr
                                                            body
                                                                bindings
                                                                (fn [body (, pat init)] (elet [(, pat init)] body l)))))
        (ematch target cases l)  (let-> [
                                     result-var        (new-type-var "match-res" l)
                                     target-type       (t-expr tenv target)
                                     (, _ result-type) (foldl->
                                                           (, target-type result-var)
                                                               cases
                                                               (fn [(, target-type result) (, pat body)]
                                                               (let-> [
                                                                   body  (pat-and-body tenv pat body target-type false)
                                                                   subst <-subst
                                                                   _     (unify-inner (type-apply subst result) body l)
                                                                   subst <-subst]
                                                                   (<- (, (type-apply subst target-type) (type-apply subst result))))))]
                                     (<- result-type))
        _                        (<-err
                                     (type-error
                                         "Expression not supported (?)"
                                             [(, (expr->s expr) (expr-loc expr))]))))

(** ## Patterns **)

(defn pat-and-body [tenv pat body value-type monomorphic]
    (** Yay!! Now we have verification. **)
        (let-> [
        (, pat-type bindings) (t-pat tenv pat)
        _                     (unify-inner value-type pat-type (pat-loc pat))
        composed              <-subst
        bindings              (<- (map/map (fn [(, t l)] (, (type-apply composed t) l)) bindings))
        schemes               (<-
                                  (map/map
                                      (fn [(, t l)]
                                          (,
                                              (if monomorphic
                                                  (scheme set/nil t)
                                                      (generalize (tenv-apply composed tenv) t))
                                                  l))
                                          bindings))
        bound-env             (<-
                                  (foldr
                                      (tenv-apply composed tenv)
                                          (map/to-list schemes)
                                          (fn [tenv (, name (, scheme l))] (tenv/set-type tenv name (, scheme l)))))
        body-type             (t-expr (tenv-apply composed bound-env) body)]
        (type/apply-> body-type)))

(defn t-pat [tenv pat]
    (let-> [
        (, t bindings) (t-pat-inner tenv pat)
        _              (record-> (pat-loc pat) t false)]
        (<- (, t bindings)))
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

(defn t-pat-inner [tenv pat]
    (match pat
        (pany nl)             (let-> [var (new-type-var "any" nl)] (<- (, var map/nil)))
        (pvar name nl)        (let-> [var (new-type-var name nl) () (record-def-> nl)]
                                  (<- (, var (map/set map/nil name (, var nl)))))
        (pstr _ nl)           (<- (, (tcon "string" nl) map/nil))
        (pprim (pbool _ _) l) (<- (, (tcon "bool" l) map/nil))
        (pprim (pint _ _) l)  (<- (, (tcon "int" l) map/nil))
        (pcon name il args l) (let-> [
                                  (tconstructor free cargs cres cloc) (match (tenv/con tenv name)
                                                                          (none)   (<-err (type-error "Unknown type constructor" [(, name l)]))
                                                                          (some v) (<- v))
                                  ()                                  (record-usage-> il cloc)
                                  ()                                  (record-> il (tfns cargs cres) true)
                                  (, tres tsubst)                     (instantiate (scheme free cres) l)
                                  tres                                (<- (type/set-loc l tres))
                                  (** We've instantiated the free variables into the result, now we need to apply those substitutions to the arguments. **)
                                  cargs                               (<- (map cargs (type-apply tsubst)))
                                  zipped                              (<- (zip args cargs))
                                  _                                   (if (!= (len args) (len cargs))
                                                                          (<-err
                                                                              (type-error
                                                                                  "Wrong number of arguments to type constructor: given ${(its (len args))}, but the type constructor expects ${(its (len cargs))}"
                                                                                      [(, name il)]))
                                                                              (<- ()))
                                  bindings                            (foldl->
                                                                          map/nil
                                                                              zipped
                                                                              (fn [bindings (, arg carg)]
                                                                              (let-> [
                                                                                  (, pat-type pat-bind) (t-pat tenv arg)
                                                                                  subst                 <-subst
                                                                                  _                     (unify-inner
                                                                                                            (type-apply subst pat-type)
                                                                                                                (type-apply subst (type/set-loc l carg))
                                                                                                                l)]
                                                                                  (<- (map/merge bindings pat-bind)))))
                                  subst                               <-subst]
                                  (<-
                                      (,
                                          (type-apply subst tres)
                                              (map/map (fn [(, t l)] (, (type-apply subst t) l)) bindings))))))

(** ## Top-level "infer expression" **)

(defn infer [tenv expr]
    (let-> [
        (, tenv missing) (find-missing tenv (externals set/nil expr))
        type             (t-expr tenv expr)
        subst            <-subst
        _                (report-missing subst missing)]
        (<- (type-apply subst type))))

(def tenv/nil (tenv map/nil map/nil map/nil map/nil))

(run/nil-> (infer tenv/nil (@ ((fn [a] a) 231))))

(run/nil-> (infer tenv/nil (@ (let [a 1] a))))

(def basic
    (tenv
        (map/from-list
            [(, "+" (, (scheme set/nil (tfn tint (tfn tint tint -1) -1)) -1))
                (, "-" (, (scheme set/nil (tfn tint (tfn tint tint -1) -1)) -1))
                (, "()" (, (scheme set/nil (tcon "()" -1)) -1))
                (,
                ","
                    (,
                    (scheme
                        (set/from-list ["a" "b"])
                            (tfn (tvar "a" -1)
                            (tfn (tvar "b" -1)
                                (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "b" -1) -1)
                                    -1)
                                -1))
                        -1))])
            (map/from-list
            [(,
                ","
                    (tconstructor
                    (set/from-list ["a" "b"])
                        [(tvar "a" -1) (tvar "b" -1)]
                        (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "b" -1) -1)
                        -1))])
            (map/from-list
            [(, "int" (,, 0 set/nil -1))
                (, "string" (,, 0 set/nil -1))
                (, "bool" (,, 0 set/nil -1))])
            map/nil))

(run/record (infer basic (@ (+ 2 3))))

(run/record (infer basic (@ (let [a 1] a))))

(run/record
    (infer
        basic
            (@
            (match 1
                1 1))))

(defn type-error->s [(, message names)]
    "${message}${(join "" (map names (fn [(, name loc)] "\n - ${name} (${(its loc)})")))}")

(defn infer-show [tenv x]
    (match (run/nil-> (infer tenv x))
        (ok v)  (type-to-string v)
        (err e) "${(type-error->s e)}"))

(infer-show basic (@ (let [(, a b) (, 2 true)] (, a b))))

(,
    (infer-show basic)
        [(, (@ +) "(fn [int int] int)")
        (, (@ "") "string")
        (, (@ "hi ${"ho"}") "string")
        (, (@ (fn [x] "hi ${x}")) "(fn [string] string)")
        (, (@ (let [a 1] a)) "int")
        (, (@ (let [x ()] x)) "()")
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
            "Incompatible types\n - (fn [int] a) (11080)\n - int (11085)")
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
            "Incompatible type constructors\n - int (12195)\n - string (12197)")
        (, (@ (let [id (fn [x] (let [y x] y))] ((id id) 2))) "int")
        (,
        (@ (let [id (fn [x] (x x))] id))
            "Cycle found while unifying type with type variable\n - (fn [x:1] res:2) (3135)\n - x:1 (3136)")
        (, (@ (fn [m] (let [y m] (let [x (y true)] x)))) "(fn [(fn [bool] a)] a)")
        (,
        (@ (2 2))
            "Incompatible types\n - int (3170)\n - (fn [int] a) (3169)")])

(** ## Statements (simple, no mutual dependencies) **)

(defn infer-stmt [tenv' stmt]
    (match stmt
        (sdef name nl expr l)                     (let-> [
                                                      _                      (idx-> 0)
                                                      (** Make a type variable to represent the type of the value, for recursive calls, and add it to the tenv. **)
                                                      self                   (new-type-var name l)
                                                      ()                     (record-def-> nl)
                                                      self-bound             (<- (tenv/set-type tenv' name (, (scheme set/nil self) nl)))
                                                      (** Here we find all "unbound variables" in the expression, and create new type variables for them.
                                                          This makes for a much better experience, because instead of "unbound variable xyz", you can report
                                                          e.g. "unbound variable xyz, expected type: (fn [int] string)". **)
                                                      (, self-bound missing) (find-missing self-bound (externals set/nil expr))
                                                      (** Here we actually do the inference. **)
                                                      t                      (t-expr self-bound expr)
                                                      subst                  <-subst
                                                      _                      (report-missing subst missing)
                                                      (** Now we resolve the self type. **)
                                                      selfed                 (<- (type-apply subst self))
                                                      _                      (unify-inner selfed t l)
                                                      subst                  <-subst
                                                      t                      (<- (type-apply subst t))
                                                      ()                     (record-> nl t false)]
                                                      (<- (tenv/set-type tenv/nil name (, (generalize tenv' t) nl))))
        (stypealias name nl args body l)          (let-> [() (record-def-> nl) () (record-usages-in-type tenv' map/nil body)]
                                                      (<-
                                                          (tenv
                                                              map/nil
                                                                  map/nil
                                                                  map/nil
                                                                  (map/set map/nil name (,, (map args (fn [(, name _)] name)) body nl)))))
        (sexpr expr l)                            (let-> [
                                                      (** this "infer" is for side-effects only **)
                                                      _ (infer tenv' expr)]
                                                      (<- tenv/nil))
        (sdeftype tname tnl targs constructors l) (infer-deftype tenv' map/nil tname tnl targs constructors l)))

(force
    type-error->s
        (run/nil->
        (infer-stmt
            (force
                type-error->s
                    (run/nil-> (infer-stmt tenv/nil (@! (typealias (hello a) (, int a))))))
                (@! (typealias what (hello string))))))

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
    (let-> [
        (, base args) (<- (extract-type-call type []))
        args          (map->
                          (fn [(, arg l)] (let-> [arg (subst-aliases alias arg)] (<- (, arg l))))
                              args)]
        (match base
            (tcon name l) (match (map/get alias name)
                              (some (,, names subst al)) (if (!= (len names) (len args))
                                                             (<-err
                                                                 (type-error
                                                                     "Wrong number of args given to alias ${name}: expected ${(its (len names))}, given ${(its (len args))}."
                                                                         [(, name l)]))
                                                                 (let-> [
                                                                 subst (<-
                                                                           (if (= (len names) 0)
                                                                               subst
                                                                                   (replace-in-type (map/from-list (zip names (map args fst))) subst)))]
                                                                 (subst-aliases alias subst)))
                              _                          (<- (foldl base args (fn [target (, arg l)] (tapp target arg l)))))
            _             (<- (foldl base args (fn [target (, arg l)] (tapp target arg l)))))))

(type-to-string
    (force
        type-error->s
            (run/nil->
            (subst-aliases
                (map/from-list [(, "hello" (,, ["a"] (@t (, int a)) 1))])
                    (@t (hello string))))))

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
        []               (<-err (type-error "Final stmt should be an expr" []))
        [(sexpr expr _)] (let-> [_ (idx-> 0)] (infer tenv expr))
        [one ..rest]     (let-> [(, tenv' _) (infer-stmtss tenv [one])]
                             (several (tenv/merge tenv tenv') rest))))

(,
    (fn [x]
        (match (run/nil-> (several basic x))
            (ok t)  (type-to-string t)
            (err e) (type-error->s e)))
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

(** ## Some debugging fns **)

(defn show-types [names (tenv types _ _ _)]
    (let [names (set/from-list names)]
        (map
            (filter (fn [(, k v)] (set/has names k)) (map/to-list types))
                (fn [(, name (, (scheme free type) l))]
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

(defn vars-for-names [names tenv]
    (foldr->
        (, tenv [])
            names
            (fn [(, tenv vars) (, name loc)]
            (let-> [self (new-type-var name loc)]
                (<-
                    (,
                        (tenv/set-type tenv name (, (scheme set/nil self) loc))
                            [self ..vars]))))))

(defn report-missing [subst (, missing missing-vars)]
    (match missing-vars
        []   (<- 0)
        vars (let [
                 (, text _) (foldl
                                (, [] (, (some map/nil) 0))
                                    (map missing-vars (type-apply subst))
                                    (fn [(, result maps) t]
                                    (let [(, text maps) (tts-inner t maps false)] (, [text ..result] maps))))]
                 (<-err
                     (type-error
                         "Missing variables"
                             (map
                             (zip missing (rev text []))
                                 (fn [(, (, name loc) type)] (, "${name} inferred as ${type}" loc))))))))

(defn tenv/values [(tenv values _ _ _)] values)

(defn externals-defs [stmts]
    (foldr
        empty
            (map stmts (fn [(sdef _ _ body _)] (externals set/nil body)))
            bag/and))

(defn find-missing [tenv externals]
    (let-> [
        missing-names         (<- (find-missing-names (tenv/values tenv) externals))
        (, tenv missing-vars) (vars-for-names missing-names tenv)]
        (<- (, tenv (, missing-names missing-vars)))))

(defn find-missing-names [values ex]
    (let [
        externals (bag/fold (fn [ext (,, name _ l)] (map/set ext name l)) map/nil ex)]
        (filter
            (fn [(, name loc)]
                (match (map/get values name)
                    (some _) false
                    _        true))
                (map/to-list externals))))

(defn infer-several-inner [bound types (, var (sdef name nl body l))]
    (let-> [
        subst     <-subst
        body-type (t-expr (tenv-apply subst bound) body)
        subst     <-subst
        selfed    (<- (type-apply subst var))
        _         (unify-inner selfed body-type l)
        subst     <-subst
        body-type (<- (type-apply subst body-type))
        _         (record-> nl body-type false)]
        (<- [body-type ..types])))

(defn infer-several [tenv stmts]
    (let-> [
        _                  (idx-> 0)
        names              (<-
                               (map
                                   stmts
                                       (fn [stmt]
                                       (match stmt
                                           (sdef name nl _ _) (, name nl)
                                           _                  (fatal "Cant infer-several with sdefs? idk maybe you can ...")))))
        (, bound vars)     (vars-for-names (map stmts (fn [(sdef name nl _ _)] (, name nl))) tenv)
        (, bound2 missing) (find-missing bound (externals-defs stmts))
        types              (foldr-> [] (zip vars stmts) (infer-several-inner bound2))
        subst              <-subst
        _                  (report-missing subst missing)]
        (<- (zip names (map types (type-apply subst))))))

(,
    (fn [x]
        (match (run/nil-> (infer-several basic x))
            (ok v)  (map v (fn [(, _ t)] (type-to-string t)))
            (err e) [(type-error->s e)]))
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
            ["Missing variables\n - ho inferred as int (15537)"])])

(** ## Testing Errors **)

(defn infer-stmts [tenv stmts]
    (foldl->
        tenv
            stmts
            (fn [tenv stmt]
            (let-> [(, tenv' types) (infer-stmtss tenv [stmt])]
                (<- (tenv/merge tenv tenv'))))))

(fn [stmts]
    (match (run/nil-> (infer-stmts builtin-env stmts))
        (err e) (type-error->s e)
        (ok _)  "No error?"))

(,
    (fn [stmts]
        (match (run/nil-> (infer-stmts builtin-env stmts))
            (err e) (type-error->s e)
            (ok _)  "No error?"))
        [(,
        [(@! (defn hello [a] (+ 1 a))) (@! (hello "a"))]
            "Incompatible type constructors\n - int (10720)\n - string (10738)")
        (,
        [(@! (deftype one (two) (three int))) (@! (two 1))]
            "Incompatible types\n - one (10756)\n - (fn [int] a) (10753)")])

(** ## deftype and typealias **)

(defn infer-deftype [tenv' mutual-rec tname tnl targs constructors l]
    (let-> [
        names           (<- (map constructors (fn [(,,, name _ _ _)] name)))
        ()              (record-def-> tnl)
        final           (foldl->
                            (tcon tname tnl)
                                targs
                                (fn [body (, arg al)]
                                (let-> [() (record-def-> al)] (<- (tapp body (tvar arg al) l)))))
        free-map        (<- (map/from-list targs))
        free-set        (<- (set/from-list (map/keys free-map)))
        (, values cons) (foldl->
                            (, map/nil map/nil)
                                constructors
                                (fn [(, values cons) (,,, name nl args l)]
                                (let-> [
                                    args (map-> (type-with-free-rec free-map) args)
                                    ()   (do-> (record-usages-in-type tenv' mutual-rec) args)
                                    ()   (record-def-> nl)
                                    args (map-> (subst-aliases (tenv/alias tenv')) args)]
                                    (<-
                                        (,
                                            (map/set
                                                values
                                                    name
                                                    (,
                                                    (scheme
                                                        (set/from-list (map/keys free-map))
                                                            (foldr final args (fn [body arg] (tfn arg body l))))
                                                        nl))
                                                (map/set cons name (tconstructor free-set args final nl)))))))]
        (<-
            (tenv
                values
                    cons
                    (map/set map/nil tname (,, (len targs) (set/from-list names) tnl))
                    map/nil))))

(defn infer-stypes [tenv' stypes salias]
    (let-> [
        names                    (<-
                                     (foldl
                                         (map salias (fn [(,,, name _ _ _)] name))
                                             stypes
                                             (fn [names (sdeftype name _ _ _ _)] [name ..names])))
        (tenv _ _ types aliases) (<- tenv')
        bound                    (<-
                                     (set/merge
                                         (set/from-list (map/keys types))
                                             (set/merge (set/from-list names) (set/from-list (map/keys aliases)))))
        mutual-rec               (<-
                                     (map/from-list (map stypes (fn [(sdeftype name l _ _ _)] (, name l)))))
        tenv                     (foldl->
                                     tenv/nil
                                         salias
                                         (fn [tenv (,,, name args body nl)]
                                         (match (bag/to-list
                                             (externals-type
                                                 (set/merge bound (set/from-list (map args fst)))
                                                     body))
                                             []      (let-> [
                                                         () (record-def-> nl)
                                                         () (record-type-usages (map/from-list args) tenv body)
                                                         () (record-usages-in-type
                                                                tenv'
                                                                    (map/merge (map/from-list args) mutual-rec)
                                                                    body)]
                                                         (<- (tenv/add-alias tenv name (,, (map args fst) body nl))))
                                             unbound (<-err
                                                         (type-error
                                                             "Unbound types"
                                                                 (map unbound (fn [(,, name _ l)] (, name l))))))))
        merged                   (<- (tenv/merge tenv tenv'))
        tenv                     (foldl->
                                     tenv
                                         stypes
                                         (fn [tenv (sdeftype name tnl args constructors l)]
                                         (let-> [
                                             tenv' (infer-deftype merged mutual-rec name tnl args constructors l)]
                                             (<- (tenv/merge tenv' tenv)))))
        tenv'                    (<- (tenv/merge tenv tenv'))]
        (<- tenv)))

(** ## Statements (w/ circular dependencies) **)

(infer-show basic (@ (fn [a b c] (+ (a b) (a c)))))

(@! (deftype (a b) (c b)))

(defn split-stmts [stmts sdefs stypes salias sexps]
    (match stmts
        []           (,,, sdefs stypes salias sexps)
        [one ..rest] (match one
                         (sdef _ _ _ _)                   (split-stmts rest [one ..sdefs] stypes salias sexps)
                         (sdeftype _ _ _ _ _)             (split-stmts rest sdefs [one ..stypes] salias sexps)
                         (stypealias name nl args body _) (split-stmts
                                                              rest
                                                                  sdefs
                                                                  stypes
                                                                  [(,,, name args body nl) ..salias]
                                                                  sexps)
                         (sexpr expr _)                   (split-stmts rest sdefs stypes salias [expr ..sexps]))))

(defn infer-defns [tenv stmts]
    (match stmts
        [one] (infer-stmt tenv one)
        _     (let-> [
                  zipped (infer-several tenv stmts)
                  _      (map-> (fn [(, (, name nl) type)] (record-> nl type false)) zipped)]
                  (<-
                      (foldl
                          tenv/nil
                              zipped
                              (fn [tenv (, (, name nl) type)]
                              (tenv/set-type tenv name (, (generalize tenv type) nl))))))))

map->

(defn infer-stmtss [tenv' stmts]
    (let-> [
        (,,, sdefs stypes salias sexps) (<- (split-stmts stmts [] [] [] []))
        type-tenv                       (infer-stypes tenv' stypes salias)
        tenv'                           (<- (tenv/merge type-tenv tenv'))
        val-tenv                        (infer-defns tenv' sdefs)
        expr-types                      (map-> (infer (tenv/merge val-tenv tenv')) sexps)]
        (<- (, (tenv/merge type-tenv val-tenv) expr-types))))

(force
    type-error->s
        (run/nil->
        (infer-stmtss
            (foldl tenv/nil [(, "int" 0) (, "string" 0)] tenv/add-builtin-type)
                [(@! (typealias one (, int string)))
                (@! (deftype (, a b) (, a b)))
                (@! (deftype one (two int)))
                (@! (deftype kind (star) (kfun kind kind)))
                (@! (let [(kfun m n) (star)] 1))])))

(force
    type-error->s
        (run/nil->
        (infer-stmtss
            builtin-env
                [(@! (deftype (array a) (cons a (array a)) (nil)))
                (@!
                (defn mapi [i values f]
                    (match values
                        []           []
                        [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)])))])))

(** ## Recording Usages **)

(defn record-usages-in-type [tenv rec type]
    (let [(tenv types _ tdefs alias) tenv]
        (match type
            (tcon name l)    (match (map/get alias name)
                                 (some (,, _ _ al)) (record-usage-> l al)
                                 _                  (match (map/get tdefs name)
                                                        (some (,, _ _ loc)) (record-usage-> l loc)
                                                        _                   (match (map/get rec name)
                                                                                (some loc) (record-usage-> l loc)
                                                                                _          (<-err (type-error "Udnbound type" [(, name l)])))
                                                        _                   (let [nope name] (<- ()))))
            (tapp one two l) (let-> [
                                 () (record-usages-in-type tenv rec one)
                                 () (record-usages-in-type tenv rec two)]
                                 (<- ()))
            _                (<- ()))))

(defn rev-pair [(, a b)] (, b a))

(defn with-name [map id]
    (match (map/get map id)
        (some v) "${v}:${(its id)}"
        _        "?:${(its id)}"))

(defn run/usages [tenv stmts]
    (let [
        (, (,, _ (, _ (, defns uses)) _) _) ((state-f
                                                (foldl->
                                                    tenv
                                                        stmts
                                                        (fn [tenv stmt]
                                                        (let-> [(, nenv _) (infer-stmtss tenv [stmt])]
                                                            (<- (tenv/merge tenv nenv))))))
                                                state/nil)
        idents                              (map/from-list
                                                (map (bag/to-list (many (map stmts stmt/idents))) rev-pair))]
        (,
            (map defns (with-name idents))
                (map uses (fn [(, user prov)] (, (with-name idents user) prov))))))

(let [
    st (@!
           (match 1
               (c _) 1))]
    (, (stmt/idents st) st))

(,
    (run/usages builtin-env)
        [(, [(@! (let [x 1 y 2] x))] (, ["y:22225" "x:22222"] [(, "x:22224" 22222)]))
        (,
        [(@! (deftype a (b))) (@! (deftype c (d a)))]
            (, ["d:22267" "c:22264" "b:22258" "a:22256"] [(, "a:22268" 22256)]))
        (,
        [(@! (deftype a (b))) (@! (let [(b) (b)] 1))]
            (, ["b:22371" "a:22369"] [(, "b:22378" 22371) (, "b:22380" 22371)]))
        (,
        [(@! (typealias a int)) (@! (typealias b a))]
            (, ["b:22289" "a:22279"] [(, "a:22290" 22279) (, "int:22280" -1)]))
        (,
        [(@! (typealias a int)) (@! (deftype c (b a)))]
            (,
            ["b:22307" "c:22305" "a:22299"]
                [(, "a:22308" 22299) (, "int:22300" -1)]))
        (,
        [(@! (deftype a (b))) (@! (typealias c a))]
            (, ["c:23288" "b:23283" "a:23281"] [(, "a:23289" 23281)]))
        (,
        [(@! (deftype (array a) (cons a (array a)) (nil)))]
            (,
            ["nil:23447" "cons:23441" "a:23438" "array:23437"]
                [(, "array:23444" 23437) (, "a:23445" 23438) (, "a:23442" 23438)]))
        (,
        [(@! (deftype t (c int)))
            (@!
            (match 1
                (c _) 1))]
            (, ["c:23673" "t:23670"] [(, "c:23681" 23673) (, "int:23674" -1)]))])

(** todo write some tests for this, and then get
    - type alises referencing each other
    - type names getting referenced
    - constructors getting referenced (as values, and as patterns) **)

(** ## Collecting types of everything
    useful for debugging our "hover for type" infrastructure. **)

(defn expr->s [expr]
    (match expr
        (eprim prim int)            (prim->s prim)
        (estr string templates int) "\"${string}${(join
                                        ""
                                            (map templates (fn [(,, expr suffix _)] "${(expr->s expr)}${suffix}")))}\""
        (evar string int)           string
        (elambda pats expr int)     "(fn [${(join " " (map pats pat->s))}] ${(expr->s expr)})"
        (eapp target args int)      "(${(expr->s target)} ${(join " " (map args expr->s))})"
        (elet bindings body int)    "(let [${(join
                                        " "
                                            (map bindings (fn [(, pat init)] "${(pat->s pat)} ${(expr->s init)}")))}]\n  ${(expr->s body)})"
        (ematch expr cases int)     "(match ${(expr->s expr)}\n  ${(join
                                        "\n  "
                                            (map cases (fn [(, pat body)] "${(pat->s pat)}t${(expr->s body)}")))}"))

(defn prim->s [prim]
    (match prim
        (pint num _)     (its num)
        (pbool bool int) (if bool
                             "true"
                                 "false")))

(defn pat->s [pat]
    (match pat
        (pany int)               "_"
        (pvar string int)        string
        (pcon string _ args int) "(${string}${(join "" (map args (fn [pat] " ${(pat->s pat)}")))})"
        (pstr string int)        string
        (pprim prim int)         (prim->s prim)))

(defn pats-by-loc [pat]
    (match pat
        (pany int)               empty
        (pvar string int)        (one (, int (evar string int)))
        (pcon string _ pats int) (foldl empty (map pats pats-by-loc) bag/and)
        (pstr string int)        empty
        (pprim prim int)         empty))

(defn things-by-loc [expr]
    (bag/and
        (one (, (expr-loc expr) expr))
            (match expr
            (estr string templates int) (foldl
                                            empty
                                                (map templates (fn [(,, expr _ _)] (things-by-loc expr)))
                                                bag/and)
            (elambda pats expr int)     (bag/and
                                            (foldl empty (map pats pats-by-loc) bag/and)
                                                (things-by-loc expr))
            (eapp target args int)      (bag/and
                                            (things-by-loc target)
                                                (foldl empty (map args things-by-loc) bag/and))
            (elet bindings body int)    (bag/and
                                            (foldl
                                                empty
                                                    (map
                                                    bindings
                                                        (fn [(, pat init)] (bag/and (pats-by-loc pat) (things-by-loc init))))
                                                    bag/and)
                                                (things-by-loc body))
            (ematch expr cases int)     (bag/and
                                            (things-by-loc expr)
                                                (foldl
                                                empty
                                                    (map cases (fn [(, pat expr)] (things-by-loc expr)))
                                                    bag/and))
            _                           empty)))

(defn map/add [map arg value]
    (map/set
        map
            arg
            (match (map/get map arg)
            (none)        [value]
            (some values) [value ..values])))

(defn show-all-types [tenv expr]
    (let [
        (, (,, _ (, types usages) subst) result) ((state-f (infer tenv expr)) state/nil)
        type-map                                 (foldr
                                                     map/nil
                                                         types
                                                         (fn [map (,, loc type keep)]
                                                         (map/add
                                                             map
                                                                 loc
                                                                 (if keep
                                                                 type
                                                                     (type-apply subst type)))))
        final                                    (match result
                                                     (ok v)  (type-to-string v)
                                                     (err e) (type-error->s e))
        exprs                                    (foldr
                                                     map/nil
                                                         (bag/to-list (things-by-loc expr))
                                                         (fn [map (, loc expr)] (map/add map loc expr)))]
        "Result: ${final}\nExprs:\n${(join
            "\n\n"
                (map
                (map/to-list exprs)
                    (fn [(, loc exprs)]
                    "${(join ";t" (map exprs expr->s))}\n -> ${(match (map/get type-map loc)
                        (none)   "No type at ${(its loc)}"
                        (some t) "${(join ";t" (map t type-to-string))}")}")))}"))

(show-all-types builtin-env (@ ((fn [x b] (+ x 1)) 12 "hi")))

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
        (pany _)              set/nil
        (pvar name l)         (set/add set/nil name)
        (pcon name il args l) (foldl
                                  set/nil
                                      args
                                      (fn [bound arg] (set/merge bound (pat-names arg))))
        (pstr string int)     set/nil
        (pprim prim int)      set/nil))

(defn pat-externals [pat]
    (match pat
        (** Soo this should be probably a (type)? **)
        (pcon name il args l) (bag/and (one (,, name (value) il)) (many (map args pat-externals)))
        _                     empty))

(defn externals 
    [bound expr]
        (match expr
        (evar name l)              (match (set/has bound name)
                                       true empty
                                       _    (one (,, name (value) l)))
        (eprim prim l)             empty
        (estr first templates int) (many
                                       (map
                                           templates
                                               (fn [arg]
                                               (match arg
                                                   (,, expr _ _) (externals bound expr)))))
        (equot expr int)           empty
        (elambda pats body int)    (bag/and
                                       (foldl empty (map pats pat-externals) bag/and)
                                           (externals (foldl bound (map pats pat-names) set/merge) body))
        (elet bindings body l)     (let [
                                       (, bag bound) (foldl
                                                         (, empty bound)
                                                             bindings
                                                             (fn [(, bag bound) (, pat init)]
                                                             (,
                                                                 (bag/and bag (bag/and (pat-externals pat) (externals bound init)))
                                                                     (set/merge bound (pat-names pat)))))]
                                       (bag/and bag (externals bound body)))
        (eapp target args int)     (bag/and
                                       (externals bound target)
                                           (foldl empty (map args (externals bound)) bag/and))
        (ematch expr cases int)    (bag/and
                                       (externals bound expr)
                                           (foldl
                                           empty
                                               cases
                                               (fn [bag arg]
                                               (match arg
                                                   (, pat body) (bag/and
                                                                    (bag/and bag (pat-externals pat))
                                                                        (externals (set/merge bound (pat-names pat)) body))))))))

(,
    (dot bag/to-list (externals (set/from-list ["+" "-" "cons" "nil" "()"])))
        [(, (@ hi) [(,, "hi" (value) 16110)])
        (, (@ [1 2 c]) [(,, "c" (value) 16144)])
        (,
        (@ (one two three))
            [(,, "one" (value) 16158)
            (,, "two" (value) 16159)
            (,, "three" (value) 16160)])
        (, (@ ()) [])])

(defn dot [a b c] (a (b c)))



(defn externals-type-record [bound t]
    (match t
        (tvar _ _)       (<- empty)
        (tcon name l)    (match (map/get bound name)
                             (some pl) (let-> [() (record-usage-> l pl)] (<- empty))
                             _         (<- (one (,, name (type) l))))
        (tapp one two _) (let-> [
                             one (externals-type-record bound one)
                             two (externals-type-record bound two)]
                             (<- (bag/and one two)))))

(defn record-type-usages [locals tenv t]
    (match t
        (tvar _ _)       (<- ())
        (tcon name l)    (match (map/get locals name)
                             (some pl) (record-usage-> l pl)
                             _         (<- ()))
        (tapp one two _) (let-> [
                             () (record-type-usages locals tenv one)
                             () (record-type-usages locals tenv two)]
                             (<- ()))))

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
            (sdeftype string _ free constructors _) (let [frees (set/from-list (map free fst))]
                                                        (many
                                                            (map
                                                                constructors
                                                                    (fn [(,,, name l args _)]
                                                                    (match args
                                                                        [] empty
                                                                        _  (many (map args (externals-type frees))))))))
            (stypealias name _ args body _)         (let [frees (set/from-list (map args fst))]
                                                        (externals-type frees body))
            (sdef name _ body _)                    (externals (set/add set/nil name) body)
            (sexpr expr _)                          (externals set/nil expr))))

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
                (map/map
                    (fn [b] (, b -1))
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
                            (, "set/overlap" (kk (tfns [(tset k) (tset k)] (tset k))))
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
                            (, "fatal" (generic ["v"] (tfns [tstring] (vbl "v"))))]))
                    (map/from-list [(, "()" (tconstructor set/nil [] (tcon "()" -1) -1))])
                    (map/from-list
                    [(, "int" (,, 0 set/nil -1))
                        (, "float" (,, 0 set/nil -1))
                        (, "string" (,, 0 set/nil -1))
                        (, "bool" (,, 0 set/nil -1))
                        (, "map" (,, 2 set/nil -1))
                        (, "set" (,, 1 set/nil -1))
                        (, "->" (,, 2 set/nil -1))])
                    map/nil)
                [(@! (deftype (, a b) (, a b)))
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
                (fn [tenv stmt]
                (tenv/merge
                    tenv
                        (fst (force type-error->s (run/nil-> (infer-stmtss tenv [stmt])))))))))

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
            (fn [tenv (array stmt)]
            (,,
                (result (, tenv (array type)) type-error-t)
                    (array (, int type))
                    usage-record))
            (fn [tenv tenv] tenv)
            (fn [tenv expr] type)
            (fn [tenv expr]
            (,, (result type type-error-t) (array (, int type)) usage-record))))

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
            (fn [tenv string] (option type))
            (fn [type] cst)))

(def externals-list (fn [x] (bag/to-list (externals set/nil x))))

(defn infer-stmts2 [tenv stmts]
    (let [
        (, (,, _ (, types usage-record) subst) result) ((state-f (infer-stmtss tenv stmts)) state/nil)]
        (,, result (applied-types types subst) usage-record)))

(infer-stmts2 builtin-env [(@! (def x 10)) (@! x) (@! (let [m 2] (+ m m)))])

(defn applied-types [types subst]
    (map
        types
            (fn [(,, loc type keep)]
            (if keep
                (, loc type)
                    (, loc (type-apply subst type))))))

foldl

((eval
    "({0: {0:  env_nil, 1: infer_stmts, 2: infer_stmts2,  3: add_stmt,  4: infer, 5: infer2},\n  1: {0: externals_stmt, 1: externals_expr, 2: names},\n  2: type_to_string, 3: get_type, 4: type_to_cst\n }) => ({type: 'fns',\n   env_nil, infer_stmts, infer_stmts2, add_stmt, infer, infer2, externals_stmt, externals_expr, names, type_to_string, get_type, type_to_cst \n }) ")
    (typecheck
        (inference
            builtin-env
                (fn [tenv stmts]
                (fst (force type-error->s (run/nil-> (infer-stmtss tenv stmts)))))
                infer-stmts2
                tenv/merge
                (fn [tenv expr] (force type-error->s (run/nil-> (infer tenv expr))))
                (fn [tenv expr]
                (let [
                    (, (,, _ (, types usage-record) subst) result) ((state-f (infer tenv expr)) state/nil)]
                    (,, result (applied-types types subst) usage-record))))
            (analysis externals-stmt externals-list names)
            type-to-string
            (fn [tenv name]
            (match (tenv/type tenv name)
                (some (, v _)) (some (scheme/type v))
                _              (none)))
            type-to-cst))