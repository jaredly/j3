
So what if I just try a lisp?
like
what would make some things much easier
and then I could focus on the things that are more interesting about the language?

and maybe later do more syntax? lol like famoous last words.

Ok, what would it look like with all of this syntax as ... well s-expressions?

```clojure
(defn hello [name :string age :int notypefolks]
	(Person {name name age age}) ; maybe can't do punning? which is less fun
	(Person {$ name age}) ; yay the puns
)
```

Ok, so critically, my (C)AST will be in lisp form.
some ... things will be resolved ...
... and some will not? idk.

So, hash addressing. Should I back off on it? I really don't want to though.
It's very interesting, and is like building version control in at the start.

Ok, toplevel terms are addressed by hash.

What are the ~types of my CAST?

```ts

type Node = {
	type: 'identifier', // likeThis
	text: string,
} | {
	type: 'tag', // `LikeThis
	text: string,
} | {
	type: 'number', // 12.32
	value: number,
} | {
	type: 'list', // eh this should be cons & nil, right?
	values: Node[],
} | {
	type: 'array',
	values: Node[],
} | {
	type: 'decorate',
	contents: Node,
	decorators: {[key: string]: Node}
} | {
	type: 'spread',
	contents: Node
} | {
	type: 'blank'
}

/* Relevant decorators
 * - type, for fn arguments, or fn return values. abbreviated :node
 * - default, for record type definitions, abbreviated =node, maybe
 * - term, for references to global terms
 * - sym, indicating symbol number
 * 
 * OK (, one two) is a tuple! () is the empty tuple, not the empty list, fwiw.
 * yeah, at the language level I never want to hear about linked-lists.
 */

/** How about keywords?
 * if, def, fn, switch (case?), ><, <>
 */

// aaand there's like special formatting rules. like the bindings of a let should be treated a certain way.
// I wonder if there's a way to make those rules be, like, rule-based. I mean a grammar I can use do define those pretty printing rules. kinda like css idk

// to start, we're going to do very dumb pretty printing. it'll be great.

// so, for like evaluating and stuff, it'd be cool to be able to do something like
/*

(switch node
	(`List [
		{body (`Id "let")}
		{body (`Vector bindings)}
		...rest
	])
)

*/

// that wouldn't really be the level of flexible I want though, because comments and such.
// and we want like useful syntax / form errors.

// I kinda think I need a query language?
// hmmm could it be done as a macro? I think that's probably what it would have to be,
// for it to be well-typed.

/*

(@match macro it up my pretties)

(@matcher
	[(`Id "let") (`Vector bindings) ...rest]
	(fn [{$ bindings rest}]
		// do something with it, yes.
		))

; so this produces ... idk

*/


```


