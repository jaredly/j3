(,
    (fn [x] x)
        [(, 1 1)
        (, "string" "string")
        (, (int-to-string 10) "10")
        (, 20 20)
        (, (let [x 1] x) 1)
        (, (let [x- 1] x-) 1)])

(def x- 1)

(defn hi [a] (+ a x-))

(hi 20)

(deftype (option a)
    (some a)
        (none))

(** Maps **)

(,
    (fn [x] x)
        [(, (map/get map/nil "hi") none)
        (, (map/get (map/set map/nil "hi" 2) "hi") (some 2))])