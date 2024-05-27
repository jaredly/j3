(,
    (fn [x] x)
        [(, 1 1)
        (, "string" "string")
        (, (int-to-string 10) "10")
        (, 20 20)
        (, (let [x 1] x) 1)
        (, (let [x- 1] x-) 1)])

(def x- 1)

(defn hi [a] (+ a x-))

(deftype (, a b) (, a b))

(deftype (list a) (nil) (cons a (list a)))

,

(map/merge (map/from-list [(, 1 2)]) (map/from-list [(, 1 3)]))

(hi 20)

(deftype (option a) (some a) (none))

(defn id [x] x)

(string-to-float "1.2")

(** ## Builtins **)

(,
    id
        [(, (+ 1 2) 3)
        (, (- 4 1) 3)
        (, (< 4 2) false)
        (, (< 2 4) true)
        (, (<= 3 3) true)
        (, (>= 3 3) true)
        (, (= 4 4) true)
        (, (!= 4 4) false)
        (, (> pi 3) true)
        (, (< pi 4) true)
        (, (replace-all "abama" "a" ".") ".b.m.")
        (, (eval "1 + 2") 3)
        (, (valueToString (some 3)) "(some 3)")
        (, (unescapeString "\\n") "\n")
        (, (sanitize "a,b-c") "a$cob_c")
        (, (equal (some 2) (some 2)) true)
        (, (equal (some 2) (some 3)) false)
        (, (int-to-string 23) "23")
        (, (string-to-int "23") (some 23))
        (, (string-to-int "23a") (none))
        (, (string-to-int "23.1") (none))
        (, (string-to-int "23.0") (none))
        (, (jsonify (some 2)) "{\"0\":2,\"type\":\"some\"}")])

(** Maps **)

(def mfl map/from-list)

(def mn map/nil)

(defn mapo [k v] (map/set map/nil k v))

(,
    (fn [x] x)
        [(, (map/get mn "hi") none)
        (, (map/get (mapo "hi" 2) "hi") (some 2))
        (, (map/merge (mfl [(, 1 2)]) (mfl [(, 1 3)])) (mfl [(, 1 2)]))
        (, (map/values (mfl [(, 1 2) (, 3 4)])) [2 4])
        (, (map/keys (mfl [(, 1 2) (, 3 4)])) [1 3])
        (, (map/to-list (mfl [(, 1 2) (, 3 4)])) [(, 1 2) (, 3 4)])])

(** Sets **)

(,
    id
        [(, set/nil set/nil)
        (, (set/has (set/add set/nil 23) 23) true)
        (, (set/has set/nil 23) false)
        (, (set/rm (set/add set/nil 23) 23) set/nil)
        (,
        (set/diff (set/from-list [2 3 4 5]) (set/from-list [3 4]))
            (set/from-list [2 5]))
        (,
        (set/overlap (set/from-list [2 3 4 5]) (set/from-list [3 4 6 7]))
            (set/from-list [3 4]))
        (, (set/to-list (set/from-list [2 4 9 2])) [2 4 9])])

100