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
        (cst/list [(cst/identifier name _) ..rest] l) (pcon name (map rest parse-pat) l)
        _                                             (fatal "parse-pat mo match ${(valueToString pat)}")))

(parse-pat (@@ [1 2 ..a]))

(defn parse-expr [cst]
    (match cst
        (cst/identifier "true" l)                                          (eprim (pbool true l) l)
        (cst/identifier "false" l)                                         (eprim (pbool false l) l)
        (cst/string first templates l)                                     (estr
                                                                               first
                                                                                   (map
                                                                                   templates
                                                                                       (fn [tpl] (let [(,, expr string l) tpl] (,, (parse-expr expr) string l))))
                                                                                   l)
        (cst/identifier id l)                                              (match (string-to-int id)
                                                                               (some int) (eprim (pint int l) l)
                                                                               (none)     (evar id l))
        (cst/list [(cst/identifier "@" _) body] l)                         (equot (parse-expr body) l)
        (cst/list [(cst/identifier "@@" _) body] l)                        (equotquot body l)
        (cst/list [(cst/identifier "@!" _) body] l)                        (equot/stmt (parse-stmt body) l)
        (cst/list [(cst/identifier "@t" _) body] l)                        (equot/type (parse-type body) l)
        (cst/list [(cst/identifier "@p" _) body] l)                        (equot/pat (parse-pat body) l)
        (cst/list [(cst/identifier "if" _) cond yes no] l)                 (ematch
                                                                               (parse-expr cond)
                                                                                   [(, (pprim (pbool true l) l) (parse-expr yes)) (, (pany l) (parse-expr no))]
                                                                                   l)
        (cst/list [(cst/identifier "fn" _) (cst/array args _) body]  b)    (foldr
                                                                               (parse-expr body)
                                                                                   args
                                                                                   (fn [body arg]
                                                                                   (match arg
                                                                                       (cst/identifier name l) (elambda name l body b)
                                                                                       _                       (elambda
                                                                                                                   "$fn-arg"
                                                                                                                       -1
                                                                                                                       (ematch (evar "$fn-arg" -1) [(, (parse-pat arg) body)] b)
                                                                                                                       b))))
        (cst/list [(cst/identifier "fn" _) .._] l)                         (fatal "Invalid 'fn' ${(int-to-string l)}")
        (cst/list [(cst/identifier "match" _) target ..cases] l)           (ematch
                                                                               (parse-expr target)
                                                                                   (map
                                                                                   (pairs cases)
                                                                                       (fn [case] (let [(, pat expr) case] (, (parse-pat pat) (parse-expr expr)))))
                                                                                   l)
        (cst/list [(cst/identifier "let" _) (cst/array inits _) body] l)   (foldr
                                                                               (parse-expr body)
                                                                                   (pairs inits)
                                                                                   (fn [body init]
                                                                                   (let [(, pat value) init]
                                                                                       (elet (parse-pat pat) (parse-expr value) body l))))
        (cst/list [(cst/identifier "let->" _) (cst/array inits _) body] l) (foldr
                                                                               (parse-expr body)
                                                                                   (pairs inits)
                                                                                   (fn [body init]
                                                                                   (let [(, pat value) init]
                                                                                       (eapp
                                                                                           (parse-expr value)
                                                                                               (elambda
                                                                                               "$let"
                                                                                                   -1
                                                                                                   (ematch (evar "$let" -1) [(, (parse-pat pat) body)] l)
                                                                                                   l)
                                                                                               l))))
        (cst/list [(cst/identifier "let" _) .._] l)                        (fatal "Invalid 'let' ${(int-to-string l)}")
        (cst/list [target ..args] l)                                       (foldl
                                                                               (parse-expr target)
                                                                                   args
                                                                                   (fn [target arg] (eapp target (parse-expr arg) l)))
        (cst/array args l)                                                 (parse-array args l)))

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
        (, (@@ (@t a)) (equot/type (tcon "a" 5333) 5331))
        (,
        (@@ (@t (a b c)))
            (equot/type
            (tapp (tapp (tcon "a" 5364) (tcon "b" 5365) 5363) (tcon "c" 5366) 5363)
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
            (pvar "a" 4456)
                (eprim (pint 1 4457) 4457)
                (elet (pvar "b" 4458) (eprim (pint 2 4459) 4459) (evar "a" 4460) 4453)
                4453))
        (,
        (@@ (let-> [v hi] v2))
            (eapp
            (evar "hi" 6216)
                (elambda
                "$let"
                    -1
                    (ematch (evar "$let" -1) [(, (pvar "v" 6215) (evar "v2" 6217))] 6212)
                    6212)
                6212))
        (, (@@ (fn [a] 1)) (elambda "a" 1238 (eprim (pint 1 1239) 1239) 1235))
        (,
        (@@ (fn [a b] 2))
            (elambda
            "a"
                1256
                (elambda "b" 1257 (eprim (pint 2 1258) 1258) 1253)
                1253))
        (,
        (@@ (fn [(, a b)] a))
            (elambda
            "$fn-arg"
                -1
                (ematch
                (evar "$fn-arg" -1)
                    [(, (pcon "," [(pvar "a" 1913) (pvar "b" 1914)] 1911) (evar "a" 1915))]
                    1908)
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
            (elet (pvar "x" 1679) (eprim (pint 2 1680) 1680) (evar "x" 1681) 1676))
        (,
        (@@ (let [(, a b) (, 2 3)] 1))
            (elet
            (pcon "," [(pvar "a" 1794) (pvar "b" 1795)] 1792)
                (eapp
                (eapp (evar "," 1797) (eprim (pint 2 1798) 1798) 1796)
                    (eprim (pint 3 1799) 1799)
                    1796)
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
                (eapp (evar "+" 1969) (eprim (pint 1 1970) 1970) 1968)
                    (eprim (pint 2 1971) 1971)
                    1968)
                1968))
        (,
        (@@ (defn a [m] m))
            (sdef "a" 2051 (elambda "m" 2055 (evar "m" 2053) 2049) 2049))])

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
        (estr _ _ l)      l
        (eprim _ l)       l
        (evar _ l)        l
        (equotquot _ l)   l
        (equot _ l)       l
        (equot/stmt _ l)  l
        (equot/pat _ l)   l
        (equot/type _ l)  l
        (elambda _ _ _ l) l
        (elet _ _ _ l)    l
        (eapp _ _ l)      l
        (ematch _ _ l)    l))

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

(defn compile [expr trace]
    (let [loc (expr-loc expr)]
        (source-map
            loc
                (trace-wrap
                loc
                    trace
                    (match expr
                    (estr first tpls l)      (match tpls
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
                    (eprim prim l)           (match prim
                                                 (pint int _)   (int-to-string int)
                                                 (pbool bool _) (match bool
                                                                    true  "true"
                                                                    false "false"))
                    (evar name l)            (sanitize name)
                    (equot inner l)          (jsonify inner)
                    (equot/stmt inner l)     (jsonify inner)
                    (equot/type inner l)     (jsonify inner)
                    (equot/pat inner l)      (jsonify inner)
                    (equotquot inner l)      (jsonify inner)
                    (elambda name nl body l) (++
                                                 ["function name_${(its l)}("
                                                     (sanitize name)
                                                     ") { return "
                                                     (trace-and nl trace (sanitize name) (compile body trace))
                                                     " }"])
                    (elet pat init body l)   "(function let_${
                                                 (its l)
                                                 }() {const $target = ${
                                                 (compile init trace)
                                                 };\n${
                                                 (compile-pat pat "$target" "return ${(compile body trace)}" trace)
                                                 };\nthrow new Error('let pattern not matched ${
                                                 (its (pat-loc pat))
                                                 }. ' + valueToString($target));})(/*!*/)"
                    (eapp fn arg l)          (match fn
                                                 (elambda name _ _ _) "(${(compile fn trace)})(/*${(its l)}*/${(compile arg trace)})"
                                                 _                    "${(compile fn trace)}(/*${(its l)}*/${(compile arg trace)})")
                    (ematch target cases l)  "(function match_${
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

(deftype parse-and-compile
    (parse-and-compile
        (fn [cst] stmt)
            (fn [cst] expr)
            (fn [stmt (map int bool)] string)
            (fn [expr (map int bool)] string)))

(parse-and-compile parse-stmt parse-expr compile-stmt compile)

