(** ## Table of Contents
    ## Preamble
    ## [Introduction](/intro)
    Providing an overview of what we're building and some suggestions on how to use this tutorial
    ## [Structured Editor](/structured-editor)
    An intro to this structured editor environment that is the context for this tutorial, including a specification for the Concrete Syntax Tree (CST).
    ## Specifying our language
    ## [Syntax Cheatsheet](/syntax-cheatsheet)
    A brief tour by demonstration of the language that we'll be creating
    ## [Encoding](/encoding)
    Determining the representation we'll use for runtime values
    ## [Abstract Syntax Tree](/ast)
    Providing a detailed specification for the syntax of our language
    ## Bootstrap implementation
    ## [Boostrap compiler](/bootstrap)
    Developing a parser and tree-walking evaluator for our language
    ## [A Playground](/playground)
    Now that we've seen an implementation, here's a document for you to play around in, and use as a sandbox. Technically, all of these documents are editable :) but that one is especially so.
    ## Self-Hosted Implementation
    ## [Self-Hosted Code Generation](/self-1)
    The tree-walking evaluator is really slow, so we need to speed things up! The first thing we'll self-host is the code generation, translating our language into JavaScript.
    ## [Self-Hosted Parser](/parse-self)
    Next, we'll self-host the parser, which translates the CST into the AST, as well as the static analysis that the structured editor needs to produce a dependency graph of top-level terms.
    ## [Self-Hosted Type Inference](/algw-s2)
    This is where things get really interesting! We'll be implementing Algorithm W from Hindley Milner type inference, with a couple of extensions to allow us to type check our own language (the base algorithm doesn't support pattern matching or user-specified datatypes). We'll also be implementing Maranget's algorithm for exhaustiveness checking of our match forms.
    ## [Improving the Type Inference](/algw-s3)
    Our first implementation took some shortcuts to make things a little simpler; we'll fix those things now, including better error handling (without resorting to calling fatal) and reporting types for "hover for type".
    ## Postlude
    ## [What's Next?](/next)
    Describing future extensions to the language.
    ## [Let's Talk about Type Classes](/type-classes)
    A deep dive into what type classes are, and how to implement them.
    ## [Inferring Type Classes (under construction)](/algw-s4)
    In which we extend our type inference algorithm with the concept of "predicates", so we can infer type classes.
    ## [Codegen for Type Classes (under construction)](/self-tc)
    Type Classes are the first language feature that requires the code generation to use information from the type inference step; this is where we update the code generation. **)