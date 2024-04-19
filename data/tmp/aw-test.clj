(deftype (array a) (cons a (array a)) (nil))

(defn snoc [a b] (cons b a))

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

[(, (foldl 0 [1 2] +) 3)
    (, (foldl nil [1 2 3] snoc) [3 2 1])
    (, (foldl nil [2 3 4 5] snoc) [5 4 3 2])
    (, "hi" "hi")]

(foldl nil [1 2 3] snoc)

1

;((subst-wrap
    (let-> [
        arg-types                (map-> pat-name pats)
        pts                      (map-> (t-pat tenv) pats)
        (, pat-types bindings)   (<-
                                     (foldr
                                         (, [] map/nil)
                                             pts
                                             (fn [(, ptypes bindings) (, pt bs)]
                                             (, [pt ..ptypes] (map/merge bindings bs)))))
        unified-subst            (foldl->
                                     map/nil
                                         (zip arg-types pat-types)
                                         (fn [subst (, argt patt)]
                                         (let-> [s2 (unify-inner argt patt l)]
                                             (<- (compose-subst "elam" s2 subst)))))
        bindings                 (<- (map/map (fn [(, t l)] (, (type-apply unified-subst t) l)) bindings))
        schemes                  (<- (map/map (fn [(, t l)] (, (scheme set/nil t) l)) bindings))
        bound-env                (<-
                                     (foldr
                                         (tenv-apply unified-subst tenv)
                                             (map/to-list schemes)
                                             (fn [tenv (, name (, scheme l))] (tenv/set-type tenv name (, scheme l)))))
        (, body-subst body-type) (t-expr-subst (tenv-apply unified-subst bound-env) body)
        body-type                (<- (type-apply unified-subst body-type))
        arg-types                (<- (map arg-types (type-apply unified-subst)))]
        (<-
            (,
                (compose-subst "pat-and-body" body-subst unified-subst)
                    (foldr body-type arg-types (fn [body arg] (tfn arg body l)))))))
    )