
## Enumerating syntactic forms

soooo thinking about comments.
Given that we have structure, wny not make different types of comments? For code review would be cool
- todo
- question
- review-comment
- suggestion? idk

BUT also, what about having them be attached to a specific node? That would make a lot of sense for code review.
And when we represent them in the data structure, they'll be attached to a specific node. So why not make that explicit?
SOOO how do we ~do it? Probably like cmd-m or something?
Anddddd how do we display it?
oh yeah like ... tooltip lookin things? How does traversal work? hmmm might need to be something special?

hmm maybe when you're in documenting mode, you can sqitch selection between the comments?
It's probably a normal mode thing.

OK so POSITIONS:
above, below, inside??



```clj
; EXPRESSIONS OR TYPES ;

;; atoms

; numbers
1 2
1.2 3.45
; do we want suffixable numbers? 1i 2f idk, wait on it
; oh wait, to do uint we'll need it
; unless we do '(uint 2)' or some nonsense lol
; I guess '(@uint 2)' would fit with the macro vibe
true false

; strings
"one${two}three" ; yay interpolation
; v so this might be annoying for the UI, so I'll skip it for now?
"one${two three}three" ; is the same as "one${(two three)}three"

;; collections

; tags!
'SomeTag ; same as ('SomeTag)
('SomeTag arg1 arg2)

; records
{1 23 two 34 (... otherRecord)} ; keys must be either an int literal or an id
; spreading is ... interesting. I do want it.
; ok, so we'll just have it be application. maybe fancier later
{} ; empty record === nil
{one $ two three} ; punning, same as {one one two three}
{$ one two three} ; all punned!
; yo i should italicize keys

; tuples (sugar for records)
(, "hi" 34) ; {0 "hi" 1 34}

() ; also nil! same as {} or (,)

; record access (type or expr)
(.one {one uint two string}) ; = uint

; function application or type application
(one 2 "three")


;;;;;;;;; EXPRESSIONS


; arrayssss
[1 2 3 23] ; gotta be homogeneous. type = (array int 4u)

; lambda definition
(fn [one :one-type two :two-type] :ret-type
  body)

(fn [one (: one two)] (: int) ok)
(fn [one (: (one two))] (: int) ok)


;;; Flow control


; loop/recur

(defrec hello [n :int]
  (if (> n 1) (@recur (- n 10)) (+ n 3)))
; is equivalent to
(def hello (@loop [n :int] ...))

;; ok so mutual recursion...

(def {$ isOdd isEven}
  (@loop {
    isOdd (fn [num] (if (== num 1) true (not ((.isEven @recur) (- num 1)))))
    isEven (fn [num] (if (== num 0) false (not ((.isOdd @recur) (- num 1)))))
  }))

; $ punning strikes again! "just get me the stuff thanks"
; I think I should restrict this super-pun to only things where the literal is defined right there.
(def $ (@loop {
    isOdd (fn [num] (if (== num 1) true (not ((.isEven @recur) (- num 1)))))
    isEven (fn [num] (if (== num 0) false (not ((.isOdd @recur) (- num 1)))))
}))

;;;; how do we do hash references of things like this ^^^^? theHash.isOdd?
;;;; and how detailed can we get? I guess not too detailed.
; so
; ok yeah, TERMS are stored without the suffix, and TERMTYPES are stored separately,
; because they might have a suffix.

; so this would be a more ~normal way to do it.
; but let's be honest, how often do you really need mutual recursion? like.
; ok actually a lot? right
(defrec
  isOdd (fn [num] (if (== num 1) true (not (isEven (- num 1)))))
  isEven (fn [num] (if (== num 0) false (not (isOdd (- num 1)))))
)
; and what do you do? you use a visitor pattern
(defn _isOdd [num isEven] (if (== num 1) true (not (isEven (- num 1)))))
(defn _isEven [num isOdd] (if (== num 0) false (not (isOdd (- num 1)))))
(defrec isOdd [num] (_isOdd num (fn [num] (_isEven num @recur))))

(defrec isEven [num] (if (== num 0) false (not (_isOdd (- num 1) @recur))))

; the fns-map approach. more annoying to type probably
(def fns {
  isOdd (fn [num fns] (if (== num 1) true (not ((.isEven fns) (- num 1)))))
  isEven (fn [num fns] (if (== num 0) true (not ((.isOdd fns) (- num 1)))))
})
(defn isOdd [num] ((.isOdd fns) num fns))
(defn isEven [num] ((.isEven fns) num fns))

; if

(if true yes no)

; switch

(defn legs [animal]
  (switch animal
    (| 'Cat 'Dog) 4
    'Human 2
    ('Table legs) legs
    'Spider 8))


;;; Tasks!!

(defn print [x :string]
	('Write x (fn [()] ('Return ()))))

(fn [()]
  (! print "Hello")
  (! print "Goodbye"))

; becomes

(fn [()]
  (andThen
    (print "Hello")
    (fn [()] (print "Goodbye"))))

; 'andThen' taks a (@task A X) and a (fn [X] (@task B Y)) and returns a (@task [A B] Y)


;;;;;;;;;;; TYPES


; enums
['One ('Two int)]
'One ; is the same as ['One]
('Two int) ; is the same as [('Two int)]
['One ['Two ('Three int)]] ; is the same as ['One 'Two ('Three int)]

; enum sub-access
(.one [('one int) 'Two]) ; same as [('one int)]

;; macros 

; number specifiers
(@uint 23)
(@float 12) ; why do this when you can do 12.0 idk

; task magic
(@task [
  ('Read () string)
  ('Write string ())
  'Message
] int)
; expands to
(@loop [
  ('Return int)
  ('Read () (fn [string] @recur))
  ('Write string (fn [()] @recur))
  ('Message () (fn [()] @recur))
])
; i mean tbh now that I have loop/recur
; that @task macro isn't even all that magic anymore.
; nice nice nice.


; recursion!

(deftype one 2)
; nope (deftype nat ['zero ('succ nat)])
(deftype nat (@loop ['zero ('succ @recur)]))

(deftype tree
  (tfn [T]
    (@loop [
      ('leaf T)
      ('node (array @recur))
    ])
  )
)
; so is this different, from
(deftype tree
  (@loop
    (tfn [T] [
      ('leaf T)
      ('node (array (@recur T)))
    ])))

; and tbh I kinda wonder if there's any important difference?
; like
; I think they should be evaluated as equivalent.
; but I might have to special-case it.


; (@loop [T] abc)
; could be nice sugar for
; (@loop (tfn [T] abc))
; ??
; dunno how often it'll happen

; OK SO how do we mutually recursive types
(deftype node
  (@loop [
    ('identifier {text string hash string})
    ('tag string)
    ('number string)
    ('record (array @recur))
    ('array (array @recur))
    ('list (array @recur))

    ('comment string)
    ('template-string string (array {expr @recur suffix string}))
  ])
)

; if we need multiple recursion for some reason we could do tags
; loop.1 -> recur.1 and loop.2 -> recur.2 etc.

; ok so non-enumish mutual recursion

(deftype AsAndBs
  (@loop [
    ('a string (array (.b @recur)))
    ('b int (array (.a @recur)))
  ]))

; a valid instantiation:
('a "1" [('b 1 []) ('b 2 [('a "2" [])])])

; another way to do it, that's probably more ergonomic for this use case
(deftype {$ a b}
  (@loop {
    a {name string children (array (.b @recur))}
    b {count int children (array (.a @recur))}
  }))

; And now a complex mutually recursive pair!
(deftype AST
  (@loop {
    Expr [
      (`Fn (array (.Type @recur)) (.Expr @recur))
      (`Apply (.Expr @recur) (array (.Expr @recur)))
      (`String string)
      (`Bool bool)
    ]
    Type [
      (`Builtin string)
      (`TypeApply (.Type @recur) (array (.Type @recur)))
      (`Record (array {
        key string
        value (.Type @recur)
        default [`None (`Some (.Expr @recur))]
      }))
    ]
  })
)


```




















## Thoughts

So what if I just try a lisp?
like
what would make some things much easier
and then I could focus on the things that are more interesting about the language?

and maybe later do more syntax? lol like famoous last words.

Ok, what would it look like with all of this syntax as ... well s-expressions?

```clojure
(defn hello [name :string age :int notypefolks]
  (Person {name name age age}) ; maybe can't do punning? which is less fun
  (Person {$ name age}) ; yay the puns
)
```

Ok, so critically, my (C)AST will be in lisp form.
some ... things will be resolved ...
... and some will not? idk.

So, hash addressing. Should I back off on it? I really don't want to though.
It's very interesting, and is like building version control in at the start.

Ok, toplevel terms are addressed by hash.

What are the ~types of my CAST?

```ts

type Node = {
  type: 'identifier', // likeThis
  text: string,
} | {
  type: 'tag', // 'LikeThis
  text: string,
} | {
  type: 'number', // 12.32
  value: number,
} | {
  type: 'list', // eh this should be cons & nil, right?
  values: Node[],
} | {
  type: 'array',
  values: Node[],
} | {
  type: 'decorate',
  contents: Node,
  decorators: {[key: string]: Node}
} | {
  type: 'spread',
  contents: Node
} | {
  type: 'blank'
}

/* Relevant decorators
 * - type, for fn arguments, or fn return values. abbreviated :node
 * - default, for record type definitions, abbreviated =node, maybe
 * - term, for references to global terms
 * - sym, indicating symbol number
 * 
 * OK (, one two) is a tuple! () is the empty tuple, not the empty list, fwiw.
 * yeah, at the language level I never want to hear about linked-lists.
 */

/** How about keywords?
 * if, def, fn, switch (case?), ><, <>
 */

// aaand there's like special formatting rules. like the bindings of a let should be treated a certain way.
// I wonder if there's a way to make those rules be, like, rule-based. I mean a grammar I can use do define those pretty printing rules. kinda like css idk

// to start, we're going to do very dumb pretty printing. it'll be great.

// so, for like evaluating and stuff, it'd be cool to be able to do something like
/*

(switch node
  ('List [
    {body ('Id "let")}
    {body ('Vector bindings)}
    ...rest
  ])
)

*/

// that wouldn't really be the level of flexible I want though, because comments and such.
// and we want like useful syntax / form errors.

// I kinda think I need a query language?
// hmmm could it be done as a macro? I think that's probably what it would have to be,
// for it to be well-typed.

/*

(@match macro it up my pretties)

(@matcher
  [('Id "let") ('Vector bindings) ...rest]
  (fn [{$ bindings rest}]
    // do something with it, yes.
    ))

; so this produces ... idk

*/


```


