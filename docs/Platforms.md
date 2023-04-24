
# More Platnform Specifics

## GLSL Platform?

types.jd
```clj
(deftype vec2 {x float y float})
(deftype GLSLEnv {resolution vec2})
(deftype RunIt
  (@task [
    ('Simple (fun [coord:vec2] vec4))
   ())
)
```

orrrr
so what if
it's not a glsl platform
b/c glsl can't be a thing by itself.

it's ...
as web platform
javascript, ya know
and you give it like
a `termLink` to the fn
and the platform can unroll all of that
from the library
and recompile it into glsl?

because otherwise we're left doing the madness
that I had before, to
manually peel away the insides of the record
to get the initial state,
and the main render
and the backbuffer render

it should be like
```clj
('run-glsl {
  render (@quote drawToScreen)
  buffer (@quote drawToBuffer)
  stateT (@quote-t state)
  initial {v 10}
  step (fun [{v}:state] {v (+ v 1)})
})
```

OR
I could
make a builtin macro
that is `fn to glsl`?
and
hm
the macro, 
```clj
(@glsl drawToScreen)
```
it would have to get called with ... an `env`
that includes anything traversable from any hashes
passed to it.
right?
ok so the be explicit, maybe I want
```clj
(@glsl drawToScreen @env)
```
?
although that could get super tedious.
how about
```clj
(defn glsl [args:(array Expr) env:Env]
  ...)
```
?
that doesn't sound terrible.
it does mean you don't get validation .. on the macro use ..
.. although I guess maybe you do?
Alsooo I feel like macros could be super expensive (he he glsl)
and maybe re-running on every keystroke is going to like cause
massive issues?
hrmmmm maybe I'll just require that you manually re-trigger them,
and indicate somehow that a macro hasn't been triggered recently.




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

## Thinking about platforms providing types and terms

So I really like Roc's platforms.
Where there are different "hosts" that handle the effect-ful stuff.

Platforms can provide Effect handlers, of course.
But for my money, I also want them to be able to provide
custom builtin types, and builtin functions.

Platforms *should not* perform side-effects in the builtin functions.

So what are some builtin types, that'll be platform specific?

So for GLSL there's `texture` (`sampler2D` really) and an accompanying `texture/[]` function.

it's like ... specialty data structures, and their accessors / updators.
is that so bad?

soooooo looking back at jerd, it looks like `sampler2d` was a language-wide builtin, as was `texture/[]`. 
Anddd the other things that are "glsl-specific builtins" were actually implemented in jerd, with a little decorator to (indicate?) that I wanted them swapped out.

so ...

seems like it makes sense for a platform to have an associated library,
that provides types for the effects that are handled (including e.g. error types and stuff). And it can provide terms for handy functions or whatever.

So in that way, the GLSL platform can ... provide the jerd definitions for things that it will swap out during compilation.

ok, so that sounds fine.

Thinking about type inference, I wonder whether I should just try to implement normal type inference. lol. like with a little bit of jiggling to make multiple dispatch make sense?
because the inference I've got is doing some nastiness.

at the end of the day, will + and - work? b/c if not, we're in for trouble.

one way to do it is to have
```ts
int/+
float/+
uint/+
string/+
vec2/+
```
and do multi-dispatch that way.

another way would be to have
```ts
type plus = <T: number>(x: T, y: T): T
```
where number is a ~special type that can be int/float/uint.
however, I'd really like + to work for strings, vec2s, etc.

ugh ok, so I think it's just that my current infer is too aggressive.
For now, let's only update an annotation w/ the union of the current
annotation and the new one, if such a thing exists.
