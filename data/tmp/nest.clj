(def a 10)

(def b (+ a 2))

(def c (+ a b))

(defn even [x]
    (if (= 0 x)
        true
            (odd (- x 1))))

(defn odd [x]
    (if (= 0 x)
        false
            (even (- x 1))))

1234

(, even [(, 2 true) (, 3 false) (, 17 false) (, 24 true)])