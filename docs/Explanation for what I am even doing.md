# What am I even doing

hah so, there's a variety of things going on in the project
- structured editor is a part of it (I guess I haven't really gotten around to writing out my "why structured editors" thoughts, but one game-changer is persistent addressability in the midst of changes. for an editor to be able to have a durable location for e.g. "the name of the function flatMap" that's not a line/col pair that will break at the slightest touch, unlocks a lot of nice things)
- jupyter/observable/etc. style super-REPL/literate programming environment for pure functional languages
- unison-style "terms are referenced by the hash of their contents, stored and synced in a database"
- a Development Environment for programming languages themselves, making it easy to iterate and play with various aspects of a programming language (compilation targets, execution semantics, type inference algorithms) in relative isolation, as well as enabling the bootstrapping of self-hosted languages

It used to be "I want to make a programming language that has All The Best Features" and while I was at it I figured I'd make a structured editor for it at the same time, because I've tried making a structured editor for existing languages and concluded that it would work much better if the language (& compiler) were designed with structured editing in mind.... and then I got a little distracted by wanting to make "a minimally-featured language that is capable of self-hosting its own type inference while being nice to use", and so it has morphed into being an Editor Environment that can be used to make a variety of programming languages :upside_down_face:

Thus far the editor has only allowed clojure-style syntax, but the past few days I've been wondering what it would take to open it up to c-style languages, and if I'm going to do that might as well come up with a General Unified Theory of Syntax.