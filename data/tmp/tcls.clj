(show-pretty 10)

(defn one [x] (show-pretty x))

(defn map [f x]
    (match x
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(defn two [x y] (, (map (fn [_] "") x) (show-pretty x)))

(defn x [z] (> z z))

(defn a1 [a b c] (, (> a b) ;(> c (, a b))))

(show 1)

(deftype (option a) (some a) (none))

(show (some ""))

(show [true])

(< true false)

(< (, "" ""))

