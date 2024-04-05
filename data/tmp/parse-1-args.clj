(** ## parse-1-tuples + fn/lambda/app have arrays **)

(def builtins
    "const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', \n'>': '$gt', '<': '$lt', \"'\": '$qu', '\"': '$dq', ',': '$co', '@': '$at', '/': '$sl'};\n\nconst kwds = 'case var if return super break while for default';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst $eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst $pl$pl = (items) => unwrapArray(items).join('');\nconst $pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst $co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n")

(** ## Our AST & CST **)

(deftype cst
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/spread cst int)
        (cst/identifier string int)
        (cst/string string (array (,, cst string int)) int))

(deftype (array a) (nil) (cons a (array a)))

(deftype quot
    (quot/expr expr)
        (quot/stmt stmt)
        (quot/type type)
        (quot/pat pat)
        (quot/quot cst))

(deftype expr
    (eprim prim int)
        (estr string (array (,, expr string int)) int)
        (evar string int)
        (equot quot int)
        (elambda (array pat) expr int)
        (eapp expr (array expr) int)
        (elet (array (, pat expr)) expr int)
        (ematch expr (array (, pat expr)) int))

(deftype prim (pint int int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string (array pat) int)
        (pstr string int)
        (pprim prim int))

(deftype type (tvar int int) (tapp type type int) (tcon string int))

(deftype stmt
    (stypealias string int (array (, string int)) type int)
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
                         _  "${one}${sep}${(join sep rest)}")))

(join " " ["one" "two" "three"])

(join " " [])

(join " " ["one"])

(defn mapi [i values f]
    (match values
        []           []
        [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)]))

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
        (cst/identifier id l)                                          (tcon id l)
        (cst/list [] l)                                                (fatal "(parse-type) with empty list")
        (cst/list [(cst/identifier "fn" _) (cst/array args _) body] _) (foldl
                                                                           (parse-type body)
                                                                               (rev args [])
                                                                               (fn [body arg] (tapp (tapp (tcon "->" -1) (parse-type arg) -1) body -1)))
        (cst/list items l)                                             (tapps (rev (map items parse-type) []) l)
        _                                                              (fatal "(parse-type) Invalid type ${(valueToString type)}")))

(,
    parse-type
        [(, (@@ (hi ho)) (tapp (tcon "hi" 5527) (tcon "ho" 5528) 5526))
        (,
        (@@ (fn [x] y))
            (tapp (tapp (tcon "->" -1) (tcon "x" 5558) -1) (tcon "y" 5559) -1))
        (,
        (@@ (fn [a b] c))
            (tapp
            (tapp (tcon "->" -1) (tcon "a" 5688) -1)
                (tapp (tapp (tcon "->" -1) (tcon "b" 5689) -1) (tcon "c" 5690) -1)
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
        (cst/list [] l)                               (pcon "()" [] l)
        (cst/list [(cst/identifier "," il) ..args] l) (parse-pat-tuple args il l)
        (cst/list [(cst/identifier name _) ..rest] l) (pcon name (map rest parse-pat) l)
        _                                             (fatal "parse-pat mo match ${(valueToString pat)}")))

(defn parse-pat-tuple [items il l]
    (match items
        []           (pcon "," [] il)
        [one]        (parse-pat one)
        [one ..rest] (pcon "," [(parse-pat one) (parse-pat-tuple rest il l)] l)))

(parse-pat (@@ [1 2 ..a]))

(parse-pat (@@ (, 1 2)))

(parse-pat (@@ (, 1 2 3)))

(defn parse-expr [cst]
    (match cst
        (cst/identifier "true" l)                                           (eprim (pbool true l) l)
        (cst/identifier "false" l)                                          (eprim (pbool false l) l)
        (cst/string first templates l)                                      (estr
                                                                                first
                                                                                    (map
                                                                                    templates
                                                                                        (fn [tpl] (let [(,, expr string l) tpl] (,, (parse-expr expr) string l))))
                                                                                    l)
        (cst/identifier id l)                                               (match (string-to-int id)
                                                                                (some int) (eprim (pint int l) l)
                                                                                (none)     (evar id l))
        (cst/list [(cst/identifier "@" _) body] l)                          (equot (quot/expr (parse-expr body)) l)
        (cst/list [(cst/identifier "@@" _) body] l)                         (equot (quot/quot body) l)
        (cst/list [(cst/identifier "@!" _) body] l)                         (equot (quot/stmt (parse-stmt body)) l)
        (cst/list [(cst/identifier "@t" _) body] l)                         (equot (quot/type (parse-type body)) l)
        (cst/list [(cst/identifier "@p" _) body] l)                         (equot (quot/pat (parse-pat body)) l)
        (cst/list [(cst/identifier "if" _) cond yes no] l)                  (ematch
                                                                                (parse-expr cond)
                                                                                    [(, (pprim (pbool true l) l) (parse-expr yes)) (, (pany l) (parse-expr no))]
                                                                                    l)
        (cst/list [(cst/identifier "fn" _) (cst/array args _) body]  b)     (elambda (map args parse-pat) (parse-expr body) b)
        (cst/list [(cst/identifier "fn" _) .._] l)                          (fatal "Invalid 'fn' ${(int-to-string l)}")
        (cst/list [(cst/identifier "match" _) target ..cases] l)            (ematch
                                                                                (parse-expr target)
                                                                                    (map
                                                                                    (pairs cases)
                                                                                        (fn [case] (let [(, pat expr) case] (, (parse-pat pat) (parse-expr expr)))))
                                                                                    l)
        (cst/list [(cst/identifier "let" _) (cst/array inits _) body] l)    (elet
                                                                                (map
                                                                                    (pairs inits)
                                                                                        (fn [pair]
                                                                                        (let [(, pat value) pair] (, (parse-pat pat) (parse-expr value)))))
                                                                                    (parse-expr body)
                                                                                    l)
        (cst/list [(cst/identifier "let->" el) (cst/array inits _) body] l) (foldr
                                                                                (parse-expr body)
                                                                                    (pairs inits)
                                                                                    (fn [body init]
                                                                                    (let [(, pat value) init]
                                                                                        (eapp
                                                                                            (evar ">>=" el)
                                                                                                [(parse-expr value) (elambda [(parse-pat pat)] body l)]
                                                                                                l))))
        (cst/list [(cst/identifier "let" _) .._] l)                         (fatal "Invalid 'let' ${(int-to-string l)}")
        (cst/list [(cst/identifier "," il) ..args] l)                       (parse-tuple args il l)
        (cst/list [] l)                                                     (evar "()" l)
        (cst/list [target ..args] l)                                        (eapp (parse-expr target) (map args parse-expr) l)
        (cst/array args l)                                                  (parse-array args l)))

(defn parse-tuple [args il l]
    (match args
        []           (evar "," il)
        [one]        (parse-expr one)
        [one ..rest] (eapp (evar "," il) [(parse-expr one) (parse-tuple rest il l)] l)))

(defn parse-array [args l]
    (match args
        []                     (evar "nil" l)
        [(cst/spread inner _)] (parse-expr inner)
        [one ..rest]           (eapp (evar "cons" l) [(parse-expr one) (parse-array rest l)] l)))

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
                        [(pprim (pint 1 7787) 7787)
                        (pcon "," [(pprim (pint 2 7788) 7788) (pprim (pint 3 7790) 7790)] 7785)]
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
        (, (@@ "a${1}b") (estr "a" [(,, (eprim (pint 1 3610) 3610) "b" 3611)] 3608))
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
        (@@ (let [a 1 b 2] a))
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
            [(pcon "," [(pvar "a" 1913) (pvar "b" 1914)] 1911)]
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
                (pcon "," [(pvar "a" 1794) (pvar "b" 1795)] 1792)
                    (eapp
                    (evar "," 1797)
                        [(eprim (pint 2 1798) 1798) (eprim (pint 3 1799) 1799)]
                        1796))]
                (eprim (pint 1 1800) 1800)
                1789))
        (, (@@ (@@ 1)) (equot (quot/quot (cst/identifier "1" 3110)) 3108))
        (, (@@ (@ 1)) (equot (quot/expr (eprim (pint 1 3124) 3124)) 3122))])

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
            (foldr
            []
                items
                (fn [res constr]
                (match constr
                    (cst/list [(cst/identifier name ni) ..args] l) [(,,, name ni (map args parse-type) l) ..res]
                    (cst/list [] l)                                res
                    _                                              (fatal "Invalid type constructor"))))
            l))

(defn parse-stmt [cst]
    (match cst
        (cst/list [(cst/identifier "def" _) (cst/identifier id li) value] l)       (sdef id li (parse-expr value) l)
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
        (cst/list [(cst/identifier "defn" _) .._] l)                               (fatal "Invalid 'defn' ${(int-to-string l)}")
        (cst/list
            [(cst/identifier "deftype" _) (cst/identifier id li) ..items]
                l) (mk-deftype id li [] items l)
        (cst/list
            [(cst/identifier "deftype" _)
                (cst/list [(cst/identifier id li) ..args] _)
                ..items]
                l) (mk-deftype id li args items l)
        (cst/list
            [(cst/identifier "typealias" _) (cst/identifier name nl) body]
                l) (stypealias name nl [] (parse-type body) l)
        (cst/list
            [(cst/identifier "typealias" _)
                (cst/list [(cst/identifier name nl) ..args] _)
                body]
                l) (let [
                                                                                       args (map
                                                                                                args
                                                                                                    (fn [x]
                                                                                                    (match x
                                                                                                        (cst/identifier name l) (, name l)
                                                                                                        _                       (fatal "typealias type argument must be identifier"))))]
                                                                                       (stypealias name nl args (parse-type body) l))
        (cst/list [(cst/identifier "deftype" _) .._] l)                            (fatal "Invalid 'deftype' ${(int-to-string l)}")
        _                                                                          (sexpr
                                                                                       (parse-expr cst)
                                                                                           (match cst
                                                                                           (cst/list _ l)       l
                                                                                           (cst/identifier _ l) l
                                                                                           (cst/array _ l)      l
                                                                                           (cst/string _ _ l)   l
                                                                                           (cst/spread _ l)     l))))

(parse-expr (@@ (fn [a] 1)))

(parse-expr (@@ (@! 12)))

(,
    parse-stmt
        [(, (@@ (def a 2)) (sdef "a" 1302 (eprim (pint 2 1303) 1303) 1300))
        (,
        (@@ (typealias hello (, int string)))
            (stypealias
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
            (stypealias
            "hello"
                6337
                [(, "t" 6338)]
                (tapp (tapp (tcon "," 6340) (tcon "int" 6341) 6339) (tcon "t" 6342) 6339)
                6334))
        (,
        (@@ (deftype what (one int) (two bool)))
            (sdeftype
            "what"
                1335
                []
                [(,,, "one" 1337 [(tcon "int" 1338)] 1336)
                (,,, "two" 1340 [(tcon "bool" 1341)] 1339)]
                1333))
        (,
        (@@ (deftype (array a) (nil) (cons (array a))))
            (sdeftype
            "array"
                1486
                [(, "a" 1487)]
                [(,,, "nil" 1489 [] 1488)
                (,,, "cons" 1491 [(tapp (tcon "array" 1493) (tcon "a" 1494) 1492)] 1490)]
                1483))
        (,
        (@@ (+ 1 2))
            (sexpr
            (eapp
                (evar "+" 1969)
                    [(eprim (pint 1 1970) 1970) (eprim (pint 2 1971) 1971)]
                    1968)
                1968))
        (,
        (@@ (defn a [m] m))
            (sdef "a" 2051 (elambda [(pvar "m" 2055)] (evar "m" 2053) 2049) 2049))])

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
        (estr _ _ l)    l
        (eprim _ l)     l
        (evar _ l)      l
        (equot _ l)     l
        (elambda _ _ l) l
        (elet _ _ l)    l
        (eapp _ _ l)    l
        (ematch _ _ l)  l))

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

(defn just-trace [loc trace value]
    (match (map/get trace loc)
        (none)      ""
        (some info) "$trace(${(its loc)}, ${(jsonify info)}, ${value});"))

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

(defn quot/jsonify [quot]
    (match quot
        (quot/expr expr) (jsonify expr)
        (quot/type type) (jsonify type)
        (quot/stmt stmt) (jsonify stmt)
        (quot/quot cst)  (jsonify cst)
        (quot/pat pat)   (jsonify pat)))

(defn compile [expr trace]
    (let [loc (expr-loc expr)]
        (source-map
            loc
                (trace-wrap
                loc
                    trace
                    (match expr
                    (estr first tpls l)     (match tpls
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
                    (eprim prim l)          (match prim
                                                (pint int _)   (int-to-string int)
                                                (pbool bool _) (match bool
                                                                   true  "true"
                                                                   false "false"))
                    (evar name l)           (sanitize name)
                    (equot inner l)         (quot/jsonify inner)
                    (elambda pats body l)   (foldr
                                                (compile body trace)
                                                    pats
                                                    (fn [body pat]
                                                    "function name_${
                                                        (its l)
                                                        }(${
                                                        (orr "_" (just-pat pat))
                                                        }) {${
                                                        (match (bag/to-list (pat-names-loc pat))
                                                            []    ""
                                                            names (join
                                                                      "\n"
                                                                          (map names (fn [(, name l)] (just-trace l trace (sanitize name))))))
                                                        } return ${
                                                        body
                                                        } }"))
                    (elet bindings body l)  (foldr
                                                (compile body trace)
                                                    bindings
                                                    (fn [body binding] (compile-let-binding binding body trace l)))
                    (eapp target args l)    "${
                                                (foldl
                                                    "${
                                                        (match target
                                                            (elambda _ _ _) "(${(compile target trace)})"
                                                            _               (compile target trace))
                                                        }/*${
                                                        (its l)
                                                        }*/"
                                                        args
                                                        (fn [target arg] "${target}(${(compile arg trace)})"))
                                                }"
                    ;(match fn
                        (elambda _ _ _) "(${(compile fn trace)})(/*${(its l)}*/${(compile arg trace)})"
                        _               "${(compile fn trace)}(/*${(its l)}*/${(compile arg trace)})")
                    (ematch target cases l) "(function match_${
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
                                                }');})(/*!*/${
                                                (compile target trace)
                                                })")))))

(compile
    (parse-expr
        (@@
            (match 2
                1 2))
            )
        map/nil)

(compile (parse-expr (@@ (let [a 1 b 2] (+ a b)))) map/nil)

(defn run [v] (eval (compile (parse-expr v) map/nil)))

(,
    run
        [(, (@@ 1) 1)
        (, (@@ "hello") "hello")
        (, (@@ "\"") "\"")
        (, (@@ "\n") "\n")
        (, (@@ "\\n") "\\n")
        (, (@@ "\\\n") "\\\n")
        (, (@@ (+ 2 3)) 5)
        (, (@@ "a${2}b") "a2b")
        (, (@@ ((fn [a] (+ a 2)) 21)) 23)
        (, (@@ (let [one 1 two 2] (+ 1 2))) 3)
        (,
        (@@
            (match 2
                2 1))
            1)
        (, (@@ (let [a/b 2] a/b)) 2)
        (,
        (@@
            (match true
                true 1
                2    3))
            1)
        (, (@@  "`${1}") "`1")
        (, (@@ "${${1}") "${1")
        (,
        (@@
            (match [1]
                []      []
                [a ..b] a))
            1)])

(defn compile-let-binding [binding body trace l]
    (let [(, pat init) binding]
        "(function let_${
            (its l)
            }() {const $target = ${
            (compile init trace)
            };\n${
            (compile-pat pat "$target" "return ${body}" trace)
            };\nthrow new Error('let pattern not matched ${
            (its (pat-loc pat))
            }. ' + valueToString($target));})(/*!*/)"))

(defn compile-stmt [stmt trace]
    (match stmt
        (sexpr expr l)                      (compile expr trace)
        (sdef name nl body l)               (++ ["const " (sanitize name) " = " (compile body trace) ";\n"])
        (stypealias name _ _ _ _)           "/* type alias ${name} */"
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

(** ## Dependency analysis **)

(deftype name-kind (value) (type))

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

(defn bag/to-list [bag] (bag/fold (fn [list one] [one ..list]) [] bag))

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

(defn pat-names-loc [pat]
    (match pat
        (pany _)           empty
        (pvar name l)      (one (, name l))
        (pcon name args l) (foldl
                               empty
                                   args
                                   (fn [bound arg] (bag/and bound (pat-names-loc arg))))
        (pstr string int)  empty
        (pprim prim int)   empty))

(defn pat-externals [pat]
    (match pat
        (** Soo this should be probably a (type)? Or rather, we should look up the corresponding type, and depend on that instead. **)
        (pcon name args l) (bag/and (one (,, name (value) l)) (many (map args pat-externals)))
        _                  empty))

(defn externals [bound expr]
    (match expr
        (evar name l)              (match (set/has bound name)
                                       true empty
                                       _    (one (,, name (value) l)))
        (eprim prim l)             empty
        (estr first templates int) (many
                                       (map
                                           templates
                                               (fn [arg]
                                               (match arg
                                                   (,, expr _ _) (externals bound expr)))))
        (equot expr int)           empty
        (elambda pats body int)    (bag/and
                                       (foldl empty (map pats pat-externals) bag/and)
                                           (externals (foldl bound (map pats pat-names) set/merge) body))
        (elet bindings body l)     (bag/and
                                       (foldl
                                           empty
                                               (map
                                               bindings
                                                   (fn [(, pat init)] (bag/and (pat-externals pat) (externals bound init))))
                                               bag/and)
                                           (externals
                                           (foldl bound (map bindings (fn [(, pat _)] (pat-names pat))) set/merge)
                                               body))
        (eapp target args int)     (bag/and
                                       (externals bound target)
                                           (foldl empty (map args (externals bound)) bag/and))
        (ematch expr cases int)    (bag/and
                                       (externals bound expr)
                                           (foldl
                                           empty
                                               cases
                                               (fn [bag arg]
                                               (match arg
                                                   (, pat body) (bag/and
                                                                    (bag/and bag (pat-externals pat))
                                                                        (externals (set/merge bound (pat-names pat)) body))))))))

(defn dot [a b c] (a (b c)))

(,
    (dot bag/to-list (externals (set/from-list ["+" "-" "cons" "nil"])))
        [(, (parse-expr (@@ hi)) [(,, "hi" (value) 7036)])
        (, (parse-expr (@@ [1 2 c])) [(,, "c" (value) 7052)])
        (,
        (parse-expr (@@ (one two three)))
            [(,, "one" (value) 7066) (,, "two" (value) 7067) (,, "three" (value) 7068)])])

(defn externals-type [bound t]
    (match t
        (tvar _ _)       empty
        (tcon name l)    (match (set/has bound name)
                             true empty
                             _    (one (,, name (type) l)))
        (tapp one two _) (bag/and (externals-type bound one) (externals-type bound two))))

(defn names [stmt]
    (match stmt
        (sdef name l _ _)                  [(,, name (value) l)]
        (sexpr _ _)                        []
        (stypealias name l _ _ _)          [(,, name (type) l)]
        (sdeftype name l _ constructors _) [(,, name (type) l)
                                               ..(map
                                               constructors
                                                   (fn [arg]
                                                   (match arg
                                                       (,,, name l _ _) (,, name (value) l))))]))

(defn externals-stmt [stmt]
    (bag/to-list
        (match stmt
            (sdeftype string int free constructors int) (let [frees (set/from-list (map free fst))]
                                                            (many
                                                                (map
                                                                    constructors
                                                                        (fn [constructor]
                                                                        (match constructor
                                                                            (,,, name l args _) (match args
                                                                                                    [] empty
                                                                                                    _  (many (map args (externals-type frees)))))))))
            (stypealias name _ args body _)             (let [frees (set/from-list (map args fst))]
                                                            (externals-type frees body))
            (sdef name int body int)                    (externals (set/add set/nil name) body)
            (sexpr expr int)                            (externals set/nil expr))))

(deftype parse-and-compile
    (parse-and-compile
        (fn [cst] stmt)
            (fn [cst] expr)
            (fn [stmt (map int bool)] string)
            (fn [expr (map int bool)] string)
            (fn [stmt] (array (,, string name-kind int)))
            (fn [stmt] (array (,, string name-kind int)))
            (fn [expr] (array (,, string name-kind int)))))

((eval
    "({0: parse_stmt,  1: parse_expr, 2: compile_stmt, 3: compile, 4: names, 5: externals_stmt, 6: externals_expr}) => ({\ntype: 'fns', parse_stmt, parse_expr, compile_stmt, compile, names, externals_stmt, externals_expr})")
    (parse-and-compile
        parse-stmt
            parse-expr
            compile-stmt
            compile
            names
            externals-stmt
            (fn [expr] (bag/to-list (externals set/nil expr)))))