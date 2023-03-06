// The UI stuffs

export const effects = `

(deftype attrs (tfn [Effects (: [...])] [
    ('onclick (fn [int] (task Effects ())))
    ('style string)
    ('className string)
    ('oninput (fn [int] (task Effects ())))
]))

(deftype ui (tfn [Effects] (@loop [
    ('button (array (attrs Effects))
        (array @recur))
    ('span (array (attrs Effects))
        (array @recur))
    ('div (array (attrs Effects))
        (array @recur))
    ('text string)])))

(deftype effects
    (tfn [T Extra (: [...])] (@loop [
        ('ui/state/set T ())
        ('ui/state/get T T)
        ; Should I have ... this ui/render
        ; just not have a return value?
        ; like, am I likely to "resume" after it?
        ; How will I relate to the event loop?
        ; How would it be to 
        ('ui/render (ui [@recur Extra]) ())
    ])))

`;
