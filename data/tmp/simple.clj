(deftype (array a) (cons a (array a)) (nil))

(** Recursive functions **)

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

foldr

(foldr 0 [1 2] +)

(defn what [f] (f (what f) 1))

what

(** Basic syntax **)

(match [1 2]
    []        1
    [a ..asd] 2)

[1 2]

"hello ${"folks"}"

[1 "hi"]

nil

(cons 2 nil)

(cons 1 (nil))

(defn lol [x] (+ x 2))

lol

(lol 2)

(@ [1 2])

(** Wrong Order **)

(def x y)

(def y 10)

(** Mutual Recursive **)

(defn even [x]
    (if (= 0 x)
        true
            (odd (- x 1))))

(defn odd [x]
    (if (= 1 x)
        true
            (even (- x 1))))