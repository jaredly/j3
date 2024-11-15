
# One Flat to Flatten them All

ok, I rewrite the whole splits thing
and iimmmm not sure whether it worked lol
I mean it did
but also
its kindof a lot.

- [x] do some basic tests
- [ ] ASSERT that some node IDs stay the same folks
- [x] ALSO let's be testing selections this whole time
  - [x] partway
  - [x] moreway
- [ ] found a selection bug to fix

soo



# Operations with a keyboard

High level things, we have:
- split
- join

this ... sure is requiring a lot of code.

I, wonder if there's a different representation
that would make this easier?
like /transform to some flattened thing/ /do the modificaiton/ /transform back/

hmmmmm yeah that might be what a body wants?

like.
`one |+two` which is
`spaced(id(one) smoosh(id(+) id(two)))`
would be
`id(one) space id(+) id(two)`

and `(|+abc def, 123)`
which is
`round(spaced(smoosh(id(+) id(abc)) id(def)) id(123))`
would be
`id(+) id(abc) space id(def) comma id(123)`
and then you could like, add a space or a comma or whatever anywhere
and then we parse it back up.

definitely feels simpler.

aahhh and the cool thin is the `space` and `comma` can hold the `loc`s of the spaced and smoosheds.


## Smoosh split

So this is a new thing I'm doing this round, want to make sure I get it right:

This replaces
- attribite.lists
- ;comments
- tags"for strings"
- ...spreads

And will also cover unary prefixes

### Places a cursor can be

- in an ID
- in a text span
- before/after text
- before/after/inside list(other)
- start/end/control list (special, less common)

Honestly I think the `list` control can apply just as well to a `text`, maybe I'll do that.

### Things I have tested

- [x] ab|c
- [x] |abc
- [x] abc|
- [x] .|abc
- [x] abc|.
- [x] |abc.
- [x] .abc|
- [x] abc|()
- [x] ()|abc
- [x] ..|.
- [x] aa|a // with non-punct input
- [x] | // empty string

#### List

- [x] |()
- [x] ()|
- [x] (|)
- [x] abc()|
- [x] |()abc
- [x] ()|()

### Things I need to test

#### Text

- [x] |"hello"
- [x] "hello"|


TODO TODO Lets be testing selection location pleeeease


## Spaced split

This is just binops n such. and like `if x then y fi` lol

// plain id
- [x] ab|c
- [x] abc|
- [x] |abc
// plain list
- [x] ()|
- [x] |()
- [x] (|)
- [x] |"abc"
- [x] "abc"|
// spaced (id id)
- [x] one two|
- [x] one |two
- [x] one tw|o
- [x] one |()
- [x] one ()|
// with blank after
- [x] one|  two

// NOW in a smooshed
- [x] +abc|
- [x] |+abc
- [x] +|abc
- [x] +a|bc
- [x] ()|abc
- [x] |()abc
// smooshed + spaced
- [x] one +two|
- [x] one |+two
- [x] one +|two (left and right biased)
- [x] one +t|wo

## SEP now to the sort

### ID in Round

- [ ] (abc|)
- [ ] (|abc)
- [ ] (ab|c)

### List(other) in Round

- [ ] (()|)
- [ ] (|())
- [ ] (|)

### ID in Space in Round

- [ ] (abc def|)
- [ ] (abc| def)
- [ ] (|abc def)
- [ ] (ab|c def)

### List(other) in Space in Round

- [ ] (abc |())
- [ ] (abc ()|)

### ID in Smoosh in Round

- [ ] (+abc|)
- [ ] (+|abc)
- [ ] (+ab|c)

### ID in Smoosh in Space in Round

- [ ] (|+abc def, 123)
- [ ] (+abc| def)
- [ ] (+|abc def)
- [ ] (+ab|c def)
