(show-pretty 10)

(defn one [x] (show-pretty x))

(defn map [f x]
    (match x
        []           []
        [one ..rest] [(f one) ..(map f rest)]))

(defn two [x y] (, (show y) (, (map show x) (show x))))

(** so, this should turn into (defn two [show-a x y] (, (map (tcls show show-a) x) ((tcls show (show-array show-a)) x)))
    right? tcls ... um lol it needs kind-level polymorphism? so we won't do that. we could ... do (.show show-a), if we had a record type.
    Or ... if there was a show_impl function of type (fn [(show-map a) a] string).
    So, for every class baz, with methods hi and bye, we produce hi!impl, bye!impl, and the type baz-map.
    Like, so I feel like it would be pretty nice if ... I could do the source transformation, and that ... would help me have confidence that my implementation was correct? Because I could do type checking on it afterwards? idk though it gets weird... maybe I'll pass on that actually.
    Just do the generation.
    Ok, due to the way polymorphism works, I think I can get away with frontloading all of the tcls-maps. So if there are multiple type class preds at play, I stick them all as a bunch of first arguments to the function.
    Honestly they don't have to be curried, either. two(show_a, x)(y) is fine.
    Soo these predicates. It looks like they're restricted to having a basic type ... well maybe not, it can be an applied type, but only if it's a type class. Like it could be something like (a b) E ord.  **)

(defn x [z] (< (, "" z)))

(defn nested-pred [x] (< (return "")))

(defn z [y] (let [m (< (return "")) n (return 1)] (, m n)))

(let [(, _ what) (z 1)]
    (match what
        (some a) a
        _        0))

(defn a1 [a b c] (, (> a b) ;(> c (, a b))))

(show 1)

(deftype (option a) (some a) (none))

(show (some ""))

(show [true])

(< true false)

(< (, "" ""))

