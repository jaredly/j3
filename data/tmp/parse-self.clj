(** ## Self-Hosted Parsing **)

(** Here we're doing essentially the same things as bootstrap, but we have the advantages of rich pattern-matching, so we can do
    (match node
        (cst/list [(cst/id "def" _) (cst/id name _) body] _) ...)  
    instead of
    if (node.type === 'list' &&
        node.values.length === 3 &&
        node[0].type === 'identifier' &&
        node[0].text === 'def' &&
        node[1].type === 'identifier') { 
    Isn't it great? **)

(** ## Prelude **)

(** Yes I am committing many point-free crimes in this prelude; map should have the function as the first argument, foldr's function should have the arguments flipped, etc. This is just how it works in my head 🙃. **)

(defn join [sep items]
    (match items
        []           ""
        [one ..rest] (match rest
                         [] one
                         _  "${one}${sep}${(join sep rest)}")))

(join " " ["ones" "two" "three"])

(join " " [])

(join " " ["one"])

(defn mapi [i values f]
    (match values
        []           []
        [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)]))

(defn zip [one two]
    (match (, one two)
        (, [] [])               []
        (, [o ..one] [t ..two]) [(, o t) ..(zip one two)]
        _                       (fatal "Unbalanced zip")))

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

(foldr nil [1 2 3 4] (fn [b a] (cons a b)))

(defn pairs [list]
    (match list
        []               []
        [one two ..rest] [(, one two) ..(pairs rest)]
        _                (fatal "Pairs given odd number ${(valueToString list)}")))

(defn concat [lists]
    (match lists
        []                     []
        [[] ..rest]            (concat rest)
        [[one ..rest] ..other] [one ..(concat [rest ..other])]))

(deftype (option a)
    (some a)
        (none))

(defn snd [tuple] (let [(, _ v) tuple] v))

(defn fst [tuple] (let [(, v _) tuple] v))

(defn replaces [target repl]
    (match repl
        []           target
        [one ..rest] (match one
                         (, find nw) (replaces (replace-all target find nw) rest))))

(deftype (list a)
    (nil)
        (cons a (list a)))

(defn filter-some [items]
    (foldr
        []
            items
            (fn [res v]
            (match v
                (some v) [v ..res]
                _        res))))

(defn loop [v f] (f v (fn [nv] (loop nv f))))

(** ## Our AST & CST
    Provided for reference **)

(deftype cst
    (cst/list (list cst) int)
        (cst/array (list cst) int)
        (cst/spread cst int)
        (cst/id string int)
        (cst/string string (list (, cst string int)) int))

(deftype expr
    (eprim prim int)
        (estr string (list (, expr string int)) int)
        (evar string int)
        (equot quot int)
        (elambda (list pat) expr int)
        (eapp expr (list expr) int)
        (elet (list (, pat expr)) expr int)
        (ematch expr (list (, pat expr)) int))

(deftype quot
    (quot/expr expr)
        (quot/top top)
        (quot/type type)
        (quot/pat pat)
        (quot/quot cst))

(deftype prim
    (pint int int)
        (pbool bool int))

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

(deftype top
    (ttypealias string int (list (, string int)) type int)
        (tdeftype
        string
            int
            (list (, string int))
            (list (, string int (list type) int))
            int)
        (tdef string int expr int)
        (texpr expr int))

(** ## Parsing **)

(** ## Types **)

(defn parse-type [type]
    (match type
        (cst/id id l)                                          (tcon id l)
        (** The (fn [a b] c) form is sugar for (-> a (-> b c)) **)
        (cst/list [(cst/id "fn" _) (cst/array args _) body] l) (foldl
                                                                   (parse-type body)
                                                                       (rev args [])
                                                                       (fn [body arg] (tapp (tapp (tcon "->" l) (parse-type arg) l) body l)))
        (** We desugar (, a b c) into (, a (, b c)) **)
        (cst/list [(cst/id "," nl) ..items] al)                (loop
                                                                   (map items parse-type)
                                                                       (fn [items recur]
                                                                       (match items
                                                                           []           (fatal "Empty tuple type")
                                                                           [one]        one
                                                                           [one two]    (tapp (tapp (tcon "," nl) one al) two al)
                                                                           [one ..rest] (tapp (tapp (tcon "," nl) one al) (recur rest) al))))
        (** Function application in types is auto-curried (a b c) is ((a b) c) **)
        (cst/list items l)                                     (loop
                                                                   (rev (map items parse-type) [])
                                                                       (fn [items recur]
                                                                       (match items
                                                                           [one]        one
                                                                           [one ..rest] (tapp (recur rest) one l)
                                                                           (** A special case here for the () form, which is the unit type. **)
                                                                           []           (tcon "()" l))))
        _                                                      (fatal "(parse-type) Invalid type ${(valueToString type)}")))

(,
    parse-type
        [(, (@@ (hi ho)) (tapp (tcon "hi" 5527) (tcon "ho" 5528) 5526))
        (,
        (@@ (fn [x] y))
            (tapp (tapp (tcon "->" 5555) (tcon "x" 5558) 5555) (tcon "y" 5559) 5555))
        (,
        (@@ (fn [a b] c))
            (tapp
            (tapp (tcon "->" 5685) (tcon "a" 5688) 5685)
                (tapp (tapp (tcon "->" 5685) (tcon "b" 5689) 5685) (tcon "c" 5690) 5685)
                5685))
        (,
        (@@ (, a b))
            (tapp
            (tapp (tcon "," 16610) (tcon "a" 16611) 16609)
                (tcon "b" 16612)
                16609))
        (,
        (@@ (, a b c))
            (tapp
            (tapp (tcon "," 16640) (tcon "a" 16643) 16639)
                (tapp
                (tapp (tcon "," 16640) (tcon "b" 16644) 16639)
                    (tcon "c" 16645)
                    16639)
                16639))])

(** ## Patterns **)

(defn parse-pat [pat]
    (match pat
        (cst/id "_" l)                         (pany l)
        (cst/id "true" l)                      (pprim (pbool true l) l)
        (cst/id "false" l)                     (pprim (pbool false l) l)
        (cst/string first [] l)                (pstr first l)
        (cst/id id l)                          (match (string-to-int id)
                                                   (some int) (pprim (pint int l) l)
                                                   _          (pvar id l))
        (cst/array [] l)                       (pcon "nil" l [] l)
        (cst/array [(cst/spread inner _)] _)   (parse-pat inner)
        (cst/array [one ..rest] l)             (pcon "cons" l [(parse-pat one) (parse-pat (cst/array rest l))] l)
        (cst/list [] l)                        (pcon "()" l [] l)
        (** The pattern (, a b c) turns into (, a (, b c)) **)
        (cst/list [(cst/id "," il) ..args] l)  (loop
                                                   args
                                                       (fn [items recur]
                                                       (match items
                                                           [one]        (parse-pat one)
                                                           []           (pcon "," l [] il)
                                                           [one ..rest] (pcon "," l [(parse-pat one) (recur rest)] l))))
        (cst/list [(cst/id name il) ..rest] l) (pcon name il (map rest parse-pat) l)
        _                                      (fatal "Invalid pattern: ${(valueToString pat)}")))

(,
    parse-pat
        [(, (@@ 1) (pprim (pint 1 16818) 16818))
        (, (@@ a) (pvar "a" 16824))
        (, (@@ _) (pany 16830))
        (, (@@ (some v)) (pcon "some" 16853 [(pvar "v" 16854)] 16852))
        (, (@@ []) (pcon "nil" 16872 [] 16872))
        (,
        (@@ [1 2])
            (pcon
            "cons"
                16885
                [(pprim (pint 1 16886) 16886)
                (pcon
                "cons"
                    16885
                    [(pprim (pint 2 16887) 16887) (pcon "nil" 16885 [] 16885)]
                    16885)]
                16885))
        (,
        (@@ [1 ..b])
            (pcon
            "cons"
                17003
                [(pprim (pint 1 17004) 17004) (pvar "b" 17005)]
                17003))
        (,
        (@@ (, 1 2))
            (pcon
            ","
                16928
                [(pprim (pint 1 16930) 16930) (pprim (pint 2 16931) 16931)]
                16928))
        (,
        (@@ (, 1 2 3))
            (pcon
            ","
                16958
                [(pprim (pint 1 16960) 16960)
                (pcon
                ","
                    16958
                    [(pprim (pint 2 16961) 16961) (pprim (pint 3 16962) 16962)]
                    16958)]
                16958))])

(** ## Expressions **)

(defn parse-template [templates]
    (map templates (fn [(, expr string l)] (, (parse-expr expr) string l))))

(defn parse-expr [cst]
    (match cst
        (cst/id "true" l)                                           (eprim (pbool true l) l)
        (cst/id "false" l)                                          (eprim (pbool false l) l)
        (cst/string first templates l)                              (estr first (parse-template templates) l)
        (cst/id id l)                                               (match (string-to-int id)
                                                                        (some int) (eprim (pint int l) l)
                                                                        (none)     (evar id l))
        (cst/list [(cst/id "@" _) body] l)                          (equot (quot/expr (parse-expr body)) l)
        (cst/list [(cst/id "@@" _) body] l)                         (equot (quot/quot body) l)
        (cst/list [(cst/id "@!" _) body] l)                         (equot (quot/top (parse-top body)) l)
        (cst/list [(cst/id "@t" _) body] l)                         (equot (quot/type (parse-type body)) l)
        (cst/list [(cst/id "@p" _) body] l)                         (equot (quot/pat (parse-pat body)) l)
        (cst/list [(cst/id "if" _) cond yes no] l)                  (ematch
                                                                        (parse-expr cond)
                                                                            [(, (pprim (pbool true l) l) (parse-expr yes)) (, (pany l) (parse-expr no))]
                                                                            l)
        (cst/list [(cst/id "fn" _) (cst/array args _) body]  b)     (elambda (map args parse-pat) (parse-expr body) b)
        (cst/list [(cst/id "fn" _) .._] l)                          (fatal "Invalid 'fn' ${(int-to-string l)}")
        (cst/list [(cst/id "match" _) target ..cases] l)            (ematch
                                                                        (parse-expr target)
                                                                            (map
                                                                            (pairs cases)
                                                                                (fn [case] (let [(, pat expr) case] (, (parse-pat pat) (parse-expr expr)))))
                                                                            l)
        (cst/list [(cst/id "let" _) (cst/array inits _) body] l)    (elet
                                                                        (map
                                                                            (pairs inits)
                                                                                (fn [pair]
                                                                                (let [(, pat value) pair] (, (parse-pat pat) (parse-expr value)))))
                                                                            (parse-expr body)
                                                                            l)
        (** This is our "do-notation" let form.
            (let-> [pat init] body) turns into (>>= init (fn [pat] body)) **)
        (cst/list [(cst/id "let->" el) (cst/array inits _) body] l) (foldr
                                                                        (parse-expr body)
                                                                            (pairs inits)
                                                                            (fn [body init]
                                                                            (let [(, pat value) init]
                                                                                (eapp
                                                                                    (evar ">>=" el)
                                                                                        [(parse-expr value) (elambda [(parse-pat pat)] body l)]
                                                                                        l))))
        (cst/list [(cst/id "let" _) .._] l)                         (fatal "Invalid 'let' ${(int-to-string l)}")
        (cst/list [(cst/id "," il) ..args] l)                       (loop
                                                                        args
                                                                            (fn [args recur]
                                                                            (match args
                                                                                []           (evar "," il)
                                                                                [one]        (parse-expr one)
                                                                                [one ..rest] (eapp (evar "," il) [(parse-expr one) (recur rest)] l))))
        (cst/list [] l)                                             (evar "()" l)
        (cst/list [target ..args] l)                                (eapp (parse-expr target) (map args parse-expr) l)
        (cst/array args l)                                          (loop
                                                                        args
                                                                            (fn [args recur]
                                                                            (match args
                                                                                []                     (evar "nil" l)
                                                                                [(cst/spread inner _)] (parse-expr inner)
                                                                                [one ..rest]           (eapp (evar "cons" l) [(parse-expr one) (recur rest)] l))))
        _                                                           (fatal "Invalid expression")))

(,
    parse-expr
        [(, (@@ true) (eprim (pbool true 1163) 1163))
        (,
        (@@ (, 1 2))
            (eapp
            (evar "," 7621)
                [(eprim (pint 1 7622) 7622) (eprim (pint 2 7623) 7623)]
                7620))
        (,
        (@@ (, 1 2 3))
            (eapp
            (evar "," 7531)
                [(eprim (pint 1 7532) 7532)
                (eapp
                (evar "," 7531)
                    [(eprim (pint 2 7533) 7533) (eprim (pint 3 7534) 7534)]
                    7530)]
                7530))
        (,
        (@@
            (match 1
                (, 1 2 3) 1))
            (ematch
            (eprim (pint 1 7784) 7784)
                [(,
                (pcon
                    ","
                        7785
                        [(pprim (pint 1 7787) 7787)
                        (pcon
                        ","
                            7785
                            [(pprim (pint 2 7788) 7788) (pprim (pint 3 7790) 7790)]
                            7785)]
                        7785)
                    (eprim (pint 1 7791) 7791))]
                7782))
        (,
        (@@ [1 ..b])
            (eapp
            (evar "cons" 3401)
                [(eprim (pint 1 3402) 3402) (evar "b" 3403)]
                3401))
        (, (@@ "hi") (estr "hi" [] 1177))
        (, (@@ (@t a)) (equot (quot/type (tcon "a" 5333)) 5331))
        (,
        (@@ (@t (a b c)))
            (equot
            (quot/type
                (tapp (tapp (tcon "a" 5364) (tcon "b" 5365) 5363) (tcon "c" 5366) 5363))
                5360))
        (, (@@ (@p _)) (equot (quot/pat (pany 5349)) 5346))
        (,
        (@@
            (if (= a b)
                a
                    b))
            (ematch
            (eapp (evar "=" 4622) [(evar "a" 4623) (evar "b" 4624)] 4621)
                [(, (pprim (pbool true 4619) 4619) (evar "a" 4625))
                (, (pany 4619) (evar "b" 4626))]
                4619))
        (, (@@ "a${1}b") (estr "a" [(, (eprim (pint 1 3610) 3610) "b" 3611)] 3608))
        (,
        (@@ [1 2])
            (eapp
            (evar "cons" 3238)
                [(eprim (pint 1 3239) 3239)
                (eapp
                (evar "cons" 3238)
                    [(eprim (pint 2 3240) 3240) (evar "nil" 3238)]
                    3238)]
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
        (@@
            (let [
                a 1
                b 2]
                a))
            (elet
            [(, (pvar "a" 4456) (eprim (pint 1 4457) 4457))
                (, (pvar "b" 4458) (eprim (pint 2 4459) 4459))]
                (evar "a" 4460)
                4453))
        (,
        (@@ (let-> [v hi] v2))
            (eapp
            (evar ">>=" 6213)
                [(evar "hi" 6216) (elambda [(pvar "v" 6215)] (evar "v2" 6217) 6212)]
                6212))
        (, (@@ (fn [a] 1)) (elambda [(pvar "a" 1238)] (eprim (pint 1 1239) 1239) 1235))
        (,
        (@@ (fn [a b] 2))
            (elambda
            [(pvar "a" 1256) (pvar "b" 1257)]
                (eprim (pint 2 1258) 1258)
                1253))
        (,
        (@@ (fn [(, a b)] a))
            (elambda
            [(pcon "," 1911 [(pvar "a" 1913) (pvar "b" 1914)] 1911)]
                (evar "a" 1915)
                1908))
        (,
        (@@ (+ 1 2))
            (eapp
            (evar "+" 1519)
                [(eprim (pint 1 1520) 1520) (eprim (pint 2 1521) 1521)]
                1288))
        (,
        (@@ (int-to-string 23))
            (eapp (evar "int-to-string" 1615) [(eprim (pint 23 1616) 1616)] 1614))
        (,
        (@@ (let [x 2] x))
            (elet [(, (pvar "x" 1679) (eprim (pint 2 1680) 1680))] (evar "x" 1681) 1676))
        (,
        (@@ (let [(, a b) (, 2 3)] 1))
            (elet
            [(,
                (pcon "," 1792 [(pvar "a" 1794) (pvar "b" 1795)] 1792)
                    (eapp
                    (evar "," 1797)
                        [(eprim (pint 2 1798) 1798) (eprim (pint 3 1799) 1799)]
                        1796))]
                (eprim (pint 1 1800) 1800)
                1789))
        (, (@@ (@@ 1)) (equot (quot/quot (cst/id "1" 3110)) 3108))
        (, (@@ (@ 1)) (equot (quot/expr (eprim (pint 1 3124) 3124)) 3122))])

(** ## Statements **)

(defn parse-top [cst]
    (match cst
        (cst/list [(cst/id "def" _) (cst/id id li) value] l)                    (tdef id li (parse-expr value) l)
        (cst/list [(cst/id "defn" a) (cst/id id li) (cst/array args b) body] c) (let [
                                                                                    body (parse-expr (cst/list [(cst/id "fn" a) (cst/array args b) body] c))]
                                                                                    (tdef id li body c))
        (cst/list [(cst/id "defn" _) .._] l)                                    (fatal "Invalid 'defn' ${(int-to-string l)}")
        (cst/list [(cst/id "deftype" _) head ..items] l)                        (let [
                                                                                    (, id li args) (id-with-maybe-args head)
                                                                                    constrs        (filter-some (map items parse-type-constructor))]
                                                                                    (tdeftype id li args constrs l))
        (cst/list [(cst/id "deftype" _) .._] l)                                 (fatal "Invalid 'deftype' ${(int-to-string l)}")
        (cst/list [(cst/id "typealias" _) head body] l)                         (let [(, id li args) (id-with-maybe-args head)]
                                                                                    (ttypealias id li args (parse-type body) l))
        _                                                                       (texpr (parse-expr cst) (cst-loc cst))))

(,
    parse-top
        [(, (@@ (def a 2)) (tdef "a" 1302 (eprim (pint 2 1303) 1303) 1300))
        (,
        (@@ (typealias hello (, int string)))
            (ttypealias
            "hello"
                6271
                []
                (tapp
                (tapp (tcon "," 6273) (tcon "int" 6274) 6272)
                    (tcon "string" 6275)
                    6272)
                6269))
        (,
        (@@ (typealias (hello t) (, int t)))
            (ttypealias
            "hello"
                6337
                [(, "t" 6338)]
                (tapp (tapp (tcon "," 6340) (tcon "int" 6341) 6339) (tcon "t" 6342) 6339)
                6334))
        (,
        (@@
            (deftype what
                (one int)
                    (two bool)))
            (tdeftype
            "what"
                1335
                []
                [(, "one" 1337 [(tcon "int" 1338)] 1336)
                (, "two" 1340 [(tcon "bool" 1341)] 1339)]
                1333))
        (,
        (@@
            (deftype (array a)
                (nil)
                    (cons (array a))))
            (tdeftype
            "array"
                1486
                [(, "a" 1487)]
                [(, "nil" 1489 [] 1488)
                (, "cons" 1491 [(tapp (tcon "array" 1493) (tcon "a" 1494) 1492)] 1490)]
                1483))
        (,
        (@@ (+ 1 2))
            (texpr
            (eapp
                (evar "+" 1969)
                    [(eprim (pint 1 1970) 1970) (eprim (pint 2 1971) 1971)]
                    1968)
                1968))
        (,
        (@@ (defn a [m] m))
            (tdef "a" 2051 (elambda [(pvar "m" 2055)] (evar "m" 2053) 2049) 2049))])

(defn id-with-maybe-args [head]
    (match head
        (cst/id id li)                       (, id li [])
        (cst/list [(cst/id id li) ..args] _) (, id li (map args get-id))
        _                                    (fatal "Invalid type constructor")))

(defn get-id [x]
    (match x
        (cst/id name l) (, name l)
        _               (fatal "type argument must be identifier")))

(defn parse-type-constructor [constr]
    (match constr
        (cst/list [(cst/id name ni) ..args] l) (some (, name ni (map args parse-type) l))
        (cst/list [] l)                        none
        _                                      (fatal "Invalid type constructor")))

(defn cst-loc [cst]
    (match cst
        (cst/list _ l)     l
        (cst/id _ l)       l
        (cst/array _ l)    l
        (cst/string _ _ l) l
        (cst/spread _ l)   l))

(** ## Analysis **)

(** In order for the structured editor to be able to evaluate our toplevel terms in the correct order, we need to be able to report what names are exported from a given toplevel term, and what names are external to it, i.e. dependencies. We do this much in the same way as we did in the bootstrap (js) implementation, but there's a small twist: we don't have mutability.
    A naive way of collecting everything would be to recursively walk the tree and return a (list) of the externals, concatenating the lists from sub-nodes. This would do a ton of extra work, however, because concatenating two lists takes O(n), and you'd end up walking each sub-list many many times. **)

(** ## A collection type with O(1) concat
    To get around this issue, we use a bag type (a kind of [difference list](https://en.wikipedia.org/wiki/Difference_list)) which allows us to join the results of sub-trees in constant time, and only at the end traverse over everything (O(n)) to produce the final list. **)

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

(,
    bag/to-list
        [(, (many [empty (one 1) (many [(one 2) empty]) (one 10)]) [1 2 10])])

(** ## Collecting exports **)

(deftype name-kind
    (value)
        (type))

(typealias loced-name (, string name-kind int))

(defn names [stmt]
    (match stmt
        (tdef name l _ _)                  [(, name (value) l)]
        (texpr _ _)                        []
        (ttypealias name l _ _ _)          [(, name (type) l)]
        (tdeftype name l _ constructors _) [(, name (type) l)
                                               ..(map
                                               constructors
                                                   (fn [arg]
                                                   (match arg
                                                       (, name l _ _) (, name (value) l))))]))

(** ## Collecting dependencies **)

(defn externals [bound expr]
    (match expr
        (evar name l)          (match (set/has bound name)
                                   true empty
                                   _    (one (, name (value) l)))
        (eprim _ _)            empty
        (estr _ templates _)   (many
                                   (map
                                       templates
                                           (fn [arg]
                                           (match arg
                                               (, expr _ _) (externals bound expr)))))
        (equot _ _)            empty
        (elambda pats body _)  (bag/and
                                   (foldl empty (map pats pat-externals) bag/and)
                                       (externals (foldl bound (map pats pat-bound) set/merge) body))
        (elet bindings body _) (bag/and
                                   (foldl
                                       empty
                                           (map
                                           bindings
                                               (fn [arg]
                                               (let [(, pat init) arg]
                                                   (bag/and (pat-externals pat) (externals bound init)))))
                                           bag/and)
                                       (externals
                                       (foldl
                                           bound
                                               (map bindings (fn [arg] (let [(, pat _) arg] (pat-bound pat))))
                                               set/merge)
                                           body))
        (eapp target args _)   (bag/and
                                   (externals bound target)
                                       (foldl empty (map args (externals bound)) bag/and))
        (ematch expr cases _)  (bag/and
                                   (externals bound expr)
                                       (foldl
                                       empty
                                           cases
                                           (fn [bag arg]
                                           (match arg
                                               (, pat body) (bag/and
                                                                (bag/and bag (pat-externals pat))
                                                                    (externals (set/merge bound (pat-bound pat)) body))))))))

(defn pat-bound [pat]
    (match pat
        (pany _)          set/nil
        (pvar name _)     (set/add set/nil name)
        (pcon _ _ args _) (foldl
                              set/nil
                                  args
                                  (fn [bound arg] (set/merge bound (pat-bound arg))))
        (pstr _ _)        set/nil
        (pprim _ _)       set/nil))

(defn externals-type [bound t]
    (match t
        (tvar _ _)       empty
        (tcon name l)    (match (set/has bound name)
                             true empty
                             _    (one (, name (type) l)))
        (tapp one two _) (bag/and (externals-type bound one) (externals-type bound two))))

(defn pat-externals [pat]
    (match pat
        (** Note: It's a little weird that we're reporting this as a value dependency. Really, we should look up the type that provides this constructor, and depend on that. This does work, because deftypes produce values for each of their constructors... maybe we should have a (constr) variant of name-kind? **)
        (pcon name nl args l) (bag/and (one (, name (value) nl)) (many (map args pat-externals)))
        _                     empty))

(,
    (fn [x] (bag/to-list (externals (set/from-list ["+" "-" "cons" "nil"]) x)))
        [(, (parse-expr (@@ hi)) [(, "hi" (value) 7036)])
        (, (parse-expr (@@ [1 2 c])) [(, "c" (value) 7052)])
        (,
        (parse-expr (@@ (one two three)))
            [(, "one" (value) 7066) (, "two" (value) 7067) (, "three" (value) 7068)])])

(defn externals-top [stmt]
    (bag/to-list
        (match stmt
            (tdeftype name _ free constructors _) (let [bound (set/from-list [name ..(map free fst)])]
                                                      (many
                                                          (map
                                                              constructors
                                                                  (fn [constructor]
                                                                  (match constructor
                                                                      (, _ _ args _) (match args
                                                                                         [] empty
                                                                                         _  (many (map args (externals-type bound)))))))))
            (ttypealias name _ args body _)       (let [bound (set/from-list [name ..(map args fst)])]
                                                      (externals-type bound body))
            (tdef name _ body _)                  (externals (set/add set/nil name) body)
            (texpr expr _)                        (externals set/nil expr))))

(,
    (fn [x] (externals-top (parse-top x)))
        [(, (@@ (def x 10)) [])
        (,
        (@@
            (deftype hi
                (one int)))
            [(, "int" (type) 16460)])
        (, (@@ (typealias lol int)) [(, "int" (type) 16480)])])

(** ## Collecting declarations and usages **)

(** This is still experimental, but will probably replace both the "collecting dependencies" and "collecting exports" above. It has the added benefit of folding in local usage tracking as well. **)

(deftype reported-name
    (local int (use-or-decl int))
        (global string name-kind int (use-or-decl ())))

(deftype (use-or-decl a)
    (usage a)
        (decl))

(defn top/names [top]
    (match top
        (tdef name l body _)                  (bag/and
                                                  (one (global name (value) l (decl)))
                                                      (expr/names (map/from-list [(, name l)]) body))
        (texpr body _)                        (expr/names map/nil body)
        (ttypealias name l free body _)       (bag/and
                                                  (one (global name (type) l (decl)))
                                                      (type/names (map/from-list free) body))
        (tdeftype name l free constructors _) (foldl
                                                  (one (global name (type) l (decl)))
                                                      (map
                                                      constructors
                                                          (fn [(, name l args _)]
                                                          (foldl
                                                              (one (global name (value) l (decl)))
                                                                  (map args (type/names (map/from-list free)))
                                                                  bag/and)))
                                                      bag/and)))

(defn expr/names [bound expr]
    (match expr
        (evar name l)           (match (map/get bound name)
                                    (some dl) (one (local l (usage dl)))
                                    (none)    (one (global name (value) l (usage ()))))
        (eprim _ _)             empty
        (equot _ _)             empty
        (eapp target args _)    (foldl
                                    (expr/names bound target)
                                        (map args (expr/names bound))
                                        bag/and)
        (elambda args body _)   (let [
                                    (, bound' names) (foldl (, [] empty) (map args pat/names) bound-and-names)]
                                    (bag/and
                                        names
                                            (expr/names (map/merge bound (map/from-list bound')) body)))
        (elet bindings body _)  (loop
                                    (, bindings bound empty)
                                        (fn [(, bindings bound names) recur]
                                        (match bindings
                                            []                    (bag/and names (expr/names bound body))
                                            [(, pat expr) ..rest] (let [
                                                                      (, bound' names') (pat/names pat)
                                                                      bound             (map/merge bound (map/from-list bound'))
                                                                      names             (bag/and names names')]
                                                                      (recur (, rest bound (bag/and names (expr/names bound expr))))))))
        (ematch target cases _) (foldl
                                    (expr/names bound target)
                                        (map
                                        cases
                                            (fn [(, pat body)]
                                            (let [
                                                (, bound' names') (pat/names pat)
                                                bound             (map/merge bound (map/from-list bound'))]
                                                (bag/and names' (expr/names bound body)))))
                                        bag/and)
        (estr _ tpls _)         (many (map tpls (fn [(, expr _ _)] (expr/names bound expr))))))

(defn pat/names [pat]
    (match pat
        (pany _)              (, [] empty)
        (pvar name l)         (, [(, name l)] (one (local l (decl))))
        (pprim _ _)           (, [] empty)
        (pstr _ _)            (, [] empty)
        (pcon name nl args l) (foldl
                                  (, [] (one (global name (type) l (usage ()))))
                                      (map args pat/names)
                                      bound-and-names)))

(def bound-and-names
    (fn [(, bound names) (, bound' names')]
        (, (concat [bound bound']) (bag/and names names'))))

(defn type/names [free body]
    (match body
        (tvar name l)       (match (map/get free name)
                                (some dl) (one (local l (usage dl)))
                                _         empty)
        (tcon name l)       (one (global name (type) l (usage ())))
        (tapp target arg _) (bag/and (type/names free target) (type/names free arg))))

(,
    (fn [top] (bag/to-list (top/names top)))
        [(, (@! hi) [(global "hi" (value) 18614 (usage ()))])
        (, (@! (let [x 10] x)) [(local 18649 (decl)) (local 18650 (usage 18649))])
        (,
        (@!
            (match 10
                a (+ 2 a)))
            [(local 18673 (decl))
            (global "+" (value) 18675 (usage ()))
            (local 18678 (usage 18673))])])

(** ## Exporting for the structured editor **)

(deftype parse-and-compile
    (parse-and-compile
        (fn [cst] top)
            (fn [cst] expr)
            (fn [top] (list loced-name))
            (fn [top] (list loced-name))
            (fn [expr] (list loced-name))))

((eval
    (** ({0: parse_stmt,  1: parse_expr, 2: names, 3: externals_stmt, 4: externals_expr}) => all_names =>
  ({type: 'fns', parse_stmt, parse_expr, names, externals_stmt, externals_expr, all_names}) **))
    (parse-and-compile
        parse-top
            parse-expr
            names
            externals-top
            (fn [expr] (bag/to-list (externals set/nil expr))))
        top/names)