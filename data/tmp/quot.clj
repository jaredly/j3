10

200

(+ 1 2)

"h\"llo"

"\""

"\\""

"\\\""

"\"

"\\\\"

(replace-all "" "")

(replace-all (replace-all "lol\nf\"lks" "\n" "\\n") "\"" "\\"")

(replace-all """ "\"" "\\"")

"\""

(@ 10)

(@ (2 3 4))

"hello"

(@ "Hello")

(@ [1 2 3])

(deftype (array a) (nil) (cons a (array a)))

nil

[1 2 3]

