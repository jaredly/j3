

(** ## Prelude
    some handy functions **)

(deftype (option a) (some a) (none))

5249

(deftype (array a) (cons a (array a)) (nil))

(defn at [arr i default_]
    (match arr
        []           default_
        [one ..rest] (if (= i 0)
                         one
                             (at rest (- i 1) default_))))

(defn rev [arr col]
    (match arr
        []           col
        [one]        [one ..col]
        [one ..rest] (rev rest [one ..col])))

(defn len [arr]
    (match arr
        []           0
        [one ..rest] (+ 1 (len rest))))

(defn join [sep arr]
    (match arr
        []           ""
        [one]        one
        [one ..rest] "${one}${sep}${(join sep rest)}"))

(defn map [values f]
    (match values
        []           []
        [one ..rest] [(f one) ..(map rest f)]))

(defn mapi [i values f]
    (match values
        []           []
        [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)]))

(defn any [values f]
    (match values
        []           false
        [one ..rest] (if (f one)
                         true
                             (any rest f))))

(defn zip [one two]
    (match (, one two)
        (, [] [])               []
        (, [a ..one] [b ..two]) [(, a b) ..(zip one two)]
        _                       []))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(foldl 0 [1 2 3] (fn [a b] b))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(foldr 0 [1 2 3] (fn [a b] b))

(defn filter [f list]
    (match list
        []           []
        [one ..rest] (if (f one)
                         [one ..(filter f rest)]
                             (filter f rest))))

(defn apply-tuple [f (, a b)] (f a b))

(defn map-without [map set] (foldr map (set/to-list set) map/rm))

(deftype (either l r) (left l) (right r))

(def its int-to-string)

(** ## Js AST **)

(deftype prim
    (j/int int int)
        (j/float float int)
        (j/str string int)
        (j/bool bool int))

(deftype j/expr
    (j/app j/expr (array j/expr) int)
        (j/bin string j/expr j/expr int)
        (j/un string j/expr int)
        (j/lambda (array j/pat) (either block j/expr) int)
        (j/prim prim int)
        (j/var string int)
        (j/attr j/expr string int)
        (j/index j/expr j/expr int)
        (j/tern j/expr j/expr j/expr int)
        (j/assign string string j/expr int)
        (j/array (array (either j/expr (spread j/expr))) int)
        (j/obj (array (either (, string j/expr) (spread j/expr))) int))

(deftype (spread a) (spread a))

(typealias block (array j/stmt))

(deftype j/stmt
    (j/expr j/expr int)
        (j/block block int)
        (j/if j/expr block (option block) int)
        (j/for string j/expr j/expr j/expr block)
        (j/break int)
        (j/continue int)
        (j/return j/expr int)
        (j/let j/pat j/expr int)
        (j/throw j/expr int))

(deftype j/pat
    (j/pvar string int)
        (j/parray (array j/pat) (option j/pat) int)
        (j/pobj (array (, string j/pat)) (option j/pat) int))

(deftype cst
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/spread cst int)
        (cst/identifier string int)
        (cst/string string (array (,, cst string int)) int))

(** ## Parser **)



(** ## Compiler **)

(defn compile-stmt [ctx stmt]
    (match stmt
        (j/expr expr int)               (compile ctx expr)
        (j/block block int)             (compile-block ctx block)
        (j/if cond yes else int)        "if (${
                                            (compile ctx cond)
                                            }) ${
                                            (compile-block ctx yes)
                                            } ${
                                            (match else
                                                (none)       ""
                                                (some block) " else ${(compile-block ctx block)}")
                                            }"
        (j/for arg init cond inc block) "for (let ${
                                            arg
                                            } = ${
                                            (compile ctx init)
                                            }; ${
                                            (compile ctx cond)
                                            }; ${
                                            (compile ctx inc)
                                            }) ${
                                            (compile-block ctx block)
                                            }"
        (j/break int)                   "break"
        (j/continue int)                "continue"
        (j/return result int)           "return ${(compile ctx result)}"
        (j/let pat value int)           "let ${(pat-arg ctx pat)} = ${(compile ctx value)}"
        (j/throw value int)             "throw ${(compile ctx value)}"))

(defn compile-prim [ctx prim]
    (match prim
        (j/int int int)     (int-to-string int)
        (j/float float int) (jsonify float)
        (j/str string int)  string
        (j/bool bool int)   (if bool
                                "true"
                                    "false")))

(defn needs-parens [expr]
    (match expr
        (j/bin _ _ _ _)    true
        (j/un _ _ _)       true
        (j/lambda _ _ _)   true
        (j/prim _ _)       true
        (j/tern _ _ _ _)   true
        (j/assign _ _ _ _) true
        _                  false))

(defn maybe-paren [text wrap]
    (if wrap
        "(${text})"
            text))

(defn compile-block [ctx block]
    "{${(join ";\n" (map block (compile-stmt ctx)))}}")

(defn compile-body [ctx body]
    (match body
        (left block) (compile-block ctx block)
        (right expr) (compile ctx expr)))

(defn paren-expr [ctx target]
    (maybe-paren (compile ctx target) (needs-parens target)))

(defn pat-arg [ctx pat]
    (match pat
        (j/pvar name int)           (sanitize name)
        (j/parray items spread int) "[${
                                        (join ", " (map items (pat-arg ctx)))
                                        }${
                                        (match spread
                                            (some s) "...${(pat-arg ctx s)}"
                                            (none)   "")
                                        }]"
        (j/pobj items spread int)   "{${
                                        (join ", " (map items (fn [(, name pat)] "${name}${(pat-arg ctx pat)}")))
                                        }}${
                                        (match spread
                                            (some s) "...${(pat-arg ctx s)}"
                                            (none)   "")
                                        }"))

(defn compile [ctx expr]
    (match expr
        (j/app target args l)      "${(paren-expr ctx target)}(${(join ", " (map args (compile ctx)))})"
        (j/bin op left right l)    "${(compile ctx left)} ${op} ${(compile ctx right)}"
        (j/un op arg l)            "${op}${(compile ctx arg)}"
        (j/lambda args body l)     "(${
                                       (join ", " (map args (pat-arg ctx)))
                                       }) => ${
                                       (compile-body ctx body)
                                       }"
        (j/prim prim l)            (compile-prim ctx prim)
        (j/var name l)             (sanitize name)
        (j/attr target attr l)     "${(paren-expr ctx target)}.${(sanitize attr)}"
        (j/index target idx l)     "${(paren-expr ctx target)}[${(compile ctx idx)}]"
        (j/tern cond yes no l)     "${
                                       (paren-expr ctx cond)
                                       } ? ${
                                       (paren-expr ctx yes)
                                       } : ${
                                       (paren-expr ctx no)
                                       }"
        (j/assign name op value l) "${name} ${op} ${(compile ctx value)}"
        (j/array items l)          "[${
                                       (join
                                           ", "
                                               (map
                                               items
                                                   (fn [item]
                                                   (match item
                                                       (left expr)           (compile ctx expr)
                                                       (right (spread expr)) "...${(compile ctx expr)}"))))
                                       }]"
        (j/obj items l)            "{${
                                       (join
                                           ", "
                                               (map
                                               items
                                                   (fn [item]
                                                   (match item
                                                       (left (, name value)) "${name}: ${(compile ctx value)}"
                                                       (right (spread expr)) "...${(compile ctx expr)}"))))
                                       }}"))