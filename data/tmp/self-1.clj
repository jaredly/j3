(** ## Builtins **)

(def builtins
    (** const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', 
'>': '$gt', '<': '$lt', "'": '$qu', '"': '$dq', ',': '$co', '@': '$at', '/': '$sl'};

const kwds = 'case var else const let var new if return default break while for super'.split(' ');
const sanitize = (raw) => { if (raw == null) debugger;
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    if (kwds.includes(raw)) {
      raw = '$' + raw;
    }
    return raw;
};
const jsonify = (raw) => JSON.stringify(raw);
const string_to_int = (a) => {
    var v = parseInt(a);
    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}
    return {type: 'none'}
}

const unwrapList = (v) => {
    if (!v) debugger
    return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])]
};
const $eq = (a) => (b) => a == b;
const fatal = (e) => {throw new Error(e)}
const nil = { type: 'nil' };
const cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });
const $pl$pl = (items) => unwrapList(items).join('');
const $pl = (a) => (b) => a + b;
const _ = (a) => (b) => a - b;
const int_to_string = (a) => a + '';
const replace_all = (a) => (b) => (c) => {
    return a.replaceAll(b, c);
};

const unescapeString = (text) => text.replace(/\\\\./g, (matched) => {
    if (matched[1] === 'n') {
        return '\\n';
    }
    if (matched[1] === 't') return '\\t';
    if (matched[1] === 'r') return '\\r';
    return matched[1];
});
const $co = (a) => (b) => ({ type: ',', 0: a, 1: b });
const reduce = (init) => (items) => (f) => {
    return unwrapList(items).reduce((a, b) => f(a)(b), init);
}; **))

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

(** ## Our AST (provided by the bootstrap) **)

(deftype expr
    (** the trailing int on each constructor is a unique id **)
        (eprim prim int)
        (** estr: prefix, template-pairs. All strings are template strings in our language :)
        So "Hello ${world}!" would parse into
        (estr "Hello" [(,, (evar "world") "!" 1234)])
        template-pairs is a list of expression and suffix (with a unique ID for the string tacked on) **)
        (estr string (list (,, expr string int)) int)
        (** evar: a variable reference! might be local or global **)
        (evar string int)
        (** equot: this form allows embedding of the CST or AST into the runtime, which makes writing tests for our parsers, compilers, and type checkers much simpler. **)
        (equot quot int)
        (** elambda: args, body , parsed from the form (fn [arg1 arg2] body). **)
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
        (cst/string string (list (,, cst string int)) int))

(deftype prim (pint int) (pbool bool))

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
    (sdeftype string (list (,, string (list type) int)) int)
        (sdef string expr int)
        (sexpr expr int))

(** ## Compilation **)

(defn +++ [items]
    (match items
        []           ""
        [one]        one
        [one ..rest] "${one}${(+++ rest)}"))

(defn literal-constr [name args]
    (+++
        ["({type: \""
            name
            "\""
            (+++ (mapi 0 args (fn [i arg] ", ${(int-to-string i)}: ${arg}")))
            "})"]))

(literal-constr "cons" ["0"])

(def x 123)

(mapi 0 ["0"] (fn [i arg] arg))

(defn compile-st [stmt]
    (match stmt
        (sexpr expr _)          (compile expr)
        (sdef name body _)      (+++ ["const " (sanitize name) " = " (compile body) ";\n"])
        (sdeftype name cases _) (join
                                    "\n"
                                        (map
                                        cases
                                            (fn [case]
                                            (let [(,, name2 args loc) case]
                                                (+++
                                                    ["const "
                                                        (sanitize name2)
                                                        " = "
                                                        (+++ (mapi 0 args (fn [i _] (+++ ["(v" (int-to-string i) ") => "]))))
                                                        "({type: \""
                                                        name2
                                                        "\""
                                                        (+++
                                                        (mapi
                                                            0
                                                                args
                                                                (fn [i _] (+++ [", " (int-to-string i) ": v" (int-to-string i)]))))
                                                        "});"])))))))

(** ## Some more utils **)

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
    (replaces string [(, "\\n" "\n") (, "\\\\" "\\") (, "\\\"" "\"")]))

(unescape-string "\\n")

(escape-string "\\n")

"\\n"

"\\"

"\\"

(unescape-string (escape-string "\\n"))

"\n"

"\\n"

(escape-string "\n")

(defn pat-loop [target args i inner]
    (match args
        []           inner
        [arg ..rest] (compile-pat
                         arg
                             "${target}[${(int-to-string i)}]"
                             (pat-loop target rest (+ i 1) inner))))

(map [] +)

(join "" [])

(defn compile-pat [pat target inner]
    (match pat
        (pany _)             inner
        (pprim prim _)       (match prim
                                 (pint int)   "if (${target} === ${(int-to-string int)}) {\n${inner}\n}"
                                 (pbool bool) "if (${target} === ${(if bool
                                                  "true"
                                                      "false")}) {\n${inner}\n}")
        (pstr str _)         "if (${target} === \"${str}\"){\n${inner}\n}"
        (pvar name _)        "{\nlet ${(sanitize name)} = ${target};\n${inner}\n}"
        (pcon name _ args _) "if (${target}.type === \"${name}\") {\n${(pat-loop target args 0 inner)}\n}"))

(compile-pat (@p (cons 2 (cons (lol 2) nil))) "$target" "lol")

compile-pat

compile-pat

(deftype (option a) (some a) (none))

(defn pat-as-arg [pat]
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
                                          (match (pat-as-arg arg)
                                          (none)     res
                                          (some arg) ["${(int-to-string i)}: ${arg}" ..res]))))
                              (, _ [])   none
                              (, _ args) (some "{${(join ", " args)}}"))
        _                 (fatal "No pat ${(jsonify pat)}")))

(pat-as-arg (@p (, a _)))

pat-as-arg

(pat-as-arg (@p [_ ..rest]))

(compile-pat (pvar "case" 1) "a" "lol")

(compile
    (@
        (match 2
            1 2)))

(defn maybe-parens [inner parens]
    (if parens
        "(${inner})"
            inner))

(defn needs-parens [expr]
    (match expr
        (elambda _ _ _) true
        (eprim _ _)     true
        _               false))

(defn with-parens [expr]
    (maybe-parens (compile expr) (needs-parens expr)))

(defn compile [expr]
    (match expr
        (estr first tpls _)     (match tpls
                                    [] "\"${(escape-string (unescapeString first))}\""
                                    _  "`${(escape-string (unescapeString first))}${(join
                                           ""
                                               (map
                                               tpls
                                                   (fn [item]
                                                   (let [(,, expr suffix _) item]
                                                       "${${(compile expr)}}${(escape-string (unescape-string suffix))}"))))}`")
        (eprim prim _)          (match prim
                                    (pint int)   (int-to-string int)
                                    (pbool bool) (match bool
                                                     true  "true"
                                                     false "false"))
        (evar name _)           (sanitize name)
        (equot inner _)         (jsonify inner)
        (elambda pats body _)   (foldr
                                    (compile body)
                                        pats
                                        (fn [body pat]
                                        (++
                                            ["("
                                                (match (pat-as-arg pat)
                                                (some arg) arg
                                                _          "_")
                                                ") => "
                                                body])))
        (elet bindings body _)  (foldr
                                    (compile body)
                                        bindings
                                        (fn [body (, pat init)]
                                        "((${(match (pat-as-arg pat)
                                            (some v) v
                                            _        "_")}) => ${body})(${(compile init)})"
                                            ))
        (eapp f args _)         (foldl
                                    (with-parens f)
                                        args
                                        (fn [target arg] "${target}(${(compile arg)})"))
        (ematch target cases _) "(($target) => {${(join
                                    "\n"
                                        (map
                                        cases
                                            (fn [case]
                                            (let [(, pat body) case]
                                                (compile-pat pat "$target" "return ${(compile body)}")))))}\nthrow new Error('Failed to match. ' + valueToString($target))})(${(compile target)})"))

(defn run [v] (eval (compile v)))

"\""

"\n"

"\\n"

"\\\n"

1746

(@
    (match nil
        (nil)         ""
        (cons name _) name))

(,
    run
        [(, (@ 1) 1)
        (, (@ "hello") "hello")
        (, (@ "\"") "\"")
        (, (@ "\n") "\n")
        (, (@ "\\n") "\\n")
        (, (@ "\\\n") "\\\n")
        (, (@ "\\\"") "\\\"")
        (, (@ "\\'") "\\'")
        (, (@ (+ 2 3)) 5)
        (,
        (@
            (match (nil)
                (nil)         "any"
                (cons name _) name))
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

(@ (+ 2 3))

(@@ 1)

(eval
    (** compile => compile_stmt => prelude => ({type:'fns',compile: a => _ => compile(a), compile_stmt: a => _ => compile_stmt(a), prelude}) **)
        compile
        compile-st
        prelude)