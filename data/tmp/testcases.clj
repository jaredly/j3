(, (+ 2) [(, 1 3) (, 3 5)])

(, (+ 2) [])

(defn fib [n]
    (match (< n 2)
    (true) n
    (false) (+ n (fib (- n 1)))))

(fib 5)

(fib 2)

(fib 10)

(defn range' [n col]
    (match (< n 1)
    (true) col
    _ (range' (- n 1) [(- n 1) ..col])))

(defn range [n] (range' n []))

(, range [(, 0 []) (, 1 [0]) (, 5 [0 1 2 3 4])])

(defn map [arr f]
    (match arr
    [] []
    (cons a b) [(f a) ..(map b f)]))

(, (fn [arr] (map arr (+ 2))) [(, [] []) (, [1] [3]) (, [4 5 6 10] [6 7 8 12])])



(map [1 2 3] (+ 2))