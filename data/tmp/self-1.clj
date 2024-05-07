(** ## Self-Hosted Code Generation **)

(** So the tree-walking interpreter was very simple to implement, but it's extremely slow 😴 So for the self-hosted compiler, we'll be doing code generation! It'll speed up execution of the parser & code generator by a factor of 10-20x!
    We're still going for simplicity though, so our compilation target will be JavaScript :). With automatic garbage collection, flexible objects, and permissive type system, not to mention the excellent in-browser debugging tools, JavaScript makes for a very forgiving compilation target.
    Maybe later we'll implement code generation for something a little closer to the metal, like chicken scheme cough I mean golang. **)

(** ## Prelude **)

(defn join [sep items]
    (match items
        []           ""
        [one ..rest] (match rest
                         [] one
                         _  "${one}${sep}${(join sep rest)}")))

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

(deftype (list a) (nil) (cons a (list a)))

(defn concat [lsts]
    (match lsts
        []                    []
        [one]                 one
        [[] ..rest]           (concat rest)
        [[one ..rest] ..lsts] [one ..(concat [rest ..lsts])]))

(defn indices [lst] (mapi 0 lst (fn [i _] i)))

(deftype (option a) (some a) (none))

(** ## Our AST **)

(** We saw this before in the bootstrap, so feel free to skip. It's included here for completeness, and because the code wouldn't run without it 😉. **)

(deftype expr
    (** the trailing int on each constructor is a unique id **)
        (eprim prim int)
        (** estr: prefix, template-pairs. All strings are template strings in our language :)
        So "Hello ${world}!" would parse into
        (estr "Hello" [(,, (evar "world") "!" 1234)])
        template-pairs is a list of expression and suffix (with a unique ID for the string tacked on) **)
        (estr string (list (, expr string int)) int)
        (** evar: a variable reference! might be local or global **)
        (evar string int)
        (** equot: this form allows embedding of the CST or AST into the runtime, which makes writing tests for our parsers, compilers, and type checkers much simpler. **)
        (equot quot int)
        (** elambda: args, body, parsed from the form (fn [arg1 arg2] body). **)
        (elambda (list pat) expr int)
        (** eapp: target, args **)
        (eapp expr (list expr) int)
        (** elet: bindings, body **)
        (elet (list (, pat expr)) expr int)
        (** ematch: target, cases **)
        (ematch expr (list (, pat expr)) int))

(deftype quot
    (quot/expr expr)
        (quot/stmt stmt)
        (quot/type type)
        (quot/pat pat)
        (quot/quot cst))

(deftype cst
    (cst/identifier string int)
        (cst/list (list cst) int)
        (cst/array (list cst) int)
        (cst/record (list cst) int)
        (cst/spread cst int)
        (cst/string string (list (, cst string int)) int))

(deftype prim (pint int int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pprim prim int)
        (pstr string int)
        (pcon string int (list pat) int))

(deftype type
    (tvar string int)
        (tapp type type int)
        (tcon string int))

(deftype stmt
    (sdeftype
        string
            int
            (list (, string int))
            (list (, string (list type) int))
            int)
        (sdef string int expr int)
        (sexpr expr int)
        (stypealias))

(** ## Statements **)

(defn compile-st [stmt]
    (match stmt
        (sexpr expr _)              (compile expr)
        (sdef name _ body _)        "const ${(sanitize name)} = ${(compile body)};\n"
        (sdeftype name _ _ cases _) (join
                                        "\n"
                                            (map
                                            cases
                                                (fn [case]
                                                (let [
                                                    (, name _ args _) case
                                                    arrows            (join "" (map (indices args) (fn [i] "(v${(int-to-string i)}) => ")))
                                                    body              (constructor-fn
                                                                          name
                                                                              (map (indices args) (fn [i] "v${(int-to-string i)}")))]
                                                    "const ${(sanitize name)} = ${arrows}${body}"))))
        (stypealias)                "/* type alias */"))

(defn constructor-fn [name args]
    "({type: \"${name}\"${(join "" (mapi 0 args (fn [i arg] ", ${(int-to-string i)}: ${arg}")))}})")

(,
    (fn [(, name args)] (constructor-fn name args))
        [(, (, "nil" []) "({type: \"nil\"})")
        (, (, "cons" ["10" "a"]) "({type: \"cons\", 0: 10, 1: a})")])

(** ## Patterns, done worse **)

(** This is a naive method of compiling patterns to javascript, which results in a ton of nested if statements. **)

(defn compile-pat-naive [pat target inner]
    (match pat
        (pany _)             inner
        (pprim prim _)       "if (${target} === ${(compile-prim prim)}) {\n${inner}\n}"
        (pstr str _)         "if (${target} === \"${str}\"){\n${inner}\n}"
        (pvar name _)        "{\nlet ${(sanitize name)} = ${target};\n${inner}\n}"
        (pcon name _ args _) "if (${target}.type === \"${name}\") {\n${(pat-loop target args 0 inner)}\n}"))

(defn pat-loop [target args i inner]
    (match args
        []           inner
        [arg ..rest] (compile-pat-naive
                         arg
                             "${target}[${(int-to-string i)}]"
                             (pat-loop target rest (+ i 1) inner))))

(** ## Patterns **)

(** By collecting all of the checks and assignments produced by a deeply nested pattern, we can then produce a single if statement (if there are any checks) with a single block of assignments (if needed). **)

(defn compile-pat-list [pat target]
    (match pat
        (pany _)             (, [] [])
        (pprim prim _)       (, ["${target} === ${(compile-prim prim)}"] [])
        (pstr str _)         (, ["${target} === \"${str}\""] [])
        (pvar name _)        (, [] ["let ${(sanitize name)} = ${target};"])
        (pcon name _ args _) (let [(, check assign) (pat-loop-list target args 0)]
                                 (, ["${target}.type === \"${name}\"" ..check] assign))))

(,
    (fn [pat] (compile-pat-list pat "v"))
        [(, (@p hi) (, [] ["let hi = v;"]))
        (, (@p _) (, [] []))
        (,
        (@p [1 (lol "hi" x) 23 ..rest])
            (,
            ["v.type === \"cons\""
                "v[0] === 1"
                "v[1].type === \"cons\""
                "v[1][0].type === \"lol\""
                "v[1][0][0] === \"hi\""
                "v[1][1].type === \"cons\""
                "v[1][1][0] === 23"]
                ["let x = v[1][0][1];" "let rest = v[1][1][1];"]))])

(defn pat-loop-list [target args i]
    (match args
        []           (, [] [])
        [arg ..rest] (let [
                         (, check assign) (compile-pat-list arg "${target}[${(int-to-string i)}]")
                         (, c2 a2)        (pat-loop-list target rest (+ i 1))]
                         (, (concat [check c2]) (concat [assign a2])))))

(defn compile-pat [pat target inner]
    (let [
        (, check assign) (compile-pat-list pat target)
        inner            (match assign
                             [] inner
                             _  "{\n${(join "\n" assign)}\n${inner}\n}")
        inner            (match check
                             [] inner
                             _  "if (${(join " &&\n" check)}) {\n${inner}\n}")]
        inner))

(,
    (fn [pat] (compile-pat pat "v" "// evaluation continues"))
        [(, (@p _) "// evaluation continues")
        (,
        (@p name)
            "{\nlet name = v;\n// evaluation continues\n}")
        (,
        (@p [2 3 x (lol 2 y)])
            "if (v.type === \"cons\" &&\nv[0] === 2 &&\nv[1].type === \"cons\" &&\nv[1][0] === 3 &&\nv[1][1].type === \"cons\" &&\nv[1][1][1].type === \"cons\" &&\nv[1][1][1][0].type === \"lol\" &&\nv[1][1][1][0][0] === 2 &&\nv[1][1][1][1].type === \"nil\") {\n{\nlet x = v[1][1][0];\nlet y = v[1][1][1][0][1];\n// evaluation continues\n}\n}")])

((** pat-as-arg turns a pattern into a valid "javascript l-value", that could be on the left-hand side of an assignment, or as a function argument. **)
    defn pat-as-arg [pat]
    (match (pat-as-arg-inner pat)
        (none)     "_"
        (some arg) arg))

(defn pat-as-arg-inner [pat]
    (match pat
        (pany _)          none
        (pprim _ _)       none
        (pstr _ _)        none
        (pvar name _)     (some (sanitize name))
        (pcon _ _ args _) (match (foldl
                              (, 0 [])
                                  args
                                  (fn [(, i res) arg]
                                  (,
                                      (+ i 1)
                                          (match (pat-as-arg-inner arg)
                                          (none)     res
                                          (some arg) ["${(int-to-string i)}: ${arg}" ..res]))))
                              (, _ [])   none
                              (, _ args) (some "{${(join ", " args)}}"))
        _                 (fatal "No pat ${(jsonify pat)}")))

(,
    pat-as-arg-inner
        [(, (@p (, a _)) (some "{0: a}"))
        (, (@p _) (none))
        (, (@p [a 2 ..rest]) (some "{1: {1: rest}, 0: a}"))
        (, (@p arg) (some "arg"))
        (, (@p case) (some "$case"))])

(** ## Expressions **)

(** ## String escape utils **)

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

(defn fix-slashes [str] (escape-string (unescapeString str)))

(,
    fix-slashes
        [(, "\n" "\\n") (, "\\n" "\\n") (, "\\\n" "\\\\\\n") (, "\"" "\\\"")])

(defn with-parens [expr]
    (maybe-parens (compile expr) (needs-parens expr)))

(defn maybe-parens [inner parens]
    (if parens
        "(${inner})"
            inner))

(defn needs-parens [expr]
    (match expr
        (elambda _ _ _) true
        (eprim _ _)     true
        _               false))

(,
    (fn [x] x)
        [(,
        (@! (deftype (a b) (c b)))
            (sdeftype "a" 6438 [(, "b" 6439)] [(, "c" 6441 [(tcon "b" 6442)] 6440)] 6433))
        (, (@ x) (evar "x" 6483))])

(defn compile-quot [quot]
    (match quot
        (quot/quot x) (jsonify x)
        (quot/expr x) (jsonify x)
        (quot/stmt x) (jsonify x)
        (quot/pat x)  (jsonify x)
        (quot/type x) (jsonify x)))

(defn compile-prim [prim]
    (match prim
        (pint int _)   (int-to-string int)
        (pbool bool _) (match bool
                           true  "true"
                           false "false")))

(defn compile [expr]
    (match expr
        (** Simple strings are compiled as "" normal js strings, and template strings are compiled with back-ticks. **)
        (estr first tpls _)     (match tpls
                                    [] "\"${(fix-slashes first)}\""
                                    _  (let [
                                           tpls (map
                                                    tpls
                                                        (fn [item]
                                                        (let [(, expr suffix _) item]
                                                            "${${(compile expr)}}${(fix-slashes suffix)}")))
                                           ]
                                           "`${(fix-slashes first)}${(join "" tpls)}`"))
        (eprim prim _)          (compile-prim prim)
        (evar name _)           (sanitize name)
        (equot inner _)         (compile-quot inner)
        (** Curried functions **)
        (elambda pats body _)   (foldr
                                    (compile body)
                                        pats
                                        (fn [body pat] "(${(pat-as-arg pat)}) => ${body}"))
        (** Let bindings are compiled as function application. This does mean we don't support recursive let bindings in this implementation. We're doing this to avoid having to reason about javascript's "statement vs expression" split; e.g. in our language, let is an expression, whereas in javascript it's a statement. We'll get more sophisticated about this later on, when we compile to a JavaScript AST.
            let x = y in z -> ((x) => z)(y) **)
        (elet bindings body _)  (foldr
                                    (compile body)
                                        bindings
                                        (fn [body (, pat init)]
                                        "((${(pat-as-arg pat)}) => ${body})(${(compile init)})"
                                            ))
        (** Curried application. (a b c) -> a(b)(c) **)
        (eapp f args _)         (foldl
                                    (with-parens f)
                                        args
                                        (fn [target arg] "${target}(${(compile arg)})"))
        (** Match is the most complex form to compile. compile-pat produces a block of code which, if the pattern matches, will return. So we wrap our cases in a lambda, and call it with the target of the match. If none of the cases trigger, then we throw an exception. **)
        (ematch target cases _) (let [
                                    cases (map
                                              cases
                                                  (fn [case]
                                                  (let [(, pat body) case]
                                                      (compile-pat pat "$target" "return ${(compile body)}"))))
                                    ]
                                    "(($target) => {\n${(join "\n" cases)}\nthrow new Error('Failed to match. ' + valueToString($target));\n})(${(compile target)})")))

(compile
    (@
        (fn [value]
            (if (< 10 value)
                "yes"
                    "no"))))

(,
    (fn [v] (eval (compile v)))
        [(, (@ 1) 1)
        (, (@ "hello") "hello")
        (, (@ (+ 2 3)) 5)
        (, (@ (@ 1)) (eprim (pint 1 5354) 5354))
        (,
        (@
            (match []
                []         "any"
                [name .._] name))
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
        (** Testing some weird string edge cases **)
        (, (@ "`${1}") "`1")
        (, (@ "${${1}") "${1")
        (, (@ "${${"a}"}") "${a}")])

(eval
    (** compile => compile_stmt => ({type:'fns',compile: a => _ => compile(a), compile_stmt: a => _ => compile_stmt(a)}) **)
        compile
        compile-st)