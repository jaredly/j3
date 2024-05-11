(** ## What's Next? **)

(** If you made it this far, congratulations! I hope this was helpful to you. If you have any suggestions, complains, or questions, feel free to reach out on [mastodon](https://mastodon.social/@jaredly) or [twitter](https://twitter.com/jaredforsyth).
    
    I've got working-but-not-as-well-explained documents for the "spruced up" compiler & type checker that is being used to evaluate all of the code we've seen so far. The parser has been extended with error recovery, the compiler has an Intermediate Representation of the JavaScript AST that it performs some optimization passes on, and the type checker has better error reporting, usage tracking, and hover-for-type support.
    - [More Fancy Parser & Code Generator](./parse-1-args)
    - [More Fancy Type Inference](/algw-fast)
    
    I plan on expanding this series to add the following features to our type system:
    - type classes
    - polymorphic row & variant types
    - algebraic effects
    I've produced an implementation of the paper [Typing Haskell in Haskell](https://web.cecs.pdx.edu/~mpj/thih/thih.pdf) in our language, but it's not annotated for general consumption; read at your own risk :) it's based on Algorithm W, and it'll be the thing I work off of to bring Type Classes into this language.
    - [Implementation of Typing Haskell in Haskell](./thih)
    I plan to do an implementation of some other algorithms as well, including HM(X) and OutsideIn(X). If y'all have any suggestions of other algorithms I should look into, let me know!
    I'm also interested in exploring other compilation targets, such as wasm, go, and glsl.
    
    And there's plenty to do around making the structured editor ready for general consumption :) The source for all of this lives in a [pretty messy github repository](https://github.com/jaredly/j3).
    
    Cheers 🎉 **)