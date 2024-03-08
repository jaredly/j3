(def builtins
    ;  this is a comment my folks
        "const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', \n'>': '$gt', '<': '$lt', \"'\": '$qu', '\"': '$dq', ',': '$co', '@': '$at'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),);\nconst sanitize = (raw) => {\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst $pl$pl = (items) => unwrapArray(items).join('');\nconst $pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst $co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n")

(def ast "# AST")

(deftype (array a) (nil) (cons a (array a)))

(deftype expr
    (eprim prim)
        (evar string)
        (elambda string expr)
        (eapp expr expr)
        (elet string expr expr)
        (ematch expr (array (, pat expr))))

(deftype prim (pstr string) (pint int) (pbool bool))

(deftype pat
    (pany)
        (pvar string)
        (pcon string (array string))
        (pprim prim))

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

(foldl 0 [1 2 3 4] ,)

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

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