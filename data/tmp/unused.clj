(def one 1)

one

(defn even [x]
    (if (< x 1)
        true
            (odd (- x 1))))

(defn odd [x]
    (if (< x 1)
        true
            (even x)))

(typealias (lol a) string)

(deftype (array a) (cons a (array a)) (nil))

[1]

[one one]

(deftype hwhat (x (lol int)))

(typealias mnm (array lol))

(fn [xn]
    (match xn
        (x _) 1))

