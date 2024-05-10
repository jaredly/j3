(def builtins
    "const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', \n'>': '$gt', '<': '$lt', \"'\": '$qu', '\"': '$dq', ',': '$co', '@': '$at', '/': '$sl'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst $eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst $pl$pl = (items) => unwrapArray(items).join('');\nconst $pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst $co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n")



(** ## Type Schemes **)

(** Some more types **)

(deftype pred (isin string type))

(deftype (qual t) (=> (array pred) t))

(defn array= [a b v=]
    (match (, a b)
        (, [] [])             true
        (, [a0 ..a] [b0 ..b]) (if (v= a0 b0)
                                  (array= a b v=)
                                      false)))

(defn qual= [(=> preds t) (=> preds' t') t=]
    (if (array= preds preds' pred=)
        (t= t t')
            false))

(defn pred->s [(isin name type)] "${(type->s type)} ∈ ${name}")

(defn pred= [(isin id type) (isin id' type')]
    (if (= id id')
        (type= type type')
            false))

(deftype scheme (forall (array kind) (qual type)))

(defn scheme= [(forall kinds qual) (forall kinds' qual')]
    (if (array= kinds kinds' kind=)
        (qual= qual qual' type=)
            false))

;(defn scheme/apply [subst (forall ks qt)]
    (forall ks (qual/apply subst qt type/apply)))

;(defn scheme/tv [(forall ks qt)] (qual/tv qt type/tv))

;(defn quantify [vs qt]
    (let [
        vs'   (filter (fn [v] (any (tyvar= v) vs)) (set/to-list (qual/tv qt type/tv)))
        ks    (map tyvar/kind vs')
        subst (map/from-list (mapi (fn [v i] (, v (tgen i -1))) 0 vs'))]
        (forall ks (qual/apply subst qt type/apply))))

(defn to-scheme [t] (forall [] (=> [] t)))

(deftype assump (!>! string scheme))

;(defn assump/apply [subst (!>! id sc)]
    (!>! id (scheme/apply subst sc)))

;(defn assump/tv [(!>! id sc)] (scheme/tv sc))

;(defn find-scheme [id assumps]
    (match assumps
        []                    (err "Unbound identifier ${id}")
        [(!>! id' sc) ..rest] (if (= id id')
                                  (ok sc)
                                      (find-scheme id rest))))

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

;(type->fn (tfn tint (tfn tfloat tbool)))

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
                                                           "(${(type->s target)} ${(join " " (map args type->s))})")
                                       (, args result) "(fn [${(join " " (map args type->s))}] ${(type->s result)})")
        (tcon (tycon "(,)" _) _)   ","
        (tcon (tycon "[]" _) _)    "list"
        (tcon (tycon name _) _)    name
        (tcon con _)               (tycon->s con)
        (tgen num _)               (gen-name num)))

;(type->s tstring)

;(type->s (mkpair tint tbool))

;(type->s (tfn tint (tfn tfloat tbool)))

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
                           (mapi 0 kinds (fn [i kind] "${(gen-name i)} ${(kind->s kind)}")))
                   }; ")
        }${
        (match preds
            [] ""
            _  "${(join "; " (map preds pred->s))}; ")
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

;(def types->s (dot (join "\n") (fn [x] (map x type->s))))

;(def assumps->s (dot (join "\n") (map assump->s)))

(** ## Our AST & CST **)

;(deftype cst
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/spread cst int)
        (cst/identifier string int)
        (cst/string string (array (,, cst string int)) int))

;(deftype (array a) (nil) (cons a (array a)))

;(deftype expr
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

;(deftype prim (pint int int) (pfloat float int) (pbool bool int))

;(deftype pat
    (pany int)
        (pvar string int)
        (pcon string (array pat) int)
        (pstr string int)
        (pprim prim int))

;(defn enumId [num] "v${(int-to-string num)}")

;(deftype kind (star) (kfun kind kind))

;(deftype tyvar (tyvar string kind))

;(deftype type
    (tvar tyvar int)
        (tapp type type int)
        (tcon tycon int)
        (tgen int int))

;(deftype tycon (tycon string kind))

;(defn star-con [name] (tcon (tycon name star) -1))

(def tunit (star-con "()"))

(def tchar (star-con "char"))

(def tint (star-con "int"))

(def tinteger (star-con "integer"))

(def tfloat (star-con "float"))

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

;(defn type/kind [type]
    (match type
        (tcon tc _)  (tycon/kind tc)
        (tvar u _)   (tyvar/kind u)
        (tapp t _ l) (match (type/kind t)
                         (kfun _ k) k
                         _          (fatal "Invalid type application ${(int-to-string l)}"))))

;(typealias subst (array (, tyvar type)))

;(def nullSubst [])

;(defn |-> [u t] [(, u t)])

;(defn abc/apply [subst abc] abc)

;(defn abc/tv [t] (array tyvar))

;(deftype stmt
    (sdeftype
        string
            int
            (array (, string int))
            (array (,,, string int (array type) int))
            int)
        (sdef string int expr int)
        (sexpr expr int))

(** ## Prelude **)

(defn join [sep items]
    (match items
        []           ""
        [one ..rest] (match rest
                         [] one
                         _  (++ [one sep (join sep rest)]))))

(join " " ["one" "two" "three"])

(join " " [])

(join " " ["one"])

(defn mapi [i values f]
    (match values
        []           []
        [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)]))

(foldr nil [1 2 3 4] (fn [b a] (cons a b)))

(defn rev [arr col]
    (match arr
        []           col
        [one]        [one ..col]
        [one ..rest] (rev rest [one ..col])))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(defn map [values f]
    (match values
        []           []
        [one ..rest] [(f one) ..(map rest f)]))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(defn pairs [list]
    (match list
        []               []
        [one two ..rest] [(, one two) ..(pairs rest)]
        _                (fatal "Pairs given odd number ${(valueToString list)}")))

(deftype (option a) (some a) (none))

(defn snd [tuple] (let [(, _ v) tuple] v))

(defn fst [tuple] (let [(, v _) tuple] v))

(defn replaces [target repl]
    (match repl
        []           target
        [one ..rest] (match one
                         (, find nw) (replaces (replace-all target find nw) rest))))

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
                                                                               (fn [body arg]
                                                                               (tapp
                                                                                   (tapp (tcon (tycon "->" (kfun star star)) -1) (parse-type arg) -1)
                                                                                       body
                                                                                       -1)))
        (cst/list items l)                                             (tapps (rev (map items parse-type) []) l)
        _                                                              (fatal "(parse-type) Invalid type ${(valueToString type)}")))

(,
    parse-type
        [(,
        (@@ (hi ho))
            (tapp (tcon (tycon "hi" (star)) 5527) (tcon (tycon "ho" (star)) 5528) 5526))
        (,
        (@@ (fn [x] y))
            (tapp
            (tapp
                (tcon (tycon "->" (kfun (star) (star))) -1)
                    (tcon (tycon "x" (star)) 5558)
                    -1)
                (tcon (tycon "y" (star)) 5559)
                -1))
        (,
        (@@ (fn [a b] c))
            (tapp
            (tapp
                (tcon (tycon "->" (kfun (star) (star))) -1)
                    (tcon (tycon "a" (star)) 5688)
                    -1)
                (tapp
                (tapp
                    (tcon (tycon "->" (kfun (star) (star))) -1)
                        (tcon (tycon "b" (star)) 5689)
                        -1)
                    (tcon (tycon "c" (star)) 5690)
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
        (cst/list [(cst/identifier name _) ..rest] l) (pcon name (map rest parse-pat) l)
        _                                             (fatal "parse-pat mo match ${(valueToString pat)}")))

(parse-pat (@@ [1 2 ..a]))

(defn parse-expr [cst]
    (match cst
        (cst/identifier "true" l)                                        (eprim (pbool true l) l)
        (cst/identifier "false" l)                                       (eprim (pbool false l) l)
        (cst/string first templates l)                                   (estr
                                                                             first
                                                                                 (map
                                                                                 templates
                                                                                     (fn [tpl] (let [(,, expr string l) tpl] (,, (parse-expr expr) string l))))
                                                                                 l)
        (cst/identifier id l)                                            (match (string-to-int id)
                                                                             (some int) (eprim (pint int l) l)
                                                                             (none)     (match (string-to-float id)
                                                                                            (some float) (eprim (pfloat float l) l)
                                                                                            (none)       (evar id l)))
        (cst/list [(cst/identifier "@" _) body] l)                       (equot (parse-expr body) l)
        (cst/list [(cst/identifier "@@" _) body] l)                      (equotquot body l)
        (cst/list [(cst/identifier "@!" _) body] l)                      (equot/stmt (parse-stmt body) l)
        (cst/list [(cst/identifier "@t" _) body] l)                      (equot/type (parse-type body) l)
        (cst/list [(cst/identifier "@p" _) body] l)                      (equot/pat (parse-pat body) l)
        (cst/list [(cst/identifier "if" _) cond yes no] l)               (ematch
                                                                             (parse-expr cond)
                                                                                 [(, (pprim (pbool true l) l) (parse-expr yes)) (, (pany l) (parse-expr no))]
                                                                                 l)
        (cst/list [(cst/identifier "fn" _) (cst/array args _) body]  b)  (foldr
                                                                             (parse-expr body)
                                                                                 args
                                                                                 (fn [body arg] (elambda (parse-pat arg) body b)))
        (cst/list [(cst/identifier "match" _) target ..cases] l)         (ematch
                                                                             (parse-expr target)
                                                                                 (map
                                                                                 (pairs cases)
                                                                                     (fn [case] (let [(, pat expr) case] (, (parse-pat pat) (parse-expr expr)))))
                                                                                 l)
        (cst/list [(cst/identifier "let" _) (cst/array inits _) body] l) (foldr
                                                                             (parse-expr body)
                                                                                 (pairs inits)
                                                                                 (fn [body init]
                                                                                 (let [(, pat value) init]
                                                                                     (match pat
                                                                                         (cst/identifier name l) (elet (, [] [[(, name [(, [] (parse-expr value))])]]) body l)
                                                                                         _                       (elet (, [] [[(, "it" [(, [(parse-pat pat)] (parse-expr value))])]]) body l)))))
        (cst/list [target ..args] l)                                     (foldl
                                                                             (parse-expr target)
                                                                                 args
                                                                                 (fn [target arg] (eapp target (parse-expr arg) l)))
        (cst/array args l)                                               (parse-array args l)))

(parse-expr (@@ (@! 12)))

(defn parse-array [args l]
    (match args
        []                     (evar "nil" l)
        [(cst/spread inner _)] (parse-expr inner)
        [one ..rest]           (eapp (eapp (evar "cons" l) (parse-expr one) l) (parse-array rest l) l)))

(,
    parse-expr
        [(, (@@ true) (eprim (pbool true 1163) 1163))
        (,
        (@@ [1 ..b])
            (eapp
            (eapp (evar "cons" 3401) (eprim (pint 1 3402) 3402) 3401)
                (evar "b" 3403)
                3401))
        (, (@@ "hi") (estr "hi" [] 1177))
        (, (@@ (@t a)) (equot/type (tcon (tycon "a" (star)) 5333) 5331))
        (,
        (@@ (@t (a b c)))
            (equot/type
            (tapp
                (tapp (tcon (tycon "a" (star)) 5364) (tcon (tycon "b" (star)) 5365) 5363)
                    (tcon (tycon "c" (star)) 5366)
                    5363)
                5360))
        (, (@@ (@p _)) (equot/pat (pany 5349) 5346))
        (,
        (@@
            (if (= a b)
                a
                    b))
            (ematch
            (eapp (eapp (evar "=" 4622) (evar "a" 4623) 4621) (evar "b" 4624) 4621)
                [(, (pprim (pbool true 4619) 4619) (evar "a" 4625))
                (, (pany 4619) (evar "b" 4626))]
                4619))
        (, (@@ "a${1}b") (estr "a" [(,, (eprim (pint 1 3610) 3610) "b" 3611)] 3608))
        (,
        (@@ [1 2])
            (eapp
            (eapp (evar "cons" 3238) (eprim (pint 1 3239) 3239) 3238)
                (eapp
                (eapp (evar "cons" 3238) (eprim (pint 2 3240) 3240) 3238)
                    (evar "nil" 3238)
                    3238)
                3238))
        (, (@@ 12) (eprim (pint 12 1188) 1188))
        (,
        (@@
            (match 2
                1 2))
            (ematch
            (eprim (pint 2 2997) 2997)
                [(, (pprim (pint 1 2998) 2998) (eprim (pint 2 2999) 2999))]
                2995))
        (, (@@ abc) (evar "abc" 1200))
        (,
        (@@ (let [a 1 b 2] a))
            (elet
            (, [] [[(, "a" [(, [] (eprim (pint 1 4457) 4457))])]])
                (elet (, [] [[(, "b" [(, [] (eprim (pint 2 4459) 4459))])]]) (evar "a" 4460) 4458)
                4456))
        (, (@@ (fn [a] 1)) (elambda (pvar "a" 1238) (eprim (pint 1 1239) 1239) 1235))
        (,
        (@@ (fn [a b] 2))
            (elambda
            (pvar "a" 1256)
                (elambda (pvar "b" 1257) (eprim (pint 2 1258) 1258) 1253)
                1253))
        (,
        (@@ (fn [(, a b)] a))
            (elambda
            (pcon "," [(pvar "a" 1913) (pvar "b" 1914)] 1911)
                (evar "a" 1915)
                1908))
        (,
        (@@ (+ 1 2))
            (eapp
            (eapp (evar "+" 1519) (eprim (pint 1 1520) 1520) 1288)
                (eprim (pint 2 1521) 1521)
                1288))
        (,
        (@@ (int-to-string 23))
            (eapp (evar "int-to-string" 1615) (eprim (pint 23 1616) 1616) 1614))
        (,
        (@@ (let [x 2] x))
            (elet (, [] [[(, "x" [(, [] (eprim (pint 2 1680) 1680))])]]) (evar "x" 1681) 1679))
        (,
        (@@ (let [(, a b) (, 2 3)] 1))
            (elet
            (,
                []
                    [[(,
                    "it"
                        [(,
                        [(pcon "," [(pvar "a" 1794) (pvar "b" 1795)] 1792)]
                            (eapp
                            (eapp (evar "," 1797) (eprim (pint 2 1798) 1798) 1796)
                                (eprim (pint 3 1799) 1799)
                                1796))])]])
                (eprim (pint 1 1800) 1800)
                1789))
        (, (@@ (@@ 1)) (equotquot (cst/identifier "1" 3110) 3108))
        (, (@@ (@ 1)) (equot (eprim (pint 1 3124) 3124) 3122))])

(parse-expr (@@ (fn [a] 1)))

(defn mk-deftype [id li args items l]
    (sdeftype
        id
            li
            (map
            args
                (fn [arg]
                (match arg
                    (cst/identifier name l) (, name l)
                    _                       (fatal "deftype type argument must be identifier"))))
            (map
            items
                (fn [constr]
                (match constr
                    (cst/list [(cst/identifier name ni) ..args] l) (,,, name ni (map args parse-type) l))))
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
        (cst/list
            [(cst/identifier "deftype" _) (cst/identifier id li) ..items]
                l) (mk-deftype id li [] items l)
        (cst/list
            [(cst/identifier "deftype" _)
                (cst/list [(cst/identifier id li) ..args] _)
                ..items]
                l) (mk-deftype id li args items l)
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
        [(, (@@ (def a 2)) (sdef "a" 1302 (eprim (pint 2 1303) 1303) 1300))
        (,
        (@@ (deftype what (one int) (two bool)))
            (sdeftype
            "what"
                1335
                []
                [(,,, "one" 1337 [(tcon (tycon "int" (star)) 1338)] 1336)
                (,,, "two" 1340 [(tcon (tycon "bool" (star)) 1341)] 1339)]
                1333))
        (,
        (@@ (deftype (array a) (nil) (cons (array a))))
            (sdeftype
            "array"
                1486
                [(, "a" 1487)]
                [(,,, "nil" 1489 [] 1488)
                (,,,
                "cons"
                    1491
                    [(tapp
                    (tcon (tycon "array" (star)) 1493)
                        (tcon (tycon "a" (star)) 1494)
                        1492)]
                    1490)]
                1483))
        (,
        (@@ (+ 1 2))
            (sexpr
            (eapp
                (eapp (evar "+" 1969) (eprim (pint 1 1970) 1970) 1968)
                    (eprim (pint 2 1971) 1971)
                    1968)
                1968))
        (,
        (@@ (defn a [m] m))
            (sdef "a" 2051 (elambda (pvar "m" 2055) (evar "m" 2053) 2049) 2049))])

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
                                   (pbool bool _) "if (${
                                                      target
                                                      } === ${
                                                      (match bool
                                                          true "true"
                                                          _    "false")
                                                      }) {\n${
                                                      inner
                                                      }\n}")
            (pstr str l)       "if (${target} === \"${str}\"){\n${inner}\n}"
            (pvar name l)      "{\nlet ${(sanitize name)} = ${target};\n${inner}\n}"
            (pcon name args l) "if (${
                                   target
                                   }.type === \"${
                                   name
                                   }\") {\n${
                                   (pat-loop target args 0 inner trace)
                                   }\n}")))

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

(defn concat [lists]
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
                                                  _  "`${
                                                         (escape-string (unescapeString first))
                                                         }${
                                                         (join
                                                             ""
                                                                 (map
                                                                 tpls
                                                                     (fn [item]
                                                                     (let [(,, expr suffix l) item]
                                                                         "${${
                                                                             (compile expr trace)
                                                                             }}${
                                                                             (escape-string (unescapeString suffix))
                                                                             }"))))
                                                         }`")
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
                (elambda pat body l)          "function name_${
                                                  (its l)
                                                  }(${
                                                  (orr "_" (just-pat pat))
                                                  }) { return ${
                                                  (compile body trace)
                                                  } }"
                (elet (, [] inferred) body l) (foldl
                                                  (compile body trace)
                                                      (concat inferred)
                                                      (fn [body (, name [(, [] init)])]
                                                      "(function let_${
                                                          (its l)
                                                          }() {const ${
                                                          (sanitize name)
                                                          } = ${
                                                          (compile init trace)
                                                          };\n${
                                                          ("return ${body}"
                                                              ;(compile-pat pat "$target" "return ${body}" trace))
                                                          };\nthrow new Error('let pattern not matched. ' + valueToString($target));\n})()"))
                (eapp fn arg l)               (match fn
                                                  (elambda _ _ _) "(${(compile fn trace)})(${(compile arg trace)})"
                                                  _               "${(compile fn trace)}(${(compile arg trace)})")
                (ematch target cases l)       "(function match_${
                                                  (its l)
                                                  }($target) {\n${
                                                  (join
                                                      "\n"
                                                          (map
                                                          cases
                                                              (fn [case]
                                                              (let [(, pat body) case]
                                                                  (compile-pat pat "$target" "return ${(compile body trace)}" trace)))))
                                                  }\nthrow new Error('failed to match ' + jsonify($target) + '. Loc: ${
                                                  (its l)
                                                  }');\n})(${
                                                  (compile target trace)
                                                  })"))))

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
        (sexpr expr l)                      (compile expr trace)
        (sdef name nl body l)               (++ ["const " (sanitize name) " = " (compile body trace) ";\n"])
        (sdeftype name nl type-arg cases l) (join
                                                "\n"
                                                    (map
                                                    cases
                                                        (fn [case]
                                                        (let [(,,, name2 nl args l) case]
                                                            (++
                                                                ["const "
                                                                    (sanitize name2)
                                                                    " = "
                                                                    (++ (mapi 0 args (fn [i _] (++ ["(v" (int-to-string i) ") => "]))))
                                                                    "({type: \""
                                                                    name2
                                                                    "\""
                                                                    (++
                                                                    (mapi
                                                                        0
                                                                            args
                                                                            (fn [i _] (++ [", " (int-to-string i) ": v" (int-to-string i)]))))
                                                                    "});"])))))))

(,
    (fn [x] (compile-stmt (parse-stmt x) map/nil))
        [(,
        (@@ (deftype (array a) (cons a (array a)) (nil)))
            "const cons = (v0) => (v1) => ({type: \"cons\", 0: v0, 1: v1});\nconst nil = ({type: \"nil\"});")
        (,
        (@@ (deftype face (red) (black)))
            "const red = ({type: \"red\"});\nconst black = ({type: \"black\"});")])

(deftype parse-and-compile
    (parse-and-compile
        (fn [cst] stmt)
            (fn [cst] expr)
            (fn [stmt (map int bool)] string)
            (fn [expr (map int bool)] string)))

(parse-and-compile parse-stmt parse-expr compile-stmt compile)

((eval
    "({0: parse_stmt,  1: parse_expr, 2: compile_stmt, 3: compile}) => ({\ntype: 'fns', parse_stmt, parse_expr, compile_stmt, compile})")
    (parse-and-compile parse-stmt parse-expr compile-stmt compile))