
(def one {name "Jerd" age 2})

(def x (let [{name} one] name))

; is {name} just sugar for (map name)?
; I don't think so.
; {name} is sugar for {name $}, which is interpreted as punning.

(def ten 10)
(== x "Jerd")

; what would be the lispy way...
; oh maybe I do decorators here or something?
(type Four {name string age =(+ 4 ten) int})
; oh maybe it just expands to? yeah I like that.
(type Four {name string age @(default (+ 4 ten)) int})

(defn getAge [{age} :Four] age)
; expands to
(defn getAge [{age} @(type Four)] age)

(== (getAge one) 2)

(== (getAge {name "hello"}) 14)

(defn ageAnd [{age} :Four n :int] (+ age n))

(-> one (ageAnd 4))

; ([] one 3) ?
; ([3] one) ? "this is index access"
; calling a single-element list with something?
; ([2 3] one) ? this is range access? I mean why not, right?
; ok so ([2 3] one) -> actually desugars to ([] one 2 3)
; so that we can do 
(defn [] (<> T) [arg :(list T) index :int] (first arg))
; yeah that sounds rad.
