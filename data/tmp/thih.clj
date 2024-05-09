(** ## Prelude **)

(defn list/get [arr i]
    (match (, arr i)
        (, [one .._] 0)  one
        (, [_ ..rest] i) (if (<= i 0)
                             (fatal "Index out of range")
                                 (list/get rest (- i 1)))
        (, [] _)         (fatal
                             "Unable to get index ${(int-to-string i)} from empty list")))

(deftype (result good bad) (ok good) (err bad))

(deftype (,, a b c) (,, a b c))

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

(defn join [sep items]
    (match items
        []           ""
        [one ..rest] (match rest
                         [] one
                         _  (++ [one sep (join sep rest)]))))

(join " " ["one" "two" "three"])

(join " " [])

(join " " ["one"])

(foldr nil [1 2 3 4] (fn [b a] (cons a b)))

(defn rev [arr col]
    (match arr
        []           col
        [one]        [one ..col]
        [one ..rest] (rev rest [one ..col])))

(defn pairs [list]
    (match list
        []               []
        [one two ..rest] [(, one two) ..(pairs rest)]
        _                (fatal "Pairs given odd number ${(valueToString list)}")))

(defn snd [tuple] (let [(, _ v) tuple] v))

(defn fst [tuple] (let [(, v _) tuple] v))

(defn zip [one two]
    (match (, one two)
        (, [a ..one] [b ..two]) [(, a b) ..(zip one two)]
        _                       []))

(defn replaces [target repl]
    (match repl
        []           target
        [one ..rest] (match one
                         (, find nw) (replaces (replace-all target find nw) rest))))

(defn partition [arr test]
    (match arr
        []           (, [] [])
        [one ..rest] (let [(, yes no) (partition rest test)]
                         (if (test one)
                             (, [one ..yes] no)
                                 (, yes [one ..no])))))

(defn every [arr f]
    (match arr
        []           true
        [one ..rest] (if (f one)
                         (every rest f)
                             false)))

(defn contains [arr item item=]
    (match arr
        []           false
        [one ..rest] (if (item= one item)
                         true
                             (contains rest item item=))))

(defn without [base remove x=]
    (filter (fn [x] (not (contains remove x x=))) base))

(defn head [arr]
    (match arr
        [one .._] one
        _         (fatal "head of empty list")))

(defn zipWith [f left right]
    (match (, left right)
        (, [] [])                      []
        (, [one ..left] [two ..right]) [(f one two) ..(zipWith f left right)]))

(defn foldr1 [f lst]
    (match lst
        []           (fatal "Empty list to foldr1")
        [one]        one
        [one two]    (f one two)
        [one ..rest] (f one (foldr1 f rest))))

(defn intersect [t= one two] (filter (fn [v] (contains two v t=)) one))

(defn result->s [v->s v]
    (match v
        (ok v)  (v->s v)
        (err e) e))

(** ## Our AST **)

(deftype cst
    (cst/list (list cst) int)
        (cst/array (list cst) int)
        (cst/record (list cst) int)
        (cst/spread cst int)
        (cst/id string int)
        (cst/string string (list (,, cst string int)) int))

(deftype (list a) (nil) (cons a (list a)))

(typealias id string)

(deftype (,,, a b c d) (,,, a b c d))

(typealias alt (, (list pat) expr))

(typealias impl (, id (list alt)))

(typealias expl (,, id scheme (list alt)))

(typealias bindgroup (, (list expl) (list (list impl))))

(deftype expr
    (eprim prim int)
        (estr string (list (,, expr string int)) int)
        (evar string int)
        (equot expr int)
        (equot/stmt stmt int)
        (equot/pat pat int)
        (equot/type type int)
        (equotquot cst int)
        (elambda (list pat) expr int)
        (eapp expr (list expr) int)
        (elet bindgroup expr int)
        (ematch expr (list (, pat expr)) int))

(deftype prim (pint int int) (pfloat float int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string (list pat) int)
        (pstr string int)
        (pprim prim int))

(deftype type
    (tvar tyvar int)
        (tapp type type int)
        (tcon tycon int)
        (tgen int int))

(deftype stmt
    (sdeftype
        string
            int
            (list (, string int))
            (list (,,, string int (list type) int))
            int)
        (stypealias string int (list (, string int)) type int)
        (sdef string int expr int)
        (sexpr expr int)
        (sdefinstance
        string
            int
            type
            (list pred)
            (list (,, string int expr))
            int)
        (sdefclass string int (list (, string type))))

;(lol)

;(definstance (Types Pred)
    {apply (fn [s (isin i t)] (isin i (apply s t))) tv (fn [(isin i t)] (tv t))})

;(definstance (=> (Types a) (Types (list a)))
    {
        apply (fn [s] (map (apply s)))
        tv    (fn [t] (foldl set/nil (map tv t) set/merge))})

;(defclass (Types t) {apply (fn [subst t] t) tv (fn [t] (list tyvar))})

(** Ok so for "instance declarations"
    instance (something =>) something where
        the functions are then implemented
    in a runtime way, we want ... to produce something like
    register$instance(unique-id, { apply: (a, b) => c, tv: (a) => v }
    So the unique-id can be the loc, which is kinda neat. **)

(defn enumId [num] "v${(int-to-string num)}")

(deftype kind (star) (kfun kind kind))

(deftype tyvar (tyvar string kind))

(deftype tycon (tycon string kind))

(** ## deriving eq and show ... lol **)

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

(defn tyvar= [(tyvar name kind) (tyvar name' kind')]
    (if (= name name')
        (kind= kind kind')
            false))

(defn tyvar->s [(tyvar name kind)]
    (match kind
        (star) name
        _      "[${name} : ${(kind->s kind)}]"))

(defn type->fn [type]
    (match type
        (tapp (tapp (tcon (tycon "(->)" _) _) arg _) result _) (match (type->fn result)
                                                                   (, args result) (, [arg ..args] result))
        _                                                      (, [] type)))

(defn unwrap-tapp [target args]
    (match target
        (tapp a b _) (unwrap-tapp a [b ..args])
        _            (, target args)))

(type->fn (tfn tint (tfn tfloat tbool)))

(def letters ["a" "b" "c" "d" "e" "f" "g" "h" "i"])

(defn at [i lst]
    (match lst
        []           (fatal "index out of range")
        [one ..rest] (if (<= i 0)
                         one
                             (at (- i 1) rest))))

(defn gen-name [num] "${(at num letters)}")

(defn type-loc [type]
    (match type
        (tvar _ l)   l
        (tapp _ _ l) l
        (tcon _ l)   l
        (tgen _ l)   l))

(defn type->s' [show-kind type]
    (match type
        (tvar (tyvar name kind) _) "(var ${name} ${(kind->s kind)})"
        (tapp target arg _)        (match (type->fn type)
                                       (, [] _)        (let [(, target args) (unwrap-tapp target [arg])]
                                                           "(${(type->s' show-kind target)} ${(join " " (map (type->s' show-kind) args))})")
                                       (, args result) "(fn [${(join " " (map (type->s' show-kind) args))}] ${(type->s' show-kind result)})")
        (tcon (tycon "[]" _) _)    "list"
        (tcon (tycon name k) _)    (if show-kind
                                       "${name} [${(kind->s k)}]"
                                           name)
        (tcon con _)               (tycon->s con)
        (tgen num _)               (gen-name num)))

(type->s tstring)

(type->s (mkpair tint tbool))

(type->s (tfn tint (tfn tfloat tbool)))

(def type->s (type->s' false))

(def type-debug->s (type->s' true))

(defn type= [a b]
    (match (, a b)
        (, (tvar ty _) (tvar ty' _))                  (tyvar= ty ty')
        (, (tapp target arg _) (tapp target' arg' _)) (if (type= target target')
                                                          (type= arg arg')
                                                              false)
        (, (tcon tycon _) (tcon tycon' _))            (tycon= tycon tycon')
        (, (tgen n _) (tgen n' _))                    (= n n')
        _                                             false))

(defn tycon= [(tycon name kind) (tycon name' kind')]
    (if (= name name')
        (kind= kind kind')
            false))

(defn tycon->s [(tycon name kind)]
    (match kind
        (star) name
        _      "[${name} : ${(kind->s kind)}]"))

(defn star-con [name] (tcon (tycon name star) -1))

(defn qual->s [t->s (=> preds t)]
    "${(match preds
        [] ""
        _  "${(join "; " (map pred->s preds))} |=> ")}${(t->s t)}")

(defn assump->s [(!>! name (forall kinds (=> preds type)))]
    "${name}: ${(match kinds
        [] ""
        _  "${(join
               "; "
                   (mapi (fn [kind i] "${(gen-name i)} ${(kind->s kind)}") 0 kinds))}; ")}${(match preds
        [] ""
        _  "${(join "; " (map pred->s preds))}; ")}${(type->s type)}")

(defn type/kind [type]
    (match type
        (tcon tc _)  (tycon/kind tc)
        (tvar u _)   (tyvar/kind u)
        (tapp t _ l) (match (type/kind t)
                         (kfun _ k) k
                         _          (fatal
                                        "Invalid ssssssssssssssssssstype application ${(int-to-string l)} while trying to determine the kind of ${(type->s type)}: ${(type->s t)} isn't a kfun."))))

(defn type/valid? [type]
    (match type
        (tcon _ _)     true
        (tvar _ _)     true
        (tapp t arg _) (match (type/kind t)
                           (kfun ka res) (if (type/valid? t)
                                             (if (type/valid? arg)
                                                 (kind= ka (type/kind arg))
                                                     false)
                                                 false)
                           _             false)))

(typealias subst (list (, tyvar type)))

(def nullSubst [])

(defn |-> [u t] (map/set map/nil u t))

;(defn abc/apply [subst abc] abc)

;(defn abc/tv [t] (list tyvar))

(defn type/apply [subst type]
    (match type
        (tvar tyvar _)        (match (map/get subst tyvar)
                                  (none)      type
                                  (some type) type)
        (tapp target arg loc) (tapp (type/apply subst target) (type/apply subst arg) loc)
        _                     type))

(typealias class (, (list string) (list (qual pred))))

(typealias inst (qual pred))

(def types->s (dot (join "\n") (map type->s)))

(def assumps->s (dot (join "\n") (map assump->s)))

(** ## Some Builtin Types **)

(def tunit (star-con "()"))

(def tchar (star-con "char"))

(def tint (star-con "int"))

(def tbool (star-con "bool"))

(def tfloat (star-con "float"))

(def tinteger (star-con "int"))

(def tdouble (star-con "double"))

(def tlist (tcon (tycon "list" (kfun star star)) -1))

(def tarrow (tcon (tycon "(->)" (kfun star (kfun star star))) -1))

(def ttuple2 (tcon (tycon "," (kfun star (kfun star star))) -1))

(def tstring (star-con "string"))

(defn tfn [a b] (tapp (tapp tarrow a -1) b -1))

(defn mklist [t] (tapp tlist t -1))

(defn mkpair [a b] (tapp (tapp ttuple2 a -1) b -1))

(defn tyvar/kind [(tyvar v k)] k)

(defn tycon/kind [(tycon v k)] k)

(** ## Parsing **)

(** ## Types **)

(defn parse-type [type]
    (match type
        (cst/id id l)                                          (tcon (tycon id star) l)
        (cst/list [] l)                                        (fatal "(parse-type) with empty list")
        (cst/list [(cst/id "fn" _) (cst/array args _) body] _) (foldl
                                                                   (parse-type body)
                                                                       (rev args [])
                                                                       (fn [body arg] (tfn (parse-type arg) body)))
        (cst/list items l)                                     (tapps (rev (map parse-type items) []) l)
        _                                                      (fatal "(parse-type) Invalid type ${(valueToString type)}")))

(defn tapps [items l]
    (match items
        [one]        one
        [one ..rest] (tapp (tapps rest l) one l)))

(defn tstar [name] (tycon name star))

(,
    parse-type
        [(,
        (@@ (hi ho))
            (tapp
            (tcon (tycon "hi" (star)) 10930)
                (tcon (tycon "ho" (star)) 10931)
                10929))
        (,
        (@@ (fn [x] y))
            (tapp
            (tapp
                (tcon (tycon "(->)" (kfun (star) (kfun (star) (star)))) -1)
                    (tcon (tycon "x" (star)) 10952)
                    -1)
                (tcon (tycon "y" (star)) 10953)
                -1))
        (,
        (@@ (fn [a b] c))
            (tapp
            (tapp
                (tcon (tycon "(->)" (kfun (star) (kfun (star) (star)))) -1)
                    (tcon (tycon "a" (star)) 10982)
                    -1)
                (tapp
                (tapp
                    (tcon (tycon "(->)" (kfun (star) (kfun (star) (star)))) -1)
                        (tcon (tycon "b" (star)) 10983)
                        -1)
                    (tcon (tycon "c" (star)) 10984)
                    -1)
                -1))])

(defn parse-pat [pat]
    (match pat
        (cst/id "_" l)                        (pany l)
        (cst/id "true" l)                     (pprim (pbool true l) l)
        (cst/id "false" l)                    (pprim (pbool false l) l)
        (cst/string first [] l)               (pstr first l)
        (cst/id id l)                         (match (string-to-int id)
                                                  (some int) (pprim (pint int l) l)
                                                  _          (pvar id l)
                                                  )
        (cst/array [] l)                      (pcon "nil" [] l)
        (cst/array [(cst/spread inner _)] _)  (parse-pat inner)
        (cst/array [one ..rest] l)            (pcon "cons" [(parse-pat one) (parse-pat (cst/array rest l))] l)
        (cst/list [(cst/id name _) ..rest] l) (pcon name (map parse-pat rest) l)
        _                                     (fatal "parse-pat mo match ${(valueToString pat)}")))

(parse-pat (@@ [1 2 ..a]))

(** ## Expressions **)

(defn parse-expr [cst]
    (match cst
        (cst/id "true" l)                                           (eprim (pbool true l) l)
        (cst/id "false" l)                                          (eprim (pbool false l) l)
        (cst/string first templates l)                              (estr
                                                                        first
                                                                            (map
                                                                            (fn [tpl] (let [(,, expr string l) tpl] (,, (parse-expr expr) string l)))
                                                                                templates)
                                                                            l)
        (cst/id id l)                                               (match (string-to-int id)
                                                                        (some int) (eprim (pint int l) l)
                                                                        (none)     (match (string-to-float id)
                                                                                       (some v) (eprim (pfloat v l) l)
                                                                                       _        (evar id l)))
        (cst/list [(cst/id "@" _) body] l)                          (equot (parse-expr body) l)
        (cst/list [(cst/id "@@" _) body] l)                         (equotquot body l)
        (cst/list [(cst/id "@!" _) body] l)                         (equot/stmt (parse-stmt body) l)
        (cst/list [(cst/id "@t" _) body] l)                         (equot/type (parse-type body) l)
        (cst/list [(cst/id "@p" _) body] l)                         (equot/pat (parse-pat body) l)
        (cst/list [(cst/id "if" _) cond yes no] l)                  (ematch
                                                                        (parse-expr cond)
                                                                            [(, (pprim (pbool true l) l) (parse-expr yes)) (, (pany l) (parse-expr no))]
                                                                            l)
        (cst/list [(cst/id "fn" _) (cst/array args _) body]  b)     (elambda (map parse-pat args) (parse-expr body) b)
        (cst/list [(cst/id "fn" _) .._] l)                          (fatal "Invalid 'fn' ${(int-to-string l)}")
        (cst/list [(cst/id "match" _) target ..cases] l)            (ematch
                                                                        (parse-expr target)
                                                                            (map
                                                                            (fn [case] (let [(, pat expr) case] (, (parse-pat pat) (parse-expr expr))))
                                                                                (pairs cases))
                                                                            l)
        (cst/list [(cst/id "let" _) (cst/array inits _) body] l)    (foldr
                                                                        (parse-expr body)
                                                                            (pairs inits)
                                                                            (fn [body init]
                                                                            (let [(, pat value) init]
                                                                                (match pat
                                                                                    (cst/id name l) (elet (, [] [[(, name [(, [] (parse-expr value))])]]) body l)
                                                                                    _               (ematch (parse-expr value) [(, (parse-pat pat) body)] l)))))
        (cst/list [(cst/id "letrec" _) (cst/array inits _) body] l) (elet
                                                                        (,
                                                                            []
                                                                                [(map
                                                                                (fn [(, pat value)]
                                                                                    (match pat
                                                                                        (cst/id name l) (, name [(, [] (parse-expr value))])))
                                                                                    (pairs inits))])
                                                                            (parse-expr body)
                                                                            l)
        (cst/list [(cst/id "let->" _) (cst/array inits _) body] l)  (foldr
                                                                        (parse-expr body)
                                                                            (pairs inits)
                                                                            (fn [body init]
                                                                            (let [(, pat value) init]
                                                                                (eapp (parse-expr value) [(elambda [(parse-pat pat)] body l)] l))))
        (cst/list [(cst/id "let" _) .._] l)                         (fatal "Invalid 'let' ${(int-to-string l)}")
        (cst/list [target ..args] l)                                (match args
                                                                        [] (parse-expr target)
                                                                        _  (eapp (parse-expr target) (map parse-expr args) l))
        (cst/list [] l)                                             (evar "()" l)
        (cst/array args l)                                          (parse-array args l)))

(parse-expr (@@ (fn [a] 1)))

(defn parse-array [args l]
    (match args
        []                     (evar "nil" l)
        [(cst/spread inner _)] (parse-expr inner)
        [one ..rest]           (eapp (evar "cons" l) [(parse-expr one) (parse-array rest l)] l)))

(,
    parse-expr
        [(, (@@ true) (eprim (pbool true 11729) 11729))
        (,
        (@@ [1 ..b])
            (eapp
            (evar "cons" 11741)
                [(eprim (pint 1 11742) 11742) (evar "b" 11744)]
                11741))
        (, (@@ "hi") (estr "hi" [] 11772))
        (, (@@ (@t a)) (equot/type (tcon (tycon "a" (star)) 11786) 11784))
        (,
        (@@ (@t (a b c)))
            (equot/type
            (tapp
                (tapp (tcon (tycon "a" (star)) 11802) (tcon (tycon "b" (star)) 11803) 11801)
                    (tcon (tycon "c" (star)) 11804)
                    11801)
                11799))
        (, (@@ (@p _)) (equot/pat (pany 11835) 11833))
        (,
        (@@
            (if (= a b)
                a
                    b))
            (ematch
            (eapp (evar "=" 11849) [(evar "a" 11850) (evar "b" 11851)] 11848)
                [(, (pprim (pbool true 11846) 11846) (evar "a" 11852))
                (, (pany 11846) (evar "b" 11853))]
                11846))
        (,
        (@@ "a${1}b")
            (estr "a" [(,, (eprim (pint 1 11909) 11909) "b" 11910)] 11907))
        (,
        (@@ [1 2])
            (eapp
            (evar "cons" 11933)
                [(eprim (pint 1 11934) 11934)
                (eapp
                (evar "cons" 11933)
                    [(eprim (pint 2 11935) 11935) (evar "nil" 11933)]
                    11933)]
                11933))
        (, (@@ 12) (eprim (pint 12 11981) 11981))
        (,
        (@@
            (match 2
                1 2))
            (ematch
            (eprim (pint 2 11995) 11995)
                [(, (pprim (pint 1 11996) 11996) (eprim (pint 2 11997) 11997))]
                11993))
        (, (@@ abc) (evar "abc" 12029))
        (,
        (@@ (let [a 1 b 2] a))
            (elet
            (, [] [[(, "a" [(, [] (eprim (pint 1 12043) 12043))])]])
                (elet (, [] [[(, "b" [(, [] (eprim (pint 2 12045) 12045))])]]) (evar "a" 12046) 12044)
                12042))
        (,
        (@@ (let-> [v hi] v2))
            (eapp
            (evar "hi" 12090)
                [(elambda [(pvar "v" 12089)] (evar "v2" 12091) 12086)]
                12086))
        (,
        (@@ (fn [a] 1))
            (elambda [(pvar "a" 12134)] (eprim (pint 1 12135) 12135) 12131))
        (,
        (@@ (fn [a b] 2))
            (elambda
            [(pvar "a" 12156) (pvar "b" 12157)]
                (eprim (pint 2 12158) 12158)
                12153))
        (,
        (@@ (fn [(, a b)] a))
            (elambda
            [(pcon "," [(pvar "a" 12187) (pvar "b" 12188)] 12185)]
                (evar "a" 12189)
                12182))
        (,
        (@@ (+ 1 2))
            (eapp
            (evar "+" 12233)
                [(eprim (pint 1 12234) 12234) (eprim (pint 2 12235) 12235)]
                12232))
        (,
        (@@ (int-to-string 23))
            (eapp
            (evar "int-to-string" 12266)
                [(eprim (pint 23 12267) 12267)]
                12265))
        (,
        (@@ (let [x 2] x))
            (elet (, [] [[(, "x" [(, [] (eprim (pint 2 12291) 12291))])]]) (evar "x" 12292) 12290))
        (,
        (@@ (let [(, a b) (, 2 3)] 1))
            (ematch
            (eapp
                (evar "," 12325)
                    [(eprim (pint 2 12326) 12326) (eprim (pint 3 12327) 12327)]
                    12324)
                [(,
                (pcon "," [(pvar "a" 12322) (pvar "b" 12323)] 12320)
                    (eprim (pint 1 12328) 12328))]
                12317))
        (, (@@ (@@ 1)) (equotquot (cst/id "1" 12386) 12384))
        (, (@@ (@ 1)) (equot (eprim (pint 1 12401) 12401) 12399))])

(parse-expr (@@ (@! 12)))

(defn mk-deftype [id li args items l]
    (sdeftype
        id
            li
            (map
            (fn [arg]
                (match arg
                    (cst/id name l) (, name l)
                    _               (fatal "deftype type argument must be identifier")))
                args)
            (foldr
            []
                items
                (fn [res constr]
                (match constr
                    (cst/list [(cst/id name ni) ..args] l) [(,,, name ni (map parse-type args) l) ..res]
                    (cst/list [] l)                        res
                    _                                      (fatal "Invalid type constructor"))))
            l))

;((sdefinstance
    string
        int
        type
        (array pred)
        (array (,, string int expr))
        int)
    (sdefclass string int (array (, string type))))

(defn splitlast [arr]
    (match arr
        []           (fatal "empty splitlast")
        [one]        (, [] one)
        [one ..rest] (let [(, more last) (splitlast rest)] (, [one ..more] last))))

(defn fix-kinds [kind type]
    (match type
        (tcon (tycon n _) l) (tcon (tycon n kind) l)
        (tapp target arg l)  (tapp (fix-kinds (kfun star kind) target) (fix-kinds star arg) l)))

(** ## Statements **)

(defn parse-stmt [cst]
    (match cst
        (cst/list [(cst/id "def" _) (cst/id id li) value] l)                            (sdef id li (parse-expr value) l)
        (cst/list [(cst/id "defn" a) (cst/id id li) (cst/array args b) body] c)         (sdef
                                                                                            id
                                                                                                li
                                                                                                (parse-expr (cst/list [(cst/id "fn" a) (cst/array args b) body] c))
                                                                                                c)
        (cst/list [(cst/id "defn" _) .._] l)                                            (fatal "Invalid 'defn' ${(int-to-string l)}")
        (cst/list [(cst/id "deftype" _) (cst/id id li) ..items] l)                      (mk-deftype id li [] items l)
        (cst/list
            [(cst/id "deftype" _) (cst/list [(cst/id id li) ..args] _) ..items]
                l) (mk-deftype id li args items l)
        (cst/list [(cst/id "deftype" _) .._] l)                                         (fatal "Invalid 'deftype' ${(int-to-string l)}")
        (cst/list
            [(cst/id "definstance" _)
                (cst/list [(cst/id cls cl) typ] _)
                (cst/record items _)]
                l) (sdefinstance
                                                                                            cls
                                                                                                cl
                                                                                                (fix-kinds star (parse-type typ))
                                                                                                []
                                                                                                (map
                                                                                                (fn [(, name value)]
                                                                                                    (match name
                                                                                                        (cst/id name l) (,, name l (parse-expr value))
                                                                                                        _               (fatal "Invalid record name")))
                                                                                                    (pairs items))
                                                                                                l)
        (cst/list
            [(cst/id "definstance" _)
                (cst/list [(cst/id "=>" _) ..predlist] _)
                (cst/record items _)]
                l) (let [
                                                                                            (, preds (isin name typ)) (splitlast
                                                                                                                          (map
                                                                                                                              (fn [pred]
                                                                                                                                  (match pred
                                                                                                                                      (cst/list [(cst/id cls cl) typ] _) (isin cls (fix-kinds star (parse-type typ)))
                                                                                                                                      _                                  (fatal "Invalid predicate ${(its l)}")))
                                                                                                                                  predlist))]
                                                                                            (sdefinstance
                                                                                                name
                                                                                                    l
                                                                                                    typ
                                                                                                    preds
                                                                                                    (map
                                                                                                    (fn [(, name value)]
                                                                                                        (match name
                                                                                                            (cst/id name l) (,, name l (parse-expr value))
                                                                                                            _               (fatal "Invalid record name")))
                                                                                                        (pairs items))
                                                                                                    l))
        _                                                                               (sexpr
                                                                                            (parse-expr cst)
                                                                                                (match cst
                                                                                                (cst/list _ l)     l
                                                                                                (cst/id _ l)       l
                                                                                                (cst/array _ l)    l
                                                                                                (cst/string _ _ l) l
                                                                                                (cst/spread _ l)   l))))

(,
    parse-stmt
        [(, (@@ (def a 2)) (sdef "a" 12708 (eprim (pint 2 12709) 12709) 12706))
        (,
        (@@ (deftype what (one int) (two bool)))
            (sdeftype
            "what"
                12729
                []
                [(,,, "one" 12731 [(tcon (tycon "int" (star)) 12732)] 12730)
                (,,, "two" 12734 [(tcon (tycon "bool" (star)) 12735)] 12733)]
                12727))
        (,
        (@@ (deftype (array a) (nil) (cons (array a))))
            (sdeftype
            "array"
                12775
                [(, "a" 12776)]
                [(,,, "nil" 12778 [] 12777)
                (,,,
                "cons"
                    12780
                    [(tapp
                    (tcon (tycon "array" (star)) 12782)
                        (tcon (tycon "a" (star)) 12783)
                        12781)]
                    12779)]
                12772))
        (,
        (@@ (+ 1 2))
            (sexpr
            (eapp
                (evar "+" 12829)
                    [(eprim (pint 1 12830) 12830) (eprim (pint 2 12831) 12831)]
                    12828)
                12828))
        (,
        (@@ (defn a [m] m))
            (sdef
            "a"
                12866
                (elambda [(pvar "m" 12868)] (evar "m" 12869) 12864)
                12864))
        (,
        (@@ (definstance (pretty int) {show-pretty string-to-int}))
            (sdefinstance
            "pretty"
                29193
                (tcon (tycon "int" (star)) 29194)
                []
                [(,, "show-pretty" 29250 (evar "string-to-int" 29251))]
                29190))
        (,
        (@@ (definstance (pretty (, a b)) {a b}))
            (sdefinstance
            "pretty"
                30790
                (tapp
                (tapp
                    (tcon (tycon "," (kfun (star) (kfun (star) (star)))) 30782)
                        (tcon (tycon "a" (star)) 30788)
                        30781)
                    (tcon (tycon "b" (star)) 30784)
                    30781)
                []
                [(,, "a" 30786 (evar "b" 30787))]
                30779))
        (,
        (@@
            (definstance (=> (types a) (types (array a)))
                {
                    apply (fn [s] (map (apply s)))
                    tv    (fn [s] (foldl set/nil (map s tv) set/merge))}))
            (sdefinstance
            "types"
                29398
                (tapp
                (tcon (tycon "array" (kfun (star) (star))) 29294)
                    (tcon (tycon "a" (star)) 29295)
                    29293)
                [(isin "types" (tcon (tycon "a" (star)) 29290))]
                [(,,
                "apply"
                    29297
                    (elambda
                    [(pvar "s" 29301)]
                        (eapp
                        (evar "map" 29303)
                            [(eapp (evar "apply" 29305) [(evar "s" 29306)] 29304)]
                            29302)
                        29298))
                (,,
                "tv"
                    29307
                    (elambda
                    [(pvar "s" 29311)]
                        (eapp
                        (evar "foldl" 29313)
                            [(evar "set/nil" 29314)
                            (eapp (evar "map" 29316) [(evar "s" 29317) (evar "tv" 29318)] 29315)
                            (evar "set/merge" 29319)]
                            29312)
                        29308))]
                29398))])

(@@ (definstance (pretty int) {show-pretty string-to-int}))

(@@
    (definstance (=> (types a) (types (array a)))
        {
            apply (fn [s] (map (apply s)))
            tv    (fn [s] (foldl set/nil (map s tv) set/merge))}))

11183

(** ## Debugging Helpers **)

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
        (elet _ _ l)     l
        (eapp _ _ l)     l
        (ematch _ _ l)   l))

(def its int-to-string)

(defn trace-and-block [loc trace value js]
    (match (map/get trace loc)
        (none)      js
        (some info) "$trace(${(its loc)}, ${(jsonify info)}, ${value});\n${js}"))

(defn trace-wrap [loc trace js]
    (match (map/get trace loc)
        (none)      js
        (some info) "$trace(${(its loc)}, ${(jsonify info)}, ${js})"))

(defn trace-and [loc trace value js]
    (match (map/get trace loc)
        (none)      js
        (some info) "($trace(${(its loc)}, ${(jsonify info)}, ${value}), ${js})"))

(defn source-map [loc js] "/*${(its loc)}*/${js}/*<${(its loc)}*/")

(** ## Compilation **)

(defn escape-string [string]
    (replaces
        string
            [(, "\\" "\\\\") (, "\n" "\\n") (, "\"" "\\\"") (, "`" "\\`") (, "$" "\\$")]))

(escape-string (unescapeString "\n"))

(defn pat-loop [target args i inner trace]
    (match args
        []           inner
        [arg ..rest] (compile-pat
                         arg
                             "${target}[${(its i)}]"
                             (pat-loop target rest (+ i 1) inner trace)
                             trace)))

(defn compile-pat [pat target inner trace]
    (trace-and-block
        (pat-loc pat)
            trace
            target
            (match pat
            (pany l)           inner
            (pprim prim l)     (match prim
                                   (pint int _)   "if (${target} === ${(its int)}) {\n${inner}\n}"
                                   (pbool bool _) "if (${target} === ${(match bool
                                                      true "true"
                                                      _    "false")}) {\n${inner}\n}")
            (pstr str l)       "if (${target} === \"${str}\"){\n${inner}\n}"
            (pvar name l)      "{\nlet ${(sanitize name)} = ${target};\n${inner}\n}"
            (pcon name args l) "if (${target}.type === \"${name}\") {\n${(pat-loop target args 0 inner trace)}\n}")))

(defn orr [default v]
    (match v
        (some v) v
        _        default))

(defn just-pat [pat]
    (match pat
        (pany _)           (none)
        (pvar name l)      (some (sanitize name))
        (pcon name args l) (match (foldl
                               (, 0 [])
                                   args
                                   (fn [(, i res) arg]
                                   (match (just-pat arg)
                                       (none)      (, (+ i 1) res)
                                       (some what) (, (+ i 1) ["${(its i)}: ${what}" ..res]))))
                               (, _ [])    none
                               (, _ items) (some "{${(join ", " (rev items []))}}"))
        (pstr _ _)         (fatal "Cant use string as a pattern in this location")
        (pprim _ _)        (fatal "Cant use primitive as a pattern in this location")))

(defn mapr [a b] (map b a))

;(defn concat [lists]
    (match lists
        []                     []
        [[] ..rest]            (concat rest)
        [[one ..rest] ..lists] [one ..(concat [rest ..lists])]))

(defn compile [expr trace]
    (let [loc (expr-loc expr)]
        (trace-wrap
            loc
                trace
                (match expr
                (estr first tpls l)           (match tpls
                                                  [] "\"${(escape-string (unescapeString first))}\""
                                                  _  "`${(escape-string (unescapeString first))}${(join
                                                         ""
                                                             (mapr
                                                             tpls
                                                                 (fn [item]
                                                                 (let [(,, expr suffix l) item]
                                                                     "${${(compile expr trace)}}${(escape-string (unescapeString suffix))}"))))}`")
                (eprim prim l)                (match prim
                                                  (pint int _)     (int-to-string int)
                                                  (pfloat float _) (jsonify float)
                                                  (pbool bool _)   (match bool
                                                                       true  "true"
                                                                       false "false"))
                (evar name l)                 (sanitize name)
                (equot inner l)               (jsonify inner)
                (equot/stmt inner l)          (jsonify inner)
                (equot/type inner l)          (jsonify inner)
                (equot/pat inner l)           (jsonify inner)
                (equotquot inner l)           (jsonify inner)
                (elambda pats body l)         "function lambda_${(its l)}(${(join
                                                  ") { return function lambda_${(its l)}("
                                                      (mapi (fn [pat i] (orr "_${(int-to-string i)}" (just-pat pat))) 0 pats))}) { return ${(compile body trace)} ${(join "" (map (fn [_] "}") pats))}"
                (elet (, [] inferred) body l) (foldl
                                                  (compile body trace)
                                                      (concat inferred)
                                                      (fn [body (, name [(, [] init)])]
                                                      "(function let_${(its l)}() {const ${(sanitize name)} = ${(compile init trace)};\n${("return ${body}"
                                                          ;(compile-pat pat "$target" "return ${body}" trace))};\nthrow new Error('let pattern not matched. ' + valueToString($target));\n})()"))
                (eapp fn args l)              (let [args (join ")(" (map (fn [arg] (compile arg trace)) args))]
                                                  (match fn
                                                      (elambda _ _ _) "(${(compile fn trace)})(${args})"
                                                      _               "${(compile fn trace)}(${args})"))
                (ematch target cases l)       "(function match_${(its l)}($target) {\n${(join
                                                  "\n"
                                                      (mapr
                                                      cases
                                                          (fn [case]
                                                          (let [(, pat body) case]
                                                              (compile-pat pat "$target" "return ${(compile body trace)}" trace)))))}\nthrow new Error('failed to match ' + jsonify($target) + '. Loc: ${(its l)}');\n})(${(compile target trace)})"))))

(compile
    (parse-expr
        (@@
            (match 2
                1 2))
            )
        map/nil)

(parse-expr (@@ (let [a 1 b 2] (+ a b))))

(compile (parse-expr (@@ (let [a 1 b 2] (+ a b)))) map/nil)

(compile (parse-expr (@@ ((fn [a] (+ a 2)) 21))) map/nil)

(defn run [v] (eval (compile (parse-expr v) map/nil)))

(,
    run
        [(, (@@ (jsonify 1)) "1")
        (, (@@ "hello") "hello")
        (, (@@ "\"") "\"")
        (, (@@ "\n") "\n")
        (, (@@ "\\n") "\\n")
        (, (@@ "\\\n") "\\\n")
        (, (@@ (jsonify (+ 2 3))) "5")
        (, (@@ "a${2}b") "a2b")
        (, (@@ (jsonify ((fn [a] (+ a 2)) 21))) "23")
        (, (@@ (jsonify (let [one 1 two 2] (+ 1 2)))) "3")
        (,
        (@@
            (jsonify
                (match 2
                    2 1)))
            "1")
        (, (@@ (jsonify (let [a/b 2] a/b))) "2")
        (,
        (@@
            (jsonify
                (match true
                    true 1
                    2    3)))
            "1")
        (, (@@  "`${1}") "`1")
        (, (@@ "${${1}") "${1")
        (,
        (@@
            (jsonify
                (match [1]
                    []      []
                    [a ..b] a)))
            "1")])

(defn compile-stmt [stmt trace]
    (match stmt
        (sexpr expr l)                               (compile expr trace)
        (sdef name nl body l)                        (++ ["const " (sanitize name) " = " (compile body trace) ";\n"])
        (stypealias _ _ _ _ _)                       "/* type alias */"
        (sdefinstance name nl type preds inst-fns l) "$_.registerInstance(\"${name}\", ${(its l)}, {${(join
                                                         ", "
                                                             (map
                                                             (fn [(,, name l fn)] "${(sanitize name)}: ${(compile fn trace)}")
                                                                 inst-fns))}})"
        (sdeftype name nl type-arg cases l)          (join
                                                         "\n"
                                                             (mapr
                                                             cases
                                                                 (fn [case]
                                                                 (let [(,,, name2 nl args l) case]
                                                                     (++
                                                                         ["const "
                                                                             (sanitize name2)
                                                                             " = "
                                                                             (++ (mapi (fn [_ i] (++ ["(v" (int-to-string i) ") => "])) 0 args))
                                                                             "({type: \""
                                                                             name2
                                                                             "\""
                                                                             (++
                                                                             (mapi
                                                                                 (fn [_ i] (++ [", " (int-to-string i) ": v" (int-to-string i)]))
                                                                                     0
                                                                                     args))
                                                                             "});"])))))))

(,
    (fn [x] (compile-stmt (parse-stmt x) map/nil))
        [(,
        (@@ (deftype (array a) (cons a (array a)) (nil)))
            "const cons = (v0) => (v1) => ({type: \"cons\", 0: v0, 1: v1});\nconst nil = ({type: \"nil\"});")
        (,
        (@@ (deftype face (red) (black)))
            "const red = ({type: \"red\"});\nconst black = ({type: \"black\"});")])

(** ## Type Unification **)

(** Some more types **)

(deftype pred (isin string type))

(defn qual= [(=> preds t) (=> preds' t') t=]
    (if (array= preds preds' pred=)
        (t= t t')
            false))

(deftype (qual t) (=> (list pred) t))

(defn pred->s [(isin name type)] "${(type->s type)} ∈ ${name}")

(defn pred= [(isin id type) (isin id' type')]
    (if (= id id')
        (type= type type')
            false))

(def matchPred (lift type-match))

(def mguPred (lift mgu))

(defn lift [m (isin i t) (isin i' t')]
    (if (= i i')
        (m t t')
            (err (, "classes differ: ${i} vs ${i'}" []))))

(defn pred/tv [(isin i t)] (type/tv t))

(defn preds/tv [preds]
    (foldl set/nil preds (fn [res pred] (set/merge res (pred/tv pred)))))

(defn pred/apply [subst (isin i t)] (isin i (type/apply subst t)))

(defn qual/tv [(=> preds t) t/tv]
    (foldl (t/tv t) preds (fn [tv pred] (set/merge tv (pred/tv pred)))))

(defn qual/apply [subst (=> preds t) t/apply]
    (=> (map (pred/apply subst) preds) (t/apply subst t)))

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
                                                  (err
                                                  (,
                                                      "Different Kinds ${(kind->s (tyvar/kind u))} vs ${(kind->s (type/kind t))}"
                                                          [])))
        (, (tcon tc1 _) (tcon tc2 _))     (if (tycon= tc1 tc2)
                                              (ok map/nil)
                                                  (err
                                                  (,
                                                      "Unable to match types ${(tycon->s tc1)} and ${(tycon->s tc2)}"
                                                          [])))
        _                                 (err
                                              (,
                                                  "Unable to match ${(type->s' true t1)} vs ${(type->s' true t2)}"
                                                      []))))

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
        (tvar name _) (ok
                          (if (= name u)
                              map/nil
                                  (|-> u t)))
        _             (if (set/has (type/tv t) u)
                          (err
                              (, "Occurs check fails: ${(type->s t)} contains ${(tyvar->s u)}" []))
                              (if (not (kind= (tyvar/kind u) (type/kind t)))
                              (err
                                  (,
                                      "kinds do not match: type variable ${(tyvar->s u)} has kind ${(kind->s (tyvar/kind u))}, but ${(type->s t)} has kind ${(kind->s (type/kind t))}"
                                          []))
                                  (ok (|-> u t))))))

(defn mgu [t1 t2]
    (match (, t1 t2)
        (, (tapp l r _) (tapp l' r' _)) (match (mgu l l')
                                            (err e) (err e)
                                            (ok s1) (match (mgu (type/apply s1 r) (type/apply s1 r'))
                                                        (err e) (err e)
                                                        (ok s2) (ok (compose-subst s2 s1))))
        (, (tvar u l) t)                (varBind u t)
        (, t (tvar u l))                (varBind u t)
        (, (tcon tc1 l1) (tcon tc2 l2)) (if (tycon= tc1 tc2)
                                            (ok map/nil)
                                                (err
                                                (,
                                                    "Incompatible types ${(tycon->s tc1)} vs ${(tycon->s tc2)}"
                                                        [(, l1 (tycon->s tc1)) (, l2 (tycon->s tc2))])))
        (, a b)                         (err (, "Cant unify ${(type->s a)} and ${(type->s b)}" []))))

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

((** class-env (map class-name (, supers instances) (default-types)
     **)
    deftype class-env
    (class-env
        (map string (, (list string) (list (qual pred)) (list (, string type))))
            (list type)))

(defn map/merge-deep [merge one two]
    (foldr
        two
            (map/to-list one)
            (fn [res (, k v)]
            (match (map/get res k)
                (none)    (map/set res k v)
                (some v2) (map/set res k (merge k v v2))))))

(defn class-env/merge [(class-env classes defaults) (class-env classes' defaults')]
    (class-env
        (map/merge-deep
            (fn [k (, super1 inst1 fns) (, super2 inst2 fns2)]
                (if (!= super1 super2)
                    (fatal "Cant merge classes for ${k}: superclasses differ")
                        (if (!= fns fns2)
                        (fatal "Cant merge classes for ${k}: isntance methods differ")
                            (, super1 (concat [inst1 inst2]) fns))))
                classes
                classes')
            (concat [defaults defaults'])))

(defn class-env/add-default [(class-env cls defaults) new-defaults]
    (class-env cls (concat [defaults new-defaults])))

(def class-env/nil (class-env map/nil []))

(def class-env/std (class-env ))

(defn supers [(class-env classes _) id]
    (match (map/get classes id)
        (some (, is its _)) is
        _                   (fatal "Unknown class ${id}")))

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

(def initial-env
    (class-env map/nil [tinteger tdouble tfloat tunit]))

;(defalias env-transformer (fn [class-env] (option class-env)))

(defn compose-transformers [one two ce] (two (one ce)))

(defn add-class [(class-env classes defaults) (, name supers fns)]
    (match (map/get classes name)
        (some _) (fatal "class ${name} already defined")
        _        (match (find supers (fn [name] (not (map/has classes name))))
                     (some super_) (fatal "Superclass not defined ${super_}")
                     _             (class-env (map/set classes name (, supers [] fns)) defaults))))

(def add-prelude-classes
    (compose-transformers core-classes num-classes))

(defn core-classes [env]
    (foldl
        env
            [(, "eq" [] [(, "=" (tfns [(tgen 0 -1) (tgen 0 -1)] tbool))])
            (, "ix" [] [])
            (, "ord" ["eq"] [])
            (, "show" [] [])
            (, "read" [] [])
            (, "pretty" [] [(, "show-pretty" (tfn (tgen 0 -1) tstring))])
            (, "bounded" [] [])
            (, "enum" [] [])
            (, "functor" [] [])
            (, "monad" [] [])]
            add-class))

(defn num-classes [env]
    (foldl
        env
            [(, "num" ["eq" "show"] [])
            (, "real" ["num" "ord"] [])
            (, "fractional" ["num"] [])
            (, "integral" ["real" "enum"] [])
            (, "realfrac" ["real" "fractional"] [])
            (, "floating" ["fractional"] [])
            (, "realfloat" ["realfrac" "floating"] [])]
            add-class))

(add-prelude-classes initial-env)

(core-classes initial-env)

(defn overlap [p q]
    (match (mguPred p q)
        (ok _) true
        _      false))

((** Add an instance to the class-env
    - preds is a list of predicates that need to be hold in order for the instance to exist
    - p **)
    defn add-inst [preconditions inst-pred (class-env classes defaults)]
    (let [(isin class-name _) inst-pred]
        (match (map/get classes class-name)
            (none)                              (fatal
                                                    "no class '${class-name}' found, when trying to add instance. Known classes: ${(join ", " (map/keys classes))}")
            (some (, c-supers c-instances fns)) (let [
                                                    c  (, c-supers [(=> preconditions inst-pred) ..c-instances] fns)
                                                    qs (map (fn [(=> _ q)] q) c-instances)]
                                                    (match (find qs (overlap inst-pred))
                                                        (some other) (fatal
                                                                         "overlapping instance: ${(pred->s inst-pred)} and ${(pred->s other)}")
                                                        _            (class-env (map/set classes class-name c) defaults))))))

(defn just-this-class [(class-env classes _) name]
    (match (map/get classes name)
        (none)                  (fatal "class not found")
        (some (, supers _ fns)) (class-env (map/set map/nil name (, supers [] fns)) [])))

(defn apply-transformers [transformers env]
    (foldl env transformers (fn [env f] (f env))))

(defn unwrap-tuple [f (, a b)] (f a b))

(defn wrap-tuple [f a b] (f (, a b)))

(def example-insts
    [(add-inst [] (isin "ord" tunit))
        (add-inst [] (isin "ord" tchar))
        (add-inst [] (isin "integral" tint))
        (add-inst [] (isin "num" tint))
        (add-inst [] (isin "floating" tfloat))
        (add-inst
        [(isin "ord" (tvar (tyvar "a" star) -1))
            (isin "ord" (tvar (tyvar "b" star) -1))]
            (isin "ord" (mkpair (tvar (tyvar "a" star) -1) (tvar (tyvar "b" star) -1))))])

(defn by-super [ce pred]
    (** I still don't really know what the point of super-types is. **)
        (let [
        (isin i t)           pred
        (class-env supers _) ce
        (, got _)            (match (map/get supers i)
                                 (some s) s
                                 _        (fatal "Unknown class '${i}' in predicate [by-super]"))]
        [pred ..(concat (map (fn [i'] (by-super ce (isin i' t))) got))]))

(def builtin-env
    (apply-transformers
        example-insts
            (add-prelude-classes initial-env)))

(by-super builtin-env (isin "num" tint))

(by-inst builtin-env (isin "num" tint))

(defn by-inst [(class-env classes _) pred]
    (let [
        (isin i t)    pred
        (, _ insts _) (match (map/get classes i)
                          (some s) s
                          _        (fatal "Unknown class '${i}' in predicate [by-inst]"))]
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

(entail builtin-env [(isin "eq" tint)] (isin "num" tint))

(** ## Simplification **)

(defn type/hnf [type]
    (match type
        (tvar _ _)   true
        (tcon _ _)   false
        (tgen _ _)   (fatal "hnf got a tgen, shouldn't happen")
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
            (none)    (let [(isin name type) p]
                          (err
                              (,
                                  "Can't find an instance for class '${name}' for type ${(type->s type)}"
                                      [])))
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

(** ## Type Schemes **)

(deftype scheme (forall (list kind) (qual type)))

(defn scheme= [(forall kinds qual) (forall kinds' qual')]
    (if (array= kinds kinds' kind=)
        (qual= qual qual' type=)
            false))

(defn scheme->s [(forall kinds (=> preds t))]
    "${(match kinds
        [] ""
        _  "${(join " " (map kind->s kinds))}; ")}${(match preds
        [] ""
        _  "${(join " " (map pred->s preds))}; ")}${(type->s t)}")

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

(defn find-scheme [id assumps l]
    (match assumps
        []                    (err (, "Unbound identifier" [(, l id)]))
        [(!>! id' sc) ..rest] (if (= id id')
                                  (ok sc)
                                      (find-scheme id rest l))))

(** ## State monad **)

(deftype (StateT state err value)
    (StateT (fn [state] (, state (result value err)))))

(defn run-> [(StateT f) state]
    (let [(, state result) (f state)] (, state result)))

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

;(defn force [e->s result]
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

(** ## Type inference state **)

(typealias
    (State value)
        (** nidx
        types (recording what locs have what type)
        tenv (current type environment, so I don't have to pass it around...)
        subst (the current subst! adding a new subst uses compose-subst)
        predssss (the predicates we are collecting) **)
        (StateT
        (, int (list (, int type)) type-env (map tyvar type) (list pred))
            value))

(def <-idx (let-> [(, idx _) <-state] (<- idx)))

(defn idx-> [idx]
    (let-> [(, _ rest) <-state _ (state-> (, idx rest))] (<- ())))

(def <-types (let-> [(, _ types _) <-state] (<- types)))

(defn record-> [loc type]
    (let-> [
        (, idx types rest) <-state
        _                  (state-> (, idx [(, loc type) ..types] rest))]
        (<- ())))

(def <-tenv (let-> [(, _ _ tenv _) <-state] (<- tenv)))

(defn tenv-> [tenv]
    (let-> [(, a b _ d) <-state _ (state-> (, a b tenv d))] (<- ())))

(def <-subst (let-> [(, _ _ _ subst _) <-state] (<- subst)))

(defn subst-> [new-subst]
    (let-> [
        (, idx types tenv subst rest) <-state
        _                             (state-> (, idx types tenv (compose-subst new-subst subst) rest))]
        (<- ())))

(def <-preds (let-> [(, _ _ _ _ preds) <-state] (<- preds)))

(defn reset-preds-> [preds]
    (let-> [(, a b c d old) <-state _ (state-> (, a b c d preds))] (<- old)))

(defn preds-> [preds]
    (let-> [
        (, a b c d current) <-state
        _                   (state-> (, a b c d (bag/and current preds)))]
        (<- ())))

(defn pred-list-> [list] (preds-> (many (map one list))))

(def state/nil (, 0 [] type-env/nil map/nil empty))

(defn run/nil-> [x] (run-> x state/nil))

(def ti-return <-)

(** ## Monad alert **)

(deftype type-env
    ; (type...constructors) name => type 
        (type-env
        (map string scheme)
            ; (types) name => (, (array kind) (set name))
            (map string (, (list kind) (set string)))
            ; typealiases
            (map string (, (list kind) type))))

(def tenv/nil (type-env map/nil map/nil map/nil))

(def type-env/nil tenv/nil)

(defn tenv/merge [(type-env const_ types aliases)
    (type-env const' types' aliases')]
    (type-env
        (map/merge const_ const')
            (map/merge types types')
            (map/merge aliases aliases')))

(defn map-err [f v]
    (match v
        (ok _)  v
        (err e) (f e)))

(defn sequence [tis]
    (match tis
        []           (<- [])
        [one]        (let-> [res one] (<- [res]))
        [one ..rest] (let-> [res one rest (sequence rest)] (<- [res ..rest]))))

(defn unify [t1 t2]
    (let-> [
        subst <-subst
        u     (ok->
                  (map-err
                      (unify-err t1 t2)
                          (mgu (type/apply subst t1) (type/apply subst t2))))]
        (subst-> u)))

(defn unify-err [t1 t2 (, msg items)]
    (err
        (,
            "Unable to unify -> ${msg}"
                [(, (type-loc t1) (type-debug->s t1))
                (, (type-loc t2) (type-debug->s t2))
                ..items])))

(def add-subst subst->)

(def get-subst <-subst)

(def next-idx (let-> [nidx <-idx _ (idx-> (+ nidx 1))] (<- nidx)))

(defn new-tvar [kind]
    (let-> [nidx <-idx _ (idx-> (+ nidx 1))]
        (<- (tvar (tyvar (enumId nidx) kind) -1))))

(defn subst->s [subst]
    (join
        "\n"
            (map
            (fn [(, tyvar type)] "${(tyvar->s tyvar)} = ${(type->s type)}")
                (map/to-list subst))))

(defn ok>>= [res next]
    (match res
        (ok v)  (next v)
        (err e) (err e)))

(defn fresh-inst [(forall ks qt)]
    (let-> [ts (map-> new-tvar ks)] (<- (inst/qual ts inst/type qt))))

(defn fresh-inst-rec [scheme]
    (let-> [(=> preds t) (fresh-inst scheme) () (pred-list-> preds)] (<- t)))

(defn inst/type [types type]
    (match type
        (tapp l r loc) (tapp (inst/type types l) (inst/type types r) loc)
        (tgen n _)     (list/get types n)
        t              t))

(defn inst/qual [types inst/t (=> ps t)]
    (=> (inst/preds types ps) (inst/t types t)))

(defn inst/preds [types preds] (map (inst/pred types) preds))

(defn inst/pred [types (isin c t)] (isin c (inst/type types t)))

(defn tenv/constr [(type-env constrs _ _) name]
    (map/get constrs name))

(defn tenv/value [(type-env _ values _) name] (map/get values name))

(** ## Inference! **)

(defn infer/prim [prim]
    (match prim
        (pbool _ _)  (<- tbool)
        (pfloat _ _) (let-> [v (new-tvar star) () (preds-> (one (isin "floating" v) ))] (<- v))
        (pint _ _)   (let-> [v (new-tvar star) () (preds-> (one (isin "num" v) ))] (<- v))))

(defn infer/pats [pats]
    (let-> [psasts (map-> infer/pat pats)]
        (let [as (concat (map (fn [(, as' _)] as') psasts)) ts (map (fn [(, _ t)] t) psasts)]
            (<- (, as ts)))))

(defn get-constructor [name l]
    (let-> [tenv <-tenv]
        (match (tenv/constr tenv name)
            (none)        (<-err (, "Unknown constructor" [(, l name)]))
            (some scheme) (<- scheme))))

(defn infer/pat [pat]
    (match pat
        (pvar name l)          (let-> [v (new-tvar star)] (<- (, [(!>! name (to-scheme v))] v)))
        (pany l)               (let-> [v (new-tvar star)] (<- (, [] v)))
        ; (pas name inner l)
        (pprim prim l)         (let-> [t (infer/prim prim)] (<- (, [] t)))
        (pcon name patterns l) (let-> [
                                   scheme    (get-constructor name l)
                                   (, as ts) (infer/pats patterns)
                                   t'        (new-tvar star)
                                   t         (fresh-inst-rec scheme)
                                   _         (unify t (foldr t' ts (fn [res arg] (tfn arg res))))]
                                   (<- (, as t')))))

(defn unzip [list]
    (match list
        []               (, [] [])
        [(, a b) ..rest] (let [(, left right) (unzip rest)] (, [a ..left] [b ..right]))))

(defn infer/expr [ce as expr]
    (match expr
        (evar name l)            (let-> [sc (ok-> (find-scheme name as l)) t (fresh-inst-rec sc)] (<- t))
        (estr first templates l) (let-> [
                                     types  (map-> (infer/expr ce as) (map (fn [(,, expr _ _)] expr) templates))
                                     types' (map->
                                                (fn [_]
                                                    (fresh-inst-rec
                                                        (forall [star] (=> [(isin "pretty" (tgen 0 -1))] (tgen 0 -1)))))
                                                    types)
                                     _      (map-> (fn [(, a b)] (unify a b)) (zip types types'))]
                                     (<- tstring))
        (eprim prim l)           (infer/prim prim)
        (equot _ l)              (<- (star-con "expr"))
        (equot/stmt stmt int)    (<- (star-con "stmt"))
        (equot/pat pat int)      (<- (star-con "pat"))
        (equot/type type int)    (<- (star-con "type"))
        (equotquot cst int)      (<- (star-con "cst"))
        (eapp target args l)     (match args
                                     [arg]        (let-> [
                                                      target-type (infer/expr ce as target)
                                                      arg-type    (infer/expr ce as arg)
                                                      result-var  (new-tvar star)
                                                      _           (unify (tfn arg-type result-var) target-type)]
                                                      (<- result-var))
                                     [one ..rest] (infer/expr ce as (eapp (eapp target [one] l) rest l)))
        (elambda pats body l)    (infer/expr
                                     ce
                                         as
                                         (elet (, [] [[(, "lambda-arg" [(, pats body)])]]) (evar "lambda-arg" l) l))
        (ematch target cases l)  (infer/expr
                                     ce
                                         as
                                         (elet
                                         (, [] [[(, "match" (map (fn [(, pat body)] (, [pat] body)) cases))]])
                                             (eapp (evar "match" l) [target] l)
                                             l))
        (elet bindings body l)   (let-> [
                                     as' (infer/binding-group ce as bindings)
                                     t   (infer/expr ce (concat [as' as]) body)]
                                     (<- t))))

(defn infer/alt [ce as (, pats body)]
    (let-> [
        (, as' ts) (infer/pats pats)
        body       (infer/expr ce (concat [as' as]) body)]
        (let [res-type (foldr body ts (fn [res arg] (tfn arg res)))]
            (<- res-type))))

(defn infer/alts [ce as alts t]
    (let-> [
        old   (reset-preds-> empty)
        psts  ((map-> (infer/alt ce as) alts))
        ()    (do-> (unify t) psts)
        preds (reset-preds-> old)]
        (<- (bag/to-list preds))))

(defn infer/expl [ce as (,, i sc alts)]
    (let-> [
        (=> qs t) (fresh-inst sc)
        preds     (infer/alts ce as alts t)
        subst     <-subst]
        (let [
            qs' (preds/apply subst qs)
            t'  (type/apply subst t)
            fs  (set/to-list
                    (foldr1 set/merge (map assump/tv (map (assump/apply subst) as))))
            gs  (without (set/to-list (type/tv t')) fs tyvar=)
            sc' (quantify gs (=> qs' t'))
            ps' (filter (fn [x] (not (entail ce qs' x))) (preds/apply subst preds))]
            (let-> [(, ds rs) ((split ce fs gs ps'))]
                (if (!= sc sc')
                    (<-err (, "signature too general" []))
                        (match rs
                        [] (<- ds)
                        _  (<-err (, "context too weak" []))))))))

(defn infer/impls [class-env assumps bindings]
    (let-> [type-vars ((map-> (fn [_] (new-tvar star)) bindings))]
        (let [
            identifiers (map fst bindings)
            scs         (map toScheme type-vars)
            as'         (concat [(zipWith !>! identifiers scs) assumps])
            altss       (map snd bindings)]
            (let-> [
                pss ((sequence (zipWith (infer/alts class-env as') altss type-vars)))
                s   <-subst]
                (let [
                    ps' (preds/apply s (concat pss))
                    ts' (map (type/apply s) type-vars)
                    fs  (set/to-list
                            (foldl
                                set/nil
                                    (map (assump/apply s) assumps)
                                    (fn [res assumps] (set/merge res (assump/tv assumps)))))
                    vss (map type/tv ts')
                    gs  (without (set/to-list (foldr1 set/merge vss)) fs tyvar=)]
                    (let-> [
                        (, ds rs) ((** This intersect call is the part that makes it so that, if you have multiple bindings in a group,
                                      the only variables that can have typeclass constraints are ones that appear in every binding. **)
                                      (split
                                      class-env
                                          fs
                                          (foldr1 (intersect tyvar=) (map set/to-list vss))
                                          ps')
                                      )]
                        (if (restricted bindings)
                            (let-> [
                                gs'  (<- (without gs (set/to-list (preds/tv rs)) tyvar=))
                                scs' (<- (map (fn [x] (quantify gs' (=> [] x))) ts'))
                                ()   (pred-list-> (concat [ds rs]))]
                                (<- (zipWith !>! identifiers scs')))
                                (let-> [scs' (<- (map (fn [x] (quantify gs (=> rs x))) ts')) () (pred-list-> ds)]
                                (<- (zipWith !>! identifiers scs'))))))))))

(defn infer/binding-group [class-env as (, explicit implicits)]
    (let [
        expl-assumps (map (fn [(,, name scheme _)] (!>! name scheme)) explicit)]
        (let-> [
            impl-assumps (infer/seq
                             infer/impls
                                 class-env
                                 (concat [expl-assumps as])
                                 implicits)
            expl-preds   (map->
                             (infer/expl class-env (concat [impl-assumps expl-assumps as]))
                                 explicit)
            ()           (pred-list-> (concat expl-preds))]
            (<- (concat [impl-assumps expl-assumps])))))

(defn infer/seq [ti ce as assumptions]
    (match assumptions
        []         (<- [])
        [bs ..bss] (let-> [as' (ti ce as bs) as'' (infer/seq ti ce (concat [as' as]) bss)]
                       (<- (concat [as'' as'])))))

(defn run/tenv-> [tenv ti] (run-> ti (, 0 [] tenv map/nil empty)))

(defn infer/program [ce as bindgroups]
    (let-> [
        old     (reset-preds-> empty)
        assumps (infer/seq infer/binding-group ce as bindgroups)
        preds   (reset-preds-> old)
        subst0  <-subst
        reduced (ok-> (reduce ce (preds/apply subst0 (bag/to-list preds))))
        subst   (ok-> (defaultSubst ce [] reduced))]
        (<- (map (assump/apply (compose-subst subst subst0)) assumps))))

(** ## Type Classes Stuff **)

(defn split [ce fs gs ps]
    (let-> [
        ps'       (ok-> (reduce ce ps))
        (, ds rs) (<-
                      (partition
                          ps'
                              (fn [(isin name type)]
                              (every (set/to-list (type/tv type)) (fn [x] (contains fs x tyvar=))))))
        rs'       (ok-> (defaultedPreds ce (concat [fs gs]) rs))]
        (ti-return (, ds (without rs rs' pred= )))))

(typealias ambiguity (, tyvar (list pred)))

(defn ambiguities [known-variables preds]
    (map
        (fn [v]
            (,
                v
                    (filter
                    (fn [pred] (contains (set/to-list (pred/tv pred)) v tyvar=))
                        preds)))
            (without (set/to-list (preds/tv preds)) known-variables tyvar=)))

(def numClasses
    ["num"
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

(defn candidates [ce (, v qs)]
    (let [
        (class-env _ defaults) ce
        is                     (map (fn [(isin i _)] i) qs)
        ts                     (map (fn [(isin _ t)] t) qs)]
        (if (not
            (every
                [(all (type= (tvar v -1)) ts)
                    (any (fn [x] (contains numClasses x =)) is)
                    (all (fn [x] (contains stdClasses x =)) is)]
                    (fn [x] x)))
            []
                (filter (fn [t'] (all (entail ce []) (map (fn [i] (isin i t')) is))) defaults))))

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
                "${(tyvar->s a)} is in predicates: ${(join ";" (map pred->s preds))}")
                vps)))

(defn is-empty [x]
    (match x
        [] true
        _  false))

(defn withDefaults [f ce known-variables predicates]
    (let [
        vps (ambiguities known-variables predicates)
        tss (map (candidates ce) vps)]
        (if (any is-empty tss)
            (err
                (,
                    "Cannot resolve ambiguities: ${(vps->s vps)} defaults for variables: ${(tss->s tss)} with known variables: ${(join "; " (map tyvar->s known-variables))}"
                        []))
                (ok (f vps (map head tss))))))

(def defaultedPreds (withDefaults (fn [vps ts] (concat (map snd vps)))))

(def defaultSubst
    (withDefaults (fn [vps ts] (map/from-list (zip (map fst vps) ts)))))

(defn restricted [bindings]
    (** If any alternative isn't a function (no argument patterns), then this binding group can't be polymorphic. **)
        (let [
        simple (fn [(, i alternatives)]
                   (any
                       (fn [(, arguments _)]
                           (match arguments
                               [] true
                               _  false))
                           alternatives))]
        (any simple bindings)))

(defn toScheme [t] (forall [] (=> [] t)))

(defn preds/apply [subst preds] (map (pred/apply subst) preds))

(** ## Builtins and such **)

(defn tmap [k v]
    (tapp
        (tapp (tcon (tycon "map" (kfun star (kfun star star))) -1) k -1)
            v
            -1))

(defn tfns [args res] (foldr res args (fn [res arg] (tfn arg res))))

(defn mk-pred [g0] (fn [name] (isin name g0)))

(defn generics [classes body]
    (,
        (map (fn [_] star) classes)
            (=>
            (concat (mapi (fn [cls i] (map (mk-pred (tgen i -1)) cls)) 0 classes))
                body)))

(defn generic [cls body] (generics [cls] body))

(def concrete (generics []))

(def g0 (tgen 0 -1))

(def g1 (tgen 1 -1))

(def g2 (tgen 2 -1))

(defn toption [v]
    (tapp (tcon (tycon "option" (kfun star star)) -1) v -1))

(defn tresult [ok err]
    (tapp
        (tapp (tcon (tycon "result" (kfun star (kfun star star))) -1) ok -1)
            err
            -1))

(defn mkcon [v] (tcon (tycon v star) -1))

(def tratio (tcon (tycon "ratio" (kfun star star)) -1))

(def trational (tapp tratio tint -1))

(defn tuple-scheme [(, kinds qual)] (forall kinds qual))

(def tuple-assump
    (fn [(, name (, kinds qual))] (!>! name (forall kinds qual))))

(def builtin-assumptions
    (let [
        map01   (tmap g0 g1)
        biNum   (generic ["num"] (tfns [g0 g0] g0))
        uNum    (generic ["num"] (tfn g0 g0))
        boolOrd (generic ["ord"] (tfns [g0 g0] tbool))
        boolEq  (generic ["eq"] (tfns [g0 g0] tbool))
        kv      (generics [["ord"] []])
        g       generics
        con     (generics [])
        float   (generic ["floating"])
        floatUn (float (tfn g0 g0))]
        (map
            tuple-assump
                [(, "+" biNum)
                (, "-" biNum)
                (, "*" biNum)
                (, "()" (generic [] tunit))
                (, "negate" uNum)
                (, "abs" uNum)
                (, "fromInt" (generic ["num"] (tfn tint g0)))
                (, "toInt" (generic ["integral"] (tfn g0 tint)))
                (, "/" (generic ["fractional"] (tfns [g0 g0] g0)))
                (, "pi" (float g0))
                (, "exp" floatUn)
                (, "log" floatUn)
                (, "sqrt" floatUn)
                (, "**" (float (tfns [g0 g0] g0)))
                (, "logBase" (float (tfns [g0 g0] g0)))
                (, "sin" floatUn)
                (, "cos" floatUn)
                (, "tan" floatUn)
                (, ">" boolOrd)
                (, ">=" boolOrd)
                (, "<" boolOrd)
                (, "<=" boolOrd)
                (, "max" (generic ["ord"] (tfns [g0 g0] g0)))
                (, "min" (generic ["ord"] (tfns [g0 g0] g0)))
                (,
                "compare"
                    (generic ["ord"] (tfns [g0 g0] (tcon (tycon "ordering" star) -1))))
                (, "=" boolEq)
                (, "!=" boolEq)
                (, "show" (generic ["show"] (tfn g0 tstring)))
                (, "range" (generic ["ix"] (tfn (mkpair g0 g0) (mklist g0))))
                (, "index" (generic ["ix"] (tfns [(mkpair g0 g0) g0] tint)))
                (, "inRange" (generic ["ix"] (tfns [(mkpair g0 g0) g0] tbool)))
                (, "rangeSize" (generic ["ix"] (tfns [(mkpair g0 g0)] tint)))
                (, "show-pretty" (generic ["pretty"] (tfn g0 tstring)))
                ; monadss
                (,
                "return"
                    (, [(kfun star star) star] (=> [(isin "monad" g0)] (tfn g1 (tapp g0 g1 -1)))))
                (,
                ">>="
                    (,
                    [(kfun star star) star star]
                        (=>
                        [(isin "monad" g0)]
                            (tfns [(tapp g0 g1 -1) (tfn g1 (tapp g0 g2 -1))] (tapp g0 g2 -1)))))
                (,
                ">>"
                    (,
                    [(kfun star star) star star]
                        (=>
                        [(isin "monad" g0)]
                            (tfns [(tapp g0 g1 -1) (tapp g0 g2 -1)] (tapp g0 g2 -1)))))
                (,
                "fail"
                    (,
                    [(kfun star star) star]
                        (=> [(isin "monad" g0)] (tfn tstring (tapp g0 g1 -1)))))
                ; maps
                (, "map/nil" (kv (tmap g0 g1)))
                (, "map/set" (kv (tfns [map01 g0 g1] map01)))
                (, "map/get" (kv (tfns [map01 g0] g1)))
                (, "map/map" (generics [["ord"] [] []] (tfns [map01 (tfn g1 g2)] (tmap g0 g2))))
                (, "map/merge" (kv (tfns [map01 map01] map01)))
                (, "map/values" (kv (tfns [map01] (tapp tlist g1 -1))))
                (, "map/keys" (kv (tfns [map01] (tapp tlist g0 -1))))
                (, "map/to-list" (kv (tfns [map01] (tapp tlist (mkpair g0 g1) -1))))
                (, "map/from-list" (kv (tfns [(tapp tlist (mkpair g0 g1) -1)] map01)))
                ; ok folks
                (, "nil" (g [[]] (mklist g0)))
                (, "cons" (g [[]] (tfns [g0 (mklist g0)] (mklist g0))))
                (, "," (g [[] []] (tfns [g0 g1] (mkpair g0 g1))))
                (, "false" (con tbool))
                (, "true" (con tbool))
                (, "ok" (g [[] []] (tfn g0 (tresult g0 g1))))
                (, "err" (g [[] []] (tfn g1 (tresult g0 g1))))
                (, "LT" (con (mkcon "ordering")))
                (, "EQ" (con (mkcon "ordering")))
                (, "GT" (con (mkcon "ordering")))
                ])))

(def builtin-instances
    (let [
        gen1      (fn [cls x] (generic [cls] (isin cls x)))
        gen2      (fn [cls x] (generics [[cls] [cls]] (isin cls x)))
        int-ratio (fn [x] (generic ["integral"] (isin x (tapp (mkcon "ratio") g0 -1))))
        eq        (gen1 "eq")
        eq2       (gen2 "eq")
        show      (gen1 "show")
        show2     (gen2 "show")
        list      (mklist g0)
        option    (toption g0)
        result    (tresult g0 g1)
        pair      (mkpair g0 g1)
        ix        (gen1 "ix")
        ix2       (gen2 "ix")]
        [(eq list)
            (eq option)
            (eq2 result)
            (int-ratio "eq")
            (eq2 pair)
            (gen1 "ord" list)
            (int-ratio "ord")
            (gen1 "ord" option)
            (gen2 "ord" result)
            (gen2 "ord" pair)
            (int-ratio "num")
            (int-ratio "real")
            (int-ratio "fractional")
            (int-ratio "realfrac")
            (show list)
            (show option)
            (show2 result)
            (int-ratio "show")
            (show2 pair)
            (ix2 pair)
            (generics [] (isin "monad" (tcon (tycon "option" (kfun star star)) -1)))
            (generics [] (isin "monad" (tcon (tycon "list" (kfun star star)) -1)))
            ..(concat
            (map
                (fn [(, cls names)] (map (fn [name] (, [] (=> [] (isin cls (mkcon name))))) names))
                    [(,
                    "eq"
                        ["unit" "char" "int" "float" "double" "bool" "ordering" "string"])
                    (,
                    "ord"
                        ["unit" "char" "int" "float" "double" "bool" "ordering" "string"])
                    (, "num" ["int" "float" "double"])
                    (, "real" ["int" "float" "double"])
                    (, "integral" ["int"])
                    (, "fractional" ["float" "double"])
                    (, "floating" ["float" "double"])
                    (, "realfrac" ["float" "double"])
                    (,
                    "show"
                        ["unit" "char" "int" "float" "double" "bool" "ordering" "string"])
                    (,
                    "pretty"
                        ["unit" "char" "int" "string" "float" "double" "bool" "ordering"])
                    (, "ix" ["unit" "char" "int" "bool" "ordering" "string"])]))]))

(defn dot [a b c] (a (b c)))

(** ## Puttin in all together **)

(defn parse-binding [jcst]
    (match jcst
        (cst/list [(cst/id "fn" l) (cst/array items _) body] _) (, "it" [(, (map parse-pat items) (parse-expr body))])
        _                                                       (, "it" [(, [] (parse-expr jcst))])))

(def builtin-ce
    (apply-transformers
        (map
            (fn [(, kinds qt)]
                (let [
                    tvars                        (mapi (fn [tv i] (tvar (tyvar (gen-name i) tv) -1)) 0 kinds)
                    (=> preconditions assertion) (inst/qual tvars inst/pred qt)]
                    (add-inst preconditions assertion)))
                builtin-instances)
            (add-prelude-classes initial-env)))

(def builtin-tenv
    (type-env
        (map/from-list
            [(, "ok" (tuple-scheme (generics [[] []] (tfn g0 (tresult g0 g1)))))
                (, "err" (tuple-scheme (generics [[] []] (tfn g1 (tresult g0 g1)))))
                (, "cons" (tuple-scheme (generics [[]] (tfns [g0 (mklist g0)] (mklist g0)))))
                (, "nil" (tuple-scheme (generics [[]] (mklist g0))))
                (, "," (tuple-scheme (generics [[] []] (tfns [g0 g1] (mkpair g0 g1)))))])
            (map/from-list
            [(, "int" (, [] set/nil))
                (, "double" (, [] set/nil))
                (, "list" (, [star] (set/from-list ["cons" "nil"])))
                (, "result" (, [star star] (set/from-list ["ok" "err"])))])
            map/nil))

(defn type-error->s [(, msg items)]
    "${msg}${(ljoin
        "\n - "
            (map (fn [(, loc name)] "${name} (${(int-to-string loc)})") items))}")

(def program-results->s
    (fn [(, (, a types tenv subst) result)]
        (match result
            (ok b)  (join "\n" (map assump->s b))
            (err e) "Error! ${(type-error->s e)}")))

(defn test-expr2 [v]
    (program-results->s
        (run/tenv->
            builtin-tenv
                (infer/program
                builtin-ce
                    builtin-assumptions
                    [(, [] [[(parse-binding v)]])])))
        )

(test-expr2 (@@ 2))

(,
    test-expr2
        [(, (@@ 11) "it: int")
        (, (@@ (< (, 2 1))) "it: (fn [(, int int)] bool)")
        (, (@@ (+ 1 2)) "it: int")
        (, (@@ (fn [a] (+ 1 a))) "it: a *; a ∈ num; (fn [a] a)")
        (, (@@ "Hello") "it: string")
        (, (@@ "My age is ${10} and hieght is ${1.12}") "it: string")
        (,
        (@@ (fn [x] (, (+ 1 x) "${x}")))
            "it: a *; a ∈ pretty; a ∈ num; (fn [a] (, a string))")
        (, (@@ (fn [a] "Hello ${a}")) "it: a *; a ∈ pretty; (fn [a] string)")
        (, (@@ (ok 1)) "it: a *; (result int a)")
        (,
        (@@
            (fn [a]
                (if a
                    1
                        2)))
            "it: a *; a ∈ num; (fn [bool] a)")
        (, (@@ [1]) "it: (list int)")
        (,
        (@@
            (match (ok 1)
                (ok v)  v
                (err e) 10))
            "it: int")
        (, (@@ (cons 1 [2.0])) "it: (list double)")
        (,
        (@@
            (match (, 1 true)
                (, a false) a
                (, _ true)  2))
            "it: int")
        (** Shadowing **)
        (, (@@ (let [a 2] (let [a "hi"] a))) "it: string")
        (,
        (@@ (fn [x] (return (, 2 x))))
            "it: a *; b (*->*); c *; c ∈ num; b ∈ monad; (fn [a] (b (, c a)))")
        (,
        (@@
            (letrec
                [even
                    (fn [x]
                    (if (< x 1)
                        true
                            (odd (- x 1))))
                    odd
                    (fn [x]
                    (if (< x 1)
                        true
                            (even (- x 1))))]
                    (even 10)))
            "it: bool")
        (,
        (@@ (fn [x] "${(return "")}"))
            "Error! Cannot resolve ambiguities: [v2 : (*->*)] is in predicates: ((var v2 (*->*)) string) ∈ pretty;(var v2 (*->*)) ∈ monad defaults for variables: [empty] with known variables: v1")
        (, (@@ (fn [x] (< (, "" "")))) "it: a *; (fn [a (, string string)] bool)")])

(** ## Producing the functions for an Evaluator **)

(deftype full-env (full-env type-env class-env (list assump)))

(def builtin-full
    (full-env builtin-tenv builtin-ce builtin-assumptions))

(def full-env/nil (full-env type-env/nil class-env/nil []))

filter

(defn infer-stmt [ce assumps stmt]
    (match stmt
        (sdef name nl body l)                  (let-> [
                                                   assumps (infer/program
                                                               ce
                                                                   assumps
                                                                   [(,
                                                                   []
                                                                       [[(,
                                                                       name
                                                                           [(match body
                                                                           (elambda pats inner l) (, pats inner)
                                                                           _                      (, [] body))])]])])]
                                                   (<-
                                                       (full-env
                                                           type-env/nil
                                                               class-env/nil
                                                               (filter (fn [(!>! n _)] (= n name)) assumps))))
        (stypealias name nl args type l)       (<- full-env/nil)
        (sdeftype name nl args constructors l) (infer-deftype (,,, name nl args constructors))
        (sdefinstance _ _ _ _ _ _)             (infer-sinst ce assumps stmt)
        (sexpr body l)                         (let-> [_ (infer/program ce assumps [(, [] [[(, "it" [(, [] body)])]])])]
                                                   (<- full-env/nil))))

(defn infer [ce assumps body]
    (let-> [assumps (infer/program ce assumps [(, [] [[(, "it" [(, [] body)])]])])]
        (match (filter (fn [(!>! n _)] (= n "it")) assumps)
            [(!>! n scheme)] (<- scheme)
            _                (<-err (, "No type found (for 'it')" [])))))

(defn infer-alias [(full-env tenv ce assumps) (,, name args type)]
    (fatal "ok here we are")
        ;(full-env tenv ce assumps))

(defn make-kind [kinds]
    (match kinds
        []           star
        [one ..rest] (kfun one (make-kind rest))))

(defn replace-tycons [free-map types type]
    (match type
        (tcon (tycon name _) l) (match (map/get free-map name)
                                    (some v) (<- v)
                                    _        (match (map/get types name)
                                                 (some (, kinds _)) (<- (tcon (tycon name (make-kind kinds)) l))
                                                 _                  (<-err (, "Unknonwn type constructor" [(, l name)]))))
        (tapp a b l)            (let-> [
                                    a (replace-tycons free-map types a)
                                    b (replace-tycons free-map types b)
                                    ]
                                    (<- (tapp a b l)))
        _                       (<- type)))

(defn infer-deftype [(,,, name tnl top-args constructors)]
    ; TODO make it so we can do higher kinds
        ;  and type classes! can't do that just yet.
        (let-> [
        (type-env constructors- types- aliases-) <-tenv
        names                                    (<- (map (fn [(,,, name _ _ _)] name) constructors))
        top-kinds                                (<- (map (fn [_] star) top-args))
        kind                                     (<- (foldl star top-kinds (fn [result arg] (kfun arg result))))
        with-type                                (<- (map/set map/nil name (, top-kinds (set/from-list names))))
        (, final _)                              (<-
                                                     (foldl
                                                         (, (tcon (tycon name kind) tnl) 0)
                                                             top-args
                                                             (fn [(, body i) (, arg al)] (, (tapp body (tgen i al) al) (+ i 1)))))
        free-idxs                                (<-
                                                     (map/from-list (mapi (fn [(, arg al) i] (, arg (tgen i al))) 0 top-args)))
        (, assumps' constructors')               (foldl->
                                                     (, [] map/nil)
                                                         constructors
                                                         (fn [(, assumps constructors) (,,, name nl args l)]
                                                         (let-> [
                                                             args           (map->
                                                                                (replace-tycons free-idxs (map/merge types- with-type))
                                                                                    args)
                                                             typ            (<- (tfns args final))
                                                             (, kinds qual) (<- (generics (map (fn [_] []) top-args) typ))]
                                                             (<-
                                                                 (,
                                                                     [(!>! name (forall kinds qual)) ..assumps]
                                                                         (map/set constructors name (forall kinds qual)))))))
        ()                                       (tenv->
                                                     (type-env
                                                         (map/merge constructors- constructors')
                                                             (map/merge types- with-type)
                                                             aliases-))]
        (<-
            (full-env
                (type-env constructors' with-type map/nil)
                    class-env/nil
                    assumps'))))

(run/nil->
    (infer-deftype
        (,,,
            "bag"
                0
                [(, "a" 1)]
                [(,,, "empty" 2 [] 39) (,,, "one" 4 [(tcon (tycon "a" star) 5)] 6)])))

(defn foldl-ok-> [init values f]
    (let [<- ok >>= ok>>=]
        (match values
            []           (<- init)
            [one ..rest] (let-> [one (f init one)] (foldl-ok-> one rest f)))))

(defn foldl-ok-fst-> [init init2 values f f2]
    (match values
        []           (, (ok init) init2)
        [one ..rest] (let [(, result snd) (f init one) snd (f2 snd init2)]
                         (match result
                             (ok v)  (foldl-ok-fst-> v snd rest f f2)
                             (err e) (, (err e) snd)))))

(defn concat2 [a b] (concat [a b]))

(** Um stuff I haven't done yet **)

;(defn infer-deftype2 [tenv' bound tname tnl targs constructors l]
    (let-> [
        names           (<- (map (fn [(,,, name _ _ _)] name) constructors))
        final           (<-
                            (foldl
                                (tcon (tycon tname star) tnl)
                                    targs
                                    (fn [body (, arg al)] (tapp body (tvar arg al) l))))
        free-set        (<- (foldl set/nil targs (fn [free (, arg _)] (set/add free arg))))
        (, values cons) (foldl->
                            (, map/nil map/nil)
                                constructors
                                (fn [(, values cons) (,,, name nl args l)]
                                (let-> [
                                    args (<- (map (fn [arg] (type-with-free arg free-set)) args))
                                    args (<- (map (subst-aliases (tenv/alias tenv')) args))
                                    _    (map->
                                             (fn [arg]
                                                 (match (bag/to-list (externals-type (set/add bound tname) arg))
                                                     []    (<- true)
                                                     names (<-err
                                                               (type-error
                                                                   "Unbound types in deftype ${tname}"
                                                                       (map (fn [(,, name _ l)] (, name l)) names)))))
                                                 args)]
                                    (<-
                                        (,
                                            (map/set
                                                values
                                                    name
                                                    (scheme free-set (foldr final args (fn [body arg] (tfn arg body)))))
                                                (map/set cons name (tconstructor free-set args final)))))))]
        (<-
            (tenv
                values
                    cons
                    (map/set map/nil tname (, (len targs) (set/from-list names)))
                    map/nil))))

;(defn infer-types [full aliases deftypes]
    (let [names (map (fn [(,, name args type)] name) aliases)]
        (foldl (foldl full aliases infer-alias) deftypes infer-deftype)))

;(defn infer-stypes [tenv' stypes salias]
    (let-> [
        names                    (<-
                                     (foldl
                                         (map (fn [(,, name _ _)] name) salias)
                                             stypes
                                             (fn [names (sdeftype name _ _ _ _)] [name ..names])))
        (tenv _ _ types aliases) (<- tenv')
        bound                    (<-
                                     (set/merge
                                         (set/from-list (map/keys types))
                                             (set/merge (set/from-list names) (set/from-list (map/keys aliases)))))
        tenv                     (foldl->
                                     tenv/nil
                                         salias
                                         (fn [tenv (,, name args body)]
                                         (match (bag/to-list
                                             (externals-type
                                                 (set/merge bound (set/from-list (map args fst)))
                                                     body))
                                             []    (<- (tenv/add-alias tenv name (, (map args fst) body)))
                                             names (<-err
                                                       (type-error "Unbound types" (map names (fn [(,, name _ l)] (, name l))))))))
        merged                   (<- (tenv/merge tenv tenv'))
        tenv                     (foldl->
                                     tenv
                                         stypes
                                         (fn [tenv (sdeftype name tnl args constructors l)]
                                         (let-> [
                                             tenv' (infer-deftype merged bound name tnl args constructors l)]
                                             (<- (tenv/merge tenv' tenv)))))
        tenv'                    (<- (tenv/merge tenv tenv'))]
        (<- tenv)))

(defn infer-defs [ce assumps defs]
    (let-> [
        ()      (idx-> 0)
        tenv    <-tenv
        assumps (infer/program
                    ce
                        assumps
                        [(, [] [(map (fn [(, name body)] (, name [(, [] body)])) defs)])])]
        (<- (full-env tenv ce assumps))))

(defn infer-defns [ce assumps stmts]
    (let-> [
        names   (<- (set/from-list (map (fn [(sdef name _ _ _)] name) stmts)))
        assumps (infer/program
                    ce
                        assumps
                        [(,
                        []
                            [(map
                            (fn [(sdef name _ body _)]
                                (,
                                    name
                                        [(match body
                                        (elambda pats inner l) (, pats inner)
                                        _                      (, [] body))]))
                                stmts)])])]
        (<-
            (full-env
                type-env/nil
                    class-env/nil
                    (filter (fn [(!>! n _)] (set/has names n)) assumps)))))

(defn map-ok-> [f items]
    (let [>>= ok>>= <- ok]
        (match items
            []           (<- [])
            [one ..rest] (let-> [one (f one) rest (map-ok-> f rest)] (<- [one ..rest])))))

(defn split-stmts [stmts sdefs stypes salias sexps sinst]
    (match stmts
        []           (, sdefs stypes salias sexps sinst)
        [one ..rest] (match one
                         (sdef _ _ _ _)                  (split-stmts rest [one ..sdefs] stypes salias sexps sinst)
                         (sdeftype _ _ _ _ _)            (split-stmts rest sdefs [one ..stypes] salias sexps sinst)
                         (sdefinstance _ _ _ _ _ _)      (split-stmts rest sdefs stypes salias sexps [one ..sinst])
                         (stypealias name _ args body _) (split-stmts
                                                             rest
                                                                 sdefs
                                                                 stypes
                                                                 [(,, name args body) ..salias]
                                                                 sexps
                                                                 sinst)
                         (sexpr expr _)                  (split-stmts rest sdefs stypes salias [expr ..sexps] sinst))))

(defn infer-sinst [ce assumps (sdefinstance name nl type preds fns l)]
    (let-> [
        (** Todo: track usage of the class declaration **)
        free                  (<- (foldl empty (map (fn [(isin _ t)] (find-free t)) preds) bag/and))
        free-map              (<-
                                  (map/from-list
                                      (map (fn [(,, name _ kind)] (, name kind)) (bag/to-list free))))
        (class-env classes _) (<- ce)
        (, _ _ inst-fns)      (match (map/get classes name)
                                  (some cls) (<- cls)
                                  (none)     (<-err
                                                 (,
                                                     
                                                         "Trying to define an instance for a class that hasn't been defined"
                                                         [])))
        ()                    (do->
                                  (fn [(,, name loc f)]
                                      (match (assoc/get inst-fns name)
                                          (some fn-type) (let-> [
                                                             _ (infer/program
                                                                   ce
                                                                       assumps
                                                                       [(,
                                                                       [(,,
                                                                           name
                                                                               (forall [] (=> [] (inst/type [(replace-free free-map type)] fn-type)))
                                                                               [(, [] f)])]
                                                                           [])])]
                                                             (<- ()))
                                          (none)         (<-err (, "Unknown instance function" [(, loc name)]))))
                                      fns)]
        (<-
            (full-env
                type-env/nil
                    (add-inst
                    (map
                        (fn [(isin name type)] (isin name (replace-free free-map type)))
                            preds)
                        (isin name (replace-free free-map type))
                        (just-this-class ce name))
                    []))))

(defn assoc/get [lst k]
    (match lst
        []               none
        [(, a b) ..rest] (if (= a k)
                             (some b)
                                 (assoc/get rest k))))

(defn find-free [type]
    (match type
        (tcon (tycon name kind) l) (one (,, name l kind))
        _                          (let [args (tfn-args type [])] (many (map find-free args)))))

(defn replace-free [free type]
    (match type
        (tcon (tycon name _) l) (match (map/get free name)
                                    (some kind) (tvar (tyvar name kind) l)
                                    _           type)
        (tapp target arg l)     (tapp (replace-free free target) (replace-free free arg) l)
        _                       type))

(defn tfn-args [type cur]
    (match type
        (tapp target arg _) (tfn-args target [arg ..cur])
        _                   cur))

(tfn-args (parse-type (@@ (array l m))) [])

(find-free (parse-type (@@ hi)))

(find-free (parse-type (@@ (lol a (array l m)))))

(@t (array t))

(defn infer-stmtss [ce assumps stmts]
    (let-> [
        (, sdefs stypes salias sexps sinst) (<- (split-stmts stmts [] [] [] [] []))
        ;(type-tenv
            (infer-stypes tenv' stypes salias)
                tenv'
                (<- (tenv/merge type-tenv tenv')))
        tts                                 (map-> (fn [stmt] (infer-stmt ce assumps stmt)) stypes)
        its                                 (map-> (fn [stmt] (infer-sinst ce assumps stmt)) sinst)
        (full-env ta tb tc)                 (<- (foldl full-env/nil (concat [tts its]) full-env/merge))
        (full-env a b c)                    (match sdefs
                                                [] (<- full-env/nil)
                                                _  (infer-defns (class-env/merge ce tb) (concat [assumps tc]) sdefs))
        types                               (map-> (infer (class-env/merge ce tb) (concat [tc c assumps])) sexps)]
        (<- (, (full-env/merge (full-env ta tb tc) (full-env a b c)) types))))

(defn test-stmts [ce x]
    (just-assumps->s
        (fst
            (force
                type-error->s
                    (snd
                    (run/tenv->
                        builtin-tenv
                            (infer-stmtss ce builtin-assumptions (map parse-stmt x))))))))

(,
    (test-stmts builtin-ce)
        [(, [(@@ (def x 1))] "x: int")
        (,
        [(@@
            (defn even [x]
                (if (< x 1)
                    true
                        false)))]
            "even: a *; a ∈ num; a ∈ ord; (fn [a] bool)")
        (,
        [(@@
            (defn even [x]
                (if (< x 1)
                    true
                        (odd x))))
            (@@
            (defn odd [x]
                (if (< x 1)
                    true
                        (even x))))]
            "odd: a *; a ∈ num; a ∈ ord; (fn [a] bool)\neven: a *; a ∈ num; a ∈ ord; (fn [a] bool)")])

(** Test some type class goodness **)

(defn test-full [ce x]
    (full-env->s
        (fst
            (force
                type-error->s
                    (snd
                    (run/tenv->
                        builtin-tenv
                            (infer-stmtss ce builtin-assumptions (map parse-stmt x))))))))

(def example-ce
    (foldl
        (foldl
            (class-env/add-default class-env/nil [tint])
                [(, "pretty" [] [(, "show-pretty" (tfns [(tgen 0 -1)] tstring))])
                (, "num" [] [])
                (, "ord" [] [])]
                add-class)
            [(, [] (isin "pretty" tunit)) (, [] (isin "num" tint)) (, [] (isin "ord" tint))]
            (fn [ce (, pre pred)] (add-inst pre pred ce))))

(class-env->s example-ce)

(,
    (errorToString (test-full example-ce))
        [(, [(@@ (def x "hi"))] "Assumps\n - x: string")
        (, [(@@ (def x 1))] "Assumps\n - x: int")
        (,
        [(@@ "${""}")]
            "Fatal runtime: Can't find an instance for class 'pretty' for type string")
        (,
        [(@@ (definstance (pretty string) {lol 10}))]
            "Fatal runtime: Unknown instance function\n - lol (31644)")
        (,
        [(@@ (definstance (pretty string) {show-pretty 10}))]
            "Fatal runtime: Can't find an instance for class 'num' for type (fn [string] string)")
        (,
        [(@@ (definstance (pretty string) {show-pretty true}))]
            "Fatal runtime: Unable to unify -> Cant unify (fn [string] string) and bool\n - (fn [string [*]] string [*]) (-1)\n - bool [*] (-1)")
        (,
        [(@@ (definstance (pretty string) {show-pretty (fn [v] "a")}))]
            "Class Env\n> Instances\n - pretty \n   - string ∈ pretty\n   - show-pretty (fn [a] string)")
        (,
        [(@@ (definstance (pretty string) {show-pretty (fn [v] "a string")}))
            (@@ (def x (show-pretty "")))
            (@@ (show-pretty ""))]
            "Class Env\n> Instances\n - pretty \n   - string ∈ pretty\n   - show-pretty (fn [a] string)\nAssumps\n - x: string")
        (,
        [(@@
            (definstance (pretty (, string string)) {show-pretty (fn [a] "pairr")}))
            (@@ (show-pretty (, "" "")))]
            "Class Env\n> Instances\n - pretty \n   - (, string string) ∈ pretty\n   - show-pretty (fn [a] string)")
        (,
        [(@@
            (definstance (=> (pretty a) (pretty (, a string)))
                {show-pretty (fn [a] "lol")}))
            (@@ (show-pretty (, () "lol")))]
            "Class Env\n> Instances\n - pretty \n   - (var a *) ∈ pretty |=> (, (var a *) string) ∈ pretty\n   - show-pretty (fn [a] string)")
        (,
        [(@@
            (definstance (=> (pretty a) (pretty (list a))) {show-pretty (fn [v] "Lol")}))
            (@@ (show-pretty [()]))]
            "Class Env\n> Instances\n - pretty \n   - (var a *) ∈ pretty |=> (list (var a *)) ∈ pretty\n   - show-pretty (fn [a] string)")])

foldl

(run/nil->
    (infer-stmtss builtin-env [] [(parse-stmt (@@ (def x "hello ${12}")))]))

(run/nil->
    (infer-stmtss builtin-env [] [(parse-stmt (@@ (deftype m (n int))))]))

(deftype name-kind (value) (type) (tcls))

(typealias locname (,, string name-kind int))

(defn infer-stmts [ce assumps stmts]
    (foldl->
        full-env/nil
            stmts
            (fn [(full-env tenv ce' assumps') stmt]
            (let-> [
                env (infer-stmt
                        (class-env/merge ce ce')
                            (concat2 assumps assumps')
                            stmt)
                ]
                (<- (full-env/merge (full-env tenv ce' assumps') env))))))

(defn full-env/merge [(full-env a b c) (full-env d e f)]
    (full-env (tenv/merge a d) (class-env/merge b e) (concat [c f])))

(** ## Debuggings **)

(defn type-env->g [(type-env constructors types aliases)]
    [(ggroup
        "> Constructors"
            (map
            (fn [(, name scheme)] (gtext " - ${name}: ${(scheme->s scheme)}"))
                (map/to-list constructors)))
        (ggroup
        "> Types"
            (map
            (fn [(, name (, kinds constr-names))]
                (gtext
                    " - ${name}: ${(join "," (map kind->s kinds))} ${(join "," (set/to-list constr-names))}"))
                (map/to-list types)))])

(defn ljoin [prefix items]
    (match items
        []            ""
        [one ..items] "${prefix}${one}${(ljoin prefix items)}"))

(ljoin "-" ["a"])

(ljoin "-" ["a" "b"])

(defn group->ss [group]
    (match group
        (gtext text)          [text]
        (ggroup header items) (let [contents (concat (map group->ss items))]
                                  (match contents
                                      [] []
                                      _  [header ..contents]))))

(defn groups->s [group] (join "\n" (concat (map group->ss group))))

(deftype group (ggroup string (list group)) (gtext string))

(defn class-env->g [(class-env instances defaults)]
    [(ggroup
        "> Instances"
            (map
            (fn [(, name (, ones quals fns))]
                (gtext
                    " - ${name} ${(match ones
                        [] ""
                        _  " <- ${(join ", " ones)}")}${(match quals
                        [] "\n   - (no instances)"
                        _  (ljoin "\n   - " (map (qual->s pred->s) quals)))}${(match fns
                        [] "\n   - (no fns)"
                        _  (ljoin
                               "\n   - "
                                   (map (fn [(, name type)] "${name} ${(type->s type)}") fns)))}"))
                (map/to-list instances)))
        (ggroup
        "> Defaults"
            (map (dot (dot gtext (prefix " - ")) type->s) defaults)
            )])

(def class-env->s (dot groups->s class-env->g))

(defn prefix [pre text] "${pre}${text}")

(defn full-env->g [(full-env tenv cenv assumps)]
    [(ggroup "Type Env" (type-env->g tenv))
        (ggroup "Class Env" (class-env->g cenv))
        (ggroup
        "Assumps"
            (map (dot (dot gtext (prefix " - ")) assump->s) assumps))])

(def full-env->s (dot groups->s full-env->g))

(defn full-env/assumps [(full-env _ _ assumps)] assumps)

(defn just-assumps->s [(full-env _ _ assumps)]
    (join "\n" (map assump->s assumps)))

(snd
    (run/tenv->
        builtin-tenv
            (infer-stmts
            builtin-ce
                builtin-assumptions
                (map parse-stmt [(@@ (defn x [y] (+ y 1))) (@@ (defn y [z] z))]))))

(defn force [e->s v]
    (match v
        (ok v)  v
        (err e) (fatal (e->s e))))

(defn test-stmt [x]
    (full-env->s
        (force
            type-error->s
                (snd
                (run/tenv->
                    builtin-tenv
                        (infer-stmts builtin-ce builtin-assumptions (map parse-stmt x)))))))

(,
    test-stmt
        [(,
        [(@@ (def x 1))]
            "Assumps\n - x: int")
        (,
        [(@@ (deftype bag (hi int)))]
            "Type Env\n> Constructors\n - hi: (fn [int] bag)\n> Types\n - bag:  hi\nAssumps\n - hi: (fn [int] bag)")
        (,
        [(@@ (deftype (bag a) (hi a)))
            (@@ (deftype bog (bog (bag int))))
            (@@ (def x (hi 10)))
            (@@ (def y (bog (hi 1))))]
            "Type Env\n> Constructors\n - hi: *; (fn [a] (bag a))\n - bog: (fn [(bag int)] bog)\n> Types\n - bag: * hi\n - bog:  bog\nAssumps\n - hi: a *; (fn [a] (bag a))\n - bog: (fn [(bag int)] bog)\n - x: (bag int)\n - y: bog")
        (,
        [(@@ (defn lol [x] "Lol ${x}")) (@@ (lol true))]
            "Assumps\n - lol: a *; a ∈ pretty; (fn [a] string)")])

(full-env->s builtin-full)

20567

(** ## Dependency analysis
    Needed so we can know when to do mutual recursion, as well as for sorting definitions by dependency order. **)

(deftype (bag a) (one a) (many (list (bag a))) (empty))

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

(defn concat-two [one two]
    (match one
        []           two
        [one]        [one ..two]
        [one ..rest] [one ..(concat-two rest two)]))

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
                                _       (concat-two (bag/to-list bag) res))))))

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
        (pcon name args l) (bag/and (one (,, name (value) l)) (many (map pat-externals args)))
        _                  empty))

(defn externals 
    [bound expr]
        (match expr
        (evar name l)                       (match (set/has bound name)
                                                true empty
                                                _    (one (,, name (value) l)))
        (eprim prim l)                      empty
        (estr first templates int)          (many
                                                (map
                                                    (fn [arg]
                                                        (match arg
                                                            (,, expr _ _) (externals bound expr)))
                                                        templates))
        (equot expr int)                    empty
        (elambda pats body int)             (bag/and
                                                (foldl empty (map pat-externals pats) bag/and)
                                                    (externals (foldl bound (map pat-names pats) set/merge) body))
        (elet (, explicit inferred) body l) (let [
                                                (, bag bound) (foldl
                                                                  (, empty bound)
                                                                      inferred
                                                                      (fn [(, bag bound) items]
                                                                      (foldl
                                                                          (, bag bound)
                                                                              items
                                                                              (fn [(, bag bound) (, name alts)]
                                                                              (foldl
                                                                                  (, bag bound)
                                                                                      alts
                                                                                      (fn [(, bag bound) (, pats init)]
                                                                                      (,
                                                                                          (foldl bag (map pat-externals pats) bag/and)
                                                                                              (foldl bound (map pat-names pats) set/merge))))))))]
                                                (bag/and bag (externals bound body)))
        (eapp target args int)              (bag/and
                                                (externals bound target)
                                                    (foldl empty (map (externals bound) args) bag/and))
        (ematch expr cases int)             (bag/and
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

;(defn dot [a b c] (a (b c)))

(defn externals-type [bound t]
    (match t
        (tvar _ _)              empty
        (tcon (tycon name _) l) (if (set/has bound name)
                                    empty
                                        (one (,, name (type) l)))
        (tapp one two _)        (bag/and (externals-type bound one) (externals-type bound two))))

(defn names [stmt]
    (match stmt
        (sdef name l _ _)                  [(,, name (value) l)]
        (sexpr _ _)                        []
        (stypealias name l _ _ _)          [(,, name (type) l)]
        (sdefinstance name _ _ _ _ _)      []
        (sdeftype name l _ constructors _) [(,, name (type) l)
                                               ..(map (fn [(,,, name l _ _)] (,, name (value) l)) constructors)]))

(defn externals-stmt [stmt]
    (bag/to-list
        (match stmt
            (sdeftype string int free constructors l) (let [frees (set/from-list (map fst free))]
                                                          (many
                                                              (map
                                                                  (fn [(,,, name l args _)]
                                                                      (match args
                                                                          [] empty
                                                                          _  (many (map (externals-type frees) args))))
                                                                      constructors)))
            (sdefinstance name nl type preds items l) (bag/and
                                                          (one (,, name (tcls) nl))
                                                              (many (map (fn [(,, name nl fn)] (externals set/nil fn)) items)))
            (stypealias name nl args body l)          (let [frees (set/from-list (map fst args))]
                                                          (externals-type frees body))
            (sdef name nl body l)                     (externals (set/add set/nil name) body)
            (sexpr expr l)                            (externals set/nil expr))))

;(bag/to-list
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

(** ## Export as Evaluator **)

(deftype analysis
    (analysis
        (fn [stmt] (list locname))
            (fn [expr] (list locname))
            (fn [stmt] (list locname))))

(typealias type-error-t (, string (list (, int string))))

(typealias usage-record (, (list int) (list (, int int))))

(deftype inferator
    (inferator
        full-env
            (fn [full-env (list stmt)] full-env)
            (fn [full-env full-env] full-env)
            (fn [full-env expr] scheme)
            (fn [scheme] string)
            (fn [full-env string] (option scheme))
            (fn [full-env (list stmt)]
            (,,
                (result (, full-env (list scheme)) type-error-t)
                    (list (, int type))
                    usage-record))
            (fn [full-env] string)))

(deftype parser
    (parser
        (fn [cst] stmt)
            (fn [cst] expr)
            (fn [stmt (map int string)] string)
            (fn [expr (map int string)] string)))

(deftype evaluator (evaluator inferator analysis parser))

((eval
    "({0: {0: env_nil, 1: infer_stmts, 2: add_stmt, 3: infer, 4: type_to_string, 5: get_type, 6: infer_stmts2, 7: env_to_string},\n  1: {0: externals_stmt, 1: externals_expr, 2: names},\n  2: {0: parse_stmt, 1: parse_expr, 2: compile_stmt, 3: compile},\n }) => ({type: 'fns', \n   env_nil, infer_stmts, add_stmt, infer, externals_stmt, externals_expr, names, type_to_string, get_type,\n   parse_stmt, parse_expr, compile_stmt, compile, infer_stmts2, env_to_string \n }) ")
    (evaluator
        (inferator
            builtin-full
                (fn [(full-env tenv ce assumps) y]
                (force
                    type-error->s
                        (snd (run/tenv-> tenv (infer-stmts ce assumps y)))))
                full-env/merge
                (fn [(full-env tenv ce assumps) y]
                (force type-error->s (snd (run/tenv-> tenv (infer ce assumps y)))))
                scheme->s
                (fn [(full-env tenv ce assumps) name]
                (match (filter (fn [(!>! n _)] (= n name)) assumps)
                    [(!>! _ scheme) .._] (some scheme)
                    _                    (none)))
                (fn [(full-env tenv ce assumps) stms]
                (let [
                    (, (, _ types _ _) result) (run/tenv-> tenv (infer-stmtss ce assumps stms))]
                    (,, result types (, [] []))))
                full-env->s)
            (analysis
            externals-stmt
                (fn [expr] (bag/to-list (externals set/nil expr)))
                names)
            (parser parse-stmt parse-expr compile-stmt compile)))

27573

(snd
    (run/tenv->
        builtin-tenv
            (infer-stmtss
            builtin-ce
                builtin-assumptions
                [(parse-stmt (@@ "hello ${12}"))])))