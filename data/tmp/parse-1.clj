(def builtins
    "const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', \n'>': '$gt', '<': '$lt', \"'\": '$qu', '\"': '$dq', ',': '$co', '@': '$at', '/': '$sl'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst $eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst $pl$pl = (items) => unwrapArray(items).join('');\nconst $pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst $co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n")

(def ast "# AST")

(deftype (array a) (nil) (cons a (array a)))

(deftype expr
    (eprim prim int)
        (estr first (array (,, expr string int)) int)
        (evar string int)
        (equot expr int)
        (equotquot cst int)
        (elambda string int expr int)
        (eapp expr expr int)
        (ematch expr (array (, pat expr)) int))

(deftype prim (pint int int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string (array pat int) int)
        (pstr string int)
        (pprim prim int))

(deftype type (tvar int int) (tapp type type int) (tcon string int))

(deftype stmt
    (sdeftype string int (array (,,, string int (array type) int)) int)
        (sdef string int expr int)
        (sexpr expr))

(def parsing "# Parsing")

(deftype cst
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/spread cst int)
        (cst/identifier string int)
        (cst/string string (array (,, cst string int)) int))

(defn tapps [items]
    (match items
        [one]        one
        [one ..rest] (tapp one (tapps rest))))

(defn parse-type [type]
    (match type
        (cst/identifier id _) (tcon id)
        (cst/list items _)    (tapps (map items parse-type))
        _                     (fatal "(parse-type) Invalid type ${(valueToString type)}")))

(parse-type
    (cst/list [(cst/identifier "hi" _) (cst/identifier "ho" _)] 1))

(foldl 0 [1 2] +)

(defn pairs [array]
    (match array
        []               []
        [one two ..rest] [(, one two) ..(pairs rest)]
        _                (fatal "Pairs given odd number ${(valueToString array)}")))

(defn parse-pat [pat]
    (match pat
        (cst/identifier "_" l)                        (pany l)
        (cst/string first [] l)                       (pstr first l)
        (cst/identifier id l)                         (match (string-to-int id)
                                                          (some int) (pprim (pint int l) l)
                                                          _          (pvar id l)
                                                          )
        (cst/array [] l)                              (pcon "nil" [] l)
        (cst/array [(cst/spread inner _)] _)          (parse-pat inner)
        (cst/array [one ..rest] l)                    (pcon "cons" [(parse-pat one) (parse-pat (cst/array rest l))])
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
                                                                                     (fn [tpl]
                                                                                     (let [(,, expr string l) tpl]
                                                                                         (,, (parse-expr expr) string l))))
                                                                                 l)
        (cst/identifier id l)                                            (match (string-to-int id)
                                                                             (some int) (eprim (pint int l) l)
                                                                             (none)     (evar id l))
        (cst/list [(cst/identifier "@" _) body] l)                       (equot (parse-expr body) l)
        (cst/list [(cst/identifier "@@" _) body] l)                      (equotquot body l)
        (cst/list [(cst/identifier "fn" _) (cst/array args _) body]  b)  (foldr
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
        (cst/list [(cst/identifier "match" _) target ..cases] l)         (ematch
                                                                             (parse-expr target)
                                                                                 (map
                                                                                 (pairs cases)
                                                                                     (fn [case]
                                                                                     (let [(, pat expr) case]
                                                                                         (, (parse-pat pat) (parse-expr expr)))))
                                                                                 l)
        (cst/list [(cst/identifier "let" _) (cst/array inits _) body] l) (foldl
                                                                             (parse-expr body)
                                                                                 (pairs inits)
                                                                                 (fn [body init]
                                                                                 (let [(, pat value) init]
                                                                                     (ematch (parse-expr value) [(, (parse-pat pat) body)] l))))
        (cst/list [target ..args] l)                                     (foldl
                                                                             (parse-expr target)
                                                                                 args
                                                                                 (fn [target arg] (eapp target (parse-expr arg) l)))
        (cst/array args l)                                               (parse-array args l)))

(defn parse-array [args l]
    (match args
        []                   (evar "nil" l)
        [(cst/spread inner)] (parse-expr inner)
        [one ..rest]         (eapp (eapp (evar "cons" l) (parse-expr one) l) (parse-array rest l) l)))

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
        (@@
            (let [x 2]
                x))
            (ematch
            (eprim (pint 2 1680) 1680)
                [(, (pvar "x" 1679) (evar "x" 1681))]
                1676))
        (,
        (@@
            (let [(, a b) (, 2 3)]
                1))
            (ematch
            (eapp
                (eapp (evar "," 1797) (eprim (pint 2 1798) 1798) 1796)
                    (eprim (pint 3 1799) 1799)
                    1796)
                [(,
                (pcon "," [(pvar "a" 1794) (pvar "b" 1795)] 1792)
                    (eprim (pint 1 1800) 1800))]
                1789))
        (, (@@ (@@ 1)) (equotquot (cst/identifier "1" 3110) 3108))
        (, (@@ (@ 1)) (equot (eprim (pint 1 3124) 3124) 3122))])



(parse-expr (@@ (fn [a] 1)))

(defn mk-deftype [id items]
    (sdeftype
        id
            (map
            items
                (fn [constr]
                (match constr
                    (cst/list [(cst/identifier name _) ..args]) (, name (map args parse-type)))))))

(defn parse-stmt [cst]
    (match cst
        (cst/list [(cst/identifier "def" _) (cst/identifier id li) value] l)                                                                                                (sdef id li (parse-expr value) l)
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
            [(cst/identifier "deftype" _) (cst/identifier id _) ..items]
                _)                                                               (mk-deftype id items)
        (cst/list
            [(cst/identifier "deftype" _)
                (cst/list [(cst/identifier id _) .._])
                ..items]
                _)              (mk-deftype id items)
        _                                                                                                                                                                   (sexpr (parse-expr cst))))

(,
    parse-stmt
        [(, (@@ (def a 2)) (sdef "a" 1302 (eprim (pint 2 1303) 1303) 1300))
        (,
        (@@ (deftype what (one int) (two bool)))
            (sdeftype "what" [(, "one" [(tcon "int")]) (, "two" [(tcon "bool")])]))
        (,
        (@@ (deftype (array a) (nil) (cons (array a))))
            (sdeftype "array" [(, "nil" []) (, "cons" [(tapp (tcon "array") (tcon "a"))])]))
        (,
        (@@ (+ 1 2))
            (sexpr
            (eapp
                (eapp (evar "+" 1969) (eprim (pint 1 1970) 1970) 1968)
                    (eprim (pint 2 1971) 1971)
                    1968)))
        (,
        (@@ (defn a [m] m))
            (sdef "a" 2051 (elambda "m" 2055 (evar "m" 2053) 2049) 2049))])

(deftype (option a) (some a) (none))

(string-to-int "11")

(def prelude "# prelude")

(defn join [sep items]
    (match items
        []           ""
        [one ..rest] (match rest
                         [] one
                         _  (++ [one sep (join sep rest)]))))

(join " " ["one" "two" "three"])

(join " " [])

(join " " ["one"])

(defn map [values f]
    (match values
        []           []
        [one ..rest] [(f one) ..(map rest f)]))

(defn mapi [i values f]
    (match values
        []           []
        [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)]))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(foldl 0 [1 2 3 4] ,)

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(foldr 5 [1 2 3 4] ,)

(defn consr [a b] (cons b a))

(foldr nil [1 2 3 4] consr)

(def compilation "# compilation")

(defn compile-stmt [stmt]
    (match stmt
        (sexpr expr)          (compile expr)
        (sdef name body)      (++ ["const " (sanitize name) " = " (compile body) ";\n"])
        (sdeftype name cases) (join
                                  "\n"
                                      (map
                                      cases
                                          (fn [case]
                                          (let [(, name2 args) case]
                                              (++
                                                  ["const "
                                                      name2
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

(def util "# util")

(defn snd [tuple]
    (let [(, _ v) tuple]
        v))

(defn fst [tuple]
    (let [(, v _) tuple]
        v))

(defn replaces [target repl]
    (match repl
        []           target
        [one ..rest] (match one
                         (, find nw) (replaces (replace-all target find nw) rest))))

(defn escape-string [string]
    (replaces
        string
            [(, "\\" "\\\\") (, "\n" "\\n") (, "\"" "\\\"") (, "`" "\\`") (, "$" "\\$")]))

(defn unescape-string [string]
    (replaces string [(, "\\\"" "\"") (, "\\n" "\n") (, "\\\\" "\\")]))

(defn quot [expr]
    (match expr
        (eprim prim) (match prim
                         (pstr string) (++ ["{type: "]))))

(defn pat-loop [target args i inner]
    (match args
        []           inner
        [arg ..rest] (compile-pat
                         arg
                             "${target}[${i}]"
                             (pat-loop target rest (+ i 1) inner))))

(defn compile-pat [pat target inner]
    (match pat
        (pany)           inner
        (pprim prim)     (match prim
                             (pint int)   "if (${target} === ${int}) {\n${inner}\n}"
                             (pbool bool) "if (${target} === ${bool}) {\n${inner}\n}")
        (pstr str)       "if (${target} === \"${str}\"){\n${inner}\n}"
        (pvar name)      "{\nlet ${(sanitize name)} = ${target};\n${inner}\n}"
        (pcon name args) "if (${
                             target
                             }.type === \"${
                             name
                             }\") {\n${
                             (pat-loop target args 0 inner)
                             }\n}"))

(defn compile [expr]
    (match expr
        (estr first tpls)     (match tpls
                                  [] "\"${(escape-string (unescape-string first))}\""
                                  _  "`${
                                         (escape-string (unescape-string first))
                                         }${
                                         (join
                                             ""
                                                 (map
                                                 tpls
                                                     (fn [item]
                                                     (let [(, expr suffix) item]
                                                         "${${(compile expr)}}${(escape-string (unescape-string suffix))}"))))
                                         }`")
        (eprim prim)          (match prim
                                  (pstr string) (++ ["\"" (escape-string (unescape-string string)) "\""])
                                  (pint int)    (int-to-string int)
                                  (pbool bool)  (match bool
                                                    true  "true"
                                                    false "false"))
        (evar name)           (sanitize name)
        (equot inner)         (jsonify inner)
        (elambda name body)   (++ ["(" (sanitize name) ") => " (compile body)])
        (elet name init body) (++ ["((" (sanitize name) ") => " (compile body) ")(" (compile init) ")"])
        (eapp fn arg)         (match fn
                                  (elambda name) (++ ["(" (compile fn) ")(" (compile arg) ")"])
                                  _              (++ [(compile fn) "(" (compile arg) ")"]))
        (ematch target cases) "(($target) => {\n${
                                  (join
                                      "\n"
                                          (map
                                          cases
                                              (fn [case]
                                              (let [(, pat body) case]
                                                  (compile-pat pat "$target" "return ${(compile body)}")))))
                                  }\nthrow new Error('failed to match ' + jsonify($target));})(${
                                  (compile target)
                                  })"))

(compile
    (parse-expr
        (@@
            (match 2
                1 2))
            ))