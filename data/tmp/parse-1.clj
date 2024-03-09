1

(def parsing "# Parsing")

(deftype cst
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/identifier string int)
        (cst/string string (array (, cst string int)) int))

(defn better-match [items]
    (match items
        [one ..rest] (match rest
                         [two ..rest] )))

(defn tapps [items]
    (match items
        [one]        one
        [one ..rest] (tapp one (tapps rest))))

(defn parse-type [type]
    (match type
        (cst/identifier id _) (tcon id)
        (cst/list items _)    (tapps (map items parse-type))))

(parse-type
    (cst/list [(cst/identifier "hi" _) (cst/identifier "ho" _)] 1))

(foldl 0 [1 2] +)

(defn parse-expr [cst]
    (match cst
        (cst/identifier "true" _)                                       (eprim (pbool true))
        (cst/identifier "false" _)                                      (eprim (pbool false))
        (cst/string first templates _)                                  (estr
                                                                            first
                                                                                (map
                                                                                templates
                                                                                    (fn [tpl]
                                                                                    (let [(, expr string) tpl]
                                                                                        (, (parse-expr expr) string)))))
                                                                        
        (cst/identifier id _)                                           (match (string-to-int id)
                                                                            (some int) (eprim (pint int))
                                                                            (none)     (evar id))
        (cst/list [(cst/identifier "fn" _) (cst/array args _) body]  _) (foldr
                                                                            (parse-expr body)
                                                                                args
                                                                                (fn [body arg]
                                                                                (match arg
                                                                                    (cst/identifier name _) (elambda name body))))))

(,
    parse-expr
        [(, (@@ true) (eprim (pbool true)))
        (, (@@ "hi") (estr "hi" []))
        (, (@@ 12) (eprim (pint 12)))
        (, (@@ abc) (evar "abc"))
        (, (@@ (fn [a] 1)) (elambda "a" (eprim (pint 1))))
        (, (@@ (fn [a b] 2)) (elambda "a" (elambda "b" (eprim (pint 2)))))])

(parse-expr (@@ (fn [a] 1)))

(defn parse-stmt [cst]
    (match cst
        (cst/list [(cst/identifier "def" _) (cst/identifier id _) value])     (sdef id (parse-expr value))
        (cst/list [(cst/identifier "deftype") (cst/identifier id _) ..items]) (sdeftype
                                                                                  id
                                                                                      (map
                                                                                      items
                                                                                          (fn [constr]
                                                                                          (match constr
                                                                                              (cst/list [(cst/identifier name _) ..args]) (, name (map args parse-type))))))
        _                                                                     (parse-expr cst)))

(parse-stmt (cst/list [(cst/identifier "deftype" 1)] 0))

(deftype (option a) (some a) (none))

(string-to-int "11")

(def ast "# AST")

(deftype (array a) (nil) (cons a (array a)))

(deftype expr
    (eprim prim)
        (estr first (array (, expr string)))
        (evar string)
        (elambda string expr)
        (eapp expr expr)
        (elet string expr expr)
        (ematch expr (array (, pat expr))))

(deftype prim (pint int) (pbool bool))

(deftype pat
    (pany)
        (pvar string)
        (pcon string (array pat))
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