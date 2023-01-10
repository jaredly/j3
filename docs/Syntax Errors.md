
So, kinds of errors

Malformed terms

```clj
(defn)
(defn hello folks)
(def)
; (def what) -> can autofill ()

(fn [(: just-a-type)])
```

So these a like "there's definitely something missing here".
I can make assumptions about how things should look, but ...
maybe best to not?

so in that case, I think we go ahead and "bail".
Like, "abort analysis".
Which operationally means we hang onto the analysis we've done
previously

So we're going around, and we collect:
- errors
- types
is that it?
if the "type" would be an "error", then we report that in "errors" I think.

So I might not have use for `unresolved:reason`. Because unresolved just literally means an identifier that couldn't be resolved.
