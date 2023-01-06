(== 5 (+ 2 3))
(== 5 5)

(fn [v :int] (+ v 1))
(def hello 10)
(== hello 10)
(==
	(let [(, x y) (if (< 1 2) (, 2 3) (, 3 4))]
		(+ x y)
	)
	5
)
(`Hello 10)
(`What)
`Yea
(let [(`Ok x) (`Ok 20)] (+ x 23))