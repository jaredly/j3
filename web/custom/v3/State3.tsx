// This is like ... a database? idk

import { Cursor } from '../../../src/state/getKeyUpdate';
import { UpdateMap } from '../../../src/types/mcst';
import { Map } from '../../../src/types/mcst';
import { MetaDataMap } from '../UIState';

type Selection = Cursor[];

type ToplevelChange = {
    map: UpdateMap;
    // if empty, then this toplevel doesn't retain selection after this change
    selection: Selection;
    // HOWW do I handle multi-toplevel selections?
    // not allowing you to sub-block, I think. Yeah.
};

type NamespaceAction =
    | {
          type: 'move';
          from: string;
          to: string;
      }
    | {
          type: 'update';
          name: string;
          // am I really going to hash on every single keystroke?
          // do I have another option?
          // like ... I do want to ...
          // ok no let's not do that. I have an undo stack on toplevels
          // for that.
          // this'll just be ...
          hash: string;
      };

/**
 * For the server, I think I probably want
 * ...
 * a websocket connection
 * and like
 * do the synchronizing. online only, ya know.
 * like, local-first is nice
 * but not for this prototype.
 *
 *

one/two/three

"Make a card, with a given namespace prefix"

Columns? Yes, probably

FOR UNDOs
What if, multi-toplevel undos were just, separated?
yeah that's probably fine.

ALSO: Collapsed toplevels don't get realized, or rendered,
and they're ignored for "undo" purposes as well ... (??) Maybe.



*/

type CardHistory =
    | {
          type: 'collapse';
          ns: string;
          expanded: boolean;
      }
    // General approach: I'm not going to do garbage collection
    // on removed namespaces, or cards, or columns.
    // it makes things simpler, I hope.
    | {
          type: 'ns:add' | 'ns:rm';
          parent: string;
          name: string;
          toplevel: number;
          idx: number;
      };

/*

AGH
wait
ok
so

we've got the denormalization issue
where
wewantthe
toplevel itself to determine what the "name" of a thing is...

ALSO
I had that idea, where ... if you're nested under something
that doesn't have an extractable `name`, then it just gets
flattened.
which makes sense to me.


*/

export type Datastore = {
    toplevels: {
        // unique id autoincrement
        [id: number]: {
            map: Map;
            meta: MetaDataMap;
            plugin?: string;
            root: number;
            history: Timed<ToplevelChange>[];
            children: number[]; // hm
        };
    };
    // Do... I .... care ...... about maintaining a history
    // of these namespace mappings?
    // namespaces: {
    //     [path: string]: {
    //         toplevel: number;
    //         children: string[];
    //     };
    // };

    // SO
    // compilation artifacts, can be cached by:
    // [id:history-length]? maybe? well that's only if
    // we're nailing down ... the references to other
    // values. Which we're definitely not.
    // I guess at some future moment we migh be like
    // "this toplevel, put it in amber" and give it a hash,
    // and then we reference it by this hash.
    // and then we have the whole "namespace + git branches" thing.
    // but today is not that day.
    //
    // Anyway, I'm imagining wanting to do something like "clone this whole
    // subtree" and then I'll mess with it.
    // And we'll need to make all the internal references work.
    // with ... the .... undo snapshots.

    // hmmm. or maybe not. Maybe I'll just say "if you do a clone,
    // the cloned thing makes no promises about relative whatsits"?

    // Ok, so
    // how do I think about evaluators?
    // Seems like the "EditorState" is where we specify the evaluator
    // but what do we specify *as the evaluator*?
    // `(evaluator parse-stmt parse-expr compile-stmt compile-expr)`
    // ??
    // like, sure?
    // so then that toplevel .... we want to save it as a .js file, right
    // when & how does that happen?
    // hmmm maybe it's like a pinned export? also defined in the EditorState?
    // I kinda like that.
    // so, we have a .... in all likelihood a "toplevel plugin",
    // or ... maybe it's a "produce plugin" (?)
    // I mean it does have to interact in an interesting way with ... some
    // other things
    // `(evaluator "some-name.js" parse-stmt parse-exprr compile-stmt compile-expr)`
    // So, to the runtime this just looks like a value.
    // but the plugin takes it and runs with it.

    // Ok I do think we're gonna want the `hash` node type to have a
    // `kind` on it, to distinguish between a `local` reference, and a
    // `global` (toplevel) one.
    // hmmm I mean I guess it might just be `{type: 'ref', loc: number, toplevel?: number}`
    // and toplevel is empty if it's for something local
};

export type EditorState = {
    evaluator?: number; // references a toplevel
    columns: { cards: number[] }[];
    cards: {
        [id: number]: {
            // path to a toplevel
            // NOTE: if the toplevel gets *MOVED*, we'll
            // need to let all editor sessions know.
            // and ... when restoring an editor, session,
            // we'll need to check .. to find the parentage
            // of all given toplevels.
            // which might be kindof a lot? urgh.
            // I want to avoid traversing everything.
            // but maybe JUST doing a "select id,children from toplevels"
            // will be cheap enough.
            path: number[];
            // ... is there anything else I need to think about?
            // hmmm

            toplevels: {
                [id: number]: {
                    expanded: boolean;
                    selection: Cursor[];
                };
            };
            history: Timed<CardHistory>[];
        };
    };
    focus: { card: number; toplevel: number }[];
    history: Timed<EditorHistory>[];
};

type Timed<T> = T & { ts: number };

type EditorHistory =
    | {
          type: 'column:add' | 'column:rm';
          id: number;
          idx: number;
      }
    | {
          type: 'card:add' | 'card:rm';
          column: number;
          id: number;
          idx: number;
      }
    | {
          type: 'column:move';
          id: number;
          from: number;
          to: number;
      }
    | {
          type: 'card:move';
          column: number;
          id: number;
          from: number;
          to: number;
      };

type Database = {
    namespaces: {
        [fullPath: string]: {
            toplevel: number; // an ID into the toplevel whatsit?
            children: string[]; // ordered list of children
        };
    };
    toplevels: {
        [id: number]: {
            map: Map;
            root: number;
            history: ToplevelChange[];
        };
    };
    namespaceHistory: NamespaceAction[];
};
