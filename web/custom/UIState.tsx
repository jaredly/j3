import { AutoCompleteReplace } from '../../src/to-ast/Ctx';
import { type ClipboardItem } from '../../src/state/clipboard';
import { State, Mods } from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { Def, DefType, Node } from '../../src/types/ast';
import { Ctx, HistoryItem } from '../../src/to-ast/library';

export type NUIState = {
    regs: RegMap;
    clipboard: ClipboardItem[][];
    hover: Path[];
    history: HistoryItem[];
    cards: Card[];
} & State;

/*

Ok, so we come to a certain question.
and the question is
how do I manage change.

When .. a thing is collapsed ...
does its being get subsumed?
does it get removed from the ... map?

I mean
it shouldn't be navigable
also

is it at that point ... that it gets .. published?
I don't think so? I think I want change management to be more explicit?
And like, you can queue up changes? idk

OK SO
current decision is: NO it does not get exised from the map. they live.
which means
namespaces might have members that are realized
and members that are not

SO
a "Card"
has a namespace
and a list of "tops"
and a list of hidden tops
butttt should the position of the tops be remembered? idk probably
like
ok yeah, position is persistent. but honestly maybe it hsould be persisted in the namespace?
although namespace listings ... really want to be alphabetical ... although, do they?
no! they don't need to. And in fact, we can and should do better.

Ok, so namespaces are not unordered whatsits.


OH WAITTT

So
....
things with children, do need names
but some children will be nameless.

and
indeeed
you would be correct
alsoo
sometimes
I might want to "name" my nameless things
and
but not make them like, a definition
just a name
it's fine
well but they'd probably be a definition too, why not
ok
so
we've determined that in fact, it ...
wait
I'm now having second, even third thoughts.

Ok, so, ... are we ... .... .. .... .. .....

so there are multiple kinds of things.

a "Card"
refers to a ... toplevel ... whatsit.
it should / needs / must //// be .... in a certain place & time
but ... I guess it doesn't actually necessarily have to exist in the library already.

anyway, a card has several children
in a couple of flavors

[the expression, no name] [exists in library? y/n]
[the thing that has children, must be named] [exists in library? y/n]
[the named thing with noe children] [exists in library? y/n]

So, I really am thinking
that libraryfied things are identified by their hash.
how else would we know that they ... exist?

yes. ok. so.
the SandboxNamespace may or may not have a `hash`, identifying it as existing
in the library.

*/

// This is the ... "ground truth" in the library
type Namespace = {
    top: string; // it's a hash, no doubt no doubt
    // Children, with just `string`s are just nodes, they don't have children,
    // and they don't have to be definitions, they could be expressions or definitions.
    // BUT if they's a `Namespace`, they must be a definition, thereby having a name,
    // which we can use to name ... space.
    //
    // so, well.
    // do I ... really need... all namespace nodes to be a thing?
    // can we not just organize for the sake of it?
    // are we going to have weird empty __init__.py files lying around?
    children: (Namespace | string)[];
};
// (scope lol)
// (defn) # (a header?)

export type Card = {
    path: string[];
    // So, it seems like, sometimes I'll want
    // to load up just the children of a namespace.
    // not the root of the namespace.
    // this is immediately relevant for ... the root namespace.
    ns: Extract<SandboxNamespace, { type: 'normal' }>;
};

export type SandboxNamespace =
    | {
          type: 'placeholder';
          hash: string;
          // just holding a place
          // don't need to know the children, b/c it doesn't really exist.
      }
    | {
          type: 'normal';
          hash?: string | null; // if hash, then this corresponds to something existing in the library.
          // the idx into the Map
          top: number;
          hidden?: boolean;

          children: SandboxNamespace[];
      };

export type UIState = { ctx: Ctx } & NUIState;

export type RegMap = {
    [key: number]: {
        main?: { node: HTMLSpanElement; path: Path[] } | null;
        start?: { node: HTMLSpanElement; path: Path[] } | null;
        end?: { node: HTMLSpanElement; path: Path[] } | null;
        inside?: { node: HTMLSpanElement; path: Path[] } | null;
        outside?: { node: HTMLSpanElement; path: Path[] } | null;
    };
};

export type Action =
    | { type: 'undo' }
    | { type: 'redo' }
    | { type: 'yank'; expr: DefType | Def; loc: number }
    // | { type: 'reset'; state: NUIState }
    | UpdatableAction;

/** Actions that can be turned into a StateChange | UIStatechange */
export type UpdatableAction =
    | { type: 'hover'; path: Path[] }
    | { type: 'select'; add?: boolean; at: { start: Path[]; end?: Path[] }[] }
    | { type: 'copy'; items: ClipboardItem[] }
    | { type: 'menu'; selection: number }
    | { type: 'menu-select'; path: Path[]; item: AutoCompleteReplace }
    // expr:def expr:deftype
    | { type: 'key'; key: string; mods: Mods }
    // | { type: 'collapse'; top: number }
    | { type: 'paste'; items: ClipboardItem[] }
    | DualAction;

export type DualAction = {
    type: 'namespace-rename';
    from: string[];
    to: string[];
};
