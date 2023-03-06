
# Thinking about platforms, in the IDE

## Data storage

- simplest, an untyped kv store
  ('kv/set {id string value any-box} ())
  ('kv/get string any-box)
- typed kv (add types via the UI)
  ('kv/todos/get id todo)

Platforms maybe can register for "splat"s?
like `kv/*/set` and `kv/*/get`?

## IO

- console, could handle
  ('log {level ['Error 'Info 'Warning 'Debug] payload any-box} ())
  ('display any-box ())
  ('readline () string)

## UI

; hmm maybe `uitask` needs to be recursive

```clj
(defn set [v] ('state/set v (fn [x] x)))
(def get [v] ('state/get v (fn [x] x)))

(begin
  (let! [count (get 0)]
    ('div [] [
      ('button [('onclick (fn [_] (set (- count 1))))] [('text "-")])
      ('text (toString count))
      ('button [('onclick (fn [_] (set (+ count 1))))] [('text "+")])])))
```

- (ui/run (task [] (ui thosetaskstoo)))
