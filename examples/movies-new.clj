
; Sooo with the effects handling way, it would look like:

(defn require [v]
    (match v
        ('Ok v) v
        ('Err e) (!fail e)))

(defn map-err [f v] (match v
    ('Ok v) ('Ok v)
    ('Err e) ('Err (f e))))

; {
;   <-env/get (fn [string] ['Missing ('Found 'a) ('OSError 'b)])
;   !fail ['ApiKeyMissing ('OSError 'b)]
; }
(def api-key (-> (<-env/get "API_KEY")
    (map-err (match _ 'Missing 'ApiKeyMissing x x))
    require
))

(def api-key
    (require
        (map-err
            (match _
                'Missing 'ApiKeyMissing
                x x)
            (<-env/get "API_KEY"))))

; {<-fs/write-file (fn [string string] [('Ok 'a) ('Err 'e)])
;  !fail 'e}
(defn write-output [movies]
    (require (<-fs/write-file "output.json" (jsonify movies)))

; {'fail [('LineError int string ('NotAnInt string))]}
(defn movie-from-line [line idx]
    (match (split "!" line)
        [title year starring]
            {title title
             year (require (map-err (fn [err] ('LineError idx line err)) (string-to-int year)))
             starring (split "," starring)
             })
        _ (!fail ('LineError ix line 'InvalidLine)))

; {
;   <-http/get (fn [url] [('Ok string) ('Err 'e)])
;   !fail ['e ('LineError int string ('NotAnInt string))]
; }
(defn get-movies [url]
    (let [response (require (<-http/get url))]
        (-> response
            trim
            (split "\n")
            ; is there a way to make it so we don't ...
            ; give up after the first error? I guess we'd
            ; do something like `map-collecting-all-errors`
            ; which would provide an internal `!fail` handler.
            (mapi movie-from-line))))

(def task (write-output (get-movies "the-url?key=${api-key}")))

(defn main []
    (do (provide task
            (!fail 'ApiKeyMissing) (do (<-log "You need an API_KEY") 4)
            (!fail ('LineError idx _ _)) (do (<-log "Error on line ${idx}") 5))
        0)

; handle task ->
; adds things to the task handle map dealop