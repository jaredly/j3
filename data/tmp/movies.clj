(deftype (list a)
    (cons a (list a))
        (nil))

(deftype (, a b)
    (, a b))

(deftype (option a)
    (some a)
        (none))

(defn map-err [f v]
    (match v
        ('Ok v)  ('Ok v)
        ('Err e) ('Err (f e))))

(defn loop [init f] (f init (fn [init] (loop init f))))

(defn mapi [f m]
    (loop
        (, 0 m)
            (fn [(, i m) recur]
            (match m
                []           []
                [one ..rest] [(f one i) ..(recur (, (+ i 1) rest))]))))

(defn require [v]
    (match v
        ('Ok v)  v
        ('Err e) (!fail e)))

(defn api-key [()]
    (require
        (map-err
            (fn [x]
                (match x
                    'Missing 'ApiKeyMissing
                    y        y))
                (<-env/get "API_KEY"))))

(defn split [x y]
    (eval
        "(x, e, d) => d((y, e, d) => d(y.split(x).reduceRight((a, b) => ({type: 'cons', 0: b, 1: a}), {type: 'nil'}), e), e)"
            x
            y))

(split "!" "12!3")

(defn write-output [movies]
    (require (<-fs/write-file "output.json" (jsonify movies))))

(defn parse-int [v]
    (match (string-to-int v)
        (some v) ('Ok v)
        _        ('Err ('NotAnInt v))))

(defn movie-from-line [line idx]
    (match (split "!" line)
        [title year starring] {
                                  title    title
                                  year     (require
                                               (map-err (fn [err] ('LineError idx line err)) (parse-int year)))
                                  starring (split "," starring)}
        _                     (!fail ('LineError idx line 'InvalidLine))))

(defn get-movies [url]
    (let [
        response (require (<-http/get url))
        lines    (split "\n" response)]
        (mapi movie-from-line lines)))

(defn task [()] (write-output (get-movies "the-url?key=${(api-key)}")))

(defn main [()]
    (provide (task)
         (!fail err)
        (match err
            'ApiKeyMissing (<-log "You need env API_KEY")
            ('NotAnInt v)  (<-log "Not an integer ${v}")
            _              (<-log "Some other error"))))