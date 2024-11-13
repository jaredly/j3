
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

### Things I need to test

#### List

- [ ] |()
- [ ] ()|
- [ ] abc()|
- [ ] |()abc
- [ ] ()|()

#### Text

- [ ] |"hello"
- [ ] "hello"|
