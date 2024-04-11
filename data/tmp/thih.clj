(** ## Prelude **)

(defn list/get [arr i]
    (match (, arr i)
        (, [one .._] 0)  one
        (, [_ ..rest] i) (if (<= i 0)
                             (fatal "Index out of range")
                                 (list/get rest (- i 1)))))

(deftype (result good bad) (ok good) (err bad))

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
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/spread cst int)
        (cst/identifier string int)
        (cst/string string (array (,, cst string int)) int))

(deftype (array a) (nil) (cons a (array a)))

(typealias id string)

(typealias alt (, (array pat) expr))

(typealias impl (, id (array alt)))

(typealias expl (,, id scheme (array alt)))

(typealias bindgroup (, (array expl) (array (array impl))))

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
        (elet bindgroup expr int)
        (ematch expr (array (, pat expr)) int))

(deftype prim (pint int int) (pfloat float int) (pbool bool int))

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

(defn type->s [type]
    (match type
        (tvar (tyvar name kind) _) "(var ${name} ${(kind->s kind)})"
        (tapp target arg _)        (match (type->fn type)
                                       (, [] _)        (let [(, target args) (unwrap-tapp target [arg])]
                                                           "(${(type->s target)} ${(join " " (map type->s args))})")
                                       (, args result) "(fn [${(join " " (map type->s args))}] ${(type->s result)})")
        (tcon (tycon "(,)" _) _)   ","
        (tcon (tycon "[]" _) _)    "list"
        (tcon (tycon name _) _)    name
        (tcon con _)               (tycon->s con)
        (tgen num _)               (gen-name num)))

(type->s tstring)

(type->s (mkpair tint tbool))

(type->s (tfn tint (tfn tfloat tbool)))

(defn type= [a b]
    (match (, a b)
        (, (tvar ty _) (tvar ty' _))                  (tyvar= ty ty')
        (, (tapp target arg _) (tapp target' arg' _)) (if (type= target target')
                                                          (type= arg arg')
                                                              false)
        (, (tcon tycon _) (tcon tycon' _))            (tycon= tycon tycon')
        (, (tgen n _) (tgen n' _))                    (= n n')))

(defn tycon= [(tycon name kind) (tycon name' kind')]
    (if (= name name')
        (kind= kind kind')
            false))

(defn tycon->s [(tycon name kind)]
    (match kind
        (star) name
        _      "[${name} : ${(kind->s kind)}]"))

(defn star-con [name] (tcon (tycon name star) -1))

(defn assump->s [(!>! name (forall kinds (=> preds type)))]
    "${
        name
        }: ${
        (match kinds
            [] ""
            _  "${
                   (join
                       "; "
                           (mapi (fn [kind i] "${(gen-name i)} ${(kind->s kind)}") 0 kinds))
                   }; ")
        }${
        (match preds
            [] ""
            _  "${(join "; " (map pred->s preds))}; ")
        }${
        (type->s type)
        }")

(defn type/kind [type]
    (match type
        (tcon tc _)  (tycon/kind tc)
        (tvar u _)   (tyvar/kind u)
        (tapp t _ l) (match (type/kind t)
                         (kfun _ k) k
                         _          (fatal "Invalid type application ${(int-to-string l)}"))))

(typealias subst (array (, tyvar type)))

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

(typealias class (, (array string) (array (qual pred))))

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

(def tlist (tcon (tycon "[]" (kfun star star)) -1))

(def tarrow (tcon (tycon "(->)" (kfun star (kfun star star))) -1))

(def ttuple2 (tcon (tycon "(,)" (kfun star (kfun star star))) -1))

(def tstring (star-con "string"))

(defn tfn [a b] (tapp (tapp tarrow a -1) b -1))

(defn mklist [t] (tapp tlist t -1))

(defn mkpair [a b] (tapp (tapp ttuple2 a -1) b -1))

(defn tyvar/kind [(tyvar v k)] k)

(defn tycon/kind [(tycon v k)] k)

(** ## Parsing **)

(defn tapps [items l]
    (match items
        [one]        one
        [one ..rest] (tapp (tapps rest l) one l)))

(defn parse-type [type]
    (match type
        (cst/identifier id l)                                          (tcon (tycon id star) l)
        (cst/list [] l)                                                (fatal "(parse-type) with empty list")
        (cst/list [(cst/identifier "fn" _) (cst/array args _) body] _) (foldl
                                                                           (parse-type body)
                                                                               (rev args [])
                                                                               (fn [body arg] (tfn (parse-type arg) body)))
        (cst/list items l)                                             (tapps (rev (map parse-type items) []) l)
        _                                                              (fatal "(parse-type) Invalid type ${(valueToString type)}")))

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
        (cst/identifier "_" l)                        (pany l)
        (cst/identifier "true" l)                     (pprim (pbool true l) l)
        (cst/identifier "false" l)                    (pprim (pbool false l) l)
        (cst/string first [] l)                       (pstr first l)
        (cst/identifier id l)                         (match (string-to-int id)
                                                          (some int) (pprim (pint int l) l)
                                                          _          (pvar id l)
                                                          )
        (cst/array [] l)                              (pcon "nil" [] l)
        (cst/array [(cst/spread inner _)] _)          (parse-pat inner)
        (cst/array [one ..rest] l)                    (pcon "cons" [(parse-pat one) (parse-pat (cst/array rest l))] l)
        (cst/list [(cst/identifier name _) ..rest] l) (pcon name (map parse-pat rest) l)
        _                                             (fatal "parse-pat mo match ${(valueToString pat)}")))

(parse-pat (@@ [1 2 ..a]))

(defn parse-expr [cst]
    (match cst
        (cst/identifier "true" l)                                           (eprim (pbool true l) l)
        (cst/identifier "false" l)                                          (eprim (pbool false l) l)
        (cst/string first templates l)                                      (estr
                                                                                first
                                                                                    (map
                                                                                    (fn [tpl] (let [(,, expr string l) tpl] (,, (parse-expr expr) string l)))
                                                                                        templates)
                                                                                    l)
        (cst/identifier id l)                                               (match (string-to-int id)
                                                                                (some int) (eprim (pint int l) l)
                                                                                (none)     (match (string-to-float id)
                                                                                               (some v) (eprim (pfloat v l) l)
                                                                                               _        (evar id l)))
        (cst/list [(cst/identifier "@" _) body] l)                          (equot (parse-expr body) l)
        (cst/list [(cst/identifier "@@" _) body] l)                         (equotquot body l)
        (cst/list [(cst/identifier "@!" _) body] l)                         (equot/stmt (parse-stmt body) l)
        (cst/list [(cst/identifier "@t" _) body] l)                         (equot/type (parse-type body) l)
        (cst/list [(cst/identifier "@p" _) body] l)                         (equot/pat (parse-pat body) l)
        (cst/list [(cst/identifier "if" _) cond yes no] l)                  (ematch
                                                                                (parse-expr cond)
                                                                                    [(, (pprim (pbool true l) l) (parse-expr yes)) (, (pany l) (parse-expr no))]
                                                                                    l)
        (cst/list [(cst/identifier "fn" _) (cst/array args _) body]  b)     (foldr
                                                                                (parse-expr body)
                                                                                    args
                                                                                    (fn [body arg] (elambda (parse-pat arg) body b)))
        (cst/list [(cst/identifier "fn" _) .._] l)                          (fatal "Invalid 'fn' ${(int-to-string l)}")
        (cst/list [(cst/identifier "match" _) target ..cases] l)            (ematch
                                                                                (parse-expr target)
                                                                                    (map
                                                                                    (fn [case] (let [(, pat expr) case] (, (parse-pat pat) (parse-expr expr))))
                                                                                        (pairs cases))
                                                                                    l)
        (cst/list [(cst/identifier "let" _) (cst/array inits _) body] l)    (foldr
                                                                                (parse-expr body)
                                                                                    (pairs inits)
                                                                                    (fn [body init]
                                                                                    (let [(, pat value) init]
                                                                                        (match pat
                                                                                            (cst/identifier name l) (elet (, [] [[(, name [(, [] (parse-expr value))])]]) body l)
                                                                                            _                       (ematch (parse-expr value) [(, (parse-pat pat) body)] l)))))
        (cst/list [(cst/identifier "letrec" _) (cst/array inits _) body] l) (elet
                                                                                (,
                                                                                    []
                                                                                        [(map
                                                                                        (fn [(, pat value)]
                                                                                            (match pat
                                                                                                (cst/identifier name l) (, name [(, [] (parse-expr value))])))
                                                                                            (pairs inits))])
                                                                                    (parse-expr body)
                                                                                    l)
        (cst/list [(cst/identifier "let->" _) (cst/array inits _) body] l)  (foldr
                                                                                (parse-expr body)
                                                                                    (pairs inits)
                                                                                    (fn [body init]
                                                                                    (let [(, pat value) init]
                                                                                        (eapp (parse-expr value) (elambda (parse-pat pat) body l) l))))
        (cst/list [(cst/identifier "let" _) .._] l)                         (fatal "Invalid 'let' ${(int-to-string l)}")
        (cst/list [target ..args] l)                                        (foldl
                                                                                (parse-expr target)
                                                                                    args
                                                                                    (fn [target arg] (eapp target (parse-expr arg) l)))
        (cst/array args l)                                                  (parse-array args l)))

(parse-expr (@@ (@! 12)))

(defn parse-array [args l]
    (match args
        []                     (evar "nil" l)
        [(cst/spread inner _)] (parse-expr inner)
        [one ..rest]           (eapp (eapp (evar "cons" l) (parse-expr one) l) (parse-array rest l) l)))

(,
    parse-expr
        [(, (@@ true) (eprim (pbool true 11729) 11729))
        (,
        (@@ [1 ..b])
            (eapp
            (eapp (evar "cons" 11741) (eprim (pint 1 11742) 11742) 11741)
                (evar "b" 11744)
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
            (eapp
                (eapp (evar "=" 11849) (evar "a" 11850) 11848)
                    (evar "b" 11851)
                    11848)
                [(, (pprim (pbool true 11846) 11846) (evar "a" 11852))
                (, (pany 11846) (evar "b" 11853))]
                11846))
        (,
        (@@ "a${1}b")
            (estr "a" [(,, (eprim (pint 1 11909) 11909) "b" 11910)] 11907))
        (,
        (@@ [1 2])
            (eapp
            (eapp (evar "cons" 11933) (eprim (pint 1 11934) 11934) 11933)
                (eapp
                (eapp (evar "cons" 11933) (eprim (pint 2 11935) 11935) 11933)
                    (evar "nil" 11933)
                    11933)
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
                (elambda (pvar "v" 12089) (evar "v2" 12091) 12086)
                12086))
        (,
        (@@ (fn [a] 1))
            (elambda (pvar "a" 12134) (eprim (pint 1 12135) 12135) 12131))
        (,
        (@@ (fn [a b] 2))
            (elambda
            (pvar "a" 12156)
                (elambda (pvar "b" 12157) (eprim (pint 2 12158) 12158) 12153)
                12153))
        (,
        (@@ (fn [(, a b)] a))
            (elambda
            (pcon "," [(pvar "a" 12187) (pvar "b" 12188)] 12185)
                (evar "a" 12189)
                12182))
        (,
        (@@ (+ 1 2))
            (eapp
            (eapp (evar "+" 12233) (eprim (pint 1 12234) 12234) 12232)
                (eprim (pint 2 12235) 12235)
                12232))
        (,
        (@@ (int-to-string 23))
            (eapp
            (evar "int-to-string" 12266)
                (eprim (pint 23 12267) 12267)
                12265))
        (,
        (@@ (let [x 2] x))
            (elet (, [] [[(, "x" [(, [] (eprim (pint 2 12291) 12291))])]]) (evar "x" 12292) 12290))
        (,
        (@@ (let [(, a b) (, 2 3)] 1))
            (ematch
            (eapp
                (eapp (evar "," 12325) (eprim (pint 2 12326) 12326) 12324)
                    (eprim (pint 3 12327) 12327)
                    12324)
                [(,
                (pcon "," [(pvar "a" 12322) (pvar "b" 12323)] 12320)
                    (eprim (pint 1 12328) 12328))]
                12317))
        (, (@@ (@@ 1)) (equotquot (cst/identifier "1" 12386) 12384))
        (, (@@ (@ 1)) (equot (eprim (pint 1 12401) 12401) 12399))])

(parse-expr (@@ (fn [a] 1)))

(defn mk-deftype [id li args items l]
    (sdeftype
        id
            li
            (map
            (fn [arg]
                (match arg
                    (cst/identifier name l) (, name l)
                    _                       (fatal "deftype type argument must be identifier")))
                args)
            (foldr
            []
                items
                (fn [res constr]
                (match constr
                    (cst/list [(cst/identifier name ni) ..args] l) [(,,, name ni (map parse-type args) l) ..res]
                    (cst/list [] l)                                res
                    _                                              (fatal "Invalid type constructor"))))
            l))

(defn parse-stmt [cst]
    (match cst
        (cst/list [(cst/identifier "def" _) (cst/identifier id li) value] l)      (sdef id li (parse-expr value) l)
        (cst/list
            [(cst/identifier "defn" a)
                (cst/identifier id li)
                (cst/array args b)
                body]
                c) (sdef
                                                                                      id
                                                                                          li
                                                                                          (parse-expr
                                                                                          (cst/list [(cst/identifier "fn" a) (cst/array args b) body] c))
                                                                                          c)
        (cst/list [(cst/identifier "defn" _) .._] l)                              (fatal "Invalid 'defn' ${(int-to-string l)}")
        (cst/list
            [(cst/identifier "deftype" _) (cst/identifier id li) ..items]
                l) (mk-deftype id li [] items l)
        (cst/list
            [(cst/identifier "deftype" _)
                (cst/list [(cst/identifier id li) ..args] _)
                ..items]
                l) (mk-deftype id li args items l)
        (cst/list [(cst/identifier "deftype" _) .._] l)                           (fatal "Invalid 'deftype' ${(int-to-string l)}")
        _                                                                         (sexpr
                                                                                      (parse-expr cst)
                                                                                          (match cst
                                                                                          (cst/list _ l)       l
                                                                                          (cst/identifier _ l) l
                                                                                          (cst/array _ l)      l
                                                                                          (cst/string _ _ l)   l
                                                                                          (cst/spread _ l)     l))))

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
                (eapp (evar "+" 12829) (eprim (pint 1 12830) 12830) 12828)
                    (eprim (pint 2 12831) 12831)
                    12828)
                12828))
        (,
        (@@ (defn a [m] m))
            (sdef
            "a"
                12866
                (elambda (pvar "m" 12868) (evar "m" 12869) 12864)
                12864))])

(** ## Type Unification **)

(** Some more types **)

(deftype pred (isin string type))

(defn qual= [(=> preds t) (=> preds' t') t=]
    (if (array= preds preds' pred=)
        (t= t t')
            false))

(deftype (qual t) (=> (array pred) t))

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
            (fatal "classes differ")))

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
                                                  (err "Different Kinds"))
        (, (tcon tc1 _) (tcon tc2 _))     (if (tycon= tc1 tc2)
                                              (ok map/nil)
                                                  (err
                                                  "Unable to match types ${(tycon->s tc1)} and ${(tycon->s tc2)}"))
        _                                 (err "Unable to match ${(type->s t1)} vs ${(type->s t2)}")))

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
        (, (tvar u l) t)                (ok (varBind u t))
        (, t (tvar u l))                (ok (varBind u t))
        (, (tcon tc1 _) (tcon tc2 _))   (if (tycon= tc1 tc2)
                                            (ok map/nil)
                                                (err "Incompatible types ${(tycon->s tc1)} vs ${(tycon->s tc2)}"))
        (, a b)                         (err "Cant unify ${(type->s a)} and ${(type->s b)}")))

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

(defn class-env/merge [(class-env classes defaults) (class-env classes' defaults')]
    (class-env
        (map/merge classes classes')
            (concat [defaults defaults'])))

(def class-env/nil (class-env map/nil []))

(def class-env/std (class-env ))

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

(def initial-env
    (class-env map/nil [tinteger tdouble tfloat tunit]))

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
            (, "ix" [])
            (, "ord" ["eq"])
            (, "show" [])
            (, "read" [])
            (, "pretty" [])
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
                                 _        (fatal "Unknown name ${i}"))]
        [pred ..(concat (map (fn [i'] (by-super ce (isin i' t))) got))]))

(def builtin-env
    (apply-transformers
        example-insts
            (add-prelude-classes initial-env)))

(by-super builtin-env (isin "num" tint))

(by-inst builtin-env (isin "num" tint))

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

(entail builtin-env [(isin "eq" tint)] (isin "num" tint))

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
            (none)    (let [(isin name type) p]
                          (err
                              "Can't find an instance for class '${
                                  name
                                  }' for type ${
                                  (type->s type)
                                  }"))
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
    ; (type...constructors) name => type 
        (type-env
        (map string scheme)
            ; (types) name => (, (array kind) (set name))
            (map string (, (array kind) (set string)))
            ; typealiases
            (map string (, (array kind) type))))

(def tenv/nil (type-env map/nil map/nil map/nil))

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

(deftype (TI a)
    (TI
        (fn [(map tyvar type) type-env int]
            (result (,,, (map tyvar type) type-env int a) string))))

(defn ti-return [x]
    (TI (fn [subst tenv nidx] (ok (,,, subst tenv nidx x)))))

(def <- ti-return)

(defn ti-err [v] (TI (fn [_ _ _] (err v))))

(defn ti-run [(TI f) subst tenv nidx] (f subst tenv nidx))

(defn ti-then [ti next]
    (TI
        (fn [subst tenv nidx]
            (match (ti-run ti subst tenv nidx)
                (err e)                          (err e)
                (ok (,,, subst tenv nidx value)) (ti-run (next value) subst tenv nidx)))))

(def >>= ti-then)

(defn map/ti [f arr]
    (match arr
        []           (<- [])
        [one ..rest] (let-> [res (f one) rest (map/ti f rest)] (<- [res ..rest]))))

(defn ti-from-result [result]
    (match result
        (ok v)  (<- v)
        (err e) (ti-err e)))

(def ok->ti ti-from-result)

(defn sequence [tis]
    (match tis
        []           (<- [])
        [one]        (let-> [res one] (<- [res]))
        [one ..rest] (let-> [res one rest (sequence rest)] (<- [res ..rest]))))

(defn unify [t1 t2]
    (let-> [
        subst get-subst
        u     (ok->ti
                  (map-err
                      (unify-err t1 t2)
                          (mgu (type/apply subst t1) (type/apply subst t2))))]
        (add-subst u)))

(defn unify-err [t1 t2 e]
    (err
        "Unable to unify ${(type->s t1)} and ${(type->s t2)}\n-> ${e}"))

(def get-subst (TI (fn [subst tenv n] (ok (,,, subst tenv n subst)))))

(defn add-subst [new-subst]
    (TI
        (fn [subst tenv n]
            (ok (,,, (compose-subst new-subst subst) tenv n 0)))))

(def next-idx (TI (fn [s t n] (ok (,,, s t (+ n 1) n)))))

(defn new-tvar [kind]
    (let-> [idx next-idx] (<- (tvar (tyvar (enumId idx) kind) -1))))

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
    (let-> [ts (map/ti new-tvar ks)] (<- (inst/qual ts inst/type qt))))

(defn inst/type [types type]
    (match type
        (tapp l r loc) (tapp (inst/type types l) (inst/type types r) loc)
        (tgen n _)     (list/get types n)
        t              t))

(defn inst/qual [types inst/t (=> ps t)]
    (=> (inst/preds types ps) (inst/t types t)))

(defn inst/preds [types preds] (map (inst/pred types) preds))

(defn inst/pred [types (isin c t)] (isin c (inst/type types t)))

(typealias
    (infer e t)
        (fn [class-env (array assump) e] (TI (, (array pred) t))))

(defn tenv/constr [(type-env constrs _ _) name]
    (map/get constrs name))

(defn tenv/value [(type-env _ values _) name] (map/get values name))

(** ## Inference! **)

(defn infer/prim [prim]
    (match prim
        (pbool _ _)  (ti-return (, [] tbool))
        (pfloat _ _) (let-> [v (new-tvar star)] (ti-return (, [(isin "floating" v)] v)))
        (pint _ _)   (let-> [v (new-tvar star)] (ti-return (, [(isin "num" v)] v)))))

(defn infer/pats [pats]
    (let-> [psasts (map/ti infer/pat pats)]
        (let [
            ps (concat (map (fn [(,, ps' _ _)] ps') psasts))
            as (concat (map (fn [(,, _ as' _)] as') psasts))
            ts (map (fn [(,, _ _ t)] t) psasts)]
            (ti-return (,, ps as ts)))))

(def get-tenv (TI (fn [s tenv n] (ok (,,, s tenv n tenv)))))

(defn get-constructor [name]
    (let-> [tenv get-tenv]
        (match (tenv/constr tenv name)
            (none)        (ti-err "Unknown constructor ${name}")
            (some scheme) (<- scheme))))

(defn infer/pat [pat]
    (match pat
        (pvar name l)          (let-> [v (new-tvar star)] (ti-return (,, [] [(!>! name (to-scheme v))] v)))
        (pany l)               (let-> [v (new-tvar star)] (ti-return (,, [] [] v)))
        ; (pas name inner l)
        (pprim prim l)         (let-> [(, ps t) (infer/prim prim)] (ti-return (,, ps [] t)))
        (pcon name patterns l) (let-> [
                                   scheme        (get-constructor name)
                                   (,, ps as ts) (infer/pats patterns)
                                   t'            (new-tvar star)
                                   (=> qs t)     (fresh-inst scheme)
                                   _             (unify t (foldr t' ts (fn [res arg] (tfn arg res))))]
                                   (<- (,, (concat [ps qs]) as t')))))

(defn unzip [list]
    (match list
        []               (, [] [])
        [(, a b) ..rest] (let [(, left right) (unzip rest)] (, [a ..left] [b ..right]))))

(defn infer/expr [ce as expr]
    (match expr
        (evar name l)            (let-> [sc (ok->ti (find-scheme name as)) (=> ps t) (fresh-inst sc)]
                                     (<- (, ps t)))
        (estr first templates l) (let-> [
                                     results        (map/ti (infer/expr ce as) (map (fn [(,, expr _ _)] expr) templates))
                                     (, ps types)   (<- (unzip results))
                                     results'       (map/ti
                                                        (fn [_]
                                                            (fresh-inst (forall [star] (=> [(isin "pretty" (tgen 0 -1))] (tgen 0 -1)))))
                                                            types)
                                     (, ps' types') (<- (unzip (map (fn [(=> a b)] (, a b)) results')))
                                     _              (map/ti (fn [(, a b)] (unify a b)) (zip types types'))]
                                     (<- (, (concat [(concat ps) (concat ps')]) tstring)))
        (eprim prim l)           (infer/prim prim)
        (eapp target arg l)      (let-> [
                                     (, ps target-type) (infer/expr ce as target)
                                     (, qs arg-type)    (infer/expr ce as arg)
                                     result-var         (new-tvar star)
                                     _                  (unify (tfn arg-type result-var) target-type)]
                                     (<- (, (concat [ps qs]) result-var)))
        (elambda pat body l)     (infer/expr
                                     ce
                                         as
                                         (elet (, [] [[(, "lambda-arg" [(, [pat] body)])]]) (evar "lambda-arg" l) l))
        (ematch target cases l)  (infer/expr
                                     ce
                                         as
                                         (elet
                                         (, [] [[(, "match" (map (fn [(, pat body)] (, [pat] body)) cases))]])
                                             (eapp (evar "match" l) target l)
                                             l))
        (elet bindings body l)   (let-> [
                                     (, ps as') (infer/binding-group ce as bindings)
                                     (, qs t)   (infer/expr ce (concat [as' as]) body)]
                                     (<- (, (concat [ps qs]) t)))))

(defn infer/alt [ce as (, pats body)]
    (let-> [
        (,, ps as' ts) (infer/pats pats)
        (, qs t)       (infer/expr ce (concat [as' as]) body)]
        (let [res-type (foldr t ts (fn [res arg] (tfn arg res)))]
            (ti-return (, (concat [ps qs]) res-type)))))

(defn infer/alts [ce as alts t]
    (let-> [
        psts ((map/ti (infer/alt ce as) alts))
        _    ((map/ti (unify t) (map snd psts)))]
        (ti-return (concat (map fst psts)))))

(defn infer/expl [ce as (,, i sc alts)]
    (let-> [(=> qs t) (fresh-inst sc) ps (infer/alts ce as alts t) s (get-subst)]
        (let [
            qs' (preds/apply s qs)
            t'  (type/apply s t)
            fs  (set/to-list
                    (foldr1 set/merge (map assump/tv (map (assump/apply s) as))))
            gs  (without (set/to-list (type/tv t')) fs tyvar=)
            sc' (quantify gs (=> qs' t'))
            ps' (filter (fn [x] (not (entail ce qs' x))) (preds/apply s ps))]
            (let-> [(, ds rs) ((split ce fs gs ps'))]
                (if (!= sc sc')
                    (ti-err "signature too general")
                        (match rs
                        [] (ti-return ds)
                        _  (ti-err "context too weak")))))))

(defn infer/impls [ce as bs]
    (let-> [ts ((map/ti (fn [_] (new-tvar star)) bs))]
        (let [
            is    (map fst bs)
            scs   (map toScheme ts)
            as'   (+++ (zipWith !>! is scs) as)
            altss (map snd bs)]
            (let-> [pss ((sequence (zipWith (infer/alts ce as') altss ts))) s (get-subst)]
                (let [
                    ps' (preds/apply s (concat pss))
                    ts' (map (type/apply s) ts)
                    fs  (set/to-list
                            (foldl
                                set/nil
                                    (map (assump/apply s) as)
                                    (fn [res as] (set/merge res (assump/tv as)))))
                    vss (map type/tv ts')
                    gs  (without (set/to-list (foldr1 set/merge vss)) fs tyvar=)]
                    (let-> [
                        (, ds rs) ((** This intersect call is the part that makes it so that, if you have multiple bindings in a group,
                                      the only variables that can have typeclass constraints are ones that appear in every binding. **)
                                      (split ce fs (foldr1 (intersect tyvar=) (map set/to-list vss)) ps'))]
                        (<-
                            (if (restricted bs)
                                (let [
                                    gs'  (without gs (set/to-list (preds/tv rs)) tyvar=)
                                    scs' (map (fn [x] (quantify gs' (=> [] x))) ts')]
                                    (, (+++ ds rs) (zipWith !>! is scs')))
                                    (let [scs' (map (fn [x] (quantify gs (=> rs x))) ts')]
                                    (, ds (zipWith !>! is scs')))))))))))

(defn infer/binding-group [class-env as (, explicit implicits)]
    (let [
        expl-assumps (map (fn [(,, name scheme _)] (!>! name scheme)) explicit)]
        (let-> [
            (, impl-preds impl-assumps) (infer/seq
                                            infer/impls
                                                class-env
                                                (+++ expl-assumps as)
                                                implicits)
            expl-preds                  (map/ti
                                            (infer/expl class-env (concat [impl-assumps expl-assumps as]))
                                                explicit)]
            (<-
                (,
                    (+++ impl-preds (concat expl-preds))
                        (+++ impl-assumps expl-assumps))))))

(defn infer/seq [ti ce as assumptions]
    (match assumptions
        []         (<- (, [] []))
        [bs ..bss] (let-> [
                       (, ps as')  (ti ce as bs)
                       (, qs as'') (infer/seq ti ce (+++ as' as) bss)]
                       (<- (, (+++ ps qs) (+++ as'' as'))))))

(defn infer/program [tenv ce as bindgroups]
    (ti-run
        (let-> [
            (, preds assumps) (infer/seq infer/binding-group ce as bindgroups)
            subst0            (get-subst)
            reduced           (ti-from-result (reduce ce (preds/apply subst0 preds)))
            subst             (ti-from-result (defaultSubst ce [] reduced))]
            (ti-return
                (map (assump/apply (compose-subst subst subst0)) assumps)))
            map/nil
            tenv
            0))

(** ## Type Classes Stuff **)

(defn split [ce fs gs ps]
    (let-> [
        ps'       (ti-from-result (reduce ce ps))
        (, ds rs) (<-
                      (partition
                          ps'
                              (fn [(isin name type)]
                              (every (set/to-list (type/tv type)) (fn [x] (contains fs x tyvar=))))))
        rs'       (ti-from-result (defaultedPreds ce (concat [fs gs]) rs))]
        (ti-return (, ds (without rs rs' pred= )))))

(typealias ambiguity (, tyvar (array pred)))

(defn ambiguities [ce known-variables preds]
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

(defn +++ [a b] (concat [a b]))

(def stdClasses
    (+++
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
            "monadplus"]
            numClasses))

(defn id [x] x)

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
            (fn [(, a preds)] "${(tyvar->s a)} ${(join ";" (map pred->s preds))}")
                vps)))

(defn is-empty [x]
    (match x
        [] true
        _  false))

(defn withDefaults [f ce known-variables predicates]
    (let [
        vps (ambiguities ce known-variables predicates)
        tss (map (candidates ce) vps)]
        (if (any is-empty tss)
            (err
                "Cannot resolve ambiguity vps: ${
                    (vps->s vps)
                    } tss: ${
                    (tss->s tss)
                    }")
                (ok (f vps (map head tss))))))

(def defaultedPreds (withDefaults (fn [vps ts] (concat (map snd vps)))))

(def defaultSubst
    (withDefaults (fn [vps ts] (map/from-list (zip (map fst vps) ts)))))

(defn restricted [bs]
    (let [
        simple (fn [(, i alts)]
                   (any
                       (fn [(, v _)]
                           (match v
                               [] true
                               _  false))
                           alts))]
        (any simple bs)))

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
            (show result)
            (int-ratio "show")
            (show pair)
            (ix pair)
            (generics [] (isin "monad" (tcon (tycon "option" (kfun star star)) -1)))
            (generics [] (isin "monad" (tcon (tycon "list" (kfun star star)) -1)))
            ..(concat
            (map
                (fn [(, cls names)] (map (fn [name] (, [] (=> [] (isin cls (mkcon name))))) names))
                    [(, "eq" ["unit" "char" "int" "float" "double" "bool" "ordering"])
                    (, "ord" ["unit" "char" "int" "float" "double" "bool" "ordering"])
                    (, "num" ["int" "float" "double"])
                    (, "real" ["int" "float" "double"])
                    (, "integral" ["int"])
                    (, "fractional" ["float" "double"])
                    (, "floating" ["float" "double"])
                    (, "realfrac" ["float" "double"])
                    (, "show" ["unit" "char" "int" "float" "double" "bool" "ordering"])
                    (,
                    "pretty"
                        ["unit" "char" "int" "string" "float" "double" "bool" "ordering"])
                    (, "ix" ["unit" "char" "int" "bool" "ordering"])]))]))

(defn dot [a b c] (a (b c)))

(** ## Puttin in all together **)

(defn parse-binding [jcst]
    (match jcst
        (cst/list [(cst/identifier "fn" l) (cst/array items _) body] _) (, "it" [(, (map parse-pat items) (parse-expr body))])
        _                                                               (, "it" [(, [] (parse-expr jcst))])))

(def builtin-ce
    (apply-transformers
        (map (fn [(, _ (=> a b))] (add-inst a b)) builtin-instances)
            (add-prelude-classes initial-env)))

(def builtin-tenv
    (type-env
        (map/from-list
            [(, "ok" (tuple-scheme (generics [[] []] (tfn g0 (tresult g0 g1)))))
                (, "err" (tuple-scheme (generics [[] []] (tfn g1 (tresult g0 g1)))))
                (, "," (tuple-scheme (generics [[] []] (tfns [g0 g1] (mkpair g0 g1)))))])
            (map/from-list [])
            map/nil))

(def program-results->s
    (result->s (fn [(,,, abc tenv a b)] (join "\n" (map assump->s b)))))

(,
    (fn [v]
        (program-results->s
            (infer/program
                builtin-tenv
                    builtin-ce
                    builtin-assumptions
                    [(, [] [[(parse-binding v)]])])))
        [(, (@@ 11) "it: int")
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
            "it: bool")])

(** ## Producing the functions for an Evaluator **)

(deftype full-env (full-env type-env class-env (array assump)))

(def builtin-full
    (full-env builtin-tenv builtin-ce builtin-assumptions))

filter

(defn infer-stmt [(full-env tenv ce assumps) stmt]
    (match stmt
        (sdef name nl body l)                  (match (infer/program tenv ce assumps [(, [] [[(, name [(, [] body)])]])])
                                                   (ok (,,, subst tenv nidx assumps)) (filter (fn [(!>! n _)] (= n name)) assumps)
                                                   (err e)                            (fatal e))
        (stypealias name nl args type l)       []
        (sdeftype name nl args constructors l) []
        (sexpr body l)                         (match (infer/program tenv ce assumps [(, [] [[(, "it" [(, [] body)])]])])
                                                   (ok (,,, subst tenv nidx assumps)) []
                                                   (err e)                            (fatal e))))

(defn infer [(full-env tenv ce assumps) body]
    (match (infer/program tenv ce assumps [(, [] [[(, "it" [(, [] body)])]])])
        (ok (,,, subst tenv nidx assumps)) (match (filter (fn [(!>! n _)] (= n "it")) assumps)
                                               [(!>! n (forall what (=> kinds typ)))] typ
                                               _                                      (fatal "No type found"))
        (err e)                            (fatal e)))

(defn infer-alias [(full-env tenv ce assumps) (,, name args type)]
    (fatal "ok here we are")
        ;(full-env tenv ce assumps))

(defn infer-deftype [(full-env (type-env constructors- types- aliases-) ce assumps)
    (,,, name tnl top-args constructors)]
    ; TODO make it so we can do higher kinds
        ;  and type classes! can't do that just yet.
        (let [
        names                      (map (fn [(,,, name _ _ _)] name) constructors)
        (, final _)                (foldl
                                       (, (tcon (tycon name star) tnl) 0)
                                           top-args
                                           (fn [(, body i) (, arg al)] (, (tapp body (tgen i al) al) (+ i 1))))
        free-idxs                  (mapi (fn [(, arg al) i] (, name (tgen i al))) 0 top-args)
        (, assumps' constructors') (foldl
                                       (, assumps constructors-)
                                           constructors
                                           (fn [(, assumps constructors) (,,, name nl args l)]
                                           (let [
                                               typ            (tfns args final)
                                               (, kinds qual) (generics (map (fn [_] []) top-args) typ)]
                                               (,
                                                   [(!>! name (forall kinds qual)) ..assumps]
                                                       (map/set constructors name (forall kinds qual))))))]
        (full-env (type-env constructors' types- aliases-) ce assumps')))

(defn foldl-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [one (f init one)] (foldl-> one rest f))))

(defn foldr-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [init (foldr-> init rest f)] (f init one))))

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

(defn infer-types [full aliases deftypes]
    (let [names (map (fn [(,, name args type)] name) aliases)]
        (foldl (foldl full aliases infer-alias) deftypes infer-deftype)))

(defn infer-defs [(full-env tenv ce assumps) defs]
    (match (infer/program
        tenv
            ce
            assumps
            [(, [] [(map (fn [(, name body)] (, name [(, [] body)])) defs)])])
        (ok (,,, subst tenv nidx assumps)) (full-env tenv ce assumps)
        (err e)                            (fatal e)))

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

;(defn infer-defns [tenv stmts]
    (match stmts
        [one] (infer-stmt tenv one)
        _     (let-> [zipped (infer-several tenv stmts)]
                  (<-
                      (foldl
                          tenv/nil
                              zipped
                              (fn [tenv (, name type)]
                              (tenv/set-type tenv name (generalize tenv type))))))))

;(defn infer-stmtss [tenv' stmts]
    (let-> [
        (,,, sdefs stypes salias sexps) (<- (split-stmts stmts [] [] [] []))
        type-tenv                       (infer-stypes tenv' stypes salias)
        tenv'                           (<- (tenv/merge type-tenv tenv'))
        val-tenv                        (infer-defns tenv' sdefs)
        _                               (map-> (infer (tenv/merge val-tenv tenv')) sexps)]
        (<- (tenv/merge type-tenv val-tenv))))

(deftype name-kind (value) (type))

(typealias locname (,, string name-kind int))

(deftype evaluator
    (evaluator
        full-env
            (fn [full-env (array stmt)] full-env)
            (fn [full-env full-env] full-env)
            (fn [full-env expr] type)
            (fn [stmt] (array locname))
            (fn [expr] (array locname))
            (fn [stmt] (array locname))
            (fn [type] string)
            (fn [full-env string] (option type))))

(defn infer-stmts [(full-env tenv ce assumps) stmts]
    (full-env
        tenv/nil
            class-env/nil
            (foldl
            assumps
                stmts
                (fn [assumps stmt] (infer-stmt (full-env tenv ce assumps) stmt)))))

(defn full-env/merge [(full-env a b c) (full-env d e f)]
    (full-env (tenv/merge a d) (class-env/merge b e) (concat [c f])))



infer/program



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
                                                (foldl empty (map pat-externals [pats]) bag/and)
                                                    (externals (foldl bound (map pat-names [pats]) set/merge) body))
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
                                                    (foldl empty (map (externals bound) [args]) bag/and))
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
        (sdeftype name l _ constructors _) [(,, name (type) l)
                                               ..(map (fn [(,,, name l _ _)] (,, name (value) l)) constructors)]))

(defn externals-stmt [stmt]
    (bag/to-list
        (match stmt
            (sdeftype string int free constructors int) (let [frees (set/from-list (map fst free))]
                                                            (many
                                                                (map
                                                                    (fn [(,,, name l args _)]
                                                                        (match args
                                                                            [] empty
                                                                            _  (many (map (externals-type frees) args))))
                                                                        constructors)))
            (stypealias name _ args body _)             (let [frees (set/from-list (map fst args))]
                                                            (externals-type frees body))
            (sdef name int body int)                    (externals (set/add set/nil name) body)
            (sexpr expr int)                            (externals set/nil expr))))

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

((eval
    "({0: env_nil, 1: infer_stmts, 2: add_stmt, 3: infer,\n  4: externals_stmt, 5: externals_expr, 6: names,\n  7: type_to_string, 8: get_type\n }) => ({type: 'fns',\n   env_nil, infer_stmts, add_stmt, infer, externals_stmt, externals_expr, names, type_to_string, get_type \n }) ")
    (evaluator
        builtin-full
            infer-stmts
            full-env/merge
            infer
            externals-stmt
            (fn [expr] (bag/to-list (externals set/nil expr)))
            names
            type->s
            (fn [(full-env tenv ce assumps) name]
            (match (filter (fn [(!>! n _)] (= n name)) assumps)
                [(!>! _ (forall _ (=> _ typ))) .._] (some typ)
                _                                   (none)))))