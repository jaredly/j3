(def a 10)

(def b (+ a 2))

a

+

(def c (+ a b))

(defn even [x]
    (if (= 0 x)
        true
            (odd (- x 1))))

(defn odd [x]
    (if (= 0 x)
        false
            (even (- x 1))))

12341

(, 1 2)

"hello ${(int-to-string 321)}"

(deftype type (tcon string) (tprim int) (tvar string))

(tcon "hello")

(fn [v]
    (match v
        (tcon a) a
        _        "hello"))

12341

(, even [(, 2 true) (, 3 false) (, 17 false) (, 24 true)])