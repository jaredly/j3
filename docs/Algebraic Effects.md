
# Algebraic Effects

Effects are a way to represent side-effects in a pure language. There is a split between user-level code, which us pure and cannot perform side-effects (such as interacting with the disk, or the network, or stdout) and the runtime, which does not have those restrictions.

Unlike unison, koka, and eff, where the Effects system is separate from the normal type system, Jerd's effects are first-class; effects are represented as values with continuation functions, and the syntax for performing effects in an imperative style is a straightforward sugar over normal values and lambda functions. As an example:

(note: these examples assume some familiarity with the [syntax](./Syntax.md) and [types](./Types.md))

```clj
(defn talk []
  (! 'log "Hello")
  (! 'log "world."))
```
is sugar for
```clj
(defn talk [] (: @task [('log string ())] ())
  ('log "Hello" (fn [_]
    ('log "world." (fn [_] ('Return ()))))))
```
The `@task` macro is also just sugar -- you could have written this instead:
```clj
(: (@loop [('Return ()) ('log string (fn [()] @recur))]))
```

Basically, `@task` takes `('tag input output)` and turns it into `('tag input (fn [output] @recur))`,
and `('tag input)` (which doesn't have a continuation), becomes `('tag input ())`. And the "return"
type of the computation is wrapped with the `'Return` tag.

For a more complex example:
```clj
(defn parseInt [text] (: @task [('Failure [('NotAnInt string)])] int)
  (switch (tryParseInt text)
    ('Some int) ('Return int (fn [x] x))
    'None ('Failure ('NotAnInt text) ())))

(defn parseBool [text] (: @task [('Failure [('NotABool string)])] bool)
  (switch text
    "true" ('Return true (fn [x] x))
    "false" ('Return false (fn [x] x))
    _ ('Failure ('NotABool text) ())))

(defn parse [text] (: @task [('is-available string (Result bool ['UnableToCheck]))
                             ('log string ())
                             ('Failure [('InvalidLine string)
                                        ('NameIsTaken string)
                                        ('NotAnInt string)
                                        ('NotABool string)])]
                      {name string age int local bool})
  (switch (split text ",")
    [name raw-age raw-local]
      (let [age (! parseInt raw-age)
            local (! parseBool raw-bool)]
        (if (!? 'is-available name)
          {name age local}
          (begin 
            (! 'log "Got a duplicate name")
            (! 'Failure ('NameIsTaken name)))))
    _ (! 'Failure ('InvalidLine string) ())))
```

Here, the `@task` macro expands to:
```clj
(@loop [('is-available string (fn [(Result bool ['UnableToCheck])] @recur))
        ('log string (fn [()] @recur))
        ('Failure [('InvalidLine string)
                  ('NameIsTaken string)
                  ('NotAnInt string)
                  ('NotABool string)] ())
        ('Return {name string age int local bool})])
```

Then we have `!` and `!?`.
`!` is the basic "throw", while `!?` unwraps results, turning the `'Err` side into `'Failure` effects.

This is what `parse` looks like, desugared. `and-then` is a builtin that takes a `(@task a-effects a-res)`
and a `(fn [a-res] (@task b-effects b-res))` and returns a `(@task [a-effects b-effects] b-res)`.

```clj
(defn parse [text] (: @task [('is-available string (Result bool ['UnableToCheck]))
                             ('log string ())
                             ('Failure [('InvalidLine string)
                                        ('NameIsTaken string)
                                        ('NotAnInt string)
                                        ('NotABool string)])]
                      {name string age int local bool})
  (switch (split text ",")
    [name raw-age raw-local]
      (and-then (parseInt raw-age)
        (fn [age]
          (and-then (parseBool raw-bool)
            (fn [bool]
              ('is-available name
                (fn [result]
                  (switch result
                    ('Ok value)
                      (if (!? 'is-available name)
                        ('Return {name age local})
                        ('log "Got a duplicate name"
                          (fn [_]
                            ('Failure ('NameIsTaken name) ()))))
                    ('Err err) ('Failure err ()))))))))

    _ ('Failure ('InvalidLine string) ())))
```

Because our effects are plainly represented as values and functions, you are saved the trouble of learning
a whole new execution model and semantics. You can look at the desugared form, and reason it out yourself.

Handling effects is also as simple as working with enums:
```clj
(defnrec ignore-logs [task (@task [('log string ()) ('Failure string)] int)] (: (@task [('Failure string)] int))
  (switch task
    ('log _ k) (ignore-logs (k ()))
    ('Failure message ()) ('Failure message)
    ('Return number) ('Return number)))
```

Now, dealing with effects generically, where you don't know all of the effects contained in a task, requires another
builtin, `with-handler`, which takes a task `(@task [handled-effects other-effects] res)` and a handler `(fn [(@task [handled-effects other-effects] res)] (@task other-effects res2))` and returns a `(@task other-effects res2)`.

```clj
(defnrec ignore-logs [task]
  (switch task
    ('log _ k) (with-handler ignore-logs (k ()))
    ('Return r) ('Return r)
    _ task))
```

## An extended example of programming with algebraic effects

```clj
;; Based on https://gist.github.com/rtfeldman/120d0510c3a354dd9f9d3a3dda2f35b3

;;;; library code ;;;;

(deftype Result (tfn [ok err] [('Ok ok) ('Err err)]))

(deftype httpResult (Result string ['Timeout 'Offline ('Other string)]))

; our effect types
(deftype GetUrl ('http/get string httpResult))
(deftype Log ('Log string ()))
(deftype Env/get ('env/get string (Result string ['Missing ('OSError string)])))

; our effect instantiators
(defn log [text :string] (: @task Log ())
  (! 'Log text))
(defn get-url [url: string] (: @task GetUrl httpResult)
  (! 'GetUrl url))

; turn a Result into a Task
(defn require (tfn [ok err]
  (fn [value (: Result ok err)] (: @task [('Failure err)] ok)
    (switch value
      ('Ok ok) ('Return ok)
      ('Err err) ('Failure err ())))))

(defn mapErr [value (: Result ok err) map (: fn [err] err2)]
  (switch value
    'Ok $
    ('Err err) ('Err (map err))))

;;;; domain code ;;;;

(deftype Movie {title string year int starring (array string)})

(defn get-api-key []
  (switch (! 'env/get "API_KEY")
    ('Err 'Missing) ('Err 'ApiKeyMissing)
    $))

(def fail (tfn [Err (: [...])] (fn [err] ('Failure err ()))))

(defn movieFromLine [line :string idx :int]
  (switch (split line "!")
    [title year starring]
      {title $
       year (!? require (-> year parseInt (mapErr (fn [err] ('LineError idx line err)))))
       starring (split starring ",")}
    _ (! fail ('LineError idx line 'InvalidLine))))

(defn getMovies [url :string]
  (let [response (!? 'GetUrl url)]
    (-> response
      trim
      (split "\n")
      (!? mapTask movieFromLine))))

(defn writeOutput [movies (: Array Movie)]
  ('fs/write-file "output.json" (jsonify movies)))

(defn task []
  (let [apiKey (!? get-api-key)
        movies (!? get-movies "the-url${apiKey}")]
    (!? writeOutput movies)))

(defn main []
  (switch (! task)
    'Ok (! log "Success! Wrote to output.json")
    ('Err 'ApiKeyMissing) (! log "You need env API_KEY")
    ('Err ('parseInt v)) (! log "Not an integer: ${v}")
    ('Err ('LineError idx line err)) (! log "Error on line ${str idx}:\n${line}\n${debug err}")
    ('Err 'http) (! log "Http error")
    ('Err 'fs) (! log "Unable to write to disk")))
```
