(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(foldr 0 [1 2] +)

[1 2]

(@ [1 2])

(match [1 2]
    []        1
    [a ..asd] 2)