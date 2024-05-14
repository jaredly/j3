100

(fn [x] 101)

(deftype (, a b)
    (, a b))

(defn xx [a b (, c d)]
    (match a
        (, a b) 2
        _       3))

(xx (, 1 2) 3 (, 4 5))

(deftype faces
    (red)
        (black))

red

(def x 101)

((fn [x] 10) 102)

(let [x 11] x)

(def unused 10)

(let [
    x 1
    y 2]
    x)

int-to-string

x

,,

(deftype (list a)
    (nil)
        (cons a (list a)))

(defn map [f lst]
    (match lst
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(map (+ 2) [1 2 3])