(** ## Basic errors **)

(1 "hello")

("hi" 10)

(** ## Basic types n stuff **)

23

(+ 2 3)

(+ 1.2 3.4)

(+ 2 1.2)

(let [x 1] x)

(+ 1 2)

"hi ${1}"

"lol ${"lol"}"

[1 2.6]

[]

(fn [x] x)

(let [x 10.2] (+ 2 x))

(** ## Type class stuff **)

(defn plus3 [x] (+ x 3))

(plus3 2)

(defn lol [a x] "Hi ${x}")

(lol true 10)

(def xyz (lol 10 "asd"))

(defn xyzz [a] 20)

(defn hi [x] "Hi ${(+ x 2)}")

(** ## A mildly complex function **)

(defn filter [f list]
    (match list
        []           []
        [one ..rest] (if (f one)
                         [one ..(filter f rest)]
                             (filter f rest))))

(deftype (array a) (cons a (array a)) (nil))

(deftype (bag a) (empty) (one a) (many (array a)))

"My bag ${empty} and ${(many [(one 2) empty])}"

(definstance
    (=> (pretty a) (pretty (array a)))
        {show-pretty (fn [items] "[${(join " " (map show-pretty items))}]")})

(definstance
    (=> (pretty (array a)) (pretty (bag a)))
        {show-pretty (fn [bag] (show-pretty (bag/to-list bag)))})

(deftype suit (hearts) (spades) (clubs) (diamonds))

(definstance
    (pretty suit)
        {
        show-pretty (fn [suit]
                        (match suit
                            (hearts)   "️❤️"
                            (spades)   "️♠️"
                            (clubs)    "️♣️"
                            (diamonds) "️♦️"))})

"${(hearts)}"

(many [1 2 3 4 5 7 8 9 0])

empty

(defn foldl [init items f]
    (match items
        []           init
        [one ..rest] (foldl (f init one) rest f)))

(defn bag/fold [f init bag]
    (match bag
        (empty)      init
        (one a)      (f init a)
        (many items) (foldl init items f)))