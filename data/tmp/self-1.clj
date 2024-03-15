(def builtins
    ; this is a comment my folks
        "const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', \n'>': '$gt', '<': '$lt', \"'\": '$qu', '\"': '$dq', ',': '$co', '@': '$at', '/': '$sl'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst $eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst $pl$pl = (items) => unwrapArray(items).join('');\nconst $pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst $co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n")

(def ast "# AST")

(deftype (array a) (nil) (cons a (array a)))

(deftype expr
    (eprim prim)
        (evar string)
        (elambda string expr)
        (eapp expr expr)
        (elet string expr expr)
        (ematch expr (array (, pat expr))))

(deftype prim (pint int) (pbool bool))

(deftype pat
    (pany)
        (pvar string)
        (pprim prim)
        (pstr string)
        (pcon string (array string)))

(deftype type (tvar int) (tapp type type) (tcon string))

(deftype stmt
    (sdeftype string (array (, string (array type))))
        (sdef string expr)
        (sexpr expr))

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

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(foldl 0 [1 2 3 4] ,)

(foldr 5 [1 2 3 4] ,)

(defn consr [a b] (cons b a))

(foldr nil [1 2 3 4] consr)

(def compilation "# compilation")

(defn literal-constr [name args]
    (++
        ["({type: \""
            name
            "\""
            (++ (mapi 0 args (fn [i arg] (++ [", " (int-to-string i) ": " arg]))))
            "})"]))

(literal-constr "cons" ["0"])

(defn compile-st [stmt]
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

(def util "# util")

(defn snd [tuple] (let [(, _ v) tuple] v))

(defn fst [tuple] (let [(, v _) tuple] v))

(defn replaces [target repl]
    (match repl
        []           target
        [one ..rest] (match one
                         (, find nw) (replaces (replace-all target find nw) rest))))

(replaces "\n" [(, "\\" "\\\\") (, "\n" "\\n")])

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

(map [] +)

(join "" [])

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

(compile-pat
    (pcon "cons" [(pprim (pint 2)) (pcon "lol" [(pprim (pint 3))])])
        "$target"
        "lol")

(compile-pat (pvar "case") "a" "lol")

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
        (ematch target cases) "(($target) => {${
                                  (join
                                      "\n"
                                          (map
                                          cases
                                              (fn [case]
                                              (let [(, pat body) case]
                                                  (compile-pat pat "$target" "return ${(compile body)}")))))
                                  }\nthrow new Error('Failed to match. ' + valueToString($target))})(${
                                  (compile target)
                                  })"))

(defn run [v] (eval (compile v)))

(,
    run
        [(, (@ 1) 1)
        (, (@ "hello") "hello")
        (, (@ "\"") "\"")
        (, (@ (+ 2 3)) 5)
        (,
        (@
            (match (pany)
                (pany)      "any"
                (pvar name) name))
            "any")
        (, (@ "a${2}b") "a2b")
        (, (@ ((fn [a] (+ a 2)) 21)) 23)
        (, (@ (let [one 1 two 2] (+ 1 2))) 3)
        (,
        (@
            (match 2
                2 1))
            1)
        (, (@ (let [a/b 2] a/b)) 2)
        (,
        (@
            (match true
                true 1
                2))
            1)
        (, (@ "`${1}") "`1")
        (, (@ "${${1}") "${1")])

(eval (compile (@ (+ 2 3))))

(@@' 1)

1