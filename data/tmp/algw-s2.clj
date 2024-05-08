(** ## Type Checker
    Heavily based on the excellent paper [Algorithm W Step-By-Step](https://github.com/wh5a/Algorithm-W-Step-By-Step/blob/master/AlgorithmW.pdf).
    This first version of the type checker is "vanilla algorithm w", and so won't actually be powerful enough to type check our language. We'll follow up by extending it with the ability to handle patterns, match forms, and user-defined types. **)

(** ## Prelude **)

(deftype (option a) (some a) (none))

(deftype (list a) (cons a (list a)) (nil))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(defn map [f values]
    (match values
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

(** ## AST **)

(deftype prim (pint int int) (pbool bool int) (pstr string int))

(deftype stmt (sdef string int expr int) (sexpr expr int))

(deftype expr
    (eprim prim int)
        (evar string int)
        (elambda string expr int)
        (eapp expr (list expr) int)
        (elet (list (, string expr)) expr int))

(deftype type
    (** Note that the first argument to tvar is purely decorative. The second argument is the unique identifier used for substitution, resolution, etc. **)
        (tvar string int int)
        (tapp type type int)
        (tcon string int))

(defn type= [one two]
    (match (, one two)
        (, (tvar _ id _) (tvar _ id' _))              (= id id')
        (, (tapp target arg _) (tapp target' arg' _)) (if (type= target target')
                                                          (type= arg arg')
                                                              false)
        (, (tcon name _) (tcon name' _))              (= name name')
        _                                             false))

(** ## The Type Environment **)

(** A scheme is the way that we represent generic types (sometimes called a "polytype"). The first argument is a set of the tvar ids that are generic in the contained type. **)

(deftype scheme (forall (set int) type))

(deftype tenv
    (tenv
        (** Types of values currently in scope **)
            (map string scheme)))

(defn tenv/set-type [(tenv values) name scheme]
    (tenv (map/set values name scheme)))

(** ## Finding "free" type variables
    The */free functions are about finding unbound type variables (that aren't bound by a forall scheme)
    - type/free: types cannot contain a forall, so every tvar is "free"
    - scheme/free: finds all tvars in the contained type that aren't present in the "free set". This represents type variables that are defined outside of the current declaration.
    - tenv/free: runs scheme/free on all variables in scope. **)

(defn type/free [type]
    (match type
        (tvar _ id _) (set/add set/nil id)
        (tcon _ _)    set/nil
        (tapp a b _)  (set/merge (type/free a) (type/free b))))

(defn scheme/free [(forall vbls type)]
    (set/diff (type/free type) vbls))

(defn tenv/free [(tenv values)]
    (foldr set/nil (map scheme/free (map/values values)) set/merge))

(,
    (fn [a] (set/to-list (scheme/free a)))
        [(, (forall (set/from-list [0]) (tvar "a" 0 -1)) [])
        (, (forall (set/from-list []) (tvar "a" 0 -1)) [0])])

(** ## Applying type substitutions
    A core notion of Hindley-Milner's "Algorithm W" is the "substitution map". It contains a mapping from a type variable to a "replacement type". Applying the substitution map to a type consists of finding all tvars in a type that have a replacement defined in the map, and making that substitution. **)

(defn type/apply [subst type]
    (match type
        (tvar _ id _)         (match (map/get subst id)
                                  (none)   type
                                  (some t) t)
        (tapp target arg loc) (tapp (type/apply subst target) (type/apply subst arg) loc)
        _                     type))

(,
    (type/apply (map/from-list [(, 0 (tcon "int" -1))]))
        [(, (tvar "a" 0 -1) (tcon "int" -1))
        (, (tvar "b" 1 -1) (tvar "b" 1 -1))
        (,
        (tapp (tcon "list" -1) (tvar "a" 0 -1) -1)
            (tapp (tcon "list" -1) (tcon "int" -1) -1))])

(defn scheme/apply [subst (forall vbls type)]
    (** When applying a substitution map to a scheme, we ignore all mappings of variables in the free set for that scheme. **)
        (forall vbls (type/apply (map-without subst vbls) type)))

(defn tenv/apply [subst (tenv values)]
    (tenv (map/map (scheme/apply subst) values)))

(** ## Composing substitution maps
    One very nice property of Algorithm W is that the constraints are resolved unidirectionally. In a generic "constraint solving" algorithm, the constraints must be applied repeatedly until some "fixed point" is reached, because applying one constraint might result in other constraints newly becoming applicable.
    In Algorithm W, you only ever apply substitutions "backward": new substitutions get applied to the old substitution map, and never the other way around.
    🚨 This is a critical invariant. If you compose substitutions in the wrong order (as actually occurs in the "Algorithm W Step-By-Step" paper in one place 🫢) it will break the type system, resulting in incorrect inferences One way to verify that you're doing it right is to check if new-subst has any types with tvars that have defined mappings in old-subst. If so, you're either applying them in the wrong order, or you forgot to apply the current substitution map at some step along the way.
    In our implementation, we will maintain this invariant as a consequence of system design; the composition map will live in our state monad, and so whenever we add a new map, we know which one is "newer" and which is "older". **)

(defn compose-subst [new-subst old-subst]
    (** map/merge overwrites duplicate keys in the first argument with values from the second argument **)
        (map/merge (map/map (type/apply new-subst) old-subst) new-subst))

(** 🚨 STOPSHIP: map/merge actually ignores duplicates from the second arg. Is that broken? Are there ever duplicates in practice? **)

(map/merge (map/from-list [(, 0 1)]) (map/from-list [(, 0 10)]))

(def demo-new-subst
    (map/from-list [(, 0 (tcon "0-mapped" -1)) (, 1 (tvar "c" 10 -1))]))

(,
    (fn [x]
        (map/to-list (compose-subst demo-new-subst (map/from-list x))))
        [(** v5 gets the v0 substitution applied to it **)
        (,
        [(, 5 (tvar "a" 0 -1))]
            [(, 5 (tcon "0-mapped" -1))
            (, 0 (tcon "0-mapped" -1))
            (, 1 (tvar "c" 10 -1))])
        (** v0 gets the v1 substitution applied to it, and then overrides the v0 from new-subst **)
        (, [(, 0 (tvar "b" 1 -1))] [(, 0 (tvar "c" 10 -1)) (, 1 (tvar "c" 10 -1))])])

(** ## Generalizing
    Once we have inferred the type for a named value (either at the top-level, or in a let), we "lock in" the polymorphism with generalize. This consists of finding any type variables that only exist in our current type (not in the type environment), and setting them as the "free" set of our forall. **)

(defn generalize [tenv t]
    (forall (set/diff (type/free t) (tenv/free tenv)) t))

(** ## A State monad
    Given that we're going 100% immutable, having a State monad is really handy so you're not having to manually pass around a "next unique id" or "here are the current substitutions" everywhere. **)

;(deftype (result good bad) (ok good) (err bad))

(deftype (StateT state value) (StateT (fn [state] (, state value))))

((** This is our bind function. Given a (StateT state value) and a (fn [value] (StateT state value2), it produces a new StateT chaining the two things together, essentially running the second argument on the resolved value of the first argument. **)
    defn >>= [(StateT f) next]
    (StateT
        (fn [state]
            (let [(, state value) (f state) (StateT fnext) (next value)]
                (fnext state)))))

((** Here's our return (or pure) function for the StateT monad. It produces a StateT that resolves to the given value, independent of the current state. **)
    defn <- [x]
    (StateT (fn [state] (, state x))))

((** Given a StateT and an initial state, it will "run" the contained function and give you the final result. **)
    defn run-> [(StateT f) state]
    (let [(, _ result) (f state)] result))

((** Get the current state **)
    def <-state
    (StateT (fn [state] (, state state))))

((** Overwrite the state, returning the old state **)
    defn state-> [v]
    (StateT (fn [old] (, v old))))

(** We'll also want some monadified versions of these helper functions: **)

(defn map-> [f arr]
    (match arr
        []           (<- [])
        [one ..rest] (let-> [one (f one) rest (map-> f rest)] (<- [one ..rest]))))

(defn foldl-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [one (f init one)] (foldl-> one rest f))))

(defn foldr-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [init (foldr-> init rest f)] (f init one))))

((** do-> is just like map-> except it is for functions that return (), so it doesn't need to collect the values into a list. **)
    defn do-> [f arr]
    (match arr
        []           (<- ())
        [one ..rest] (let-> [() (f one) () (do-> f rest)] (<- ()))))

;(defn seq-> [arr]
    (match arr
        []           (<- [])
        [one ..rest] (let-> [one one rest (seq-> rest)] (<- [one ..rest]))))

;(defn force [e->s result]
    (match result
        (ok v)  v
        (err e) (fatal "Result Error ${(e->s e)}")))

(** ## Type Inference State
    Here's where we take the StateT monad defined above and make it specific to our use case. Our StateT will contain an integer representing the "next unique ID" used for generating unique tvars, as well as the "current substitution map". **)

(typealias (State value) (StateT (, int (map string type))))

(def state/nil (, 0 map/nil))

(defn run/nil-> [st] (run-> st state/nil))

(def <-next-idx
    (let-> [(, idx subst) <-state _ (state-> (, (+ idx 1) subst))] (<- idx)))

(def <-subst (let-> [(, _ subst) <-state] (<- subst)))

(defn subst-> [new-subst]
    (let-> [
        (, idx subst) <-state
        _             (state-> (, idx (compose-subst new-subst subst)))]
        (<- ())))

((** This overwrites the substitution map (without composing), returning the old substitution map. It is used for isolating a section of the algorithm, for performance reasons. **)
    defn subst-reset-> [new-subst]
    (let-> [
        (, idx types old-subst) <-state
        _                       (state-> (, idx types new-subst))]
        (<- old-subst)))

;(def <-idx (let-> [(, idx _) <-state] (<- idx)))

;(defn idx-> [idx]
    (let-> [(, _ subst) <-state _ (state-> (, idx subst))] (<- ())))

