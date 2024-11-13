// let's test some operations

// Classes of keys

/// IDkeys
const allkeys =
    '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM~!@#$%^&*()_+{}|:"<>?`-=[]\\;\',./';

const lisp = {
    tight: '.=#@;+',
    space: '',
    sep: ' ',
};
const js = {
    tight: '~`!@#$%^&*_+-=\\./?:',
    space: ' ',
    sep: ';,\n',
};

// kinds of keys:
// - tight
// - space
// - sep
// - id (everything else)

const config = lisp;

const idkeys = [...allkeys].filter(
    (k) =>
        !config.tight.includes(k) &&
        !config.space.includes(k) &&
        !config.sep.includes(k),
);

/* Places that a cursor can be:

- ID
    - start
    - middle
    - end
- Text
    - index 0 start
    - index 1..n start
    - index n end
    - index 0..n-1 end
    - middle
- List (ignoring start/end and control, which are special)
    - before
    - inside
    - after

*/

/*

Kinds of transformations that we can be doing:

ID cursor
- edit the text of an ID (very simple)
- split(smooshed,spaced,outer) the current ID (encompasses adding to the front/back)

List cursor (outer)
- add an item before/after
- a bunch more stuff probably, but not just yet

- add an item to the left/right of the current id
    - smooshed
    - spaced
    - other


OK, I'm thinking I do need the ID to know whether it's punctuation or not.
ANDdd, are we thinking that punctuation should /never/ be a ref?
I mean I'm actually not 100% sure.
We can keep them the same for now, right?


*/
