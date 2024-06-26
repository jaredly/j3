(defn task [()] (let [api-key ]))

(deftype (list a)
    (cons a (list a))
        (nil))

(deftype (option a)
    (some a)
        (none))

(defn map-err [f v]
    (match v
        ('Ok v)  ('Ok v)
        ('Err e) ('Err (f e))))

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
        (some v) v
        _        (!fail ('parseInt v))))

(defn movie-from-line [line idx]
    (match (split "!" line)
        [title year starring] {title title year (parse-int year)}
        ;({title title year (parse-int year) starring (split "," starring)})
        _                     (!fail ('LineError idx line 'InvalidLine))))

(defn main [()]
    (provide (task)
         (!fail err)
        (match err
            ('Err 'ApiKeyMissing) (<-log "You need env API_KEY")
            ('Err ('parseInt v))  (<-log "Not an integer ${v}"))))