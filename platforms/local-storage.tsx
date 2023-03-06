// erm wait how am I representing these again?
// can I have polymorphic enum attributes?
// hrmmmm so the thing is,
// I can't have a function that returns both
// ('set number) and ('set string)
// it would have to be ('set-number number) and ('set-string string)
// OR ('set ('number number)) and ('set ('string string))
// it seems like
// it might be nice
// to have a way to say "wrap this thing ... with its type."
// such that a `number` would be ('number x)
// but it wouldn't just be a string, it would probalby be the hash.
// and then there'd be a function to *unwrap* that value.
// it's like boxing, but for types? So yeah, in the cases where you
// need it.
// Sure seems like that ought to be a thing, right?
// It's like an "any" type or something?
// maybe it's another type macro? and this one would have like
// varargs...
// (box string)
// (box string number) === [(box string) (box number)]
// and then when `match`ing on it, you'd probably want that
// same story, like
`
(match something
    ((box string) v) ; v is a string
    ((box number) n) ; n is a number
    )
`;
// hmm would it be worth having a `match-boxed`? perhaps.
// anddd would we have a special type that means "anything boxed"?
// like all-boxes ya know? I guess it could be just (box)? idk

const effects = `[
    ('local-storage/set {id string value any-box} ())
    ('local-storage/get string (result any-box 'NotFound))
]`;

// operationally, `(box string)` should produce a tag that
// is syntactically invalid in jerd, so you can't fake it
// like it should start with a `'` or something

// oh on a random note, I was thinking that instead of {type, payload}
// for encoding enums, I could have the type be keyed to the single-quote
// which would allow nice collapsing of records without worrying
// about clobbering the type field. because you can't have ' as an
// attr names.

// NOTE that boxing would require a function that could take
// a deep & resolved hash of things.
// SUCH THAT the box-hash of two types are equal ifff each
// matches the other.
// you'd definitely want to avoid a case where you can't
// retrieve something because the type you're using is
// unimportantly formatted or aliased differently than
// the one you used to store it.

// hah so turns out rust's Box & std::any do this too!
// so that's neat.

export {};
