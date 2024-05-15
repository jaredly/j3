(** ## A Playground
    for trying out the language. **)

(+ 1 2)

show

show/pretty

(defn both [x] (, (+! x x) (show x)))

(defn moth [x] (, (+! x x) (+! 1)))

(defn ad [x] (+! x))

(both 10)

(show 10)

(show/pretty (, 1 2))

(def name "Zinnia")

"Hello ${name}"

(defn fib [x]
    (if (< x 2)
        1
            (+ (fib (- x 1)) (fib (- x 2)))))

(fib 5)

(deftype (list a)
    (cons a (list a))
        (nil))

(defn map [f lst]
    (match lst
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(map fib [0 1 2 3 4 5 6 7 8])

(, fib [(, 1 1) (, 10 89) (,  )])