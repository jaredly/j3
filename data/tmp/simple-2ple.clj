(fn [a b] 2)

12

(, 1 2 3 4)

((fn [a b] a) 1 3)

(+ 1 2)

((fn [a] (a 2 3)) +)

((fn [a b] (+ a b)) 1 2)

((fn [..b] (+ 2 ..b)) 2)

((fn [a] (a 2 5)) +)

(+ 2 2)