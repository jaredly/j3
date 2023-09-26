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
`;
