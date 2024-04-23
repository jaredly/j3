(** ## parse-1-tuples + fn/lambda/app have arrays **)

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

(defn zip [one two]
    (match (, one two)
        (, [] [])               []
        (, [o ..one] [t ..two]) [(, o t) ..(zip one two)]))

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

(deftype (option a) (some a) (none))

(defn snd [tuple] (let [(, _ v) tuple] v))

(defn fst [tuple] (let [(, v _) tuple] v))

(defn replaces [target repl]
    (match repl
        []           target
        [one ..rest] (match one
                         (, find nw) (replaces (replace-all target find nw) rest))))

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
        (pcon string int (array pat) int)
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

(** ## Transform Javascript AST **)

(deftype (fx c)
    (fx (fn [c j/expr] c) (fn [c j/pat] c) (fn [c j/block] c) (fn [c j/stmt] c)))

(defn fold/option [inner init value]
    (match value
        (none)   init
        (some v) (inner init v)))

(defn fold/either [fleft fright init value]
    (match value
        (left l)  (fleft init l)
        (right r) (fright init r)))

(defn fold/pat [fx init pat]
    (let [(fx _ p _ _) fx]
        (p
            (match pat
                (j/pvar _ _)              init
                (j/pobj items spread _)   (foldl
                                              (fold/option (fold/pat fx) init spread)
                                                  items
                                                  (fn [init (, _ pat)] (fold/pat fx init pat)))
                (j/parray items spread _) (foldl (fold/option (fold/pat fx) init spread) items (fold/pat fx)))
                pat)))

(defn fold/stmt [fx init stmt]
    (let [(fx e p b s) fx]
        (s
            (match stmt
                (j/sexpr expr _)              (fold/expr fx init expr)
                (j/sblock block _)            (fold/block fx init block)
                (j/if cond yes no _)          (fold/option
                                                  (fold/block fx)
                                                      (fold/block fx (fold/expr fx init cond) yes)
                                                      no)
                (j/for _ iit cond inc body _) (fold/block
                                                  fx
                                                      (fold/expr fx (fold/expr fx (fold/expr fx init iit) cond) inc)
                                                      body)
                (j/return value _)            (fold/expr fx init value)
                (j/throw value _)             (fold/expr fx init value)
                (j/let pat value _)           (fold/expr fx (fold/pat fx init pat) value)
                _                             init)
                stmt)))

(defn fold/block [fx init block]
    (let [(fx _ _ b _) fx (j/block items) block]
        (b (foldl init items (fold/stmt fx)) block)))

(defn fold/expr [fx init expr]
    (let [(fx e _ _ _) fx]
        (e
            (match expr
                (j/app target args _)  (foldl (fold/expr fx init target) args (fold/expr fx))
                (j/bin _ left right _) (fold/expr fx (fold/expr fx init left) right)
                (j/un _ arg _)         (fold/expr fx init arg)
                (j/lambda pats body _) (foldl
                                           (fold/either (fold/block fx) (fold/expr fx) init body)
                                               pats
                                               (fold/pat fx))
                (j/str _ tpls _)       (foldl init tpls (fold/get ,,0 (fold/expr fx)))
                (j/attr target _ _)    (fold/expr fx init target)
                (j/index target idx _) (fold/expr fx (fold/expr fx init target ) idx)
                (j/tern cond yes no _) (fold/expr fx (fold/expr fx (fold/expr fx init cond) yes) no)
                (j/assign _ _ value _) (fold/expr fx init value)
                (j/array items _)      (foldl
                                           init
                                               items
                                               (fold/either (fold/expr fx) (fold/get spread/inner (fold/expr fx))))
                (j/obj items _)        (foldl
                                           init
                                               items
                                               (fold/either
                                               (fold/get snd (fold/expr fx))
                                                   (fold/get spread/inner (fold/expr fx)))))
                expr)))

(defn fold/get [get f init value] (f init (get value)))

(defn spread/inner [(j/spread inner)] inner)

(deftype tx
    (tx
        (fn [j/expr] (option j/expr))
            (fn [j/expr] j/expr)
            (fn [j/pat] (option j/pat))
            (fn [j/pat] j/pat)
            (fn [j/stmt] (option j/stmt))
            (fn [j/stmt] j/stmt)
            (fn [j/block] (option j/block))
            (fn [j/block] j/block)))

(defn map/stmt [tx stmt]
    (let [
        loop                          (map/stmt tx)
        loope                         (map/expr tx)
        (tx _ _ _ _ pre-s post-s _ _) tx]
        (match (pre-s stmt)
            (none)      stmt
            (some stmt) (post-s
                            (match stmt
                                (j/sexpr expr l)                    (j/sexpr (loope expr) l)
                                (j/sblock block l)                  (j/sblock (map/block tx block) l)
                                (j/if cond yes no l)                (j/if
                                                                        (loope cond)
                                                                            (map/block tx yes)
                                                                            (match no
                                                                            (none)   (none)
                                                                            (some v) (some (map/block tx v)))
                                                                            l)
                                (j/for string init cond inc body l) (j/for
                                                                        string
                                                                            (loope init)
                                                                            (loope cond)
                                                                            (loope inc)
                                                                            (map/block tx body)
                                                                            l)
                                (j/break l)                         stmt
                                (j/continue l)                      stmt
                                (j/return value l)                  (j/return (loope value) l)
                                (j/let pat value l)                 (j/let (map/pat tx pat) (loope value) l)
                                (j/throw value l)                   (j/throw (loope value) l))))))

(defn map/block [tx block]
    (let [(tx _ _ _ _ _ _ pre-b post-b) tx]
        (match (pre-b block)
            (none)                 block
            (some (j/block stmts)) (post-b (j/block (map stmts (map/stmt tx)))))))

(defn map-opt [v f]
    (match v
        (none)   (none)
        (some v) (some (f v))))

(defn map/pat [tx pat]
    (let [loop (map/pat tx) (tx _ _ pre-p post-p _ _ _ _) tx]
        (match (pre-p pat)
            (none)     pat
            (some pat) (post-p
                           (match pat
                               (j/pvar _ _)              pat
                               (j/parray items spread l) (j/parray (map items loop) (map-opt spread loop) l)
                               (j/pobj items spread l)   (j/pobj
                                                             (map items (fn [(, name pat)] (, name (loop pat))))
                                                                 (map-opt spread loop)
                                                                 l))))))

(defn map/expr [tx expr]
    (let [loop (map/expr tx) (tx pre-e post-e _ _ _ _ _ _) tx]
        (match (pre-e expr)
            (none)      expr
            (some expr) (post-e
                            (match expr
                                (j/app target args l)      (j/app (loop target) (map args loop) l)
                                (j/bin op left right l)    (j/bin op (loop left) (loop right) l)
                                (j/un op arg l)            (j/un op (loop arg) l)
                                (j/lambda pats body l)     (j/lambda
                                                               (map pats (map/pat tx))
                                                                   (match body
                                                                   (left block) (left (map/block tx block))
                                                                   (right expr) (right (loop expr)))
                                                                   l)
                                (j/prim item l)            (j/prim item l)
                                (j/str string tpls l)      (j/str
                                                               string
                                                                   (map tpls (fn [(,, expr suffix l)] (,, (loop expr) suffix l)))
                                                                   l)
                                (j/raw string l)           (j/raw string l)
                                (j/var string l)           (j/var string l)
                                (j/attr target string l)   (j/attr (loop target) string l)
                                (j/index target idx l)     (j/index (loop target) (loop idx) l)
                                (j/tern cond yes no l)     (j/tern (loop cond) (loop yes) (loop no) l)
                                (j/assign name op value l) (j/assign name op (loop value) l)
                                (j/array items l)          (j/array
                                                               (map
                                                                   items
                                                                       (fn [item]
                                                                       (match item
                                                                           (left a)             (left (loop a))
                                                                           (right (j/spread a)) (right (j/spread (loop a))))))
                                                                   l)
                                (j/obj items l)            (j/obj
                                                               (map
                                                                   items
                                                                       (fn [item]
                                                                       (match item
                                                                           (left (, name value))    (left (, name (loop value)))
                                                                           (right (j/spread value)) (right (j/spread (loop value))))))
                                                                   l))))))

(** ## Simplify JS **)

(defn simplify-one [expr]
    (match expr
        (j/app (j/lambda [] (right inner) l) [] l)                    (some inner)
        (j/lambda args (left (j/block [(j/return value _)])) l)       (some (j/lambda args (right value) l))
        (j/lambda args (right (j/app (j/lambda [] body ll) [] al)) l) (some (j/lambda args body l))
        _                                                             none))

(defn make-lets [params args l]
    (match (, params args)
        (, [] [])                       []
        (, [one ..params] [two ..args]) [(j/let one two l) ..(make-lets params args l)]))

(defn call-at-end [items]
    (match items
        []                                                       none
        [(j/return (j/app (j/lambda params body ll) args al) l)] (if (= (len params) (len args))
                                                                     (some
                                                                         [(j/sblock
                                                                             (j/block
                                                                                 (concat
                                                                                     [(make-lets params args ll)
                                                                                         (match body
                                                                                         (left (j/block items)) items
                                                                                         (right expr)           [(j/return expr l)])]))
                                                                                 l)])
                                                                         none)
        [one ..rest]                                             (match (call-at-end rest)
                                                                     (some v) (some [one ..v])
                                                                     none     none)))

(defn len [x]
    (match x
        []           0
        [one ..rest] (+ 1 (len rest))))

(defn simplify-block [(j/block items)]
    (match items
        ;[(j/sblock (j/block items) l) ..rest]
        ;(some (j/block (concat [items rest])))
        _ (match (call-at-end items)
              (none)       none
              (some items) (some (j/block items)))))

(defn apply-until [f v]
    (match (f v)
        (some v) (apply-until f v)
        (none)   v))

(defn simplify-stmt [stmt]
    (match stmt
        (j/sblock (j/block [one]) l) (match one
                                         (j/let _ _ _) none
                                         _             (some one))
        _                            none))

(def simplify-js
    (tx
        (fn [expr] (some expr))
            (apply-until simplify-one)
            (fn [pat] (none))
            (fn [pat] pat)
            (fn [stmt] (some stmt))
            (apply-until simplify-stmt)
            (fn [block] (some block))
            (apply-until simplify-block)))

(** ## Js AST **)

(deftype (either a b) (left a) (right b))

(deftype j/prim
    (j/int int int)
        (j/float float int)
        (j/bool bool int))

(deftype j/expr
    (j/app j/expr (array j/expr) int)
        (j/bin string j/expr j/expr int)
        (j/un string j/expr int)
        (j/lambda (array j/pat) (either j/block j/expr) int)
        (j/prim j/prim int)
        (j/str string (array (,, j/expr string int)) int)
        (j/raw string int)
        (j/var string int)
        (j/attr j/expr string int)
        (j/index j/expr j/expr int)
        (j/tern j/expr j/expr j/expr int)
        (j/assign string string j/expr int)
        (j/array (array (either j/expr (j/spread j/expr))) int)
        (j/obj (array (either (, string j/expr) (j/spread j/expr))) int))

(deftype (j/spread a) (j/spread a))

(deftype j/block (j/block (array j/stmt)))

(deftype j/stmt
    (j/sexpr j/expr int)
        (j/sblock j/block int)
        (j/if j/expr j/block (option j/block) int)
        (j/for string j/expr j/expr j/expr j/block int)
        (j/break int)
        (j/continue int)
        (j/return j/expr int)
        (j/let j/pat j/expr int)
        (j/throw j/expr int))

(deftype j/pat
    (j/pvar string int)
        (j/parray (array j/pat) (option j/pat) int)
        (j/pobj (array (, string j/pat)) (option j/pat) int))

(** ## Js Compiler **)

(defn j/compile-stmts [ctx stmts]
    (join "\n" (map stmts (j/compile-stmt ctx))))

(defn j/compile-stmt [ctx stmt]
    (match stmt
        (j/sexpr expr l)                  (j/compile ctx expr)
        (j/sblock block l)                (j/compile-block ctx block)
        (j/if cond yes else l)            "if (${(j/compile ctx cond)}) ${(j/compile-block ctx yes)} ${(match else
                                              (none)       ""
                                              (some block) " else ${(j/compile-block ctx block)}")}"
        (j/for arg init cond inc block l) "for (let ${arg} = ${(j/compile ctx init)}; ${(j/compile ctx cond)}; ${(j/compile ctx inc)}) ${(j/compile-block ctx block)}"
        (j/break l)                       "break"
        (j/continue l)                    "continue"
        (j/return result l)               "return ${(j/compile ctx result)}"
        (j/let pat value l)               "let ${(pat-arg ctx pat)} = ${(j/compile ctx value)}"
        (j/throw value l)                 "throw ${(j/compile ctx value)}"))

(defn j/compile-prim [ctx prim]
    (match prim
        (j/int int l)     (int-to-string int)
        (j/float float l) (jsonify float)
        (j/bool bool l)   (if bool
                              "true"
                                  "false")))

(defn j/needs-parens [expr]
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

(defn j/compile-block [ctx (j/block block)]
    "{\n${(join ";\n" (map block (j/compile-stmt ctx)))}\n}")

(defn j/compile-body [ctx body]
    (match body
        (left block) (j/compile-block ctx block)
        (right expr) (maybe-paren
                         (j/compile ctx expr)
                             (match expr
                             (j/obj _ _) true
                             _           false))))

(defn j/paren-expr [ctx target]
    (maybe-paren (j/compile ctx target) (j/needs-parens target)))

(defn pat-arg [ctx pat]
    (match pat
        (j/pvar name l)           (sanitize name)
        (j/parray items spread l) "[${(join ", " (map items (pat-arg ctx)))}${(match spread
                                      (some s) "...${(pat-arg ctx s)}"
                                      (none)   "")}]"
        (j/pobj items spread l)   "{${(join
                                      ", "
                                          (map
                                          items
                                              (fn [pair]
                                              "\"${(escape-string (fst pair))}\": ${(pat-arg ctx (snd pair))}")))}}${(match spread
                                      (some s) "...${(pat-arg ctx s)}"
                                      (none)   "")}"))

(defn j/compile [ctx expr]
    (match expr
        (j/app target args l)      "${(j/paren-expr ctx target)}(${(join ", " (map args (j/compile ctx)))})"
        (j/bin op left right l)    "${(j/compile ctx left)} ${op} ${(j/compile ctx right)}"
        (j/un op arg l)            "${op}${(j/compile ctx arg)}"
        (j/raw raw l)              raw
        (j/lambda args body l)     "(${(join ", " (map args (pat-arg ctx)))}) => ${(j/compile-body ctx body)}"
        (j/prim prim l)            (j/compile-prim ctx prim)
        (j/str first tpls l)       (match tpls
                                       [] "\"${(escape-string (unescapeString first))}\""
                                       _  "`${(escape-string (unescapeString first))}${(join
                                              ""
                                                  (map
                                                  tpls
                                                      (fn [item]
                                                      (let [(,, expr suffix l) item]
                                                          "${${(j/compile ctx expr)}}${(escape-string (unescapeString suffix))}"))))}`")
        (j/var name l)             (sanitize name)
        (j/attr target attr l)     "${(j/paren-expr ctx target)}.${(sanitize attr)}"
        (j/index target idx l)     "${(j/paren-expr ctx target)}[${(j/compile ctx idx)}]"
        (j/tern cond yes no l)     "${(j/paren-expr ctx cond)} ? ${(j/paren-expr ctx yes)} : ${(j/paren-expr ctx no)}"
        (j/assign name op value l) "${name} ${op} ${(j/compile ctx value)}"
        (j/array items l)          "[${(join
                                       ", "
                                           (map
                                           items
                                               (fn [item]
                                               (match item
                                                   (left expr)             (j/compile ctx expr)
                                                   (right (j/spread expr)) "...${(j/compile ctx expr)}"))))}]"
        (j/obj items l)            "{${(join
                                       ", "
                                           (map
                                           items
                                               (fn [item]
                                               (match item
                                                   (left (, name value))   "${name}: ${(j/compile ctx value)}"
                                                   (right (j/spread expr)) "...${(j/compile ctx expr)}"))))}}"))

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
        (cst/identifier "_" l)                         (pany l)
        (cst/identifier "true" l)                      (pprim (pbool true l) l)
        (cst/identifier "false" l)                     (pprim (pbool false l) l)
        (cst/string first [] l)                        (pstr first l)
        (cst/identifier id l)                          (match (string-to-int id)
                                                           (some int) (pprim (pint int l) l)
                                                           _          (pvar id l)
                                                           )
        (cst/array [] l)                               (pcon "nil" -1 [] l)
        (cst/array [(cst/spread inner _)] _)           (parse-pat inner)
        (cst/array [one ..rest] l)                     (pcon "cons" -1 [(parse-pat one) (parse-pat (cst/array rest l))] l)
        (cst/list [] l)                                (pcon "()" -1 [] l)
        (cst/list [(cst/identifier "," il) ..args] l)  (parse-pat-tuple args il l)
        (cst/list [(cst/identifier name il) ..rest] l) (pcon name il (map rest parse-pat) l)
        _                                              (fatal "parse-pat mo match ${(valueToString pat)}")))

(defn parse-pat-tuple [items il l]
    (match items
        []           (pcon "," -1 [] il)
        [one]        (parse-pat one)
        [one ..rest] (pcon "," -1 [(parse-pat one) (parse-pat-tuple rest il l)] l)))

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
                        -1
                        [(pprim (pint 1 7787) 7787)
                        (pcon
                        ","
                            -1
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
            [(pcon "," -1 [(pvar "a" 1913) (pvar "b" 1914)] 1911)]
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
                (pcon "," -1 [(pvar "a" 1794) (pvar "b" 1795)] 1792)
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
        (pany l)       l
        (pprim _ l)    l
        (pstr _ l)     l
        (pvar _ l)     l
        (pcon _ _ _ l) l))

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

(** ## Compile to JS **)

(defn pat->j/pat [pat]
    (match pat
        (pany l)              none
        (pvar name l)         (some (j/pvar name l))
        (pcon name il args l) (match (foldl
                                  (, 0 [])
                                      args
                                      (fn [result arg]
                                      (let [(, i res) result]
                                          (match (pat->j/pat arg)
                                              (none)      (, (+ i 1) res)
                                              (some what) (, (+ i 1) [(, (its i) what) ..res])))))
                                  (, _ [])    none
                                  (, _ items) (some (j/pobj items none l)))
        (pstr string l)       (fatal "Cant use string as pattern")
        (pprim prim l)        (fatal "Cant use prim as pattern")))

(defn pat-loop/j [target args i inner l trace]
    (match args
        []           inner
        [arg ..rest] (compile-pat/j
                         arg
                             (j/index target (j/prim (j/int i l) l) l)
                             (pat-loop/j target rest (+ i 1) inner l trace)
                             trace)))

(defn compile-pat/j [pat target inner trace]
    (match pat
        (pany l)              inner
        (pprim prim l)        (match prim
                                  (pint int pl)   [(j/if
                                                      (j/bin "===" target (j/prim (j/int int pl) l) l)
                                                          (j/block inner)
                                                          none
                                                          l)]
                                  (pbool bool pl) [(j/if
                                                      (j/bin "===" target (j/prim (j/bool bool pl) l) l)
                                                          (j/block inner)
                                                          none
                                                          l)])
        (pstr str l)          [(j/if (j/bin "===" target (j/str str [] l) l) (j/block inner) none l)]
        (pvar name l)         [(j/let (j/pvar name l) target l) ..inner]
        (pcon name nl args l) [(j/if
                                  (j/bin "===" (j/attr target "type" l) (j/str name [] l) l)
                                      (j/block (pat-loop/j target args 0 inner l trace))
                                      none
                                      l)]))

(defn compile-let-binding/j [(, pat init) trace l]
    (match (pat->j/pat pat)
        (none)     (j/sexpr (compile/j init trace) l)
        (some pat) (j/let pat (compile/j init trace) l)))

(defn let-fix-shadow [(, pat init) l]
    (let [
        names     (pat-names pat)
        used      (externals set/nil init)
        overlap   (bag/fold
                      (fn [shadow (,, name kind l)]
                          (match kind
                              (value) (if (set/has names name)
                                          [(, name l) ..shadow]
                                              shadow)
                              _       shadow))
                          []
                          used)
        shadow    (set/to-list
                      (foldl set/nil overlap (fn [ov (, name _)] (set/add ov name))))
        new-names (mapi 0 shadow (fn [i name] "${name}$${(its i)}"))
        mapping   (map/from-list (zip shadow new-names))
        by-loc    (map/from-list
                      (map overlap (fn [(, name loc)] (, loc (force (map/get mapping name))))))]
        (match overlap
            [] [(, pat init)]
            _  (concat
                   [(map (map/to-list mapping) (fn [(, old new)] (, (pvar new l) (evar old l))))
                       [(,
                       pat
                           (map-expr
                           (fn [expr]
                               (match expr
                                   (evar _ l) (match (map/get by-loc l)
                                                  (some new-name) (evar new-name l)
                                                  _               expr)
                                   _          expr))
                               init))]]))))

(let-fix-shadow (, (parse-pat (@@ a)) (parse-expr (@@ (+ 1 a)))) 1)

(defn nop [a b] a)

(def pat-names/j2
    (fx
        nop
            (fn [names pat]
            (match pat
                (j/pvar name _) (set/add names name)
                _               names))
            nop
            nop))

(def externals/j
    (fx
        (fn [names expr]
            (match expr
                (j/var name _) (set/add names name)
                _              names))
            nop
            nop
            nop))

(defn pat-names/j [pat]
    (match pat
        (j/pvar name _)         (one name)
        (j/pobj items spread _) (foldl
                                    (match spread
                                        (none)     (empty)
                                        (some pat) (pat-names/j pat))
                                        items
                                        (fn [bag (, name item)] (bag/and bag (pat-names/j item))))))

(let [p (force (pat->j/pat (@p (what hi ho here))))]
    (, (bag/to-list (pat-names/j p)) (fold/pat pat-names/j2 set/nil p)))

(defn force [x]
    (match x
        (none)   (fatal "empty")
        (some x) x))

(def bops ["-" "+" ">" "<" "==" "===" "<=" ">=" "*"])

(defn is-bop [op] (contains bops op))

(defn contains [lst item]
    (match lst
        []           false
        [one ..rest] (if (= one item)
                         true
                             (contains rest item))))

(defn app/j [target args trace l]
    (foldl
        (compile/j target trace)
            args
            (fn [target arg] (j/app target [(compile/j arg trace)] l))))

(defn expand-bindings [bindings l]
    (foldr
        []
            bindings
            (fn [res binding] (concat [(let-fix-shadow binding l) res]))))

(defn compile-let/j [body trace bindings l]
    (foldr
        (compile/j body trace)
            (expand-bindings bindings l)
            (fn [body binding]
            (j/app
                (j/lambda
                    []
                        (left
                        (j/block
                            (concat
                                [[(compile-let-binding/j binding trace l)]
                                    (trace-pat (fst binding) trace)
                                    [(j/return body l)]])))
                        l)
                    []
                    l))))

(defn trace-pat [pat trace]
    (let [names (bag/to-list (pat-names-loc pat))]
        (foldl
            []
                names
                (fn [stmts (, name loc)]
                (match (map/get trace loc)
                    (none)      stmts
                    (some info) [(j/sexpr
                                    (j/app
                                        (j/var "$trace" -1)
                                            [(j/prim (j/int loc -1) -1) (j/raw (jsonify info) -1) (j/var name -1)]
                                            -1)
                                        -1)])))))

(defn maybe-trace [loc trace expr]
    (match (map/get trace loc)
        (none)   expr
        (some v) (j/app
                     (j/var "$trace" -1)
                         [(j/prim (j/int loc -1) -1) (j/raw (jsonify v) -1) expr]
                         -1)))

(defn compile-stmt/j [stmt trace]
    (match stmt
        (sexpr expr l)                      [(j/sexpr (compile/j expr trace) l)]
        (sdef name nl body l)               [(j/let (j/pvar name nl) (compile/j body trace) l)]
        (stypealias name _ _ _ _)           []
        (sdeftype name nl type-arg cases l) (map
                                                cases
                                                    (fn [case]
                                                    (let [(,,, name2 nl args l) case]
                                                        (j/let
                                                            (j/pvar name2 nl)
                                                                (foldr
                                                                (j/obj
                                                                    [(left (, "type" (j/str name2 [] nl)))
                                                                        ..(mapi
                                                                        0
                                                                            args
                                                                            (fn [i _] (left (, (int-to-string i) (j/var "v${(int-to-string i)}" nl)))))]
                                                                        l)
                                                                    (mapi 0 args (fn [i _] (j/pvar "v${(int-to-string i)}" nl)))
                                                                    (fn [body arg] (j/lambda [arg] (right body) l)))
                                                                l))
                                                        ))
        ;(join "\n" (map cases (fn [case])))))

(j/compile-stmts
    0
        (compile-stmt/j (parse-stmt (@@ (deftype one (one a b)))) map/nil))

(defn compile/j [expr trace]
    (maybe-trace
        (expr-loc expr)
            trace
            (match expr
            (estr first tpls l)             (j/str
                                                first
                                                    (map
                                                    tpls
                                                        (fn [(,, expr suffix l)] (,, (compile/j expr trace) suffix l)))
                                                    l)
            (eprim prim l)                  (match prim
                                                (pint int pl)   (j/prim (j/int int pl) l)
                                                (pbool bool pl) (j/prim (j/bool bool pl) l))
            (evar name l)                   (j/var name l)
            (equot inner l)                 (j/raw (quot/jsonify inner) l)
            (elambda pats body l)           (foldr
                                                ; gotta trace the args
                                                    (compile/j body trace)
                                                    pats
                                                    (fn [body pat]
                                                    (j/lambda
                                                        [(match (pat->j/pat pat)
                                                            (none)     (j/pvar "_${(its l)}" l)
                                                            (some pat) pat)]
                                                            (match (trace-pat pat trace)
                                                            []    (right body)
                                                            stmts (left (j/block (concat [stmts [(j/return body l)]]))))
                                                            l)))
            (elet bindings body l)          (compile-let/j body trace bindings l)
            (eapp (evar op ol) [one two] l) (if (is-bop op)
                                                (j/bin op (compile/j one trace) (compile/j two trace) l)
                                                    (app/j (evar op ol) [one two] trace l))
            (eapp target args l)            (app/j target args trace l)
            (ematch target cases l)         (j/app
                                                (j/lambda
                                                    [(j/pvar "$target" l)]
                                                        (left
                                                        (j/block
                                                            (concat
                                                                [(map
                                                                    cases
                                                                        (fn [(, pat body)]
                                                                        (j/sblock
                                                                            (j/block
                                                                                (compile-pat/j
                                                                                    pat
                                                                                        (j/var "$target" l)
                                                                                        (concat [(trace-pat pat trace) [(j/return (compile/j body trace) l)]])
                                                                                        trace))
                                                                                l)))
                                                                    [(j/throw
                                                                    (j/raw
                                                                        "new Error('match fail ${(its l)}:' + JSON.stringify($target))"
                                                                            0)
                                                                        0)]])))
                                                        l)
                                                    [(compile/j target trace)]
                                                    l))))

(j/compile
    0
        (map/expr
        simplify-js
            (compile/j (parse-expr (@@ (let [a 1 a (+ a 1)] a))) map/nil)))

(def ex (parse-expr (@@ (let [x 10] x))))

(j/compile 0 (compile/j ex (map/set map/nil 16243 "lol")))

(j/compile
    0
        (map/expr
        simplify-js
            (compile/j
            (parse-expr
                (@@
                    (fn [what]
                        (let [m what]
                            (match m
                                2 3
                                4 5)))))
                map/nil)))

(def example-expr
    (parse-expr
        (@@
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
                                                                            "});"])))))))))

(j/compile
    0
        (map/expr simplify-js (compile/j example-expr map/nil)))

(j/compile 0 (compile/j example-expr map/nil))

(j/compile
    0
        (compile/j
        (parse-expr
            (@@
                (match 2
                    1 2
                    3 4
                    a 5))
                )
            map/nil))

(j/compile
    0
        (compile/j (parse-expr (@@ (let [a 1 b 2] (+ a b)))) map/nil))

(defn run/j [v] (eval (j/compile 0 (compile/j (parse-expr v) map/nil))))

(,
    run/j
        [(, (@@ "${1}") "1")
        (, (@@ "hello") "hello")
        (, (@@ "\"") "\"")
        (, (@@ "\n") "\n")
        (, (@@ "\\n") "\\n")
        (, (@@ "\\\n") "\\\n")
        (, (@@ "${(+ 2 3)}") "5")
        (, (@@ "a${2}b") "a2b")
        (, (@@ "${((fn [a] (+ a 2)) 21)}") "23")
        (, (@@ "${(let [one 1 two 2] (+ 1 2))}") "3")
        (,
        (@@
            "${(match 2
                a 1
                a 2)}")
            "1")
        (, (@@ "${(let [a/b 2] a/b)}") "2")
        (,
        (@@
            "${(match true
                true 1
                2    3)}")
            "1")
        (, (@@  "`${1}") "`1")
        (, (@@ "${${1}") "${1")
        (,
        (@@
            "${(match [1]
                []      []
                [a ..b] a)}")
            "1")])

(** ## Compilation **)

(defn escape-string [string]
    (replaces
        string
            [(, "\\" "\\\\") (, "\n" "\\n") (, "\"" "\\\"") (, "`" "\\`") (, "$" "\\$")]))

(escape-string (unescapeString "\n"))

(** ## Patterns **)

(defn pat-loop [target args i inner trace]
    (match args
        []           inner
        [arg ..rest] (compile-pat
                         arg
                             "${target}[${(its i)}]"
                             (pat-loop target rest (+ i 1) inner trace)
                             trace)))

(defn just-pat [pat]
    (match pat
        (pany _)              (none)
        (pvar name l)         (some (sanitize name))
        (pcon name il args l) (match (foldl
                                  (, 0 [])
                                      args
                                      (fn [result arg]
                                      (let [(, i res) result]
                                          (match (just-pat arg)
                                              (none)      (, (+ i 1) res)
                                              (some what) (, (+ i 1) ["${(its i)}: ${what}" ..res])))))
                                  (, _ [])    none
                                  (, _ items) (some "{${(join ", " (rev items []))}}"))
        (pstr _ _)            (fatal "Cant use string as a pattern in this location")
        (pprim _ _)           (fatal "Cant use primitive as a pattern in this location")))

(defn compile-pat [pat target inner trace]
    (trace-and-block
        (pat-loc pat)
            trace
            target
            (match pat
            (pany l)              inner
            (pprim prim l)        (match prim
                                      (pint int _)   "if (${target} === ${(its int)}) {\n${inner}\n}"
                                      (pbool bool _) "if (${target} === ${(match bool
                                                         true "true"
                                                         _    "false")}) {\n${inner}\n}")
            (pstr str l)          "if (${target} === \"${str}\"){\n${inner}\n}"
            (pvar name l)         "{\nlet ${(sanitize name)} = ${target};\n${inner}\n}"
            (pcon name nl args l) "if (${target}.type === \"${name}\") {\n${(pat-loop target args 0 inner trace)}\n}")))

(defn orr [default v]
    (match v
        (some v) v
        _        default))

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
                                                _  "`${(escape-string (unescapeString first))}${(join
                                                       ""
                                                           (map
                                                           tpls
                                                               (fn [item]
                                                               (let [(,, expr suffix l) item]
                                                                   "${${(compile expr trace)}}${(escape-string (unescapeString suffix))}"))))}`")
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
                                                    "function name_${(its l)}(${(orr "_" (just-pat pat))}) {${(match (bag/to-list (pat-names-loc pat))
                                                        []    ""
                                                        names (join
                                                                  "\n"
                                                                      (map
                                                                      names
                                                                          (fn [arg] (let [(, name l) arg] (just-trace l trace (sanitize name)))))))} return ${body} }"))
                    (elet bindings body l)  (foldr
                                                (compile body trace)
                                                    bindings
                                                    (fn [body binding] (compile-let-binding binding body trace l)))
                    (eapp target args l)    "${(foldl
                                                "${(match target
                                                    (elambda _ _ _) "(${(compile target trace)})"
                                                    _               (compile target trace))}/*${(its l)}*/"
                                                    args
                                                    (fn [target arg] "${target}(${(compile arg trace)})"))}"
                    (ematch target cases l) "(function match_${(its l)}($target) {\n${(join
                                                "\n"
                                                    (map
                                                    cases
                                                        (fn [case]
                                                        (let [(, pat body) case]
                                                            (compile-pat pat "$target" "return ${(compile body trace)}" trace)))))}\nthrow new Error('failed to match ' + jsonify($target) + '. Loc: ${(its l)}');})(/*!*/${(compile target trace)})")))))

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
        [(, (@@ "${1}") "1")
        (, (@@ "hello") "hello")
        (, (@@ "\"") "\"")
        (, (@@ "\n") "\n")
        (, (@@ "\\n") "\\n")
        (, (@@ "\\\n") "\\\n")
        (, (@@ "${(+ 2 3)}") "5")
        (, (@@ "a${2}b") "a2b")
        (, (@@ "${((fn [a] (+ a 2)) 21)}") "23")
        (, (@@ "${(let [one 1 two 2] (+ 1 2))}") "3")
        (,
        (@@
            "${(match 2
                2 1)}")
            "1")
        (, (@@ "${(let [a/b 2] a/b)}") "2")
        (,
        (@@
            "${(match true
                true 1
                2    3)}")
            "1")
        (, (@@  "`${1}") "`1")
        (, (@@ "${${1}") "${1")
        (,
        (@@
            "${(match [1]
                []      []
                [a ..b] a)}")
            "1")])

(defn compile-let-binding [binding body trace l]
    (let [(, pat init) binding]
        "(function let_${(its l)}() {const $target = ${(compile init trace)};\n${(compile-pat pat "$target" "return ${body}" trace)};\nthrow new Error('let pattern not matched ${(its (pat-loc pat))}. ' + valueToString($target));})(/*!*/)"))

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
        (pany _)              set/nil
        (pvar name l)         (set/add set/nil name)
        (pcon name nl args l) (foldl
                                  set/nil
                                      args
                                      (fn [bound arg] (set/merge bound (pat-names arg))))
        (pstr string int)     set/nil
        (pprim prim int)      set/nil))

(defn pat-names-loc [pat]
    (match pat
        (pany _)              empty
        (pvar name l)         (one (, name l))
        (pcon name nl args l) (foldl
                                  (one (, name nl))
                                      args
                                      (fn [bound arg] (bag/and bound (pat-names-loc arg))))
        (pstr string int)     empty
        (pprim prim int)      empty))

(defn pat-externals [pat]
    (match pat
        (** Soo this should be probably a (type)? Or rather, we should look up the corresponding type, and depend on that instead. **)
        (pcon name nl args l) (bag/and (one (,, name (value) nl)) (many (map args pat-externals)))
        _                     empty))

(defn expr-type [expr]
    (match expr
        (eprim prim int)     "prim"
        (estr string _ int)  "str"
        (evar string int)    "var"
        (equot quot int)     "quot"
        (elambda _ expr int) "lambda"
        (eapp expr _ int)    "app"
        (elet _ expr int)    "let"
        (ematch expr _ int)  "match"))

(defn type-type [type]
    (match type
        (tapp _ _ _) "app"
        (tvar _ _)   "var"
        (tcon _ _)   "con"))

(defn fold-type [init type f]
    (let [v (f init type)]
        (match type
            (tapp target arg _) (fold-type (fold-type v target f) arg f)
            _                   v)))

(defn ,,0 [x] (let [(,, a _ _) x] a))

(defn ,,1 [x] (let [(,, _ a _) x] a))

(defn ,,2 [x] (let [(,, _ _ a) x] a))

(defn map,,0 [f (,, a b c)] (,, (f a) b c))

(defn map,1 [f (, a b)] (, a (f b)))

dot

(defn map-expr [f expr]
    (match (f expr)
        (estr first tpl l)     (estr first (map tpl (map,,0 (map-expr f))) l)
        (elambda pats body l)  (elambda pats (map-expr f body) l)
        (elet bindings body l) (elet (map bindings (map,1 (map-expr f))) (map-expr f body) l)
        (eapp target args l)   (eapp (map-expr f target) (map args (map-expr f)) l)
        (ematch expr cases l)  (ematch (map-expr f expr) (map cases (map,1 (map-expr f))) l)
        otherwise              otherwise))

(defn fold-expr [init expr f]
    (let [v (f init expr)]
        (match expr
            (estr _ tpl _)         (foldl v tpl (fn [init tpl] (fold-expr init (,,0 tpl) f)))
            (elambda _ body _)     (fold-expr v body f)
            (elet bindings body _) (fold-expr
                                       (foldl
                                           v
                                               bindings
                                               (fn [init binding] (fold-expr init (snd binding) f)))
                                           body
                                           f)
            (eapp target args _)   (foldl
                                       (fold-expr v target f)
                                           args
                                           (fn [init expr] (fold-expr init expr f)))
            (ematch expr cases _)  (foldl
                                       (fold-expr v expr f)
                                           cases
                                           (fn [init case] (fold-expr init (snd case) f)))
            _                      v)))

(defn expr-size [expr] (fold-expr 0 expr (fn [v _] (+ 1 v))))

(defn type-size [type] (fold-type 0 type (fn [v _] (+ 1 v))))

(defn ,,,2 [x] (let [(,,, _ _ x _) x] x))

(defn stmt-size [stmt]
    (+
        1
            (match stmt
            (sdef string _ expr _)                  (expr-size expr)
            (sexpr expr _)                          (expr-size expr)
            (stypealias string _ args type _)       (type-size type)
            (sdeftype string _ args constructors _) (foldl
                                                        0
                                                            constructors
                                                            (fn [v const] (foldl v (map (,,,2 const) type-size) +))))))

(defn externals [bound expr]
    (match expr
        (evar name l)            (match (set/has bound name)
                                     true empty
                                     _    (one (,, name (value) l)))
        (eprim prim l)           empty
        (estr first templates l) (many
                                     (map
                                         templates
                                             (fn [arg]
                                             (match arg
                                                 (,, expr _ _) (externals bound expr)))))
        (equot expr l)           empty
        (elambda pats body l)    (bag/and
                                     (foldl empty (map pats pat-externals) bag/and)
                                         (externals (foldl bound (map pats pat-names) set/merge) body))
        (elet bindings body l)   (bag/and
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
                                                 (map bindings (fn [arg] (let [(, pat _) arg] (pat-names pat))))
                                                 set/merge)
                                             body))
        (eapp target args l)     (bag/and
                                     (externals bound target)
                                         (foldl empty (map args (externals bound)) bag/and))
        (ematch expr cases l)    (bag/and
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
            (sdeftype string _ free constructors _) (let [frees (set/from-list (map free fst))]
                                                        (many
                                                            (map
                                                                constructors
                                                                    (fn [constructor]
                                                                    (match constructor
                                                                        (,,, name l args _) (match args
                                                                                                [] empty
                                                                                                _  (many (map args (externals-type frees)))))))))
            (stypealias name _ args body _)         (let [frees (set/from-list (map args fst))]
                                                        (externals-type frees body))
            (sdef name _ body _)                    (externals (set/add set/nil name) body)
            (sexpr expr _)                          (externals set/nil expr))))

(** ## Export **)

(deftype parse-and-compile
    (parse-and-compile
        (fn [cst] stmt)
            (fn [cst] expr)
            (fn [stmt (map int bool)] string)
            (fn [expr (map int bool)] string)
            (fn [stmt] (array (,, string name-kind int)))
            (fn [stmt] (array (,, string name-kind int)))
            (fn [expr] (array (,, string name-kind int)))
            (fn [stmt] int)
            (fn [expr] int)
            (fn [type] int)))

((eval
    "({0: parse_stmt,  1: parse_expr, 2: compile_stmt, 3: compile, 4: names, 5: externals_stmt, 6: externals_expr, 7: stmt_size, 8: expr_size, 9: type_size}) => ({\ntype: 'fns', parse_stmt, parse_expr, compile_stmt, compile, names, externals_stmt, externals_expr, stmt_size, expr_size, type_size})")
    (parse-and-compile
        parse-stmt
            parse-expr
            (fn [stmt ctx]
            (j/compile-stmts
                ctx
                    (map (compile-stmt/j stmt ctx) (map/stmt simplify-js))))
            (fn [expr ctx]
            (j/compile ctx (map/expr simplify-js (compile/j expr ctx))))
            names
            externals-stmt
            (fn [expr] (bag/to-list (externals set/nil expr)))
            stmt-size
            expr-size
            type-size))