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

(defn fib [x]
    (if (< x 1)
        true
            (fib (- x 1))))

cons