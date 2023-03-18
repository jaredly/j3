
# Rich Text

So at one point, I thought I would be bringing in some external
rich text editor wholesale. Like lexical/draft/etc.
And that might still be the best course of action.
But it does seem like there'd be some amount of weirdness with
managing selection, and copy/paste would work different inside vs outside,
and such.

So I'm considering having a `docBlock` node type, with `docText` and `docMacro` child blocks. `docMacro` would look like a `record` (rendered
with curlies), but would have a `kind` of `bold, italic, code, embed, link` etc.
Such that we could render a docBlock out as markdown if we wanted to.
        
        

        
    

(So, if I wanted to, I could just like type away, and what would even happen?)
(Like we have words, and it's just rendering differences that would make it)
(a.a Ok, but periods will be a problem. Right? lol. Ok, yeah maybe that won't work?)
(I would have to have different rules apply inside of these things. Which I mean)
(I totally could do, right? but how about collaborative editing? Might make things)
(easier there too? idk. )
(Ok, so can I use like {} as “this will be something formatted” markers?)
(Seems like I could. So, there would be metadata on the {} that would indicate)
(what kind of dealio it is. Which could also be “eval this” Right? Seems like it.)

