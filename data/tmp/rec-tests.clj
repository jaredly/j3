(** ## Enums examples **)

'hello

('some 12)

(if true
    ('some 12)
        'none)

(defn or-12 [x]
    (match x
        'none     12
        ('some y) y))

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

(defn extend-with-pos [record] {x 1 y 2 ..record})

(deftype (option a)
    (none)
        (some a))

(defn map [f v]
    (match v
        'nil        'nil
        ('cons x r) ('cons (f x) (map f r))))

(map (fn [x] (+ x 1)) ('cons 1 'nil))

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
            (none)       (none)
            (some right) (some (map-bin f right)))))

123

(fn [x] "${x.a}")

(fn [x] "${x.a} ${x.b}")

(match {x 2}
    {x x ..a} x)

'hi

123

{..{x 2 y 3} x 2}

(defn x3 [m] {..m x 3})

(x3 {x 1 y "hi"})

('hi 10)

(fn [x] ('hi x))

(fn [{x x}] "${x}")



(fn [('hi x)] "${x}")

(fn [x]
    (if true
        x.a
            x.b))

(fn [x]
    (match x.a
        true x.b
        _    x.c))

(if true
    ('hi true)
        ('ho 12))

(fn [x]
    (match x
        ('hi x) x
        ))

(fn [{x ('hi a)}] (+ 2 a) )

(defn set-example [x] {..x y 2})

(defn extend-example [x] {y 2 ..x})

;(set-example {a 1})

;(set-example {a 1 y ""})

(set-example {a 1 y 0})

(extend-example {a 1})

(extend-example {a 1 y 0})

(extend-example {a 1 y ""})

(defn maybe-set [x check]
    (if check
        {..x y 2}
            x))

;(defn doesnt-work [x check]
    (if check
        {y 2 ..x}
            x))

(if true
    {x 1 y 10}
        {y 2 x 1})

.abc

(let [x {y 2}] x.y)

(fn [x] (+ x.a x.y))

(.y {y 2})

(deftype (, a b)
    (, a b))

('hi 1 2 3)

{a 1 b 2}

(.a {a 2})

(lol {a 3} true)

(let [{x y} {x 2}] y)

'Hi

('Hi 10)

(let [('Hi x) ('Hi 12)] x)

(defn lol [x b]
    (** So... first x gets the vbl 'a
        and then the second arm of the if block is (trow [(, "a" tint)] (some 'a))
        and so we're trying to unify 'a with (trow .. (some 'a))
        Which seems like it would be hard? The 'right' thing to do here would be to say that 'a must have all of the rows specified in the trow, in order for this to type correctly.
        So we should come up with some 'b and replace 'a with (trow .. (some 'b)). Would that work??? Seems like it might. **)
        (if b
        x
            {..x a 2}))

(lol {a 23} false)

