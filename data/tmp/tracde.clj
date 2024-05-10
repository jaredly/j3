

(deftype (trace-fmt a)
    (tcolor string)
        (tbold bool)
        (titalic bool)
        (tflash bool)
        (ttext string)
        (tval a)
        (tfmted a string)
        (tfmt a (fn [a] string)))

(match (@ 100)
    (eprim (pint v l) _) (let [_ (trace l [(tcolor "red") (tfmted 1 "hi")]) a 2] l))