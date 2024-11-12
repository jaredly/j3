/*

So, we have a variety of 'atoms' that your cursor can be directly editing
- ID (one text)
- Text (multiple texts)
- Rich (multiple texts)

cannnn I collapse text and rich? honestly I think there's a useful distinction.(?)
wellll hm. Yeah, so rich can have individual configuration on each subitem.
WOULD it be weird to be able to convert a Text to a Rich by just like bolding a single word?
ya know maybe that's actually kinda cool?

So like.
waiiiit ok no, because doesn't newline mean something totally different?
eh I mean it doesn't have to, right?
ok but what about control characters?
like a literal \n?
Like: How to ... wait is there actually a problem?

Ok backing up a second: If I want to have some like <code> styled text in the middle
of some rich text, what do I do? I guess that would be a (style) thing.... which is fine? yeah.

And like, display will be different in a list(kind=plain) which is a rich text blockyness, than
outside of it.

Ya know what, let's go ahead and try that out folks.

And then there are collections
- list (round|square|angle|curly|smooshed|spaced|tag|richhhhhhh) w/ children (and maybe attributes)
- table (round|square|curly) w/ rows of children

Q:Q:Q: can I collapse `tagged` into `list`?
Would it be something like a list with an 'attrs' that is a 'table'?? and then list.kind would have to allow
a Node as the kind. Which would be interesting.
Oohh hrm ok so... we want to be able to ...splat items into a tag's attrs.
I guess that would just be name=..splat and value=<blank>, which is fine.

I mean that does feel more ... flexible, right?
yeah you know what, we're being all kinds of reckless, what's one more thing?


Very cool! So the basic is just:
- ID (one text) or Text (multiple, maybe styled, texts and nodes)

oh no.
what if we smoosh Text into list as well?
can I even imagine what Text with ... an 'attributes' node ... would look like? yeah honestly I can.
no but you know what, the thing about text is it is unreffable. I'm gonna put my foot down.

SO:

- ID (one text, maybe reffed)
- Text (multiple texts, maybe styled, maybe with embeds)
- List (multiple nodes, maybe with an attributes node)
- Table (rows of nodes)

*/

import { test, expect } from 'bun:test';

test('some lisps I think', () => {
    const input = '(1 2 [3 4] ...5)';
    expect(shape(input)).toEqual(
        'list[round](id(1) id(2) list[square](id(3) id(4)) list[smooshed](id(...) id(5)))',
    );
});

test('some js please', () => {
    const input = '+what(things, we + do, [here and, such])';
    expect(shape(input)).toEqual(
        'list[smooshed](id(+) id(what) list[round](id(things) list[spaced](id(we) id(+) id(do)) list[square](list[spaced](id(here) id(and)) id(such))))',
    );
});
