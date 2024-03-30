(** ## Our AST **)

(deftype cst
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/spread cst int)
        (cst/identifier string int)
        (cst/string string (array (,, cst string int)) int))

(deftype (array a) (nil) (cons a (array a)))

(deftype expr
    (eprim prim int)
        (estr string (array (,, expr string int)) int)
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

(deftype prim (pint int int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string (array pat) int)
        (pstr string int)
        (pprim prim int))

(deftype type
    (tvar tyvar int)
        (tapp type type int)
        (tcon tycon int)
        (tgen int int))

(defn enumId [num] "v${(int-to-string num)}")

(deftype kind (star) (kfun kind kind))

(defn kind= [a b]
    (match (, a b)
        (, (star) (star))           true
        (, (kfun a b) (kfun a' b')) (if (kind= a a')
                                        (kind= b b')
                                            false)
        _                           false))

(defn kind->s [a]
    (match a
        (star)     "*"
        (kfun a b) "(${(kind->s a)}->${(kind->s b)})"))

(deftype tyvar (tyvar string kind))

(defn tyvar= [(tyvar name kind) (tyvar name' kind')]
    (if (= name name')
        (kind= kind kind')
            false))

(defn type->s [a]
    (match a
        (tvar (tyvar name kind) _) "${name} : ${(kind->s kind)}"
        (tapp target arg _)        "(${(type->s target)} ${(type->s arg)})"
        (tcon con _)               (tycon->s con)
        (tgen num _)               "gen${(int-to-string num)}"))

(defn type= [a b]
    (match (, a b)
        (, (tvar ty _) (tvar ty' _))                  (tyvar= ty ty')
        (, (tapp target arg _) (tapp target' arg' _)) (if (type= target target')
                                                          (type= arg arg')
                                                              false)
        (, (tcon tycon _) (tcon tycon' _))            (tycon= tycon tycon')
        (, (tgen n _) (tgen n' _))                    (= n n')))

(deftype tycon (tycon string kind))

(defn tycon= [(tycon name kind) (tycon name' kind')]
    (if (= name name')
        (kind= kind kind')
            false))

(defn tycon->s [(tycon name kind)] "${name} : ${(kind->s kind)}")

(defn star-con [name] (tcon (tycon name star) -1))

(defn type/kind [type]
    (match type
        (tcon tc _)  (tycon/kind tc)
        (tvar u _)   (tyvar/kind u)
        (tapp t _ l) (match (type/kind t)
                         (kfun _ k) k
                         _          (fatal "Invalid type application ${(int-to-string l)}"))))

(** ## Some Builtin Types **)

(def tunit (star-con "()"))

(def tchar (star-con "char"))

(def tint (star-con "int"))

(def tbool (star-con "bool"))

(def tfloat (star-con "float"))

(def tinteger (star-con "integer"))

(def tdouble (star-con "double"))

(def tlist (tcon (tycon "[]" (kfun star star)) -1))

(def tarrow (tcon (tycon "(->)" (kfun star (kfun star star))) -1))

(def ttuple2 (tcon (tycon "(,)" (kfun star (kfun star star))) -1))

(def tstring (tapp tlist tchar -1))

(defn tfn [a b] (tapp (tapp tarrow a -1) b -1))

(defn mklist [t] (tapp tlist t -1))

(defn mkpair [a b] (tapp (tapp ttuple2 a -1) b -1))

(defn tyvar/kind [(tyvar v k)] k)

(defn tycon/kind [(tycon v k)] k)

;(typealias subst (array (, tyvar type)))

(def nullSubst [])

(defn |-> [u t] (map/set map/nil u t))

;(defn abc/apply [subst abc] abc)

;(defn abc/tv [t] (array tyvar))

(defn type/apply [subst type]
    (match type
        (tvar tyvar _)        (match (map/get subst tyvar)
                                  (none)      type
                                  (some type) type)
        (tapp target arg loc) (tapp (type/apply subst target) (type/apply subst arg) loc)
        _                     type))

(** ## Prelude **)

(defn list/get [arr i]
    (match (, arr i)
        (, [one .._] 0)  one
        (, [_ ..rest] i) (if (<= i 0)
                             (fatal "Index out of range")
                                 (list/get rest (- i 1)))))

(defn map/ok [f arr]
    (match arr
        []           (ok [])
        [one ..rest] (match (f one)
                         (ok val) (match (map/ok f rest)
                                      (ok rest) (ok [val ..rest])
                                      (err e)   (err e))
                         (err e)  (err e))))

(defn find-some [f arr]
    (match arr
        []           (none)
        [one ..rest] (match (f one)
                         (some v) (some v)
                         _        (find-some f rest))))

(defn concat [arrays]
    (match arrays
        []                      []
        [[] ..rest]             (concat rest)
        [[one ..rest] ..arrays] [one ..(concat [rest ..arrays])]))

(defn any [f arr]
    (match arr
        []           false
        [one ..rest] (if (f one)
                         true
                             (any f rest))))

(defn map/has [map key]
    (match (map/get map key)
        (some _) true
        _        false))

(defn not [v]
    (if v
        false
            true))

(defn array= [a' b' eq]
    (match (, a' b')
        (, [one ..rest] [two ..rest']) (if (eq one two)
                                           (array= rest rest' eq)
                                               false)
        _                              false))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(deftype (result good bad) (ok good) (err bad))

(deftype (option a) (some a) (none))

(defn filter [f arr]
    (match arr
        []           []
        [one ..rest] (if (f one)
                         [one ..(filter f rest)]
                             (filter f rest))))

(defn find [arr f]
    (match arr
        []           (none)
        [one ..rest] (if (f one)
                         (some one)
                             (find rest f))))

(defn all [f items]
    (match items
        []           true
        [one ..rest] (if (f one)
                         (all f rest)
                             false)))

(defn map [f items]
    (match items
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(defn mapi [f i items]
    (match items
        []           []
        [one ..rest] [(f one i) ..(mapi f (+ i 1) rest)]))

(** ## Type Unification **)

(def matchPred (lift type-match))

(def mguPred (lift mgu))

(defn lift [m (isin i t) (isin i' t')]
    (if (= i i')
        (m t t')
            (fatal "classes differ")))

(defn pred/tv [(isin i t)] (type/tv t))

(defn pred/apply [subst (isin i t)] (isin i (type/apply subst t)))

(defn qual/tv [(=> preds t) t/tv]
    (foldl (t/tv t) preds (fn [tv pred] (set/merge tv (pred/tv pred)))))

(defn qual/apply [subst (=> preds t) t/apply]
    (=> (map (pred/apply subst) preds) (t/apply subst t)))

(defn pred= [(isin id type) (isin id' type')]
    (if (= id id')
        (type= type type')
            false))

(deftype pred (isin string type))

(defn qual= [(=> preds t) (=> preds' t') t=]
    (if (array= preds preds' pred=)
        (t= t t')
            false))

(deftype (qual t) (=> (array pred) t))

(defn type-match [t1 t2]
    (** We're trying to find a substitution that will turn t1 into t2  **)
        (match (, t1 t2)
        (, (tapp l r loc) (tapp l' r' _)) (match (type-match l l')
                                              (ok sl) (match (type-match r r')
                                                          (ok sr) (ok (merge sl sr loc))
                                                          err     err)
                                              err     err)
        (, (tvar u _) t)                  (if (kind= (tyvar/kind u) (type/kind t))
                                              (ok (|-> u t))
                                                  (err "Different Kinds"))
        (, (tcon tc1 _) (tcon tc2 _))     (if (tycon= tc1 tc2)
                                              (ok map/nil)
                                                  (err
                                                  "Unable to match types ${(tycon->s tc1)} and ${(tycon->s tc2)}"))))

(defn type/tv [t]
    (match t
        (tvar u _)   (set/add set/nil u)
        (tapp l r _) (set/merge (type/tv l) (type/tv r))
        _            set/nil))

(defn compose-subst [s1 s2]
    (map/merge (map/map (type/apply s1) s2) s1))

(defn set/intersect [one two]
    (filter (fn [k] (set/has two k)) (set/to-list one)))

(defn merge [s1 s2 l]
    (let [
        agree (all
                  (fn [v] (= (type/apply s1 (tvar v l)) (type/apply s2 (tvar v l))))
                      (set/intersect
                      (set/from-list (map/keys s1))
                          (set/from-list (map/keys s2))))]
        (if agree
            (map/merge s1 s2)
                (fatal "merge failed"))))

(defn varBind [u t]
    (match t
        (tvar name _) (if (= name u)
                          map/nil
                              (|-> u t))
        _             (if (set/has (type/tv t) u)
                          (fatal "Occurs check fails")
                              (if (!= (tyvar/kind u) (type/kind t))
                              (fatal "kinds do not match")
                                  (|-> u t)))))

(defn mgu [t1 t2]
    (match (, t1 t2)
        (, (tapp l r _) (tapp l' r' _)) (match (mgu l l')
                                            (err e) (err e)
                                            (ok s1) (match (mgu (type/apply s1 r) (type/apply s1 r'))
                                                        (err e) (err e)
                                                        (ok s2) (ok (compose-subst s2 s1))))
        ;(let [s1 (mgu l l') s2 (mgu (type/apply s1 r) (type/apply s1 r'))]
            (compose-subst s2 s1))
        (, (tvar u l) t)                (ok (varBind u t))
        (, t (tvar u l))                (ok (varBind u t))
        (, (tcon tc1 _) (tcon tc2 _))   (if (= tc1 tc2)
                                            (ok map/nil)
                                                (err "Incompatible types ${(tycon->s tc1)} vs ${(tycon->s tc2)}")))
        )

;(defalias class (, (array string) (array (qual pred))))

;(defalias inst (qual pred))

(** ## Type Class stuff **)

(def class/ord
    (,
        ["eq"]
            [(=> [] (isin "ord" tunit))
            (=> [] (isin "ord" tchar))
            (=> [] (isin "ord" tint))
            (=>
            [(isin "ord" (tvar (tyvar "a" star) -1))
                (isin "ord" (tvar (tyvar "b" star) -1))]
                (isin "ord" (mkpair (tvar (tyvar "a" star) -1) (tvar (tyvar "b" star) -1))))]))

(deftype class-env
    (class-env
        (map string (, (array string) (array (qual pred))))
            (array type)))

(defn supers [(class-env classes _) id]
    (match (map/get classes id)
        (some (, is its)) is
        _                 (fatal "Unknown class ${id}")))

(defn insts [(class-env classes _) id]
    (match (map/get classes id)
        (some (, is its)) its
        _                 (fatal "Unknown class ${id}")))

(defn defined [opt]
    (match opt
        (some _) true
        _        false))

(defn modify [(class-env classes defaults) i c]
    (class-env (map/set classes i c) defaults))

(def initial-env (class-env map/nil [tinteger tdouble]))

;(defalias env-transformer (fn [class-env] (option class-env)))

(defn compose-transformers [one two ce] (two (one ce)))

(defn add-class [(class-env classes defaults) (, name supers)]
    (match (map/get classes name)
        (some _) (fatal "class ${name} already defined")
        _        (match (find supers (fn [name] (not (map/has classes name))))
                     (some super_) (fatal "Superclass not defined ${super_}")
                     _             (class-env (map/set classes name (, supers [])) defaults))))

(def add-prelude-classes
    (compose-transformers core-classes num-classes))

(defn core-classes [env]
    (foldl
        env
            [(, "eq" [])
            (, "ord" ["eq"])
            (, "show" [])
            (, "read" [])
            (, "bounded" [])
            (, "enum" [])
            (, "functor" [])
            (, "monad" [])]
            add-class))

(defn num-classes [env]
    (foldl
        env
            [(, "num" ["eq" "show"])
            (, "real" ["num" "ord"])
            (, "fractional" ["num"])
            (, "integral" ["real" "enum"])
            (, "realfrac" ["real" "fractional"])
            (, "floating" ["fractional"])
            (, "realfloat" ["realfrac" "floating"])]
            add-class))

(add-prelude-classes initial-env)

(core-classes initial-env)

(defn overlap [p q]
    (match (mguPred p q)
        (ok _) true
        _      false))

(defn add-inst [preds p (class-env classes defaults)]
    (let [(isin name supers) p]
        (match (map/get classes name)
            (none)                          (fatal "no class ${name} for instance")
            (some (, c-supers c-instances)) (let [
                                                c  (, c-supers [(=> preds (isin name supers)) ..c-instances])
                                                qs (map (fn [(=> _ q)] q) c-instances)]
                                                (if (any (overlap p) qs)
                                                    (fatal "overlapping instance")
                                                        (class-env (map/set classes name c) defaults))))))

(defn apply-transformers [transformers env]
    (foldl env transformers (fn [env f] (f env))))

(def example-insts
    [(add-inst [] (isin "ord" tunit))
        (add-inst [] (isin "ord" tchar))
        (add-inst [] (isin "ord" tint))
        (add-inst
        [(isin "ord" (tvar (tyvar "a" star) -1))
            (isin "ord" (tvar (tyvar "b" star) -1))]
            (isin "ord" (mkpair (tvar (tyvar "a" star) -1) (tvar (tyvar "b" star) -1))))])

(defn by-super [ce pred]
    (let [
        (isin i t)           pred
        (class-env supers _) ce
        (, got _)            (match (map/get supers i)
                                 (some s) s
                                 _        (fatal "Unknown name ${i}"))]
        [pred ..(concat (map (fn [i'] (by-super ce (isin i' t))) got))]))

(defn by-inst [ce pred]
    (let [
        (isin i t)            pred
        (class-env classes _) ce
        (, _ insts)           (match (map/get classes i)
                                  (some s) s
                                  _        (fatal "unknown name ${i}"))]
        (find-some
            (fn [(=> ps h)]
                (match (matchPred h pred)
                    (err _) (none)
                    (ok u)  (some (map (pred/apply u) ps))))
                insts)))

(defn entail [ce ps p]
    (if (any (any (pred= p)) (map (by-super ce) ps))
        true
            (match (by-inst ce p)
            (none)    false
            (some qs) (all (entail ce ps) qs))))

(** ## Simplification **)

(defn type/hnf [type]
    (match type
        (tvar _ _)   true
        (tcon _ _)   false
        (tapp t _ _) (type/hnf t)))

(defn in-hnf [(isin _ t)] (type/hnf t))

(defn to-hnfs [ce ps]
    (match (map/ok (to-hnf ce) ps)
        (err e) (err e)
        (ok v)  (ok (concat v))))

(defn to-hnf [ce p]
    (if (in-hnf p)
        (ok [p])
            (match (by-inst ce p)
            (none)    (err "context reduction")
            (some ps) (to-hnfs ce ps))))

(defn simplify-inner [ce rs preds]
    (match preds
        []       rs
        [p ..ps] (if (entail ce (concat [rs ps]) p)
                     (simplify-inner ce rs ps)
                         (simplify-inner ce [p ..rs] ps))))

(defn simplify [ce] (simplify-inner ce []))

(defn reduce [ce ps]
    (match (to-hnfs ce ps)
        (ok qs) (ok (simplify ce qs))
        (err e) (err e)))

(defn sc-entail [ce ps p] (any (any (pred= p)) (map (by-super ce) ps)))

(** ## Type Schemes **)

(deftype scheme (forall (array kind) (qual type)))

(defn scheme= [(forall kinds qual) (forall kinds' qual')]
    (if (array= kinds kinds' kind=)
        (qual= qual qual' type=)
            false))

(defn scheme/apply [subst (forall ks qt)]
    (forall ks (qual/apply subst qt type/apply)))

(defn scheme/tv [(forall ks qt)] (qual/tv qt type/tv))

(defn quantify [vs qt]
    (let [
        vs'   (filter (fn [v] (any (tyvar= v) vs)) (set/to-list (qual/tv qt type/tv)))
        ks    (map tyvar/kind vs')
        subst (map/from-list (mapi (fn [v i] (, v (tgen i -1))) 0 vs'))]
        (forall ks (qual/apply subst qt type/apply))))

(defn to-scheme [t] (forall [] (=> [] t)))

(deftype assump (!>! string scheme))

(defn assump/apply [subst (!>! id sc)]
    (!>! id (scheme/apply subst sc)))

(defn assump/tv [(!>! id sc)] (scheme/tv sc))

(defn find-scheme [id assumps]
    (match assumps
        []                    (err "Unbound identifier ${id}")
        [(!>! id' sc) ..rest] (if (= id id')
                                  (ok sc)
                                      (find-scheme id rest))))

(** ## Monad alert **)

(deftype type-env
    (type-env (map string scheme) (map string scheme)))

(deftype (TI a)
    (TI
        (fn [(map tyvar type) type-env int]
            (result (,,, (map tyvar type) type-env int a) string))))

(defn unify [t1 t2]
    (TI
        (fn [subst tenv nidx]
            (match (mgu (type/apply subst t1) (type/apply subst t2))
                (ok v)  (ok (,,, (compose-subst v subst) tenv nidx 0))
                (err e) (err
                            "Unable to unify ${(type->s t1)} and ${(type->s t2)}\n-> ${e}")))))

(defn new-tvar [kind]
    (TI
        (fn [subst tenv nidx]
            (let [v (tyvar (enumId nidx) kind)]
                (ok (,,, subst tenv (+ nidx 1) (tvar v -1)))))))

(def get-subst (TI (fn [subst tenv n] (ok (,,, subst tenv n subst)))))

(defn ext-subst [s']
    (TI (fn [subst tenv n] (ok (,,, (compose-subst s' subst) tenv n 0)))))

(defn ti-run [(TI f) subst tenv nidx] (f subst tenv nidx))

(defn ti-return [x]
    (TI (fn [subst tenv nidx] (ok (,,, subst tenv nidx x)))))

(defn map/ti [f arr]
    (match arr
        []           (TI (fn [s t n] (ok (,,, s t n []))))
        [one ..rest] (TI
                         (fn [subst tenv nidx]
                             (match (ti-run (f one) subst tenv nidx)
                                 (ok (,,, subst tenv nidx value)) (match (ti-run (map/ti f rest) subst tenv nidx)
                                                                      (ok (,,, subst tenv nidx results)) (ok (,,, subst tenv nidx [value ..results]))
                                                                      (err e)                            (err e))
                                 (err e)                          (err e))))))

(defn ti-then [ti next]
    (TI
        (fn [subst tenv nidx]
            (match (ti-run ti subst tenv nidx)
                (err e)                          (err e)
                (ok (,,, subst tenv nidx value)) (ti-run (next value) subst tenv nidx)))))

(defn result-then [res next]
    (match res
        (ok v)  (next v)
        (err e) (err e)))

(defn fresh-inst [(forall ks qt)]
    (let-> [ts (ti-then (map/ti new-tvar ks))]
        (ti-return (inst/qual ts inst/type qt))))

(defn inst/type [types type]
    (match type
        (tapp l r loc) (tapp (inst/type types l) (inst/type types r) loc)
        (tgen n _)     (list/get types n)
        t              t))

(defn inst/qual [types inst/t (=> ps t)]
    (=> (inst/preds types ps) (inst/t types t)))

(defn inst/preds [types preds] (map (inst/pred types) preds))

(defn inst/pred [types (isin c t)] (isin c (inst/type types t)))

;(defalias
    (infer e t)
        (fn [class-env (array assump) e] (TI (, (array pred) t))))

(defn ntv [kind] (ti-then (new-tvar kind)))

(defn tenv/constr [(type-env constrs _) name]
    (map/get constrs name))

(defn tenv/value [(type-env _ values) name] (map/get values name))

(** ## Inference! **)

(defn infer/prim [prim]
    (match prim
        (pbool _ _) (ti-return (, [] tbool))
        (pint _ _)  (let-> [v (ntv star)] (ti-return (, [(isin "num" v)] v)))))

(defn infer/pats [pats]
    (let-> [psasts (ti-then (map/ti infer/pat pats))]
        (let [
            ps (concat (map (fn [(,, ps' _ _)] ps') psasts))
            as (concat (map (fn [(,, _ as' _)] as') psasts))
            ts (map (fn [(,, _ _ t)] t) psasts)]
            (ti-return (,, ps as ts)))))

(defn infer/pat [pat]
    (match pat
        (pvar name l)          (let-> [v (ntv star)] (ti-return (,, [] [(!>! name (to-scheme v))] v)))
        (pany l)               (let-> [v (ntv star)] (ti-return (,, [] [] v)))
        ; (pas name inner l)
        (pprim prim l)         (let-> [(, ps t) (ti-then (infer/prim prim))] (ti-return (,, ps [] t)))
        (pcon name patterns l) (TI
                                   (fn [subst tenv nidx]
                                       (match (tenv/constr tenv name)
                                           (none)        (fatal "Unknonwn constructor ${name}")
                                           (some scheme) (ti-run
                                                             (let-> [
                                                                 (,, ps as ts) (ti-then (infer/pats patterns))
                                                                 t'            (ntv star)
                                                                 (=> qs t)     (ti-then (fresh-inst scheme))
                                                                 _             (ti-then (unify t (foldr t' ts tfn)))]
                                                                 (ti-return (,, (concat [ps qs]) as t')))
                                                                 subst
                                                                 tenv
                                                                 nidx))))))

(defn ti-fail [e] (TI (fn [a b c] (err e))))

(defn infer/expr [ce as expr]
    (match expr
        (evar name l)          (match (find-scheme name as)
                                   (err e) (TI
                                               (fn [subst tenv nidx]
                                                   (match (tenv/value tenv name)
                                                       (none)        (err "Unbound variable ${name}")
                                                       (some scheme) (ti-run
                                                                         (let-> [(=> ps t) (ti-then (fresh-inst scheme))] (ti-return (, ps t)))
                                                                             subst
                                                                             tenv
                                                                             nidx))))
                                   (ok sc) (let-> [(=> ps t) (ti-then (fresh-inst sc))] (ti-return (, ps t))))
        (eprim prim l)         (infer/prim prim)
        (eapp target arg l)    (let-> [
                                   (, ps te) (ti-then (infer/expr ce as target))
                                   (, qs tf) (ti-then (infer/expr ce as arg))
                                   t         (ntv star)
                                   _         (ti-then (unify (tfn tf t) te))]
                                   (ti-return (, (concat [ps qs]) t)))
        (elet pat init body l) (let-> [(, ps as') (infer/pat pat)])))