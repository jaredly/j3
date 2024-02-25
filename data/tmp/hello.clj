(def builtins
    "const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', '>': '$gt', '<': '$lt',\"\": '$qu', \"': '$dq', ',': '$co',};

const kwds = 'case var if return';
const rx = [];
kwds.split(' ').forEach((kwd) =>
    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),);
const sanitize = (raw) => {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    rx.forEach(([rx, res]) => {
        raw = raw.replaceAll(rx, res);
    });
    return raw;
};
const jsonify = (raw) => JSON.stringify(raw);

const unwrapArray = (v) => {
    if (!v) debugger
    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]
};
const fatal = (e) => {throw new Error(e)}
const nil = { type: 'nil' };
const cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });
const $pl$pl = (items) => unwrapArray(items).join('');
const $pl = (a) => (b) => a + b;
const _ = (a) => (b) => a - b;
const int_to_string = (a) => a + '';
const replace_all = (a) => (b) => (c) => {
    return a.replaceAll(b, c);
};
const $co = (a) => (b) => ({ type: ',', 0: a, 1: b });
const reduce = (init) => (items) => (f) => {
    return unwrapArray(items).reduce((a, b) => f(a)(b), init);
};
")

"\""

"""

"""

(deftype (array a) (nil) (cons a (array a)))

(deftype expr
    (eprim prim)
        (evar string)
        (elambda string expr)
        (eapp expr expr)
        (elet string expr expr)
        (ematch expr (array (, pat expr))))

(deftype prim (pstr string) (pint int) (pbool bool))

(deftype pat (pany) (pvar string) (pcon string (array string)))

(deftype type (tvar int) (tapp type type) (tcon string))

(deftype stmt
    (sdeftype string (array (, string (array type))))
        (sdef string expr)
        (sexpr expr))

(defn join [sep items]
    (match items
    [] ""
    [one ..rest] (match rest
        [] one
        _ (++ [one sep (join sep rest)]))))

(defn map [values f]
    (match values
    [] []
    [one ..rest] [(f one) ..(map rest f)]))

(defn mapi [i values f]
    (match values
    [] []
    [one ..rest] [(f i one) ..(mapi (+ 1 i) rest f)]))

(defn foldl [init items f]
    (match items
    [] init
    [one ..rest] (foldl (f init one) rest f)))

(defn foldr [init items f]
    (match items
    [] init
    [one ..rest] (f (foldr init rest f) one)))

(foldr 5 [1 2 3 4] ,)

(foldl 0 [1 2 3 4] ,)

(defn consr [a b] (cons b a))

(foldr nil [1 2 3 4] consr)

1111

["hello" "folks"]

(match ["hi"]
[] ""
[one ..rest] rest)

(join " " ["one" "two" "three"])

"\n"

"\\hello"

"\""

(defn literal-constr [name args]
    (++
        ["({type: \""
            name
            "\\""
            (++ (mapi 0 args (fn [i arg] (++ [", " (int-to-string i) ": " arg]))))
            "});"]))

(literal-constr "cons" ["0"])

(defn compile-st [stmt]
    (match stmt
    (sexpr expr) (compile expr)
    (sdef name body) (++ ["const " (sanitize name) " = " (compile body) ";\n"])
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

(defn snd [tuple]
    (let [(, _ v) tuple]
        v))

(defn fst [tuple]
    (let [(, v _) tuple]
        v))

(defn replaces [target repl]
    (match repl
    [] target
    [one ..rest] (match one
        (, find nw) (replaces (replace-all target find nw) rest))))

(replaces "\n" [(, "\\" "\\\\") (, "\n" "\\n")])

(defn escape-string [string]
    (replaces string [(, "\\" "\\\\") (, "\n" "\\n") (, "\"" "\\"")]))

(defn unescape-string [string]
    (replaces string [(, "\\"" "\"") (, "\\n" "\n") (, "\\\\" "\\")]))

(defn quot [expr]
    (match expr
    (eprim prim) (match prim
        (pstr string) (++ ["{type: "]))))

(defn compile [expr]
    (match expr
    (eprim prim) (match prim
        (pstr string) (++ ["\"" (escape-string (unescape-string string)) "\""])
        (pint int) (int-to-string int)
        (pbool bool) (if bool
                "true"
                    "false"))
    (evar name) (sanitize name)
    (equot inner) (jsonify inner)
    (elambda name body) (++ ["(" (sanitize name) ") => " (compile body)])
    (elet name init body) (++ ["((" (sanitize name) ") => " (compile body) ")(" (compile init) ")"])
    (eapp fn arg) (match fn
        (elambda name) (++ ["(" (compile fn) ")(" (compile arg) ")"])
        _ (++ [(compile fn) "(" (compile arg) ")"]))
    (ematch target cases) (++
            ["(($target) => "
                (foldr
                "fatal('ran out of cases: ' + JSON.stringify($target))"
                    cases
                    (fn [otherwise case]
                    (let [(, pat body) case]
                        (match pat
                        (pany) (++ ["true ? " (compile body) " : " otherwise])
                        (pvar name) (++ ["true ? ((" (sanitize name) ") => " (compile body) ")($target)"])
                        (pcon name args) (++
                                ["$target.type == \""
                                    name
                                    "\" ? "
                                    (snd
                                    (reduce
                                        (, 0 (compile body))
                                            args
                                            (fn [inner name]
                                            (let [(, i inner) inner]
                                                (,
                                                    (+ i 1)
                                                        (++
                                                        ["(("
                                                            (sanitize name)
                                                            ") => "
                                                            inner
                                                            ")($target["
                                                            (int-to-string i)
                                                            "])"]))))))
                                    " : "
                                    otherwise])))))
                ")("
                (compile target)
                ")"])))

(compile (@ 1))

(compile (@ "\""))

(compile (@ "lol"))

(compile (@ (+ 2 3)))