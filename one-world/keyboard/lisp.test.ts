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
import { Toplevel } from '../shared/toplevels';
import { handleKey, lastChild, NodeSelection, selStart, Top } from './lisp';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { fromMap, Id } from '../shared/cnodes';
import { shape } from '../shared/shape';

/*

In lisp land, what are the fundamental operations?

/Initial Entering/

- typing into an ID (simple)
- splitting an ID with a space
    - in a smoosh
    - out of a smoosh
- splitting an ID with a punct (making/updating a smoosh)
- create/wrap with a list
- create/wrap with a table
- split cells of a table
- new table row

/Updating/Deleting/

*/

type TestState = { top: Top; sel: NodeSelection };

const initTop: Top = {
    nextLoc: 1,
    nodes: { [0]: { type: 'id', text: '', loc: 0 } },
    root: 0,
};
const init: TestState = {
    top: initTop,
    sel: {
        start: selStart(
            { root: { ids: [], top: '' }, children: [0] },
            { type: 'id', end: 0 },
        ),
    },
};

const run = (state: TestState, text: string) => {
    splitGraphemes(text).forEach((char) => {
        const update = handleKey(state.sel, state.top, char);
        if (update) {
            const prev = state.sel;
            state = {
                sel: update.selection ?? state.sel,
                top: {
                    nextLoc: update.nextLoc ?? state.top.nextLoc,
                    nodes: { ...state.top.nodes, ...update.nodes },
                    root: update.root ?? state.top.root,
                },
            };
            // This is "maybe commit text changes"
            if (
                prev.start.cursor.type === 'id' &&
                prev.start.cursor.text != null &&
                update.selection &&
                update.selection.start.key !== prev.start.key
            ) {
                const loc = lastChild(prev.start.path);
                state.top.nodes[loc] = {
                    ...(state.top.nodes[loc] as Id<number>),
                    text: prev.start.cursor.text.join(''),
                };
            }
        }
    });
    if (
        state.sel.start.cursor.type === 'id' &&
        state.sel.start.cursor.text != null
    ) {
        const loc = lastChild(state.sel.start.path);
        state.top.nodes[loc] = {
            ...(state.top.nodes[loc] as Id<number>),
            text: state.sel.start.cursor.text.join(''),
        };
    }
    return state;
};

test('some lisps I think', () => {
    const input = '(1 2 [3 4] ...5)';
    const state = run(init, input);
    const node = fromMap(state.top.root, state.top.nodes, (i) => [
        { id: '', idx: i },
    ]);
    expect(shape(node)).toEqual(
        '(id(1) id(2) [id(3) id(4)] list[smooshed](id(...) id(5)))',
    );
});

// test('some js please', () => {
//     const input = '+what(things, we + do, [here and, such])';
//     expect(shape(input)).toEqual(
//         'list[smooshed](id(+) id(what) list[round](id(things) list[spaced](id(we) id(+) id(do)) list[square](list[spaced](id(here) id(and)) id(such))))',
//     );
// });
