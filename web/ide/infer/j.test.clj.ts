export default `
1
-> number

"hi"
-> string

(+ 1 2)
-> number

(+ 1)
x different arg numbers

(+ 1 (* 2 3))
-> number

(fn [x] (+ 2 x))
-> (fn [number] number)

; polymorphic let
(let [id (fn [x] x)]
    ((fn [a b] a) (id 2) (id "hi")))
-> number

(let [x 10] x)
-> number

(+ true 1)
x cannot unify number and bool

; non-polymorphic fn args
(fn [id] ((fn [a b] a) (id 10) (id "hi")))
x cannot unify number and string

(if true 1 2)
-> number

(fn [x y] (if true x y))
-> (fn [v2:1 v2:1] v2:1)

(fn [x] (if true x 2))
-> (fn [number] number)

(fn [x y] (if true x 2))
-> (fn [number v2:1] number)

(let [id (fn [x] x)]
    (if true
        (id 2)
        (let [m (id "hi")] 10)))
-> number

(let [x 1]
    (let [y x]
        10))
-> number
`;
