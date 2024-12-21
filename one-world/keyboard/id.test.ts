import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { root } from './root';
import { asTop, atPath, id, idc, js, listc, noText, round, selPath, smoosh, spaced, TestState, text } from './test-utils';
import { keyUpdate } from './ui/keyUpdate';
import { Cursor } from './utils';
import { validate } from './validate';

/*
KINDSW of multiselect behavior:
- replace everything with a single key
- wrap things (and like, split them apart first)
    - a(bc d)ef turns a spaced into a smooshed

OK BUT
like

(abc d<ef gh>u) is reasonable to expect

anddd

(abc d<ef ghu) ml>m

... what does that mean?
like, you could ... maybe delete it?

maybe the behavior is:

- Delete, collapse selection to ~start
- Insert at the start selection.

yeah that sounds fine.

I also want to support /Copy/ as an action.
And then there's like ... potentially a Wrap action.
-> what's the right call there?
Options include:
- Copy, Delete, Wrap, Paste
- Go to closest common ancestor, then do the wrap




BEHAVIORS OF AN ID KEY (insert)

- turn into a table :
- turn into an XML  /
- navigate
    - into/around xml
    - out of list
- btw ctrl-left should be "go to start of containing parent" and ctrl-right "go to end"
- insert into current ID
- insert some kind of flat
    - maybe a new smooth entry w/ a diff CCLS
    - maybe a sep
    - maybe a new string
    - maybe a space
    - maybe a lisp
- do a table split

yeah looks like that's it

Behaviors on DELETE

- collapse a smoosh
- "remove self"
- unwrap sometimes


CONFIGURATIONSSSS OF CURSORSSSS

kinds of nodes
- id
- text (text, embed, otherr) w/ index
- list (tag, rich, normal, space/smoosh)
- table (rich, normal)

kinds of cursorsss

- in an id (with ?grems[])
- in a text text (with ?grems[])
- on either side of a text embed/other
- before/start/inside/end/after (maybe with afterstart and beforeend... maybe)
    - of a nonrichtext
    - of a nonrich/space/smoosh list
    - of a table

so ...
... so
so ...
... so

before/start/inside/end/after could be 0/1/2/3/4, if I wanted it to be.
and then we would only need one kind of cursor. maybe?
no, `index` would still be a thing, for texts.

ALSO what aboutttt if we want to indicate whether we're doing 'excel-style' or 'flow-style' selection in a table?
that's gotta be a thing, right? only matters for multiselect though. maybe it's a property of `end`? yeah.

OK SO we have currently:
- id (at, ?text)
- text (at, index, ?text)
- control (index)
- list (before/start/inside/end/after)

collapsing `control` into `list` feels kinda dicey. So yeah, let's keep these distinct. I'd say it's worth it.
wellll ok maybe id and text can collapse?

Alright, anyway, I've decided that any of these things can be the side of a multiselect.

*/

test('id', () => {
    let state = asTop(round([id('', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, 'a', js));
    check(state, round([id('a', true)]), idc(1));
});

test('id move right', () => {
    let state = asTop(round([id('abc', true)]), idc(0));
    state = applyUpdate(state, keyUpdate(state, 'ArrowRight', {}));
    check(state, round([id('abc', true)]), idc(1));
});

test('id move left', () => {
    let state = asTop(round([id('abc', true)]), idc(1));
    state = applyUpdate(state, keyUpdate(state, 'ArrowLeft', {}));
    check(state, round([id('abc', true)]), idc(0));
});

test('id move shift left', () => {
    let state = asTop(round([id('abc', true)]), idc(1));
    state = applyUpdate(state, keyUpdate(state, 'ArrowLeft', { shift: true }));
    check(state, round([id('abc', true)]), idc(0), idc(1));
});

test('id shift sel type', () => {
    let state = asTop(round([id('abc', true)]), idc(1));
    state = applyUpdate(state, keyUpdate(state, 'ArrowLeft', { shift: true }));
    state = applyUpdate(state, keyUpdate(state, 'M', {}));
    check(state, round([id('Mbc', true)]), idc(1));
});

test('id shift sel del', () => {
    let state = asTop(round([id('abcd', true)]), idc(3));
    state = applyUpdate(state, keyUpdate(state, 'ArrowLeft', { shift: true }));
    state = applyUpdate(state, keyUpdate(state, 'ArrowLeft', { shift: true }));
    state = applyUpdate(state, keyUpdate(state, 'Backspace', {}));
    check(state, round([id('ad', true)]), idc(1));
});
