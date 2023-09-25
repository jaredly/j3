

## Literal
1 1u 1.0 1i
"hi" #x0cbc

(can I have a super-number type? like it seems like a way about it)

## Collection
(array v l)
(map k v)
{record}

## Union
'Ok ('Ok v)
['A 'B]
[- ['A 'B] 'A] => ['B]

## Generics
(tfn [x:t] t)
(a t)
([a b] t) => [(a t) (b t)]
({a b} t) => {a (b t)}

## Specials
(fn [a:t b:t] t)
(@loop @recur)

## Literal Math
(+ 1 uint)
(- 2 uint)


--------------------------------------

So, also I'm wondering about algorithm W.
Can I first ignore multiple dispatch?
and like assume everytihng is perfectly specified

ok yeah, let's just implement algorithm w
and then see how hard it us to add the other nicities that I want

does that sound like it would work? lol

-------------------------------------

I also, think I want to, actually get typescript generation working,
so I can have some interesting demos of the language features,
dontchaknow.

I mean it would be good to get more settled on language semantics and such.
Don't want to build too many things to have to rebuild them.

--------------------------------------

Ugh so thih handles int/float stuff with typeclasses, which makes sense.
I don't really want to rely on typeclasses. Right?
Because they would be global, environmental mumbojumbo that wouldn't be well...
represented... right?
right??
Like, rust's traits have this problem where globality is super weird, right?
and you can't have things stepping on each other, etc.

hmmm

Can I sidestep that with editor shenanigans?

So like ... typeclasses would solve the a + b thing, right?
Because `+` would have definition "takes two things that are plussable, and hang the consequences".
And then, we could like...

waittt now that + isn't infix anymore, is there anything stopping me from just
parameterizing it and such?

[idea]

so, when you're editing / creating, you want things to be loosey goosey, with lots of things
inferred. But then you "commit" it, and the ~AST is committed with everything locked down, obvs.
AND THEN if you go to edit it, you'll see a brand new CST that has everything locked down.
nice.
so like, + would have the ... typeclassrecord ... handed to it? maybe?

so, if you call a function that wants a typeclass
it gets the goods as an implicit argument, right?
so then we lock it down, somehow or something.
`(doit x)`
becomes something like
`(doit<int:SomePlussabilityForInt> x)`
yeah that's kinda cool tbh

`(type plussable<t> {hello (fn [t] string)})`
^ this seems fine, I should think

`(fn<x:plussable<x>> (x.hello x))`
^ this is not really fine. x having a typebound of plussable isn't really the deal.
^ could I do like `x:-plussable<x>`? or `~`?
ergh too many sigils I should think.

ergh gonna need some other syntax I believe. the type bound thing needs to be itself.

ok but if I'm going to have typeclasses, I need to support multiple


Anyway,
`(defn<t:sub> / [a:t b:t] (./ a b))`
it's like, the same kindof deal as tasks. we're just using normal language primitives.
with some sugar on top.

how about

`(fn<x (x has helloable<x>)> [y:x] (x.hello y))`
^ I mean, I don't actually hate it.
NOTE that it's `x.hello`, referencing the type variable.
so this kind of thing works too:
`(fn<x (x has helloable<x>)> [y:{a x}] (x.hello y.a))`

so putting `(m has n)` in the `<>` of a tfn gives us a way to typeclass. woopie.

AND how do we provide it?
especially if the deal has multiple whatsits.
ok so if there's multiple, the thing we're passing in is a tuple. That's fine.

`(doit<int:(, plusit helloint)> 10080)`

lol ok so am I getting myself into all kinds of trouble with typeclasses?
maybe I'll really try the thih and see how far I get.


KEY INSIGHT:
Writing code is different from reading code is different from maintaining code.

When writing, I want maximum inference.
When maintaining, I want minimum inference.
When reading, I want ... some thing else?

