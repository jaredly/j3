(** ## Let's build a compiler! **)

(** What's cool about this compiler?
    - self-hosted! the compiler will be written in itself.
    - full type inference! We'll start with basic Hindley Milner, and work our way up to type classes, polymorphic row types, and more!
    - pure + functional, with (eventually) algebraic effects!
    - structured editing! The editor for our language won't be "plain text in a file", but rather an editor that knows about the structure of the program. Our compiler will hook into this to provide lots of nice things, including hover-for-type, inline error reporting, refactoring, and more!
    In fact, we'll be building a series of compilers, gradually getting more feature-rich, and correspondingly more fun to use.
    cannot convert {"id":"94261d0c-1cea-4a0e-a452-808e082b9f28","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Our first compiler will be written in JavaScript, to allow us to \"bootstrap\" the self-hosting process. This compiler will be as simple as is reasonable while also giving us a language that's nice to use. This will consist of a parser (which will convert the \"concrete syntax tree\" of the structured editor into the \"Abstract Syntax Tree\" of our language) and a \"tree-walking interpreter\", which will traverse the AST and produce the resulting value. We'll also implement some basic static analysis, just enough to allow the editor or order our terms in dependency order.","styles":{}}],"children":[]}
    cannot convert {"id":"0ad80d0e-1284-4193-9b4b-6d58c809f8dc","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Next we'll use the language L1 to produce a code generator, which will take our AST and produce JavaScript. At this stage we'll still be using the ","styles":{}},{"type":"text","text":"parser","styles":{"italic":true}},{"type":"text","text":" from our bootstrapping stage, but we'll replace the tree-walking interpreter, allowing us to produce JavaScript that doesn't require a hand-written interpreter.","styles":{}}],"children":[]}
    cannot convert {"id":"cf132f00-e345-487f-b2ca-0f76026ddb2e","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"After that, we'll self-host the parser + static analysis, rewriting the bootstrap JavaScript implementation in our language L1.","styles":{}}],"children":[]}
    cannot convert {"id":"7afc5384-e540-4f8f-8f82-57b77191d290","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"With parsing and code-generation, are we done? No! Now we need a type checker! This is where it really gets fun, because other tutorials tend to stick to parsing + code generation, and if you want to do type inference you're stuck reading a ton of academic papers 😅. Well, I've done that reading for you, and we'll start with a lightly extended implementation of \"Algorithm W\" (adding in pattern matching and custom data types).","styles":{}}],"children":[]}
    cannot convert {"id":"91b090fd-fe50-42b8-b9a3-d40413285da9","type":"numberedListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Now that we have self-hosted type inference, let's make our language even nicer to use! We'll add in \"hover for type\", much nicer error reporting to the parser and type checker, as well as usage reporting (for \"find all references\" and highlighting unused variables).","styles":{}}],"children":[]}
    And that completes L1! Up to this point, everything we've written would be parseable & runnable by our original bootstrap implementation. Going forward, we'll have fancier language features like Type Classes and Algebraic Effects, which require information from the Type Inference step in order to produce the compiled output. 
     **)