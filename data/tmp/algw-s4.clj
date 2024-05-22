(** ## Type Inference with Type Classes
    Under construction
    Here we'll be expanding our algorithm with predicates, based on the fantastic paper [Typing Haskell in Haskell](https://web.cecs.pdx.edu/~mpj/thih/thih.pdf). We'll break this up into a couple of steps:
    - add the concept of predicates to the algorithm, with the IsIn predicate for indicating that a type "is in" a class. The scheme type which previously held "a set of free variables" and "a type" will be changed to contain a qualified type, that is a type with an associated list of predicates. When instantiating a value with a polymorphic type (when a variable reference is encountered), we will add any predicates we find to the State monad, and at the end of inferring a toplevel definition (tdef) we will collect any predicates that relate to free variables and include them in the inferred type of the definition. The top-level inference algorithm will also hand over all predicates (including those that don't relate to free variables, such as (isin (tcon "int") "number")) up to the structured editor, for use in the code generation step.
    - modify our code generation with knowledge about the concrete types at function definitions and call-sites, so we know what "instance maps" to pass around. If we add a little bit of location information to our predicate type, we'll be able to use the "list of predicates encountered while inferring a definition" as sufficient information to do our compilation.
    - add defclass and definstance to our AST, parser, code generator, and type checker, allowing for user-defined classes and instances.
    - add kinds to type variables and type constructors, which will enable us to define type classes on "Higher Kinded Types", unlocking the proper definition of Monad, and letting us use our "do notation" (let->) in a more general way (not locked into a single definition of >>= and <-).
    Changes from the previous version highlighted in green. **)

(** ## Prelude **)

(deftype (option a)
    (some a)
        (none))

(deftype (, a b)
    (, a b))

(deftype (list a)
    (cons a (list a))
        (nil))

(deftype (result good bad)
    (ok good)
        (err bad))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(defn zip [one two]
    (match (, one two)
        (, [] [])                      []
        (, [one ..rest] [two ..trest]) [(, one two) ..(zip rest trest)]
        _                              (fatal "Cant zip lists of unequal length")))

(defn unzip [zipped]
    (match zipped
        []               (, [] [])
        [(, a b) ..rest] (let [(, one two) (unzip rest)] (, [a ..one] [b ..two]))))

(defn concat [lists]
    (match lists
        []                     []
        [[] ..rest]            (concat rest)
        [[one ..rest] ..lists] [one ..(concat [rest ..lists])]))

(defn map [f values]
    (match values
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(defn mapi [f values] (mapi-inner 0 f values))

(defn mapi-inner [i f values]
    (match values
        []           []
        [one ..rest] [(f i one) ..(mapi-inner (+ i 1) f rest)]))

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

(defn fst [(, a _)] a)

(defn length [v]
    (match v
        []         0
        [_ ..rest] (+ 1 (length rest))))

(defn loop [v f] (f v (fn [nv] (loop nv f))))

(defn reverse [lst]
    (loop
        (, lst [])
            (fn [(, lst coll) recur]
            (match lst
                []           coll
                [one ..rest] (recur (, rest [one ..coll]))))))

(reverse [1 2 3 4 5 6])

(defn join [sep lst]
    (match lst
        []           ""
        [one]        one
        [one ..rest] "${one}${sep}${(join sep rest)}"))

(defn force [x]
    (match x
        (some x) x
        _        (fatal "Option is None")))

(defn list= [a' b' eq]
    (match (, a' b')
        (, [one ..rest] [two ..rest']) (if (eq one two)
                                           (list= rest rest' eq)
                                               false)
        _                              false))

(defn find-some [f arr]
    (match arr
        []           (none)
        [one ..rest] (match (f one)
                         (some v) (some v)
                         _        (find-some f rest))))

(defn all [f items]
    (match items
        []           true
        [one ..rest] (if (f one)
                         (all f rest)
                             false)))

(** bag, a collection type with O(1) concatenation **)

(deftype (bag a)
    (one a)
        (many (list (bag a))))

(def empty (many []))

(defn bag/and [first second]
    (match (, first second)
        (, (many []) a)         a
        (, a (many []))         a
        (, (many [a]) (many b)) (many [a ..b])
        (, a (many b))          (many [a ..b])
        _                       (many [first second])))

(defn bag/fold [f init bag]
    (match bag
        (many [])    init
        (one v)      (f init v)
        (many items) (foldr init items (bag/fold f))))

(defn bag/to-list [bag] (bag/fold (fn [list one] [one ..list]) [] bag))

(** ## AST
    again, this is the same as in the previous articles, so feel free to skip. **)

(deftype prim
    (pint int int)
        (pfloat float int)
        (pbool bool int))

(deftype top
    (tdef string int expr int)
        (texpr expr int)
        (tdeftype
        string
            int
            (list (, string int))
            (list (, string int (list type) int))
            int)
        (ttypealias string int (list (, string int)) type int))

(deftype cst
    (cst/list (list cst) int)
        (cst/array (list cst) int)
        (cst/spread cst int)
        (cst/id string int)
        (cst/string string (list (, cst string int)) int))

(deftype quot
    (quot/expr expr)
        (quot/top top)
        (quot/type type)
        (quot/pat pat)
        (quot/quot cst))

(deftype expr
    (eprim prim int)
        (evar string int)
        (estr string (list (, expr string int)) int)
        (equot quot int)
        (elambda (list pat) expr int)
        (eapp expr (list expr) int)
        (elet (list (, pat expr)) expr int)
        (ematch expr (list (, pat expr)) int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string int (list pat) int)
        (pstr string int)
        (pprim prim int))

(deftype type
    (tvar string int)
        (tapp type type int)
        (tcon string int))

(defn type= [one two]
    (match (, one two)
        (, (tvar id _) (tvar id' _))                  (= id id')
        (, (tapp target arg _) (tapp target' arg' _)) (if (type= target target')
                                                          (type= arg arg')
                                                              false)
        (, (tcon name _) (tcon name' _))              (= name name')
        _                                             false))

(defn tfn [arg body l] (tapp (tapp (tcon "->" l) arg l) body l))

(defn tfns [args body l]
    (foldr body args (fn [body arg] (tfn arg body l))))

(def tint (tcon "int" -1))

(defn pred->s [(isin type cls locs)]
    "(isin ${(type->s type)} \"${cls}\" ${(join
        " "
            (map (fn [(oloc l i)] "${(int-to-string l)}@${(int-to-string i)}") locs))}) ")

(defn scheme->s [(forall vbls (=> preds type))]
    "${(match (set/to-list vbls)
        []   ""
        vbls "forall ${(join " " vbls)} : ")}${(join "" (map pred->s preds))}${(type->s type)}")

(defn type->s [type]
    (match type
        (tvar name _)                           name
        (tapp (tapp (tcon "->" _) arg _) res _) "(fn [${(type->s arg)}] ${(type->s res)})"
        (tapp target arg _)                     "(${(type->s target)} ${(type->s arg)})"
        (tcon name _)                           name))

(defn scheme->cst [(forall _ (=> preds type))]
    (let [t (type->cst type)]
        (match preds
            [] t
            _  (cst/list [(cst/id "=>" -1) (cst/array (map pred->cst preds) -1) t] -1))))

(defn pred->cst [(isin t name _)]
    (cst/list [(cst/id "isin" -1) (type->cst t) (cst/string "name" [] -1)] -1))

(defn target-and-args [type coll]
    (match type
        (tapp target arg _) (target-and-args target [arg ..coll])
        _                   (, type coll)))

(defn fn-args-and-body [type]
    (match type
        (tapp (tapp (tcon "->" _) arg _) res _) (let [(, args res) (fn-args-and-body res)] (, [arg ..args] res))
        _                                       (, [] type)))

(defn type->cst [type]
    (match type
        (tvar name l)                       (cst/id name l)
        (tcon name l)                       (cst/id name l)
        (tapp (tapp (tcon "->" _) _ _) _ l) (let [(, args res) (fn-args-and-body type)]
                                                (cst/list
                                                    [(cst/id "fn" l) (cst/array (map type->cst args) l) (type->cst res)]
                                                        l))
        (tapp _ _ l)                        (let [(, name args) (target-and-args type [])]
                                                (cst/list [(type->cst name) ..(map type->cst args)] l))))

(** ## "Type Predicates" **)

(** A "predicate" is another term for a constraint, at least in this context. The first predicate we'll define is a "type is in class" predicate. This means that the type variables can only be instantiated with types that result in there being a matching instance defined for that class.
    Later on, we'll also probably be leaning on predicates for implementing polymorphic record types (row polymorphism). **)

((** This represents a loc that has an index associated with it. We will use it to determine what order to pass "instance maps" to a function that has type class arguments, in the case that we need to pass in multiple. **)
    deftype ordered-location
    (oloc int int))

(deftype predicate
    (** type is "in" the class identified by the given name. e.g. (isin (tvar a) "number") . The final int is used by the code generator to associate the type class constraint with the variable reference that produced it. **)
        (isin type string (list ordered-location)))

(defn predicate= [(isin t1 s1 _) (isin t2 s2 _)]
    (if (= s1 s2)
        (type= t1 t2)
            false))

(defn predicate/combine [preds]
    (loop
        (, [] preds)
            (fn [(, left right) recur]
            (match right
                []           left
                [one ..rest] (recur
                                 (,
                                     (loop
                                         left
                                             (fn [left recur]
                                             (match left
                                                 []            [one]
                                                 [lone ..rest] (match (predicate/merge one lone)
                                                                   (some merged) [merged ..rest]
                                                                   (none)        [lone ..(recur rest)]))))
                                         rest))))))

(defn predicate/merge [(isin t1 s1 l1) (isin t2 s2 l2)]
    (if (= s1 s2)
        (if (type= t1 t2)
            (some (isin t1 s2 (set/to-list (set/from-list (concat [l1 l2])))))
                (none))
            none))

((** Overwrite the loc attribute of a predicate. Used when instantiating the scheme of a referenced variable. The i represents the index in the list of predicates from the scheme where it originated. **)
    defn predicate/reloc [l i (isin type cls _)]
    (isin type cls [(oloc l i)]))

(** The qualified type is used to associate a list of predicates with whatever is inside. In practice, the "thing inside" will either be:
    cannot convert {"id":"91fc8a1b-1479-4d77-822c-70f027d3c02a","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"a ","styles":{}},{"type":"text","text":"type","styles":{"code":true}},{"type":"text","text":", as in ","styles":{}},{"type":"text","text":"(=> [(isin (tvar a) \"number\")] (fn [(tvar a)] string))","styles":{"code":true}},{"type":"text","text":", which describes the function type from a generic variable ","styles":{}},{"type":"text","text":"a","styles":{"code":true}},{"type":"text","text":" to ","styles":{}},{"type":"text","text":"string","styles":{"code":true}},{"type":"text","text":", where ","styles":{}},{"type":"text","text":"a","styles":{"code":true}},{"type":"text","text":" must be a member of the type class ","styles":{}},{"type":"text","text":"number","styles":{"code":true}},{"type":"text","text":".","styles":{}}],"children":[]}
    cannot convert {"id":"d5752e34-e259-4b82-ac40-d338f8c0850f","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"a ","styles":{}},{"type":"text","text":"predicate","styles":{"code":true}},{"type":"text","text":", describing type class instances that are conditional. e.g. ","styles":{}},{"type":"text","text":"(=> [(isin (tvar a) \"show\")] (isin (list (tvar a)) \"show\"))","styles":{"code":true}},{"type":"text","text":" indicates that if a given type is in the ","styles":{}},{"type":"text","text":"show","styles":{"code":true}},{"type":"text","text":" class, then a ","styles":{}},{"type":"text","text":"list","styles":{"code":true}},{"type":"text","text":" of that type is also in ","styles":{}},{"type":"text","text":"show","styles":{"code":true}},{"type":"text","text":".","styles":{}}],"children":[]} **)

(deftype (qualified t)
    (=> (list predicate) t))

(defn qual= [(=> preds t) (=> preds' t') t=]
    (if (list= preds preds' pred=)
        (t= t t')
            false))

(defn pred= [(isin type id _) (isin type' id' _)]
    (if (= id id')
        (type= type type')
            false))

(** ## The Type Environment
    The "type environment" gets passed around to most of the infer/ functions, and includes global definitions as well as the types of locally-bound variables. **)

(** A scheme is the way that we represent generic types (sometimes called "polytypes"). The first argument is a set of the tvar ids that are generic in the contained type. **)

(deftype scheme
    (forall (set string) (qualified type)))

(deftype tenv
    (tenv
        (** Types of values currently in scope **)
            (map string scheme)
            (** Data type constructors; (free variables) (arguments) (resulting type) **)
            (map string (, (list string) (list type) type))
            (** Data types (# free variables, constructor names) **)
            (map string (, int (set string)))
            (** Type aliases **)
            (map string (, (list string) type))
            (** Type Classes! (, (list of super classes) (instances) (class methods)) **)
            (map
            string
                (, (list string) (list (qualified predicate)) (list (, string scheme))))))

(defn tenv/merge [(tenv v1 c1 t1 a1 tc1) (tenv v2 c2 t2 a2 tc2)]
    (tenv
        (map/merge v1 v2)
            (map/merge c1 c2)
            (map/merge t1 t2)
            (map/merge a1 a2)
            (foldl
            tc1
                (map/to-list tc2)
                (fn [tc (, name (, supers insts fns))]
                (match (map/get tc name)
                    (none)                (map/set tc name (, supers insts fns))
                    (some (, _ insts' _)) (map/set tc name (, supers (concat [insts insts']) fns)))))))

(def tenv/nil (tenv map/nil map/nil map/nil map/nil map/nil))

(defn tenv/with-type [(tenv values tcons types aliases typeclasses) name scheme]
    (tenv
        (map/set values name scheme)
            tcons
            types
            aliases
            typeclasses))

(defn tenv/with-scope [(tenv values tcons types aliases typeclasses) scope]
    (tenv (map/merge scope values) tcons types aliases typeclasses))

(defn tenv/resolve [(tenv values _ _ _ _) name]
    (map/get values name))

(** ## Finding "free" type variables
    The */free functions are about finding unbound type variables (that aren't bound by a containing forall).
    - type/free: types cannot contain a forall, so every tvar is "free"
    - scheme/free: finds all tvars in the contained type that aren't present in the "free set". This produces all type variables that are defined outside of the current declaration.
    - tenv/free: runs scheme/free on all variables in scope. **)

(defn type/free [type]
    (match type
        (tvar id _)  (set/add set/nil id)
        (tcon _ _)   set/nil
        (tapp a b _) (set/merge (type/free a) (type/free b))))

(defn type/matches-free [free type]
    (match type
        (tvar id _)  (set/has free id)
        (tcon _ _)   false
        (tapp a b _) (if (type/matches-free free b)
                         true
                             (type/matches-free free a))))

(defn qual/free [(=> predicates contents) contents/free]
    (foldl
        (contents/free contents)
            (map predicate/free predicates)
            set/merge))

(defn predicate/free [(isin type _ _)] (type/free type))

(defn scheme/free [(forall vbls type)]
    (set/diff (qual/free type type/free) vbls))

(defn tenv/free [(tenv values _ _ _ _)]
    (foldr set/nil (map scheme/free (map/values values)) set/merge))

(,
    (fn [a] (set/to-list (scheme/free a)))
        [(, (forall (set/from-list ["a"]) (=> [] (tvar "a" -1))) [])
        (, (forall (set/from-list []) (=> [] (tvar "a" -1))) ["a"])])

(** ## Applying type substitutions
    A core notion of Hindley-Milner's "Algorithm W" is the "substitution map". It contains a mapping from a type variable to a "replacement type". Applying the substitution map to a type consists of finding all tvars in a type that have a replacement defined in the map, and making that substitution. **)

(defn type/apply [subst type]
    (match type
        (tvar id _)           (match (map/get subst id)
                                  (none)   type
                                  (some t) t)
        (tapp target arg loc) (tapp (type/apply subst target) (type/apply subst arg) loc)
        _                     type))

(,
    (type/apply (map/from-list [(, "a" (tcon "int" -1))]))
        [(, (tvar "a" -1) (tcon "int" -1))
        (, (tvar "b" -1) (tvar "b" -1))
        (,
        (tapp (tcon "list" -1) (tvar "a" -1) -1)
            (tapp (tcon "list" -1) (tcon "int" -1) -1))])

(defn scheme/apply [subst (forall vbls qualified-type)]
    (** When applying a substitution map to a scheme, we ignore all mappings of variables in the free set for that scheme. **)
        (forall
        vbls
            (qual/apply type/apply (map-without subst vbls) qualified-type)))

(defn qual/apply [contents/apply subst (=> predicates contents)]
    (=>
        (map (predicate/apply subst) predicates)
            (contents/apply subst contents)))

(defn predicate/apply [subst (isin type cls l)]
    (isin (type/apply subst type) cls l))

((** As an optimization, we could segregate the type environment into "values with unresolved type variables" and "values without", or even set up a lookup table from "tvar id" to "names of values that contain that tvar". For now though, we'll do the simple thing of just always iterating over everything in scope.
    A simpler (and very reasonable) optimization would be to split the tenv into "global terms" and "local terms", because global terms are not allowed to have unresolved type variables, and local terms tend to be relatively small in number.
    These optimizations would also speed up tenv/free considerably. **)
    defn tenv/apply [subst (tenv values tcons types aliases typeclasses)]
    (tenv
        (scope/apply subst values)
            tcons
            types
            aliases
            typeclasses))

(defn scope/apply [subst scope]
    (map/map (scheme/apply subst) scope))

(** ## Composing substitution maps
    One very nice property of Algorithm W is that the constraints are resolved unidirectionally. In a generic "constraint solving" algorithm, the constraints must be applied repeatedly until some "fixed point" is reached, because applying one constraint might result in other constraints newly becoming applicable.
    In Algorithm W, you only ever apply substitutions in a single direction: new substitutions get applied to the old substitution map, and never the other way around.
    🚨 This is a critical invariant. If you compose substitutions in the wrong order (as actually occurs in the "Algorithm W Step-By-Step" paper in one place 🫢) it will break the type system, resulting in incorrect inferences. One way to verify that you're doing it right is to check if new-subst has any types with tvars that have defined mappings in old-subst. If so, you're either applying them in the wrong order, or you forgot to apply the current substitution map at some step along the way.
    In our implementation, we will maintain this invariant as a consequence of system design; the composition map will live in our state monad, and so whenever we add a new map, we know which one is "newer" and which is "older". **)

(defn compose-subst [new-subst old-subst]
    (** map/merge overwrites duplicate keys in the first argument with values from the second argument **)
        (map/merge (map/map (type/apply new-subst) old-subst) new-subst))

(** 🚨 STOPSHIP: map/merge actually ignores duplicates from the second arg. Is that broken? Are there ever duplicates in practice? **)

(map/merge (map/from-list [(, 0 1)]) (map/from-list [(, 0 10)]))

(def demo-new-subst
    (map/from-list [(, "a" (tcon "a-mapped" -1)) (, "b" (tvar "c" -1))]))

(,
    (fn [x]
        (map/to-list (compose-subst demo-new-subst (map/from-list x))))
        [(** v5 gets the v0 substitution applied to it **)
        (,
        [(, "x" (tvar "a" -1))]
            [(, "x" (tcon "a-mapped" -1))
            (, "a" (tcon "a-mapped" -1))
            (, "b" (tvar "c" -1))])
        (** v0 gets the v1 substitution applied to it, and then overrides the v0 from new-subst **)
        (, [(, "a" (tvar "b" -1))] [(, "a" (tvar "c" -1)) (, "b" (tvar "c" -1))])])

(** ## Generalizing
    Once we have inferred the type for a named value (either at the top level, or in a let), we "lock in" the polymorphism with generalize. This consists of finding any type variables that only exist in our current type (not in the broader scope), and setting them as the "free set" of our forall. **)

(defn generalize [tenv qual]
    (forall (set/diff (qual/free qual type/free) (tenv/free tenv)) qual))

(** ## A State monad
    Given that we're going 100% immutable, having a State monad is really handy so you're not having to pipe state values into and out of every function. **)

(deftype (StateT state value error)
    (StateT (fn [state] (, state (result value error)))))

((** This is our bind function. Given a (StateT state value err) and a (fn [value] (StateT state value2 err), it produces a new StateT chaining the two things together, essentially running the second argument on the resolved value of the first argument, if the first on succeeded. **)
    defn >>= [(StateT f) next]
    (StateT
        (fn [state]
            (match (f state)
                (, state (err e)) (, state (err e))
                (, state (ok v))  (let [(StateT fnext) (next v)] (fnext state))))))

(defn map-err-> [(StateT f) next]
    (StateT
        (fn [state]
            (match (f state)
                (, state (err e)) (, state (next e))
                (, state (ok v))  (, state (ok v))))))

((** Here's our return (or pure) function for the StateT monad. It produces a StateT that resolves to the given value, independent of the current state. **)
    defn <- [x]
    (StateT (fn [state] (, state (ok x)))))

((** Given a StateT and an initial state, this will evaluate the contained function and give you the final result. **)
    defn run-> [(StateT f) state]
    (let [(, _ result) (f state)] result))

((** Get the current state **)
    def <-state
    (StateT (fn [state] (, state (ok state)))))

((** Overwrite the state, returning the old state **)
    defn state-> [v]
    (StateT (fn [old] (, v (ok old)))))

(defn state-f [(StateT f)] f)

(** We'll also want some monadified versions of these helper functions: **)

(defn map-> [f arr]
    (match arr
        []           (<- [])
        [one ..rest] (let-> [
                         one  (f one)
                         rest (map-> f rest)]
                         (<- [one ..rest]))))

(defn foldl-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [one (f init one)] (foldl-> one rest f))))

(defn foldr-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [init (foldr-> init rest f)] (f init one))))

((** do-> is just like map-> except for functions that return (), so it doesn't need to collect the values into a list. **)
    defn do-> [f arr]
    (match arr
        []           (<- ())
        [one ..rest] (let-> [
                         () (f one)
                         () (do-> f rest)]
                         (<- ()))))

(** ## Type Inference State
    Here's where we take the StateT monad defined above and make it specific to our use case. Our StateT will contain an integer representing the "next unique ID" used for generating unique tvars, as well as the "current substitution map". **)

(typealias
    (State value)
        (StateT
        (,
            int
                (** Subst **)
                (map string type)
                (** Current predicates **)
                (bag predicate)
                (list
                (** (type) at (location) with a flag to indicate whether it should be presented without applying substitutions **)
                    (, type int bool))
                (** List of locations that are "declarations" (whether local or global) **)
                (list int)
                (** Recording all of the "usages" (, usage-loc declaration-loc) **)
                (list (, int int)))
            string))

(** ## Type Error type **)

(deftype type-error-t
    (terr string (list (, string int)))
        (ttypes scheme scheme)
        (twrap type-error-t type-error-t)
        (tmissing (list (, string int))))

(defn type-error [message loced-items] (terr message loced-items))

(defn <-err* [x] (StateT (fn [state] (, state (err x)))))

(defn <-err [x] (<-err* (terr x [])))

(defn <-missing [name loc] (<-err* (tmissing [(, name loc)])))

(defn <-mismatch [t1 t2]
    (<-err* (ttypes (forall set/nil (=> [] t1)) (forall set/nil (=> [] t2)))))

(defn type-error->s [err]
    (match err
        (twrap _ inner)      (type-error->s inner)
        (tmissing missing)   "Missing values: ${(join
                                 ""
                                     (map
                                     (fn [(, name loc)] "\n - ${name} (${(int-to-string loc)})")
                                         missing))}"
        (ttypes t1 t2)       "Incompatible types: ${(scheme->s t1)} and ${(scheme->s t2)}"
        (terr message names) "${message}${(join
                                 ""
                                     (map (fn [(, name loc)] "\n - ${name} (${(int-to-string loc)})") names))}"))

(defn err-to-fatal [x]
    (match x
        (ok v)  v
        (err e) (fatal "Result is err ${(type-error->s e)}")))

(** ## Recording information for the editor to display **)

((** This gives us "hover for type". We record a type and the associated loc, and store it on the state. After everything is finished, we go through this list of types, applying the final substitution map to each, and then hand them over to the editor. dont-subst is a flag that means don't apply the substitution map; this allows us to present both the generic and type-applied versions of generic functions. **)
    defn record-type-> [type loc dont-subst]
    (let-> [
        (, idx subst preds types) <-state
        _                         (state-> (, idx subst preds [(, type loc dont-subst) ..types]))]
        (<- ())))

(def state/nil (, 0 map/nil empty []))

(defn run/nil-> [st] (run-> st state/nil))

(def <-next-idx
    (let-> [
        (, idx subst preds types) <-state
        _                         (state-> (, (+ idx 1) subst preds types))]
        (<- idx)))

(def <-subst (let-> [(, _ subst _) <-state] (<- subst)))

(defn subst-> [new-subst]
    (let-> [
        (, idx subst preds types) <-state
        _                         (state-> (, idx (compose-subst new-subst subst) preds types))]
        (<- ())))

((** This overwrites the substitution map (without composing), returning the old substitution map. It is used for isolating a section of the algorithm, for performance reasons. **)
    defn subst-reset-> [new-subst]
    (let-> [
        (, idx old-subst types) <-state
        _                       (state-> (, idx new-subst types))]
        (<- old-subst)))

(defn preds-> [preds]
    (let-> [
        (, idx subst current types) <-state
        _                           (state-> (, idx subst (bag/and (many (map one preds)) current) types))]
        (<- ())))

(defn reset-preds-> [preds]
    (let-> [
        (, idx subst _ types) <-state
        _                     (state-> (, idx subst preds types))]
        (<- ())))

(def <-preds (let-> [(, _ _ preds _) <-state] (<- preds)))

(def reset-state->
    (let-> [
        (, _ _ _ types) <-state
        _               (state-> (, 0 map/nil empty types))]
        (<- ())))

(** These are monadified versions of the */apply functions from above; they "apply the current substitution". **)

(defn apply-> [f arg] (let-> [subst <-subst] (<- (f subst arg))))

(def tenv/apply-> (apply-> tenv/apply))

(def type/apply-> (apply-> type/apply))

(def qualt/apply-> (apply-> (qual/apply type/apply)))

(def scope/apply-> (apply-> scope/apply))

(def scheme/apply-> (apply-> scheme/apply))

(** ## Instantiation
    When inferring the type for a variable reference (evar) we need to instantiate the corresponding scheme with all new type variables -- otherwise we wouldn't be able to use a polymorphic (generic) function two times with different types in the same expression. **)

(defn new-type-var [name l]
    (let-> [nidx <-next-idx]
        (<- (tvar "${name}:${(int-to-string nidx)}" l))))

(defn make-subst-for-free [vars l]
    (let-> [
        mapping (map->
                    (fn [id] (let-> [new-var (new-type-var id l)] (<- (, id new-var))))
                        (set/to-list vars))]
        (<- (map/from-list mapping))))

(defn instantiate [(forall vars qual) l]
    (let-> [
        subst        (make-subst-for-free vars l)
        (=> preds t) (<- (qual/apply type/apply subst qual))
        ()           (preds-> (mapi (predicate/reloc l) preds))]
        (<- t)))

(defn dot [f g n] (f (g n)))

(** ## Unification
    Because our type-language is so simple, unification is quite straightforward. If we come across a tvar, we treat whatever's on the other side as its substitution; otherwise we recurse.
    Importantly, unify doesn't produce a "unified type"; instead it produces a substitution which, when applied to both types, will yield the same unified type.
    If two types are irreconcilable, it throws an exception.
    The "cycle check" (also called an "occurs check" in literature) prevents infinite types (like a substitution from a : int -> a). **)

(defn unify [t1 t2 l]
    (map-err->
        (unify-inner t1 t2 l)
            (fn [inner]
            (err
                (twrap
                    (ttypes (forall set/nil (=> [] t1)) (forall set/nil (=> [] t2)))
                        inner)))))

(defn unify-inner [t1 t2 l]
    (match (, t1 t2)
        (, (tvar var l) t)                 (var-bind var t l)
        (, t (tvar var l))                 (var-bind var t l)
        (, (tcon a la) (tcon b lb))        (if (= a b)
                                               (<- ())
                                                   (<-mismatch t1 t2))
        (, (tapp t1 a1 _) (tapp t2 a2 _) ) (let-> [
                                               ()    (unify-inner t1 t2 l)
                                               subst <-subst
                                               ()    (unify-inner (type/apply subst a1) (type/apply subst a2) l)]
                                               (<- ()))
        _                                  (<-mismatch t1 t2)))

(defn one-subst [var type] (map/from-list [(, var type)]))

(defn var-bind [var type l]
    (match type
        (tvar v _) (if (= var v)
                       (<- ())
                           (let-> [_ (subst-> (one-subst var type))] (<- ())))
        _          (if (set/has (type/free type) var)
                       (<-err
                           "Cycle found while unifying type with type variable. ${var}")
                           (let-> [_ (subst-> (one-subst var type))] (<- ())))))

(** ## Inference
    Here are the functions that we'll be using most often when writing the inference code (summarized here as a refresher):
    - infer/expr tenv expr - takes an expression, returns a type
    - unify t1 t2  - compares two types that need to be equivalent, and (a) if they can't be unified, throws an error, or (b) if they can be, adds the resulting substitutions to the current state
    - type/apply-> type - applies the current substitution map (from state) to the given type, which updates type variables with updated resolved types. **)

(** ## Expressions **)

(defn infer/prim [prim]
    (match prim
        (pint _ l)   (let-> [
                         tv (new-type-var "number" l)
                         () (preds-> [(isin tv "number" [(oloc l 0)])])]
                         (<- tv))
        (pfloat _ l) (let-> [
                         tv (new-type-var "floating" l)
                         () (preds-> [(isin tv "floating" [(oloc l 0)])])]
                         (<- tv))
        (pbool _ l)  (<- (tcon "bool" l))))

(defn infer/quot [quot l]
    (match quot
        (quot/expr _) (tcon "expr" l)
        (quot/top _)  (tcon "top" l)
        (quot/type _) (tcon "type" l)
        (quot/pat _)  (tcon "pat" l)
        (quot/quot _) (tcon "cst" l)))

(defn infer/expr [tenv expr]
    (** This is a performance optimization, to isolate the substitution maps to the level of the individual expression.
        The algorithm described in "Algorithm W Step By Step" doesn't put the substitution map on the state monad, instead opting to pass around subst maps, composing them individually. This results in a lot of bookkeeping, and in one case there's actually a bug when two substitution maps are composed in the wrong order (the inference for EApp has s3 <> s2 <> s1, when it should be s1 <> s2 <> s3).
        The downside to our approach is we end up doing a lot of unrelated compositions, because everything gets dumped into one big map. This has exponential time complexity, slowing things way down. Fortunately, this little trick here mitigates all of the performance hit that I saw in practice (it achieves the same performance as passing around substitution maps manually).
        As with the tenv, we could come up with a data structure with even better performance characteristics for composing substitution maps, if it ended up being an issue. **)
        (let-> [
        old  (subst-reset-> map/nil)
        type (infer/expr-inner tenv expr)
        new  (subst-reset-> old)
        ()   (subst-> new)
        ()   (record-type-> type (expr-loc expr) false)]
        (<- type)))

(defn expr-loc [expr]
    (match expr
        (evar _ l)      l
        (eprim _ l)     l
        (equot _ l)     l
        (estr _ _ l)    l
        (elambda _ _ l) l
        (eapp _ _ l)    l
        (ematch _ _ l)  l
        (elet _ _ l)    l))

(defn record-if-generic [(forall free (=> _ t)) l]
    (match (set/to-list free)
        [] (<- ())
        (** If the variable we've found is generic, we want to record the type "pre-specialization" so we can show that on hover as well. **)
        _  (record-type-> t l true)))

(defn infer/expr-inner [tenv expr]
    (match expr
        (evar name l)                            (match (tenv/resolve tenv name)
                                                     (none)        (<-missing name l)
                                                     (some scheme) (let-> [() (record-if-generic scheme l)] (instantiate scheme l)))
        (eprim prim _)                           (infer/prim prim)
        (equot quot l)                           (<- (infer/quot quot l))
        (estr _ templates l)                     (let-> [
                                                     () (do->
                                                            (** For the "templates" of a template string, the expressions need to have type "string". **)
                                                                (fn [(, expr _ _)]
                                                                (let-> [
                                                                    t  (infer/expr tenv expr)
                                                                    () (unify t (tcon "string" l) l)]
                                                                    (<- ())))
                                                                templates)]
                                                     (<- (tcon "string" l)))
        (** For lambdas (fn [name] body)
            - create a type variable to represent the type of the argument
            - add the type variable to the typing environment
            - infer the body, using the augmented environment
            - apply any resulting substitutions to our arg variable **)
        (elambda [(pvar arg al)] body l)         (let-> [
                                                     arg-type  (new-type-var arg al)
                                                     ()        (record-type-> arg-type al false)
                                                     bound-env (<- (tenv/with-type tenv arg (forall set/nil (=> [] arg-type))))
                                                     body-type (infer/expr bound-env body)
                                                     arg-type  (type/apply-> arg-type)]
                                                     (<- (tfn arg-type body-type l)))
        (** With more complex patterns (that aren't just a variable name), there might be multiple "names" that need to get added to the type environment, so those are returned as the scope map, along with a type for the argument.
            Other than that, it's the same as the simple case. **)
        (elambda [pat] body l)                   (let-> [
                                                     (, arg-type scope) (infer/pattern tenv pat)
                                                     bound-env          (<- (tenv/with-scope tenv scope))
                                                     body-type          (infer/expr bound-env body)
                                                     arg-type           (type/apply-> arg-type)]
                                                     (<- (tfn arg-type body-type l)))
        (** This isn't necessarily the most efficient way to handle curried arguments, but imo it makes the above inference algorithm cleaner & more understandable, as you only have to think about one argument at a time. **)
        (elambda [one ..rest] body l)            (infer/expr tenv (elambda [one] (elambda rest body l) l))
        (elambda [] body l)                      (<-err "No args to lambda")
        (** Function application (target arg)
            - create a type variable to represent the return value of the function application
            - infer the target type
            - infer the arg type, using substitutions from the target. Q: Could this be done the other way around -- infer the arg first, and then the target? A: Yes, I believe it could! I have tested it, and the resulting algorithm was able to correctly type check our whole compiler, as well as pass all the tests in this file. The only difference would be that function call arguments would be checked last-to-first instead of first-to-last. So if you have a type error in two arguments of a function call, the later error would be reported instead of the former.
            - unify the inferred target type with the function type produced by our inferred argument type and our result variable.
            - the substitutions from the unification is then applied to the result type variable, giving us the overall type of the expression **)
        (eapp target [arg] l)                    (let-> [
                                                     result-var  (new-type-var "result" l)
                                                     target-type (infer/expr tenv target)
                                                     arg-tenv    (tenv/apply-> tenv)
                                                     arg-type    (infer/expr arg-tenv arg)
                                                     target-type (type/apply-> target-type)
                                                     _           (unify target-type (tfn arg-type result-var l) l)]
                                                     (type/apply-> result-var))
        (** Same story here as for the lambdas. Splitting things out like this allows us to look at one argument at a time. **)
        (eapp target [one ..rest] l)             (infer/expr tenv (eapp (eapp target [one] l) rest l))
        (eapp target [] l)                       (infer/expr tenv target)
        (** Let: simple version, where the pattern is just a pvar
            - infer the type of the value being bound
            - apply any subst that we learned from inferring the value to our type environment, producing a new tenv
            - generalize the inferred type! This is where we get let polymorphism; the inferred type is allowed to have "free" type variables. If we didn't generalize here, then let would not be polymorphic.
            - infer the type of the body, using the tenv that has the name bound to the generalized inferred type **)
        (elet [(, (pvar name nl) value)] body _) (let-> [
                                                     value-type  (infer/expr tenv value)
                                                     ()          (record-type-> value-type nl false)
                                                     applied-env (tenv/apply-> tenv)
                                                     (** Note that here we are not allowing let bound variables to have type class constraints. This is a restriction we could lift in the future, and follow THIH's approach of allowing predicates if the value is a elambda literal. **)
                                                     scheme      (<- (generalize applied-env (=> [] value-type)))
                                                     bound-env   (<- (tenv/with-type applied-env name scheme))]
                                                     (infer/expr bound-env body))
        (** For non-pvar patterns, it's almost exactly the same, but we don't allow produced type variables to be generic. If we did, things like (fn [x] (let [(, a b) x] a) would return an "unbound" type variable: it would be inferred as forall a, b; a -> b. **)
        (elet [(, pat value)] body l)            (let-> [
                                                     (, type scope) (infer/pattern tenv pat)
                                                     value-type     (infer/expr tenv value)
                                                     ()             (unify type value-type l)
                                                     scope          (scope/apply-> scope)
                                                     bound-env      (<- (tenv/with-scope tenv scope))
                                                     body-type      (infer/expr bound-env body)]
                                                     (<- body-type))
        (elet [one ..more] body l)               (infer/expr tenv (elet [one] (elet more body l) l))
        (elet [] body l)                         (<-err "No bindings in let")
        (** match expressions! Like let, but with a little more book-keeping. **)
        (ematch target cases l)                  (let-> [
                                                     target-type                 (infer/expr tenv target)
                                                     result-type                 (new-type-var "match result" l)
                                                     (** Handle each case, collecting all of the resulting types of the bodies. **)
                                                     (, target-type all-results) (foldl->
                                                                                     (, target-type [])
                                                                                         cases
                                                                                         (fn [(, target-type results) (, pat body)]
                                                                                         (let-> [
                                                                                             (, type scope) (infer/pattern tenv pat)
                                                                                             ()             (unify type target-type l)
                                                                                             scope          (scope/apply-> scope)
                                                                                             bound-env      (<- (tenv/with-scope tenv scope))
                                                                                             body-type      (infer/expr bound-env body)
                                                                                             target-type    (type/apply-> target-type)]
                                                                                             (<- (, target-type [body-type ..results])))))
                                                     (** Unify all of the result types together **)
                                                     ()                          (do->
                                                                                     (fn [one-result]
                                                                                         (let-> [subst <-subst]
                                                                                             (unify
                                                                                                 (type/apply subst one-result)
                                                                                                     (type/apply subst result-type)
                                                                                                     l)))
                                                                                         (reverse all-results))
                                                     ()                          (check-exhaustiveness tenv target-type (map fst cases) l)]
                                                     (type/apply-> result-type))))

(,
    (fn [x] (run/nil-> (infer/expr benv-with-pair x)))
        [(, (@ "a") (ok (tcon "string" 4512)))
        (, (@ hi) (err (tmissing [(, "hi" 4531)])))
        (, (@ (let [x "a"] x)) (ok (tcon "string" 4547)))
        (,
        (@ (, "a" "a"))
            (ok
            (tapp
                (tapp (tcon "," -1) (tcon "string" 4561) -1)
                    (tcon "string" 4562)
                    -1)))
        (,
        (@ (fn [x] (let [(, a b) x] a)))
            (ok
            (tapp
                (tapp
                    (tcon "->" 4689)
                        (tapp (tapp (tcon "," -1) (tvar "a:1" 4698) -1) (tvar "b:2" 4698) -1)
                        4689)
                    (tvar "a:1" 4698)
                    4689)))
        (,
        (@ (let [id (fn [x] x)] (, (id 2) (id true))))
            (ok
            (tapp
                (tapp (tcon "," -1) (tvar "result:5" 4759) -1)
                    (tcon "bool" 4764)
                    -1)))
        (,
        (@ (fn [id] (, (id 2) (id true))))
            (ok
            (tapp
                (tapp
                    (tcon "->" 4814)
                        (tapp
                        (tapp (tcon "->" 4820) (tcon "bool" 4825) 4820)
                            (tvar "result:7" 4823)
                            4820)
                        4814)
                    (tapp
                    (tapp (tcon "," -1) (tvar "result:7" 4823) -1)
                        (tvar "result:7" 4823)
                        -1)
                    4814)))
        (,
        (@ (fn [arg] (let [(, id _) arg] (, (id 2) (id true)))))
            (ok
            (tapp
                (tapp
                    (tcon "->" 4833)
                        (tapp
                        (tapp
                            (tcon "," -1)
                                (tapp
                                (tapp (tcon "->" 4847) (tcon "bool" 4852) 4847)
                                    (tvar "result:11" 4850)
                                    4847)
                                -1)
                            (tvar "b:2" 4840)
                            -1)
                        4833)
                    (tapp
                    (tapp (tcon "," -1) (tvar "result:11" 4850) -1)
                        (tvar "result:11" 4850)
                        -1)
                    4833)))
        (, (@ ((fn [x] x) 2)) (ok (tvar "result:0" 4860)))
        (, (@ (let [a 2] (let [a true] a))) (ok (tcon "bool" 9716)))
        (,
        (@
            (match 1
                1 true
                _ false))
            (ok (tcon "bool" 5074)))
        (,
        (@
            (fn [x]
                (match x
                    (, 1 a) a
                    _       1)))
            (ok
            (tapp
                (tapp
                    (tcon "->" 5085)
                        (tapp
                        (tapp (tcon "," -1) (tcon "int" 5094) -1)
                            (tvar "match result:1" 5089)
                            -1)
                        5085)
                    (tvar "match result:1" 5089)
                    5085)))
        (,
        (@
            (match 1
                1 true
                2 ""))
            (err
            (twrap
                (ttypes
                    (forall (map/from-list []) (=> [] (tcon "string" 5145)))
                        (forall (map/from-list []) (=> [] (tcon "bool" 5143))))
                    (ttypes
                    (forall (map/from-list []) (=> [] (tcon "string" 5145)))
                        (forall (map/from-list []) (=> [] (tcon "bool" 5143)))))))
        (,
        (@
            (fn [x]
                (match x
                    (, 2 _) 1
                    (, m _) m)))
            (ok
            (tapp
                (tapp
                    (tcon "->" 6436)
                        (tapp (tapp (tcon "," -1) (tcon "int" 6446) -1) (tvar "b:3" 6444) -1)
                        6436)
                    (tcon "int" 6446)
                    6436)))
        (, (@ (@ hi)) (ok (tcon "expr" 6701)))
        (, (@ "hi") (ok (tcon "string" 6785)))
        (,
        (@ "hi ${true}")
            (err
            (twrap
                (ttypes
                    (forall (map/from-list []) (=> [] (tcon "bool" 6850)))
                        (forall (map/from-list []) (=> [] (tcon "string" 6848))))
                    (ttypes
                    (forall (map/from-list []) (=> [] (tcon "bool" 6850)))
                        (forall (map/from-list []) (=> [] (tcon "string" 6848)))))))
        (,
        (@
            (fn [x]
                (match x
                    []            true
                    [(, a b) .._] true)))
            (ok
            (tapp
                (tapp
                    (tcon "->" 13860)
                        (tapp
                        (tcon "list" 12719)
                            (tapp (tapp (tcon "," -1) (tvar "a:4" 13870) -1) (tvar "b:5" 13870) -1)
                            12723)
                        13860)
                    (tcon "bool" 13868)
                    13860)))])

(** ## Patterns **)

((** Here we are producing (1) a type for the pattern, and (2) a "scope" mapping of names to type variables. **)
    defn infer/pattern [tenv pattern]
    (match pattern
        (pvar name l)          (let-> [
                                   v  (new-type-var name l)
                                   () (record-type-> v l false)]
                                   (<- (, v (map/from-list [(, name (forall set/nil (=> [] v)))]))))
        (pany l)               (let-> [v (new-type-var "any" l)] (<- (, v map/nil)))
        (pstr _ l)             (<- (, (tcon "string" l) map/nil))
        (pprim (pbool _ _) l)  (<- (, (tcon "bool" l) map/nil))
        (pprim (pint _ _) l)   (<- (, (tcon "int" l) map/nil))
        (pprim (pfloat _ _) l) (<- (, (tcon "float" l) map/nil))
        (** This is the only really complex case.
            cannot convert {"id":"8dc25efa-f2e6-431d-b516-a2dcbec00fec","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"instantiate the type constructor","styles":{}}],"children":[]}
            cannot convert {"id":"fbc62acd-aa18-4fde-9aaf-f465cc5b0860","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"infer the types for the pattern arguments","styles":{}}],"children":[]}
            cannot convert {"id":"d4cdaae3-0b80-4226-9b11-306ff6533ea4","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"unify the pattern types with the expected constructor types","styles":{}}],"children":[]}
            cannot convert {"id":"5631b441-770a-402c-b026-d53be33aa320","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"apply any substitutions to the type constructor's \"result\" type","styles":{}}],"children":[]}
            cannot convert {"id":"9de5a662-ca3d-422b-aef1-a621140eebaa","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"merge all the sub scopes together","styles":{}}],"children":[]} **)
        (pcon name _ args l)   (let-> [
                                   (, cargs cres)       (instantiate-tcon tenv name l)
                                   ()                   (record-type-> (tfns cargs cres l) l false)
                                   sub-patterns         (map-> (infer/pattern tenv) args)
                                   (, arg-types scopes) (<- (unzip sub-patterns))
                                   ()                   (do->
                                                            (fn [(, ptype ctype)] (unify ptype ctype l))
                                                                (zip arg-types cargs))
                                   cres                 (type/apply-> cres)
                                   scope                (<- (foldl map/nil scopes map/merge))]
                                   (<- (, cres scope)))))

((** This looks up a type constructor definition, and replaces any free variables in the arguments & result type with fresh type variables. **)
    defn instantiate-tcon [(tenv _ tcons _ _ _) name l]
    (match (map/get tcons name)
        (none)                     (<-err "Unknown type constructor: ${name}")
        (some (, free cargs cres)) (let-> [subst (make-subst-for-free (set/from-list free) l)]
                                       (<- (, (map (type/apply subst) cargs) (type/apply subst cres))))))

(** ## Verification
    We need to check match cases for exhaustiveness, e.g. whether it "covers all cases". If a match is not exhaustive, then it might lead to a runtime exception, which we are trying to avoid :).
    Making this determination in a reasonable amount of time is far from straightforward, and we will be leaning heavily on the 2007 paper [Warnings for Pattern Matching](http://moscova.inria.fr/~maranget/papers/warn/warn.pdf) by Luc Maranget (and [this typescript implementation](https://github.com/jaredly/jerd/blob/c470af39ca6f780e387a1d088924ae6cf7229f57/language/src/typing/terms/exhaustive.ts)) for the algorithm. **)

(defn any [f lst]
    (match lst
        []           false
        [one ..rest] (if (f one)
                         true
                             (any f rest))))

(defn check-exhaustiveness [tenv target-type patterns l]
    (let-> [
        target-type (type/apply-> target-type)
        matrix      (<-
                        (map
                            (fn [pat] [(pattern-to-ex-pattern tenv (, pat target-type))])
                                patterns))]
        (if (is-exhaustive tenv matrix)
            (<- ())
                (<-err "Match not exhaustive ${(int-to-string l)}"))))

(deftype ex-pattern
    (** The "any" pattern here also includes pvar, because it doesn't place any constraints on the value. **)
        (ex/any)
        (** ex/constructor encompasses both user-defined data types (such as list, ,, or expr) as well as primitive types such as int, bool, and string. You can see below in the group-constructors function how these are handled. **)
        (ex/constructor string string (list ex-pattern))
        (** Our current language doesn't support or patterns, but they would be nice to add in the future, and they are well-supported by the algorithm, so we might as well implement them here. **)
        (ex/or ex-pattern ex-pattern))

(** Processing "patterns" to be legible to the exhaustiveness algorithm **)

(defn pattern-to-ex-pattern [tenv (, pattern type)]
    (match pattern
        (pvar _ _)             (ex/any)
        (pany _)               (ex/any)
        (pstr str _)           (ex/constructor str "string" [])
        (pprim (pint v _) _)   (ex/constructor (int-to-string v) "int" [])
        (pprim (pfloat v _) _) (ex/constructor (jsonify v) "float" [])
        (pprim (pbool v _) _)  (ex/constructor
                                   (if v
                                       "true"
                                           "false")
                                       "bool"
                                       [])
        (pcon name _ args l)   (let [
                                   (, tname targs)           (tcon-and-args type [] l)
                                   (tenv _ tcons _ _ _)      tenv
                                   (, free-names cargs cres) (match (map/get tcons name)
                                                                 (none)   (fatal "Unknown type constructor ${name}")
                                                                 (some v) v)
                                   ;  do we need to assert that `cres` is the same as `type`? At this point it should be moot...
                                   subst                     (map/from-list (zip free-names targs))]
                                   (ex/constructor
                                       name
                                           tname
                                           (map
                                           (pattern-to-ex-pattern tenv)
                                               (zip args (map (type/apply subst) cargs)))))))

(pattern-to-ex-pattern
    (err-to-fatal
        (run/nil->
            (add/stmt
                builtin-env
                    (@!
                    (deftype (list a)
                        (nil)
                            (cons a (list a)))))))
        (, (@p [2 a b]) (@t (list int))))

(def benv-with-pair
    (tenv/merge
        builtin-env
            (fst
            (err-to-fatal
                (run/nil->
                    (add/stmts
                        builtin-env
                            [(@!
                            (deftype (, a b)
                                (, a b)))
                            (@!
                            (deftype (list a)
                                (nil)
                                    (cons a (list a))))]))))))

(,
    (pattern-to-ex-pattern benv-with-pair)
        [(,
        (, (@p [2 a b]) (@t (list int)))
            (ex/constructor
            "cons"
                "list"
                [(ex/constructor "2" "int" [])
                (ex/constructor
                "cons"
                    "list"
                    [(ex/any)
                    (ex/constructor
                    "cons"
                        "list"
                        [(ex/any) (ex/constructor "nil" "list" [])])])]))
        (,
        (, (@p (, 2 b)) (@t (, 1 2)))
            (ex/constructor "," "," [(ex/constructor "2" "int" []) (ex/any)]))])

(defn tcon-and-args [type coll l]
    (match type
        (tvar _ _)          (fatal
                                "Type not resolved ${(int-to-string l)} it is a tvar at heart. ${(jsonify type)} ${(jsonify coll)}")
        (tcon name _)       (, name coll)
        (tapp target arg _) (tcon-and-args target [arg ..coll] l)))

(,
    (fn [x] (tcon-and-args x [] 0))
        [(,
        (@t (hi a b (c d)))
            (,
            "hi"
                [(tcon "a" 10046)
                (tcon "b" 10047)
                (tapp (tcon "c" 10049) (tcon "d" 10050) 10048)]))])

(defn any-list [arity]
    (loop
        arity
            (fn [arity recur]
            (if (= 0 arity)
                []
                    [(ex/any) ..(recur (- arity 1))]))))

(defn default-matrix [matrix]
    (concat
        (map
            (fn [row]
                (match row
                    [(ex/any) ..rest]           [rest]
                    [(ex/or left right) ..rest] (default-matrix [[left ..rest] [right ..rest]])
                    _                           []))
                matrix)))

(defn is-exhaustive [tenv matrix]
    (if (is-useful tenv matrix [(ex/any)])
        false
            true))

(defn specialized-matrix [constructor arity matrix]
    (concat (map (specialize-row constructor arity) matrix)))

(defn specialize-row [constructor arity row]
    (match row
        []                                    (fatal "Can't specialize an empty row.")
        [(ex/any) ..rest]                     [(concat [(any-list arity) rest])]
        [(ex/constructor name _ args) ..rest] (if (= name constructor)
                                                  [(concat [args rest])]
                                                      [])
        [(ex/or left right) ..rest]           (specialized-matrix
                                                  constructor
                                                      arity
                                                      [[left ..rest] [right ..rest]])))

(defn fold-ex-pat [init pat f]
    (match pat
        (ex/or left right) (f (f init left) right)
        _                  (f init pat)))

(defn fold-ex-pats [init pats f]
    (foldl init pats (fn [init pat] (fold-ex-pat init pat f))))

(defn find-gid [heads]
    (fold-ex-pats
        none
            heads
            (fn [gid pat]
            (match pat
                (ex/constructor _ id _) (match gid
                                            (none)     (some id)
                                            (some oid) (if (!= oid id)
                                                           (fatal
                                                               "Constructors with different group IDs in the same position.")
                                                               (some id)))
                _                       gid))))

(defn group-constructors [tenv gid]
    (match gid
        "int"    []
        "bool"   ["true" "false"]
        "string" []
        _        (let [(tenv _ _ types _ _) tenv]
                     (match (map/get types gid)
                         (none)             (fatal "Unknown type name ${gid}")
                         (some (, _ names)) (set/to-list names)))))

((** This checks the "head" of each row of the matrix, finds the common type, and, if each constructor for that type is represented in the matrix, returns a mapping from constructor name => arity. **)
    defn args-if-complete [tenv matrix]
    (let [
        heads (map
                  (fn [row]
                      (match row
                          []         (fatal "is-complete called with empty row")
                          [head .._] head))
                      matrix)
        gid   (find-gid heads)]
        (match gid
            (none)     map/nil
            (some gid) (let [
                           found (map/from-list
                                     (fold-ex-pats
                                         []
                                             heads
                                             (fn [found head]
                                             (match head
                                                 (ex/constructor id _ args) [(, id (length args)) ..found]
                                                 _                          found))))]
                           (match (group-constructors tenv gid)
                               []      map/nil
                               constrs (loop
                                           constrs
                                               (fn [constrs recur]
                                               (match constrs
                                                   []          found
                                                   [id ..rest] (match (map/get found id)
                                                                   (none)   map/nil
                                                                   (some _) (recur rest))))))))))

(defn is-useful [tenv matrix row]
    (let [
        head-and-rest (match matrix
                          (** If our matrix has a height or width of zero, the row is not useful. **)
                          []       (none)
                          [[] .._] (none)
                          [_ .._]  (match row
                                       []            (none)
                                       [head ..rest] (some (, head rest))))]
        (match head-and-rest
            (none)               false
            (some (, head rest)) (match head
                                     (ex/constructor id _ args) (is-useful
                                                                    tenv
                                                                        (specialized-matrix id (length args) matrix)
                                                                        (concat [args rest]))
                                     (ex/any)                   (match (map/to-list (args-if-complete tenv matrix))
                                                                    []   (match (default-matrix matrix)
                                                                             []       true
                                                                             defaults (is-useful tenv defaults rest))
                                                                    alts (any
                                                                             (fn [(, id alt)]
                                                                                 (is-useful
                                                                                     tenv
                                                                                         (specialized-matrix id alt matrix)
                                                                                         (concat [(any-list alt) rest])))
                                                                                 alts))
                                     (ex/or left right)         (if (is-useful tenv matrix [left ..rest])
                                                                    true
                                                                        (is-useful tenv matrix [right ..rest]))))))

(** ## Type Class Resolution **)

(** ## Converting Types into JavaScript identifiers **)

(defn name-for-instance [type cls]
    "${(type->s type)} < ${cls}"
        ;("$_inst_${(type-to-js-id type)}$${cls}"))

(defn type-to-js-id [type]
    (match type
        (tvar name _)       (sanitize name)
        (tcon name _)       (sanitize name)
        (tapp target arg _) "${(type-to-js-id target)}$app$${(type-to-js-id arg)}"))

(type-to-js-id (tvar "a:12" 1))

(** ## Producing the data we'll need for code generation **)

(defn put-in-place [ordered value idx]
    (match ordered
        []                   [(, value idx)]
        [(, ov oidx) ..rest] (if (< idx oidx)
                                 [(, value idx) (, ov oidx) ..rest]
                                     [(, ov oidx) ..(put-in-place rest value idx)])))

(put-in-place [] "a" 1)

(,
    (fn [x] (foldl [] x (fn [ord (, a b)] (put-in-place ord a b))))
        [(, [(, "a" 1)] [(, "a" 1)])
        (, [(, "a" 1) (, "b" 2)] [(, "a" 1) (, "b" 2)])
        (, [(, "a" 0) (, "b" 1)] [(, "a" 0) (, "b" 1)])
        (, [(, "b" 1) (, "a" 0)] [(, "a" 0) (, "b" 1)])
        (, [(, "a" 0) (, "c" 2) (, "b" 1)] [(, "a" 0) (, "b" 1) (, "c" 2)])])

(defn organize-predicates [preds]
    (** So, here we want to: make a map from idx to (the list of ... the names of ... the instances). Which means, I want a way to turn a type into a javascript-ready variable name. **)
        (map/map
        (fn [ol]
            (mapi
                (fn [i (, v idx)]
                    (if (!= i idx)
                        (fatal
                            "predicates out of order somehow: ${(int-to-string i)} ${(int-to-string idx)}")
                            v))
                    ol))
            (foldl
            map/nil
                preds
                (fn [by-loc (isin type cls locs)]
                (let [instance-name (name-for-instance type cls)]
                    (foldl
                        by-loc
                            locs
                            (fn [by-loc (oloc loc idx)]
                            (match (map/get by-loc loc)
                                (none)         (map/set by-loc loc [(, instance-name idx)])
                                (some current) (map/set by-loc loc (put-in-place current instance-name idx))))))))))

(** ## Stuff from thih I'm still figuring out **)

(** ## Simplification **)

(defn type/hnf [type]
    (match type
        (tvar _ _)   true
        (tcon _ _)   false
        (tapp t _ _) (type/hnf t)))

(defn in-hnf [(isin t _ _)] (type/hnf t))

(defn to-hnfs [ce ps]
    (match (map/ok (to-hnf ce) ps)
        (err e) (err e)
        (ok v)  (ok (concat v))))

(defn map/ok [f arr]
    (match arr
        []           (ok [])
        [one ..rest] (match (f one)
                         (ok val) (match (map/ok f rest)
                                      (ok rest) (ok [val ..rest])
                                      (err e)   (err e))
                         (err e)  (err e))))

(defn to-hnf [ce p]
    (if (in-hnf p)
        (ok [p])
            (match (by-inst ce p)
            (none)    (let [(isin type name _) p]
                          (err
                              "Can't find an instance for class '${name}' for type ${(type->s type)}"))
            (some ps) (to-hnfs ce ps))))

(defn simplify-inner [ce rs preds]
    (match preds
        []       rs
        [p ..ps] (if (entail ce (concat [rs ps]) p)
                     (simplify-inner ce rs ps)
                         (simplify-inner ce [p ..rs] ps))))

(defn simplify [ce] (simplify-inner ce []))

(def preds->s (dot (join "\n") (map pred->s)))

(defn reduce [ce ps]
    (match (to-hnfs ce ps)
        (ok qs) (ok (simplify ce qs))
        (err e) (err e)))

(defn sc-entail [ce ps p] (any (any (pred= p)) (map (by-super ce) ps)))

(defn merge [s1 s2 l]
    (let [
        agree (all
                  (fn [v] (= (type/apply s1 (tvar v l)) (type/apply s2 (tvar v l))))
                      (set/to-list
                      (set/overlap
                          (set/from-list (map/keys s1))
                              (set/from-list (map/keys s2)))))]
        (if agree
            (map/merge s1 s2)
                (fatal "merge failed"))))

(defn type-match [t1 t2]
    (** We're trying to find a substitution that will turn t1 into t2. This is the one-way version of unify. **)
        (match (, t1 t2)
        (, (tapp l r loc) (tapp l' r' _)) (match (type-match l l')
                                              (ok sl) (match (type-match r r')
                                                          (ok sr) (ok (merge sl sr loc))
                                                          err     err)
                                              err     err)
        (, (tvar u _) t)                  (ok (map/set map/nil u t))
        (, (tcon tc1 _) (tcon tc2 _))     (if (= tc1 tc2)
                                              (ok map/nil)
                                                  (err (, "Unable to match types ${tc1} and ${tc2}" [])))
        _                                 (err (, "Unable to match ${(type->s t1)} vs ${(type->s t2)}" []))))

((** An ambiguity occurs when there is a type variable in a predicate that isn't constrained by the input or output of a value (generally happens due to a numeric literal that's only used in a type-class context). **)
    defn ambiguities [known-variables preds]
    (let [
        vbls-in-preds             (foldl set/nil (map predicate/free preds) set/merge)
        unaccounted-for-variables (set/diff vbls-in-preds known-variables)]
        (map
            (fn [v]
                (,
                    v
                        (filter (fn [pred] (any (= v) (set/to-list (predicate/free pred)))) preds)))
                (set/to-list unaccounted-for-variables))))

(defn joinor [sep default items]
    (match items
        [] default
        _  (join sep items)))

(defn tss->s [tss]
    (joinor
        "\n"
            "no tss"
            (map (dot (joinor "; " "[empty]") (map type->s)) tss)))

(defn vps->s [vps]
    (joinor
        "\n"
            "no vps"
            (map
            (fn [(, a preds)]
                "${a} is in predicates: ${(join ";" (map pred->s preds))}")
                vps)))

(defn is-empty [x]
    (match x
        [] true
        _  false))

(defn not [x]
    (if x
        false
            true))

(defn every [lst f]
    (match lst
        []           true
        [one ..rest] (if (f one)
                         (every rest f)
                             false)))

(def numClasses
    ["number"
        "integral"
        "floating"
        "fractional"
        "real"
        "realfloat"
        "realfrac"])

(def stdClasses
    ["eq"
        "ord"
        "show"
        "read"
        "pretty"
        "bounded"
        "enum"
        "ix"
        "functor"
        "monad"
        "monadplus"
        ..numClasses])

(defn candidates [classes (, v qs)]
    (let [
        is (map (fn [(isin _ i _)] i) qs)
        ts (map (fn [(isin t _ _)] t) qs)]
        (if (not
            (every
                [(all (type= (tvar v -1)) ts)
                    (any (fn [x] (any (= x) numClasses)) is)
                    (all (fn [x] (any (= x) stdClasses)) is)]
                    (fn [x] x)))
            []
                (filter
                (fn [t'] (all (entail classes []) (map (fn [i] (isin t' i [])) is)))
                    default-types))))

(defn head [lst]
    (match lst
        []        (fatal "empty list")
        [one .._] one))

(defn snd [(, _ s)] s)

(def defaulted-preds
    (with-defaults (fn [vps ts] (concat (map snd vps)))))

(def default-subst
    (with-defaults (fn [vps ts] (map/from-list (zip (map fst vps) ts)))))

(defn with-defaults [f ce known-variables predicates]
    (let [
        vps (ambiguities known-variables predicates)
        tss (map (candidates ce) vps)]
        (if (any is-empty tss)
            (err
                "Cannot resolve ambiguities: ${(vps->s vps)} defaults for variables: ${(tss->s tss)} with known variables: ${(join "; " (set/to-list known-variables))}")
                (ok (f vps (map head tss))))))

(defn by-super [classes pred]
    (** I still don't really know what the point of super-types is. **)
        (let [
        (isin t cls locs) pred
        (, supers _)      (match (map/get classes cls)
                              (some s) s
                              _        (fatal "Unknown class '${cls}' in predicate [by-super]"))]
        [pred
            ..(concat (map (fn [i'] (by-super classes (isin t i' locs))) supers))]))

(defn by-inst [classes pred]
    (let [
        (isin t cls locs) pred
        (, _ insts _)     (match (map/get classes cls)
                              (some s) s
                              _        (fatal "Unknown class '${cls}' in predicate [by-inst]"))]
        (find-some
            (fn [(=> ps (isin t2 cls2 _))]
                (if (!= cls cls2)
                    (none)
                        (match (type-match t2 t)
                        (err _)    (none)
                        (ok subst) (some (map (predicate/apply subst) ps)))))
                insts)))

(defn entail [classes predicates predicate]
    (if (any (any (pred= predicate)) (map (by-super classes) predicates))
        true
            (match (by-inst classes predicate)
            (none)    false
            (some qs) (all (entail classes predicates) qs))))

(defn ok>>= [value next]
    (match value
        (ok v)  (next v)
        (err e) (err e)))

(defn ok-> [result]
    (match result
        (ok v)  (<- v)
        (err e) (<-err e)))

(defn partition [arr test]
    (match arr
        []           (, [] [])
        [one ..rest] (let [(, yes no) (partition rest test)]
                         (if (test one)
                             (, [one ..yes] no)
                                 (, yes [one ..no])))))

(defn class-env/classes [(, _ classes _)] classes)

(defn without [base remove x=]
    (filter (fn [x] (not (contains remove x x=))) base))

(defn contains [arr item item=]
    (match arr
        []           false
        [one ..rest] (if (item= one item)
                         true
                             (contains rest item item=))))

(defn split [ce free-in-scope value-tyvars ps]
    (let-> [
        ps'       (ok-> (reduce ce ps))
        (, ds rs) (<-
                      (partition
                          ps'
                              (fn [(isin type name locs)]
                              (every (set/to-list (type/free type)) (fn [x] (any (= x) free-in-scope))))))
        rs'       (ok->
                      (defaulted-preds
                          ce
                              (set/from-list (concat [free-in-scope value-tyvars]))
                              rs))
        subst     (ok->
                      (default-subst
                          ce
                              (set/from-list (concat [free-in-scope value-tyvars]))
                              rs))]
        (<-
            (,
                ds
                    (without rs rs' pred= )
                    (map (predicate/apply subst) rs')
                    subst))))

(def default-types [tint (tcon "unit" -1)])

;(defn find-matching-instance [instances type] 111)

;(defn find-applicable-default [tv type instances]
    (loop
        default-types
            (fn [types recur]
            (match types
                []           (fatal
                                 "Unable to find an appicable default type for type variable ${tv}")
                [one ..rest] (let [subst (map/set map/nil tv one)]
                                 (match (find-matching-instance instances (type/apply subst type))
                                     (none)      (recur rest)
                                     (some inst) subst))))))

;(defn defaulted-preds [preds (tenv _ _ _ _ classes)]
    (let [
        (, subst preds) (foldl
                            (, map/nil [])
                                preds
                                (fn [(, subst res) (isin type cls locs)]
                                (match (map/get classes cls)
                                    (none)                              (fatal "Unknown class ${cls}")
                                    (some (, supers instances methods)) (let [type (type/apply subst type)]
                                                                            (match (set/to-list (type/free type))
                                                                                []   (, subst [(isin type cls locs) ..res])
                                                                                free (let [
                                                                                         nsubst (foldl
                                                                                                    subst
                                                                                                        free
                                                                                                        (fn [subst tv]
                                                                                                        (let [d-subst (find-applicable-default tv type instances)]
                                                                                                            (compose-subst d-subst subst))))]
                                                                                         (, nsubst))
                                                                                ;  now we go through and ... try assigning the type to one of our defaults.)))))]
        (many (map one preds))))

(defn add/expr [tenv expr]
    (let-> [
        t                                                 (infer/expr tenv expr)
        preds                                             <-preds
        (tenv _ _ _ _ class-env)                          (<- tenv)
        subst                                             <-subst
        preds                                             (<-
                                                              (predicate/combine
                                                                  (map (predicate/apply subst) (bag/to-list preds))))
        (** toplevel expressions shouldn't have any predicates that don't get defaulted away. **)
        (, free-preds other-preds defaulted-preds subst2) (split class-env [] [] preds)
        _                                                 (preds-> defaulted-preds)
        _                                                 (subst-> subst2)
        ;_
        ;(reset-preds->
            (many (map one (map (predicate/apply subst2) preds)))
                ;(bag/and (many (map one other-preds)) (many (map one free-preds))))]
        (<- (type/apply subst2 t))))

(,
    (fn [x]
        (let [
            (, (, _ subst preds _) res) (state-f (add/expr builtin-env x) state/nil)]
            (,
                res
                    (predicate/combine
                    (map (predicate/apply subst) (bag/to-list preds)))))
            )
        [(, (@ "hi") (, (ok (tcon "string" 17838)) []))
        (,
        (@ show)
            (,
            (err
                (terr
                    "Cannot resolve ambiguities: a:0 is in predicates: (isin a:0 \"show\" 20535@0)  defaults for variables: [empty] with known variables: "
                        []))
                [(isin (tvar "a:0" 20535) "show" [(oloc 20535 0)])]))
        (,
        (@ +)
            (,
            (ok
                (tapp
                    (tapp (tcon "->" -1) (tcon "int" -1) -1)
                        (tapp (tapp (tcon "->" -1) (tcon "int" -1) -1) (tcon "int" -1) -1)
                        -1))
                [(isin (tcon "int" -1) "number" [(oloc 20264 0)])]))
        (,
        (@ (fn [x] (+ 2 x)))
            (,
            (ok
                (tapp
                    (tapp (tcon "->" 17995) (tcon "int" -1) 17995)
                        (tcon "int" -1)
                        17995))
                [(isin (tcon "int" -1) "number" [(oloc 18000 0) (oloc 18001 0)])]))
        (,
        (@ 1)
            (, (ok (tcon "int" -1)) [(isin (tcon "int" -1) "number" [(oloc 17846 0)])]))])

(** ## Adding Top-level Items to the Type Environment **)

(defn add/def [tenv name nl expr l]
    (let-> [
        self      (new-type-var name nl)
        bound-env (<- (tenv/with-type tenv name (forall set/nil (=> [] self))))
        type      (infer/expr bound-env expr)
        self      (type/apply-> self)
        ()        (unify self type l)
        type      (type/apply-> type)
        subst     <-subst
        preds     <-preds]
        (<-
            (tenv/with-type
                tenv/nil
                    name
                    (generalize
                    tenv
                        (=> (map (predicate/apply subst) (bag/to-list preds)) type))))))

(,
    (fn [(tdef name nl expr l)]
        (let [
            (tenv values _ _ _) (err-to-fatal (run/nil-> (add/def builtin-env name nl expr l)))]
            (map/to-list values)))
        [(,
        (@! (def x 10))
            [(,
            "x"
                (forall
                (set/from-list ["number:1"])
                    (=>
                    [(isin (tvar "number:1" 3024) "number" [(oloc 3024 0)])]
                        (tvar "number:1" 3024))))])
        (,
        (@! (defn id [x] x))
            [(,
            "id"
                (forall
                (set/from-list ["x:1"])
                    (=>
                    []
                        (tapp
                        (tapp (tcon "->" 3044) (tvar "x:1" 3048) 3044)
                            (tvar "x:1" 3048)
                            3044))))])
        (,
        (@! (defn rec [x] (let [m (rec x)] (+ x m))))
            [(,
            "rec"
                (forall
                (set/from-list ["result:3"])
                    (=>
                    [(isin (tvar "result:3" 3428) "number" [(oloc 3429 0)])]
                        (tapp
                        (tapp (tcon "->" 3146) (tvar "result:3" 3428) 3146)
                            (tvar "result:3" 3428)
                            3146))))])])

(** Ok, but what about mutual recursion? It's actually very similar to the single case; you make a list of type variables, one for each definition, then do inference on each, unifying the result with the type variable, and then apply the final substitution to everything at the end! **)

(defn with-preds [preds (forall free (=> p2 type))]
    (forall
        free
            (=> (concat [p2 (filter (pred-contains free) preds)]) type)))

(defn filter [f lst]
    (match lst
        []           []
        [one ..rest] (if (f one)
                         [one ..(filter f rest)]
                             (filter f rest))))

(defn pred-contains [free (isin type cls loc)]
    (type/matches-free free type))

(defn add/defs [tenv defns]
    (let-> [
        ()                                                (reset-state->)
        names                                             (<- (map (fn [(, name _)] name) defns))
        locs                                              (<- (map (fn [(, _ _ _ l)] l) defns))
        vbls                                              (map-> (fn [(, name nl _)] (new-type-var name nl)) defns)
        bound-env                                         (<-
                                                              (foldl
                                                                  tenv
                                                                      (zip names (map (forall set/nil) (map (=> []) vbls)))
                                                                      (fn [tenv (, name vbl)] (tenv/with-type tenv name vbl))))
        types                                             (map-> (fn [(, _ _ expr _)] (infer/expr bound-env expr)) defns)
        vbls                                              (map-> type/apply-> vbls)
        ()                                                (do->
                                                              (fn [(, vbl type loc)] (unify vbl type loc))
                                                                  (zip vbls (zip types locs)))
        types                                             (map-> type/apply-> types)
        subst                                             <-subst
        preds                                             <-preds
        preds                                             (<-
                                                              (predicate/combine
                                                                  (map (predicate/apply subst) (bag/to-list preds))))
        (tenv _ _ _ _ class-env)                          (<- tenv)
        (, free-preds other-preds defaulted-preds subst2) (split
                                                              class-env
                                                                  []
                                                                  (if (all
                                                                  (fn [(, _ _ body _)]
                                                                      (match body
                                                                          (elambda _ _ _) true
                                                                          _               false))
                                                                      defns)
                                                                  (set/to-list (foldl set/nil (map type/free types) set/merge))
                                                                      [])
                                                                  preds)
        _                                                 (preds-> defaulted-preds)
        _                                                 (subst-> subst2)
        types                                             (<- (map (type/apply subst2) types))]
        (<-
            (foldl
                tenv/nil
                    (zip names types)
                    (fn [tenv (, name type)]
                    (** TODO: determine what predicates apply to this type, and drop them in there? **)
                        (tenv/with-type
                        tenv
                            name
                            (with-preds other-preds (generalize tenv (=> [] type)))))))))

(defn run-and-preds [statet]
    (let [(, (, idx subst preds types) result) (state-f statet state/nil)]
        (,
            (err-to-fatal result)
                (predicate/combine
                (map (predicate/apply subst) (bag/to-list preds))))))

(,
    (fn [x]
        (run-and-preds
            (add/defs
                builtin-env
                    (map (fn [(tdef name nl body l)] (, name nl body l)) x))))
        [(,
        [(@!
            (defn even [x]
                (if (= x 0)
                    true
                        (odd (- x 1)))))
            (@!
            (defn odd [x]
                (if (= x 1)
                    true
                        (even (- x 1)))))]
            (,
            (tenv
                (map/from-list
                    [(,
                        "odd"
                            (forall
                            (set/from-list ["number:18"])
                                (=>
                                [(isin
                                    (tvar "number:18" 22622)
                                        "number"
                                        [(oloc 22604 0) (oloc 22606 0) (oloc 22622 0)])]
                                    (tapp
                                    (tapp (tcon "->" 3821) (tvar "number:18" 22622) 3821)
                                        (tcon "bool" 22623)
                                        3821))))
                        (,
                        "even"
                            (forall
                            (set/from-list ["number:6"])
                                (=>
                                [(isin
                                    (tvar "number:6" 22598)
                                        "number"
                                        [(oloc 22598 0) (oloc 22627 0) (oloc 22629 0)])]
                                    (tapp
                                    (tapp (tcon "->" 3776) (tvar "number:6" 22598) 3776)
                                        (tcon "bool" 22599)
                                        3776))))])
                    (map/from-list [])
                    (map/from-list [])
                    (map/from-list [])
                    (map/from-list []))
                [(isin
                (tvar "number:6" 22598)
                    "number"
                    [(oloc 22598 0) (oloc 22627 0) (oloc 22629 0)])
                (isin
                (tvar "number:18" 22622)
                    "number"
                    [(oloc 22604 0) (oloc 22606 0) (oloc 22622 0)])
                (isin (tvar "number:18" 22622) "eq" [(oloc 22620 0)])
                (isin (tvar "number:6" 22598) "eq" [(oloc 22596 0)])]))
        (,
        [(@! (def lol (show 10)))]
            (,
            (tenv
                (map/from-list
                    [(, "lol" (forall (map/from-list []) (=> [] (tcon "string" -1))))])
                    (map/from-list [])
                    (map/from-list [])
                    (map/from-list [])
                    (map/from-list []))
                [(isin (tcon "int" -1) "show" [(oloc 21268 0)])
                (isin (tcon "int" -1) "number" [(oloc 21269 0)])]))
        (,
        [(@! (def hi 3))]
            (,
            (tenv
                (map/from-list [(, "hi" (forall (map/from-list []) (=> [] (tcon "int" -1))))])
                    (map/from-list [])
                    (map/from-list [])
                    (map/from-list [])
                    (map/from-list []))
                [(isin (tcon "int" -1) "number" [(oloc 23780 0)])]))])

(defn add/typealias [(tenv values tcons types aliases typeclasses) name args type]
    (tenv
        map/nil
            map/nil
            map/nil
            (** TODO verify that all referenced types do exist **)
            (map/set
            map/nil
                name
                (,
                (map fst args)
                    (type/con-to-var (set/from-list (map fst args)) type)))
            map/nil))

(defn add/deftype [(tenv _ tcons types aliases _) name args constrs l]
    (let [
        free           (map fst args)
        free-set       (set/from-list free)
        res            (foldl
                           (tcon name l)
                               args
                               (fn [inner (, name l)] (tapp inner (tvar name l) l)))
        parsed-constrs (map
                           (fn [(, name _ args _)]
                               (let [
                                   args (map (type/con-to-var free-set) args)
                                   args (map (type/resolve-aliases aliases) args)]
                                   (, name (, free args res))))
                               constrs)]
        (tenv
            (map/from-list
                (map
                    (fn [(, name (, free args res))]
                        (, name (forall (set/from-list free) (=> [] (tfns args res l)))))
                        parsed-constrs))
                (map/from-list parsed-constrs)
                (map/set
                map/nil
                    name
                    (, (length args) (set/from-list (map fst constrs))))
                map/nil
                map/nil)))

(defn type/con-to-var [vars type]
    (match type
        (tvar _ _)    type
        (tcon name l) (if (set/has vars name)
                          (tvar name l)
                              type)
        (tapp a b l)  (tapp (type/con-to-var vars a) (type/con-to-var vars b) l)))

(defn type/resolve-aliases [aliases type]
    (let [
        (, target args) (type/unroll-app type)
        args            (map (type/resolve-aliases aliases) (reverse (map fst args)))]
        (match target
            (tcon name l) (match (map/get aliases name)
                              (some (, free type)) (let [subst (map/from-list (zip free args))]
                                                       (type/resolve-aliases aliases (type/apply subst type)))
                              _                    (foldl target args (fn [a b] (tapp a b l))))
            (tvar _ l)    (foldl target args (fn [a b] (tapp a b l)))
            _             target)))

(defn type/unroll-app [type]
    (match type
        (tapp target arg l) (let [(, target inner) (type/unroll-app target)]
                                (, target [(, arg l) ..inner]))
        _                   (, type [])))

(defn add/stmt [tenv stmt]
    (match stmt
        (tdef name nl expr l)            (add/def tenv name nl expr l)
        (texpr expr l)                   (let-> [_ (infer/expr tenv expr)] (<- tenv/nil))
        (ttypealias name _ args type _)  (<- (add/typealias tenv name args type))
        (tdeftype name _ args constrs l) (<- (add/deftype tenv name args constrs l))))

(defn split-stmts [stmts]
    (loop
        stmts
            (fn [stmts recur]
            (match stmts
                []            (, [] [] [] [])
                [stmt ..rest] (let [(, defs aliases exprs others) (recur rest)]
                                  (match stmt
                                      (tdef name nl body l)  (, [(, name nl body l) ..defs] aliases exprs others)
                                      (ttypealias _ _ _ _ _) (, defs [stmt ..aliases] exprs others)
                                      (texpr expr l)         (, defs aliases [expr ..exprs] others)
                                      _                      (, defs aliases exprs [stmt ..others])))))))

(defn add/stmts [tenv stmts]
    (let-> [
        (, defs aliases exprs others) (<- (split-stmts stmts))
        denv                          (add/defs tenv defs)
        final                         (foldl->
                                          denv
                                              (concat [aliases others])
                                              (fn [env stmt]
                                              (let-> [env' (add/stmt (tenv/merge tenv env) stmt)]
                                                  (<- (tenv/merge env env')))))
        types                         (map-> (add/expr (tenv/merge tenv final)) exprs)]
        (<- (, final types))))

(,
    (fn [(, x name)]
        (scheme->s
            (force
                (tenv/resolve
                    (foldl
                        tenv/nil
                            x
                            (fn [env stmts]
                            (tenv/merge
                                env
                                    (fst
                                    (err-to-fatal
                                        (run/nil-> (add/stmts (tenv/merge builtin-env env) stmts)))))))
                        name))))
        [(,
        (,
            [[(@!
                (deftype (x m)
                    (a m)))]
                [(@!
                (defn aa [x]
                    (match x
                        (a 2) 2
                        (a m) m)))]]
                "aa")
            "(fn [(x int)] int)")
        (,
        (,
            [[(@! (typealias a int))
                (@!
                (deftype lol
                    (elol a)))]]
                "elol")
            "(fn [int] lol)")
        (,
        (,
            [[(@! (typealias alt (, (list pat) expr)))
                (@! (typealias bindgroup (, alt)))
                (@!
                (deftype expr
                    (elet bindgroup expr int)))]
                [(@! (defn x [(elet b _ _)] b))]]
                "x")
            "(fn [expr] ((, (list pat)) expr))")
        (,
        (,
            [[(@! (typealias (a b) (, int b)))
                (@!
                (deftype hi
                    (red int)
                        (blue)
                        (green (a bool))))]]
                "green")
            "(fn [((, int) bool)] hi)")
        ])

(** ## Type Environment populated with Builtins **)

(def tbool (tcon "bool" -1))

(defn tmap [k v] (tapp (tapp (tcon "map" -1) k -1) v -1))

(defn toption [arg] (tapp (tcon "option" -1) arg -1))

;(typealias what l)

(defn tlist [arg] (tapp (tcon "list" -1) arg -1))

(defn tset [arg] (tapp (tcon "set" -1) arg -1))

(defn concrete [t] (forall set/nil (=> [] t)))

(defn generic [vbls t] (forall (set/from-list vbls) (=> [] t)))

(defn vbl [k] (tvar k -1))

(defn t, [a b] (tapp (tapp (tcon "," -1) a -1) b -1))

(def tstring (tcon "string" -1))

(def builtin-env
    (let [
        k    (vbl "k")
        v    (vbl "v")
        v2   (vbl "v2")
        kv   (generic ["k" "v"])
        kk   (generic ["k"])
        a    (vbl "a")
        b    (vbl "b")
        num2 (forall (set/from-list ["a"]) (=> [(isin a "number" [])] (tfns [a a] a -1)))
        ord2 (forall (set/from-list ["a"]) (=> [(isin a "ord" [])] (tfns [a a] tbool -1)))
        eq2  (forall (set/from-list ["a"]) (=> [(isin a "eq" [])] (tfns [a a] tbool -1)))
        inst (fn [t cls] (=> [] (isin t cls [])))]
        (tenv
            (map/from-list
                [(, "-" num2)
                    (, ">" ord2)
                    (, "<" ord2)
                    (, "=" eq2)
                    (, "!=" eq2)
                    (, ">=" ord2)
                    (, "<=" ord2)
                    (, "pi" (concrete (tcon "float" -1)))
                    (, "+" num2)
                    (,
                    "show"
                        (forall (set/from-list ["a"]) (=> [(isin a "show" [])] (tfns [a] tstring -1))))
                    (,
                    "show/pretty"
                        (forall (set/from-list ["a"]) (=> [(isin a "pretty" [])] (tfns [a] tstring -1))))
                    (, "()" (concrete (tcon "()" -1)))
                    (, "," (generic ["a" "b"] (tfns [a b] (t, a b) -1)))
                    ;(,
                    "trace"
                        (kk
                        (tfns
                            [(tapp (tcon "list" -1) (tapp (tcon "trace-fmt" -1) k -1) -1)]
                                (tcon "()" -1)
                                -1)))
                    (, "unescapeString" (concrete (tfns [tstring] tstring -1)))
                    (, "int-to-string" (concrete (tfns [tint] tstring -1)))
                    (, "string-to-int" (concrete (tfns [tstring] (toption tint) -1)))
                    (,
                    "string-to-float"
                        (concrete (tfns [tstring] (toption (tcon "float" -1)) -1)))
                    ;(, "++" (concrete (tfns [(tlist tstring)] tstring -1)))
                    (, "map/nil" (kv (tmap k v)))
                    (, "map/set" (kv (tfns [(tmap k v) k v] (tmap k v) -1)))
                    (, "map/rm" (kv (tfns [(tmap k v) k] (tmap k v) -1)))
                    (, "map/get" (kv (tfns [(tmap k v) k] (toption v) -1)))
                    (,
                    "map/map"
                        (generic ["k" "v" "v2"] (tfns [(tfns [v] v2 -1) (tmap k v)] (tmap k v2) -1)))
                    (, "map/merge" (kv (tfns [(tmap k v) (tmap k v)] (tmap k v) -1)))
                    (, "map/values" (kv (tfns [(tmap k v)] (tlist v) -1)))
                    (, "map/keys" (kv (tfns [(tmap k v)] (tlist k) -1)))
                    (, "set/nil" (kk (tset k)))
                    (, "set/add" (kk (tfns [(tset k) k] (tset k) -1)))
                    (, "set/has" (kk (tfns [(tset k) k] tbool -1)))
                    (, "set/rm" (kk (tfns [(tset k) k] (tset k) -1)))
                    (, "set/diff" (kk (tfns [(tset k) (tset k)] (tset k) -1)))
                    (, "set/merge" (kk (tfns [(tset k) (tset k)] (tset k) -1)))
                    (, "set/overlap" (kk (tfns [(tset k) (tset k)] (tset k) -1)))
                    (, "set/to-list" (kk (tfns [(tset k)] (tlist k) -1)))
                    (, "set/from-list" (kk (tfns [(tlist k)] (tset k) -1)))
                    (, "map/from-list" (kv (tfns [(tlist (t, k v))] (tmap k v) -1)))
                    (, "map/to-list" (kv (tfns [(tmap k v)] (tlist (t, k v)) -1)))
                    (, "jsonify" (generic ["v"] (tfns [(tvar "v" -1)] tstring -1)))
                    (, "valueToString" (generic ["v"] (tfns [(vbl "v")] tstring -1)))
                    (, "eval" (generic ["v"] (tfns [(tcon "string" -1)] (vbl "v") -1)))
                    (,
                    "errorToString"
                        (generic ["v"] (tfns [(tfns [(vbl "v")] tstring -1) (vbl "v")] tstring -1)))
                    (, "sanitize" (concrete (tfns [tstring] tstring -1)))
                    (,
                    "replace-all"
                        (concrete (tfns [tstring tstring tstring] tstring -1)))
                    (, "fatal" (generic ["v"] (tfns [tstring] (vbl "v") -1)))])
                (map/from-list [(, "()" (, [] [] (tcon "()" -1))) (, "," (, ["a" "b"] [a b] (t, a b)))])
                (map/from-list
                [(, "int" (, 0 set/nil))
                    (, "float" (, 0 set/nil))
                    (, "string" (, 0 set/nil))
                    (, "bool" (, 0 set/nil))
                    (, "map" (, 2 set/nil))
                    (, "set" (, 1 set/nil))
                    (, "->" (, 2 set/nil))])
                map/nil
                (map/from-list
                [(,
                    "number"
                        (, ["ord" "eq"] [(inst tint "number") (inst (tcon "float" -1) "number")] []))
                    (, "ord" (, ["eq"] [(inst tint "ord") (inst (tcon "float" -1) "ord")] []))
                    (,
                    "eq"
                        (,
                        []
                            [(inst tint "eq")
                            (inst (tcon "float" -1) "eq")
                            (inst tbool "eq")
                            (=>
                            [(isin (tvar "a" -1) "eq" []) (isin (tvar "b" -1) "eq" [])]
                                (isin (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "b" -1) -1) "eq" []))]
                            []))
                    (, "floating" (, [] [(=> [] (isin (tcon "float" -1) "floating" []))] []))
                    (,
                    "pretty"
                        (,
                        []
                            [(inst tint "pretty") (inst tstring "pretty") (inst tbool "pretty")]
                            []))
                    (,
                    "show"
                        (,
                        []
                            [(inst tint "show")
                            (inst tstring "show")
                            (inst tbool "show")
                            (inst (tcon "float" -1) "show")]
                            []))]))))

(** ## Exporting for the structured editor **)

(** This is a peek under the hood as to how the code in these documents gets "handed off" to the structured editor for use as an evaluator for other documents. It's not really necessary for you to understand it, and it's disabled here in the publicly hosted editor anyway. **)

(defn none-to [v opt]
    (match opt
        (none)   v
        (some m) m))

(defn infer-stmts3 [env stmts]
    (let [
        (, (, _ subst preds types) result) (state-f (add/stmts env stmts) state/nil)
        preds                              (predicate/combine
                                               (map (predicate/apply subst) (bag/to-list preds)))
        preds-by-vbl                       (foldl
                                               map/nil
                                                   preds
                                                   (fn [map pred]
                                                   (foldl
                                                       map
                                                           (set/to-list (predicate/free pred))
                                                           (fn [map v]
                                                           (match (map/get map v)
                                                               (none)       (map/set map v [pred])
                                                               (some preds) (map/set map v [pred ..preds]))))))]
        (,
            (match result
                (err e)             (err e)
                (ok (, tenv types)) (ok (, tenv (map (forall set/nil) (map (=> []) types)))))
                (map
                (fn [(, t l dont-apply)]
                    (if dont-apply
                        (, l (forall set/nil (=> [] t)))
                            (** Hmm I probably should go through ... and determine what predicates apply to the given type? Maybe? **)
                            (,
                            l
                                (forall
                                set/nil
                                    (=>
                                    (predicate/combine
                                        (concat
                                            (map
                                                (dot (none-to []) (map/get preds-by-vbl))
                                                    (set/to-list (type/free t)))))
                                        (type/apply subst t))))))
                    types)
                (organize-predicates preds))))

(defn infer-expr3 [env expr]
    (let [
        (, (, _ subst preds types) result) (state-f (infer/expr env expr) state/nil)
        preds                              (predicate/combine
                                               (map (predicate/apply subst) (bag/to-list preds)))]
        (,
            (match result
                (ok t)  (ok (forall set/nil (=> preds t)))
                (err e) (err e))
                (map
                (fn [(, t l dont-apply)]
                    (if dont-apply
                        (, l (forall set/nil (=> [] t)))
                            (, l (forall set/nil (=> [] (type/apply subst t))))))
                    types)
                (organize-predicates preds))))

(eval
    (** env_nil => add_stmt => get_type => type_to_string => type_to_cst => infer_stmts3 => infer3 =>
  ({type: 'fns', env_nil, add_stmt, get_type, type_to_string, type_to_cst, infer_stmts3, infer3})
 **)
        builtin-env
        tenv/merge
        tenv/resolve
        scheme->s
        scheme->cst
        infer-stmts3
        infer-expr3)