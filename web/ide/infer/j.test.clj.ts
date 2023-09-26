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

(+ true 1)

; non-polymorphic fn args
(fn [id] ((fn [a b] a) (id 10) (id "hi")))

(if true 1 2)

(fn [x y] (if true x y))

(fn [x] (if true x 2))

(fn [x y] (if true x 2))

(let [id (fn [x] x)] (if true (id 2) (let [m (id "hi")] 10)))
`;
