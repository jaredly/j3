(** ## Thunk Infrastructure **)

(, (<-log "ok") (<-wait 1000) (<-log "yall") (<-wait 1000))

(loop
    20
        (fn [c recur]
        (if (= c 0)
            []
                [(<-random/int 2 13) ..(recur (- c 1))])))

(** ## Guess a number **)

(defn guess-my-number [()]
    (let [num (<-random/int 0 10)]
        (loop
            1
                (fn [count recur]
                (let [guess (<-ask/int "Guess a number between 0 - 10")]
                    (if (= num guess)
                        "It took you ${(int-to-string count)} tries!"
                            (let [
                            () (<-log
                                   (if (< num guess)
                                       "too high"
                                           "too low"))]
                            (recur (+ 1 count)))))))))

(guess-my-number ())

(defn guess-your-number [()]
    (let [() (<-log "Think of number between 0 and 10")]
        (loop
            (, 1 0 10)
                (fn [(, tries low high) recur]
                (if (> low high)
                    "Your number cannot exist, as it must be lower than ${(int-to-string high)} but higher than ${(int-to-string low)}"
                        (if (= low high)
                        "You number must be ${(int-to-string low)}"
                            (let [half (/ (+ low high) 2)]
                            (match (<-ask/options
                                "Is it ${(int-to-string half)}?"
                                    ["Too high" "Too low" "That's it!"])
                                "Too high"   (recur (, (+ tries 1) low (- half 1)))
                                "Too low"    (recur (, (+ tries 1) (+ half 1) high))
                                "That's it!" "It took me ${(int-to-string tries)} tries."
                                x            "Unrecognized answer: ${x}"))))))))

(guess-your-number)



(defn ignore-log [f]
    (provide (f)
        (k <-log _) (ignore-log k)))

(defn test-options [opts f]
    (provide (f)
        (k <-ask/options t _) (let [
                                  () ()
                                  ;(<-log t)]
                                  (match opts
                                      []           (!fail "Ran out of options")
                                      [one ..rest] (test-options rest (fn (k one)))))))

(ignore-log
    (fn (test-options ["Too high" "Too high" "Too low"] guess-your-number)
        ))

(test-options ["Too high" "Too high" "Too low"] guess-your-number)



(@ (, <-one <-two))

(@ (<-one <-two))

(fn (<-one <-two))

(fn ((<-one) <-two))

(fn (, <-one <-two))

(fn (let [
    _ <-one
    _ <-two]
    12)
    )

(fn (let [_ <-one] <-two))

(fn (let [_ 1] (, <-one <-two)))

(fn (let [_ <-one] (let [_ <-two] 2)))

(fn (if <-one
    <-two
        <-three)
    )

(fn (<-one <-two))

(defn aaaaaa [()]
    (let [
        () (<-log "")
        _  (!fail "lol")
        () (<-more 234)]
        (match []
            []           (!fail "Ran out of options")
            [one ..rest] "as")))

(fn (let [
    () (<-one)
    () (<-two)]
    ())
    )











(** ## State Effect **)

(defn with-state [v f]
    (provide (f ())
        *value*     v
        (k <-set v) (with-state v k)))

(defn inc [()]
    (let [
        current *value*
        _       (<-set (+ current 1))]
        current))

(defn demo-state [()]
    (let [
        one (inc ())
        two (inc ())]
        (, one two)))

(fn [x]
    (let [
        x (<-set 10)
        _ (<-log "hi")]
        x))

(, (<-one) (<-twao))

(def xyz (fn [x] <-one))

(<-http/get "http://lol")

(, *one* *two*)

(defn collect [v f]
    (provide (f ())
        *dump*      v
        (k <-add i) (collect [i ..v] (fn [()] (k i)))))

(defn loop [val f] (f val (fn [val] (loop val f))))

(defn snd [(, _ x)] x)

(jsonify ('hi 12))

(defn rev [x]
    (loop
        (, x [])
            (fn [(, x col) recur]
            (match x
                []           col
                [one ..rest] (recur (, rest [one ..col]))))))

(defn log [f] (collect [] (fn [()] (let [x (f ())] (, x (rev *dump*))))))

(collect
    []
        (fn [()]
        (let [
            _ (<-add 1)
            _ (<-add 2)]
            *dump*)))

(collect [] (fn [()] (let [_ (+ (<-add 1) (<-add 2))] *dump*)))

(collect [] (fn [()] (let [_ (<-add (+ 1 (<-add 2)))] *dump*)))

(provide (+ *value* (<-set 12))
    *value*     12
    (k <-set v) (+
                    23
                        (provide (k 5)
                        *value*     20
                        (k <-set _) (fatal "once"))))

[(, (log (fn [()] (+ (<-add 1) (<-add 2)))) (, 3 [1 2]))
    (, (log (fn [()] (, (<-add 1) (<-add 2)))) (, (, 1 2) [1 2]))
    (, (log (fn [()] (<-add (+ 1 (<-add 5))))) (, 6 [5 6]))]

[(, (with-state 2 (fn [()] *value*)) 2)
    (, (with-state 2 (fn [()] (, (<-set 12) 2))) (, () 2))
    (, (with-state 2 (fn [()] (let [_ (<-set 12)] *value*))) 12)
    (, (with-state 2 demo-state) (, 2 3))]

[(,
    (provide *ok*
        *ok* 23)
        23)
    (,
    (provide (+ 1 (!fail 2))
        (!fail _) 0)
        0)
    (,
    (provide (+ 2 3)
        )
        5)
    (,
    (provide (+ 1 (<-stuff 2))
        (k <-stuff a) 23)
        23)
    (,
    (provide (+ 1 (<-stuff 2))
        (k <-stuff a) (provide (k 23)
                          (l <-stuff a) (fatal "only once")))
        24)
    (,
    (provide (+ *value* (<-set 12))
        *value*     12
        (k <-set v) (+
                        23
                            (provide (k 5)
                            *value*     20
                            (k <-set _) (fatal "once"))))
        17)]

(provide (+ 1 (<-stuff 2))
    (k <-stuff a) (provide (k 23)
                      (l <-stuff a) (fatal "only once")))

(** ## Enums examples **)

'hello

('some 12)

(jsonify ('some 2))

(if true
    ('some 12)
        'none)

(defn or-12 [x]
    (match x
        'none     12
        ('some y) y))

(fn [x]
    (match x
        ('hi x) x
        ))

(defn open-ended [x]
    (match x
        'red  0
        'blue 2
        _     3))

(** ## Records examples **)

{x 12}

{x 0 y 12}

(def get-x .x)

(defn add-pos [{x x y y} {x x2 y y2}] {x (+ x x2) y (+ y y2)})

(defn set-pos [record] {..record x 1 y 2})

(fn [x] "${x.a}")

(fn [x] "${x.a} ${x.b}")

(match {x 2}
    {x x ..a} x)

'hi

{..{x 12 y 3} x 2}

(fn [x]
    (if true
        x.a
            x.b))

(fn [x]
    (match x.a
        true x.b
        _    x.c))

(defn extend-with-pos [record] {x 1 y 2 ..record})

(** ## Simplification **)

(deftype (option a)
    (none)
        (some a))

(deftype (, a b)
    (, a b))

(** ## Working **)

(defn morpp [f x] ('hi (f x) (morpp f x)))

(** ## Not working **)

(defn morp [x]
    (if true
        'ho
            ('hi x (morp x))))

(morp 12)

((fn [x]
    (if true
        'ho
            ('hi x (morp x))))
    9)

(defn clorn [v]
    (match v
        'nil        'nil
        ('cons a b) ('cons a (clorn b))))

(clorn ('cons 12 'nil))

(defn clap [f v]
    (match v
        'nil        'nil
        ('cons a b) ('cons (f a) (clap f b))))

(clap (+ 2) 'nil)

(defn morp2 [f (, a b)]
    (if true
        (, (f a) none)
            (, (f a) (some (morp2 f b)))))

(morp2 (+ 1) (, 1 2))

(defn map-enum [f v]
    (match v
        'nil        'nil
        ('cons x r) ('cons (f x) (map-enum f r))))

(map-enum (+ 2) 'nil)

(defn map [f v]
    (match v
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(provide (map try-int ["12" "34"])
    (!fail _) [])

(provide (map-enum try-int ('cons "12" 'nil))
    (!fail _) 'nil)

(defn map-tree [f v]
    (match v
        'nil                       'nil
        ('node (, _ left) x right) ('node (map-tree f left) (f x) (map-tree f right))))

+

((+ 1) 23)

(+ 2 3)

(, 1 2)

(provide (map-enum (fn [x] (+ x *num*)) ('cons 1 'nil))
    *num* 23)

(defn map2 [f (, v rest)]
    (,
        (f v)
            (match rest
            (none)      (none)
            (some rest) (some (map2 f rest)))))

(defn map-bin [f (, left v right)]
    (,
        (match left
            (none)      (none)
            (some left) (some (map-bin f left)))
            (f v)
            (match right
            (none)             (none)
            (some (, x right)) (some (, x (map-bin f right))))))

(** ## Effects? **)

(defn x [a] (+ a 2))

+

(defn get-florbs [a] (+ a *extra-florbs*))

(defn construct-tractors [abc florbs]
    {tractors abc florbs (get-florbs florbs)})

(provide (construct-tractors "yes" 12)
    *extra-florbs* 40)

(** ## Composability **)

(defn needs-one [x] (+ x *one*))

(defn needs-two [x] (+ x *two*))

(defn give-one [f n]
    (provide (f ())
        *one* n))

(defn give-two [f n]
    (provide (f ())
        *two* n))

(give-one (fn [()] (needs-one 12)) 5)

(defn needs-both [()] (+ (needs-one 2) (needs-two 3)))

(give-one (fn [()] (give-two needs-both 12)) 10)

(+ 2)

(provide *lol*
    *lol* 12)

(provide (+ 2 *lol*)
    *lol* 34)

(provide (+ 2 3)
    (!fail n) 12)

(provide (!fail 2)
    (!fail n) n)

(defn id [m] m)

(provide (id (!fail 21))
    (!fail n) 3)

(deftype (list a)
    (nil)
        (cons a (list a)))

(defn fail-or [d f]
    (provide (f ())
        (!fail _) d))

(fail-or 'nil (fn [()] (map-enum try-int ('cons "a" 'nil))))

(fail-or none (fn [()] (some 10)))

(defn try-int [x]
    (match (string-to-int x)
        (none)   (!fail "Not an integer ${x}")
        (some x) x))

(provide (map try-int ["12" "30"])
    (!fail _) [])

(provide (map try-int ["12" "abc"])
    (!fail _) [])

(map-enum try-int ('cons "12" ('cons "30" 'nil)))

('cons "12" ('cons "30" 'nil))

(provide (try-int "12")
    (!fail _) 34)

(provide (try-int "a")
    (!fail _) 10)

(provide (match (string-to-int "a")
    (none)   (!fail "a")
    (some x) x)
    (!fail _) 23)

(provide (!fail 21)
    (!fail n) 3)