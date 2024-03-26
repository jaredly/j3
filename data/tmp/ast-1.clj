(deftype expr
    (eprim prim int)
        (estr first (array (,, expr string int)) int)
        (evar string int)
        (equot expr int)
        (equot/stmt stmt int)
        (equot/pat pat int)
        (equot/type type int)
        (equotquot cst int)
        (elambda string int expr int)
        (eapp expr expr int)
        (elet pat expr expr int)
        (ematch expr (array (, pat expr)) int))

(defn expr-to-string [expr]
    (match expr
        (evar n _)           n
        (elambda n _ b _)    "(fn [${n}] ${(expr-to-string b)})"
        (eapp a b _)         "(${(expr-to-string a)} ${(expr-to-string b)})"
        (eprim (pint n _) _) (int-to-string n)
        (ematch t cases _)   "(match ${
                                 (expr-to-string t)
                                 } ${
                                 (join
                                     "\n"
                                         (map cases (fn [(, a b)] "${(pat-to-string a)} ${(expr-to-string b)}")))
                                 }"
        _                    "??"))

(defn pat-to-string [pat]
    (match pat
        (pany _)        "_"
        (pvar n _)      n
        (pcon c pats _) "(${c} ${(join " " (map pats pat-to-string))})"
        (pstr s _)      "\"${s}\""
        (pprim _ _)     "prim"))

(deftype prim (pint int int) (pbool bool int))

(deftype pat
    (pany int)
        (pvar string int)
        (pcon string (array pat) int)
        (pstr string int)
        (pprim prim int))

(deftype type
    (tvar string int)
        (tapp type type int)
        (tcon string int))

(defn pat-loc [pat]
    (match pat
        (pany l)     l
        (pprim _ l)  l
        (pstr _ l)   l
        (pvar _ l)   l
        (pcon _ _ l) l))

(defn expr-loc [expr]
    (match expr
        (estr _ _ l)      l
        (eprim _ l)       l
        (evar _ l)        l
        (equotquot _ l)   l
        (equot _ l)       l
        (equot/stmt _ l)  l
        (equot/pat _ l)   l
        (equot/type _ l)  l
        (elambda _ _ _ l) l
        (elet _ _ _ l)    l
        (eapp _ _ l)      l
        (ematch _ _ l)    l))

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
        (sdef string int expr int)
        (sexpr expr int))

(defn type-with-free [type free]
    (match type
        (tvar _ _)   type
        (tcon s l)   (if (set/has free s)
                         (tvar s l)
                             type)
        (tapp a b l) (tapp (type-with-free a free) (type-with-free b free) l)))

(defn type-loc [type]
    (match type
        (tvar _ l)   l
        (tapp _ _ l) l
        (tcon _ l)   l))

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
            (let [(, a free) (tts-inner a free locs)] (, [a ..args] free)))))

(defn and-loc [locs l s]
    (if locs
        "${
            s
            }:${
            (if (= l -1)
                "🚨"
                    (its l))
            }"
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
                                                 (, args r)    (unwrap-fn b)
                                                 args          [a ..args]
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