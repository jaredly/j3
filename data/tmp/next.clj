(** ## What's Next? **)

(** If you made it this far, congratulations! I hope this was helpful to you. If you have any suggestions, complains, or questions, feel free to reach out on [mastodon](https://mastodon.social/@jaredly) or [twitter](https://twitter.com/jaredforsyth).
    I plan on expanding this series to add the following features to our type system:
    - type classes
    - polymorphic row & variant types
    - algebraic effects
    I've produced an implementation of the paper [Typing Haskell in Haskell](https://web.cecs.pdx.edu/~mpj/thih/thih.pdf) in our language, but it's not annotated for general consumption; read at your own risk :) it's based on Algorithm W, and it'll be the thing I work off of to bring Type Classes into this language.
    - Implementation of Typing Haskell in Haskell
    I plan to do an implementation of some other algorithms as well, including HM(X) and OutsideIn(X). If y'all have any suggestions of other algorithms I should look into, let me know!
    I'm also interested in exploring other compilation targets, such as wasm, go, and glsl.
    
    I'll include here the moderately expanded versions of the parser, code generator, and type checker that are being used throughout this tutorial (which provide nicer error reporting, usage tracking, and hover-for-type), although they also aren't nearly as "clean" as the more simple versions I presented.
    - More Fancy Parser & Code Generator
    - More Fancy Type Inference
    
    And there's plenty to do around making the structured editor ready for general consumption :)
    
    Cheers **)