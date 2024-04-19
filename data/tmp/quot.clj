(** ## For debugging the handling of quotes inside strings **)

10

200

(+ 1 2)

(. (@hash some-fn) ..)

"he\"llo"

"\""

"\""

"\\\""

"\\\""

"\\"

"\\\\"

(replace-all "" "")

(replace-all (replace-all "lol\nfo\"lks" "\n" "\\n") "\"" "\\\"")

(replace-all "\"" "\"" "\\\"")

"\""

(@ 10)

(@ (2 3 4))

"hello"

(@ "Hello")

(@ [1 2 3])

(deftype (array a) (nil) (cons a (array a)))

nil

[1 2 3]

one

two