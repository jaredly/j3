(defn foldr [init items f]
    (match items
        []           (fatal "nope")
        [one ..rest] (f (foldr init rest f) one)))

(foldr 0 [1 2] +)

[1 2]

12

(@ [1 2])

(match [1 2]
    []        1
    [a ..asd] 2)

97

(defn lol [x] (+ x 2))

(, lol [(, 2 4)])