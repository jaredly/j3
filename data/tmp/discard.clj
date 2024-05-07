(** From parse-self **)

(** ## Measuring the "size" of things **)

(** The structured editor reports the "Size" of a document (analogous to "lines of code"). Here's how we calculate it. **)

(defn expr-size [expr] (fold-expr 0 expr (fn [v _] (+ 1 v))))

(defn fold-expr [init expr f]
    (let [v (f init expr)]
        (match expr
            (estr _ tpl _)         (foldl v tpl (fn [init (, expr _)] (fold-expr init expr f)))
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

(defn type-size [type] (fold-type 0 type (fn [v _] (+ 1 v))))

(defn fold-type [init type f]
    (let [v (f init type)]
        (match type
            (tapp target arg _) (fold-type (fold-type v target f) arg f)
            _                   v)))

(defn stmt-size [stmt]
    (+
        1
            (match stmt
            (sdef _ _ expr _)               (expr-size expr)
            (sexpr expr _)                  (expr-size expr)
            (stypealias _ _ _ type _)       (type-size type)
            (sdeftype _ _ _ constructors _) (foldl
                                                0
                                                    constructors
                                                    (fn [v (, _ _ args _)] (foldl v (map args type-size) +))))))