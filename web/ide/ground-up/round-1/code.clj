
(deftype (, a b)
    (, a b)
)

(deftype (array a)
    (cons a (array a))
    (nil)
)

(def hello "what")
(def mo "\"")
(def at "a\"b")
(def end "ab\"")
(def nl "\n")
(def mid "hi\nby")

(def builtins "
const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', '>': '$gt', '<': '$lt', "'": '$qu', '\"': '$dq', ',': '$co', };

const kwds = 'case var if return';
const rx = [];
kwds.split(' ').forEach((kwd) =>
    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),
);

const sanitize = (raw) => {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    rx.forEach(([rx, res]) => {
        raw = raw.replaceAll(rx, res);
    });
    return raw;
};

const unwrapArray = (v) => v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])];
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
import { sanitize } from './builtins.ts';
const reduce = (init) => (items) => (f) => {
    return unwrapArray(items).reduce((a, b) => f(a)(b), init);
};
")

(deftype expr
    (eprim prim)
    (evar string)
    (elambda string expr)
    (eapp expr expr)
    (elet string expr expr)
    (ematch expr (array (, pat expr))))

(deftype prim
    (pstr string)
    (pint int)
    (pbool bool))

(deftype pat
    (pany)
    (pvar string)
    (pcon string (array string)))

(deftype type
    (tvar int)
    (tapp type type)
    (tcon string))

(deftype stmt
    (sdeftype string (array (, string (array type))))
    (sdef string expr)
    (sexpr expr))

; eh because it's annoying?
; also I'll need to do a bootstrap parser anyway



; ************** Let's try compilation ****************

; (defn eval [expr])
; hm can't be fully self-hosting atm b/c we're relying on some builtins

(defn compile-st [stmt]
    (match stmt
        (sexpr expr) (compile expr)
        (sdef name body)
            (++
            ["export const "
            (sanitize name)
            " = "
            (compile body)
            ";\n"])
        (sdeftype name cases)
            ; (map cases)
            (++ ["/* typedef " name " */"])
    )
)

; ok so cool story, I'm not actually *producing* any of the types,
; so I don't need data constructors to run the first version of the self-hoster
; which means my bootstrapper can be more scrappy

;; (defn sanitize [name]
;;     (reduce
;;         name
;;         [(, "-" "_DA_") (, "+" "_PL_") (, "-" "_MIN_") (, "=" "_EQ_") (, ">" "_GT_") (, "<" "_LT_")]
;;         (fn [res pair]
;;             (let [(, find repl)]
;;                 (replace find repl res)))))

(defn snd [tuple]
    (let [(, _ v) tuple] v))

(defn fst [tuple]
    (let [(, v _) tuple] v))

(defn compile [expr]
    (match expr
        (eprim prim)
            (match prim
                (pstr string) (++ ["\"" (replace-all string "\n" "\\n") "\""])
                (pint int) (int-to-string int)
                (pbool bool) (if bool "true" "false"))
        (evar name) (sanitize name)
        (elambda name body) (++ ["(" (sanitize name) ") => " (compile body)])
        (elet name init body) (++ ["((" (sanitize name) ") => " (compile body) ")(" (compile init) ")"])
        (eapp fn arg)
            (match fn
                (elambda name)
                    (++ ["(" (compile fn) ")(" (compile arg) ")"])
                _ (++ [(compile fn) "(" (compile arg) ")"])
            )
        (ematch target cases)
        (++
        ["(($target) => "
            (reduce
                "fatal('ran out of cases')"
                cases
                (fn [otherwise case]
                    (let [(, pat body) case]
                        (match pat
                            (pany) (++ ["true ? " (compile body) " : " otherwise])
                            (pvar name)
                                (++ ["true ? ((" (sanitize name) ") => " (compile body) ")($target)"])
                            (pcon name args)
                                (++
                                    ["$target.type == \""
                                    name
                                    "\" ? "
                                    (snd (reduce
                                        (, 0 (compile body))
                                        args
                                        (fn [inner name]
                                            (let [(, i inner) inner]
                                                (, (+ i 1) (++
                                                ["(("
                                                (sanitize name)
                                                ") => "
                                                inner
                                                ")($target["
                                                (int-to-string i)
                                                "])" ]))))))
                                    " : "
                                    otherwise]
                                )
                        )
                    )
                )
            )
            ")(" (compile target) ")"])
    )
)





(defn tfn [arg body]
    (tapp (tapp (tcon "->") arg) body))

(def empty-subst [])

; env is (, (map string scheme) (map string (, string (array type))))
; first is variables
; second is type constructors: {["elambda"]: ["expr", targs, [(tcon "string"), (tcon "expr")]]}
(defn var-set [env name value]
    (, (map-set (fst env) name value) (snd env)))

(defn var-get [env name]
    (map-get (fst env) name))

(defn tc-get [env name]
    (map-get (snd env) name))

(defn make-type [tname count]
    (let [loop (fn [type count]
                    (if (<= 0 count)
                        (, type [])
                        (let [var (newTV)
                              (, type vbls) (loop (tapp type var) (- count 1))
                              ]
                            (, type [var ..vbls])
                              )
                        ))]
        (loop (tcon tname) count)))

(defn make-the-subst [type-vars]
    (let [loop (fn [i vars]
          (match vars
            [] []
            [var ..vars] [(, i var) ..(loop (+ i 1) vars)]))]
        (loop 0 type-vars)))

(defn infer-pat [pat env t]
    (match pat
        (pany) (, empty-map [])
        (pvar name)
            (, (map-set empty-map name t) [])
        (pcon name args)
            (match (tc-get env name)
                (None) (fatal (++ ["Unknown type constructor " name]))
                (Some result)
                    (let [(, tname vbls raw-arg-types) result
                          (, the-type type-vars) (make-type tname vbls)
                          ; ok friends, so we need to make
                          ; arg-types align with these new type-vars
                          ; like, I think this is an instantiate dealio
                          ; ok so we make a "subst" out of the type-vars,
                          ; using the index in the array to indicate which
                          ; var-no they're mapping from.
                          tv-sub (make-the-subst type-vars)
                          fixed-arg-types (map (apply tv-sub) raw-arg-types)
                          subst (unify t the-type)
                          loop (fn [scope names types]
                            (match names
                                [] (match types
                                        [] scope
                                        _ (fatal "Too many types"))
                                [name ..names]
                                    (match types
                                        [] (fatal "Too many arg names")
                                        [type ..types]
                                            (loop (map-set scope name type) names types))))
                          scope (loop empty-map args fixed-arg-types)]
                        (, scope subst)))))

(defn infer [expr env]
    (match expr
        (prim prim)
            (let [name (match prim
                            (pstr _) "string"
                            (pint _) "int"
                            (pbool _) "bool")]
                (, (tcon name) []))
        (evar name)
            (match (var-get env name)
                (Some scheme) (, (instantiate scheme) [])
                (None) (fatal (++ ["Unbound identifier " name])))
        (elambda name body)
            (let [arg-var (newTV)
                  inner-env (var-set env name arg-var)
                  (, type subst) (infer body inner-env)
                  arg-type (apply-subst subst arg-var)]
                (, (tfn arg-type type) subst))
        (eapp fn arg)
            (let [return (newTV)
                  (, fn-type fn-subst) (infer fn env)
                  env1 (apply-env env fn-subst)
                  (, arg-type arg-subst) (infer arg env1)
                  fn-sub (apply-subst arg-subst fn-type)
                  fn-type (tfn arg-type return)
                  sub-3 (unify fn-sub fn-type)
                  sub (combine-sub fn-subst arg-subst sub-3)]
                (, (apply-subst sub-3 return) sub))
        (elet name init body)
            (let [init-res (infer init env)
                ;;   e2 (apply-env env (snd init-res))
                  e3 (var-set env name (fst init-res))
                  e4 (apply-env e3 (snd init-res))
                  (, body-type body-subst) (infer body e4)]
                (, body-type (combine-sub (snd init-res) body-subst)))
        ;; (earray exprs)
        ;;     (let [vbl (newTV)
        ;;           subst
        ;;             (reduce
        ;;                 empty-subst
        ;;                 exprs
        ;;                 (fn [res item]
        ;;                     (let [inner (infer item env)]
        ;;                         (combine-sub (combine-sub res (unify (fst inner) vbl)) (snd inner)))))]
        ;;         (, (tapp (tcon "array") vbl) subst))
        (ematch target cases)
            (let [(, target-type target-subst) (infer target env)
                  return (newTV)
                  env' (apply-env env target-subst)
                  ; TODO in here we can do case analysis to ensure
                  ; coverage
                  subst
                    (reduce
                        target-subst
                        cases
                        (fn [subst case]
                            (let [(, pat body) case
                                  (, pat-env pat-type) (infer-pat pat env)
                                  psubst (unify target-type pat-type)
                                  (, body-type body-subst) (infer body (apply-env psubst env'))
                                  rsubst (unify return body-type)]
                                (combine-sub (combine-sub psubst body-subst) rsubst))))]
                (, return subst))
    )
)

