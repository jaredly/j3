
# Algebraic Effects

Effects are a way to represent side-effects in a pure language. There is a split between the runtime (which is not pure, and can perform side-effects) and user-level code, which cannot.

SYNTAX:
`(! something)`
Will transform the whole (something) into ContinuationPassingStyle.
(something) is the nearest ancestor that's a `(begin)` or a `(fn)`.
If you don't want the `begin` to "capture" the CPS-ness, you can always
do `(! begin x y z)`, which will basically keep the thing going.
`(!? something)` match on the `Result`, turning `Err` into the `Failure` task.


Soooo task types don't ~currently declare their "error" conditions.
Should I?
Then 'Run would ... be ... more ... idk you could make a macro that tracks it, I mean.

So

```clj
(deftype http/get ('http/get string string ['Timeout 'Offline ('Other string)] string))
(@run http/get) -> NO ('http/get string (Result string [x y z]) [])
	('run [(@task [('http/get string string [])])])
	...
	...
	...
I'll need to write this all out tbh
But yeah, I think that's what I need.

UNLESS

Actually maybe this is better.

; (!? something)
expects the something's response to be a Result, and if it's an Error it spits out a ('Failure ) effect.
yeahhhhhh that seems much much cleaner.
; so
(!? sometask)
; is equivalent to
(switch (! sometask)
	('Ok v) v
	('Err err) (! 'Failure err ()))

	yes yes yes yes.

Ok what does this mean though
like
now we don't need run at all? Yes I think that's what it means.

```


```clj
;; Based on https://gist.github.com/rtfeldman/120d0510c3a354dd9f9d3a3dda2f35b3

;;;; library code ;;;;

(deftype Result (tfn [ok err] [('Ok ok) ('Err err)]))

(deftype httpResult (Result string ['Timeout 'Offline ('Other string)]))
(deftype GetUrl ('GetUrl string httpResult))

(deftype Log ('Log string ()))

;; (defn return (tfn [T] (fn [T] ('Return T))))
(defn log [text :string] (: @task Log ())
	(! 'Log text))
(defn get-url [url: string] (: @task GetUrl httpResult)
	(! 'GetUrl url))

(deftype Env/get ('Env/get string (Result string ['Missing ('OSError string)])))

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
	(switch (! 'Env/get "API_KEY")
		('Err 'Missing) ('Err 'ApiKeyMissing)
		$))

; potential gotcha:
; if you just do `(! 'Failure 10)`, it will be inferred
; as (@task [('Failure 10 ())] ()) instead of (@task [('Failure 10)] ())
; so if you want a non-returning task, you either need to break it
; into a separate function, or do
; (! 'Failure 10 ()) ?? Yeah I think that's reasonable.
; that's kinda nice maybe, because then you could also have a mapper right there.
; (! Read () (fn [value] ('Return "Read ${value}")))
; ok that's cool then.
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
	('WriteFile "output.json" (jsonify movies)))

(defn task []
	(let [apiKey (!? get-api-key)
			  movies (!? get-movies "the-url${apiKey}")]
		(!? writeOutput movies)))

(defn main []
	(switch (! task)
		'Ok (log "Success! Wrote to output.json")
		('Err 'ApiKeyMissing) (log "You need env API_KEY")
		('Err ('parseInt v)) (log "Not an integer: ${v}")
		('Err ('LineError idx line err)) (log "Error on line ${str idx}:\n${line}\n${debug err}")
		('Err 'Http) (log "Http error")
		('Err 'Disk) (log "Unable to write to disk")))

; like you could just do
(defn main []
	(print (!? 'Http/get "url")))
; and like there would be a warning that you haven't handled some errors.
; right?
; seems reasonable.
; because now "main" could 'Failure
; so when running a jerd app, you could pass a flag like run --dev, which would allow
; a toplevel 'Failure
; but otherwise it wouldn't.

(defn writeOutput [movies (: Array Movie)]
	(switch (! ('WriteFile "output.json" (fn [()] ())))
		('Ok text) $
		('Err ('Disk 'Full)) (! log "Disk is full! Ignoring lol")
	))

```
