(deftype (array a)
    (cons a (array a))
        (nil))

(deftype (option a)
    (some a)
        (none))

(defn map-err [f res]
    (match res
        ('Ok v)  ('Ok v)
        ('Err e) ('Err (f e))))

(defn require [res]
    (match res
        ('Ok v)  v
        ('Err e) (!fail e)))

(defn read-args [()]
    (match <-argv
        [_ first second .._] {url first output-path second}
        _                    (!fail 'FailedToReadArgs)))

(defn read-env-var [name]
    (match (<-env/get name)
        ('Ok "")  none
        ('Ok vbl) (some vbl)
        _         none))

(def http/default-request {method "GET" url "http://example.com"})

(defn fetch-html [url]
    (match (<-http/send {..http/default-request url url})
        ('Err e)       (!fail 'FailedToFetchHtml)
        ('Ok response) (match (<-http/response-text response)
                           ('Err e)   (!fail 'FailedToFetchHtml)
                           ('Ok text) text)))

(defn list-cwd-content [()]
    (match (<-dir/list ".")
        ('Err err)  (!fail err)
        ('Ok items) items))

(defn handle-fail [f]
    (let [usage "HELLO=1 abc def -- 'http://example.com' example.html"]
        (provide (f)
            (!fail err) (let [
                            msg (match err
                                    'FailedToReadArgs         "Failed to read command line args"
                                    ('FailedToFetchHtml err)  "Failed to fetch URL ${(jsonify err)}"
                                    ('FailedToWriteFile path) "Failed to write to file ${path}"
                                    'FailedToListCwd          "Failed to list contents of current directory")]
                            (<-stderr/line "${msg}, usage: ${usage}")))))

(def main
    (fn (let [
        start-time                        <-utc/now
        hello-env-var                     (match (read-env-var "HELLO")
                                              (some msg) "was set to ${msg}"
                                              _          "was mpty")
        _                                 (<-stdout/line "HELLO env var ${hello-env-var}")
        (** Read command line arguments **)
        {url url output-path output-path} (read-args)
        _                                 (<-stdout/line "Fetching content from ${url}")
        str-html                          (fetch-html url)
        _                                 (<-stdout/line "Saving url HTML to ${output-path}")
        _                                 (map-err
                                              (fn [_] ('FailedToWriteFile output-path))
                                                  (<-file/write-utf8 output-path str-html))
        list                              (list-cwd-content)
        _                                 (<-stdout/line
                                              "Contents of current directory: ${(join "," list)}")
        end-time                          <-utc/now
        run-time                          (int-to-string (- start-time end-time))
        _                                 (<-stdout/line "Run time ${run-time} ms")
        _                                 (<-stdout/line "Done!")]
        )
        ))