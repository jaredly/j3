(** ## Hindley Milner Type Inference
    Heavily based on the excellent paper [Algorithm W Step-By-Step](https://github.com/wh5a/Algorithm-W-Step-By-Step/blob/master/AlgorithmW.pdf).
    This first version of the type checker is "vanilla algorithm w", and so won't actually be powerful enough to type check our language. We'll follow up by extending it with the ability to handle patterns, match forms, and user-defined types. **)

(** ## Prelude **)

(deftype (option a) (some a) (none))

(deftype (list a) (cons a (list a)) (nil))

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

(defn map [f values]
    (match values
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

(** ## AST **)

(deftype prim (pint int int) (pbool bool int))

(deftype stmt (sdef string int expr int) (sexpr expr int))

(deftype cst
    (cst/list (list cst) int)
        (cst/array (list cst) int)
        (cst/spread cst int)
        (cst/id string int)
        (cst/string string (list (, cst string int)) int))

(deftype quot
    (quot/expr expr)
        (quot/stmt stmt)
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

(defn type->s [type]
    (match type
        (tvar name _)                           name
        (tapp (tapp (tcon "->" _) arg _) res _) "(fn [${(type->s arg)}] ${(type->s res)})"
        (tapp target arg _)                     "(${(type->s target)} ${(type->s arg)})"
        (tcon name _)                           name))

(** ## The Type Environment
    For now, the "type environment" just consists of the "values in scope", mapped to their types (which might be only partially inferred, still containing unresolved type variables).
    Once we add type classes, we'll use the "type environment" to keep track of defined classes and their instances. **)

(** A scheme is the way that we represent generic types (sometimes called "polytypes"). The first argument is a set of the tvar ids that are generic in the contained type. **)

(deftype scheme (forall (set string) type))

(deftype tenv
    (tenv
        (** Types of values currently in scope **)
            (map string scheme)
            (** Data type constructors; (free variables) (arguments) (resulting type) **)
            (map string (, (set string) (list type) type))))

(def tenv/nil (tenv map/nil map/nil))

(defn tenv/with-type [(tenv values tcons) name scheme]
    (tenv (map/set values name scheme) tcons))

(defn tenv/resolve [(tenv values _) name] (map/get values name))

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

(defn scheme/free [(forall vbls type)]
    (set/diff (type/free type) vbls))

(defn tenv/free [(tenv values _)]
    (foldr set/nil (map scheme/free (map/values values)) set/merge))

(,
    (fn [a] (set/to-list (scheme/free a)))
        [(, (forall (set/from-list ["a"]) (tvar "a" -1)) [])
        (, (forall (set/from-list []) (tvar "a" -1)) ["a"])])

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

(defn scheme/apply [subst (forall vbls type)]
    (** When applying a substitution map to a scheme, we ignore all mappings of variables in the free set for that scheme. **)
        (forall vbls (type/apply (map-without subst vbls) type)))

((** As an optimization, we could segregate the type environment into "values with unresolved type variables" and "values without", or even set up a lookup table from "tvar id" to "names of values that contain that tvar". For now though, we'll do the simple thing of just always iterating over everything in scope.
    A simpler (and very reasonable) optimization would be to split the tenv into "global terms" and "local terms", because global terms are not allowed to have unresolved type variables, and local terms tend to be relatively small in number.
    These optimizations would also speed up tenv/free considerably. **)
    defn tenv/apply [subst (tenv values tcons)]
    (tenv (map/map (scheme/apply subst) values) tcons))

(** ## Composing substitution maps
    One very nice property of Algorithm W is that the constraints are resolved unidirectionally. In a generic "constraint solving" algorithm, the constraints must be applied repeatedly until some "fixed point" is reached, because applying one constraint might result in other constraints newly becoming applicable.
    In Algorithm W, you only ever apply substitutions "backward": new substitutions get applied to the old substitution map, and never the other way around.
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
    (let-> [(, idx old-subst) <-state _ (state-> (, idx new-subst))]
        (<- old-subst)))

(def reset-state->
    (let-> [(, _ _) <-state _ (state-> (, 0 map/nil))] (<- ())))

(** These are monadified versions of the */apply functions from above; they "apply the current substitution". **)

(defn apply-> [f arg] (let-> [subst <-subst] (<- (f subst arg))))

(def tenv/apply-> (apply-> tenv/apply))

(def type/apply-> (apply-> type/apply))

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
    (match (, t1 t2)
        (, (tvar var l) t)                 (var-bind var t l)
        (, t (tvar var l))                 (var-bind var t l)
        (, (tcon a la) (tcon b lb))        (if (= a b)
                                               (<- ())
                                                   (fatal "Incompatible concrete types: ${a} vs ${b}"))
        (, (tapp t1 a1 _) (tapp t2 a2 _) ) (let-> [
                                               ()    (unify t1 t2 l)
                                               subst <-subst
                                               ()    (unify (type/apply subst a1) (type/apply subst a2) l)]
                                               (<- ()))
        _                                  (fatal "Incompatible types: ${(jsonify t1)} ${(jsonify t2)}")))

(defn one-subst [var type] (map/from-list [(, var type)]))

(defn var-bind [var type l]
    (match type
        (tvar v _) (if (= var v)
                       (<- ())
                           (let-> [_ (subst-> (one-subst var type))] (<- ())))
        _          (if (set/has (type/free type) var)
                       (fatal
                           "Cycle found while unifying type with type variable. ${var}")
                           (let-> [_ (subst-> (one-subst var type))] (<- ())))))

(** ## Infer Expressions **)

(defn infer/prim [prim]
    (match prim
        (pint _ l)  (tcon "int" l)
        (pbool _ l) (tcon "bool" l)))

(defn infer/expr [tenv expr]
    (** This is a performance optimization, to isolate the substitution maps to the level of the individual expression.
        The algorithm described in "Algorithm W Step By Step" doesn't put the substitution map on the state monad, instead opting to pass around subst maps, composing them individually. This results in a lot of bookkeeping, and in one case there's actually a bug when two substitution maps are composed in the wrong order (the inference for EApp has s3 <> s2 <> s1, when it should be s1 <> s2 <> s3).
        The downside to our approach is we end up doing a lot of unrelated compositions, because everything gets dumped into one big map. This has exponential time complexity, slowing things way down. Fortunately, this little trick here mitigates all of the performance hit that I saw in practice (it achieves the same performance as passing around substitution maps manually).
        As with the tenv, we could come up with a data structure with even better performance characteristics for composing substitution maps, if it ended up being an issue. **)
        (let-> [
        old  (subst-reset-> map/nil)
        type (infer/expr-inner tenv expr)
        new  (subst-reset-> old)
        ()   (subst-> new)]
        (<- type)))

(defn add-scope [tenv scope]
    (foldl->
        tenv
            (map/to-list scope)
            (fn [tenv (, name vbl)]
            (let-> [vbl (type/apply-> vbl)]
                (<- (tenv/with-type tenv name (forall set/nil vbl)))))))

(defn infer/expr-inner [tenv expr]
    (match expr
        (evar name l)                           (match (tenv/resolve tenv name)
                                                    (none)        (fatal "Variable not found in scope: ${name}")
                                                    (some scheme) (instantiate scheme l))
        (eprim prim _)                          (<- (infer/prim prim))
        (** For lambdas (fn [name] body)
            - create a type variable to represent the type of the argument
            - add the type variable to the typing environment
            - infer the body, using the augmented environment
            - apply any resulting substitutions to our arg variable **)
        (elambda [(pvar arg al)] body l)        (let-> [
                                                    arg-type  (new-type-var arg al)
                                                    sub-env   (<- (tenv/with-type tenv arg (forall set/nil arg-type)))
                                                    body-type (infer/expr sub-env body)
                                                    arg-type  (type/apply-> arg-type)]
                                                    (<- (tfn arg-type body-type l)))
        (** With more complex patterns (that aren't just a variable name), there might be multiple "names" that need to get added to the type environment, so those are returned as the scope map, along with a type for the argument.
            Other than that, it's the same as the simple case. **)
        (elambda [pat] body l)                  (let-> [
                                                    (, arg-type scope) (infer/pattern tenv pat)
                                                    bound-env          (add-scope tenv scope)
                                                    body-type          (infer/expr bound-env body)
                                                    arg-type           (type/apply-> arg-type)]
                                                    (<- (tfn arg-type body-type l)))
        (** This isn't necessarily the most efficient way to handle curried arguments, but imo it makes the above inference algorithm cleaner & more understandable, as you only have to think about one argument at a time. **)
        (elambda [one ..rest] body l)           (infer/expr tenv (elambda [one] (elambda rest body l) l))
        (** Function application (target arg)
            - create a type variable to represent the return value of the function application
            - infer the target type
            - infer the arg type, using substitutions from the target. Q: Could this be done the other way around?
            - unify the inferred target type with the function type produced by our inferred argument type and our result variable.
            - the substitutions from the unification is then applied to the result type variable, giving us the overall type of the expression **)
        (eapp target [arg] l)                   (let-> [
                                                    result-var  (new-type-var "result" l)
                                                    target-type (infer/expr tenv target)
                                                    arg-tenv    (tenv/apply-> tenv)
                                                    arg-type    (infer/expr arg-tenv arg)
                                                    target-type (type/apply-> target-type)
                                                    _           (unify target-type (tfn arg-type result-var l) l)]
                                                    (type/apply-> result-var))
        (** Same story here as for the lambdas. Splitting things out like this allows us to look at one argument at a time. **)
        (eapp target [one ..rest] l)            (infer/expr tenv (eapp (eapp target [one] l) rest l))
        (** Let: simple version, where the pattern is just a pvar
            - infer the type of the value being bound
            - generalize the inferred type! This is where we get let polymorphism; the inferred type is allowed to have "free" type variables. If we didn't generalize here, then let would not be polymorphic.
            - apply any subst that we learned from inferring the value to our type environment, producing a new tenv
            - infer the type of the body, using the tenv that has both the name bound to the generalized inferred type, as well as any substitutions that resulted from inferring the type of the bound value. **)
        (elet [(, (pvar name _) value)] body _) (let-> [
                                                    value-type  (infer/expr tenv value)
                                                    applied-env (tenv/apply-> tenv)
                                                    scheme      (<- (generalize applied-env value-type))
                                                    bound-env   (<- (tenv/with-type applied-env name scheme))]
                                                    (infer/expr bound-env body))
        (** For non-pvar patterns, we don't allow produced type variables to be generic. If we did, things like (fn [x] (let [(, a b) x] a) would return an "unbound" type variable: it would be inferred as forall a, b; a -> b. **)
        (elet [(, pat value)] body l)           (let-> [
                                                    (, type scope) (infer/pattern tenv pat)
                                                    value-type     (infer/expr tenv value)
                                                    ()             (unify type value-type l)
                                                    bound-env      (add-scope tenv scope)
                                                    body-type      (infer/expr bound-env body)]
                                                    (<- body-type))
        (elet [one ..more] body l)              (infer/expr tenv (elet [one] (elet more body l) l))
        (** match expressions! Like let, but with a little more book-keeping. **)
        (ematch target cases l)                 (let-> [
                                                    target-type (infer/expr tenv target)
                                                    result-type (new-type-var "match result" l)
                                                    all-results (map->
                                                                    (fn [(, pat body)]
                                                                        (let-> [
                                                                            (, type scope) (infer/pattern tenv pat)
                                                                            ()             (unify type target-type l)
                                                                            bound-env      (add-scope tenv scope)]
                                                                            (infer/expr bound-env body)))
                                                                        cases)
                                                    ()          (do->
                                                                    (fn [one-result]
                                                                        (let-> [subst <-subst]
                                                                            (unify
                                                                                (type/apply subst one-result)
                                                                                    (type/apply subst result-type)
                                                                                    l)))
                                                                        all-results)]
                                                    (type/apply-> result-type))))

(,
    (errorToString (fn [x] (run/nil-> (infer/expr basic/env x))))
        [(, (@ 10) (tcon "int" 4512))
        (, (@ hi) "Fatal runtime: Variable not found in scope: hi")
        (, (@ (let [x 10] x)) (tcon "int" 4547))
        (,
        (@ (, 1 2))
            (tapp (tapp (tcon "," -1) (tcon "int" 4561) -1) (tcon "int" 4562) -1))
        (,
        (@ (fn [x] (let [(, a b) x] a)))
            (tapp
            (tapp
                (tcon "->" 4689)
                    (tapp (tapp (tcon "," -1) (tvar "a:1" 4698) -1) (tvar "b:2" 4698) -1)
                    4689)
                (tvar "a:1" 4698)
                4689))
        (,
        (@ (let [id (fn [x] x)] (, (id 2) (id true))))
            (tapp (tapp (tcon "," -1) (tcon "int" 4761) -1) (tcon "bool" 4764) -1))
        (,
        (@ (fn [id] (, (id 2) (id true))))
            "Fatal runtime: Incompatible concrete types: int vs bool")
        (,
        (@ (fn [arg] (let [(, id _) arg] (, (id 2) (id true)))))
            "Fatal runtime: Incompatible concrete types: int vs bool")
        (, (@ ((fn [x] x) 2)) (tcon "int" 4866))])

(** ## Patterns **)

((** This looks up a type constructor definition, and replaces any free variables in the arguments & result type with fresh type variables. **)
    defn instantiate-tcon [(tenv _ tcons) name l]
    (match (map/get tcons name)
        (none)                     (fatal "Unknown type constructor: ${name}")
        (some (, free cargs cres)) (let-> [subst (make-subst-for-free free l)]
                                       (<- (, (map (type/apply subst) cargs) (type/apply subst cres))))))

(defn infer/pattern [tenv pattern]
    (match pattern
        (pvar name l)         (let-> [v (new-type-var name l)] (<- (, v (map/from-list [(, name v)]))))
        (pany l)              (let-> [v (new-type-var "any" l)] (<- (, v map/nil)))
        (pstr _ l)            (<- (, (tcon "string" l) map/nil))
        (pprim (pbool _ _) l) (<- (, (tcon "bool" l) map/nil))
        (pprim (pint _ _) l)  (<- (, (tcon "int" l) map/nil))
        (pcon name _ args l)  (let-> [
                                  (, cargs cres)       (instantiate-tcon tenv name l)
                                  sub-patterns         (map-> (infer/pattern tenv) args)
                                  (, arg-types scopes) (<- (unzip sub-patterns))
                                  ()                   (do->
                                                           (fn [(, ptype ctype)] (unify ptype ctype l))
                                                               (zip arg-types cargs))
                                  cres                 (type/apply-> cres)
                                  scope                (<- (foldl map/nil scopes map/merge))]
                                  (<- (, cres scope)))))

(** ## Infer Statements **)

(defn infer/stmt [tenv stmt]
    (match stmt
        (sdef name nl expr l) (run/nil->
                                  (let-> [
                                      self     (new-type-var name nl)
                                      self-env (<- (tenv/with-type tenv name (forall set/nil self)))
                                      type     (infer/expr self-env expr)
                                      self     (type/apply-> self)
                                      ()       (unify self type l)
                                      type     (type/apply-> type)]
                                      (<- (tenv/with-type tenv/nil name (generalize tenv type)))))
        (sexpr expr l)        (run/nil-> (let-> [_ (infer/expr tenv expr)] (<- tenv/nil)))))

(def basic/env
    (tenv
        (map/from-list
            [(, "+" (forall set/nil (tfns [tint tint] tint -1)))
                (,
                ","
                    (forall
                    (set/from-list ["a" "b"])
                        (tfns
                        [(tvar "a" -1) (tvar "b" -1)]
                            (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "b" -1) -1)
                            -1)))])
            (map/from-list
            [(,
                ","
                    (,
                    (set/from-list ["a" "b"])
                        [(tvar "a" -1) (tvar "b" -1)]
                        (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "b" -1) -1)))])))

(,
    (fn [x]
        (let [(tenv values _) (infer/stmt basic/env x)] (map/to-list values)))
        [(, (@! (def x 10)) [(, "x" (forall set/nil (tcon "int" 3024)))])
        (,
        (@! (defn id [x] x))
            [(,
            "id"
                (forall
                (set/from-list ["x:1"])
                    (tapp
                    (tapp (tcon "->" 3044) (tvar "x:1" 3048) 3044)
                        (tvar "x:1" 3048)
                        3044)))])
        (,
        (@! (defn rec [x] (let [m (rec x)] (+ x m))))
            [(,
            "rec"
                (forall
                (map/from-list [])
                    (tapp (tapp (tcon "->" 3146) (tcon "int" -1) 3146) (tcon "int" -1) 3146)))])])

(** Ok, but what about mutual recursion? It's actually very similar to the single case; you make a list of type variables, one for each definition, then do inference on each, unifying the result with the type variable, and then apply the final substitution to everything at the end! **)

(defn infer/defns [tenv defns]
    (run/nil->
        (let-> [
            names     (<- (map (fn [(, name _)] name) defns))
            locs      (<- (map (fn [(, _ _ _ l)] l) defns))
            vbls      (map-> (fn [(, name nl _)] (new-type-var name nl)) defns)
            bound-env (<-
                          (foldl
                              tenv
                                  (zip names vbls)
                                  (fn [tenv (, name vbl)]
                                  (tenv/with-type tenv name (forall set/nil vbl)))))
            types     (map-> (fn [(, _ _ expr _)] (infer/expr bound-env expr)) defns)
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
                        (tenv/with-type tenv name (generalize tenv type))))))))

(,
    (fn [x]
        (infer/defns
            basic/env
                (map (fn [(sdef name nl body l)] (, name nl body l)) x)))
        [(,
        [(@! (defn even [x] (let [o (odd x)] (+ x 2))))
            (@! (defn odd [x] (let [e (even x)] 3)))]
            (tenv
            (map/from-list
                [(,
                    "odd"
                        (forall
                        (map/from-list [])
                            (tapp
                            (tapp (tcon "->" 3821) (tcon "int" -1) 3821)
                                (tcon "int" 3834)
                                3821)))
                    (,
                    "even"
                        (forall
                        (map/from-list [])
                            (tapp (tapp (tcon "->" 3776) (tcon "int" -1) 3776) (tcon "int" -1) 3776)))])
                map/nil))])

