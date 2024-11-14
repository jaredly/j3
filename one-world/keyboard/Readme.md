
# Operations with a keyboard

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
- [x] abc()|
- [x] |()abc
- [x] ()|()

### Things I need to test

#### Text

- [x] |"hello"
- [x] "hello"|

## Spaced split

This is just binops n such. and like `if x then y fi` lol

// plain id
- [x] ab|c
- [x] abc|
- [x] |abc
// plain list
- [x] ()|
- [x] |()
- [ ] (|) ???
- [x] |"abc"
- [x] "abc"|
// spaced (id id)
- [ ] one tw|o
- [ ] one two|
- [ ] one |two
- [ ] one |()
- [ ] one ()|
// with blank after
- [ ] one|  two

// NOW in a smooshed
- [ ] +abc|
- [ ] |+abc
- [ ] +|abc
- [ ] +a|bc
// smooshed + spaced
- [ ] one +two|
- [ ] one |+two
- [ ] one +|two
- [ ] one +t|wo
