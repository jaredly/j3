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

{..{x 2 y 3} x 2}

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

(defn map [f v]
    (match v
        'nil        'nil
        ('cons x r) ('cons (f x) (map f r))))

(defn map-tree [f v]
    (match v
        'nil                       'nil
        ('node (, _ left) x right) ('node (map-tree f left) (f x) (map-tree f right))))

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
            (none)             (none)
            (some (, x right)) (some (, x (map-bin f right))))))

(** ## Effects? **)

(defn x [a] (+ a 2))

+

(defn xa [a] (+ a *lol*))

(xa)

