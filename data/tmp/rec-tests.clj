(** Thinking through what happens with records. **)

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
        _       10))

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

