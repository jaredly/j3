(** ## More Fancy Parser & Code Generator
    The parser uses a monad to allow for "recovery" after invalid syntax, with fine-grained error reporting.
    The code generator first transforms the AST into an Intermediate Representation that is an approximation of JavaScript's AST. It then does some simplifying passes on the result, applying some basic optimizations. It also supports "tracing", so that you can get lightweight logging of intermediate values. **)

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

(deftype (, a b)
    (, a b))

(defn zip [one two]
    (match (, one two)
        (, [] [])               []
        (, [o ..one] [t ..two]) [(, o t) ..(zip one two)]
        _                       (fatal "Mismatched lists to zip")))

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
        []               (<- [])
        [one two ..rest] (let-> [rest (pairs rest)] (<- [(, one two) ..rest]))
        [one]            (<-err (, (cst-loc one) "extra item in pairs") [])))

((** Groups a list into pairs, and if there's a trailing singleton, uses extra as it's pair. **)
    defn pairs-plus [extra list]
    (match list
        []               []
        [one two ..rest] [(, one two) ..(pairs-plus extra rest)]
        [one]            [(, one extra)]))

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

(deftype (list a)
    (nil)
        (cons a (list a)))

(defn replaces [target repl]
    (match repl
        []           target
        [one ..rest] (match one
                         (, find nw) (replaces (replace-all target find nw) rest))))

(** ## Our AST & CST **)

(deftype cst
    (cst/list (list cst) int)
        (cst/array (list cst) int)
        (cst/spread cst int)
        (cst/record (list cst) int)
        (cst/access (option (, string int)) (list (, string int)) int)
        (cst/id string int)
        (cst/string string (list (, cst string int)) int))

(deftype quot
    (quot/expr expr)
        (quot/top top)
        (quot/type type)
        (quot/pat pat)
        (quot/quot cst))

(deftype expr
    (eprim prim int)
        (estr string (list (, expr string int)) int)
        (evar string int)
        (eeffect string bool int)
        (equot quot int)
        (elambda (list pat) expr int)
        (eapp expr (list expr) int)
        (elet (list (, pat expr)) expr int)
        (ematch expr (list (, pat expr)) int)
        (eenum string int (option expr) int)
        (erecord (option (, expr bool)) (list (, string expr)) int)
        (eaccess (option (, string int)) (list (, string int)) int)
        (eprovide
        expr
            (list (, effect-kind string int (list pat) expr))
            int))

(deftype effect-kind
    (eearmuffs)
        (eeffectful string int))

(deftype prim
    (pint int int)
        (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string int (list pat) int)
        (pstr string int)
        (pprim prim int)
        (precord (list (, string pat)) (option pat) int)
        (penum string int (option pat) int))

(deftype type
    (tvar string int)
        (tapp type type int)
        (tcon string int)
        (trec string int type int)
        (trow (list (, string type)) (option type) row-kind int))

(deftype row-kind
    (renum)
        (rrecord))

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

(** ## A State monad **)

(deftype (StateT state value)
    (StateT (fn [state] (, state value))))

(defn run-> [(StateT f) state] (let [(, _ result) (f state)] result))

(defn state-f [(StateT f)] f)

(defn >>= [(StateT f) next]
    (StateT
        (fn [state] (let [(, state value) (f state)] ((state-f (next value)) state)))))

(defn <- [x] (StateT (fn [state] (, state x))))

(defn <-err [e v] (StateT (fn [state] (, [e ..state] v))))

(def <-state (StateT (fn [state] (, state state))))

(defn state-> [v] (StateT (fn [old] (, v old))))

(defn map-> [f arr]
    (match arr
        []           (<- [])
        [one ..rest] (let-> [
                         one  (f one)
                         rest (map-> f rest)]
                         (<- [one ..rest]))))

(defn do-> [f arr]
    (match arr
        []           (<- ())
        [one ..rest] (let-> [
                         () (f one)
                         () (do-> f rest)]
                         (<- ()))))

(defn seq-> [arr]
    (match arr
        []           (<- [])
        [one ..rest] (let-> [
                         one  one
                         rest (seq-> rest)]
                         (<- [one ..rest]))))

;(defn ok-> [result]
    (match result
        (ok v)  (<- v)
        (err e) (<-err e)))

;(defn force [e->s result]
    (match result
        (ok v)  v
        (err e) (fatal "Result Error ${(e->s e)}")))

(defn foldl-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [one (f init one)] (foldl-> one rest f))))

(defn foldr-> [init values f]
    (match values
        []           (<- init)
        [one ..rest] (let-> [init (foldr-> init rest f)] (f init one))))

(** ## The State monad n stuff **)

(def state/nil [])

(defn run/nil-> [st] (run-> st state/nil))

(** ## JavaScript Compiler **)

(** ## Js AST **)

(deftype (either a b)
    (left a)
        (right b))

(deftype j/prim
    (j/int int int)
        (j/float float int)
        (j/bool bool int))

(deftype j/expr
    (j/app j/expr (list j/expr) int)
        (j/bin string j/expr j/expr int)
        (j/un string j/expr int)
        (j/lambda (list j/pat) (either j/block j/expr) int)
        (j/prim j/prim int)
        (j/str string (list (, j/expr string int)) int)
        (j/raw string int)
        (j/var string int)
        (j/attr j/expr string int)
        (j/index j/expr j/expr int)
        (j/tern j/expr j/expr j/expr int)
        (j/assign string string j/expr int)
        (j/array (list (either j/expr (j/spread j/expr))) int)
        (j/obj (list (either (, string j/expr) (j/spread j/expr))) int))

(deftype (j/spread a)
    (j/spread a))

(deftype j/block
    (j/block (list j/stmt)))

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
        (j/parray (list j/pat) (option j/pat) int)
        (j/pobj (list (, string j/pat)) (option j/pat) int))

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
    (let [
        (fx _ _ b _)    fx
        (j/block items) block]
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
                                                   (fold/get spread/inner (fold/expr fx))))
                _                      (fatal "cant fold this expr"))
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
    (let [
        loop                          (map/pat tx)
        (tx _ _ pre-p post-p _ _ _ _) tx]
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
    (let [
        loop                          (map/expr tx)
        (tx pre-e post-e _ _ _ _ _ _) tx]
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
                                                                   (map tpls (fn [(, expr suffix l)] (, (loop expr) suffix l)))
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
        (j/app (j/lambda [] (right inner) _) [] _)                    (some inner)
        (j/lambda args (left (j/block [(j/return value _)])) l)       (some (j/lambda args (right value) l))
        (j/lambda args (right (j/app (j/lambda [] body ll) [] al)) l) (some (j/lambda args body l))
        _                                                             none))

(defn make-lets [params args l]
    (match (, params args)
        (, [] [])                       []
        (, [one ..params] [two ..args]) [(j/let one two l) ..(make-lets params args l)]
        _                               (fatal "invalid lets")))

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
        (j/pvar name l)           name
        (j/parray items spread l) "[${(join ", " (map items (pat-arg ctx)))}${(match spread
                                      (some s) "...${(pat-arg ctx s)}"
                                      (none)   "")}]"
        (j/pobj items spread l)   "{${(join
                                      ", "
                                          (map
                                          items
                                              (fn [pair]
                                              "\"${(escape-string (fst pair))}\": ${(pat-arg ctx (snd pair))}")))}${(match spread
                                      (some s) "...${(pat-arg ctx s)}"
                                      (none)   "")}}"))

(defn escape-string [string]
    (replaces
        string
            [(, "\\" "\\\\") (, "\n" "\\n") (, "\"" "\\\"") (, "`" "\\`") (, "$" "\\$")]))

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
                                                      (let [(, expr suffix l) item]
                                                          "${${(j/compile ctx expr)}}${(escape-string (unescapeString suffix))}"))))}`")
        (j/var name l)             name
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

(** ## Compile to JS **)

(defn pat->j/pat [pat]
    (match pat
        (pany l)                  none
        (pvar name l)             (some (j/pvar (sanitize name) l))
        (pcon name il args l)     (match (foldl
                                      (, 0 [])
                                          args
                                          (fn [result arg]
                                          (let [(, i res) result]
                                              (match (pat->j/pat arg)
                                                  (none)      (, (+ i 1) res)
                                                  (some what) (, (+ i 1) [(, (its i) what) ..res])))))
                                      (, _ [])    none
                                      (, _ items) (some (j/pobj items none l)))
        (pstr string l)           (fatal "Cant use string as pattern")
        (pprim prim l)            (fatal "Cant use prim as pattern")
        (precord fields spread l) (let [fields (map fields (fn [(, name pat)] (, name (pat->j/pat pat))))]
                                      (some
                                          (j/pobj
                                              (foldr
                                                  []
                                                      fields
                                                      (fn [rest (, name pat)]
                                                      (match pat
                                                          (none)     rest
                                                          (some pat) [(, name pat) ..rest])))
                                                  (match spread
                                                  (none)   none
                                                  (some v) (pat->j/pat v))
                                                  l)))
        (penum name _ arg l)      (match arg
                                      (none)   (none)
                                      (some v) (match (pat->j/pat v)
                                                   (none)   (none)
                                                   (some v) (some (j/pobj [(, "arg" v)] none l))))))

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
        (pany l)                  inner
        (penum name nl arg l)     (match arg
                                      (none)     [(j/if
                                                     (j/bin "===" target (j/str name [] nl) nl)
                                                         (j/block inner)
                                                         none
                                                         l)]
                                      (some pat) [(j/if
                                                     (j/bin "===" (j/attr target "tag" nl) (j/str name [] nl) nl)
                                                         (j/block (compile-pat/j pat (j/attr target "arg" nl) inner trace))
                                                         none
                                                         l)])
        (precord fields spread l) (loop
                                      fields
                                          (fn [fields recur]
                                          (match fields
                                              []                    (match spread
                                                                        (none)     inner
                                                                        (some pat) [(j/sblock
                                                                                       (j/block
                                                                                           [(j/let
                                                                                               (j/pobj
                                                                                                   (mapi
                                                                                                       0
                                                                                                           fields
                                                                                                           (fn [i (, name _)] (, name (j/pvar "_$${(int-to-string i)}" l))))
                                                                                                       (some (j/pvar "$rest" l))
                                                                                                       l)
                                                                                                   target
                                                                                                   l)
                                                                                               ..(compile-pat/j pat (j/var "$rest" l) inner trace)])
                                                                                           l)])
                                              [(, name pat) ..rest] (compile-pat/j pat (j/attr target name l) (recur rest) trace))))
        (pprim prim l)            (match prim
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
        (pstr str l)              [(j/if (j/bin "===" target (j/str str [] l) l) (j/block inner) none l)]
        (pvar name l)             [(j/let (j/pvar (sanitize name) l) target l) ..inner]
        (pcon name nl args l)     [(j/if
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
                      (fn [shadow (, name kind l)]
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
                      (map
                          overlap
                              (fn [(, name loc)] (, loc (force-opt (map/get mapping name))))))]
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

(let-fix-shadow
    (, (run/nil-> (parse-pat (@@ a))) (run/nil-> (parse-expr (@@ (+ 1 a)))))
        1)

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
                                        (fn [bag (, name item)] (bag/and bag (pat-names/j item))))
        _                       (fatal "Cant get pat names/j")))

(let [
    p (force-opt (pat->j/pat (run/nil-> (parse-pat (@@ (what hi ho here))))))]
    (, (bag/to-list (pat-names/j p)) (fold/pat pat-names/j2 set/nil p)))

(defn force-opt [x]
    (match x
        (none)   (fatal "empty")
        (some x) x))

(defn id [x] x)

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
            (fn [target arg]
            (j/app target [(compile/j arg trace) (j/var "$lbeffects$rb" l)] l))))

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
        (foldr
            []
                names
                (fn [stmts (, name loc)]
                (match (map/get trace loc)
                    (none)      stmts
                    (some info) [(j/sexpr
                                    (j/app
                                        (j/var "$trace" -1)
                                            [(j/prim (j/int loc -1) -1)
                                            (j/raw (jsonify info) -1)
                                            (j/var (sanitize name) -1)]
                                            -1)
                                        -1)
                                    ..stmts])))))

(defn maybe-trace [loc trace expr]
    (match (map/get trace loc)
        (none)   expr
        (some v) (j/app
                     (j/var "$trace" -1)
                         [(j/prim (j/int loc -1) -1) (j/raw (jsonify v) -1) expr]
                         -1)))

(defn compile-top/j [top trace]
    (match top
        (texpr expr l)                      [(j/sexpr (provide-empty-effects (right (compile/j expr trace))) l)]
        (tdef name nl body l)               [(j/let (j/pvar (sanitize name) nl) (compile/j body trace) l)]
        (ttypealias name _ _ _ _)           []
        (tdeftype name nl type-arg cases l) (map
                                                cases
                                                    (fn [case]
                                                    (let [(, name2 nl args l) case]
                                                        (j/let
                                                            (j/pvar (sanitize name2) nl)
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
                                                        ))))

(j/compile-stmts
    0
        (compile-top/j
        (run/nil->
            (parse-top
                (@@
                    (deftype one
                        (one a b)))))
            map/nil))

(defn quot/jsonify [quot]
    (match quot
        (quot/expr expr) (jsonify expr)
        (quot/type type) (jsonify type)
        (quot/top top)   (jsonify top)
        (quot/quot cst)  (jsonify cst)
        (quot/pat pat)   (jsonify pat)))

(defn compile/j [expr trace]
    (maybe-trace
        (expr-loc expr)
            trace
            (match expr
            (estr first tpls l)             (j/str
                                                first
                                                    (map tpls (fn [(, expr suffix l)] (, (compile/j expr trace) suffix l)))
                                                    l)
            (eprim prim l)                  (match prim
                                                (pint int pl)   (j/prim (j/int int pl) l)
                                                (pbool bool pl) (j/prim (j/bool bool pl) l))
            (evar name l)                   (j/var (sanitize name) l)
            (equot inner l)                 (j/raw (quot/jsonify inner) l)
            (eeffect name false l)          (j/index (j/var "$lbeffects$rb" l) (j/str name [] l) l)
            (eeffect name true l)           (fatal "effect compile not yet")
            (eprovide target handlers l)    (fatal "provide not yet")
            (elambda pats body l)           (foldr
                                                ; gotta trace the args
                                                    (compile/j body trace)
                                                    pats
                                                    (fn [body pat]
                                                    (j/lambda
                                                        [(match (pat->j/pat pat)
                                                            (none)     (j/pvar "_${(its l)}" l)
                                                            (some pat) pat)
                                                            (j/pvar "$lbeffects$rb" l)]
                                                            (match (trace-pat pat trace)
                                                            []    (right body)
                                                            stmts (left (j/block (concat [stmts [(j/return body l)]]))))
                                                            l)))
            (elet bindings body l)          (compile-let/j body trace bindings l)
            (eapp (evar op ol) [one two] l) (if (is-bop op)
                                                (j/bin op (compile/j one trace) (compile/j two trace) l)
                                                    (app/j (evar op ol) [one two] trace l))
            (eapp target args l)            (app/j target args trace l)
            (eaccess target items l)        (let [
                                                make (fn [target]
                                                         (foldl target items (fn [target (, name nl)] (j/attr target name nl))))]
                                                (match target
                                                    (some (, t nl)) (make (j/var (sanitize t) nl))
                                                    (none)          (j/lambda [(j/pvar "$target" l)] (right (make (j/var "$target" l))) l)))
            (erecord spread fields l)       (let [
                                                fields (map fields (fn [(, name value)] (left (, name (compile/j value trace)))))]
                                                (j/obj
                                                    (match spread
                                                        (none)         fields
                                                        (some (, s _)) [(right (j/spread (compile/j s trace))) ..fields])
                                                        l))
            (eenum name nl arg l)           (match arg
                                                (none)     (j/str name [] nl)
                                                (some arg) (j/obj
                                                               [(left (, "tag" (j/str name [] nl))) (left (, "arg" (compile/j arg trace)))]
                                                                   l))
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
        (compile/j (run/nil-> (parse-expr (@@ (let [x 101] 1)))) map/nil))

(j/compile
    0
        (map/expr
        simplify-js
            (compile/j
            (run/nil->
                (parse-expr
                    (@@
                        (let [
                            a 11
                            a (+ a 1)]
                            a))))
                map/nil)))

(def ex (run/nil-> (parse-expr (@@ (let [x 10] x)))))

(j/compile 0 (compile/j ex (map/set map/nil 16243 "lol")))

(j/compile
    0
        (map/expr
        simplify-js
            (compile/j
            (run/nil->
                (parse-expr
                    (@@
                        (fn [what]
                            (let [m what]
                                (match m
                                    2 3
                                    4 5))))))
                map/nil)))

(def example-expr
    (run/nil->
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
                                                                    (let [(, name2 nl args l) case]
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
                                                                                "});"]))))))))))

(j/compile
    100
        (map/expr simplify-js (compile/j example-expr map/nil)))

1029

(j/compile 0 (compile/j example-expr map/nil))

(j/compile
    0
        (compile/j
        (run/nil->
            (parse-expr
                (@@
                    (match 2
                        1 2
                        3 4
                        a 5))
                    ))
            map/nil))

(j/compile
    0
        (compile/j
        (run/nil->
            (parse-expr
                (@@
                    (let [
                        a 1
                        b 2]
                        (+ a b)))))
            map/nil))

(defn run/j [v]
    (eval
        "(($lbeffects$rb) => ${(j/compile 0 (compile/j (run/nil-> (parse-expr v)) map/nil))})({})"
            ))

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
        (,
        (@@
            "${(let [
                one 1
                two 2]
                (+ 1 2))}")
            "3")
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
        (, (@@ "${${1}") "${1")])

(** ## Builtins
    There are a number of primitives that we'll have implemented in JavaScript, such as arithmetic operators, low-level parsers, and some other things that will help with performance a little bit. **)

(def builtins-for-eval
    ((eval
        (** builtins => sanitize => {
  const san = {}
  Object.keys(builtins).forEach(k => san[sanitize(k)] = builtins[k])
  return san
} **)
            (eval "(() => {${builtins}})()")
            sanitize)
        ))

(def eval-with-builtins (eval-with builtins-for-eval))

(eval-with-builtins "$pl(1)(3)")

(eval "x => x + 2" 210)

(def builtins
    (** function equal(a, b) {
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var length, i, keys;
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
            return true;
        }

        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;

        for (i = length; i-- !== 0; ) {
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        }

        for (i = length; i-- !== 0; ) {
            var key = keys[i];

            if (!equal(a[key], b[key])) return false;
        }

        return true;
    }

    // true if both NaN, false otherwise
    return a !== a && b !== b;
}

function unescapeString(n) {
    if (n == null || !n.replaceAll) {
        debugger;
        return '';
    }
    return n.replaceAll(/\\\\./g, (m) => {
        if (m[1] === 'n') {
            return '\\n';
        }
        if (m[1] === 't') {
            return '\\t';
        }
        if (m[1] === 'r') {
            return '\\r';
        }
        return m[1];
    });
}

function unwrapList(v) {
    return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])];
}

function wrapList(v) {
    let res = { type: 'nil' };
    for (let i = v.length - 1; i >= 0; i--) {
        res = { type: 'cons', 0: v[i], 1: res };
    }
    return res;
}

const sanMap = {
    // '$$$$' gets interpreted by replaceAll as '$$', for reasons
    $: '$$$$',
    '-': '_',
    '+': '$pl',
    '*': '$ti',
    '=': '$eq',
    '>': '$gt',
    '<': '$lt',
    "'": '$qu',
    '"': '$dq',
    ',': '$co',
    '/': '$sl',
    ';': '$semi',
    '@': '$at',
    ':': '$cl',
    '#': '$ha',
    '!': '$ex',
    '|': '$bar',
    '()': '$unit',
    '?': '$qe',
  };
const kwds =
    'case new var const let if else return super break while for default eval'.split(' ');

// Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.
function sanitize(raw) {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    if (kwds.includes(raw)) return '$' + raw
    return raw
}

const valueToString = (v) => {
    if (Array.isArray(v)) {
        return `[${v.map(valueToString).join(', ')}]`;
    }
    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            const un = unwrapList(v);
            return '[' + un.map(valueToString).join(' ') + ']';
        }

        let args = [];
        for (let i = 0; i in v; i++) {
            args.push(v[i]);
        }
        return `(${v.type}${args
            .map((arg) => ' ' + valueToString(arg))
            .join('')})`;
    }
    if (typeof v === 'string') {
        if (v.includes('"') && !v.includes("'")) {
            return (
                "'" + JSON.stringify(v).slice(1, -1).replace(/\\"/g, '"') + "'"
            );
        }
        return JSON.stringify(v);
    }
    if (typeof v === 'function') {
        return '<function>';
    }

    return '' + v;
};

return {
    '+': (a) => (b) => a + b,
    '-': (a) => (b) => a - b,
    '<': (a) => (b) => a < b,
    '<=': (a) => (b) => a <= b,
    '>': (a) => (b) => a > b,
    '>=': (a) => (b) => a >= b,
    '=': (a) => (b) => equal(a, b),
    '!=': (a) => (b) => !equal(a, b),
    pi: Math.PI,
    'replace-all': a => b => c => a.replaceAll(b, c),
    eval: source => {
      return new Function('', 'return ' + source)();
    },
    'eval-with': ctx => source => {
      const args = '{' + Object.keys(ctx).join(',') + '}'
      return new Function(args, 'return ' + source)(ctx);
    },
    $unit: null,
    errorToString: f => arg => {
      try {
        return f(arg)
      } catch (err) {
        return err.message;
      }
    },
    valueToString,
    unescapeString,
    sanitize,
    equal: a => b => equal(a, b),
    'int-to-string': (a) => a.toString(),
    'string-to-int': (a) => {
        const v = Number(a);
        return Number.isInteger(v) && v.toString() === a ? { type: 'some', 0: v } : { type: 'none' };
    },
    'string-to-float': (a) => {
        const v = Number(a);
        return Number.isFinite(v) ? { type: 'some', 0: v } : { type: 'none' };
    },

    // maps
    'map/nil': [],
    'map/set': (map) => (key) => (value) =>
        [[key, value], ...map.filter((i) => i[0] !== key)],
    'map/rm': (map) => (key) => map.filter((i) => !equal(i[0], key)),
    'map/get': (map) => (key) => {
        const found = map.find((i) => equal(i[0], key));
        return found ? { type: 'some', 0: found[1] } : { type: 'none' };
    },
    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),
    'map/merge': (one) => (two) =>
        [...one, ...two.filter(([key]) => !one.find(([a]) => equal(a, key)))],
    'map/values': (map) => wrapList(map.map((item) => item[1])),
    'map/keys': (map) => wrapList(map.map((item) => item[0])),
    'map/from-list': (list) =>
        unwrapList(list).map((pair) => [pair[0], pair[1]]),
    'map/to-list': (map) =>
        wrapList(map.map(([key, value]) => ({ type: ',', 0: key, 1: value }))),

    // sets
    'set/nil': [],
    'set/add': (s) => (v) => [v, ...s.filter((m) => !equal(v, m))],
    'set/has': (s) => (v) => s.includes(v),
    'set/rm': (s) => (v) => s.filter((i) => !equal(i, v)),
    // NOTE this is only working for primitives
    'set/diff': (a) => (b) => a.filter((i) => !b.some((j) => equal(i, j))),
    'set/merge': (a) => (b) =>
        [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],
    'set/overlap': (a) => (b) => a.filter((x) => b.some((y) => equal(y, x))),
    'set/to-list': wrapList,
    'set/from-list': (s) => {
        const res = [];
        unwrapList(s).forEach((item) => {
            if (res.some((m) => equal(item, m))) {
                return;
            }
            res.push(item);
        });
        return res;
    },

    // Various debugging stuff
    jsonify: (v) => JSON.stringify(v) ?? 'undefined',
    fatal: (message) => {
        throw new Error(`Fatal runtime: ${message}`);
    },
} **))

(** ## Parsing **)

(defn tapps [items l]
    (match items
        []           (fatal "empty tapps")
        [one]        one
        [one ..rest] (tapp (tapps rest l) one l)))

(def parse-tag
    (eval
        "v => v.startsWith('\\'') ? {type: 'some', 0: v.slice(1)} : {type: 'none'}"))

(def is-earmuffs
    (eval
        "v => v.startsWith('*') && v.endsWith('*') && v.length > 2"))

(parse-tag "hi")

(parse-tag "'hi")

(defn parse-type [type]
    (match type
        (cst/id id l)                                                 (<- (tcon id l))
        (cst/list [] l)                                               (<- (tcon "()" l))
        (cst/list [(cst/id "fn" _) (cst/array args _) body ..rest] l) (let-> [
                                                                          body (parse-type body)
                                                                          args (map-> parse-type args)
                                                                          ()   (do-> (unexpected "extra item in type") rest)]
                                                                          (<-
                                                                              (foldl
                                                                                  body
                                                                                      (rev args [])
                                                                                      (fn [body arg] (tapp (tapp (tcon "->" l) arg l) body l)))))
        (cst/list [(cst/id "rec" _) (cst/id name nl) inner] l)        (let-> [inner (parse-type inner)] (<- (trec name nl inner l)))
        (cst/list [(cst/id "," cl) ..items] l)                        (let-> [items (map-> parse-type items)]
                                                                          (<-
                                                                              (loop
                                                                                  items
                                                                                      (fn [items recur]
                                                                                      (match items
                                                                                          []           (fatal "invalid empty tuple")
                                                                                          [one]        one
                                                                                          [one ..rest] (tapp (tapp (tcon "," cl) one l) (recur rest) l))))))
        (cst/list items l)                                            (let-> [items (map-> parse-type items)] (<- (tapps (rev items []) l)))
        _                                                             (<-err
                                                                          (,
                                                                              (cst-loc type)
                                                                                  "(parse-type) Invalid type ${(valueToString type)}")
                                                                              (tcon "()" (cst-loc type)))))

(,
    (fn [x] (run/nil-> (parse-type x)))
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
        (@@ (fn [x] oops and))
            (tapp
            (tapp (tcon "->" 17563) (tcon "x" 17592) 17563)
                (tcon "oops" 17567)
                17563))
        (,
        (@@ (, a b c))
            (tapp
            (tapp (tcon "," 19030) (tcon "a" 19031) 19029)
                (tapp
                (tapp (tcon "," 19030) (tcon "b" 19032) 19029)
                    (tcon "c" 19033)
                    19029)
                19029))])

(defn parse-pat [pat]
    (match pat
        (cst/id "_" l)                         (<- (pany l))
        (cst/id "true" l)                      (<- (pprim (pbool true l) l))
        (cst/id "false" l)                     (<- (pprim (pbool false l) l))
        (cst/string first [] l)                (<- (pstr first l))
        (cst/id id l)                          (<-
                                                   (match (string-to-int id)
                                                       (some int) (pprim (pint int l) l)
                                                       _          (match (parse-tag id)
                                                                      (some t) (penum t l none l)
                                                                      _        (pvar id l))
                                                       ))
        (cst/array [] l)                       (<- (pcon "nil" -1 [] l))
        (cst/array [(cst/spread inner _)] _)   (parse-pat inner)
        (cst/array [one ..rest] l)             (let-> [
                                                   one  (parse-pat one)
                                                   rest (parse-pat (cst/array rest l))]
                                                   (<- (pcon "cons" -1 [one rest] l)))
        (cst/list [] l)                        (<- (pcon "()" -1 [] l))
        (cst/list [(cst/id "," il) ..args] l)  (parse-pat-tuple args il l)
        (cst/list [(cst/id name il) ..rest] l) (let-> [rest (map-> parse-pat rest)]
                                                   (match (parse-tag name)
                                                       (some tag) (<-
                                                                      (penum
                                                                          tag
                                                                              il
                                                                              (some
                                                                              (loop
                                                                                  rest
                                                                                      (fn [rest recur]
                                                                                      (match rest
                                                                                          []           (fatal "empty tag lol")
                                                                                          [one]        one
                                                                                          [one ..rest] (pcon "," il [one (recur rest)] l)))))
                                                                              l))
                                                       _          (<- (pcon name il rest l))))
        (cst/record items l)                   (let-> [
                                                   (, spread items) (loop
                                                                        items
                                                                            (fn [items recur]
                                                                            (match items
                                                                                []                         (<- (, none []))
                                                                                [(cst/spread last _)]      (let-> [last (parse-pat last)] (<- (, (some last) [])))
                                                                                [(cst/id id _) two ..rest] (let-> [
                                                                                                               (, last rest) (recur rest)
                                                                                                               two           (parse-pat two)]
                                                                                                               (<- (, last [(, id two) ..rest])))
                                                                                _                          (<-err (, l "Invalid record pat") (, none [])))
                                                                                ))]
                                                   (<- (precord items spread l)))
        _                                      (<-err
                                                   (, (cst-loc pat) "parse-pat mo match ${(valueToString pat)}")
                                                       (pany (cst-loc pat)))))

(defn parse-pat-tuple [items il l]
    (match items
        []           (<- (pcon "," -1 [] il))
        [one]        (parse-pat one)
        [one ..rest] (let-> [
                         one  (parse-pat one)
                         rest (parse-pat-tuple rest il l)]
                         (<- (pcon "," -1 [one rest] l)))))

(,
    (fn [x] (run/nil-> (parse-pat x)))
        [(,
        (@@ [1 2])
            (pcon
            "cons"
                -1
                [(pprim (pint 1 21907) 21907)
                (pcon
                "cons"
                    -1
                    [(pprim (pint 2 21908) 21908) (pcon "nil" -1 [] 21906)]
                    21906)]
                21906))
        (, (@@ {a 3}) (precord [(, "a" (pprim (pint 3 21950) 21950))] (none) 21948))
        (,
        (@@ {a 2 ..c})
            (precord
            [(, "a" (pprim (pint 2 22026) 22026))]
                (some (pvar "c" 22027))
                22024))
        (, (@@ 'hi) (penum "hi" 22075 (none) 22075))
        (, (@@ ('hi lol)) (penum "hi" 22091 (some (pvar "lol" 22092)) 22089))])

(defn parse-expr [cst]
    (match cst
        (cst/id "true" l)                                           (<- (eprim (pbool true l) l))
        (cst/id "false" l)                                          (<- (eprim (pbool false l) l))
        (cst/string first templates l)                              (let-> [
                                                                        tpls (map->
                                                                                 (fn [(, expr suffix l)]
                                                                                     (let-> [
                                                                                         expr (parse-expr expr)
                                                                                         ]
                                                                                         (<- (, expr suffix l))))
                                                                                     templates)]
                                                                        (<- (estr first tpls l)))
        (cst/id id l)                                               (<- (parse-id id l))
        (cst/list [(cst/id "@" _) body] l)                          (let-> [expr (parse-expr body)] (<- (equot (quot/expr expr) l)))
        (cst/list [(cst/id "@@" _) body] l)                         (<- (equot (quot/quot body) l))
        (cst/list [(cst/id "@!" _) body] l)                         (let-> [top (parse-top body)] (<- (equot (quot/top top) l)))
        (cst/list [(cst/id "@t" _) body] l)                         (let-> [body (parse-type body)] (<- (equot (quot/type body) l)))
        (cst/list [(cst/id "@p" _) body] l)                         (let-> [body (parse-pat body)] (<- (equot (quot/pat body) l)))
        (cst/list [(cst/id "if" _) cond yes no] l)                  (let-> [
                                                                        cond (parse-expr cond)
                                                                        yes  (parse-expr yes)
                                                                        no   (parse-expr no)]
                                                                        (<- (ematch cond [(, (pprim (pbool true l) l) yes) (, (pany l) no)] l)))
        (cst/list [(cst/id "fn" ll) (cst/array args _) ..rest]  b)  (let-> [
                                                                        args (map-> parse-pat args)
                                                                        body (parse-one-expr rest ll b)]
                                                                        (<- (elambda args body b)))
        (cst/list [(cst/id "fn" _) .._] l)                          (<-err (, l "Invalid 'fn' ${(int-to-string l)}") (evar "()" l))
        (cst/list [(cst/id "match" ml) target ..cases] l)           (let-> [
                                                                        target (parse-expr target)
                                                                        cases  (<- (pairs-plus (cst/id "()" ml) cases))
                                                                        cases  (map->
                                                                                   (fn [(, pat expr)]
                                                                                       (let-> [
                                                                                           pat  (parse-pat pat)
                                                                                           expr (parse-expr expr)]
                                                                                           (<- (, pat expr))))
                                                                                       cases)]
                                                                        (<- (ematch target cases l)))
        (cst/list [(cst/id "let" ll) (cst/array inits _) ..rest] l) (let-> [
                                                                        inits    (pairs inits)
                                                                        bindings (map->
                                                                                     (fn [(, pat value)]
                                                                                         (let-> [
                                                                                             pat   (parse-pat pat)
                                                                                             value (parse-expr value)]
                                                                                             (<- (, pat value))))
                                                                                         inits)
                                                                        body     (parse-one-expr rest ll l)]
                                                                        (<- (elet bindings body l)))
        (cst/list [(cst/id "let->" el) (cst/array inits _) body] l) (let-> [
                                                                        body  (parse-expr body)
                                                                        inits (pairs inits)]
                                                                        (foldr->
                                                                            body
                                                                                inits
                                                                                (fn [body (, pat value)]
                                                                                (let-> [
                                                                                    value (parse-expr value)
                                                                                    pat   (parse-pat pat)]
                                                                                    (<- (eapp (evar ">>=" el) [value (elambda [pat] body l)] l))))))
        (cst/list [(cst/id "let" _) .._] l)                         (<-err (, l "Invalid 'let' ${(int-to-string l)}") (evar "()" l))
        (cst/list [(cst/id "," il) ..args] l)                       (parse-tuple args il l)
        (cst/list [] l)                                             (<- (evar "()" l))
        (cst/list [target ..args] l)                                (match (match target
                                                                        (cst/id id _) (parse-tag id)
                                                                        _             none)
                                                                        (some tag) (let-> [args (map-> parse-expr args)]
                                                                                       (<-
                                                                                           (eenum
                                                                                               tag
                                                                                                   (cst-loc target)
                                                                                                   (some
                                                                                                   (loop
                                                                                                       args
                                                                                                           (fn [args recur]
                                                                                                           (match args
                                                                                                               []           (fatal "empty tag args")
                                                                                                               [one]        one
                                                                                                               [one ..rest] (eapp (evar "," l) [one (recur rest)] l)))))
                                                                                                   l)))
                                                                        _          (let-> [
                                                                                       target (parse-expr target)
                                                                                       args   (map-> parse-expr args)]
                                                                                       (<- (eapp target args l))))
        (cst/array args l)                                          (parse-array args l)
        (cst/access target items l)                                 (<- (eaccess target items l))
        (cst/record items l)                                        (let-> [
                                                                        (, spread items) (match items
                                                                                             [(cst/spread inner l) ..rest] (let-> [inner (parse-expr inner)] (<- (, (some inner) rest)))
                                                                                             _                             (<- (, none items)))
                                                                        (, items sprend) (loop
                                                                                             (, items [])
                                                                                                 (fn [(, items col) recur]
                                                                                                 (match items
                                                                                                     []                         (<- (, col none))
                                                                                                     [(cst/spread inner l)]     (let-> [inner (parse-expr inner)] (<- (, col (some inner))))
                                                                                                     [item]                     (<-err (, (cst-loc item) "Trailing record item") (, col none))
                                                                                                     [(cst/id id l) two ..rest] (let-> [value (parse-expr two)] (recur (, rest [(, id value) ..col])))
                                                                                                     [key _ ..rest]             (let-> [res (recur (, rest col))]
                                                                                                                                    (<-err (, (cst-loc key) "Not an identifier") res)))))
                                                                        spread           (match (, spread sprend)
                                                                                             (, (some _) (some _)) (<-err (, l "Cant have spreads on both sides") none)
                                                                                             (, (some s) _)        (<- (some (, s false)))
                                                                                             (, _ (some s))        (<- (some (, s true)))
                                                                                             _                     (<- none))]
                                                                        (<- (erecord spread (rev items []) l)))
        _                                                           (<-err (, (cst-loc cst) "Unable to parse") (evar "()" (cst-loc cst)))))

(defn parse-tuple [args il l]
    (match args
        []           (<- (evar "," il))
        [one]        (parse-expr one)
        [one ..rest] (let-> [
                         one   (parse-expr one)
                         tuple (parse-tuple rest il l)]
                         (<- (eapp (evar "," il) [one tuple] l)))))

(defn parse-array [args l]
    (match args
        []                     (<- (evar "nil" l))
        [(cst/spread inner _)] (parse-expr inner)
        [one ..rest]           (let-> [
                                   one  (parse-expr one)
                                   rest (parse-array rest l)]
                                   (<- (eapp (evar "cons" l) [one rest] l)))))

(,
    (fn [x] (run/nil-> (parse-expr x)))
        [(, (@@ true) (eprim (pbool true 1163) 1163))
        (, (@@ .abc) (eaccess (none) [(, "abc" 22113)] 22112))
        (, (@@ 'hi) (eenum "hi" 21779 (none) 21779))
        (,
        (@@ ('hi 12 2))
            (eenum
            "hi"
                21794
                (some
                (eapp
                    (evar "," 21793)
                        [(eprim (pint 12 21795) 21795) (eprim (pint 2 21796) 21796)]
                        21793))
                21793))
        (, (@@ {a 1}) (erecord (none) [(, "a" (eprim (pint 1 21835) 21835))] 21833))
        (,
        (@@ {..x y 2})
            (erecord
            (some (, (evar "x" 21859) false))
                [(, "y" (eprim (pint 2 21864) 21864))]
                21858))
        (,
        (@@ {y 2 ..x})
            (erecord
            (some (, (evar "x" 22387) true))
                [(, "y" (eprim (pint 2 22386) 22386))]
                22384))
        (,
        (@@ {x 1 y 2})
            (erecord
            (none)
                [(, "x" (eprim (pint 1 22423) 22423)) (, "y" (eprim (pint 2 22425) 22425))]
                22421))
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
        (, (@@ (@@ 1)) (equot (quot/quot (cst/id "1" 3110)) 3108))
        (, (@@ (@ 1)) (equot (quot/expr (eprim (pint 1 3124) 3124)) 3122))])

(defn mk-deftype [id li args items l]
    (let-> [
        args  (foldr->
                  []
                      args
                      (fn [args arg]
                      (match arg
                          (cst/id name l) (<- [(, name l) ..args])
                          _               (<-err (, l "deftype type argument must be identifier") args))))
        items (foldr->
                  []
                      items
                      (fn [res constr]
                      (match constr
                          (cst/list [(cst/id name ni) ..args] l) (let-> [args (map-> parse-type args)] (<- [(, name ni args l) ..res]))
                          (cst/list [] l)                        (<-err (, l "Empty type constructor") res)
                          _                                      (<-err (, l "Invalid type constructor") res))))]
        (<- (tdeftype id li args items l))))

(defn unexpected [msg cst] (<-err (, (cst-loc cst) msg) ()))

(defn eunit [l] (evar "()" l))

(defn sunit [k] (texpr (eunit k) k))

(defn parse-typealias [name body l]
    (let-> [
        (, name nl args) (<-
                             (match name
                                 (cst/id name nl)                       (, name nl [])
                                 (cst/list [(cst/id name nl) ..args] _) (, name nl args)
                                 _                                      (fatal "cant parse type alias")))
        args             (foldr->
                             []
                                 args
                                 (fn [args x]
                                 (match x
                                     (cst/id name l) (<- [(, name l) ..args])
                                     _               (<-err
                                                         (, (cst-loc x) "typealias type argument must be identifier")
                                                             args))))
        body             (parse-type body)]
        (<- (ttypealias name nl args body l))))

(defn parse-one-expr [rest ll l]
    (match rest
        [body ..rest] (let-> [() (do-> (unexpected "extra item body") rest)] (parse-expr body))
        []            (<-err (, ll "Missing body") (evar "()" l))))

(defn parse-id [id l]
    (if (is-earmuffs id)
        (eeffect id false l)
            (match (string-to-int id)
            (some int) (eprim (pint int l) l)
            (none)     (match (parse-tag id)
                           (some tag) (eenum tag l none l)
                           _          (evar id l)))))

(defn parse-top [cst]
    (match cst
        (cst/list [(cst/id "def" _) (cst/id id li) value ..rest] l)              (let-> [
                                                                                     expr (parse-expr value)
                                                                                     ()   (do-> (unexpected "extra items in def") rest)]
                                                                                     (<- (tdef id li expr l)))
        (cst/list [(cst/id "def" _) .._] l)                                      (<-err (, l "Invalid 'def'") (sunit l))
        (cst/list [(cst/id "defn" _) (cst/id id li)] c)                          (<- (tdef id li (evar "nil" c) c))
        (cst/list
            [(cst/id "defn" _) (cst/id id li) (cst/array args b) ..rest]
                c) (let-> [
                                                                                     args (map-> parse-pat args)
                                                                                     ()   (match args
                                                                                              [] (<-err (, b "Empty arguments list") ())
                                                                                              _  (<- ()))]
                                                                                     (match rest
                                                                                         []            (<- (tdef id li (evar "nil" c) c))
                                                                                         [body ..rest] (let-> [
                                                                                                           body (parse-expr body)
                                                                                                           ()   (do-> (unexpected "extra items in defn") rest)]
                                                                                                           (<- (tdef id li (elambda args body c) c)))))
        (cst/list [(cst/id "defn" _) .._] l)                                     (<-err (, l "Invalid 'defn'") (sunit l))
        (cst/list [(cst/id "deftype" _) name ..items] l)                         (match name
                                                                                     (cst/id id li)                       (mk-deftype id li [] items l)
                                                                                     (cst/list [(cst/id id li) ..args] _) (mk-deftype id li args items l)
                                                                                     _                                    (fatal "Cant parse deftype"))
        (cst/list [(cst/id "deftype" _) .._] l)                                  (<-err (, l "Invalid deftype") (sunit l))
        (cst/list [(cst/id "typealias" _) name body] l)                          (parse-typealias name body l)
        _                                                                        (let-> [expr (parse-expr cst)] (<- (texpr expr (cst-loc cst))))))

(parse-expr (@@ (fn [a] 1)))

(parse-expr (@@ (@! 12)))

(,
    (fn [x] (run/nil-> (parse-top x)))
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
            (deftype (list a)
                (nil)
                    (cons (list a))))
            (tdeftype
            "list"
                1486
                [(, "a" 1487)]
                [(, "nil" 1489 [] 1488)
                (, "cons" 1491 [(tapp (tcon "list" 1493) (tcon "a" 1494) 1492)] 1490)]
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

(** ## Debugging Helpers **)

(defn pat-loc [pat]
    (match pat
        (pany l)        l
        (pprim _ l)     l
        (pstr _ l)      l
        (pvar _ l)      l
        (pcon _ _ _ l)  l
        (precord _ _ l) l
        (penum _ _ _ l) l))

(defn cst-loc [cst]
    (match cst
        (cst/id _ l)       l
        (cst/list _ l)     l
        (cst/array _ l)    l
        (cst/spread _ l)   l
        (cst/string _ _ l) l
        (cst/access _ _ l) l
        (cst/record _ l)   l))

(defn expr-loc [expr]
    (match expr
        (estr _ _ l)     l
        (eprim _ l)      l
        (eeffect _ _ l)  l
        (eprovide _ _ l) l
        (evar _ l)       l
        (equot _ l)      l
        (elambda _ _ l)  l
        (elet _ _ l)     l
        (eapp _ _ l)     l
        (ematch _ _ l)   l
        (erecord _ _ l)  l
        (eenum _ _ _ l)  l
        (eaccess _ _ l)  l))

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

(** ## Dependency analysis **)

(deftype name-kind
    (value)
        (type))

(deftype (bag a)
    (one a)
        (many (list (bag a)))
        (empty))

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

(defn map-opt? [f v]
    (match v
        (some v) (f v)
        _        (none)))

(defn map-or [f or v]
    (match v
        (some v) (f v)
        _        or))

(defn pat-names [pat]
    (match pat
        (pany _)                    set/nil
        (pvar name l)               (set/add set/nil name)
        (pcon name nl args l)       (foldl
                                        set/nil
                                            args
                                            (fn [bound arg] (set/merge bound (pat-names arg))))
        (pstr string int)           set/nil
        (pprim prim int)            set/nil
        (precord fields spread int) (foldl
                                        (map-or pat-names set/nil spread)
                                            (map fields (dot pat-names snd))
                                            set/merge)
        (penum _ _ arg _)           (map-or pat-names set/nil arg)))

(defn pat-names-loc [pat]
    (match pat
        (pany _)                  empty
        (pvar name l)             (one (, name l))
        (pcon name nl args l)     (foldl
                                      (one (, name nl))
                                          args
                                          (fn [bound arg] (bag/and bound (pat-names-loc arg))))
        (pstr string int)         empty
        (pprim prim int)          empty
        (precord fields spread _) (foldl
                                      (map-or pat-names-loc empty spread)
                                          (map fields (dot pat-names-loc snd))
                                          bag/and)
        (penum _ _ arg _)         (map-or pat-names-loc empty arg)))

(defn pat-externals [pat]
    (match pat
        (** Soo this should be probably a (type)? Or rather, we should look up the corresponding type, and depend on that instead. **)
        (pcon name nl args l) (bag/and (one (, name (value) nl)) (many (map args pat-externals)))
        _                     empty))

(defn expr-type [expr]
    (match expr
        (eprim prim int)     "prim"
        (estr string _ int)  "str"
        (evar string int)    "var"
        (equot quot int)     "quot"
        (elambda _ expr int) "lambda"
        (eeffect _ _ _)      "effect"
        (eprovide _ _ _)     "provide"
        (eapp expr _ int)    "app"
        (elet _ expr int)    "let"
        (erecord _ _ _)      "record"
        (eenum _ _ _ _)      "enum"
        (eaccess _ _ _)      "access"
        (ematch expr _ int)  "match"))

(defn type-type [type]
    (match type
        (tapp _ _ _)   "app"
        (tvar _ _)     "var"
        (tcon _ _)     "con"
        (trec _ _ _ _) "rec"
        (trow _ _ _ _) "row"))

(defn fold-type [init type f]
    (let [v (f init type)]
        (match type
            (tapp target arg _) (fold-type (fold-type v target f) arg f)
            _                   v)))

(defn ,,0 [x] (let [(, a _ _) x] a))

(defn ,,1 [x] (let [(, _ a _) x] a))

(defn ,,2 [x] (let [(, _ _ a) x] a))

(defn map,,0 [f (, a b c)] (, (f a) b c))

(defn map,1 [f (, a b)] (, a (f b)))

dot

(defn loop [init f] (f init (fn [v] (loop v f))))

(defn locals-at-top [locs tl top]
    (match top
        (texpr exp _)    (locals-at locs tl exp)
        (tdef _ _ exp _) (locals-at locs tl exp)
        _                none))

(defn locals-at [locs tl expr]
    (match expr
        (eprim _ _)            none
        (estr _ tpls _)        (loop
                                   tpls
                                       (fn [tpls recur]
                                       (match tpls
                                           []                    none
                                           [(, expr _ _) ..rest] (match (locals-at locs tl expr)
                                                                     (some v) (some v)
                                                                     _        (recur rest)))))
        (evar _ l)             (if (= l tl)
                                   (some locs)
                                       none)
        (eeffect _ _ _)        none
        (eprovide _ _ _)       none
        (eaccess name _ _)     none
        (erecord _ _ _)        none
        (eenum _ _ _ _)        none
        (equot _ _)            none
        (elambda pats expr _)  (locals-at (bag/and (many (map pats pat-names-loc)) locs) tl expr)
        (eapp expr args _)     (match (locals-at locs tl expr)
                                   (some l) (some l)
                                   _        (loop
                                                args
                                                    (fn [args recur]
                                                    (match args
                                                        []           (none)
                                                        [arg ..args] (match (locals-at locs tl arg)
                                                                         (some v) (some v)
                                                                         _        (recur args))))))
        (elet bindings expr _) (loop
                                   (, bindings locs)
                                       (fn [(, bindings locs) recur]
                                       (match bindings
                                           []                    (locals-at locs tl expr)
                                           [(, pat init) ..rest] (let [locs (bag/and locs (pat-names-loc pat))]
                                                                     (match (locals-at locs tl init)
                                                                         (some v) (some v)
                                                                         _        (recur (, rest locs)))))))
        (ematch expr cases _)  (match (locals-at locs tl expr)
                                   (some l) (some l)
                                   _        (loop
                                                cases
                                                    (fn [cases recur]
                                                    (match cases
                                                        []                     (none)
                                                        [(, pat expr) ..cases] (match (locals-at (bag/and (pat-names-loc pat) locs) tl expr)
                                                                                   (some v) (some v)
                                                                                   _        (recur cases))))))))

(let [expr (@ (let [x 1] _))]
    (,
        (bag/to-list (expr/idents expr))
            (map-some bag/to-list (locals-at empty 18464 expr))))

(defn map-some [f v]
    (match v
        (some v) (some (f v))
        _        (none)))

(** ## Idents **)

(defn expr/idents [expr]
    (match expr
        (estr _ exprs _)        (many (map exprs (dot expr/idents ,,0)))
        (evar name l)           (one (, name l))
        (elambda pats expr l)   (many [(expr/idents expr) ..(map pats pat/idents)])
        (eapp target args _)    (many [(expr/idents target) ..(map args expr/idents)])
        (elet bindings body _)  (many
                                    [(expr/idents body)
                                        ..(map
                                        bindings
                                            (fn [(, pat exp)] (bag/and (pat/idents pat) (expr/idents exp))))])
        (ematch target cases _) (bag/and
                                    (expr/idents target)
                                        (many
                                        (map
                                            cases
                                                (fn [(, pat exp)] (bag/and (pat/idents pat) (expr/idents exp))))))
        _                       empty))

(defn pat/idents [pat]
    (match pat
        (pvar name l)         (one (, name l))
        ; TODO add loc for pcon ...
        (pcon name il pats l) (many [(one (, name il)) ..(map pats pat/idents)])
        _                     empty))

(defn top/idents [top]
    (match top
        (tdef name l body _)             (bag/and (one (, name l)) (expr/idents body))
        (texpr exp _)                    (expr/idents exp)
        (ttypealias name l args body _)  (bag/and (type/idents body) (many [(one (, name l)) ..(map args one)]))
        (tdeftype name l args constrs _) (bag/and
                                             (many
                                                 (map
                                                     constrs
                                                         (fn [(, name l args _)]
                                                         (bag/and (one (, name l)) (many (map args type/idents))))))
                                                 (bag/and (one (, name l)) (many (map args one))))))

(defn type/idents [type]
    (match type
        (tvar name l)            (one (, name l))
        (tapp target arg _)      (bag/and (type/idents target) (type/idents arg))
        (tcon name l)            (one (, name l))
        (trec name nl inner l)   (many [(one (, name nl)) (type/idents inner)])
        (trow fields spread _ l) (foldl
                                     (map-or (type/idents) empty spread)
                                         (map fields (dot type/idents snd))
                                         bag/and)))

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

(defn ,,,2 [x] (let [(, _ _ x _) x] x))

(defn top-size [top]
    (+
        1
            (match top
            (tdef _ _ expr _)               (expr-size expr)
            (texpr expr _)                  (expr-size expr)
            (ttypealias _ _ _ type _)       (type-size type)
            (tdeftype _ _ _ constructors _) (foldl
                                                0
                                                    constructors
                                                    (fn [v const] (foldl v (map (,,,2 const) type-size) +))))))

(defn externals [bound expr]
    (match expr
        (evar name l)             (match (set/has bound name)
                                      true empty
                                      _    (one (, name (value) l)))
        (eprim prim l)            empty
        (eeffect _ _ _)           empty
        (eprovide target cases _) (foldl
                                      (externals bound target)
                                          (map
                                          cases
                                              (fn [(, k name nl pats body)]
                                              (foldl
                                                  (externals (foldl bound (map pats pat-names) set/merge) body)
                                                      (map pats pat-externals)
                                                      bag/and)))
                                          bag/and)
        (eenum _ _ arg _)         (map-or (externals bound) empty arg)
        (erecord spread fields _) (foldl
                                      (map-or (dot (externals bound) fst) empty spread)
                                          (map fields (dot (externals bound) snd))
                                          bag/and)
        (eaccess target _ _)      (match target
                                      (none)         empty
                                      (some (, v l)) (if (set/has bound v)
                                                         empty
                                                             (one (, v (value) l))))
        (estr first templates l)  (many
                                      (map
                                          templates
                                              (fn [arg]
                                              (match arg
                                                  (, expr _ _) (externals bound expr)))))
        (equot expr l)            empty
        (elambda pats body l)     (bag/and
                                      (foldl empty (map pats pat-externals) bag/and)
                                          (externals (foldl bound (map pats pat-names) set/merge) body))
        (elet bindings body l)    (bag/and
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
        (eapp target args l)      (bag/and
                                      (externals bound target)
                                          (foldl empty (map args (externals bound)) bag/and))
        (ematch expr cases l)     (bag/and
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
        [(, (run/nil-> (parse-expr (@@ hi))) [(, "hi" (value) 7036)])
        (, (run/nil-> (parse-expr (@@ [1 2 c]))) [(, "c" (value) 7052)])
        (,
        (run/nil-> (parse-expr (@@ (one two three))))
            [(, "one" (value) 7066) (, "two" (value) 7067) (, "three" (value) 7068)])])

(defn externals-type [bound t]
    (match t
        (tvar _ _)               empty
        (tcon name l)            (match (set/has bound name)
                                     true empty
                                     _    (one (, name (type) l)))
        (trec _ _ inner l)       (externals-type bound inner)
        (tapp one two _)         (bag/and (externals-type bound one) (externals-type bound two))
        (trow fields spread _ _) (foldl
                                     (map-or (externals-type bound) empty spread)
                                         (map fields (dot (externals-type bound) snd))
                                         bag/and)))

(defn names [top]
    (match top
        (tdef name l _ _)                  [(, name (value) l)]
        (texpr _ _)                        []
        (ttypealias name l _ _ _)          [(, name (type) l)]
        (tdeftype name l _ constructors _) [(, name (type) l)
                                               ..(map
                                               constructors
                                                   (fn [arg]
                                                   (match arg
                                                       (, name l _ _) (, name (value) l))))]))

(defn externals-top [top]
    (bag/to-list
        (match top
            (tdeftype string _ free constructors _) (let [frees (set/from-list (map free fst))]
                                                        (many
                                                            (map
                                                                constructors
                                                                    (fn [constructor]
                                                                    (match constructor
                                                                        (, name l args _) (match args
                                                                                              [] empty
                                                                                              _  (many (map args (externals-type frees)))))))))
            (ttypealias name _ args body _)         (let [frees (set/from-list (map args fst))]
                                                        (externals-type frees body))
            (tdef name _ body _)                    (externals (set/add set/nil name) body)
            (texpr expr _)                          (externals set/nil expr))))

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
        (evar name l)             (expr/var-name bound name l)
        (eprim _ _)               empty
        (equot _ _)               empty
        (eprovide target cases _) (foldl
                                      (expr/names bound target)
                                          (map
                                          cases
                                              (fn [(, k name nl pats body)]
                                              (let [
                                                  (, bound' names') (foldl (, [] empty) (map pats pat/names) bound-and-names)]
                                                  (bag/and
                                                      (expr/names (map/merge bound (map/from-list bound')) body)
                                                          names'))))
                                          bag/and)
        (eeffect _ _ _)           empty
        (eaccess target _ l)      (match target
                                      (none)         empty
                                      (some (, v l)) (expr/var-name bound v l))
        (erecord spread fields l) (foldl
                                      (map-or (dot (expr/names bound) fst) empty spread)
                                          (map fields (dot (expr/names bound) snd))
                                          bag/and)
        (eenum _ _ arg _)         (map-or (expr/names bound) empty arg)
        (eapp target args _)      (foldl
                                      (expr/names bound target)
                                          (map args (expr/names bound))
                                          bag/and)
        (elambda args body _)     (let [
                                      (, bound' names) (foldl (, [] empty) (map args pat/names) bound-and-names)]
                                      (bag/and
                                          names
                                              (expr/names (map/merge bound (map/from-list bound')) body)))
        (elet bindings body _)    (loop
                                      (, bindings bound empty)
                                          (fn [(, bindings bound names) recur]
                                          (match bindings
                                              []                    (bag/and names (expr/names bound body))
                                              [(, pat expr) ..rest] (let [
                                                                        (, bound' names') (pat/names pat)
                                                                        bound             (map/merge bound (map/from-list bound'))
                                                                        names             (bag/and names names')]
                                                                        (recur (, rest bound (bag/and names (expr/names bound expr))))))))
        (ematch target cases _)   (foldl
                                      (expr/names bound target)
                                          (map
                                          cases
                                              (fn [(, pat body)]
                                              (let [
                                                  (, bound' names') (pat/names pat)
                                                  bound             (map/merge bound (map/from-list bound'))]
                                                  (bag/and names' (expr/names bound body)))))
                                          bag/and)
        (estr _ tpls _)           (many (map tpls (fn [(, expr _ _)] (expr/names bound expr))))))

(defn pat/names [pat]
    (match pat
        (pany _)                  (, [] empty)
        (pvar name l)             (, [(, name l)] (one (local l (decl))))
        (pprim _ _)               (, [] empty)
        (pstr _ _)                (, [] empty)
        (penum _ _ arg l)         (map-or pat/names (, [] empty) arg)
        (precord fields spread l) (foldl
                                      (map-or pat/names (, [] empty) spread)
                                          (map fields (dot pat/names snd))
                                          bound-and-names)
        (pcon name nl args l)     (foldl
                                      (, [] (one (global name (value) l (usage ()))))
                                          (map args pat/names)
                                          bound-and-names)))

(def bound-and-names
    (fn [(, bound names) (, bound' names')]
        (, (concat [bound bound']) (bag/and names names'))))

(defn type/names [free body]
    (match body
        (tvar name l)            (match (map/get free name)
                                     (some dl) (one (local l (usage dl)))
                                     _         empty)
        (tcon name l)            (one (global name (type) l (usage ())))
        (trec name nl inner l)   (type/names (map/set free name nl) inner)
        (trow fields spread _ l) (foldl
                                     (map-or (type/names free) empty spread)
                                         (map fields (dot (type/names free) snd))
                                         bag/and)
        (tapp target arg _)      (bag/and (type/names free target) (type/names free arg))))

(defn expr/var-name [bound name l]
    (match (map/get bound name)
        (some dl) (one (local l (usage dl)))
        (none)    (one (global name (value) l (usage ())))))

(,
    (fn [top] (bag/to-list (top/names top)))
        [(, (@! hi) [(global "hi" (value) 19959 (usage ()))])
        (, (@! (let [x 10] x)) [(local 19978 (decl)) (local 19980 (usage 19978))])
        (,
        (@!
            (match 10
                a (+ 2 a)))
            [(local 20000 (decl))
            (global "+" (value) 20002 (usage ()))
            (local 20004 (usage 20000))])])

(** ## Export **)

(typealias parse-error (, int string))

(deftype parse-and-compile
    (parse-and-compile
        (fn [cst] (, (list parse-error) top))
            (fn [cst] (, (list parse-error) expr))
            (fn [top type (map int bool)] string)
            (fn [expr type (map int bool)] string)
            (fn [top] (list (, string name-kind int)))
            (fn [top] (list (, string name-kind int)))
            (fn [expr] (list (, string name-kind int)))
            (fn [top] int)
            (fn [expr] int)
            (fn [type] int)
            (fn [int top] (list (, string int)))))

(defn provide-empty-effects [jexp]
    (j/app (j/lambda [(j/pvar "$lbeffects$rb" -1)] jexp -1) [(j/obj [] -1)] -1))

((eval
    "({0: parse_stmt2,  1: parse_expr2, 2: compile_stmt2, 3: compile2, 4: names, 5: externals_stmt, 6: externals_expr, 7: stmt_size, 8: expr_size, 9: type_size, 10: locals_at}) => all_names => builtins => ({\ntype: 'fns', parse_stmt2, parse_expr2, compile_stmt2, compile2, names, externals_stmt, externals_expr, stmt_size, expr_size, type_size, locals_at, all_names, builtins})")
    (parse-and-compile
        (fn [top] (state-f (parse-top top) state/nil))
            (fn [expr] (state-f (parse-expr expr) state/nil))
            (fn [top type-info ctx]
            (let [
                top (match type-info
                        (tvar _ _) top
                        _          (match top
                                       (texpr e l) (texpr (elambda [(pany -1)] e l) l)
                                       _           (fatal "non-expr has unbound effects??")))]
                (j/compile-stmts
                    ctx
                        (map (compile-top/j top ctx) (map/stmt simplify-js)))))
            (fn [expr type-info ctx]
            (let [
                expr (match type-info
                         (tvar _ _) expr
                         _          (elambda [(pany -1)] expr -1))]
                (j/compile
                    ctx
                        (provide-empty-effects
                        (right (map/expr simplify-js (compile/j expr ctx)))))))
            names
            externals-top
            (fn [expr] (bag/to-list (externals set/nil expr)))
            top-size
            expr-size
            type-size
            (fn [tl top]
            (match (locals-at-top empty tl top)
                (some v) (bag/to-list v)
                _        [])))
        (fn [top] (bag/to-list (top/names top)))
        builtins)

537