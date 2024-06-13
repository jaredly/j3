(** ## Hindley Milner Type Inference
    Heavily based on the excellent paper [Algorithm W Step-By-Step](https://github.com/wh5a/Algorithm-W-Step-By-Step/blob/master/AlgorithmW.pdf).
    Notable differences:
    - we're putting the "substitution list" into the state monad, which is less bug-prone and results in code that's easier to think about in my opinion
    - because we actually will use this to self-host, we need to support pattern matching, match statements, and custom data types. This also makes the "type environment" somewhat more complex.
    This document extends the [Self-Hosted Type Inference](/algw-s2) document, adding Monadic Error Handling and "Hover for Type" functionality. Changes are highlighted in green, and you can hover any changed node to see the previous version. Sections with subordinate changes have their handle (in the left gutter) outlined in green as well. **)

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

(defn mapi [f lst]
    (loop
        (, 0 lst)
            (fn [(, i lst) recur]
            (match lst
                []           []
                [one ..rest] [(f i one) ..(recur (, (+ i 1) rest))]))))

(mapi + [2 2 2 2 2])

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

(** ## AST
    again, this is the same as in the previous articles, so feel free to skip. **)

(deftype prim
    (pint int int)
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
        (cst/record (list cst) int)
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
        (ematch expr (list (, pat expr)) int)
        (eenum string int (option expr) int)
        (erecord (option (, expr bool)) (list (, string expr)) int)
        (eaccess (option (, string int)) (list (, string int)) int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string int (list pat) int)
        (pstr string int)
        (pprim prim int)
        (precord (list (, string pat)) (option pat) int)
        (penum string int (option pat) int))

(deftype type
    (tvar string int)
        (tapp type type int)
        (tcon string int)
        (trec string int type int)
        (trow (list (, string type)) (option type) row-kind int))

(deftype row-kind
    (rrecord)
        (renum))

(defn map= [v= one two]
    (let [
        k1 (map/keys one)
        k2 (map/keys two)]
        (if (= (length k1) (length k2))
            (all
                (fn [k]
                    (match (, (map/get one k) (map/get two k))
                        (, (some a) (some b)) (v= a b)
                        _                     false))
                    k1)
                false)))

(defn type= [one two]
    (match (, one two)
        (, (trow f1 s1 k1 _) (trow f2 s2 k2 _))       (if (= k1 k2)
                                                          (let [
                                                              (, m1 s1) (deep-map f1 s1 k1)
                                                              (, m2 s2) (deep-map f2 s2 k2)]
                                                              (if (match (, s1 s2)
                                                                  (, (none) (none))     true
                                                                  (, (some a) (some b)) (type= a b)
                                                                  _                     false)
                                                                  (map= type= m1 m2)
                                                                      false))
                                                              false)
        (, (trec a _ b _) (trec c _ d _))             (if (= a c)
                                                          (type= b d)
                                                              false)
        (, (tvar id _) (tvar id' _))                  (= id id')
        (, (tapp target arg _) (tapp target' arg' _)) (if (type= target target')
                                                          (type= arg arg')
                                                              false)
        (, (tcon name _) (tcon name' _))              (= name name')
        _                                             false))

(defn tfn [effects arg body l]
    (tapp (tapp (tapp (tcon "->" l) effects l) arg l) body l))

(defn tfns [args body l]
    (foldr
        body
            (mapi (fn [i arg] (, (tvar "effect:${(int-to-string i)}" -1) arg)) args)
            (fn [body (, effects arg)] (tfn effects arg body l))))

(def tint (tcon "int" -1))

(defn scheme->s [(forall vbls type)]
    (match (set/to-list vbls)
        []   (type->s type)
        vbls "forall ${(join " " vbls)} : ${(type->s type)}"))

(defn type->s [type]
    (match type
        (trow fields spread kind loc)                  (let [
                                                           (, fmap spread) (deep-map fields spread kind)
                                                           fields          (map/to-list fmap)]
                                                           (match kind
                                                               (rrecord) "{${(join " " (map (fn [(, tag value)] "${tag} ${(type->s value)}") fields))}${(match spread
                                                                             (none)   ""
                                                                             (some t) " ..${(type->s t)}")}}"
                                                               (renum)   "[${(join
                                                                             " "
                                                                                 (map
                                                                                 (fn [(, tag value)]
                                                                                     (match value
                                                                                         (tcon "()" _) "'${tag}"
                                                                                         v             "('${tag} ${(type->s v)})"))
                                                                                     fields))}${(match spread
                                                                             (none)   ""
                                                                             (some t) " ..${(type->s t)}")}]"))
        (tvar name _)                                  name
        (trec name _ inner _)                          "(rec ${name} ${(type->s inner)})"
        (tapp (tapp (tapp (tcon "->" _) _ _) _ _) _ _) (let [(, args body) (fn-args-and-body type)]
                                                           ("(fn [${(join " " (map (fn [(, e t)] "{${(type->s e)}}${(type->s t)}") args))}] ${(type->s body)})"
                                                               ))
        (tapp target arg _)                            (let [(, target args) (target-and-args type [])]
                                                           "(${(type->s target)} ${(join " " (map type->s args))})")
        (tcon name _)                                  name))

(defn scheme->cst [(forall vbls type)] (type->cst type))

(defn target-and-args [type coll]
    (match type
        (tapp target arg _) (target-and-args target [arg ..coll])
        _                   (, type coll)))

(defn fn-args-and-body [type]
    (match type
        (tapp (tapp (tapp (tcon "->" _) effects _) arg _) res _) (let [(, args res) (fn-args-and-body res)]
                                                                     (, [(, effects arg) ..args] res))
        _                                                        (, [] type)))

(defn type->cst [type]
    (match type
        (trow fields spread kind l)                    (let [
                                                           (, fmap spread) (deep-map fields spread kind)
                                                           fields          (map/to-list fmap)]
                                                           (match kind
                                                               (rrecord) (cst/record
                                                                             (concat
                                                                                 [(concat (map (fn [(, k v)] [(cst/id k l) (type->cst v)]) fields))
                                                                                     (match spread
                                                                                     (none)   []
                                                                                     (some v) [(cst/spread (type->cst v) l)])])
                                                                                 l)
                                                               (renum)   (cst/array
                                                                             (concat
                                                                                 [(map
                                                                                     (fn [(, k v)]
                                                                                         (match v
                                                                                             (tcon "()" _) (cst/id "'${k}" l)
                                                                                             _             (cst/list [(cst/id "'${k}" l) (type->cst v)] l)))
                                                                                         fields)
                                                                                     (match spread
                                                                                     (none)   []
                                                                                     (some v) [(cst/spread (type->cst v) l)])])
                                                                                 l)))
        (tvar name l)                                  (cst/id name l)
        (tcon name l)                                  (cst/id name l)
        (trec name nl inner l)                         (cst/list [(cst/id "rec" l) (cst/id name nl) (type->cst inner)] l)
        (tapp (tapp (tapp (tcon "->" _) _ _) _ l) _ _) (let [(, args res) (fn-args-and-body type)]
                                                           (cst/list
                                                               [(cst/id "fn" l)
                                                                   (cst/array
                                                                   (concat
                                                                       (map (fn [(, e t)] [(cst/record [(type->cst e)] l) (type->cst t)]) args))
                                                                       l)
                                                                   (type->cst res)]
                                                                   l))
        (tapp (tapp (tcon "," cl) a _) b l)            (let [all (unwrap-tuple-type type)]
                                                           (cst/list [(cst/id "," cl) ..(map type->cst all)] l))
        (tapp _ _ l)                                   (let [(, name args) (target-and-args type [])]
                                                           (cst/list [(type->cst name) ..(map type->cst args)] l))))

(defn unwrap-tuple-type [type]
    (match type
        (tapp (tapp (tcon "," _) a _) b _) (let [inner (unwrap-tuple-type b)] [a ..inner])
        _                                  [type]))

(type->cst (@t (, 1 2 3)))

(** ## The Type Environment
    The "type environment" gets passed around to most of the infer/ functions, and includes global definitions as well as the types of locally-bound variables. **)

(** A scheme is the way that we represent generic types (sometimes called "polytypes"). The first argument is a set of the tvar ids that are generic in the contained type. **)

(deftype scheme
    (forall (set string) type))

(deftype tenv
    (tenv
        (** Types of values currently in scope **)
            (map string scheme)
            (** Data type constructors; (free variables) (arguments) (resulting type) **)
            (map string (, (list string) (list type) type))
            (** Data types (# free variables, constructor names) **)
            (map string (, int (set string)))
            (** Type aliases **)
            (map string (, (list string) type))))

(defn tenv/merge [(tenv v1 c1 t1 a1) (tenv v2 c2 t2 a2)]
    (tenv
        (map/merge v1 v2)
            (map/merge c1 c2)
            (map/merge t1 t2)
            (map/merge a1 a2)))

(def tenv/nil (tenv map/nil map/nil map/nil map/nil))

(defn tenv/with-type [(tenv values tcons types aliases) name scheme]
    (tenv (map/set values name scheme) tcons types aliases))

(defn tenv/with-scope [(tenv values tcons types aliases) scope]
    (tenv (map/merge scope values) tcons types aliases))

(defn tenv/resolve [(tenv values _ _ _) name] (map/get values name))

(** ## Finding "free" type variables
    The */free functions are about finding unbound type variables (that aren't bound by a containing forall).
    - type/free: types cannot contain a forall, so every tvar is "free"
    - scheme/free: finds all tvars in the contained type that aren't present in the "free set". This produces all type variables that are defined outside of the current declaration.
    - tenv/free: runs scheme/free on all variables in scope. **)

(defn type/free [type]
    (match type
        (trow fields spread kind loc) (foldl
                                          (match spread
                                              (none)   set/nil
                                              (some v) (type/free v))
                                              (map (fn [(, _ t)] (type/free t)) fields)
                                              set/merge)
        (trec name _ inner loc)       (set/rm (type/free inner) name)
        (tvar id _)                   (set/add set/nil id)
        (tcon _ _)                    set/nil
        (tapp a b _)                  (set/merge (type/free a) (type/free b))))

(defn scheme/free [(forall vbls type)]
    (set/diff (type/free type) vbls))

(defn tenv/free [(tenv values _ _ _)]
    (foldr set/nil (map scheme/free (map/values values)) set/merge))

(,
    (fn [a] (set/to-list (scheme/free a)))
        [(, (forall (set/from-list ["a"]) (tvar "a" -1)) [])
        (, (forall (set/from-list []) (tvar "a" -1)) ["a"])])

(** ## Applying type substitutions
    A core notion of Hindley-Milner's "Algorithm W" is the "substitution map". It contains a mapping from a type variable to a "replacement type". Applying the substitution map to a type consists of finding all tvars in a type that have a replacement defined in the map, and making that substitution. **)

(defn type/apply [subst type]
    (match type
        (tvar id _)              (match (map/get subst id)
                                     (none)   type
                                     (some t) t)
        (tapp target arg loc)    (tapp (type/apply subst target) (type/apply subst arg) loc)
        (trow fields spread k l) (trow
                                     (map (fn [(, n t)] (, n (type/apply subst t))) fields)
                                         (match spread
                                         (none)   spread
                                         (some t) (some (type/apply subst t)))
                                         k
                                         l)
        _                        type))

(,
    (type/apply (map/from-list [(, "a" (tcon "int" -1))]))
        [(, (tvar "a" -1) (tcon "int" -1))
        (, (tvar "b" -1) (tvar "b" -1))
        (,
        (tapp (tcon "list" -1) (tvar "a" -1) -1)
            (tapp (tcon "list" -1) (tcon "int" -1) -1))])

(defn scheme/apply [subst (forall vbls type)]
    (** When applying a substitution map to a scheme, we ignore all mappings of variables in the free set for that scheme. **)
        (forall vbls (type/apply (map-without subst vbls) type)))

((** As an optimization, we could segregate the type environment into "values with unresolved type variables" and "values without", or even set up a lookup table from "tvar id" to "names of values that contain that tvar". For now though, we'll do the simple thing of just always iterating over everything in scope.
    A simpler (and very reasonable) optimization would be to split the tenv into "global terms" and "local terms", because global terms are not allowed to have unresolved type variables, and local terms tend to be relatively small in number.
    These optimizations would also speed up tenv/free considerably. **)
    defn tenv/apply [subst (tenv values tcons types aliases)]
    (tenv (scope/apply subst values) tcons types aliases))

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

(defn generalize [tenv t]
    (forall (set/diff (type/free t) (tenv/free tenv)) t))

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
    (let [(, (, _ substs _) result) (f state)] result))

(defn substs->s [substs]
    (join
        "\n"
            (map (fn [(, k t)] "${k} => ${(type->s t)}") (map/to-list substs))))

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
                (map string type)
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
    (<-err* (ttypes (forall set/nil t1) (forall set/nil t2))))

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
        (, idx subst types) <-state
        _                   (state-> (, idx subst [(, type loc dont-subst) ..types]))]
        (<- ())))

;((** This is for recording all of the identifiers that are "declarations". The editor can then match it against all reported "usages" to find variables that are unused. **)
    defn record-decl-> [loc]
    (let-> [
        (, i s t decls u) <-state
        _                 (state-> (, i s t [loc ..decls] u))]
        (<- ())))

;((** Here we record a usage; whether of a type or value, including the location where it was used, and the location where it was declared. **)
    defn record-usage-> [usage decl]
    (let-> [
        (, i s t d usages) <-state
        _                  (state-> (, i s t d [(, usage decl) ..usages]))]
        (<- ())))

(def state/nil (, 0 map/nil []))

(defn run/nil-> [st] (run-> st state/nil))

(def <-next-idx
    (let-> [
        (, idx subst types) <-state
        _                   (state-> (, (+ idx 1) subst types))]
        (<- idx)))

(def <-subst (let-> [(, _ subst _) <-state] (<- subst)))

(defn subst-> [new-subst]
    (let-> [
        (, idx subst types) <-state
        _                   (state-> (, idx (compose-subst new-subst subst) types))]
        (<- ())))

((** This overwrites the substitution map (without composing), returning the old substitution map. It is used for isolating a section of the algorithm, for performance reasons. **)
    defn subst-reset-> [new-subst]
    (let-> [
        (, idx old-subst types) <-state
        _                       (state-> (, idx new-subst types))]
        (<- old-subst)))

(def reset-state->
    (let-> [
        (, _ _ types) <-state
        _             (state-> (, 0 map/nil types))]
        (<- ())))

(** These are monadified versions of the */apply functions from above; they "apply the current substitution". **)

(defn apply-> [f arg] (let-> [subst <-subst] (<- (f subst arg))))

(def tenv/apply-> (apply-> tenv/apply))

(def type/apply-> (apply-> type/apply))

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

(defn instantiate [(forall vars t) l]
    (let-> [subst (make-subst-for-free vars l)] (<- (type/apply subst t))))

(** ## Unification
    Because our type-language is so simple, unification is quite straightforward. If we come across a tvar, we treat whatever's on the other side as its substitution; otherwise we recurse.
    Importantly, unify doesn't produce a "unified type"; instead it produces a substitution which, when applied to both types, will yield the same unified type.
    If two types are irreconcilable, it throws an exception.
    The "cycle check" (also called an "occurs check" in literature) prevents infinite types (like a substitution from a : int -> a). **)

(defn unify [t1 t2 l]
    (map-err->
        (unify-inner t1 t2 (, map/nil [] 0) l)
            (fn [inner]
            (err (twrap (ttypes (forall set/nil t1) (forall set/nil t2)) inner)))))

(** ## Simplify recursive, but simply **)

(defn find-recursives [type]
    (type/fold
        []
            (fn [res type]
            (match type
                (trec name _ inner _) [type ..res]
                _                     res))
            type))

(def types->s (dot (join " ") (map type->s)))

(defn simplify-recursive [type]
    (let [
        recursives (find-recursives type)
        simplify   (fn [type]
                       (loop
                           recursives
                               (fn [recs recur]
                               (match recs
                                   []           type
                                   [one ..rest] (match (equal-modulo-vbls-subst one type)
                                                    (none)       (recur rest)
                                                    (some subst) (type/apply subst one))))))]
        (match recursives
            [] type
            (** Note: we're relying on the fact that type/map-post doesn't traverse into trecs. If it did, this would be somewhat less efficient. **)
            _  (type/map-post simplify type))))

(,
    (dot (dot type->s simplify-recursive) quot-tvar)
        [(,
        (@t (, in (option (, int (option (rec 'a (, int (option 'a))))))))
            "(, in (option (rec 'a (, int (option 'a)))))")
        (,
        (@t (, int (option (rec 'a (, int (option 'a))))))
            "(rec 'a (, int (option 'a)))")])

(** ## Simplify recursive types **)

(deftype simstate
    (snum int)
        (stype type string type int int)
        (srep type))

;(defn simplify-recursive-inner [t rvbl]
    (match t
        (tvar name _)          (if (= (some name) rvbl)
                                   (some (snum 0))
                                       none)
        (tcon _ _)             none
        (tapp target arg l)    (match (simplify-recursive-inner target rvbl)
                                   (some (snum n))                    (some (snum (+ n 1)))
                                   (some (stype _ _ _ 0 _))           (none)
                                   (some (stype t2 name inner 1 max)) (if (type= (tapp t2 arg l) inner)
                                                                          (some (stype (tvar name l) name inner max max))
                                                                              (none))
                                   (some (stype t2 name inner n max)) (some (stype (tapp t2 arg l) name inner (- n 1) max))
                                   (some (srep target))               (match (simplify-recursive-inner arg rvbl)
                                                                          (some (srep arg))                (some (srep (tapp target arg l)))
                                                                          (some (stype t2 name inner 1 _)) (some (srep (tapp target (trec name l inner l) l)))
                                                                          (some (stype t2 name inner _ _)) (some
                                                                                                               (srep
                                                                                                                   (tapp
                                                                                                                       target
                                                                                                                           (type/apply (map/from-list [(, name (trec name l inner l))]) t2)
                                                                                                                           l)))
                                                                          (none)                           (some (srep (tapp target arg l)))
                                                                          _                                (fatal "simplyfing down both arms somehow..."))
                                   (none)                             (match (simplify-recursive-inner arg rvbl)
                                                                          (some (snum n))                    (some (snum (+ n 1)))
                                                                          (some (stype _ _ _ 0 _))           (none)
                                                                          (some (stype t2 name inner 1 max)) (if (type= (tapp target t2 l) inner)
                                                                                                                 (some (stype (tvar name l) name inner max max))
                                                                                                                     (some
                                                                                                                     (srep
                                                                                                                         (tapp
                                                                                                                             target
                                                                                                                                 (type/apply (map/from-list [(, name (trec name l inner l))]) t2)
                                                                                                                                 l))))
                                                                          (some (stype t2 name inner n max)) (some (stype (tapp target t2 l) name inner (- n 1) max))
                                                                          (some (srep arg))                  (some (srep (tapp target arg l)))
                                                                          (none)                             (none)))
        (trec name nl inner l) (match (simplify-recursive-inner inner (some name))
                                   (none)          (none)
                                   (some (snum n)) (some (stype (tvar name l) name inner n n))
                                   (some _)        (fatal "why stype at rec?"))
        _                      none))

(defn simplify-recursive-inner [t rvbl]
    (match t
        (tvar name _)          (if (= (some name) rvbl)
                                   (some (snum 0))
                                       none)
        (tcon _ _)             none
        (tapp target arg l)    (match (simplify-recursive-inner target rvbl)
                                   (some (snum n))                  (some (snum (+ n 1)))
                                   (some (stype _ _ _ 0 _))         (none)
                                   (some (stype t2 name inner 1 _)) (if (type= (tapp t2 arg l) inner)
                                                                        (some (srep (trec name l inner l)))
                                                                            (none))
                                   (some (stype t2 name inner n _)) (some (stype (tapp t2 arg l) name inner (- n 1) 0))
                                   (some (srep target))             (match (simplify-recursive-inner arg rvbl)
                                                                        (some (srep arg)) (some (srep (tapp target arg l)))
                                                                        (none)            (some (srep (tapp target arg l)))
                                                                        _                 (fatal "simplyfing down both arms somehow..."))
                                   (none)                           (match (simplify-recursive-inner arg rvbl)
                                                                        (some (snum n))                  (some (snum (+ n 1)))
                                                                        (some (stype _ _ _ 0 _))         (none)
                                                                        (some (stype t2 name inner 1 _)) (if (type= (tapp target t2 l) inner)
                                                                                                             (some (srep (trec name l inner l)))
                                                                                                                 (none))
                                                                        (some (stype t2 name inner n _)) (some (stype (tapp target t2 l) name inner (- n 1) 0))
                                                                        (some (srep arg))                (some (srep (tapp target arg l)))
                                                                        (none)                           (none)))
        (trec name nl inner l) (match (simplify-recursive-inner inner (some name))
                                   (none)          (none)
                                   (some (snum n)) (some (stype (tvar name l) name inner n 0))
                                   (some _)        (fatal "why stype at rec?"))
        _                      none))

(defn simplify-recursive2 [type]
    (match (simplify-recursive-inner type none)
        (some (srep t))                 t
        (some (stype t name inner _ _)) (type/apply (map/from-list [(, name (trec name -1 inner -1))]) t)
        _                               type))

;((** No-op for now... I think want to solve this a different way... **)
    defn simplify-recursive [type]
    type)

(type->s (quot-tvar (@t (, int (option (rec 'a (, int (option 'a))))))))

(type->s
    (simplify-recursive
        (quot-tvar (@t (, int (option (rec 'a (, int (option 'a)))))))))

(type->s
    (simplify-recursive
        (quot-tvar (@t (, in (option (, int (option (rec 'a (, int (option 'a)))))))))))

(defn dot [f g x] (f (g x)))

(** ## Unify recursive types **)

(typealias recstate (, (map string type) (list (, type type)) int))

(defn is-rec-pair [t1 t2]
    (match (, t1 t2)
        (, (trec _ _ _ _) _) true
        (, _ (trec _ _ _ _)) true
        _                    false))

(defn has-inf-recursion [t1 t2 pairs]
    (any
        (fn [(, a b)]
            (if (type= t1 a)
                (type= t2 b)
                    false))
            pairs))

(defn lookup-rec [t lookup]
    (match t
        (tvar name l) (match (map/get lookup name)
                          (some v) (let-> [v (type/apply-> v)] (<- (some v)))
                          _        (<- none))
        _             (<- none)))

(defn add-rec [lookup t]
    (match t
        (trec name _ inner _) (, (map/set lookup name inner) inner)
        _                     (, lookup t)))

(defn equal-modulo-vbls [t1 t2]
    (let [(, (, _ subst _) res) (state-f (unify t1 t2 -1) state/nil)]
        (match res
            (ok _) (all
                       (fn [(, _ v)]
                           (match v
                               (tvar _ _) true
                               _          false))
                           (map/to-list subst))
            _      false)))

((** SO the cool thing here is that if you apply the subst to the (first) type, it will translate all the variables correctly so that it will be equivalent to the (second) type. This is useful in recursive type reduction, where two (equivalent) types nevertheless have different structure. **)
    defn equal-modulo-vbls-subst [t1 t2]
    (let [(, (, _ subst _) res) (state-f (unify t1 t2 -1) state/nil)]
        (match res
            (ok _) (if (all
                       (fn [(, _ v)]
                           (match v
                               (tvar _ _) true
                               _          false))
                           (map/to-list subst))
                       (some subst)
                           (none))
            _      (none))))

(defn all [f lst]
    (match lst
        []           true
        [one ..rest] (if (f one)
                         (all f rest)
                             false)))

(defn check-recursion [t1 t2 (, lookup pairs count)]
    (let [
        (, t1 t2 lookup pairs) (if (is-rec-pair t1 t2)
                                   (if (has-inf-recursion t1 t2 pairs)
                                       (fatal "infinite recursion looks like")
                                           (let [
                                           (, lookup t1) (add-rec lookup t1)
                                           (, lookup t2) (add-rec lookup t2)]
                                           (, t1 t2 lookup [(, t1 t2) ..pairs])))
                                       (, t1 t2 lookup pairs))]
        (let-> [
            r1 (lookup-rec t1 lookup)
            r2 (lookup-rec t2 lookup)]
            (<-
                (match (, r1 r2)
                    (, (some t1) (some t2)) (if (equal-modulo-vbls t1 t2)
                                                (, (tcon "$recur" -1) (tcon "$recur" -1) (, lookup pairs count))
                                                    (, t1 t2 (, lookup pairs (+ 1 count))))
                    (, (some t1) (none))    (, t1 t2 (, lookup pairs (+ 1 count)))
                    (, (none) (some t2))    (, t1 t2 (, lookup pairs (+ 1 count)))
                    _                       (, t1 t2 (, lookup pairs count)))))))

(defn unify-inner [t1 t2 recstate l]
    (let-> [(, t1 t2 recstate) (check-recursion t1 t2 recstate)]
        (match (, t1 t2)
            (, (tvar var l) t)                       (var-bind var t l)
            (, t (tvar var l))                       (var-bind var t l)
            (, (tcon a la) (tcon b lb))              (if (= a b)
                                                         (<- ())
                                                             (<-mismatch t1 t2))
            (, (trow f1 s1 k1 l) (trow f2 s2 k2 l2)) (if (!= k1 k2)
                                                         (<-err "enum and record dont match")
                                                             (unify-trows f1 s1 k1 f2 s2 k2 recstate l))
            (, (tapp t1 a1 _) (tapp t2 a2 _) )       (let-> [
                                                         ()    (unify-inner t1 t2 recstate l)
                                                         subst <-subst
                                                         ()    (unify-inner
                                                                   (type/apply subst a1)
                                                                       (type/apply subst a2)
                                                                       recstate
                                                                       l)]
                                                         (<- ()))
            _                                        (<-mismatch t1 t2))))

(defn var-bind [var type l]
    (match type
        (tvar v _) (if (= var v)
                       (<- ())
                           (let-> [_ (subst-> (one-subst var type))] (<- ())))
        _          (if (set/has (type/free type) var)
                       (let-> [_ (subst-> (one-subst var (trec var l type l)))] (<- ()))
                           ;(<-err
                           "Cycle found while unifying type with type variable. ${var} is found in ${(type->s type)}")
                           (let-> [_ (subst-> (one-subst var type))] (<- ())))))

(defn one-subst [var type] (map/from-list [(, var type)]))

(,
    test-unify
        [(, (, (@t abc) (@t 'a)) (ok (, (tcon "abc" 15601) (tcon "abc" 15601)))) (,  )])

(def test-unify
    (fn [(, t1 t2)]
        (run/nil->
            (let-> [
                t1    (<- (quot-tvar t1))
                t2    (<- (quot-tvar t2))
                ()    (unify t1 t2 -1)
                subst <-subst]
                (<- (, (type/apply subst t1) (type/apply subst t2)))))))

(defn quot-tvar [t]
    (match t
        (tvar _ _)               t
        (tcon name l)            (if (starts-with "'" name)
                                     (tvar name l)
                                         t)
        (tapp target arg l)      (tapp (quot-tvar target) (quot-tvar arg) l)
        (trec name nl type l)    (trec name nl (quot-tvar type) l)
        (trow fields spread k l) (trow
                                     (map (fn [(, name type)] (, name (quot-tvar type))) fields)
                                         (match spread
                                         (none)   (none)
                                         (some t) (some (quot-tvar t)))
                                         k
                                         l)))

(def starts-with
    (eval "(prefix) => (str) => str.startsWith(prefix)"))

(** ## trow unification **)

(defn identify-unique [fields1 spread1 fields2 spread2 recstate k]
    (let [
        (, map1 spread1) (deep-map fields1 spread1 k)
        (, map2 spread2) (deep-map fields2 spread2 k)
        (, u1 shared u2) (partition-keys map1 map2)]
        (let-> [_ (map-> (fn [(, key t1 t2)] (unify-inner t1 t2 recstate -1)) shared)]
            (<- (, u1 spread1 u2 spread2)))))

(defn filter [f lst]
    (match lst
        []           []
        [one ..rest] (if (f one)
                         [one ..(filter f rest)]
                             (filter f rest))))

(defn partition [f lst]
    (loop
        (, lst [] [])
            (fn [(, lst yes no) recur]
            (match lst
                []           (, yes no)
                [one ..rest] (if (f one)
                                 (recur (, rest [one ..yes] no))
                                     (recur (, rest yes [one ..no])))))))

(defn is-some [v]
    (match v
        (some _) true
        _        false))

(defn not [x]
    (if x
        false
            true))

(defn partition-keys [map1 map2]
    (let [
        (, shared unique) (loop
                              (, (map/to-list map1) [] [])
                                  (fn [(, items shared unique) recur]
                                  (match items
                                      []                     (, shared unique)
                                      [(, key value) ..rest] (match (map/get map2 key)
                                                                 (some value2) (recur (, rest [(, key value value2) ..shared] unique))
                                                                 _             (recur (, rest shared [(, key value) ..unique]))))))]
        (,
            unique
                shared
                (foldl
                []
                    (map/to-list map2)
                    (fn [unique (, key value)]
                    (match (map/get map1 key)
                        (none) [(, key value) ..unique]
                        _      unique))))))

(partition-keys
    (map/from-list [(, 1 2) (, 3 4)])
        (map/from-list [(, 1 3) (, 4 5) (, 5 6)]))

(defn deep-map [fields spread k]
    (let [map (map/from-list fields)]
        (match spread
            (some (trow fields spread k2 l)) (if (!= k2 k)
                                                 (fatal "wrong kind")
                                                     (let [(, map2 spread) (deep-map fields spread k)]
                                                     (, (map/merge map map2) spread)))
            _                                (, map spread))))

(defn wrap-ok [t] (let-> [v t] (<- (some v))))

(defn unify-trows [f1 s1 k1 f2 s2 k2 recstate l]
    (let-> [
        (, u1 s1 u2 s2) (identify-unique f1 s1 f2 s2 recstate k1)
        open            (<-
                            (match (, s1 s2)
                                (, (some _) (some _)) true
                                _                     false))
        _               (match (, s1 u2)
                            (, _ [])        (<- ())
                            (, (some s1) _) (let-> [
                                                v2 (if open
                                                       (wrap-ok (new-type-var "row" l))
                                                           (<- none))]
                                                (unify-inner s1 (trow u2 v2 k1 l) recstate l))
                            _               (<-err "unique fields on the right but no spread on the left"))
        _               (match (, s2 u1)
                            (, _ [])        (<- ())
                            (, (some s2) _) (let-> [
                                                v1 (if open
                                                       (wrap-ok (new-type-var "row" l))
                                                           (<- none))]
                                                (unify-inner s2 (trow u1 v1 k2 l) recstate l))
                            _               (<-err "unique fields on the left but no spread on the right"))]
        (<- ())))

(** ## Inference
    Here are the functions that we'll be using most often when writing the inference code (summarized here as a refresher):
    - infer/expr tenv expr - takes an expression, returns a type
    - unify t1 t2  - compares two types that need to be equivalent, and (a) if they can't be unified, throws an error, or (b) if they can be, adds the resulting substitutions to the current state
    - type/apply-> type - applies the current substitution map (from state) to the given type, which updates type variables with updated resolved types. **)

(** ## Expressions **)

(defn infer/prim [prim]
    (match prim
        (pint _ l)  (tcon "int" l)
        (pbool _ l) (tcon "bool" l)))

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
        ;old
        ;(subst-reset-> map/nil)
        type (infer/expr-inner tenv expr)
        ;new
        ;(subst-reset-> old)
        ;()
        ;(subst-> new)
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
        (elet _ _ l)    l
        (erecord _ _ l) l
        (eenum _ _ _ l) l
        (eaccess _ _ l) l))

(defn record-if-generic [(forall free t) l]
    (match (set/to-list free)
        [] (<- ())
        (** If the variable we've found is generic, we want to record the type "pre-specialization" so we can show that on hover as well. **)
        _  (record-type-> t l true)))

(def is-earmuffs
    (eval "v => v.startsWith('*') && v.endsWith('*')"))

(defn infer/expr-inner [tenv expr]
    (match expr
        (erecord spread items l)                 (let-> [
                                                     spread (match spread
                                                                (none)              (<- none)
                                                                (some (, expr end)) (let-> [type (infer/expr tenv expr)] (<- (some (, type end)))))
                                                     items  (map->
                                                                (fn [(, name value)]
                                                                    (let-> [value (infer/expr tenv value)] (<- (, name value))))
                                                                    items)
                                                     spread (match spread
                                                                (none)                  (<- none)
                                                                (some (, spread false)) (let-> [
                                                                                            t (new-type-var "record" l)
                                                                                            _ (unify (trow items (some t) (rrecord) l) spread l)
                                                                                            t (type/apply-> t)]
                                                                                            (<- (some t)))
                                                                (some (, spread true))  (<- (some spread)))]
                                                     (type/apply-> (trow items spread (rrecord) l)))
        (eaccess target [(, attr al)] l)         (match target
                                                     (none)             (let-> [
                                                                            t (new-type-var "record" l)
                                                                            a (new-type-var attr l)
                                                                            e (new-type-var "effects" l)]
                                                                            (<- (tfn e (trow [(, attr a)] (some t) (rrecord) l) a l)))
                                                     (some (, name nl)) (let-> [
                                                                            target (match (tenv/resolve tenv name)
                                                                                       (none)        (<-missing name nl)
                                                                                       (some scheme) (let-> [() (record-if-generic scheme l)] (instantiate scheme nl)))
                                                                            target (type/apply-> target)
                                                                            t      (new-type-var "record" l)
                                                                            at     (new-type-var attr al)
                                                                            _      (unify target (trow [(, attr at)] (some t) (rrecord) l) l)]
                                                                            (type/apply-> at)))
        (eaccess target _ l)                     (fatal "not yet")
        (eenum tag nl arg l)                     (let-> [
                                                     t   (new-type-var tag nl)
                                                     arg (match arg
                                                             (none)     (<- (tcon "()" nl))
                                                             (some arg) (infer/expr tenv arg))]
                                                     (<- (trow [(, tag arg)] (some t) (renum) l)))
        (evar name l)                            (if (is-earmuffs name)
                                                     (let-> [
                                                         effects (match (tenv/resolve tenv "(effects)")
                                                                     (none)              (<-missing "(effects)" l)
                                                                     (some (forall _ t)) (<- t))
                                                         result  (new-type-var name l)
                                                         t       (new-type-var "effects-rest" l)
                                                         _       (unify effects (trow [(, name result)] (some t) (rrecord) l) l)]
                                                         (type/apply-> result))
                                                         (match (tenv/resolve tenv name)
                                                         (none)        (<-missing name l)
                                                         (some scheme) (let-> [() (record-if-generic scheme l)] (instantiate scheme l))))
        (eprim prim _)                           (<- (infer/prim prim))
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
                                                     effects   (new-type-var "effects-lam" al)
                                                     ()        (record-type-> arg-type al false)
                                                     bound-env (<-
                                                                   (tenv/with-type
                                                                       (tenv/with-type tenv arg (forall set/nil arg-type))
                                                                           "(effects)"
                                                                           (forall set/nil effects)))
                                                     body-type (infer/expr bound-env body)
                                                     effects   (type/apply-> effects)
                                                     arg-type  (type/apply-> arg-type)]
                                                     (<- (tfn effects arg-type body-type l)))
        (** With more complex patterns (that aren't just a variable name), there might be multiple "names" that need to get added to the type environment, so those are returned as the scope map, along with a type for the argument.
            Other than that, it's the same as the simple case. **)
        (elambda [pat] body l)                   (let-> [
                                                     (, arg-type scope) (infer/pattern tenv pat)
                                                     effects            (new-type-var "effects" l)
                                                     bound-env          (<-
                                                                            (tenv/with-type
                                                                                (tenv/with-scope tenv scope)
                                                                                    "(effects)"
                                                                                    (forall set/nil effects)))
                                                     body-type          (infer/expr bound-env body)
                                                     arg-type           (type/apply-> arg-type)
                                                     effects            (type/apply-> effects)
                                                     ()                 (check-exhaustiveness tenv arg-type [pat] l)]
                                                     (type/apply-> (tfn effects arg-type body-type l)))
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
                                                     effects     (match (tenv/resolve tenv "(effects)")
                                                                     (none)              (<-missing "(effects)" l)
                                                                     (some (forall _ t)) (<- t))
                                                     _           (unify target-type (tfn effects arg-type result-var l) l)
                                                     v           (type/apply-> target-type)
                                                     e           (type/apply-> effects)]
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
                                                     scheme      (<- (generalize applied-env value-type))
                                                     bound-env   (<- (tenv/with-type applied-env name scheme))]
                                                     (infer/expr bound-env body))
        (** For non-pvar patterns, it's almost exactly the same, but we don't allow produced type variables to be generic. If we did, things like (fn [x] (let [(, a b) x] a) would return an "unbound" type variable: it would be inferred as forall a, b; a -> b. **)
        (elet [(, pat value)] body l)            (let-> [
                                                     (, type scope) (infer/pattern tenv pat)
                                                     value-type     (infer/expr tenv value)
                                                     ()             (unify type value-type l)
                                                     scope          (scope/apply-> scope)
                                                     bound-env      (<- (tenv/with-scope tenv scope))
                                                     body-type      (infer/expr bound-env body)
                                                     type           (type/apply-> type)
                                                     ()             (check-exhaustiveness tenv type [pat] l)]
                                                     (type/apply-> body-type))
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
    (fn [x]
        (run/nil->
            (let-> [e (new-type-var "effects-top" -1)]
                (infer/expr
                    (tenv/with-type benv-with-pair "(effects)" (forall set/nil e))
                        x))))
        [(,
        (@ (fn [x] (+ x)))
            (ok
            (tapp
                (tapp
                    (tapp (tcon "->" 23093) (tvar "effects-lam:2" 23099) 23093)
                        (tcon "int" -1)
                        23093)
                    (tapp
                    (tapp (tapp (tcon "->" -1) (tvar "effect:1" -1) -1) (tcon "int" -1) -1)
                        (tcon "int" -1)
                        -1)
                    23093)))
        (,
        (@
            (fn [x]
                (match x
                    'ho  1
                    'hum 2
                    'hi  3
                    )))
            (ok
            (tapp
                (tapp
                    (tapp (tcon "->" 16685) (tvar "effects-lam:2" 16690) 16685)
                        (trow
                        [(, "ho" (tcon "()" 16677))]
                            (some
                            (trow
                                [(, "hum" (tcon "()" 16679))]
                                    (some
                                    (trow
                                        [(, "hi" (tcon "()" 16681))]
                                            (some (trow [] (none) (renum) -1))
                                            (renum)
                                            16681))
                                    (renum)
                                    16679))
                            (renum)
                            16677)
                        16685)
                    (tcon "int" 16678)
                    16685)))
        (,
        (@
            (match 1
                2 3))
            (err
            (terr
                "Match not exhaustive 17638: \nMissing _ : The infinite type int requires a catchall"
                    [])))
        (,
        (@
            (match (some 1)
                (none) 2))
            (err
            (terr
                "Match not exhaustive 17655: \nMissing some : Case not handled"
                    [])))
        (,
        (@
            (match (some [])
                (some [1 2 .._]) 1
                (some [a .._])   2))
            (err
            (terr
                "Match not exhaustive 17689: \nMissing some nil : Case not handled\nMissing none : Case not handled"
                    [])))
        (,
        (@
            (match (, 1 none)
                (, _ (none)) 1))
            (err
            (terr
                "Match not exhaustive 17736: \nMissing , _ some : Case not handled"
                    [])))
        (,
        (@ (fn [(some x)] x))
            (err
            (terr
                "Match not exhaustive 18091: \nMissing none : Case not handled"
                    [])))
        (,
        (@ (fn [('hi x)] x))
            (ok
            (tapp
                (tapp
                    (tapp (tcon "->" 18110) (tvar "effects:3" 18110) 18110)
                        (trow
                        [(, "hi" (tvar "x:1" 18115))]
                            (some (trow [] (none) (renum) -1))
                            (renum)
                            18113)
                        18110)
                    (tvar "x:1" 18115)
                    18110)))
        (, (@ 10) (ok (tcon "int" 4512)))
        (, (@ hi) (err (tmissing [(, "hi" 4531)])))
        (, (@ {a 2}) (ok (trow [(, "a" (tcon "int" 14459))] (none) (rrecord) 14456)))
        (,
        (@ {..{a 2 b 1} b 3})
            (ok
            (trow
                [(, "b" (tcon "int" 15646))]
                    (some (trow [(, "a" (tcon "int" 15644))] (none) (rrecord) 15637))
                    (rrecord)
                    15637)))
        (,
        (@ (fn [x] "${x.a}"))
            (ok
            (tapp
                (tapp
                    (tapp (tcon "->" 15904) (tvar "effects-lam:2" 15907) 15904)
                        (trow
                        [(, "a" (tcon "string" 15908))]
                            (some (tvar "record:3" 15912))
                            (rrecord)
                            15912)
                        15904)
                    (tcon "string" 15908)
                    15904)))
        (,
        (@ (fn [x] "${x.a} ${x.b}"))
            (ok
            (tapp
                (tapp
                    (tapp (tcon "->" 16240) (tvar "effects-lam:2" 16243) 16240)
                        (trow
                        [(, "a" (tcon "string" 16244))]
                            (some
                            (trow
                                [(, "b" (tcon "string" 16244))]
                                    (some (tvar "row:7" 16248))
                                    (rrecord)
                                    16248))
                            (rrecord)
                            16248)
                        16240)
                    (tcon "string" 16244)
                    16240)))
        (,
        (@ 'hi)
            (ok
            (trow [(, "hi" (tcon "()" 14484))] (some (tvar "hi:1" 14484)) (renum) 14484)))
        (,
        (@ ('hi 2))
            (ok
            (trow [(, "hi" (tcon "int" 14524))] (some (tvar "hi:1" 14523)) (renum) 14522)))
        (, (@ (let [x 10] x)) (ok (tcon "int" 4547)))
        (,
        (@ (, 1 2))
            (ok (tapp (tapp (tcon "," -1) (tcon "int" 4561) -1) (tcon "int" 4562) -1)))
        (,
        (@ (fn [x] (let [(, a b) x] a)))
            (ok
            (tapp
                (tapp
                    (tapp (tcon "->" 4689) (tvar "effects-lam:2" 4694) 4689)
                        (tapp (tapp (tcon "," -1) (tvar "a:3" 4698) -1) (tvar "b:4" 4698) -1)
                        4689)
                    (tvar "a:3" 4698)
                    4689)))
        (,
        (@ (let [id (fn [x] x)] (, (id 2) (id true))))
            (ok (tapp (tapp (tcon "," -1) (tcon "int" 4761) -1) (tcon "bool" 4764) -1)))
        (,
        (@ (fn [id] (, (id 2) (id true))))
            (err
            (twrap
                (ttypes
                    (forall
                        (map/from-list [])
                            (tapp
                            (tapp
                                (tapp (tcon "->" 4820) (tvar "effects-lam:2" 4817) 4820)
                                    (tcon "int" 4822)
                                    4820)
                                (tvar "result:7" 4820)
                                4820))
                        (forall
                        (map/from-list [])
                            (tapp
                            (tapp
                                (tapp (tcon "->" 4823) (tvar "effects-lam:2" 4817) 4823)
                                    (tcon "bool" 4825)
                                    4823)
                                (tvar "result:8" 4823)
                                4823)))
                    (ttypes
                    (forall (map/from-list []) (tcon "int" 4822))
                        (forall (map/from-list []) (tcon "bool" 4825))))))
        (,
        (@ (fn [arg] (let [(, id _) arg] (, (id 2) (id true)))))
            (err
            (twrap
                (ttypes
                    (forall
                        (map/from-list [])
                            (tapp
                            (tapp
                                (tapp (tcon "->" 4847) (tvar "effects-lam:2" 4836) 4847)
                                    (tcon "int" 4849)
                                    4847)
                                (tvar "result:11" 4847)
                                4847))
                        (forall
                        (map/from-list [])
                            (tapp
                            (tapp
                                (tapp (tcon "->" 4850) (tvar "effects-lam:2" 4836) 4850)
                                    (tcon "bool" 4852)
                                    4850)
                                (tvar "result:12" 4850)
                                4850)))
                    (ttypes
                    (forall (map/from-list []) (tcon "int" 4849))
                        (forall (map/from-list []) (tcon "bool" 4852))))))
        (, (@ ((fn [x] x) 2)) (ok (tcon "int" 4866)))
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
                    (tapp (tcon "->" 5085) (tvar "effects-lam:2" 5088) 5085)
                        (tapp (tapp (tcon "," -1) (tcon "int" 5094) -1) (tcon "int" 11381) -1)
                        5085)
                    (tcon "int" 11381)
                    5085)))
        (,
        (@
            (match 1
                1 true
                2 2))
            (err
            (twrap
                (ttypes
                    (forall (map/from-list []) (tcon "int" 5145))
                        (forall (map/from-list []) (tcon "bool" 5143)))
                    (ttypes
                    (forall (map/from-list []) (tcon "int" 5145))
                        (forall (map/from-list []) (tcon "bool" 5143))))))
        (,
        (@
            (fn [x]
                (match x
                    (, 2 _) 10
                    (, m _) m)))
            (ok
            (tapp
                (tapp
                    (tapp (tcon "->" 6436) (tvar "effects-lam:2" 6440) 6436)
                        (tapp (tapp (tcon "," -1) (tcon "int" 6446) -1) (tvar "b:5" 6444) -1)
                        6436)
                    (tcon "int" 6447)
                    6436)))
        (, (@ (@ hi)) (ok (tcon "expr" 6701)))
        (, (@ "hi") (ok (tcon "string" 6785)))
        (,
        (@ "hi ${1}")
            (err
            (twrap
                (ttypes
                    (forall (map/from-list []) (tcon "int" 6850))
                        (forall (map/from-list []) (tcon "string" 6848)))
                    (ttypes
                    (forall (map/from-list []) (tcon "int" 6850))
                        (forall (map/from-list []) (tcon "string" 6848))))))
        (,
        (@
            (fn [x]
                (match x
                    []            0
                    [(, a b) .._] 0)))
            (ok
            (tapp
                (tapp
                    (tapp (tcon "->" 13860) (tvar "effects-lam:2" 13863) 13860)
                        (tapp
                        (tcon "list" 12719)
                            (tapp (tapp (tcon "," -1) (tvar "a:6" 13870) -1) (tvar "b:7" 13870) -1)
                            12723)
                        13860)
                    (tcon "int" 13868)
                    13860)))])

(** ## Patterns **)

((** Here we are producing (1) a type for the pattern, and (2) a "scope" mapping of names to type variables. **)
    defn infer/pattern [tenv pattern]
    (match pattern
        (pvar name l)             (let-> [
                                      v  (new-type-var name l)
                                      () (record-type-> v l false)]
                                      (<- (, v (map/from-list [(, name (forall set/nil v))]))))
        (pany l)                  (let-> [v (new-type-var "any" l)] (<- (, v map/nil)))
        (pstr _ l)                (<- (, (tcon "string" l) map/nil))
        (pprim (pbool _ _) l)     (<- (, (tcon "bool" l) map/nil))
        (pprim (pint _ _) l)      (<- (, (tcon "int" l) map/nil))
        (precord fields spread l) (let-> [
                                      tfields            (map->
                                                             (fn [(, name pat)]
                                                                 (let-> [(, arg scope) (infer/pattern tenv pat)]
                                                                     (<- (, (, name arg) scope))))
                                                                 fields)
                                      (, tfields scopes) (<- (unzip tfields))
                                      (, spread sscope)  (match spread
                                                             (none)   (let-> [t (new-type-var "spread" l)] (<- (, t map/nil)))
                                                             (some t) (infer/pattern tenv t))]
                                      (<-
                                          (,
                                              (trow tfields (some spread) rrecord l)
                                                  (foldl sscope scopes map/merge))))
        (penum tag tl arg l)      (let-> [
                                      (, carg scope) (match arg
                                                         (some arg) (infer/pattern tenv arg)
                                                         _          (<- (, (tcon "()" tl) map/nil)))
                                      t              (new-type-var tag tl)]
                                      (<- (, (trow [(, tag carg)] (some t) renum l) scope)))
        (** This is the only really complex case.
            cannot convert {"id":"8dc25efa-f2e6-431d-b516-a2dcbec00fec","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"instantiate the type constructor","styles":{}}],"children":[]}
            cannot convert {"id":"fbc62acd-aa18-4fde-9aaf-f465cc5b0860","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"infer the types for the pattern arguments","styles":{}}],"children":[]}
            cannot convert {"id":"d4cdaae3-0b80-4226-9b11-306ff6533ea4","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"unify the pattern types with the expected constructor types","styles":{}}],"children":[]}
            cannot convert {"id":"5631b441-770a-402c-b026-d53be33aa320","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"apply any substitutions to the type constructor's \"result\" type","styles":{}}],"children":[]}
            cannot convert {"id":"9de5a662-ca3d-422b-aef1-a621140eebaa","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"merge all the sub scopes together","styles":{}}],"children":[]} **)
        (pcon name _ args l)      (let-> [
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
    defn instantiate-tcon [(tenv _ tcons _ _) name l]
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

(defn filter-> [f items]
    (foldl->
        []
            items
            (fn [res v]
            (let-> [b (f v)]
                (<-
                    (if b
                        [v ..res]
                            res))))))

(defn check-exhaustiveness [tenv target-type patterns l]
    (let-> [
        target-type (type/apply-> target-type)
        matrix      (<-
                        (map
                            (fn [pat] [(pattern-to-ex-pattern tenv (, pat target-type))])
                                patterns))
        missing     (filter->
                        (fn [(, _ missing)]
                            (match missing
                                (mopen vbl) (let-> [_ (unify (tvar vbl -1) (trow [] none (renum) -1) -1)] (<- false))
                                _           (<- true)))
                            (find-missing matrix))]
        (match missing
            []      (<- ())
            missing (<-err
                        "Match not exhaustive ${(int-to-string l)}: \n${(join "\n" (map missing->s missing))}"))
            ;(if (is-exhaustive matrix)
            (<- ())
                (<-err "Match not exhaustive ${(int-to-string l)}"))))

(deftype ex-pattern
    (ex/any)
        (ex/constructor string ex-group (list ex-pattern)))

(deftype ex-group
    (ginf string)
        (gnames (list string) (option string)))

(** ## Enumerating "missing" cases **)

(deftype missing
    (minf string)
        (mname string)
        (mopen string))

(defn missing->s [(, prefix m)]
    "Missing ${(match prefix
        [] ""
        _  "${(join " " prefix)} ")}${(match m
        (minf name)  "_ : The infinite type ${name} requires a catchall"
        (mopen id)   "_ : Open type (tvar ${id}) requires a catchall"
        (mname name) "${name} : Case not handled")}")

(defn map/update [map key f] (map/set map key (f (map/get map key))))

(defn group-rows [matrix]
    (loop
        (, matrix none map/nil [])
            (fn [(, matrix gid by-cstr anys) recur]
            (match matrix
                []                                             (, gid by-cstr anys)
                [[(ex/any) ..row] ..rest]                      (recur (, rest gid by-cstr [row ..anys]))
                [[(ex/constructor id rgid args) ..row] ..rest] (recur
                                                                   (,
                                                                       rest
                                                                           (match gid
                                                                           (none)     (some rgid)
                                                                           (some gid) (if (!= gid rgid)
                                                                                          (fatal "different GIDs in the same matrix")
                                                                                              (some gid)))
                                                                           (map/update
                                                                           by-cstr
                                                                               id
                                                                               (fn [x]
                                                                               (match x
                                                                                   (none)            (, (length args) [(concat [args row])])
                                                                                   (some (, n rows)) (, n [(concat [args row]) ..rows]))))
                                                                           anys))
                [[] .._]                                       (fatal "empty row?")))))

(defn prefix [prefix missings]
    (map (fn [(, pre missing)] (, [prefix ..pre] missing)) missings))

(defn find-missing [matrix]
    (match matrix
        []       []
        [[] .._] []
        _        (let [(, gid by-cstr anys) (group-rows matrix)]
                     (match gid
                         (none)                     (prefix "_" (find-missing anys))
                         (some (ginf name))         (match anys
                                                        [] [(, [] (minf name))]
                                                        _  (prefix name (find-missing anys)))
                         (some (gnames names open)) (let [
                                                        missing-fields (filter (fn [k] (not (is-some (map/get by-cstr k)))) names)
                                                        from-fields    (concat
                                                                           (map
                                                                               (fn [name]
                                                                                   (match (map/get by-cstr name)
                                                                                       (none)            []
                                                                                       (some (, n rows)) (let [args (any-list n)]
                                                                                                             (prefix
                                                                                                                 name
                                                                                                                     (find-missing (concat [rows (map (fn [row] (concat [args row])) anys)]))))))
                                                                                   names))
                                                        from-any       (match (, missing-fields anys)
                                                                           (, [] _) []
                                                                           (, _ []) (map (fn [name] (, [] (mname name))) missing-fields)
                                                                           (, _ _)  (prefix "_" (find-missing anys)))
                                                        from-open      (match (, open anys)
                                                                           (, (none) _)       []
                                                                           (, (some id) [])   [(, [] (mopen id))]
                                                                           (, (some id) anys) (match missing-fields
                                                                                                  [] []
                                                                                                  _  (prefix "_" (find-missing anys))))]
                                                        (concat [from-any from-open from-fields]))))))



(** Processing "patterns" to be legible to the exhaustiveness algorithm **)

(defn pattern-to-ex-pattern [tenv (, pattern type)]
    (match pattern
        (pvar _ _)                  (ex/any)
        (pany _)                    (ex/any)
        (precord pfields pspread l) (match type
                                        (trow fields spread kind l) (let [
                                                                        (, fmap spread) (deep-map fields spread kind)
                                                                        _               (match pspread
                                                                                            (none)            ()
                                                                                            (some (pany _))   ()
                                                                                            (some (pvar _ _)) ()
                                                                                            _                 (fatal "spread pattern must be any or var"))
                                                                        pmap            (map/from-list pfields)]
                                                                        (ex/constructor
                                                                            "record"
                                                                                (gnames ["record"] none)
                                                                                (loop
                                                                                ;  TODO sort these
                                                                                    (map/to-list fmap)
                                                                                    (fn [fields recur]
                                                                                    (match fields
                                                                                        []                    [ex/any]
                                                                                        [(, key type) ..rest] [(match (map/get pmap key)
                                                                                                                  (none)   ex/any
                                                                                                                  (some p) (pattern-to-ex-pattern tenv (, p type)))
                                                                                                                  ..(recur rest)])))))
                                        _                           (fatal "record type not a row"))
        (penum tag tl arg l)        (match type
                                        (trow fields spread kind l) (let [(, map spread) (deep-map fields spread kind)]
                                                                        (match (map/get map tag)
                                                                            (none)      (fatal "enum variant ${tag} not contained in type")
                                                                            (some argt) (ex/constructor
                                                                                            tag
                                                                                                (gnames
                                                                                                (map/keys map)
                                                                                                    (match spread
                                                                                                    (none)             (none)
                                                                                                    (some (tvar id _)) (some id)
                                                                                                    (some t)           (fatal "spread not a tvar?")))
                                                                                                (match arg
                                                                                                (some arg) [(pattern-to-ex-pattern tenv (, arg argt))]
                                                                                                _          []))))
                                        _                           (fatal "enum type not a row"))
        (pstr str _)                (ex/constructor str (ginf "string") [])
        (pprim (pint v _) _)        (ex/constructor (int-to-string v) (ginf "int") [])
        (pprim (pbool v _) _)       (ex/constructor
                                        (if v
                                            "true"
                                                "false")
                                            (gnames ["true" "false"] none)
                                            [])
        (pcon name _ args l)        (let [
                                        (, tname targs)           (tcon-and-args type [] l)
                                        (tenv _ tcons types _)    tenv
                                        (, free-names cargs cres) (match (map/get tcons name)
                                                                      (none)   (fatal "Unknown type constructor ${name}")
                                                                      (some v) v)
                                        ;  do we need to assert that `cres` is the same as `type`? At this point it should be moot...
                                        subst                     (map/from-list (zip free-names targs))]
                                        (ex/constructor
                                            name
                                                (match (map/get types tname)
                                                (some (, _ names)) (gnames (set/to-list names) none)
                                                _                  (fatal "Unknown type ${tname}"))
                                                (map
                                                (pattern-to-ex-pattern tenv)
                                                    (zip args (map (type/apply subst) cargs)))))))

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
                            (deftype (option a)
                                (none)
                                    (some a)))
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
                (gnames ["nil" "cons"] (none))
                [(ex/constructor "2" (ginf "int") [])
                (ex/constructor
                "cons"
                    (gnames ["nil" "cons"] (none))
                    [(ex/any)
                    (ex/constructor
                    "cons"
                        (gnames ["nil" "cons"] (none))
                        [(ex/any) (ex/constructor "nil" (gnames ["nil" "cons"] (none)) [])])])]))
        (,
        (, (@p (, 2 b)) (@t (, 1 2)))
            (ex/constructor
            ","
                (gnames [","] (none))
                [(ex/constructor "2" (ginf "int") []) (ex/any)]))
        (,
        (, (@p {a 2}) (trow [(, "a" tint) (, "b" tbool)] none precord 1))
            (ex/constructor
            "record"
                (gnames ["record"] (none))
                [(ex/constructor "2" (ginf "int") []) (ex/any) (ex/any)]))])

(defn tcon-and-args [type coll l]
    (match type
        (trow _ _ _ _)        (fatal "cant apply a row type")
        (trec name _ inner _) (fatal "cant apply a recursive type?")
        (tvar _ _)            (fatal
                                  "Type not resolved ${(int-to-string l)} it is a tvar at heart. ${(jsonify type)} ${(jsonify coll)}")
        (tcon name _)         (, name coll)
        (tapp target arg _)   (tcon-and-args target [arg ..coll] l)))

(,
    (fn [x] (tcon-and-args x [] 0))
        [(,
        (@t (hi a b (c d)))
            (,
            "hi"
                [(tcon "a" 10046)
                (tcon "b" 10047)
                (tapp (tcon "c" 10049) (tcon "d" 10050) 10048)]))])

(defn fill-list [what num]
    (loop
        num
            (fn [num recur]
            (if (= 0 num)
                []
                    [what ..(recur (- num 1))]))))

(def any-list (fill-list ex/any))

(** A "default matrix" is one where the leading "any"s have been stripped off of each row that starts with an any. Rows that start with a constructor are omitted. **)

(defn default-matrix [matrix]
    (concat
        (map
            (fn [row]
                (match row
                    [(ex/any) ..rest] [rest]
                    _                 []))
                matrix)))

(defn is-exhaustive [matrix]
    (if (is-useful matrix [(ex/any)])
        false
            true))

(** A "specialized matrix" is kind of like "filter". It produces the matrix that would be used if the "head" matches a given constructor. Rows with heads that don't match the constructor are ignored, while rows with "any" heads are expanded to have any "any" for each argument of the constructor. **)

(defn specialized-matrix [constructor arity matrix]
    (concat (map (specialize-row constructor arity) matrix)))

(defn specialize-row [constructor arity row]
    (match row
        []                                    (fatal "Can't specialize an empty row.")
        [(ex/any) ..rest]                     [(concat [(any-list arity) rest])]
        [(ex/constructor name _ args) ..rest] (if (= name constructor)
                                                  [(concat [args rest])]
                                                      [])))

(defn fold-ex-pat [init pat f]
    (match pat
        _ (f init pat)))

(defn fold-ex-pats [init pats f]
    (foldl init pats (fn [init pat] (fold-ex-pat init pat f))))

(defn fold-constructors [init pats f]
    (fold-ex-pats
        init
            pats
            (fn [init pat]
            (match pat
                (ex/constructor name gid args) (f init name gid args)
                _                              init))))

(defn find-gid [heads]
    (fold-constructors
        none
            heads
            (fn [gid _ id _]
            (match gid
                (none)     (some id)
                (some oid) (if (!= oid id)
                               (fatal
                                   "Constructors with different group IDs in the same position.")
                                   (some id))))))

((** This checks the "head" of each row of the matrix, finds the common type, and, if each constructor for that type is represented in the matrix, returns a mapping from constructor name => arity. **)
    defn args-if-complete [matrix]
    (let [
        heads (matrix-heads matrix)
        gid   (find-gid heads)]
        (match gid
            (none)     map/nil
            (some gid) (let [
                           found (map/from-list
                                     (fold-constructors
                                         []
                                             heads
                                             (fn [found id _ args] [(, id (length args)) ..found])))]
                           (match gid
                               (ginf _)                     map/nil
                               (gnames constrs (some open)) map/nil
                               (gnames constrs _)           (loop
                                                                constrs
                                                                    (fn [constrs recur]
                                                                    (match constrs
                                                                        []          found
                                                                        [id ..rest] (match (map/get found id)
                                                                                        (none)   map/nil
                                                                                        (some _) (recur rest))))))))))

(defn matrix-heads [matrix]
    (map
        (fn [row]
            (match row
                []         (fatal "is-complete called with empty row")
                [head .._] head))
            matrix))

(defn is-useful [matrix row]
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
                                                                    (specialized-matrix id (length args) matrix)
                                                                        (concat [args rest]))
                                     (ex/any)                   (match (map/to-list (args-if-complete matrix))
                                                                    []   (match (default-matrix matrix)
                                                                             []       true
                                                                             defaults (is-useful defaults rest))
                                                                    alts (any
                                                                             (fn [(, id alt)]
                                                                                 (is-useful
                                                                                     (specialized-matrix id alt matrix)
                                                                                         (concat [(any-list alt) rest])))
                                                                                 alts))))))

(** ## Adding Top-level Items to the Type Environment **)

(defn add/def [tenv name nl expr l]
    (let-> [
        self      (new-type-var name nl)
        bound-env (<- (tenv/with-type tenv name (forall set/nil self)))
        type      (infer/expr bound-env expr)
        self      (type/apply-> self)
        ()        (unify self type l)
        type      (type/apply-> type)
        type      (restrict-poly-enum type)]
        (<- (tenv/with-type tenv/nil name (generalize tenv type)))))

(,
    (fn [(tdef name nl expr l)]
        (let [
            (tenv values _ _ _) (err-to-fatal (run/nil-> (add/def builtin-env name nl expr l)))]
            (map/to-list values)))
        [(, (@! (def x 10)) [(, "x" (forall set/nil (tcon "int" 3024)))])
        (,
        (@! (def x {}))
            [(, "x" (forall (map/from-list []) (trow [] (none) (rrecord) 14145)))])
        (,
        (@! (def x ('hi 10)))
            [(,
            "x"
                (forall
                (map/from-list [])
                    (trow
                    [(, "hi" (tcon "int" 18552))]
                        (some (trow [] (none) (renum) -1))
                        (renum)
                        18550)))])
        (,
        (@! (defn id [x] x))
            [(,
            "id"
                (forall
                (set/from-list ["effects-lam:2" "x:1"])
                    (tapp
                    (tapp
                        (tapp (tcon "->" 3044) (tvar "effects-lam:2" 3048) 3044)
                            (tvar "x:1" 3048)
                            3044)
                        (tvar "x:1" 3048)
                        3044)))])
        (,
        (@! (defn rec [x] (let [m (rec x)] (+ x m))))
            [(,
            "rec"
                (forall
                (set/from-list ["effects-lam:2"])
                    (tapp
                    (tapp
                        (tapp (tcon "->" 3146) (tvar "effects-lam:2" 3150) 3146)
                            (tcon "int" -1)
                            3146)
                        (tcon "int" -1)
                        3146)))])])

(def test-infer-str
    (fn [(tdef name nl expr l)]
        (let [
            (tenv values _ _ _) (err-to-fatal
                                    (run/nil->
                                        (let-> [
                                            (, tenv _) (add/stmts
                                                           tenv/nil
                                                               [(@!
                                                               (deftype (option a)
                                                                   (some a)
                                                                       (none)))
                                                               (@!
                                                               (deftype (, a b)
                                                                   (, a b)))])]
                                            (add/def tenv name nl expr l))))]
            (match (map/get values name)
                (some t) (scheme->s t)
                _        "type not found for ${name}"))))

(test-infer-str
    (@!
        (defn map2 [f (, v rest)]
            (,
                (f v)
                    (match rest
                    (none)      (none)
                    (some rest) (some (map2 f rest)))))))

(,
    test-infer-str
        [(, (@! (def x 10)) "int")
        (,
        (@!
            (defn map2 [f (, v rest)]
                (,
                    (f v)
                        (match rest
                        (none)      (none)
                        (some rest) (some (map2 f rest))))))
            "forall effects-lam:2 a:3 result:12 : (fn [{effects-lam:2}(fn [{effects-lam:2}a:3] result:12) {effects-lam:2}(, a:3 (option (rec a:14 (, a:3 (option a:14)))))] (, result:12 (option (rec a:15 (, result:12 (option a:15))))))")])

(** Ok, but what about mutual recursion? It's actually very similar to the single case; you make a list of type variables, one for each definition, then do inference on each, unifying the result with the type variable, and then apply the final substitution to everything at the end! **)

(defn restrict-poly-enum [t]
    (let [
        (, args res) (fn-args-and-body t)
        free-in      (foldl
                         set/nil
                             (map (fn [(, a b)] (set/merge (type/free a) (type/free b))) args)
                             set/merge)
        vbls         (set/diff (free-spreads res) free-in)]
        (let-> [
            () (do->
                   (fn [vbl] (unify (tvar vbl -1) (trow [] none (renum) -1) -1))
                       (set/to-list vbls))]
            (type/apply-> t))))

(defn map/opt [f v]
    (match v
        (none)   (none)
        (some v) (some (f v))))

(defn type/map [f t]
    (let [rec (type/map f)]
        (f
            (match t
                (tapp a b l)             (tapp (rec a) (rec b) l)
                (trow fields spread k l) (trow (map (fn [(, k v)] (, k (rec v))) fields) (map/opt rec spread) k l)
                _                        t))))

(defn type/map-post [f t]
    (let [rec (type/map f)]
        (match (f t)
            (tapp a b l)             (tapp (rec a) (rec b) l)
            (trow fields spread k l) (trow (map (fn [(, k v)] (, k (rec v))) fields) (map/opt rec spread) k l)
            t                        t)))

(defn type/fold [init f t]
    (f
        (match t
            (tapp a b l)             (type/fold (type/fold init f a) f b)
            (trow fields spread k l) (let [init (foldl init fields (fn [init (, k v)] (type/fold init f v)))]
                                         (match spread
                                             (none)   init
                                             (some v) (type/fold init f v)))
            _                        init)
            t))

(defn free-spreads [t]
    (type/fold
        set/nil
            (fn [vbls t]
            (match t
                (trow _ (some (tvar vbl _)) (renum) _) (set/add vbls vbl)
                _                                      vbls))
            t))

(defn add/defs [tenv defns]
    (let-> [
        ()        (reset-state->)
        names     (<- (map (fn [(, name _)] name) defns))
        locs      (<- (map (fn [(, _ _ _ l)] l) defns))
        vbls      (map-> (fn [(, name nl _)] (new-type-var name nl)) defns)
        bound-env (<-
                      (foldl
                          tenv
                              (zip names (map (forall set/nil) vbls))
                              (fn [tenv (, name vbl)] (tenv/with-type tenv name vbl))))
        types     (map-> (fn [(, _ _ expr _)] (infer/expr bound-env expr)) defns)
        types     (map-> restrict-poly-enum types)
        vbls      (map-> type/apply-> vbls)
        ()        (do->
                      (fn [(, vbl type loc)] (unify vbl type loc))
                          (zip vbls (zip types locs)))
        types     (map-> type/apply-> types)]
        (<-
            (foldl
                tenv/nil
                    (zip names types)
                    (fn [tenv (, name type)]
                    (tenv/with-type
                        tenv
                            name
                            (generalize tenv (simplify-recursive type))))))))

(,
    (fn [x]
        (err-to-fatal
            (run/nil->
                (add/defs
                    builtin-env
                        (map (fn [(tdef name nl body l)] (, name nl body l)) x)))))
        [(,
        [(@! (defn even [x] (let [o (odd x)] (+ x 2))))
            (@! (defn odd [x] (let [e (even x)] 3)))]
            (tenv
            (map/from-list
                [(,
                    "odd"
                        (forall
                        (set/from-list ["effects-lam:3"])
                            (tapp
                            (tapp
                                (tapp (tcon "->" 3821) (tvar "effects-lam:3" 3781) 3821)
                                    (tcon "int" -1)
                                    3821)
                                (tcon "int" 3834)
                                3821)))
                    (,
                    "even"
                        (forall
                        (set/from-list ["effects-lam:3"])
                            (tapp
                            (tapp
                                (tapp (tcon "->" 3776) (tvar "effects-lam:3" 3781) 3776)
                                    (tcon "int" -1)
                                    3776)
                                (tcon "int" -1)
                                3776)))])
                (map/from-list [])
                (map/from-list [])
                (map/from-list [])))])

(defn add/typealias [(tenv values tcons types aliases) name args type]
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
                    (type/con-to-var (set/from-list (map fst args)) type)))))

(defn add/deftype [(tenv _ tcons types aliases) name args constrs l]
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
                        (, name (forall (set/from-list free) (tfns args res l))))
                        parsed-constrs))
                (map/from-list parsed-constrs)
                (map/set
                map/nil
                    name
                    (, (length args) (set/from-list (map fst constrs))))
                map/nil)))

(defn type/con-to-var [vars type]
    (type/map
        (fn [t]
            (match t
                (tcon name l) (if (set/has vars name)
                                  (tvar name l)
                                      t)
                _             t))
            type))

(defn type/con-to-var- [vars type]
    (match type
        (trow _ _ _ _)         (fatal "cant apply a row")
        (trec name nl inner l) (trec name nl (type/con-to-var vars inner) l)
        (tvar _ _)             type
        (tcon name l)          (if (set/has vars name)
                                   (tvar name l)
                                       type)
        (tapp a b l)           (tapp (type/con-to-var vars a) (type/con-to-var vars b) l)))

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
        types                         (map-> (infer/expr (tenv/merge tenv final)) exprs)
        types                         (map-> restrict-poly-enum types)]
        (<- (, final (map simplify-recursive types)))))

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
            "forall effects-lam:2 : (fn [{effects-lam:2}(x int)] int)")
        (,
        (,
            [[(@! (typealias a int))
                (@!
                (deftype lol
                    (elol a)))]]
                "elol")
            "(fn [{effect:0}int] lol)")
        (,
        (,
            [[(@! (typealias alt (, (list pat) expr)))
                (@! (typealias bindgroup (, alt)))
                (@!
                (deftype expr
                    (elet bindgroup expr int)))]
                [(@! (defn x [(elet b _ _)] b))]]
                "x")
            "forall effects:4 : (fn [{effects:4}expr] (, (list pat) expr))")
        (,
        (,
            [[(@! (typealias (a b) (, int b)))
                (@!
                (deftype hi
                    (red int)
                        (blue)
                        (green (a bool))))]]
                "green")
            "(fn [{effect:0}(, int bool)] hi)")
        ])

(** ## Type Environment populated with Builtins **)

(def tbool (tcon "bool" -1))

(defn tmap [k v] (tapp (tapp (tcon "map" -1) k -1) v -1))

(defn toption [arg] (tapp (tcon "option" -1) arg -1))

;(typealias what l)

(defn tlist [arg] (tapp (tcon "list" -1) arg -1))

(defn tset [arg] (tapp (tcon "set" -1) arg -1))

(defn concrete [t] (forall set/nil t))

(defn generic [vbls t] (forall (set/from-list vbls) t))

(defn vbl [k] (tvar k -1))

(defn t, [a b] (tapp (tapp (tcon "," -1) a -1) b -1))

(def tstring (tcon "string" -1))

(def builtin-env
    (let [
        k  (vbl "k")
        v  (vbl "v")
        v2 (vbl "v2")
        kv (generic ["k" "v"])
        kk (generic ["k"])
        a  (vbl "a")
        b  (vbl "b")]
        (tenv
            (map/from-list
                [(, "+" (concrete (tfns [tint tint] tint -1)))
                    (, "-" (concrete (tfns [tint tint] tint -1)))
                    (, ">" (concrete (tfns [tint tint] tbool -1)))
                    (, "<" (concrete (tfns [tint tint] tbool -1)))
                    (, "=" (generic ["k"] (tfns [k k] tbool -1)))
                    (, "!=" (generic ["k"] (tfns [k k] tbool -1)))
                    (, ">=" (concrete (tfns [tint tint] tbool -1)))
                    (, "<=" (concrete (tfns [tint tint] tbool -1)))
                    (, "()" (concrete (tcon "()" -1)))
                    (, "," (generic ["a" "b"] (tfns [a b] (t, a b) -1)))
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
                map/nil)))

(** ## Exporting for the structured editor **)

(** This is a peek under the hood as to how the code in these documents gets "handed off" to the structured editor for use as an evaluator for other documents. It's not really necessary for you to understand it, and it's disabled here in the publicly hosted editor anyway. **)

(defn infer-stmts2 [env stmts]
    (let [
        (, (, _ subst types) result) (state-f (add/stmts env stmts) state/nil)]
        (,
            (match result
                (err e)             (err e)
                (ok (, tenv types)) (ok (, tenv (map (forall set/nil) types))))
                (map
                (fn [(, t l dont-apply)]
                    (if dont-apply
                        (, l (forall set/nil t))
                            (, l (forall set/nil (type/apply subst t)))))
                    types)
                []
                [])))

(defn infer-expr2 [env expr]
    (let [
        (, (, _ subst types) result) (state-f (infer/expr env expr) state/nil)]
        (,
            (match result
                (ok t)  (ok (forall set/nil t))
                (err e) (err e))
                (map
                (fn [(, t l dont-apply)]
                    (if dont-apply
                        (, l (forall set/nil t))
                            (, l (forall set/nil (type/apply subst t)))))
                    types)
                []
                [])))

(eval
    (** env_nil => add_stmt => get_type => type_to_string => type_to_cst => infer_stmts2 => infer2 =>
  ({type: 'fns', env_nil, add_stmt, get_type, type_to_string, type_to_cst, infer_stmts2, infer2})
 **)
        builtin-env
        tenv/merge
        tenv/resolve
        scheme->s
        scheme->cst
        infer-stmts2
        infer-expr2)

