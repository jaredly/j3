(** ## HM(X): Hindley Milner with Constraints **)

(** ## Prelude **)

(deftype (option a)
    (some a)
        (none))

(deftype (list a)
    (cons a (list a))
        (nil))

(deftype (, a b)
    (, a b))

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

(** ## Type to String, simple version **)

(defn type->s-simple [type]
    (match type
        (tvar name _)                           name
        (tapp (tapp (tcon "->" _) arg _) res _) "(fn [${(type->s-simple arg)}] ${(type->s-simple res)})"
        (tapp target arg _)                     "(${(type->s-simple target)} ${(type->s-simple arg)})"
        (tcon name _)                           name))

(** ## Type to string, complex version **)

(defn type->s [type]
    (match type
        (tvar name _)                       name
        (tapp (tapp (tcon "->" _) _ _) _ _) (let [(, args result) (unwrap-fn type)]
                                                "(fn [${(join " " (map type->s args))}] ${(type->s result)})")
        (tapp _ _ _)                        (let [(, target args) (unwrap-app type [])]
                                                "(${(type->s target)} ${(join " " (map type->s args))})")
        (tcon name _)                       name))

(defn unwrap-fn [t]
    (match t
        (tapp (tapp (tcon "->" _) a _) b _) (let [(, args res) (unwrap-fn b)] (, [a ..args] res))
        _                                   (, [] t)))

(defn unwrap-app [t args]
    (match t
        (tapp a b _) (unwrap-app a [b ..args])
        _            (, t args)))

(,
    type->s
        [(, (@t (fn [a b c] d)) "(fn [a b c] d)") (, (@t (, a b)) "(, a b)")])

(** ## A State monad
    Given that we're going 100% immutable, having a State monad is really handy so you're not having to pipe state values into and out of every function. **)

(deftype (StateT state value)
    (StateT (fn [state] (, state value))))

((** This is our bind function. Given a (StateT state value) and a (fn [value] (StateT state value2), it produces a new StateT chaining the two things together, essentially running the second argument on the resolved value of the first argument. **)
    defn >>= [(StateT f) next]
    (StateT
        (fn [state]
            (let [
                (, state value) (f state)
                (StateT fnext)  (next value)]
                (fnext state)))))

((** Here's our return (or pure) function for the StateT monad. It produces a StateT that resolves to the given value, independent of the current state. **)
    defn <- [x]
    (StateT (fn [state] (, state x))))

((** Given a StateT and an initial state, this will evaluate the contained function and give you the final result. **)
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

(** ## Types for inference **)

(deftype constraint
    (cbool bool int)
        (capp string (list type) int)
        (cand constraint constraint int)
        (cexists (list string) constraint int)
        (cdef string scheme constraint int)
        (cinstance string type int))

(defn cands [constrs loc]
    (loop
        constrs
            (fn [constrs recur]
            (match constrs
                []           (cbool true loc)
                [one]        one
                [one ..rest] (cand one (recur rest) loc)))))

(deftype scheme
    (forall (set string) constraint type))

(** ## Substitution maps **)

(defn constraint/apply [subst constraint]
    (match constraint
        (capp name types loc)        (capp name (map (type/apply subst) types) loc)
        (cand one two loc)           (cand
                                         (constraint/apply subst one)
                                             (constraint/apply subst two)
                                             loc)
        (cinstance name type loc)    (cinstance name (type/apply subst type) loc)
        (** Q: Should we remove substs related to the vbls? Seems like we might want to... **)
        (cexists vbls inner loc)     (cexists vbls (constraint/apply subst inner) loc)
        (cdef name scheme inner loc) (cdef
                                         name
                                             (scheme/apply subst scheme)
                                             (constraint/apply subst inner)
                                             loc)
        _                            constraint))

(defn scheme/apply [subst (forall vbls constraint type)]
    (forall
        vbls
            (constraint/apply subst constraint)
            (type/apply subst type)))

(defn assumps/apply [subst assumps]
    (map/map (scheme/apply subst) assumps))

(defn compose-subst [new-subst old-subst]
    (** map/merge overwrites duplicate keys in the first argument with values from the second argument **)
        (map/merge (map/map (type/apply new-subst) old-subst) new-subst))

(defn type/apply [subst type]
    (match type
        (tvar id _)           (match (map/get subst id)
                                  (none)   type
                                  (some t) t)
        (tapp target arg loc) (tapp (type/apply subst target) (type/apply subst arg) loc)
        _                     type))

(** ## Working with type variables **)

(defn fresh-ty-var [name]
    (let-> [
        (, idx tenv) <-state
        _            (state-> (, (+ idx 1) tenv))]
        (<- "${name}:${(int-to-string idx)}")))

(defn instantiate [(forall vbls constraint type) loc]
    (let-> [
        free  (<- (set/to-list vbls))
        tvs   (map-> fresh-ty-var free)
        subst (<- (map/from-list (zip free (map (fn [name] (tvar name loc)) tvs))))]
        ;  do we just drop the scheme on the floor??
            (<- (type/apply subst type))))

(** ## Turning the AST into constraints **)

(defn infer/prim [prim]
    (match prim
        (pint _ _)  "int"
        (pbool _ _) "bool"))

(defn infer/pat-args [subst args cargs]
    (map->
        (fn [(, pat argt)] (infer/pat pat (type/apply subst argt)))
            (zip args cargs)))

(defn infer/pat [pat type]
    (match pat
        ;  question: do I need to abstract this? make a new variable and do a `(capp =` with the tvar? 🤔
        (pvar name loc)         (<- (, (cinstance name type loc) [] (map/set map/nil name type)))
        (pprim prim loc)        (<- (, (capp "=" [(tcon (infer/prim prim) loc) type] loc) [] map/nil))
        (pany loc)              (<- (, (cbool true loc) [] map/nil))
        (pstr _ loc)            (<- (, (capp "=" [(tcon "string" loc) type] loc) [] map/nil))
        (pcon name nl args loc) (let-> [(, _ tenv) <-state]
                                    (match (map/get tenv name)
                                        (none)                     (fatal "Unknown constructor")
                                        (some (, free cargs tres)) (let-> [
                                                                       vbls             (map-> fresh-ty-var free)
                                                                       subst            (<- (map/from-list (zip free (map (fn [x] (tvar x loc)) vbls))))
                                                                       arg-con          (infer/pat-args subst args cargs)
                                                                       (, constr cvbls) (<- (unzip arg-con))
                                                                       (, cvbls scopes) (<- (unzip cvbls))]
                                                                       (<-
                                                                           (,
                                                                               (cand
                                                                                   (capp "=" [(type/apply subst tres) type] loc)
                                                                                       (cands constr loc)
                                                                                       loc)
                                                                                   (concat [vbls ..cvbls])
                                                                                   (foldl map/nil scopes map/merge))))))
        _                       (fatal "l")))

(defn infer/expr [expr type]
    (match expr
        (eprim prim loc)                          (<- (capp "=" [(tcon (infer/prim prim) loc) type] loc))
        (estr prefix interps loc)                 (let-> [
                                                      inner (map-> (fn [(, expr _)] (infer/expr expr (tcon "string" -1))) interps)]
                                                      (<- (cands [(capp "=" [(tcon "string" loc) type] loc) ..inner] loc)))
        (evar name loc)                           (<- (cinstance name type loc))
        (elambda [(pvar name nl)] body loc)       (let-> [
                                                      x1    (fresh-ty-var name)
                                                      x2    (fresh-ty-var "lambda-body")
                                                      cbody (infer/expr body (tvar x2 loc))]
                                                      (<-
                                                          (cexists
                                                              [x1 x2]
                                                                  (cand
                                                                  (cdef name (forall set/nil (cbool true nl) (tvar x1 nl)) cbody nl)
                                                                      (capp "=" [(tfn (tvar x1 nl) (tvar x2 loc) loc) type] loc)
                                                                      loc)
                                                                  loc)))
        (elambda [arg ..args] body loc)           (infer/expr (elambda [arg] (elambda args body loc) loc) type)
        (elet [(, (pvar name nl) init)] body loc) (let-> [
                                                      x    (fresh-ty-var name)
                                                      init (infer/expr init (tvar x nl))
                                                      body (infer/expr body type)]
                                                      (<-
                                                          (cdef name (forall (set/add set/nil x) init (tvar x nl)) body loc)))
        (eapp target [arg] loc)                   (let-> [
                                                      x      (fresh-ty-var "fn-arg")
                                                      target (infer/expr target (tfn (tvar x loc) type loc))
                                                      arg    (infer/expr arg (tvar x loc))]
                                                      (<- (cexists [x] (cand target arg loc) loc)))
        (eapp target [arg ..rest] loc)            (infer/expr (eapp (eapp target [arg] loc) rest loc) type)
        (ematch target cases loc)                 (let-> [
                                                      ttarget (fresh-ty-var "match-target")
                                                      tres    (fresh-ty-var "match-result")
                                                      ctarget (infer/expr target (tvar ttarget loc))
                                                      ccons   (map->
                                                                  (fn [(, pat expr)]
                                                                      (let-> [
                                                                          (, pat-con vbls scope) (infer/pat pat (tvar ttarget loc))
                                                                          exp-con                (infer/expr expr (tvar tres loc))]
                                                                          (<-
                                                                              (cexists
                                                                                  vbls
                                                                                      (foldl
                                                                                      (cand pat-con exp-con loc)
                                                                                          (map/to-list scope)
                                                                                          (fn [inner (, name type)]
                                                                                          (cdef name (forall set/nil (cbool true loc) type) inner loc)))
                                                                                      loc))))
                                                                      cases)]
                                                      (<-
                                                          (cexists
                                                              [ttarget tres]
                                                                  (cands [(capp "=" [(tvar tres loc) type] loc) ctarget ..ccons] loc)
                                                                  loc)))
        _                                         (fatal "lol ${(jsonify expr)}")))

(** ## Unification **)

(defn unify [t1 t2]
    (match (, t1 t2)
        (, (tvar var l) t)                 (var-bind var t)
        (, t (tvar var l))                 (var-bind var t)
        (, (tcon a la) (tcon b lb))        (if (= a b)
                                               (<- map/nil)
                                                   (fatal
                                                   "Incompatible concrete types: ${a} (${(int-to-string la)}) vs ${b} (${(int-to-string lb)})"))
        (, (tapp t1 a1 _) (tapp t2 a2 _) ) (let-> [
                                               target-subst (unify t1 t2)
                                               arg-subst    (unify (type/apply target-subst a1) (type/apply target-subst a2))]
                                               (<- (compose-subst arg-subst target-subst)))
        _                                  (fatal "Incompatible types: ${(jsonify t1)} ${(jsonify t2)}")))

(defn one-subst [var type] (map/from-list [(, var type)]))

(defn var-bind [var type]
    (match type
        (tvar v _) (if (= var v)
                       (<- map/nil)
                           (<- (one-subst var type)))
        _          (if (set/has (type/free type) var)
                       (fatal
                           "Cycle found while unifying type with type variable. ${var}")
                           (<- (one-subst var type)))))

(** ## Finding free type variables **)

(defn type/free [type]
    (match type
        (tvar id _)  (set/add set/nil id)
        (tcon _ _)   set/nil
        (tapp a b _) (set/merge (type/free a) (type/free b))))

(defn scheme/free [(forall vbls cns type)]
    (set/diff (type/free type) vbls))

(defn assumps/free [assumps]
    (foldl set/nil (map scheme/free (map/values assumps)) set/merge))

(** ## Debugging stringification **)

(defn assumps->s [assumps]
    (join
        "\n"
            (map
            (fn [(, name (forall _ _ t))] "${name} : ${(type->s t)}")
                (map/to-list assumps))))

(defn constraint->s [cns]
    (match cns
        (cbool true _)                             "true"
        (cbool false _)                            "false"
        (capp "=" [one two] _)                     "(= ${(type->s one)} ${(type->s two)})"
        (cand left right _)                        "${(constraint->s left)} &&\n  ${(constraint->s right)}"
        (cexists vbls inner _)                     "(∃${(join "," vbls)} ${(constraint->s inner)})"
        (cdef name (forall vbls cns type) inner _) "(${name}=(forall ${(join "," (set/to-list vbls))} ${(constraint->s cns)} ${(type->s type)}) ${(constraint->s inner)})"
        (cinstance name type _)                    "(vbl ${name} is ${(type->s type)})"
        _                                          "[some constraint]"))

(defn substs->s [subst]
    (join
        "\n"
            (map
            (fn [(, name type)] "${name}t${(type->s type)}")
                (map/to-list subst))))

(** ## Solving the constraints **)

(defn solve [constraint assumps free]
    (match constraint
        (cbool true _)               (<- map/nil)
        (cbool false _)              (fatal "got a false")
        (cand one two _)             (let-> [
                                         subst (solve one assumps free)
                                         s2    (solve
                                                   (constraint/apply subst two)
                                                       (assumps/apply subst assumps)
                                                       free)]
                                         (<- (compose-subst s2 subst)))
        (capp "=" [one two] _)       (unify one two)
        (cexists tvars inner _)      (solve inner assumps (set/merge free (set/from-list tvars)))
        (cinstance name type loc)    (match (map/get assumps name)
                                         (none)     (fatal "Unbound vbl ${name}")
                                         (some got) (let-> [
                                                        got   (instantiate got loc)
                                                        subst (unify got type)]
                                                        (<- subst)))
        (cdef name scheme inner loc) (let-> [
                                         (forall _ cns t) (<- scheme)
                                         subst            (solve cns assumps free)
                                         nt               (<- (type/apply subst t))
                                         res              (solve
                                                              (constraint/apply subst inner)
                                                                  (map/set
                                                                  (assumps/apply subst assumps)
                                                                      name
                                                                      (forall (set/diff (type/free nt) free) (cbool true loc) nt))
                                                                  free)]
                                         (<- (compose-subst res subst)))
        _                            (fatal "bad news bears")))

(** ## Builtins **)

(defn tpair [a b l] (tapp (tapp (tcon "," l) a l) b l))

(def basic-assumps
    (map/from-list
        [(,
            ","
                (forall
                (set/from-list ["a" "b"])
                    (cbool true -1)
                    (tfns
                    [(tvar "a" -1) (tvar "b" -1)]
                        (tapp (tapp (tcon "," -1) (tvar "a" -1) -1) (tvar "b" -1) -1)
                        -1)))
            (, "+" (forall set/nil (cbool true -1) (tfns [tint tint] tint -1)))]))

(def basic-tcons
    (map/from-list
        [(,
            ","
                (, ["a" "b"] [(tvar "a" -1) (tvar "b" -1)] (tpair (tvar "a" -1) (tvar "b" -1) -1)))]))

(** ## Some Tests **)

(defn check [expr]
    (run->
        (let-> [
            v          (fresh-ty-var "result")
            constraint (infer/expr expr (tvar v -1))
            subst      (solve constraint basic-assumps set/nil)]
            (<- (, constraint subst (type/apply subst (tvar v -1)))))
            (, 0 basic-tcons)))

(check (@ 1))

(,
    (fn [e]
        (let [(, cns subst type) (check e)]
            "type: ${(type->s type)}\n${(substs->s subst)}\n${(constraint->s cns)}"))
        [(,
        (@ 1)
            "type: int\nresult:0\tint\n(= int result:0)")
        (,
        (@ (fn [x] 1))
            "type: (fn [x:1] int)\nlambda-body:2\tint\nresult:0\t(fn [x:1] int)\n(∃x:1,lambda-body:2 (x=(forall  true x:1) (= int lambda-body:2)) &&\n  (= (fn [x:1] lambda-body:2) result:0))")
        (,
        (@ ((fn [x] 1) 2))
            "type: int\nlambda-body:3\tint\nx:2\tint\nresult:0\tint\nfn-arg:1\tint\n(∃fn-arg:1 (∃x:2,lambda-body:3 (x=(forall  true x:2) (= int lambda-body:3)) &&\n  (= (fn [x:2] lambda-body:3) (fn [fn-arg:1] result:0))) &&\n  (= int fn-arg:1))")
        (,
        (@ (let [x 1] x))
            "type: int\nx:1\tint\nresult:0\tint\n(x=(forall x:1 (= int x:1) x:1) (vbl x is result:0))")
        (,
        (@ (fn [id] (id 2)))
            "type: (fn [(fn [int] lambda-body:2)] lambda-body:2)\nid:1\t(fn [int] lambda-body:2)\nfn-arg:3\tint\nresult:0\t(fn [(fn [int] lambda-body:2)] lambda-body:2)\n(∃id:1,lambda-body:2 (id=(forall  true id:1) (∃fn-arg:3 (vbl id is (fn [fn-arg:3] lambda-body:2)) &&\n  (= int fn-arg:3))) &&\n  (= (fn [id:1] lambda-body:2) result:0))")
        (,
        (@ (let [x (fn [x] x)] (, (x 10) (x "hi"))))
            "type: (, int string)\nx:2\tlambda-body:3\nx:1\t(fn [lambda-body:3] lambda-body:3)\na:8\tint\nb:9\tstring\nresult:0\t(, int string)\nlambda-body:3:10\tint\nfn-arg:6\tint\nfn-arg:5\tint\nlambda-body:3:11\tstring\nfn-arg:7\tstring\nfn-arg:4\tstring\n(x=(forall x:1 (∃x:2,lambda-body:3 (x=(forall  true x:2) (vbl x is lambda-body:3)) &&\n  (= (fn [x:2] lambda-body:3) x:1)) x:1) (∃fn-arg:4 (∃fn-arg:5 (vbl , is (fn [fn-arg:5 fn-arg:4] result:0)) &&\n  (∃fn-arg:6 (vbl x is (fn [fn-arg:6] fn-arg:5)) &&\n  (= int fn-arg:6))) &&\n  (∃fn-arg:7 (vbl x is (fn [fn-arg:7] fn-arg:4)) &&\n  (= string fn-arg:7))))")
        (,
        (@ (fn [x] (+ x)))
            "type: (fn [int int] int)\nfn-arg:3\tint\nlambda-body:2\t(fn [int] int)\nx:1\tint\nresult:0\t(fn [int int] int)\n(∃x:1,lambda-body:2 (x=(forall  true x:1) (∃fn-arg:3 (vbl + is (fn [fn-arg:3] lambda-body:2)) &&\n  (vbl x is fn-arg:3))) &&\n  (= (fn [x:1] lambda-body:2) result:0))")
        (,
        (@
            (match 1
                a a))
            "type: int\nmatch-result:2\tint\nmatch-target:1\tint\nresult:0\tint\n(∃match-target:1,match-result:2 (= match-result:2 result:0) &&\n  (= int match-target:1) &&\n  (∃ (a=(forall  true match-target:1) (vbl a is match-target:1) &&\n  (vbl a is match-result:2))))")
        (,
        (@
            (match (, 1 2)
                (, _ a) a))
            "type: int\nmatch-result:2\tint\na:7\tint\nb:8\tint\nmatch-target:1\t(, int int)\nfn-arg:4\tint\nfn-arg:3\tint\na:5\tint\nb:6\tint\nresult:0\tint\n(∃match-target:1,match-result:2 (= match-result:2 result:0) &&\n  (∃fn-arg:3 (∃fn-arg:4 (vbl , is (fn [fn-arg:4 fn-arg:3] match-target:1)) &&\n  (= int fn-arg:4)) &&\n  (= int fn-arg:3)) &&\n  (∃a:5,b:6 (a=(forall  true b:6) (= (, a:5 b:6) match-target:1) &&\n  true &&\n  (vbl a is b:6) &&\n  (vbl a is match-result:2))))")])

(,
    (fn [e] (let [(, cns subst type) (check e)] (type->s type)))
        [(, (@ 1) "int")
        (, (@ (+ 2 3)) "int")
        (, (@ +) "(fn [int int] int)")
        (, (@ (fn [x] (+ x 2))) "(fn [int] int)")
        (,
        (@
            (match (, 1 2)
                (, _ a) a))
            "int")
        (, (@ "Lol") "string")
        (, (@ "Lol ${"hi"}") "string")])