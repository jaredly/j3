"\""

"\n"

"\\n"

"\\\n"

"'"

"\\"

"\\"

"`"

(defn foldr [init items f]
    (match items
        []           init
        [one ..rest] (f (foldr init rest f) one)))

