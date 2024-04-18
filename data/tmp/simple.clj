(deftype (array a) (cons a (array a)) (nil))

(defn hello [x] (+ 2 x))

(defn map [x f]
    (match x
        []           []
        [one ..rest] [(f one) ..(map rest f)]))

(map [1 2 3] (+ 2))

"Hello"

,

"Hello ${11111}"

(, 1 2 3 4)

(match (, 1 2 3)
    (, 2 _)   1
    (, a b c) c)

(@@
    (match 1a
        (, 1 2 3) 1))

nil

((fn [a] (aa "")) ,)

(def lol 10)

(+ 1 hi)

(def lolfn (+ 1 hi))

(defn xx [one] (+ 1 one))

(def hi 10)

( 23)

(def hi 1000)

(def hio (lolz 100 23 aa bb))

cons

(let [one 23] (xx one))

(** Things that should error **)

[1 "hi"]

((fn [(, a _)] (a 2)) (, 1 2))

((fn [(, a (, b ""))] (+ a b)) (, 1 (, 2 (, 3 2))))

((fn [(, a (, b ""))] 2) (, 1 (, 2 (, 3 2))))

(match (, 1 2)
    (, a (, b "")) 1)

(fn [(, a nm)] 1)

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

(match true
    false 1
    true  2)

[1 2]

"hello ${"folks"}"

nil

(cons 2 nil)

(cons 1 (nil))

(defn lolz [x] (let [y x] (+ x y)))

(lolz 2)

(@ [1 2])

(@@ [1 2])

(fn [(, a b)] 1)

(** Wrong Order **)

(def x y)

(def y 10)

(let [a x] 2)



(** Mutual Recursive **)

(defn even [x]
    (if (= 0 x)
        true
            (odd (- x 1))))

(defn odd [x]
    (if (= 1 x)
        true
            (even (- x 1))))

(** Big loop **)

(def l m)

(defn a [m] (+ (b 2) 2))

(defn b [a] (c a))

23

(defn c [a] (e a))

(defn e [b] (a 2))

a

(def m a)