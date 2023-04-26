;; Based on https://gist.github.com/rtfeldman/120d0510c3a354dd9f9d3a3dda2f35b3

;;;; library code ;;;;

(deftype Result (tfn [ok err] [('Ok ok) ('Err err)]))

(deftype httpResult (Result string ['Timeout 'Offline ('Other string)]))

; our effect types
(deftype GetUrl ('http/get string httpResult))
(deftype Log ('Log string ()))
(deftype Env/get ('env/get string (Result string ['Missing ('OSError string)])))

; our effect instantiators
(defn log [text:string]:(@task Log ())
  (! 'Log text))
(defn get-url [url:string]:(@task GetUrl httpResult)
  (! ('http/get url (fn [x:httpResult] ('Return x)))))

; turn a Result into a Task
(def require (tfn [ok err]
  (fn [value:(Result ok err)]:(@task [('Failure err)] ok)
    (switch value
      ('Ok ok) ('Return ok)
      ('Err err) ('Failure err ())))))

(def mapErr (tfn [ok err err2] (fn [value:(Result ok err) map:(fn [err] err2)]
  (switch value
    ('Ok x) ('Ok x)
    ('Err err) ('Err (map err))))))

;;;; domain code ;;;;

(deftype Movie {title string year int starring (array string)})

(def api-get ('env/get "API_KEY" (fn [x:(Result string ['Missing ('OSError string)])] ('Return x))))

(defn get-api-key [] (switch (! api-get) ('Err 'Missing) ('Err 'ApiKeyMissing) x x))

(def fail (tfn [Err:[..]] (fn [err:Err] ('Failure err ()))))

(defn movieFromLine [line:string idx:int]
  (switch (split line "!")
    [title year starring]
      {title $
       year (!? require (-> year parseInt (mapErr (fn [err] ('LineError idx line err)))))
       starring (split starring ",")}
    _ (! fail ('LineError idx line 'InvalidLine))))

(defn getMovies [url:string]
  (let [response (!? 'GetUrl url)]
    (-> response
      trim
      (split "\n")
      (!? mapTask movieFromLine))))

(defn writeOutput [movies:(Array Movie)]
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
