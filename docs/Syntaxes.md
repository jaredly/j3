

# Thinking about the layout engine, and what we'll need to accommodate.

There's a "splayed open" mode {
  contents
  contents
} that's relevant for Lists and Tables too tbh

anyway for this round I think I'll be ok ... leaning on web tech more? idk.

There's also "closed" mode

{ contents
  contents }

that's more ... lispy.

Then of course we can't forget JSX
for that matter, let's see if we can rustle some up.
hmmm buuut before we do that, we need reliable autocomplete. Because
the editor can't know where < looks like the start of JSX vs something else.
**ok so that'll come later**

So, here's a thing to grapple with.
The 'table' layout, feels so natural for pattern maching (e.g. switch)
buuut there's definitely something be to said for the indent display.

Does this just mean that tables need a `drop-last` format? Where the last column
is dropped & indented? sounds fine to me tbh.

You know what, let's try to make a little parser for gleam
its for fun




###

OK Folks, let's support Gleam-like syntax too! because it seems very cool.

Syntaxes to try and demo:
- [ ] JS/TS
- [ ] Gleam
- [ ] Clojure+ (jerd3)
- [ ] Elm? Roc?




# Syntax ... Families?

Thinking about adding support for c-like (e.g. JS) syntaxes,
gets me thinking about 'syntax families'

Overall questions:
- what are mutually exclusive syntax features?
  NOTE that I'm not actually quite talking about incompatability
  from a /parsing/ perspective ... although I kindof am?
  more from a /user input/ perspective, which is richer in
  a structured editor. although in a normal editor, user input
  is synonymous with strict parser grammar.


###

Thinking about "syntax families", and how to ~categorize them.

My broad thinking is that all syntax can be usefully flattened into "atoms" and "collections" (delimited & separated sequences of atoms and collectiosn), and then a language's syntax can be characterized by "what kinds of atoms are there" and "what kinds of collections are there".
The structured editor that I'm building then works at the level of those atoms and collections (the 'reader' phase, in lisp), providing in my opinion a sweet spot of "just enough structure to be powerful & useful with out being overly restrictive & annoying".

Here's how I would describe various syntaxes:

## Programming languages

Forth:
- one collection, the toplevel. delimiters are SOF and EOF, separator is \s+
- atoms are \S+

Lisp:
- atoms are ids [^()[]{}"]+ or "-delimited strings
- there's the toplevel collection (SOF - EOF), and lists, delimited by () [] or {}

JS:
- atoms are ids or "|'-delimited strings
- collections include:
  - [] and () are comma-separated (except for the for-loop (), which is ;-separated)
  - {}-record is a two-column table, with : between cells and , between rows
  - {}-block is ;-separated
  - \`-strings consist of a prefix + a two-column table, cells separated by } and rows by ${, col 1 has expressions and col 2 has string content
  - juxtapositions; this is an un-delimited concatenation of atoms and collections, and encompasses a variety of forms, including unary and binary expressions, postfix(fn, application) and keyword-based control forms (let x = 1, if (x) {y} else {z})

For the next several languages I'm mostly sticking to "differences to javascript":

Elm:
- [] is comma-sparated, () is whitespace-separated
- {} is a 2-column table, cells separated by = and rows by ,
- elm also has significant indentation and newlines at the top level

OCaml:
- 2-tiered juxtapositions, with ; separating the outer and inner tiers
- OCaml has significant newlines to separate toplevel forms

Python:
- blocks are indentation-delimited and separated by ; or \n

Ruby:
- blocks are keyword-delimited

## Markup langauges

XML:
- atoms are ids or "-delimited strings (within a tag)
- collections include:
  - <tag>-delimiited groups of tags and content
  - attributes are 2-column tables, cells separated by = and rows by whitespace

Markdown:
- collections:
  - headings, delimited by # and \n
  - styled text delimited by * _ [ ]
  - toplevel collection delimited by SOF and EOF
  - tables have rows separated by \n-+-+-\n, columns by |
- atoms are words, more or less

CSV
- one collection, cells separated by , and rows separated by \n
- atoms are [^,\n]+

## Even ... weirder?

NoFlo?

Question: is flow-based visual programming actually generally useful?
So to speak: can it be used as general-purpose, or is only useful in some domains?

a box with two inputs (subst) and (type)

inside that box would be more boxes.

[ a 'match' box that hrmmmm idk honestly ]








and a single output (output)



```clj
(defn type/apply [subst type]
    (match type
        (tvar id _)           (match (map/get subst id)
                                  (none)   type
                                  (some t) t)
        (tapp target arg loc) (tapp (type/apply subst target) (type/apply subst arg) loc)
        _                     type))

```





XState - state charts?

Spreadsheet programming?

Esolangs like Mondrian?

Prolog?
























- forth: /((\w+)\s+)+/
- lisp: atoms /[^()[]{}]+/ strings and lists
-


Thinking about "Syntax Families". Ones I've come up with:

- forth-like: just whitespace-separated tokens
- lisp-like: lists [{()}] and atoms, maybe "strings"
- c-like: collections have commas, blocks{} have ;, binops and unary ops, postfix(args)
  - ocaml is c-like but w/o postfix(args)
- python-like: c-like but significant indentation
- ruby-like: c-like but with keywords to bracket blocks
- xml-like: <tag attr="abc">child</tag>
- rich-text:



















## Basic Lisp

There's "very basic lisp" which is just () and id
marginally more is ([{}]) and id and "text".

## Lisp++

my lisp++ has
- id
- ([{}]) - space separated
- {|[|{||}|]|} - | and newline separated
- tag"text ${interpolate}"
- ...spread ;comment
- attr.ibu.te
- \rich-text-idk

Now, (rich text) is already bascially a different syntax family,
although I hadn't been thinking of it as such. though to be frank,
I haven't really tried to implement very much of it.

## Where does clojure live?

## Rich Text

- blocks (ul, ol, checks, radio, indent/quote, info/warn/error)
- line - list of attributedtext (link, header, style)
- embeds (assets, maybe tables, idk)

## c-like

- id
- unary & binops
- fn app w/ postfix tuple
- ([{}]) , or newline separated
- blocks that are ;-separated

ohrm there's also 'ruby/bash-like' where control blocks are word-delimited.
and there's 'python-like' with significant indents
and then there's whatever haskell is lol

## xml-like / jsx-like idk

- <tag attr={} attr={}>

## forth
literally just whitespace-separated tokens

## forth-like? or something?
where it's just a madhouse






