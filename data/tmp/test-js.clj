(let [x 1000]
    ((fn [a b (, c d)]
        (match a
            []           (, "" 2)
            [one ..rest] (, c 2)))
        [2 3]
            2
            (, "hi" 23)))

(def hi (+ 10))

(def ho hi)

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

(def its int-to-string)

(** ## Our AST
    Pretty normal stuff. One thing to note is that str isn't primitive, because all strings are template strings which support embeddings. **)

(deftype cst
    (cst/list (array cst) int)
        (cst/array (array cst) int)
        (cst/spread cst int)
        (cst/identifier string int)
        (cst/string string (array (,, cst string int)) int))

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
        (pcon string (array pat) int)
        (pstr string int)
        (pprim prim int))

(defn expr-to-string [expr]
    (match expr
        (evar n _)           n
        (elambda pats b _)   "(fn [${(join " " (map pats pat-to-string ))}] ${(expr-to-string b)})"
        (eapp a args _)      "(${(expr-to-string a)} ${(join " " (map args expr-to-string))})"
        (eprim (pint n _) _) (int-to-string n)
        (ematch t cases _)   "(match ${(expr-to-string t)} ${(join
                                 "\n"
                                     (map cases (fn [(, a b)] "${(pat-to-string a)} ${(expr-to-string b)}")))}"
        _                    "??"))

(defn pat-to-string [pat]
    (match pat
        (pany _)        "_"
        (pvar n _)      n
        (pcon c pats _) "(${c} ${(join " " (map pats pat-to-string))})"
        (pstr s _)      "\"${s}\""
        (pprim _ _)     "prim"))

(deftype type
    (tvar string int)
        (tapp type type int)
        (tcon string int))

(defn type= [one two]
    (match (, one two)
        (, (tvar a _) (tvar b _))     (= a b)
        (, (tapp a b _) (tapp c d _)) (if (type= a c)
                                          (type= b d)
                                              false)
        (, (tcon a _) (tcon b _))     (= a b)
        _                             false))

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

(defn type/set-loc [loc type]
    (match type
        (tvar name _) (tvar name loc)
        (tapp a b _)  (tapp (type/set-loc loc a) (type/set-loc loc b) loc)
        (tcon name _) (tcon name loc)))

(deftype stmt
    (sdeftype
        string
            int
            (array (, string int))
            (array (,,, string int (array type) int))
            int)
        (stypealias string int (array (, string int)) type int)
        (sdef string int expr int)
        (sexpr expr int))

(defn type-with-free [type free]
    (match type
        (tvar _ _)   type
        (tcon s l)   (if (set/has free s)
                         (tvar s l)
                             type)
        (tapp a b l) (tapp (type-with-free a free) (type-with-free b free) l)))

(** More debugging stuff **)

(deftype (trace-fmt a)
    (tcolor string)
        (tbold bool)
        (titalic bool)
        (tflash bool)
        (ttext string)
        (tval a)
        (tloc int)
        (tnamed string (trace-fmt a))
        (tfmted a string)
        (tfmt a (fn [a] string)))

(** ## to-string functions for debugging **)

(def letters ["a" "b" "c" "d" "e" "f" "g" "h" "i" "j" "k" "l" "m" "n" "o"])

(defn unwrap-fn [t]
    (match t
        (tapp (tapp (tcon "->" _) a _) b _) (let [(, args res) (unwrap-fn b)] (, [a ..args] res))
        _                                   (, [] t)))

(defn unwrap-app [t]
    (match t
        (tapp a b _) (let [(, target args) (unwrap-app a)] (, target [b ..args]))
        _            (, t [])))

(defn tts-list [args free locs]
    (foldl
        (, [] free)
            args
            (fn [(, args free) a]
            (let [(, arg free) (tts-inner a free locs)] (, [arg ..args] free)))))

(defn and-loc [locs l s]
    (if locs
        "${s}:${(if (= l -1)
            "🚨"
                (its l))}"
            s))

(defn tts-inner [t free locs]
    (match t
        (tvar s l)                           (let [(, fmap idx) free]
                                                 (match fmap
                                                     (some fmap) (match (map/get fmap s)
                                                                     (some s) (, (and-loc locs l s) free)
                                                                     none     (let [name (at letters idx "_too_many_vbls_")]
                                                                                  (, (and-loc locs l name) (, (some (map/set fmap s name)) (+ 1 idx)))))
                                                     _           (, (and-loc locs l s) free)))
        (tcon s l)                           (, (and-loc locs l s) free)
        (tapp (tapp (tcon "->" _) a la) b l) (let [
                                                 (, iargs r)   (unwrap-fn b)
                                                 args          [a ..iargs]
                                                 (, args free) (tts-list args free locs)
                                                 (, two free)  (tts-inner r free locs)]
                                                 (, (and-loc locs l "(fn [${(join " " (rev args []))}] ${two})") free))
        (tapp a b l)                         (let [
                                                 (, target args) (unwrap-app a)
                                                 args            [b ..args]
                                                 args            (rev args [])
                                                 (, args free)   (tts-list args free locs)
                                                 (, one free)    (tts-inner target free locs)]
                                                 (, (and-loc locs l "(${one} ${(join " " (rev args []))})") free))))

(defn type-to-string [t]
    (let [(, text _) (tts-inner t (, (some map/nil) 0) false)] text))

(,
    type-to-string
        [(, (@t (-> a (-> b c))) "(fn [a b] c)")
        (, (@t (-> a b)) "(fn [a] b)")
        (, (@t (cons a b)) "(cons a b)")])

(defn type-to-string-raw [t]
    (let [(, text _) (tts-inner t (, none 0) false)] text))

(type-to-string (@t (array a)))

(let [a 2 a (+ 1 a)] a)