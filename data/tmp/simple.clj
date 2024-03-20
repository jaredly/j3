(deftype (array a) (cons a (array a)) (nil))

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

(defn what [f] (f (what f) 1))



what

(foldr 0 [1 2] +)

foldr

(match [1 2]
    []        1
    [a ..asd] 2)

[1 2]

nil

(cons 2 nil)

(cons 1 (nil))

(defn lol [x] (+ x 2))

(lol 2)

(@ [1 2])

(, lol [(, 2 4) (,  )])