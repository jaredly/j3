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

(** ## The Type Environment
     **)

(** A scheme is the way that we represent generic types (sometimes called a "polytype"). The first argument is a set of the tvar ids that are generic in the contained type. **)

(deftype scheme (forall (set int) type))

(deftype tenv
    (tenv
        (** Types of values in the global scope **)
            (map string scheme)))

(defn tenv/set-type [(tenv values) name scheme]
    (tenv (map/set values name scheme)))

(** ## Finding "free" type variables
    The */free functions are about finding unbound type variables (that aren't bound by a forall scheme)
    - type/free: types cannot contain a forall, so every tvar is "free"
    - scheme/free: finds all tvars in the contained type that aren't present in the "free set". This represents type variables that are defined outside of the current declaration.
    - tenv/free: runs scheme/free on all declared top-level variables. **)

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
    One very nice property of Algorithm W is that the constraints are resolved unidirectionally. In a generic "constraint solving" algorithm, the constraints must be applied repeatedly until some "fixed point" is reached, because applying some constraint might result in other constraints newly becoming applicable.
    In Algorithm W, you only ever apply substitutions "backward": new substitutions get applied to the old substitution map, and then overwrite any duplicate mappings from the old map.
    🚨 This is a critical invariant. If you compose substitutions in the wrong order (as actually occurs in the "Algorithm W Step-By-Step" paper in one place 🫢) it will break the type system.
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