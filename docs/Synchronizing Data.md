
So, similar to the way I'm planning to have "migrateable data" be ~opt-in (where the default is to need to write the conversion yourself), what would it look like to have CRDTs supported at a language level?

like you could say
```
(deftype person (@sync {
	name string
	age int
}))
```
And that would expand to ... something ... that woud ... hmmm
would it make it so that your DATA has a color?
That would be kindof annoying?
hmm.

like, can't use sync'd and non-sync'd types together.
hmm.

coulddddd it be just an attribute of the runtime???
that would be quiteee interesting?

hmmmmmmm would you then ... just turn on sync for the whole dealio?
🤔
yeah tbh that might be the best.
🤔 well are there custom things we'd need to specify?

Hmmm yeah ok, so modifications have to happen in a special way, right?




