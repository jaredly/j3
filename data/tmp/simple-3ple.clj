1

(, 2 3)

((fn [a b] a) (, 1 2))

((fn [a] "${a}") 1)

(fn [a b c] 2)

(fn [a] (fn [b] (a 2 3 b)))

((fn [a] "${a}") 1)

((fn [a] (fn [b] (a 2 3 b))) (fn [x y] "hello ${y}"))

(match []
    1 2)

(defn multi [a b c] "${a} ${b} ${c}")

(multi 1 2)

((multi "hello" ..) "a" "b")

(fn [a] (fn [b] 2))